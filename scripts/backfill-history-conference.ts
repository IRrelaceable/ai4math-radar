import { loadEnv } from "./env";
import { runPipeline } from "@/agents/researchTracker/tracker";
import { classifyItem } from "@/agents/researchTracker/classifier";
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
  TITLE_AI4MATH_TASK,
  decodeHtml,
  pickBalanced,
  sleep,
  titleOverlap,
} from "./history-filters";
import type { RawResearchItem, ResearchArea } from "@/types";

/**
 * Historical backfill for the years before live sources existed, using
 * conference proceedings instead of arXiv.
 *
 *   npm run backfill:history:conf -- --dry
 *   npm run backfill:history:conf
 *
 * Sources (all public proceedings pages):
 *   - NeurIPS 2018-2022  papers.nips.cc
 *   - ICML 2018-2022     proceedings.mlr.press
 *   - ACL / EMNLP / NAACL / COLING 2018-2022  aclanthology.org
 *
 * Only conference years up to 2022 are imported: later years are already well
 * covered by the live arXiv feed, and importing both copies of the same paper
 * from two publishers would show it twice.
 *
 * Proceedings list pages are large, so titles are filtered before fetching an
 * abstract page. The classifier stays the final gate, and every accepted item
 * goes through the normal ingest pipeline (summary, translation, entities).
 */

const LIST_DELAY_MS = 400;
const ABSTRACT_DELAY_MS = 200;
const MAX_TITLE_MATCHES_PER_PAGE = 60;
const DEFAULT_PER_YEAR = 8;
const DEFAULT_FROM = 2018;
const DEFAULT_TO = 2022;
const MAX_TOTAL = 60;

type PageKind = "neurips" | "pmlr" | "acl";

interface SourcePage {
  source: string;
  sourceId: string;
  kind: PageKind;
  year: number;
  /** Fallback month; ACL pages carry their own date. */
  month: number;
  listUrl: string;
}

interface Candidate {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  publishedAt: string;
  source: string;
  sourceId: string;
  url: string;
  score: number;
  area?: ResearchArea;
}

const NEURIPS_PAGES: SourcePage[] = [2018, 2019, 2020, 2021, 2022].map((year) => ({
  source: "NeurIPS",
  sourceId: "neurips",
  kind: "neurips" as const,
  year,
  month: 12,
  listUrl:
    year <= 2020
      ? `https://papers.nips.cc/paper/${year}`
      : `https://papers.nips.cc/paper_files/paper/${year}`,
}));

const ICML_VOLUMES: Record<number, string> = {
  2018: "v80",
  2019: "v97",
  2020: "v119",
  2021: "v139",
  2022: "v162",
};

const ICML_PAGES: SourcePage[] = Object.entries(ICML_VOLUMES).map(([year, volume]) => ({
  source: "ICML",
  sourceId: "icml",
  kind: "pmlr" as const,
  year: Number(year),
  // ICML 2019 was held in June; the other years were July.
  month: Number(year) === 2019 ? 6 : 7,
  listUrl: `https://proceedings.mlr.press/${volume}/`,
}));

const ACL_EVENTS: { id: string; source: string; year: number }[] = [
  { id: "acl-2018", source: "ACL", year: 2018 },
  { id: "emnlp-2018", source: "EMNLP", year: 2018 },
  { id: "coling-2018", source: "COLING", year: 2018 },
  { id: "naacl-2019", source: "NAACL", year: 2019 },
  { id: "acl-2019", source: "ACL", year: 2019 },
  { id: "emnlp-2019", source: "EMNLP", year: 2019 },
  { id: "acl-2020", source: "ACL", year: 2020 },
  { id: "emnlp-2020", source: "EMNLP", year: 2020 },
  { id: "coling-2020", source: "COLING", year: 2020 },
  { id: "naacl-2021", source: "NAACL", year: 2021 },
  { id: "acl-2021", source: "ACL", year: 2021 },
  { id: "emnlp-2021", source: "EMNLP", year: 2021 },
  { id: "naacl-2022", source: "NAACL", year: 2022 },
  { id: "acl-2022", source: "ACL", year: 2022 },
  { id: "emnlp-2022", source: "EMNLP", year: 2022 },
];

const ACL_PAGES: SourcePage[] = ACL_EVENTS.map((event) => ({
  source: event.source,
  sourceId: event.id.split("-")[0],
  kind: "acl" as const,
  year: event.year,
  month: 1,
  listUrl: `https://aclanthology.org/events/${event.id}/`,
}));

const PAGES: SourcePage[] = [...NEURIPS_PAGES, ...ICML_PAGES, ...ACL_PAGES];

interface Options {
  from: number;
  to: number;
  perYear: number;
  dry: boolean;
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    from: DEFAULT_FROM,
    to: DEFAULT_TO,
    perYear: DEFAULT_PER_YEAR,
    dry: false,
  };
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

const USER_AGENT = "Mozilla/5.0 (compatible; AI4Math-Radar/0.1)";

function shortHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36).slice(0, 6);
}

async function getHtml(url: string): Promise<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(45_000),
      });
      if (response.status === 429 || response.status === 503) {
        lastError = new Error(`HTTP ${response.status}`);
        await sleep(10_000 * (attempt + 1));
        continue;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < 2) await sleep(5_000 * (attempt + 1));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`failed to fetch ${url}`);
}

/** Supports both attribute orders used across the three publishers. */
function metaContent(html: string, name: string): string[] {
  const values: string[] = [];
  const patterns = [
    new RegExp(`<meta[^>]*name=["']?${name}["']?[^>]*content=["']([^"']*)["']`, "gi"),
    new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']?${name}["']?`, "gi"),
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) values.push(decodeHtml(match[1]));
  }
  return [...new Set(values)];
}

interface Link {
  title: string;
  url: string;
  authors?: string[];
}

function listNeurips(html: string): Link[] {
  const links: Link[] = [];
  for (const match of html.matchAll(
    /<a[^>]*href="([^"]*\/paper[^"]*-Abstract(?:-Conference)?\.html)"[^>]*>([^<]+)<\/a>/g
  )) {
    links.push({
      url: new URL(match[1], "https://papers.nips.cc").toString(),
      title: decodeHtml(match[2]),
    });
  }
  return links;
}

function listPmlr(html: string): Link[] {
  const links: Link[] = [];
  for (const block of html.split('<div class="paper">').slice(1)) {
    const title = block.match(/<p class="title">([\s\S]*?)<\/p>/)?.[1];
    const authors = block.match(/<span class="authors">([\s\S]*?)<\/span>/)?.[1];
    const href = block.match(/<a href="([^"]+\.html)">abs<\/a>/)?.[1];
    if (!title || !href) continue;
    links.push({
      url: href.replace(/^http:/, "https:"),
      title: decodeHtml(title),
      authors: authors
        ? decodeHtml(authors).split(/,\s*/).filter(Boolean)
        : [],
    });
  }
  return links;
}

function listAcl(html: string): Link[] {
  const links: Link[] = [];
  for (const match of html.matchAll(/<strong><a[^>]*href=([^ >]+)>([^<]+)<\/a><\/strong>/g)) {
    links.push({
      url: new URL(match[1], "https://aclanthology.org").toString(),
      title: decodeHtml(match[2]),
    });
  }
  return links;
}

const LISTERS: Record<PageKind, (html: string) => Link[]> = {
  neurips: listNeurips,
  pmlr: listPmlr,
  acl: listAcl,
};

interface Details {
  abstract: string;
  authors: string[];
  publishedAt?: string;
}

async function detailsNeurips(url: string, html: string): Promise<Details> {
  const abstract = html.match(/<p class="paper-abstract">([\s\S]*?)<\/section>/)?.[1];
  return {
    abstract: abstract ? decodeHtml(abstract) : "",
    authors: metaContent(html, "citation_author"),
  };
}

async function detailsPmlr(url: string, html: string): Promise<Details> {
  const abstract = html.match(/<div id="abstract" class="abstract">([\s\S]*?)<\/div>/)?.[1];
  return {
    abstract: abstract ? decodeHtml(abstract) : "",
    authors: [],
  };
}

async function detailsAcl(url: string, html: string): Promise<Details> {
  const abstract = html.match(
    /<div class="card-body acl-abstract">[\s\S]*?<span>([\s\S]*?)<\/span>/
  )?.[1];
  // ACL pages publish "2020/7" — a real year/month, day 1 is the page default.
  const date = metaContent(html, "citation_publication_date")[0];
  const match = date?.match(/^(\d{4})\/(\d{1,2})/);
  return {
    abstract: abstract ? decodeHtml(abstract) : "",
    authors: metaContent(html, "citation_author"),
    publishedAt: match
      ? `${match[1]}-${match[2].padStart(2, "0")}-01`
      : undefined,
  };
}

const DETAILS: Record<PageKind, (url: string, html: string) => Promise<Details>> = {
  neurips: detailsNeurips,
  pmlr: detailsPmlr,
  acl: detailsAcl,
};

/** Orders title matches before abstract fetches; only the top N are fetched. */
function titlePriority(title: string): number {
  let score = 0;
  if (/(theorem|proof|prover|formaliz|autoformal|lean|isabelle|coq)/i.test(title)) score += 5;
  if (/(word problem|arithmetic|olympiad|putnam|conjecture)/i.test(title)) score += 4;
  if (/(math|algebra|geometr|equation|symbolic)/i.test(title)) score += 3;
  if (TITLE_AI.test(title)) score += 2;
  return score;
}

function scoreCandidate(candidate: Candidate): number {  const title = candidate.title;
  const abstract = candidate.abstract;
  let score = 0;
  if (TITLE_AI.test(title)) score += 4;
  else if (TITLE_AI.test(abstract)) score += 1;
  if (/(benchmark|dataset|prover|autoformalization|autoformalisation|lean|library)/i.test(title)) {
    score += 2;
  }
  if (/(survey|overview|system description)/i.test(title)) score += 1;
  if (/(theorem|proof|formal|math)/i.test(title)) score += 1;
  return score;
}

function toRawItem(candidate: Candidate): RawResearchItem {
  return {
    id: candidate.id,
    sourceId: candidate.sourceId,
    sourceType: "conference",
    sourceTier: "S0",
    title: candidate.title,
    abstract: candidate.abstract,
    url: candidate.url,
    source: candidate.source,
    publishedAt: candidate.publishedAt,
    authors: candidate.authors,
  };
}

async function main() {
  loadEnv();
  const options = parseArgs(process.argv.slice(2));

  if (!options.dry) {
    const provider = getLLMProvider();
    if (provider.id === "mock") {
      throw new Error(
        "conference backfill needs a live provider (LLM_API_KEY); use --dry to preview"
      );
    }
  }

  const stored = await getStore().listEvents();
  const storedUrls = new Set(
    stored.flatMap((event) => [event.sourceUrl, event.paperUrl]).filter(Boolean) as string[]
  );
  const storedTitles = stored.map((event) => event.title);

  console.log(
    `conference backfill ${options.from}-${options.to}, ${options.perYear}/year` +
      (options.dry ? " (dry run)" : "")
  );
  console.log(`corpus: ${stored.length} events, ${storedUrls.size} stored links`);

  const selected: Candidate[] = [];

  for (let year = options.from; year <= options.to; year += 1) {
    const pages = PAGES.filter((page) => page.year === year);
    const pool: Candidate[] = [];
    const seen = new Set<string>();

    for (const page of pages) {
      let links: Link[] = [];
      try {
        links = LISTERS[page.kind](await getHtml(page.listUrl));
      } catch (error) {
        console.warn(`  ${page.source} ${year} listing failed: ${String(error)}`);
        continue;
      }

      const prefiltered = links
        .filter((link) => TITLE_AI4MATH_TASK.test(link.title) && !NON_MATH_TITLE.test(link.title))
        .sort((a, b) => titlePriority(b.title) - titlePriority(a.title))
        .slice(0, MAX_TITLE_MATCHES_PER_PAGE);
      console.log(`  ${page.source} ${year}: ${links.length} papers, ${prefiltered.length} title matches`);

      let fetched = 0;
      for (const link of prefiltered) {
        if (storedUrls.has(link.url) || seen.has(link.url)) continue;
        if (storedTitles.some((title) => titleOverlap(link.title, title) >= 0.55)) continue;

        let details: Details;
        try {
          details = await DETAILS[page.kind](link.url, await getHtml(link.url));
        } catch (error) {
          console.warn(`    skip ${link.url}: ${String(error)}`);
          await sleep(ABSTRACT_DELAY_MS);
          continue;
        }
        fetched += 1;
        if (fetched % 20 === 0) console.log(`    ... ${fetched} abstracts read`);
        await sleep(ABSTRACT_DELAY_MS);

        if (!details.abstract || NON_MATH_ABSTRACT.test(details.abstract)) continue;

        const classification = classifyItem({
          id: link.url,
          title: link.title,
          abstract: details.abstract,
          source: page.source,
          sourceType: "conference",
        });
        if (!classification.isAI4Math || !classification.researchArea) continue;

        seen.add(link.url);
        const candidate: Candidate = {
          id: `${page.sourceId}-${year}-${shortHash(link.url)}`,
          title: link.title,
          abstract: details.abstract,
          authors: link.authors?.length ? link.authors : details.authors.slice(0, 12),
          publishedAt: details.publishedAt ?? `${year}-${String(page.month).padStart(2, "0")}-01`,
          source: page.source,
          sourceId: page.sourceId,
          url: link.url,
          score: 0,
          area: classification.researchArea,
        };
        candidate.score = scoreCandidate(candidate);
        pool.push(candidate);
      }
      await sleep(LIST_DELAY_MS);
    }

    const picked = pickBalanced(pool, options.perYear);
    selected.push(...picked);

    console.log(`\n[${year}] candidates ${pool.length}, picked ${picked.length}`);
    for (const candidate of picked) {
      console.log(`  ${candidate.publishedAt}  ${candidate.source}  ${candidate.area ?? "-"}  ${candidate.title}`);
    }
  }

  console.log(`\nselected ${selected.length} conference events`);
  if (options.dry) {
    console.log("dry run: no summaries generated, nothing written");
    return;
  }
  if (selected.length === 0) {
    console.log("nothing to import");
    return;
  }
  if (selected.length > MAX_TOTAL) {
    throw new Error(`selection of ${selected.length} exceeds the ${MAX_TOTAL} item safety cap`);
  }

  const existingUrls = new Map(
    stored.flatMap((event) =>
      event.sourceUrl ? [[event.slug, event.sourceUrl] as [string, string]] : []
    )
  );
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
  for (const row of rows) console.log(`[data] ${row.lang}: ${row.events} events, ${row.kb} KB`);

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
