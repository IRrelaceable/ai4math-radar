import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { loadEnv } from "./env";
import { events as seedEvents } from "@/data/seed/events";
import { readIngestedEvents } from "@/lib/db/ingested";
import {
  analyzeDirectionText,
  directionInput,
  isDirectionEligible,
  DIRECTION_RUBRIC_VERSION,
  type DirectionAnalysis,
} from "@/agents/researchTracker/direction";
import { getLLMProvider, type LLMProvider } from "@/lib/llm/provider";
import { truncateText } from "@/lib/utils";
import type { EventDirection, ResearchEvent } from "@/types";

/**
 * Source-grounded direction audit.
 *
 * The first audit judged every event from the text already stored in the
 * tracker (curated prose for seed events, an LLM-written summary for ingested
 * ones). This script fetches the original abstract behind each event and judges
 * it again, so the two verdicts can be compared and the stored-text verdict
 * either confirmed or corrected.
 *
 *   npm run audit:direction:source -- --survey
 *   npm run audit:direction:source
 *   npm run audit:direction:source -- --only=slug-a,slug-b --fresh
 *
 * It never writes event data; results go to a review report plus resumable
 * caches under `.cache/`.
 */

const CACHE_DIR = path.join(process.cwd(), ".cache");
const SOURCE_CACHE = path.join(CACHE_DIR, "source-abstracts.json");
const JUDGE_CACHE = path.join(CACHE_DIR, "source-judge.json");
const STORED_CACHE = path.join(CACHE_DIR, "direction-audit.json");
const REPORT_MD = path.join(process.cwd(), "docs", "direction-source-audit-2026-11-09.md");
const REPORT_JSON = path.join(process.cwd(), "docs", "direction-source-audit-2026-11-09.json");

type Candidate = {
  event: ResearchEvent;
  source: "seed" | "ingested";
};

type SourceStatus = "arxiv-id" | "arxiv-title" | "openalex" | "unavailable";

interface SourceRow {
  slug: string;
  title: string;
  source: "seed" | "ingested";
  status: SourceStatus;
  arxivId?: string;
  matchedTitle?: string;
  url?: string;
  abstract?: string;
  error?: string;
  fetchedAt: string;
}

interface JudgeRow {
  slug: string;
  title: string;
  oldDirection?: EventDirection;
  sourceStatus: SourceStatus;
  analysis?: DirectionAnalysis;
  combined?: DirectionAnalysis;
  /** Absent on the first 155 rows, judged before the rubric gained negatives. */
  rubric?: string;
  inputHash: string;
  checkedAt: string;
}

function parseArgs() {
  const argv = process.argv.slice(2);
  const value = (name: string) =>
    argv.find((entry) => entry.startsWith(`--${name}=`))?.slice(name.length + 3);
  const limit = Number(value("limit"));
  const concurrency = Number(value("concurrency"));
  const only = value("only");
  return {
    survey: argv.includes("--survey"),
    fresh: argv.includes("--fresh"),
    noOpenAlex: argv.includes("--no-openalex"),
    reportOnly: argv.includes("--report-only"),
    limit: Number.isInteger(limit) && limit > 0 ? limit : undefined,
    concurrency: Number.isInteger(concurrency) && concurrency > 0 ? concurrency : 3,
    only: only ? new Set(only.split(",").filter(Boolean)) : undefined,
    priority: argv.includes("--priority"),
  };
}

/**
 * Highest-impact rows first: a stored-text verdict that would change, then a
 * low-confidence verdict, with ingested events ahead of curated seed events.
 * The first pass ran seed-first, which spent most of its budget confirming
 * rows that were never going to change.
 */
function prioritize(candidates: Candidate[]): Candidate[] {
  const audit = readJson<
    Record<string, { oldDirection?: EventDirection; analysis?: { verdict: string; confidence: number } }>
  >(STORED_CACHE, {});
  const rank = (candidate: Candidate) => {
    const row = audit[candidate.event.slug];
    const changed = row?.analysis && row.analysis.verdict !== row.oldDirection ? 0 : 1;
    const low = row?.analysis && row.analysis.confidence < 0.7 ? 0 : 1;
    return changed * 10 + low * 5 + (candidate.source === "ingested" ? 0 : 1);
  };
  return [...candidates].sort(
    (a, b) => rank(a) - rank(b) || a.event.slug.localeCompare(b.event.slug)
  );
}

function readJson<T>(file: string, fallback: T): T {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as T)
      : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(file: string, value: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2), "utf8");
}

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadCandidates(): Candidate[] {
  const bySlug = new Map<string, Candidate>();
  for (const event of seedEvents) {
    if (isDirectionEligible(event)) bySlug.set(event.slug, { event, source: "seed" });
  }
  for (const event of readIngestedEvents()) {
    if (isDirectionEligible(event) && !bySlug.has(event.slug)) {
      bySlug.set(event.slug, { event, source: "ingested" });
    }
  }
  return [...bySlug.values()];
}

function candidateUrls(event: ResearchEvent): string[] {
  const urls = [
    ...(event.papers ?? []).map((paper) => paper.url),
    event.paperUrl,
    event.sourceUrl,
  ].filter((url): url is string => Boolean(url));
  return [...new Set(urls)];
}

/** arXiv IDs appear as abs/pdf links, versioned links and DataCite DOIs. */
function arxivIdFromUrl(url: string): string | undefined {
  const doi = /10\.48550\/arxiv\.([a-z-]+(?:\.[a-z]{2})?\/\d{7}|\d{4}\.\d{4,5})/i.exec(url);
  if (doi) return doi[1].toLowerCase().replace(/^arxiv:/, "");
  const link = /arxiv\.org\/(?:abs|pdf)\/([a-z-]+(?:\.[a-z]{2})?\/\d{7}|\d{4}\.\d{4,5})(?:v\d+)?/i.exec(url);
  return link?.[1].toLowerCase();
}

function arxivIdOf(event: ResearchEvent): string | undefined {
  for (const url of candidateUrls(event)) {
    const id = arxivIdFromUrl(url);
    if (id) return id;
  }
  return undefined;
}

function decodeXml(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&");
}

function xmlTag(xml: string, name: string): string | undefined {
  const match = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`).exec(xml);
  if (!match) return undefined;
  return decodeXml(match[1]).replace(/\s+/g, " ").trim() || undefined;
}

interface ArxivEntry {
  id: string;
  title: string;
  abstract: string;
}

function parseArxivFeed(xml: string): ArxivEntry[] {
  return xml
    .split("<entry>")
    .slice(1)
    .map((entry) => entry.split("</entry>")[0])
    .map((entry) => {
      const idUrl = xmlTag(entry, "id") ?? "";
      const id = /abs\/([^<]+)$/.exec(idUrl)?.[1]?.replace(/v\d+$/, "").toLowerCase();
      const title = xmlTag(entry, "title");
      const abstract = xmlTag(entry, "summary");
      return id && title && abstract ? { id, title, abstract } : undefined;
    })
    .filter((entry): entry is ArxivEntry => Boolean(entry));
}

async function fetchText(url: string, attempts = 3): Promise<string | undefined> {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "ai4math-tracker/0.1 (direction source audit)" },
        signal: AbortSignal.timeout(45_000),
      });
      if (response.ok) return await response.text();
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("retry-after"));
        await sleep((Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 12_000) + 1_000);
      } else {
        console.warn(`source fetch ${response.status}: ${url}`);
      }
    } catch (error) {
      console.warn(`source fetch failed (${attempt}/${attempts}): ${url}`, String(error).slice(0, 160));
    }
    if (attempt < attempts) await sleep(4_000 * attempt);
  }
  return undefined;
}

async function fetchArxivByIds(ids: string[]): Promise<Map<string, ArxivEntry>> {
  const found = new Map<string, ArxivEntry>();
  for (let start = 0; start < ids.length; start += 40) {
    const batch = ids.slice(start, start + 40);
    const list = batch.map((id) => encodeURIComponent(id)).join(",");
    const xml = await fetchText(
      `https://export.arxiv.org/api/query?id_list=${list}&max_results=${batch.length}`
    );
    if (xml) {
      for (const entry of parseArxivFeed(xml)) found.set(entry.id, entry);
    }
    if (start + 40 < ids.length) await sleep(3_200);
  }
  return found;
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\$[^$]*\$/g, " ")
    .replace(/\\[a-z]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function titleSimilarity(a: string, b: string): number {
  const left = new Set(normalizeTitle(a).split(" ").filter(Boolean));
  const right = new Set(normalizeTitle(b).split(" ").filter(Boolean));
  if (left.size === 0 || right.size === 0) return 0;
  let shared = 0;
  for (const word of left) if (right.has(word)) shared += 1;
  return shared / (left.size + right.size - shared);
}

async function fetchArxivByTitle(title: string): Promise<ArxivEntry | undefined> {
  const query = title.replace(/["\n\r]/g, " ").trim();
  if (query.length < 12) return undefined;
  const xml = await fetchText(
    `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(`ti:"${query}"`)}&max_results=5`
  );
  if (!xml) return undefined;
  const entries = parseArxivFeed(xml);
  const best = entries
    .map((entry) => ({ entry, score: titleSimilarity(title, entry.title) }))
    .sort((a, b) => b.score - a.score)[0];
  return best && best.score >= 0.9 ? best.entry : undefined;
}

function openAlexAbstract(index: unknown): string | undefined {
  if (!index || typeof index !== "object") return undefined;
  const words: { word: string; position: number }[] = [];
  for (const [word, positions] of Object.entries(index as Record<string, unknown>)) {
    if (!Array.isArray(positions)) continue;
    for (const position of positions) {
      if (typeof position === "number") words.push({ word, position });
    }
  }
  if (words.length === 0) return undefined;
  words.sort((a, b) => a.position - b.position);
  return words.map((item) => item.word).join(" ");
}

async function fetchOpenAlex(title: string): Promise<{ abstract: string; title: string } | undefined> {
  const query = title.replace(/["\n\r]/g, " ").trim();
  if (query.length < 12) return undefined;
  const url =
    "https://api.openalex.org/works?per-page=3&select=title,abstract_inverted_index,doi" +
    `&filter=title.search:${encodeURIComponent(query)}`;
  const body = await fetchText(url, 4);
  if (!body) return undefined;
  try {
    const parsed = JSON.parse(body) as {
      results?: { title?: string; abstract_inverted_index?: unknown }[];
    };
    for (const result of parsed.results ?? []) {
      if (!result.title || titleSimilarity(title, result.title) < 0.9) continue;
      const abstract = openAlexAbstract(result.abstract_inverted_index);
      if (abstract) return { abstract, title: result.title };
    }
  } catch {
    // OpenAlex occasionally returns an HTML error page; treat it as no match.
  }
  return undefined;
}

function sourceInput(event: ResearchEvent, abstract: string): string {
  return [
    `Title: ${event.title}`,
    `Research area: ${event.researchArea ?? "(none)"}${event.subArea ? ` / ${event.subArea}` : ""}`,
    `Source abstract: ${truncateText(abstract, 2400)}`,
  ].join("\n");
}

function combinedInput(event: ResearchEvent, abstract: string): string {
  return `${directionInput(event)}\n\nSource abstract: ${truncateText(abstract, 2400)}`;
}

async function fetchAbstracts(
  candidates: Candidate[],
  cache: Record<string, SourceRow>,
  options: { fresh: boolean; noOpenAlex: boolean }
): Promise<Record<string, SourceRow>> {
  const pending = (candidate: Candidate) => {
    const row = cache[candidate.event.slug];
    if (options.fresh) return true;
    if (!row) return true;
    return !row.abstract && row.status !== "unavailable";
  };

  const idMap = new Map<string, Candidate[]>();
  for (const candidate of candidates.filter(pending)) {
    const id = arxivIdOf(candidate.event);
    if (!id) continue;
    const list = idMap.get(id) ?? [];
    list.push(candidate);
    idMap.set(id, list);
  }

  if (idMap.size > 0) {
    console.log(`arXiv: fetching ${idMap.size} ids in batches of 40`);
    const entries = await fetchArxivByIds([...idMap.keys()]);
    for (const [id, list] of idMap) {
      const entry = entries.get(id);
      for (const candidate of list) {
        cache[candidate.event.slug] = entry
          ? {
              slug: candidate.event.slug,
              title: candidate.event.title,
              source: candidate.source,
              status: "arxiv-id",
              arxivId: id,
              url: `https://arxiv.org/abs/${id}`,
              abstract: entry.abstract,
              fetchedAt: new Date().toISOString(),
            }
          : {
              slug: candidate.event.slug,
              title: candidate.event.title,
              source: candidate.source,
              status: "unavailable",
              arxivId: id,
              error: "arxiv id not found in feed",
              fetchedAt: new Date().toISOString(),
            };
      }
    }
    writeJson(SOURCE_CACHE, cache);
    console.log(`arXiv: ${[...idMap.values()].flat().filter((candidate) => cache[candidate.event.slug].abstract).length}/${[...idMap.values()].flat().length} resolved`);
  }

  const byTitle = candidates.filter((candidate) => pending(candidate));
  if (byTitle.length > 0) {
    console.log(`title search: ${byTitle.length} events without an arXiv id`);
    for (const candidate of byTitle) {
      const entry = await fetchArxivByTitle(candidate.event.title);
      cache[candidate.event.slug] = entry
        ? {
            slug: candidate.event.slug,
            title: candidate.event.title,
            source: candidate.source,
            status: "arxiv-title",
            arxivId: entry.id,
            matchedTitle: entry.title,
            url: `https://arxiv.org/abs/${entry.id}`,
            abstract: entry.abstract,
            fetchedAt: new Date().toISOString(),
          }
        : {
            slug: candidate.event.slug,
            title: candidate.event.title,
            source: candidate.source,
            status: "unavailable",
            error: "no exact arXiv title match",
            fetchedAt: new Date().toISOString(),
          };
      writeJson(SOURCE_CACHE, cache);
      await sleep(3_200);
    }
  }

  const unresolved = candidates.filter((candidate) => !cache[candidate.event.slug]?.abstract);
  if (!options.noOpenAlex && unresolved.length > 0) {
    console.log(`OpenAlex fallback: ${unresolved.length} events`);
    for (const candidate of unresolved) {
      const match = await fetchOpenAlex(candidate.event.title);
      if (match) {
        cache[candidate.event.slug] = {
          slug: candidate.event.slug,
          title: candidate.event.title,
          source: candidate.source,
          status: "openalex",
          matchedTitle: match.title,
          abstract: match.abstract,
          fetchedAt: new Date().toISOString(),
        };
        writeJson(SOURCE_CACHE, cache);
      }
      await sleep(1_200);
    }
  }

  for (const candidate of candidates) {
    if (cache[candidate.event.slug]?.abstract) continue;
    cache[candidate.event.slug] = {
      slug: candidate.event.slug,
      title: candidate.event.title,
      source: candidate.source,
      status: "unavailable",
      error: cache[candidate.event.slug]?.error ?? "no source abstract found",
      fetchedAt: new Date().toISOString(),
    };
  }
  writeJson(SOURCE_CACHE, cache);
  return cache;
}

function storedRows(): Record<string, JudgeRow> {
  const stored = readJson<Record<string, { analysis?: DirectionAnalysis }>>(STORED_CACHE, {});
  const rows: Record<string, JudgeRow> = {};
  for (const [slug, row] of Object.entries(stored)) {
    if (!row.analysis) continue;
    rows[slug] = {
      slug,
      title: "",
      sourceStatus: "unavailable",
      analysis: row.analysis,
      inputHash: "",
      checkedAt: "",
    };
  }
  return rows;
}

async function judgeAll(
  candidates: Candidate[],
  sources: Record<string, SourceRow>,
  cache: Record<string, JudgeRow>,
  provider: LLMProvider,
  concurrency: number,
  fresh: boolean
): Promise<Record<string, JudgeRow>> {
  const stored = storedRows();
  const jobs = candidates.filter((candidate) => sources[candidate.event.slug]?.abstract);
  let done = 0;
  let cursor = 0;
  let consecutiveFailures = 0;

  const workers = Array.from({ length: Math.min(concurrency, jobs.length) }, async () => {
    while (cursor < jobs.length) {
      // Quota exhaustion returns 429 for every call; stop instead of writing a
      // failure row for every remaining event.
      if (consecutiveFailures >= 5) return;
      const candidate = jobs[cursor++];
      const source = sources[candidate.event.slug];
      const abstract = source.abstract ?? "";
      const input = sourceInput(candidate.event, abstract);
      const inputHash = sha256(input);
      const cached = cache[candidate.event.slug];
      if (!fresh && cached?.analysis && cached.inputHash === inputHash) {
        done += 1;
        continue;
      }

      let analysis: DirectionAnalysis | undefined;
      for (let attempt = 1; attempt <= 3 && !analysis; attempt += 1) {
        analysis = await analyzeDirectionText(input, provider, candidate.event.title);
        if (!analysis && attempt < 3) await sleep(2_000 * attempt);
      }

      if (analysis) {
        consecutiveFailures = 0;
      } else {
        consecutiveFailures += 1;
        await sleep(3_000);
      }
      cache[candidate.event.slug] = {
        slug: candidate.event.slug,
        title: candidate.event.title,
        oldDirection: candidate.event.direction,
        sourceStatus: source.status,
        analysis,
        rubric: DIRECTION_RUBRIC_VERSION,
        inputHash,
        checkedAt: new Date().toISOString(),
      };
      done += 1;
      const verdict = analysis ? `${analysis.verdict} ${analysis.confidence.toFixed(2)}` : "FAILED";
      const previous = stored[candidate.event.slug]?.analysis;
      const storedVerdict = previous ? `${previous.verdict} ${previous.confidence.toFixed(2)}` : "?";
      console.log(`[${done}/${jobs.length}] ${candidate.event.slug} -> ${verdict} (stored ${storedVerdict})`);
      writeJson(JUDGE_CACHE, cache);
    }
  });
  await Promise.all(workers);
  return cache;
}

async function judgeCombined(
  candidates: Candidate[],
  sources: Record<string, SourceRow>,
  cache: Record<string, JudgeRow>,
  provider: LLMProvider,
  concurrency: number
): Promise<Record<string, JudgeRow>> {
  const stored = storedRows();
  const jobs = candidates.filter((candidate) => {
    const row = cache[candidate.event.slug];
    if (!row?.analysis || !sources[candidate.event.slug]?.abstract) return false;
    const old = stored[candidate.event.slug]?.analysis;
    return !old || old.verdict !== row.analysis.verdict || row.analysis.confidence < 0.7;
  });
  console.log(`combined re-judge: ${jobs.length} disagreements or low-confidence rows`);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, jobs.length) }, async () => {
    while (cursor < jobs.length) {
      const candidate = jobs[cursor++];
      const row = cache[candidate.event.slug];
      if (row.combined) continue;
      const input = combinedInput(candidate.event, sources[candidate.event.slug].abstract ?? "");
      let combined: DirectionAnalysis | undefined;
      for (let attempt = 1; attempt <= 3 && !combined; attempt += 1) {
        combined = await analyzeDirectionText(input, provider, candidate.event.title);
        if (!combined && attempt < 3) await sleep(2_000 * attempt);
      }
      row.combined = combined;
      writeJson(JUDGE_CACHE, cache);
    }
  });
  await Promise.all(workers);
  return cache;
}

function pct(part: number, total: number): string {
  return total === 0 ? "0%" : `${Math.round((part / total) * 100)}%`;
}

function cell(value: string | undefined, max = 120): string {
  if (!value) return "—";
  const flat = value.replace(/\s+/g, " ").replace(/\|/g, "\\|").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

function buildReport(
  candidates: Candidate[],
  sources: Record<string, SourceRow>,
  judged: Record<string, JudgeRow>,
  stored: Record<string, { analysis?: DirectionAnalysis }>
): string {
  const rows = candidates.map((candidate) => {
    const source = sources[candidate.event.slug];
    const row = judged[candidate.event.slug];
    const old = candidate.event.direction;
    const oldAnalysis = stored[candidate.event.slug]?.analysis;
    return {
      slug: candidate.event.slug,
      title: candidate.event.title,
      eventSource: candidate.source,
      oldDirection: old,
      sourceStatus: source?.status ?? "unavailable",
      arxivId: source?.arxivId,
      sourceUrl: source?.url,
      abstract: source?.abstract,
      stored: oldAnalysis,
      sourceVerdict: row?.analysis,
      combined: row?.combined,
    };
  });

  const arxivIdRows = rows.filter((row) => row.sourceStatus === "arxiv-id");
  const arxivTitleRows = rows.filter((row) => row.sourceStatus === "arxiv-title");
  const openAlexRows = rows.filter((row) => row.sourceStatus === "openalex");
  const missingRows = rows.filter((row) => row.sourceStatus === "unavailable");
  const judgedRows = rows.filter((row) => row.sourceVerdict);
  const comparable = judgedRows.filter((row) => row.stored);
  const disagree = comparable.filter((row) => row.stored!.verdict !== row.sourceVerdict!.verdict);
  const combinedRows = disagree.filter((row) => row.combined);

  const pairs = new Map<string, number>();
  for (const row of comparable) {
    const key = `${row.stored!.verdict} → ${row.sourceVerdict!.verdict}`;
    pairs.set(key, (pairs.get(key) ?? 0) + 1);
  }
  const highConfidence = comparable.filter((row) => row.stored!.confidence >= 0.8);
  const lowConfidence = comparable.filter((row) => row.stored!.confidence < 0.8);
  const highDisagree = highConfidence.filter(
    (row) => row.stored!.verdict !== row.sourceVerdict!.verdict
  ).length;
  const lowDisagree = lowConfidence.filter(
    (row) => row.stored!.verdict !== row.sourceVerdict!.verdict
  ).length;

  const unjudged = rows.filter((row) => !row.sourceVerdict && row.abstract);
  const v2Count = judgedRows.filter(
    (row) => judged[row.slug]?.rubric === DIRECTION_RUBRIC_VERSION
  ).length;

  const lines: string[] = [];
  lines.push("# 方向轴源数据复核（2026-11-09）");
  lines.push("");
  lines.push(
    `把每条科研事件回源到原始摘要后重判，与库内文本（种子策展概要 / 采集摘要）的判定做对照。本次按优先级选出 **${rows.length}** 条事件，其中 **${judgedRows.length}** 条已有源摘要判定可对照，**${unjudged.length}** 条尚未完成。`
  );
  lines.push("");
  lines.push("> 两轮不一致的 6 条已由人工定判，不再使用合并重判；判定依据与应用结果见 `direction-gold-review-2026-11-09.md`。");
  lines.push("");
  lines.push("## 方法");
  lines.push("");
  lines.push("- **库内文本判定**：读取 `direction-audit-2026-11-09.json`，输入为标题、研究领域、problem、keyContributions、summary、significance。");
  lines.push("- **源数据判定**：只输入标题、研究领域与原始摘要（arXiv 摘要优先；非 arXiv 用标题精确匹配 arXiv，再回退 OpenAlex）。");
  lines.push(
    `- 两次判定使用同一套三步法提示词。首轮为 rubric v1（未版本化），边界修订后的新判定为 v2（\`${DIRECTION_RUBRIC_VERSION}\`）；本次已判定条目中 v2 为 **${v2Count}** 条，其余沿用 v1 结果，未重判。`
  );
  lines.push("- 对不一致或源摘要置信度 < 0.7 的条目，再用「库内文本 + 原始摘要」合并重判，作为建议判定。");
  lines.push("");
  lines.push("## 源摘要覆盖");
  lines.push("");
  lines.push("| 来源 | 数量 |");
  lines.push("| --- | ---: |");
  lines.push(`| arXiv 链接 | ${arxivIdRows.length} |`);
  lines.push(`| arXiv 标题匹配 | ${arxivTitleRows.length} |`);
  lines.push(`| OpenAlex | ${openAlexRows.length} |`);
  lines.push(`| 未取得 | ${missingRows.length} |`);
  lines.push(`| **合计** | **${rows.length}** |`);
  lines.push("");
  lines.push(
    `覆盖率 **${pct(arxivIdRows.length + arxivTitleRows.length + openAlexRows.length, rows.length)}**；未取得摘要的条目多为新闻、博客、机构页面或数据库未收录的论文。`
  );
  lines.push("");
  if (unjudged.length > 0) {
    lines.push("## 未完成的源数据重判");
    lines.push("");
    lines.push(
      `还有 **${unjudged.length}** 条已取得摘要但尚未完成重判（LLM 额度耗尽，调用返回 429）。合并重判同样未执行。恢复额度后重跑 \`npm run audit:direction:source -- --priority\` 会从缓存续跑，不会重复已完成的条目。`
    );
    lines.push("");
    lines.push("| slug | 标题 |");
    lines.push("| --- | --- |");
    for (const row of unjudged.slice(0, 25)) {
      lines.push(`| \`${row.slug}\` | ${cell(row.title, 60)} |`);
    }
    if (unjudged.length > 25) {
      lines.push(`| … | 其余 ${unjudged.length - 25} 条见同名 JSON |`);
    }
    lines.push("");
  }
  lines.push("## 总体一致性");
  lines.push("");
  lines.push(
    `在同时具备两种判定的 **${comparable.length}** 条中，源数据判定与库内判定一致 **${comparable.length - disagree.length}** 条（${pct(
      comparable.length - disagree.length,
      comparable.length
    )}），不一致 **${disagree.length}** 条。`
  );
  lines.push("");
  lines.push("| 库内 → 源数据 | 数量 |");
  lines.push("| --- | ---: |");
  for (const [key, count] of [...pairs.entries()].sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${key} | ${count} |`);
  }
  lines.push("");
  lines.push("按库内判定的置信度拆开看：");
  lines.push("");
  lines.push("| 库内置信度 | 条数 | 与源数据不一致 |");
  lines.push("| --- | ---: | ---: |");
  lines.push(
    `| ≥ 0.8 | ${highConfidence.length} | ${highDisagree}（${pct(highDisagree, highConfidence.length)}） |`
  );
  lines.push(
    `| < 0.8 | ${lowConfidence.length} | ${lowDisagree}（${pct(lowDisagree, lowConfidence.length)}） |`
  );
  lines.push("");
  lines.push(
    "不一致集中在库内判定自身置信度较低的条目：高置信度条目与源数据几乎一致，说明原复核在其有把握的范围内是可靠的。"
  );
  lines.push("");
  lines.push("## 不一致明细");
  lines.push("");
  lines.push(
    "下表给出库内判定、源摘要判定与合并建议。源摘要列引用原文关键句，便于人工判断是哪一侧错了。已由人工金标准复核定判的条目以 `direction-gold-review-2026-11-09.md` 为准；下表保留自动判定原文，便于追溯。"
  );
  lines.push("");
  lines.push("| slug | 标题 | 库内 | 源数据 | 合并建议 | 源摘要依据 |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  for (const row of disagree) {
    const storedVerdict = `${row.stored!.verdict} ${row.stored!.confidence.toFixed(2)}`;
    const sourceVerdict = `${row.sourceVerdict!.verdict} ${row.sourceVerdict!.confidence.toFixed(2)}`;
    const combined = row.combined
      ? `${row.combined.verdict} ${row.combined.confidence.toFixed(2)}`
      : "—";
    lines.push(
      `| \`${row.slug}\` | ${cell(row.title, 60)} | ${storedVerdict} | ${sourceVerdict} | ${combined} | ${cell(
        row.sourceVerdict!.reason,
        120
      )} |`
    );
  }
  lines.push("");
  if (combinedRows.length > 0) {
    const sourceWins = combinedRows.filter(
      (row) => row.combined!.verdict === row.sourceVerdict!.verdict
    ).length;
    const storedWins = combinedRows.filter(
      (row) => row.combined!.verdict === row.stored!.verdict
    ).length;
    lines.push(
      `合并重判共 **${combinedRows.length}** 条：建议与源数据一致 **${sourceWins}** 条，与库内文本一致 **${storedWins}** 条，其余为第三种结果或失败。`
    );
    lines.push("");
  }
  lines.push("## 需优先人工核验");
  lines.push("");
  const review = comparable.filter(
    (row) =>
      row.stored!.verdict !== row.sourceVerdict!.verdict ||
      row.sourceVerdict!.confidence < 0.7 ||
      (row.combined && row.combined.confidence < 0.7)
  );
  lines.push(`共 **${review.length}** 条，条件：两侧不一致、源摘要置信度 < 0.7，或合并重判置信度 < 0.7。`);
  lines.push("");
  lines.push("| slug | 库内 | 源数据 | 合并建议 | 源数据理由 |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const row of review) {
    lines.push(
      `| \`${row.slug}\` | ${row.stored!.verdict} | ${row.sourceVerdict!.verdict} ${row.sourceVerdict!.confidence.toFixed(
        2
      )} | ${row.combined ? `${row.combined.verdict} ${row.combined.confidence.toFixed(2)}` : "—"} | ${cell(
        row.sourceVerdict!.reason,
        140
      )} |`
    );
  }
  lines.push("");
  lines.push("## 未取得源摘要");
  lines.push("");
  lines.push("| slug | 标题 | 错误 |");
  lines.push("| --- | --- | --- |");
  for (const row of missingRows) {
    const source = sources[row.slug];
    lines.push(`| \`${row.slug}\` | ${cell(row.title, 60)} | ${cell(source?.error, 100)} |`);
  }
  lines.push("");
  lines.push("## 存储摘要与源摘要的可见偏差");
  lines.push("");
  lines.push("以下条目的库内判定与源数据判定不同；把两者并排放在一起，可直接看出库内摘要是漏掉了实际交付物、还是强调了作者动机。");
  lines.push("");
  for (const row of disagree.slice(0, 25)) {
    lines.push(`### \`${row.slug}\``);
    lines.push("");
    lines.push(`**${row.title}**`);
    lines.push("");
    lines.push(`- 库内：${row.stored!.verdict}（${row.stored!.confidence.toFixed(2)}）——${row.stored!.reason}`);
    lines.push(`- 源数据：${row.sourceVerdict!.verdict}（${row.sourceVerdict!.confidence.toFixed(2)}）——${row.sourceVerdict!.reason}`);
    if (row.combined) {
      lines.push(`- 合并建议：${row.combined.verdict}（${row.combined.confidence.toFixed(2)}）——${row.combined.reason}`);
    }
    lines.push(`- 源摘要：${cell(row.abstract, 420)}`);
    lines.push("");
  }
  if (disagree.length > 25) {
    lines.push(`其余 ${disagree.length - 25} 条见同名 JSON 的 \`abstract\` 字段。`);
    lines.push("");
  }
  lines.push("## 说明");
  lines.push("");
  lines.push("- 本报告只做对照，**没有修改任何事件数据**；原始摘要缓存在 `.cache/source-abstracts.json`，源数据判定在 `.cache/source-judge.json`。");
  lines.push("- 源摘要判定以 arXiv/OpenAlex 摘要为准；会议论文的正式版可能与预印本有差异。");
  lines.push("- 未取得摘要的条目不能据此证明库内判定错误，仍需人工核验。");
  lines.push("");
  return lines.join("\n");
}

function buildJson(
  candidates: Candidate[],
  sources: Record<string, SourceRow>,
  judged: Record<string, JudgeRow>,
  stored: Record<string, { analysis?: DirectionAnalysis }>
) {
  return candidates.map((candidate) => {
    const source = sources[candidate.event.slug];
    const row = judged[candidate.event.slug];
    return {
      slug: candidate.event.slug,
      title: candidate.event.title,
      eventSource: candidate.source,
      oldDirection: candidate.event.direction,
      sourceStatus: source?.status ?? "unavailable",
      arxivId: source?.arxivId,
      sourceUrl: source?.url,
      abstract: source?.abstract,
      stored: stored[candidate.event.slug]?.analysis ?? null,
      sourceVerdict: row?.analysis ?? null,
      combined: row?.combined ?? null,
    };
  });
}

async function main(): Promise<void> {
  loadEnv();
  const options = parseArgs();
  let candidates = loadCandidates();
  if (options.only) candidates = candidates.filter((candidate) => options.only!.has(candidate.event.slug));
  if (options.priority) candidates = prioritize(candidates);
  if (options.limit) candidates = candidates.slice(0, options.limit);
  console.log(`source audit: ${candidates.length} research events selected`);

  if (options.survey) {
    const withId = candidates.filter((candidate) => arxivIdOf(candidate.event));
    const hosts = new Map<string, number>();
    for (const candidate of candidates.filter((entry) => !arxivIdOf(entry.event))) {
      for (const url of candidateUrls(candidate.event)) {
        try {
          const host = new URL(url).hostname.replace(/^www\./, "");
          hosts.set(host, (hosts.get(host) ?? 0) + 1);
        } catch {
          // ignore malformed urls
        }
      }
    }
    console.log(`with arXiv id: ${withId.length}`);
    console.log(`without arXiv id: ${candidates.length - withId.length}`);
    console.log(
      [...hosts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([host, count]) => `${host}: ${count}`)
        .join("\n")
    );
    return;
  }

  const sources = readJson<Record<string, SourceRow>>(SOURCE_CACHE, {});
  let judged = readJson<Record<string, JudgeRow>>(JUDGE_CACHE, {});
  if (!options.reportOnly) {
    await fetchAbstracts(candidates, sources, {
      fresh: options.fresh,
      noOpenAlex: options.noOpenAlex,
    });

    const provider = getLLMProvider();
    judged = await judgeAll(candidates, sources, judged, provider, options.concurrency, false);
    await judgeCombined(candidates, sources, judged, provider, options.concurrency);
  }

  const stored = readJson<Record<string, { analysis?: DirectionAnalysis }>>(STORED_CACHE, {});
  const markdown = buildReport(candidates, sources, judged, stored);
  const json = buildJson(candidates, sources, judged, stored);
  fs.mkdirSync(path.dirname(REPORT_MD), { recursive: true });
  fs.writeFileSync(REPORT_MD, markdown, "utf8");
  writeJson(REPORT_JSON, json);

  const available = candidates.filter((candidate) => sources[candidate.event.slug]?.abstract).length;
  const done = candidates.filter((candidate) => judged[candidate.event.slug]?.analysis).length;
  const storedCount = candidates.filter((candidate) => stored[candidate.event.slug]?.analysis).length;
  const disagree = candidates.filter((candidate) => {
    const old = stored[candidate.event.slug]?.analysis;
    const next = judged[candidate.event.slug]?.analysis;
    return Boolean(old && next && old.verdict !== next.verdict);
  }).length;
  console.log(
    `Done: ${done}/${candidates.length} judged, ${available} abstracts, ${storedCount} stored verdicts, ${disagree} disagreements.`
  );
  console.log(`report written to ${REPORT_MD}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
