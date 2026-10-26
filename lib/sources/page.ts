import type { EventType, RawResearchItem, ResearchArea, SourceType, SourceTier } from "@/types";
import type { ResearchSource } from "./index";

export interface PageSourceOptions {
  id: string;
  label: string;
  url: string;
  sourceType?: SourceType;
  defaultEventType?: EventType;
  defaultResearchArea?: ResearchArea;
  sourceTier?: SourceTier;
  allowNonAI4Math?: boolean;
  fetchFn?: typeof fetch;
}

function decode(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function matchValue(html: string, pattern: RegExp): string | undefined {
  const match = html.match(pattern);
  return match?.[1] ? decode(match[1]) : undefined;
}

/**
 * A lightweight official-page source for pages without a stable RSS feed.
 * It records the current page title/description and deduplicates by URL slug;
 * it intentionally does not invent a publication date.
 */
export function createPageSource(options: PageSourceOptions): ResearchSource {
  const {
    id,
    label,
    url,
    sourceType = "news",
    defaultEventType,
    defaultResearchArea,
    sourceTier,
    allowNonAI4Math = false,
    fetchFn = fetch,
  } = options;

  return {
    id,
    label,
    defaultEventType,
    defaultResearchArea,
    sourceTier,
    async fetchRecent(fetchOptions = {}) {
      const since = fetchOptions.since;
      const response = await fetchFn(url, {
        headers: { "User-Agent": "AI4Math-Ecosystem-Radar/0.1" },
      });
      if (!response.ok) {
        throw new Error(`${label} returned HTTP ${response.status}`);
      }

      const html = await response.text();
      const title =
        matchValue(html, /<title[^>]*>([\s\S]*?)<\/title>/i) ?? label;
      const description =
        matchValue(
          html,
          /<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)["']/i
        ) ??
        matchValue(
          html,
          /<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["'](?:description|og:description)["']/i
        );
      const publishedAt = matchValue(
        html,
        /<meta[^>]+(?:property|name)=["']article:published_time["'][^>]+content=["']([^"']+)["']/i
      )?.slice(0, 10);

      if (since && publishedAt && publishedAt < since) return [];

      const item: RawResearchItem = {
        id: `${id}:${url}`,
        externalId: url,
        sourceId: id,
        title,
        abstract: description,
        url,
        source: label,
        sourceType,
        eventType: defaultEventType,
        researchArea: defaultResearchArea,
        allowNonAI4Math,
        publishedAt,
      };
      return fetchOptions.limit && fetchOptions.limit > 0 ? [item].slice(0, fetchOptions.limit) : [item];
    },
  };
}


