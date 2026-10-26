import type { EventType, RawResearchItem, ResearchArea, SourceType, SourceTier } from "@/types";
import type { ResearchSource } from "./index";

export interface RssSourceOptions {
  id: string;
  label: string;
  feedUrl: string;
  sourceType?: SourceType;
  defaultEventType?: EventType;
  defaultResearchArea?: ResearchArea;
  sourceTier?: SourceTier;
  allowNonAI4Math?: boolean;
  fetchFn?: typeof fetch;
  timeoutMs?: number;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(value: string): string {
  return decodeEntities(value.replace(/<[^>]+>/g, " "));
}

function safeDate(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
}

function tag(block: string, name: string): string | undefined {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return match?.[1].trim();
}

function atomLink(block: string): string | undefined {
  const match = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i);
  return match?.[1];
}

/** Parse RSS `<item>` and Atom `<entry>` blocks through one normalized shape. */
export function parseFeedBlock(block: string): {
  id?: string;
  title?: string;
  url?: string;
  publishedAt?: string;
  summary?: string;
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
    fetchFn = fetch,
  } = options;

  return {
    id,
    label,
    defaultEventType,
    defaultResearchArea,
    sourceTier,
    async fetchRecent(fetchOptions = {}) {
      const limit = fetchOptions.limit ?? 25;
      const since = fetchOptions.since;
      const response = await fetchFn(feedUrl, {
        headers: { "User-Agent": "AI4Math-Ecosystem-Radar/0.1" },
      });
      if (!response.ok) {
        throw new Error(`${label} returned HTTP ${response.status}`);
      }

      const xml = await response.text();
      const blocks = xml.match(/<(?:item|entry)[\s\S]*?<\/(?:item|entry)>/gi) ?? [];
      const items: RawResearchItem[] = [];

      for (const [index, block] of blocks.entries()) {
        const parsed = parseFeedBlock(block);
        if (!parsed.title) continue;
        if (since && parsed.publishedAt && parsed.publishedAt < since) continue;

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
          eventType: defaultEventType,
          researchArea: defaultResearchArea,
          allowNonAI4Math,
          publishedAt: parsed.publishedAt,
        });
        if (items.length >= limit) break;
      }

      return items;
    },
  };
}
