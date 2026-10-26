import type {
  EventType,
  EvidenceLevel,
  ResearchEvent,
  SearchResult,
  SourceTier,
  TopicStat,
  VerificationStatus,
} from "@/types";

export interface ListEventsOptions {
  /** Primary ecosystem class (Research, People, Institutions, ...). */
  eventType?: EventType;
  /** ResearchArea name, "all", or undefined. */
  area?: string;
  /** Free-text query matched against title/summary/fields. */
  q?: string;
  /* Trust-model filters (all optional; combined with AND when given). */
  status?: VerificationStatus;
  evidence?: EvidenceLevel;
  tier?: SourceTier;
  /* Facet filters: exact membership in the event's arrays. */
  model?: string;
  benchmark?: string;
  dataset?: string;
  /* Time filter: inclusive lower bound (ISO date) and/or calendar year. */
  since?: string;
  year?: string;
  limit?: number;
}

export interface TopicDetail {
  stat: TopicStat;
  events: ResearchEvent[];
}

/**
 * Storage contract of the platform.
 *
 * Two implementations exist:
 *  - SeedStore   - bundled demo dataset (no database required, default)
 *  - PrismaStore - PostgreSQL via Prisma (used when DATABASE_URL is set)
 *
 * Events are always returned newest-first.
 * Trust-model and facet filters are available on both implementations so the
 * feed UI behaves identically either way.
 */
export interface ResearchStore {
  listEvents(options?: ListEventsOptions): Promise<ResearchEvent[]>;
  getEventBySlug(slug: string): Promise<ResearchEvent | null>;
  listTopics(): Promise<TopicStat[]>;
  getTopic(slug: string): Promise<TopicDetail | null>;
  search(query: string): Promise<SearchResult>;
}



