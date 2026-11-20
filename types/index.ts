/**
 * Core domain types for the AI4Math Ecosystem Radar.
 *
 * The platform's primary data unit is the ResearchEvent ("something worth
 * tracking happened in AI4Math"), NOT a paper. Papers, models, benchmarks,
 * datasets and related works are attached to an event.
 */

export const RESEARCH_AREAS = [
  "Theorem Proving & Formal Mathematics",
  "Mathematical Reasoning & LLMs",
  "Mathematical Agents",
  "Mathematical Discovery & Symbolic Computation",
  "Geometry",
  "Benchmarks & Datasets",
] as const;

export type ResearchArea = (typeof RESEARCH_AREAS)[number];

/**
 * Direction axis, orthogonal to researchArea: what the work is about and what
 * it actually delivers. "ai4math" = the object/deliverable is mathematics
 * (proofs, conjectures, formal corpora, math-specialized models, datasets and
 * benchmarks); "math4ai" = a reusable AI method, theory or algorithm, with
 * mathematics as the method or testbed; "both" = co-primary.
 * Ecosystem events carry no direction, same rule as researchArea; research
 * events outside both sides are left without a direction.
 */
export type EventDirection = "ai4math" | "math4ai" | "both";

/**
 * Frontier labs with a dedicated track under /labs. The track collects the
 * lab's own AI4Math work (results, released artifacts, solved problems), so a
 * record carries a lab only when the lab is the actor, not merely the venue.
 */
export const LABS = ["openai", "anthropic", "deepmind"] as const;
export type Lab = (typeof LABS)[number];

/**
 * Controlled sub-area vocabulary, per research area.
 *
 * Sub-areas used to be free text, which fragmented one concept across many
 * one-off labels (four variants of "autoformalization", "Lean" vs "Lean 4",
 * "premise selection" vs "premise selection tooling"). Each governed area now
 * declares a small closed set; the seed-integrity test asserts every event's
 * `subArea` is one of them. An area absent from this map is not yet governed
 * and keeps free-form sub-areas until it is migrated.
 */
export const CONTROLLED_SUB_AREAS: Partial<Record<ResearchArea, readonly string[]>> = {
  "Theorem Proving & Formal Mathematics": [
    "Proof search",
    "Prover tooling & interaction",
    "Agent-based proving",
    "Autoformalization",
    "Formal corpora & libraries",
    "Proof assistant tooling",
  ],
  "Mathematical Reasoning & LLMs": [
    "Prompting & decoding",
    "Process supervision",
    "Competition-level reasoning",
    "Tool & code integration",
    "Math-specialized models",
    "Reasoning & self-improvement",
  ],
  "Mathematical Agents": [
    "Autonomous research agents",
    "Multi-agent discovery",
    "Automated ideation & review",
    "Agent evaluation & peer review",
    "Engineering & tool agents",
  ],
  "Mathematical Discovery & Symbolic Computation": [
    "Algorithm & program search",
    "AI-proved results & conjectures",
    "Verification & corpus scrutiny",
    "Equation solving & discovery",
    "Symbolic benchmark",
  ],
  Geometry: [
    "Geometry formalization",
    "Geometry problem solving",
    "Multimodal geometry",
  ],
  "Benchmarks & Datasets": [
    "Formal proving benchmarks",
    "Competition & olympiad benchmarks",
    "Math word problem datasets",
    "Theorem & multimodal benchmarks",
  ],
};


/**
 * Relative time windows offered by the feed's time filter. The dropdown also
 * lists concrete years, derived from the data at render time.
 */
export const TIME_WINDOWS = ["30d", "90d", "180d", "365d"] as const;
export type TimeWindow = (typeof TIME_WINDOWS)[number];

/** "30d" -> "2026-09-21" (UTC, day precision). */
export function windowStartDate(window: TimeWindow, now = new Date()): string {
  const days = Number(window.replace("d", ""));
  const d = new Date(now.getTime());
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export type SourceType =
  | "arxiv"
  | "blog"
  | "conference"
  | "github"
  | "demo"
  | "news"
  | "funding"
  | "education"
  | "policy";

/**
 * Trust-model fields describe how well a claim is corroborated and where its
 * evidence comes from — deliberately objective, observable properties. Any
 */

/**
 * Where a result stands in the publication process — a separate axis from
 * evidence. Derived fully automatically from source links: an arXiv link means
 * preprint; a proceedings/publisher record means published. No link pattern
 * establishes acceptance, withdrawal or non-publication, so those stages are
 * not modelled; an event with neither link simply has no status.
 */
export const PUBLICATION_STATUSES = ["preprint", "published"] as const;
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

/** An append-only correction to a formally published record (erratum/corrigendum). */
export interface PublicationCorrection {
  date: string;
  note: string;
  /** Chinese note for the zh UI; English stays the source text. */
  noteZh?: string;
  /** Link to the original erratum / corrigendum notice. */
  sourceUrl?: string;
}

/**
 * How the source attributes the reported research work between AI systems and humans.
 * Unmarked events have no `aiRole` yet; missing means "not audited", never an
 * enum value. All four levels are assigned after checking the source.
 */
export const AI_ROLE_LEVELS = [
  "autonomous",
  "assisted",
  "unclear",
  "not_applicable",
] as const;
export type AiRoleLevel = (typeof AI_ROLE_LEVELS)[number];

export interface AiRole {
  level: AiRoleLevel;
  /** Code, proofs, formalization, hypotheses, experiments, autonomous research, etc. */
  description?: string;
}

/** How mature the public evidence is: claim -> record -> artifact -> replay. */
export const EVIDENCE_LEVELS = ["E0", "E1", "E2", "E3"] as const;
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];

/** Where the evidence comes from: primary research -> official -> independent -> media -> community. */
export const SOURCE_TIERS = ["S0", "S1", "S2", "S3", "S4"] as const;
export type SourceTier = (typeof SOURCE_TIERS)[number];

/** Canonical definition of each source type. Single source of truth for labels/scope. */
export const SOURCE_TIER_DEFINITIONS: Record<
  SourceTier,
  { zh: string; en: string; scopeZh: string; scopeEn: string }
> = {
  S0: {
    zh: "原始研究记录",
    en: "Primary research record",
    scopeZh: "论文、预印本、正式研究记录、原始代码等",
    scopeEn: "Papers, preprints, formal research records, original code",
  },
  S1: {
    zh: "官方公告",
    en: "Official announcement",
    scopeZh: "研究机构、实验室、企业和作者的官方公告",
    scopeEn: "Official announcements from institutions, labs, companies and authors",
  },
  S2: {
    zh: "独立学术佐证",
    en: "Independent academic corroboration",
    scopeZh: "独立学术复核、独立研究报告、独立复现实验",
    scopeEn: "Independent academic review, reports and replication studies",
  },
  S3: {
    zh: "科技媒体报道",
    en: "Technology media report",
    scopeZh: "科技媒体、新闻报道",
    scopeEn: "Technology press and news reporting",
  },
  S4: {
    zh: "社区线索",
    en: "Community lead",
    scopeZh: "社区讨论、社交媒体线索等",
    scopeEn: "Community discussion and social-media leads",
  },
};

/**
 * A single source attached to an event or update.
 * `tier` is the S0–S4 source type; `sourceType` (arxiv/blog/...) remains the
 * channel on the event itself to avoid a naming collision.
 */
export interface Source {
  title?: string;
  url: string;
  publishedAt?: string;
  tier: SourceTier;
  collectedAt?: string;
}


/**
 * The five primary ecosystem event classes.
 * Legacy `Education` records normalize into `Institutions` (see
 * normalizeEventType), so education events remain a distinct branch of
 * institution metadata rather than their own top-level class.
 */
export const EVENT_TYPES = [
  "Research",
  "People",
  "Institutions",
  "Funding",
  "PolicyCommunity",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

/**
 * Names stated in the source, extracted for cross-event threads. Kept apart
 * from `metadata` (which describes an ecosystem event's own subject) and from
 * `authors` (a feed byline belongs to the publisher, not the announcement).
 */
export interface EventEntities {
  people?: string[];
  institutions?: string[];
  projects?: string[];
  systems?: string[];
}

/** Type-specific details stored as JSON in Prisma and plain data in the demo store. */
export interface EcosystemMetadata {
  people?: { name: string; role?: string; viewpoint?: string }[];
  initiatives?: string[];
  projects?: string[];
  funding?: {
    organization?: string;
    recipient?: string;
    amount?: string;
    currency?: string;
    amountDisclosure?: string;
  };
  education?: {
    institution?: string;
    department?: string;
    courseName?: string;
    courseCode?: string;
    instructor?: string;
    period?: string;
    description?: string;
  };
  policy?: {
    kind?: string;
    community?: string;
    issue?: string;
    participants?: string[];
  };
}

export type RelationType = "previous" | "followup" | "related";

export interface RelatedWork {
  title: string;
  url?: string;
  relation: RelationType;
  note?: string;
}

/**
 * A source record's place in a durable Event. "report" marks a media re-report:
 * it adds a Source to the Event but never a timeline Update. Links are
 * append-only: later ingests add records instead of rewriting earlier ones.
 */
export const EVENT_UPDATE_KINDS = [
  "initial",
  "followup",
  "verification",
  "correction",
  "retraction",
  "report",
] as const;
export type EventUpdateKind = (typeof EVENT_UPDATE_KINDS)[number];

/** The four tracking relations; only same-event appends an Update. */
export const EVENT_RELATIONS = [
  "same-event",
  "same-project",
  "related-event",
  "independent",
] as const;
export type EventRelation = (typeof EVENT_RELATIONS)[number];

export const RELATED_KINDS = ["reproduction", "overturn", "related"] as const;
export type RelatedKind = (typeof RELATED_KINDS)[number];

/** Editorial explanation of the specific result and the sources supporting the link. */
export interface EventTrackingNote {
  text: { zh: string; en: string };
  references: { title: { zh: string; en: string }; url: string }[];
}

export interface EventLink {
  /** Stable Event id, distinct from a source record's slug. */
  eventId: string;
  kind: EventUpdateKind;
  relation: EventRelation;
  /** How the assignment was made; curated assignments are never overwritten. */
  matchedBy: "seed" | "heuristic" | "llm" | "curated";
  /** Candidate source record that established a non-initial match, if any. */
  matchedToSlug?: string;
  reason?: string;
  /** Shown on the timeline step or, when relatedTo is set, on the relation. */
  note?: EventTrackingNote;
  /** same-project: the new Event belongs to this Project. */
  projectId?: string;
  /** related-event: an explicit edge to another Event, never a merge. */
  relatedTo?: { eventId: string; kind: RelatedKind; reason?: string };
}

/** A project with a shared goal or research inheritance; never force-created. */
export interface Project {
  id: string;
  name: string;
  aliases?: string[];
  desc: { zh: string; en: string };
}

/** A publication attached to a ResearchEvent (many-to-many in the database). */
export interface Paper {
  title: string;
  url?: string;
  venue?: string;
  year?: number;
}

/** Display translation attached at ingest time; English stays the source text. */
export interface EventTranslation {
  title?: string;
  summary?: string;
  significance?: string;
  /** Chinese prose inside ecosystem metadata (roles, initiatives, issues …). */
  metadata?: EcosystemMetadata;
  /** Chinese counterpart of `aiRole.description`. */
  aiRoleDescription?: string;
  /** Chinese counterpart of `humanContribution`. */
  humanContribution?: string;
}

export interface ResearchEvent {
  id: string;
  title: string;
  slug: string;
  /** What happened - short card summary. */
  summary: string;
  /** Why does it matter - shown as its own block on every page. */
  significance: string;
  /** ISO date, YYYY-MM-DD (day precision; month precision is stored as YYYY-MM-01). */
  date: string;
  /**
   * Frontier lab whose own AI4Math work this record belongs to. The lab track
   * (see /labs) groups on it; ordinary paper, ecosystem and blog events leave
   * it unset.
   */
  lab?: Lab;
  /**
   * Research direction (one of RESEARCH_AREAS). Optional: ecosystem events
   * (People / Institutions / Funding / PolicyCommunity) record an event class
   * instead of a research direction, so they carry no `researchArea`.
   */
  researchArea?: ResearchArea;
  subArea?: string;
  /** Direction axis (see EventDirection); assigned by the pipeline, absent on ecosystem events. */
  direction?: EventDirection;
  sourceType: SourceType;
  sourceUrl: string;
  /** All sources attached to this event; derived from links when absent. */
  sources?: Source[];
  paperUrl?: string;
  githubUrl?: string;
  papers?: Paper[];
  authors: string[];
  institution?: string;
  model?: string[];
  benchmark?: string[];
  dataset?: string[];
  relatedWorks: RelatedWork[];
  /** Parent Event and this record's place in its progress log. */
  tracking?: EventLink;
  /** Bullet list for the "Key Contribution" section. */
  keyContributions?: string[];
  /** The problem this work addresses. */
  problem?: string;
  /** True for data that must be treated as demo/example content. */
  isDemo?: boolean;

  /* ---- trust model (all optional; derived by lib/verification when absent) ---- */
  evidenceLevel?: EvidenceLevel;
  sourceTier?: SourceTier;
  /** Publication stage, derived from links at read time; never manually annotated. */
  publicationStatus?: PublicationStatus;
  /** Errata / corrigenda appended after formal publication. */
  publicationCorrections?: PublicationCorrection[];
  /** How the source divides the reported work between AI and humans. */
  aiRole?: AiRole;
  /** What named humans contributed, in the source's terms. */
  humanContribution?: string;
  /** Primary ecosystem class. Normalized to Research when absent in legacy data. */
  eventType?: EventType;
  /** Type-specific ecosystem details; represented as JSON by Prisma. */
  metadata?: EcosystemMetadata;
  /** Named people / institutions / projects / systems stated by the source. */
  entities?: EventEntities;
  /** "curated" = hand-curated entry; "automated" = produced by the ingest pipeline. */
  provenance?: "curated" | "automated";
  /**
   * Machine translation written by the ingest pipeline. Kept next to the
   * English source instead of the static seed overlay, because automated prose
   * changes on every re-sync.
   */
  translations?: { zh?: EventTranslation };
  /** ISO timestamps of the last automated sync, when provenance is automated. */
  lastSyncedAt?: string;

  createdAt: string;
  updatedAt: string;
}

/** The two derived classification facets of one record (see lib/dimensions). */
export interface EventFacets {
  cap?: string;
  math: string[];
}

/**
 * Reader-facing "what is currently collected" for one list card. `count` is
 * the number of source records currently in this Event line, including media
 * re-reports (i.e. TrackedEvent.progress.length), NOT the number of timeline
 * updates. It describes the current archive state, never a claim about whether
 * the real-world event has future developments.
 */
export interface TrackingSummary {
  eventId: string;
  count: number;
}

/**
 * The part of an event every list surface needs (feed, timeline, topic
 * archive, search). Detail-only prose and provenance stay on the server so the
 * static dataset sent to the browser stays small.
 */
export type ListEvent = Pick<
  ResearchEvent,
  | "id"
  | "slug"
  | "title"
  | "summary"
  | "significance"
  | "date"
  | "eventType"
  | "researchArea"
  | "subArea"
  | "direction"
  | "lab"
  | "sourceUrl"
  | "sources"
  | "paperUrl"
  | "githubUrl"
  | "papers"
  | "authors"
  | "institution"
  | "model"
  | "benchmark"
  | "dataset"
  | "evidenceLevel"
  | "sourceTier"
  | "publicationStatus"
  | "publicationCorrections"
  | "tracking"
> & {
  /** Set only when the record belongs to a published (tracked) Event. */
  eventId?: string;
  /** Current collection state of this record's Event line; on every card. */
  trackingSummary: TrackingSummary;
  /**
   * Derived from the RAW record at build time — before localization and
   * summary truncation — so every surface shares the same facet caliber.
   */
  facets: EventFacets;
};

export type EntityKind = "person" | "institution" | "project" | "system";

/** One entity's cross-event timeline, oldest first. */
export interface EntityThread {
  kind: EntityKind;
  /** Stable id: kind + normalized name. */
  key: string;
  /** Most common spelling in the thread. */
  name: string;
  events: ResearchEvent[];
}

/** A public, durable Event assembled from one or more source records. */
export interface TrackedEvent {
  id: string;
  title: string;
  summary: string;
  startedAt: string;
  latestAt: string;
  researchArea?: ResearchArea;
  eventType?: EventType;
  entities: EventEntities;
  /** Every attached source record, including media re-reports. */
  progress: EventUpdate[];
  projectId?: string;
  relations: EventRelationEdge[];
}

/** One append-only step; kind "report" is source-only, not an Update. */
export interface EventUpdate {
  id: string;
  eventId: string;
  eventSlug: string;
  date: string;
  kind: EventUpdateKind;
  title: string;
  summary: string;
  sourceUrl: string;
  /** All sources for this update; derived from sourceUrl when absent. */
  sources?: Source[];
  evidenceLevel?: EvidenceLevel;
  publicationStatus?: PublicationStatus;
  note?: EventTrackingNote;
}

export interface EventRelationEdge {
  fromEventId: string;
  toEventId: string;
  kind: RelatedKind;
  reason?: string;
  note?: EventTrackingNote;
}

/**
 * Build-time dataset consumed by the client-rendered lists. One file per
 * language under public/data; a static export cannot answer queries.
 */
export interface StaticDataset {
  generatedAt: string;
  events: ListEvent[];
  topics: TopicStat[];
  sourceStats?: SourceStats;
}

/** Two distinct counts per source type: source records vs. distinct events. */
export interface SourceStats {
  /** Total number of source records across all events. */
  totalSources: number;
  /** Per-tier breakdown. */
  byTier: Record<
    SourceTier,
    { sources: number; events: number }
  >;
}

export interface TopicStat {
  topic: string;
  slug: string;
  count: number;
  latestDate: string;
  models: string[];
  benchmarks: string[];
}

export interface SearchGroup {
  kind: "event" | "paper" | "topic" | "model" | "benchmark";
  title: string;
  subtitle?: string;
  href: string;
}

export interface SearchResult {
  query: string;
  groups: SearchGroup[];
  total: number;
}

/** Shape of an unprocessed item entering the agent pipeline (stage 1). */
export interface RawResearchItem {
  /** Optional source-provided ecosystem classification and stable identity. */
  sourceId?: string;
  externalId?: string;
  sourceType?: SourceType;
  sourceTier?: SourceTier;
  /** Set by sources that publish a frontier lab's own work (see LABS). */
  lab?: Lab;
  eventType?: EventType;
  researchArea?: ResearchArea;
  /** Explicitly opt a source-specific item out of the generic AI4Math gate. */
  allowNonAI4Math?: boolean;
  id: string;
  title: string;
  abstract?: string;
  url?: string;
  source: string;
  publishedAt?: string;
  authors?: string[];
  githubUrl?: string;
}
