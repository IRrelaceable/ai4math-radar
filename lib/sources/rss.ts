import type { EventType, RawResearchItem, ResearchArea, SourceType, SourceTier } from "@/types";
import type { ResearchSource } from "./index";
import { sourceFetch } from "./http";

export interface RssSourceOptions {
  id: string;
  label: string;
  feedUrl: string;
  sourceType?: SourceType;
  defaultEventType?: EventType;
  defaultResearchArea?: ResearchArea;
  sourceTier?: SourceTier;
  allowNonAI4Math?: boolean;
  /**
   * Keep only items whose title/summary mentions at least one of these terms.
   * Broad ecosystem feeds (institute news, personal blogs) would otherwise feed
   * every general-science story into the tracker; this narrows them to AI/maths
   * coverage while still bypassing the paper classifier via allowNonAI4Math.
   */
  includeKeywords?: string[];
  /** Every term here must also appear (used to require both AI and maths context). */
  requireKeywords?: string[];
  /** Drop matching items (e.g. a political post on a maths blog). */
  excludeKeywords?: string[];
  /** Match keywords against the title only; picks substantive posts over passing mentions. */
  matchTitleOnly?: boolean;
  /**
   * Mixed feeds (institute news) carry several event classes. The first rule
   * whose keywords appear wins; otherwise defaultEventType applies.
   */
  eventTypeRules?: { keywords: string[]; eventType: EventType }[];
  fetchFn?: typeof fetch;
  timeoutMs?: number;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  middot: "·",
  copy: "©",
};

function decodeEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&([a-z]+);/gi, (match, name) => NAMED_ENTITIES[name.toLowerCase()] ?? match)
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(value: string): string {
  // Some feeds entity-encode their HTML ("&lt;p&gt;..."), so decode once to
  // reveal the tags, strip them, then decode whatever markup text remains.
  return decodeEntities(decodeEntities(value).replace(/<[^>]+>/g, " "));
}

/**
 * Word-start match so "math" finds "mathematics" without matching "aftermath",
 * and "AI" does not match inside "said".
 */
export function mentionsKeyword(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((keyword) => {
    const needle = keyword.toLowerCase();
    let index = lower.indexOf(needle);
    while (index !== -1) {
      const startOk = index === 0 || !/[a-z0-9]/.test(lower[index - 1]);
      // Short terms ("AI", "LLM") need a closing boundary too, otherwise
      // "aim" or "llms" would count as an AI mention.
      const end = index + needle.length;
      const endOk =
        keyword.length > 3 || end >= lower.length || !/[a-z0-9]/.test(lower[end]);
      if (startOk && endOk) return true;
      index = lower.indexOf(needle, index + 1);
    }
    return false;
  });
}

function safeDate(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
}

/** Feeds such as OpenAI's wrap every field in CDATA, which stripHtml would eat. */
function unwrapCdata(value: string): string {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}

function tag(block: string, name: string): string | undefined {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return match ? unwrapCdata(match[1]).trim() : undefined;
}

function atomLink(block: string): string | undefined {
  const match = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i);
  return match?.[1];
}

/**
 * Feeds put either a person or the publishing desk in `<dc:creator>` — MIT
 * News ships "Adam Zewe | MIT News" and "School of Science" side by side.
 * Keep the name before the pipe, drop desk/org/role labels: an org listed as
 * an author would be a name the source never attributed to anyone.
 */
const ORG_LABEL = /\b(news|office|school|department|dept|college|university|institute|cent(?:er|re)|laborator(?:y|ies)|labs?|team|staff|editorial|communications|community|program(?:me)?|foundation|society|group|division|faculty|media|desk|press|magazine|journal|review|secretary|coordinator|administrator|administration|manager|officer|president|provost|dean)\b/i;

function authorName(raw?: string): string | undefined {
  if (!raw) return undefined;
  // RSS 2.0 writes `email (Name)`; Atom wraps the name in <name>.
  const inner = raw.match(/<name[^>]*>([\s\S]*?)<\/name>/i)?.[1] ?? raw;
  const parenthesized = inner.match(/\(([^)]+)\)/)?.[1];
  const value = stripHtml(parenthesized ?? inner).split("|")[0].replace(/\s+/g, " ").trim();
  if (!value || ORG_LABEL.test(value)) return undefined;
  // WordPress emits the login handle ("gowers", "sjziemen") for some blogs;
  // a byline with no capital is an account name, not a person.
  if (/^[a-z0-9._-]+$/.test(value)) return undefined;
  return value;
}

function feedAuthors(block: string): string[] {
  const candidates = [
    tag(block, "dc:creator"),
    tag(block, "creator"),
    tag(block, "itunes:author"),
    tag(block, "author"),
  ];
  const names = candidates.map(authorName).filter((name): name is string => Boolean(name));
  return [...new Set(names)];
}

/** Parse RSS `<item>` and Atom `<entry>` blocks through one normalized shape. */
export function parseFeedBlock(block: string): {
  id?: string;
  title?: string;
  url?: string;
  publishedAt?: string;
  summary?: string;
  authors?: string[];
} {
  const rawTitle = tag(block, "title");
  const link = atomLink(block) ?? tag(block, "link");
  const date =
    tag(block, "pubDate") ??
    tag(block, "published") ??
    tag(block, "updated") ??
    tag(block, "dc:date");
  const summary =
    tag(block, "description") ??
    tag(block, "summary") ??
    tag(block, "content") ??
    tag(block, "content:encoded");

  return {
    id: tag(block, "guid") ?? link,
    title: rawTitle ? stripHtml(rawTitle) : undefined,
    url: link ? decodeEntities(link) : undefined,
    publishedAt: safeDate(date),
    summary: summary ? stripHtml(summary) : undefined,
    authors: feedAuthors(block),
  };
}

export function createRssSource(options: RssSourceOptions): ResearchSource {
  const {
    id,
    label,
    feedUrl,
    sourceType = "news",
    defaultEventType,
    defaultResearchArea,
    sourceTier,
    allowNonAI4Math = false,
    includeKeywords,
    requireKeywords,
    excludeKeywords,
    matchTitleOnly = false,
    eventTypeRules,
    fetchFn = sourceFetch,
    timeoutMs = 20_000,
  } = options;

  const get = (url: string) =>
    fetchFn(url, {
      headers: { "User-Agent": "AI4Math-Ecosystem-Radar/0.1" },
      signal: AbortSignal.timeout(timeoutMs),
    });

  /**
   * A feed URL that moved usually leaves its replacement in the site's own
   * `<link rel="alternate">` tag. Read it from the root page so a renamed feed
   * path heals itself instead of failing the source forever. Only run for a
   * removed path or an HTML page: auth walls and bot challenges are not moves.
   */
  async function discoverFeedUrl(): Promise<string | undefined> {
    let root: string;
    try {
      root = new URL("/", feedUrl).toString();
    } catch {
      return undefined;
    }
    if (root === feedUrl) return undefined;
    try {
      const response = await get(root);
      if (!response.ok) return undefined;
      const html = await response.text();
      for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
        if (!/type=["']application\/(?:rss|atom)\+xml["']/i.test(tag)) continue;
        const href = /href=["']([^"']+)["']/i.exec(tag)?.[1];
        if (!href) continue;
        const resolved = new URL(decodeEntities(href), root).toString();
        if (resolved !== feedUrl) return resolved;
      }
    } catch {
      // Discovery is best effort; the original error is the useful one.
    }
    return undefined;
  }

  return {
    id,
    label,
    defaultEventType,
    defaultResearchArea,
    sourceTier,
    async fetchRecent(fetchOptions = {}) {
      const limit = fetchOptions.limit ?? 25;
      const since = fetchOptions.since;
      let xml = "";
      let contentType = "";
      let failure: Error | undefined;
      let movedOrPage = false;

      const response = await get(feedUrl);
      if (!response.ok) {
        failure = new Error(`${label} returned HTTP ${response.status}`);
        movedOrPage = response.status === 404 || response.status === 410;
      } else {
        xml = await response.text();
        contentType = response.headers?.get?.("content-type") ?? "";
      }

      let blocks = xml.match(/<(?:item|entry)[\s\S]*?<\/(?:item|entry)>/gi) ?? [];
      // A feed URL that has moved or now serves a web page would otherwise look
      // like a successful sync with zero new items.
      if (!failure && blocks.length === 0) {
        failure = new Error(
          `${label} returned no feed items` +
            (/html/i.test(contentType) ? " (got an HTML page, not a feed)" : "") +
            `: ${feedUrl}`
        );
        movedOrPage = /html/i.test(contentType);
      }

      if (failure && movedOrPage) {
        const discovered = await discoverFeedUrl();
        if (discovered) {
          const retry = await get(discovered);
          if (retry.ok) {
            xml = await retry.text();
            blocks = xml.match(/<(?:item|entry)[\s\S]*?<\/(?:item|entry)>/gi) ?? [];
            if (blocks.length > 0) failure = undefined;
          }
        }
      }
      if (failure) throw failure;

      const items: RawResearchItem[] = [];

      for (const [index, block] of blocks.entries()) {
        const parsed = parseFeedBlock(block);
        if (!parsed.title) continue;
        if (since && parsed.publishedAt && parsed.publishedAt < since) continue;
        const keywordText = matchTitleOnly
          ? parsed.title
          : `${parsed.title} ${parsed.summary ?? ""}`;
        if (excludeKeywords?.length && mentionsKeyword(keywordText, excludeKeywords)) continue;
        if (includeKeywords?.length && !mentionsKeyword(keywordText, includeKeywords)) continue;
        if (
          requireKeywords?.length &&
          !requireKeywords.every((k) => mentionsKeyword(keywordText, [k]))
        ) {
          continue;
        }

        const rule = eventTypeRules?.find((entry) =>
          mentionsKeyword(keywordText, entry.keywords)
        );

        items.push({
          id: parsed.id ?? `${id}-${index}`,
          externalId: parsed.id,
          sourceId: id,
          title: parsed.title,
          abstract: parsed.summary,
          url: parsed.url,
          source: label,
          sourceType,
          sourceTier,
          eventType: rule?.eventType ?? defaultEventType,
          researchArea: defaultResearchArea,
          allowNonAI4Math,
          publishedAt: parsed.publishedAt,
          authors: parsed.authors,
        });
        if (items.length >= limit) break;
      }

      return items;
    },
  };
}
