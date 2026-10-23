import type { RawResearchItem } from "@/types";
import type { ResearchSource } from "./index";

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
 */
export const DEFAULT_ARXIV_QUERY =
  "(cat:cs.LO OR cat:math.LO OR cat:cs.FM OR cat:cs.SC) " +
  "OR ((cat:cs.AI OR cat:cs.CL OR cat:cs.LG) AND " +
  "(ti:math* OR ti:proof* OR ti:lean* OR ti:conjecture* OR ti:theorem* " +
  "OR ti:olympiad OR ti:formaliz* OR ti:mathemat* OR ti:algebra* OR ti:geometr* " +
  "OR ti:combinator* OR ti:number-theory OR ti:putnam OR ti:minerva " +
  "OR abs:\"theorem proving\" OR abs:autoformaliz* OR abs:\"formal proof\"))";

export interface ArxivSourceOptions {
  query?: string;
  /** Injected for tests; defaults to the public arXiv API. */
  fetchFn?: typeof fetch;
  /** Minimum delay between calls, to stay polite with the public API. */
  timeoutMs?: number;
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
    publishedAt: published.slice(0, 10) || undefined,
    authors,
  };
}

function extractGithub(summary: string): string | undefined {
  const match = summary.match(/https?:\/\/github\.com\/[\w.-]+\/[\w.-]+/);
  return match?.[0];
}

/**
 * arXiv politely rate-limits burst traffic (HTTP 429). Transient failures get
 * backed off and retried, so a scheduled daily run doesn't die on one 429.
 */
const RETRY_DELAYS_MS = [10_000, 30_000, 60_000];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createArxivSource(options: ArxivSourceOptions = {}): ResearchSource {
  const { query = DEFAULT_ARXIV_QUERY, fetchFn = fetch } = options;
  return {
    id: "arxiv",
    label: "arXiv (cs.LO / math.LO / cs.AI)",
    async fetchRecent(fetchOptions = {}) {
      const limit = fetchOptions.limit ?? 25;
      const since = fetchOptions.since;
      const url =
        `${ARXIV_API}?search_query=${encodeURIComponent(query)}` +
        `&start=0&max_results=${limit}&sortBy=submittedDate&sortOrder=descending`;

      let lastStatus = 0;
      for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
        const response = await fetchFn(url, {
          headers: { "User-Agent": "AI4Math-Research-Tracker/0.1" },
        });

        if (!response.ok) {
          lastStatus = response.status;
          // Only throttling/transient statuses are worth a retry.
          const retryable = response.status === 429 || response.status === 503;
          if (!retryable || attempt === RETRY_DELAYS_MS.length) break;
          await sleep(RETRY_DELAYS_MS[attempt]);
          continue;
        }

        const xml = await response.text();
        const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
        const items = entries
          .map(parseArxivEntry)
          .filter((item): item is RawResearchItem => item !== null);
        return since
          ? items.filter((item) => !item.publishedAt || item.publishedAt >= since)
          : items;
      }

      throw new Error(
        `arXiv API returned ${lastStatus} after ${RETRY_DELAYS_MS.length} retries`
      );
    },
  };
}

export const arxivSource = createArxivSource();

