import { events } from "@/data/seed/events";
import type { ResearchEvent, SearchResult, TopicStat } from "@/types";
import { matchesQuery, sortEvents, sortEventsByImportance, eventSearchText } from "@/lib/utils";
import { normalizeEcosystemEvent } from "@/lib/ecosystem";
import { applyTrustModel } from "@/lib/verification";
import type { ListEventsOptions, ResearchStore, TopicDetail } from "./store";
import { buildTopicStats, searchEvents } from "./shared";
import { readIngestedEvents } from "./ingested";

/**
 * SeedStore - the default data source.
 *
 * Serves the bundled demo dataset (data/seed/events.ts) so `npm run dev`
 * works without PostgreSQL. When DATABASE_URL is configured, PrismaStore
 * answers the same interface instead (see lib/db/index.ts).
 */
export class SeedStore implements ResearchStore {
  private readonly all: ResearchEvent[];

  constructor(seed: ResearchEvent[] = events) {
    // Curated seed data + whatever the ingest pipeline has accepted so far.
    // Trust-model fields are derived once per event when not set explicitly.
    this.all = [...seed, ...readIngestedEvents()]
      .map(normalizeEcosystemEvent)
      .map(applyTrustModel);
  }

  async listEvents(options: ListEventsOptions = {}): Promise<ResearchEvent[]> {
    const { eventType, area, q, status, evidence, tier, model, benchmark, dataset, since, year, sort, limit } = options;
    let list = this.all;
    if (eventType) list = list.filter((e) => e.eventType === eventType);
    if (area && area.toLowerCase() !== "all") {
      list = list.filter((e) => e.researchArea === area);
    }
    if (q && q.trim()) {
      list = list.filter((e) => matchesQuery(eventSearchText(e), q));
    }
    // Trust-model filters (AND-combined).
    if (status) list = list.filter((e) => e.verificationStatus === status);
    if (evidence) list = list.filter((e) => e.evidenceLevel === evidence);
    if (tier) list = list.filter((e) => e.sourceTier === tier);
    // Facet filters: exact membership in the event's arrays.
    if (model) list = list.filter((e) => (e.model ?? []).includes(model));
    if (benchmark) list = list.filter((e) => (e.benchmark ?? []).includes(benchmark));
    if (dataset) list = list.filter((e) => (e.dataset ?? []).includes(dataset));
    /* Time filter (ISO dates compare lexicographically). */
    if (since) list = list.filter((e) => e.date >= since);
    if (year) list = list.filter((e) => e.date.startsWith(year));
    const sorted =
      sort === "importance" ? sortEventsByImportance(list) : sortEvents(list);
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

