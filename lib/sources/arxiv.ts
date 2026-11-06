import type { RawResearchItem } from "@/types";
import type { ResearchSource } from "./index";
import { sourceFetch } from "./http";

/**
 * arXiv source (V2 - first real research source).
 *
 * Queries the public arXiv API (export.arxiv.org) for AI4Math-adjacent
 * categories and returns raw items newest first. No third-party dependency:
 * the Atom feed is parsed with a small regex parser.
 */
const ARXIV_API = "https://export.arxiv.org/api/query";

/**
 * AI4Math arXiv scope. The formal-methods/logic categories (cs.LO, math.LO,
 * cs.FM, cs.SC) are scanned in full — AI4Math work lands there natively. The
 * big ML categories (cs.AI, cs.CL, cs.LG) only contribute papers whose TITLE
 * carries math vocabulary: without that anchor, hundreds of robotics/MoE/
 * efficiency papers per run diluted the pool and leaked past any keyword gate.
 *
 * arXiv stems non-wildcard terms but matches wildcards against the raw token,
 * so `ti:conjecture*` and `ti:formaliz*` return zero: "conjectures" stems to
 * "conjectur" and "formalization" to "formal". The singular forms below are
 * what the index actually answers to; `ti:autoformalization` alone has ~60
 * cs.AI hits that the old wildcard never surfaced.
 */
export const DEFAULT_ARXIV_QUERY =
  "(cat:cs.LO OR cat:math.LO OR cat:cs.FM OR cat:cs.SC) " +
  "OR ((cat:cs.AI OR cat:cs.CL OR cat:cs.LG) AND " +
  "(ti:math* OR ti:proof* OR ti:lean* OR ti:conjecture OR ti:theorem* " +
  "OR ti:olympiad OR ti:formalization OR ti:formalisation OR ti:autoformalization " +
  "OR ti:mathemat* OR ti:algebra* OR ti:geometr* " +
  "OR ti:combinator* OR ti:number-theory OR ti:putnam OR ti:minerva " +
  "OR ti:counterexample " +
  "OR abs:\"theorem proving\" OR abs:autoformalization OR abs:\"formal proof\"))";

export interface ArxivSourceOptions {
  query?: string;
  /** Injected for tests; defaults to the public arXiv API. */
  fetchFn?: typeof fetch;
  /** Injected for tests so retry backoff doesn't slow the suite. */
  sleepFn?: (ms: number) => Promise<void>;
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

/** Parse one arXiv Atom <entry> block into a RawResearchItem. */
export function parseArxivEntry(block: string): RawResearchItem | null {
  const id = tag(block, "id");
  const title = tag(block, "title");
  if (!id || !title) return null;

  const arxivId = id.replace(/^.*\/abs\//, "").split("v")[0];
  const published = tag(block, "published") ?? "";
  const authors = [...block.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/g)]
    .map((m) => decodeXml(m[1]))
    .slice(0, 12);

  return {
    id: `arxiv-${arxivId}`,
    title: decodeXml(title),
    abstract: tag(block, "summary") ? decodeXml(tag(block, "summary")!) : undefined,
    url: `https://arxiv.org/abs/${arxivId}`,
    githubUrl: extractGithub(tag(block, "summary") ?? ""),
    source: "arXiv",
    sourceTier: "S0",
    publishedAt: published.slice(0, 10) || undefined,
    authors,
  };
}

function extractGithub(summary: string): string | undefined {
  const match = summary.match(/https?:\/\/github\.com\/[\w.-]+\/[\w.-]+/);
  return match?.[0];
}

/**
 * arXiv throttles bursts with HTTP 429, and a throttle can outlast a single
 * minute (it has locked this project out for days). A daily scheduled run must
 * keep trying well past the old ~100-second budget, and must obey arXiv's own
 * `Retry-After` when the API sends one.
 */
const RETRY_DELAYS_MS = [15_000, 60_000, 180_000, 300_000];

/**
 * The API hard-caps any single response at 2000 records; one page is kept at
 * 200 so a multi-week backlog is paged instead of silently truncated. The old
 * single request with `max_results=limit` lost the middle of the backlog and
 * then advanced the cursor past it.
 */
const PAGE_SIZE = 200;
const MAX_PAGES = 10;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** `Retry-After` is either delta-seconds or an HTTP date. */
function retryAfterMs(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
  const date = Date.parse(value);
  if (Number.isNaN(date)) return undefined;
  return Math.max(0, date - Date.now());
}

export function createArxivSource(options: ArxivSourceOptions = {}): ResearchSource {
  const { query = DEFAULT_ARXIV_QUERY, fetchFn = sourceFetch, sleepFn = sleep } = options;
  return {
    id: "arxiv",
    label: "arXiv (cs.LO / math.LO / cs.AI)",
    sourceTier: "S0",
    async fetchRecent(fetchOptions = {}) {
      const limit = fetchOptions.limit ?? 25;
      const since = fetchOptions.since;
      const pageSize = Math.min(limit, PAGE_SIZE);
      const collected: RawResearchItem[] = [];

      for (let page = 0; page < MAX_PAGES && collected.length < limit; page++) {
        const url =
          `${ARXIV_API}?search_query=${encodeURIComponent(query)}` +
          `&start=${page * pageSize}&max_results=${pageSize}` +
          `&sortBy=submittedDate&sortOrder=descending`;

        let lastStatus = 0;
        let items: RawResearchItem[] | undefined;

        for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
          try {
            const response = await fetchFn(url, {
              headers: { "User-Agent": "AI4Math-Research-Tracker/0.1" },
              signal: AbortSignal.timeout(60_000),
            });

            if (!response.ok) {
              lastStatus = response.status;
              const retryable = response.status === 429 || response.status === 503;
              if (!retryable || attempt === RETRY_DELAYS_MS.length) break;
              const wait =
                retryAfterMs(response.headers?.get?.("retry-after") ?? null) ??
                RETRY_DELAYS_MS[attempt];
              await sleepFn(wait);
              continue;
            }

            const xml = await response.text();
            const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
            items = entries
              .map(parseArxivEntry)
              .filter((item): item is RawResearchItem => item !== null);
            break;
          } catch (error) {
            // Network timeouts and resets are as transient as a 429.
            if (attempt === RETRY_DELAYS_MS.length) throw error;
            await sleepFn(RETRY_DELAYS_MS[attempt]);
          }
        }

        if (!items) {
          throw new Error(
            `arXiv API returned ${lastStatus} after ${RETRY_DELAYS_MS.length} retries`
          );
        }

        const matched = since
          ? items.filter((item) => !item.publishedAt || item.publishedAt >= since)
          : items;
        collected.push(...matched);

        const oldest = items.at(-1)?.publishedAt;
        // A short page means the archive is exhausted; an item before `since`
        // means the rest of the backlog is already stored.
        if (items.length < pageSize) break;
        if (since && oldest && oldest < since) break;
      }

      return collected.slice(0, limit);
    },
  };
}

export const arxivSource = createArxivSource();
