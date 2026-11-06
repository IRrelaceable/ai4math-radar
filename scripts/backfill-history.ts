import { loadEnv } from "./env";
import fs from "node:fs";
import { runPipeline } from "@/agents/researchTracker/tracker";
import { classifyItem, type Classification } from "@/agents/researchTracker/classifier";
import { getStore } from "@/lib/db";
import {
  appendIngestedEvents,
  readIngestedEvents,
  readIngestedFingerprints,
  writeIngestedFingerprints,
} from "@/lib/db/ingested";
import { getLLMProvider } from "@/lib/llm/provider";
import { writeStaticData } from "@/lib/buildDataset";
import {
  NON_MATH_ABSTRACT,
  NON_MATH_TITLE,
  TITLE_AI,
  TITLE_MATH,
  normalizeTitle,
  pickBalanced,
  sleep,
  titleOverlap,
} from "./history-filters";
import type { RawResearchItem, ResearchArea } from "@/types";

/**
 * One-off historical backfill: pull AI4Math papers from arXiv year by year so
 * the archive is not empty before the live sources started (2024).
 *
 *   npm run backfill:history -- --dry                 # preview selection only
 *   npm run backfill:history                          # 2018-2025, 14 per year
 *   npm run backfill:history -- --from=2021 --to=2023 --per-year=12
 *
 * Selection is deliberately conservative:
 *   - arXiv IDs already present in the corpus are skipped (exact dedupe),
 *     because curated entries always link their arXiv version.
 *   - Titles too close to a stored record are skipped (catches publisher-only
 *     duplicates where the arXiv ID is not stored).
 *   - The existing `classifyItem` AI4Math gate runs on every candidate.
 *   - Pure software/hardware/security verification is filtered out; those use
 *     "theorem proving" without being mathematics.
 *   - Candidates are balanced across research areas instead of taking the
 *     highest keyword score, so a year does not become 14 formal-proving papers.
 *
 * Every accepted item goes through the normal ingest pipeline (LLM summary,
 * Chinese translation, contribution, entities), so provenance stays automated.
 */

const ARXIV_API = "https://export.arxiv.org/api/query";
const DEFAULT_FROM = 2018;
const DEFAULT_TO = 2025;
const DEFAULT_PER_YEAR = 14;
const REQUEST_DELAY_MS = 3200;

/** Theme queries. Each is wrapped in parentheses before the date clause. */
const THEME_QUERIES: { label: string; expr: string }[] = [
  { label: "theorem-proving", expr: 'all:"theorem proving"' },
  { label: "formal-proof", expr: 'all:"formal proof"' },
  { label: "proof-assistant", expr: 'all:"proof assistant"' },
  { label: "autoformalization", expr: "all:autoformalization OR all:autoformalisation" },
  { label: "lean", expr: 'all:Lean AND (all:theorem OR all:proof)' },
  {
    label: "math-reasoning",
    expr: 'all:"mathematical reasoning" AND (all:"language model" OR all:LLM OR all:transformer OR all:neural)',
  },
  { label: "math-word-problem", expr: 'all:"math word problem"' },
  {
    label: "geometry",
    expr: 'all:"geometry problem" AND (all:solver OR all:"machine learning" OR all:"language model")',
  },
  { label: "symbolic", expr: 'all:"symbolic regression" OR all:"equation discovery"' },
  {
    label: "discovery",
    expr: 'all:"mathematical discovery" AND (all:AI OR all:"language model" OR all:agent)',
  },
  {
    label: "olympiad",
    expr: 'all:"math olympiad" AND (all:"language model" OR all:agent OR all:AI)',
  },
  { label: "agent", expr: 'all:"mathematical agent" OR all:"research agent"' },
];

/** Ranking is a keyword/venue heuristic; it only orders a pre-filtered pool. */
interface ArxivEntry {
  id: string;
  arxivId: string;
  title: string;
  abstract: string;
  authors: string[];
  publishedAt: string;
  comment?: string;
  journalRef?: string;
  area?: ResearchArea;
  score: number;
  themes: string[];
}

interface Options {
  from: number;
  to: number;
  perYear: number;
  dry: boolean;
}

function parseArgs(argv: string[]): Options {
  const options: Options = { from: DEFAULT_FROM, to: DEFAULT_TO, perYear: DEFAULT_PER_YEAR, dry: false };
  for (const arg of argv) {
    if (arg === "--dry") options.dry = true;
    else if (arg.startsWith("--from=")) options.from = Number.parseInt(arg.slice("--from=".length), 10);
    else if (arg.startsWith("--to=")) options.to = Number.parseInt(arg.slice("--to=".length), 10);
    else if (arg.startsWith("--per-year=")) {
      options.perYear = Number.parseInt(arg.slice("--per-year=".length), 10);
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  if (!Number.isFinite(options.from) || !Number.isFinite(options.to) || options.from > options.to) {
    throw new Error("--from/--to must be a valid ascending year range");
  }
  if (!Number.isFinite(options.perYear) || options.perYear <= 0) {
    throw new Error("--per-year must be a positive number");
  }
  return options;
}

function decodeXml(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string): string | undefined {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return match ? match[1].trim() : undefined;
}

async function fetchYear(query: string, year: number): Promise<ArxivEntry[]> {
  // arXiv parses the range only when the space inside the brackets arrives as
  // "+"; a %20 there silently disables the date filter.
  const expr = `(${query}) AND submittedDate:[${year}01010000 TO ${year}12312359]`;
  const url =
    `${ARXIV_API}?search_query=${encodeURIComponent(expr).replace(/%20/g, "+")}` +
    "&start=0&max_results=25&sortBy=relevance&sortOrder=descending";

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, {
      headers: { "User-Agent": "AI4Math-Radar/0.1" },
      signal: AbortSignal.timeout(60_000),
    });
    if (response.status === 429 || response.status === 503) {
      console.log(`  arXiv throttled (${response.status}); backing off`);
      await sleep(15_000 * (attempt + 1));
      continue;
    }
    if (!response.ok) throw new Error(`arXiv returned HTTP ${response.status}`);

    const xml = await response.text();
    const blocks = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
    return blocks.flatMap((block) => {
      const id = tag(block, "id");
      const title = tag(block, "title");
      const summary = tag(block, "summary");
      if (!id || !title || !summary) return [];
      const arxivId = id.replace(/^.*\/abs\//, "").split("v")[0];
      const authors = [...block.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/g)]
        .map((match) => decodeXml(match[1]))
        .slice(0, 12);
      return [
        {
          id: `arxiv-${arxivId}`,
          arxivId,
          title: decodeXml(title),
          abstract: decodeXml(summary),
          authors,
          publishedAt: (tag(block, "published") ?? "").slice(0, 10),
          comment: tag(block, "arxiv:comment") ? decodeXml(tag(block, "arxiv:comment")!) : undefined,
          journalRef: tag(block, "arxiv:journal_ref")
            ? decodeXml(tag(block, "arxiv:journal_ref")!)
            : undefined,
          score: 0,
          themes: [],
        },
      ];
    });
  }
  return [];
}

/** Ranking is a keyword/venue heuristic; it only orders a pre-filtered pool. */
function scoreEntry(entry: ArxivEntry): number {
  const title = entry.title;
  const abstract = entry.abstract;
  let score = 0;
  if (TITLE_AI.test(title)) score += 4;
  else if (TITLE_AI.test(abstract)) score += 1;
  if (/(benchmark|dataset|prover|autoformalization|autoformalisation|lean|library)/i.test(title)) score += 2;
  if (/(survey|overview|system description)/i.test(title)) score += 1;
  if (entry.journalRef) score += 2;
  if (entry.comment && /(accept|proceedings|conference|workshop|neurips|icml|iclr|acl|cade|itp|cpp|popl|ijcar|cp)|journal/i.test(entry.comment)) {
    score += 2;
  }
  if (/(theorem|proof|formal|math)/i.test(title)) score += 1;
  return score;
}

function acceptable(entry: ArxivEntry, year: number): boolean {
  if (!entry.publishedAt.startsWith(String(year))) return false;
  if (!TITLE_MATH.test(entry.title)) return false;
  if (NON_MATH_TITLE.test(entry.title) || NON_MATH_ABSTRACT.test(entry.abstract)) return false;
  if (/^proceedings\b/i.test(entry.title)) return false;
  const classification = classifyItem({
    id: entry.id,
    title: entry.title,
    abstract: entry.abstract,
    source: "arXiv",
    sourceType: "arxiv",
  });
  if (!classification.isAI4Math) return false;
  entry.area = classification.researchArea;
  return true;
}

function toRawItem(entry: ArxivEntry): RawResearchItem {
  return {
    id: entry.id,
    externalId: entry.arxivId,
    sourceId: "arxiv",
    sourceType: "arxiv",
    sourceTier: "S0",
    title: entry.title,
    abstract: entry.abstract,
    url: `https://arxiv.org/abs/${entry.arxivId}`,
    source: "arXiv",
    publishedAt: entry.publishedAt,
    authors: entry.authors,
  };
}

async function main() {
  loadEnv();
  const options = parseArgs(process.argv.slice(2));

  if (!options.dry) {
    const provider = getLLMProvider();
    if (provider.id === "mock") {
      throw new Error(
        "historical backfill needs a live provider (LLM_API_KEY); use --dry to preview without one"
      );
    }
  }

  const stored = await getStore().listEvents();
  const storedIds = new Set<string>();
  for (const event of stored) {
    for (const url of [event.sourceUrl, event.paperUrl]) {
      const match = url?.match(/arxiv\.org\/(?:abs|pdf)\/(\d{4}\.\d{4,5})/);
      if (match) storedIds.add(match[1]);
    }
  }
  const storedTitles = stored.map((event) => event.title);

  console.log(
    `historical backfill ${options.from}-${options.to}, ${options.perYear}/year` +
      (options.dry ? " (dry run)" : "")
  );
  console.log(`corpus: ${stored.length} events, ${storedIds.size} arXiv records already stored`);

  const selected: ArxivEntry[] = [];

  for (let year = options.from; year <= options.to; year += 1) {
    const pool = new Map<string, ArxivEntry>();
    for (const theme of THEME_QUERIES) {
      let entries: ArxivEntry[] = [];
      try {
        entries = await fetchYear(theme.expr, year);
      } catch (error) {
        // One dead theme must not lose the whole year; the other queries still
        // provide a usable pool.
        console.warn(`  ${theme.label} ${year} failed: ${String(error)}`);
      }
      for (const entry of entries) {
        const existing = pool.get(entry.arxivId);
        if (existing) {
          existing.themes.push(theme.label);
          continue;
        }
        entry.themes = [theme.label];
        pool.set(entry.arxivId, entry);
      }
      await sleep(REQUEST_DELAY_MS);
    }

    const seenTitles = new Set<string>();
    const candidates: ArxivEntry[] = [];
    for (const entry of pool.values()) {
      if (storedIds.has(entry.arxivId)) continue;
      const normalized = normalizeTitle(entry.title);
      if (seenTitles.has(normalized)) continue;
      if (storedTitles.some((title) => titleOverlap(entry.title, title) >= 0.7)) continue;
      if (!acceptable(entry, year)) continue;
      seenTitles.add(normalized);
      entry.score = scoreEntry(entry);
      candidates.push(entry);
    }

    const picked = pickBalanced(candidates, options.perYear);
    selected.push(...picked);

    console.log(`\n[${year}] pool ${pool.size}, candidates ${candidates.length}, picked ${picked.length}`);
    for (const entry of picked) {
      console.log(
        `  ${entry.publishedAt}  ${entry.arxivId}  ${entry.area ?? "-"}  ${entry.title}`
      );
    }
  }

  console.log(`\nselected ${selected.length} events across ${options.to - options.from + 1} years`);
  if (options.dry) {
    console.log("dry run: no summaries generated, nothing written");
    return;
  }

  const existingUrls = new Map(stored.map((event) => [event.slug, event.sourceUrl]));
  const result = await runPipeline(selected.map(toRawItem), [], {
    existingFingerprints: readIngestedFingerprints(),
    existingUrls,
  });

  let persisted: { added: number; updated: number; total: number } | undefined;
  if (result.accepted.length > 0) {
    persisted = appendIngestedEvents(result.accepted);
    writeIngestedFingerprints(result.fingerprints);
  }

  for (const row of result.trace) console.log(`[trace] ${row.step}: ${row.detail}`);
  console.log(
    `\naccepted ${result.accepted.length}, rejected ${result.rejected.length}` +
      (persisted ? `, stored +${persisted.added} ~${persisted.updated} (total ${persisted.total})` : "")
  );

  const rows = await writeStaticData();
  for (const row of rows) {
    console.log(`[data] ${row.lang}: ${row.events} events, ${row.kb} KB`);
  }

  const byYear = new Map<string, number>();
  for (const event of readIngestedEvents()) {
    const year = event.date.slice(0, 4);
    byYear.set(year, (byYear.get(year) ?? 0) + 1);
  }
  console.log(
    `[data] ingested by year: ${[...byYear.entries()].sort().map(([y, n]) => `${y}:${n}`).join(" ")}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
