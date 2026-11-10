import type { EventType, Lab, RawResearchItem, ResearchArea, SourceType, SourceTier } from "@/types";
import type { ResearchSource } from "./index";
import { sourceFetch } from "./http";
import { mentionsKeyword } from "./rss";

export interface SitemapSourceOptions {
  id: string;
  label: string;
  /** sitemap.xml or a sitemap index; child sitemaps are followed one level. */
  sitemapUrl: string;
  /** Keep only URLs whose pathname matches (article sections vs site chrome). */
  pathPattern?: RegExp;
  sourceType?: SourceType;
  defaultEventType?: EventType;
  defaultResearchArea?: ResearchArea;
  sourceTier?: SourceTier;
  /** Frontier lab whose own work this site publishes (see /labs). */
  lab?: Lab;
  allowNonAI4Math?: boolean;
  includeKeywords?: string[];
  excludeKeywords?: string[];
  /** Match keywords against the headline only; picks substantive posts over passing mentions. */
  matchTitleOnly?: boolean;
  eventTypeRules?: { keywords: string[]; eventType: EventType }[];
  /** Pages read per run after date filtering; each page costs one request. */
  maxPages?: number;
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

function decode(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&([a-z]+);/gi, (match, name) => NAMED_ENTITIES[name.toLowerCase()] ?? match)
    .replace(/\s+/g, " ")
    .trim();
}

function meta(html: string, keys: string[]): string | undefined {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const name = /(?:name|property)=["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase();
    if (!name || !keys.includes(name)) continue;
    const content = /content=["']([^"']*)["']/i.exec(tag)?.[1];
    if (content && content.trim()) return decode(content);
  }
  return undefined;
}

function stripTags(html: string): string {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

/** Reading-time excerpt: the meta description does not always mention the maths, the opening paragraph usually does. */
function excerpt(html: string, description?: string): string | undefined {
  const region =
    html.match(/<article\b[\s\S]*?<\/article>/i)?.[0] ??
    html.match(/<main\b[\s\S]*?<\/main>/i)?.[0];
  if (!region) return description;
  const text = stripTags(region);
  if (!text) return description;
  const combined =
    description && !text.toLowerCase().startsWith(description.slice(0, 40).toLowerCase())
      ? `${description} ${text}`
      : text;
  if (combined.length <= 800) return combined;
  const cut = combined.slice(0, 800);
  const end = cut.lastIndexOf(". ");
  return (end > 200 ? cut.slice(0, end + 1) : cut).trim();
}

function published(html: string, lastmod?: string): string | undefined {
  // A page can carry several <time> tags (related posts, site chrome), so the
  // article's own date wins before the document-level one, and the sitemap's
  // lastmod — a modification date — is only the last resort.
  const region =
    html.match(/<article\b[\s\S]*?<\/article>/i)?.[0] ??
    html.match(/<main\b[\s\S]*?<\/main>/i)?.[0];
  const candidates = [
    meta(html, ["article:published_time", "datepublished"]),
    region ? /<time\b[^>]*datetime=["']([^"']+)["']/i.exec(region)?.[1] : undefined,
    /<time\b[^>]*datetime=["']([^"']+)["']/i.exec(html)?.[1],
    lastmod,
  ];
  for (const value of candidates) {
    if (!value) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  return undefined;
}

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
}

/** `<urlset>` entries and `<sitemapindex>` children share the loc/lastmod shape. */
export function parseSitemapXml(xml: string): { entries: SitemapEntry[]; children: string[] } {
  const entries: SitemapEntry[] = [];
  const children: string[] = [];
  for (const block of xml.match(/<(?:url|sitemap)\b[\s\S]*?<\/(?:url|sitemap)>/gi) ?? []) {
    const loc = decode(/<loc>([\s\S]*?)<\/loc>/i.exec(block)?.[1] ?? "");
    if (!loc) continue;
    const lastmod = /<lastmod>([\s\S]*?)<\/lastmod>/i.exec(block)?.[1]?.trim();
    if (/<sitemap\b/i.test(block)) children.push(loc);
    else entries.push({ loc, lastmod });
  }
  return { entries, children };
}

/**
 * A source for sites that publish no RSS at all (Anthropic's news and research
 * pages, for example). It reads the site's sitemap for candidate URLs and their
 * `lastmod`, then fetches each new page for its headline and opening paragraph.
 *
 * The sitemap is the only index such sites expose, so the run is bounded by
 * `maxPages`; the cursor keeps later runs down to the handful of pages that
 * changed since the last sync.
 */
export function createSitemapSource(options: SitemapSourceOptions): ResearchSource {
  const {
    id,
    label,
    sitemapUrl,
    pathPattern,
    sourceType = "news",
    defaultEventType,
    defaultResearchArea,
    sourceTier,
    lab,
    allowNonAI4Math = false,
    includeKeywords,
    excludeKeywords,
    matchTitleOnly = false,
    eventTypeRules,
    maxPages = 10,
    fetchFn = sourceFetch,
    timeoutMs = 20_000,
  } = options;

  const get = (url: string) =>
    fetchFn(url, {
      headers: { "User-Agent": "AI4Math-Ecosystem-Radar/0.1" },
      signal: AbortSignal.timeout(timeoutMs),
    });

  async function readSitemap(url: string, depth = 0): Promise<SitemapEntry[]> {
    const response = await get(url);
    if (!response.ok) throw new Error(`${label} sitemap returned HTTP ${response.status}`);
    const { entries, children } = parseSitemapXml(await response.text());
    if (depth > 0 || children.length === 0) return entries;
    const nested: SitemapEntry[] = [];
    for (const child of children.slice(0, 20)) {
      nested.push(...(await readSitemap(child, depth + 1)));
    }
    return nested;
  }

  return {
    id,
    label,
    defaultEventType,
    defaultResearchArea,
    sourceTier,
    async fetchRecent(fetchOptions = {}) {
      const since = fetchOptions.since;
      const limit = fetchOptions.limit && fetchOptions.limit > 0 ? fetchOptions.limit : maxPages;
      const all = await readSitemap(sitemapUrl);

      const seen = new Set<string>();
      const candidates = all
        .filter((entry) => {
          if (seen.has(entry.loc)) return false;
          seen.add(entry.loc);
          if (pathPattern) {
            const path = new URL(entry.loc).pathname;
            if (!pathPattern.test(path)) return false;
          }
          return true;
        })
        // A sitemap without lastmod cannot be date-filtered; it is bounded by
        // maxPages instead, and the fingerprint store dedupes the repeats.
        .filter((entry) => !(since && entry.lastmod && entry.lastmod.slice(0, 10) < since))
        .sort((a, b) => (b.lastmod ?? "").localeCompare(a.lastmod ?? ""))
        .slice(0, Math.min(maxPages, limit));

      const items: RawResearchItem[] = [];
      let failures = 0;
      for (const entry of candidates) {
        let html: string;
        try {
          const response = await get(entry.loc);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          html = await response.text();
        } catch {
          failures += 1;
          continue;
        }

        const title =
          meta(html, ["og:title", "twitter:title"]) ??
          decode(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "");
        if (!title) continue;
        const description = meta(html, ["og:description", "description", "twitter:description"]);
        const abstract = excerpt(html, description);
        if (!abstract) continue;

        const keywordText = matchTitleOnly ? title : `${title} ${abstract}`;
        if (excludeKeywords?.length && mentionsKeyword(keywordText, excludeKeywords)) continue;
        if (includeKeywords?.length && !mentionsKeyword(keywordText, includeKeywords)) continue;

        const publishedAt = published(html, entry.lastmod);
        if (since && publishedAt && publishedAt < since) continue;

        const rule = eventTypeRules?.find((candidate) =>
          mentionsKeyword(keywordText, candidate.keywords)
        );
        items.push({
          id: `${id}:${entry.loc}`,
          externalId: entry.loc,
          sourceId: id,
          title,
          abstract,
          url: entry.loc,
          source: label,
          sourceType,
          sourceTier,
          lab,
          eventType: rule?.eventType ?? defaultEventType,
          researchArea: defaultResearchArea,
          allowNonAI4Math,
          publishedAt,
        });
        if (items.length >= limit) break;
      }

      // Every page failing is a source-level error; a few 404s on stale sitemap
      // entries are normal and should not mask the pages that did load.
      if (candidates.length > 0 && failures === candidates.length) {
        throw new Error(`${label} could not read any of its ${candidates.length} sitemap pages`);
      }
      return items;
    },
  };
}
