import { events } from "@/data/seed/events";
import type { ResearchEvent, SearchResult, TopicStat } from "@/types";
import { matchesQuery, sortEvents, eventSearchText } from "@/lib/utils";
import { normalizeEcosystemEvent } from "@/lib/ecosystem";
import { applyTrustModel } from "@/lib/verification";
import type { ListEventsOptions, ResearchStore, TopicDetail } from "./store";
import { buildTopicStats, searchEvents } from "./shared";
import { readIngestedEvents } from "./ingested";
import { dedupePersonStories } from "./storyDedupe";

/** Path-level URL identity; homepages are ignored so distinct events are not merged. */
function sourceKey(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.replace(/\/+$/, "");
    if (!pathname) return undefined;
    const host = parsed.hostname.replace(/^www\./, "");
    return `${host}${pathname}${parsed.search}`.toLowerCase();
  } catch {
    return undefined;
  }
}

function preferEvent(a: ResearchEvent, b: ResearchEvent): ResearchEvent {
  // Seed records omit `provenance`; they are curated by construction, so an
  // absent value must not lose to a newer automated copy of the same URL.
  const aCurated = (a.provenance ?? "curated") === "curated";
  const bCurated = (b.provenance ?? "curated") === "curated";
  if (aCurated !== bCurated) return aCurated ? a : b;
  return (b.updatedAt ?? "") > (a.updatedAt ?? "") ? b : a;
}

/**
 * Merge curated and ingested data. Slugs dedupe the same story, and the same
 * article arriving through two sources (e.g. a page source and that site's RSS
 * feed) is reduced to one card; curated prose wins over automated prose.
 */
export function mergeEvents(
  seed: ResearchEvent[],
  ingested: ResearchEvent[]
): ResearchEvent[] {
  const bySlug = new Map<string, ResearchEvent>();
  for (const event of seed) bySlug.set(event.slug, event);
  for (const event of ingested) bySlug.set(event.slug, event);

  const byUrl = new Map<string, ResearchEvent>();
  const withoutUrl: ResearchEvent[] = [];
  for (const event of bySlug.values()) {
    const key = sourceKey(event.sourceUrl);
    if (!key) {
      withoutUrl.push(event);
      continue;
    }
    const existing = byUrl.get(key);
    byUrl.set(key, existing ? preferEvent(existing, event) : event);
  }
  return dedupePersonStories([...byUrl.values(), ...withoutUrl]);
}

/**
 * SeedStore - the default data source.
 *
 * Serves the bundled dataset (data/seed/events.ts) so `npm run dev`
 * works without PostgreSQL. When DATABASE_URL is configured, PrismaStore
 * answers the same interface instead (see lib/db/index.ts).
 */
export class SeedStore implements ResearchStore {
  private readonly all: ResearchEvent[];

  constructor(seed: ResearchEvent[] = events) {
    // Curated seed data + whatever the ingest pipeline has accepted so far.
    // Trust-model fields are derived once per event when not set explicitly.
    this.all = mergeEvents(seed, readIngestedEvents())
      .map(normalizeEcosystemEvent)
      .map(applyTrustModel);
  }

  async listEvents(options: ListEventsOptions = {}): Promise<ResearchEvent[]> {
    const { eventType, area, q, evidence, tier, model, benchmark, dataset, since, year, limit } = options;
    let list = this.all;
    if (eventType) list = list.filter((e) => e.eventType === eventType);
    if (area && area.toLowerCase() !== "all") {
      list = list.filter((e) => e.researchArea === area);
    }
    if (q && q.trim()) {
      list = list.filter((e) => matchesQuery(eventSearchText(e), q));
    }
    // Evidence/source filters (AND-combined).
    if (evidence) list = list.filter((e) => e.evidenceLevel === evidence);
    if (tier) list = list.filter((e) => e.sourceTier === tier);
    // Facet filters: exact membership in the event's arrays.
    if (model) list = list.filter((e) => (e.model ?? []).includes(model));
    if (benchmark) list = list.filter((e) => (e.benchmark ?? []).includes(benchmark));
    if (dataset) list = list.filter((e) => (e.dataset ?? []).includes(dataset));
    /* Time filter (ISO dates compare lexicographically). */
    if (since) list = list.filter((e) => e.date >= since);
    if (year) list = list.filter((e) => e.date.startsWith(year));
    const sorted = sortEvents(list);
    return limit && limit > 0 ? sorted.slice(0, limit) : sorted;
  }

  async getEventBySlug(slug: string): Promise<ResearchEvent | null> {
    return this.all.find((e) => e.slug === slug) ?? null;
  }

  async listTopics(): Promise<TopicStat[]> {
    return buildTopicStats(this.all);
  }

  async getTopic(slug: string): Promise<TopicDetail | null> {
    const stat = (await this.listTopics()).find((t) => t.slug === slug);
    if (!stat) return null;
    const list = sortEvents(
      this.all.filter((e) => e.researchArea === stat.topic)
    );
    return { stat, events: list };
  }

  async search(query: string): Promise<SearchResult> {
    return searchEvents(this.all, query);
  }
}
