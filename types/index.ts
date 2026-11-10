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
 * How far the core event description is corroborated right now.
 *
 * This is a state, not a score: a paper can be released while its claim is
 * still disputed, and machine-checking a proof does not by itself settle
 * priority or acceptance. Transitions are append-only in
 * `verificationHistory`; the current state never rewrites the past.
 */
export const VERIFICATION_STATUSES = [
  "claimed",
  "paper_released",
  "under_verification",
  "partially_verified",
  "independently_verified",
  "disputed",
  "corrected",
  "retracted",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

/**
 * How the source attributes the reported work between AI systems and humans.
 * Only meaningful for Research events that report an AI-produced result.
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
  /** What the AI system did, in the source's terms. Omitted when it says nothing. */
  description?: string;
}

/** How mature the public evidence is: claim -> record -> artifact -> replay. */
export const EVIDENCE_LEVELS = ["E0", "E1", "E2", "E3", "E4"] as const;
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];

/** Where the evidence comes from: primary research -> official -> independent -> media -> community. */
export const SOURCE_TIERS = ["S0", "S1", "S2", "S3", "S4"] as const;
export type SourceTier = (typeof SOURCE_TIERS)[number];


/**
 * The five primary ecosystem event classes. Research subtypes such as
 * Discovery / Proof / Benchmark remain available as `researchEventType`.
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

/** Legacy research-only subtypes retained for provenance and research filters. */
export const RESEARCH_EVENT_TYPES = [
  "Discovery",
  "Proof",
  "Formalization",
  "Competition",
  "System",
  "Benchmark",
  "Dataset",
  "Infrastructure",
  "Commentary",
  "Controversy",
] as const;
export type ResearchEventType = (typeof RESEARCH_EVENT_TYPES)[number];

/** Primary feed chips: All + the five ecosystem classes. */
export const FEED_FILTERS = ["All", ...EVENT_TYPES] as const;
export type FeedFilter = (typeof FEED_FILTERS)[number];

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

export interface VerificationRecord {
  date: string;
  evidenceLevel: EvidenceLevel;
  /** State reached at this entry; older records may predate the vocabulary. */
  status?: VerificationStatus;
  note?: string;
  /** Chinese note for the zh UI; English stays the source text. */
  noteZh?: string;
}

export type RelationType = "previous" | "followup" | "related";

export interface RelatedWork {
  title: string;
  url?: string;
  relation: RelationType;
  note?: string;
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
  paperUrl?: string;
  githubUrl?: string;
  papers?: Paper[];
  authors: string[];
  institution?: string;
  model?: string[];
  benchmark?: string[];
  dataset?: string[];
  relatedWorks: RelatedWork[];
  /** Bullet list for the "Key Contribution" section. */
  keyContributions?: string[];
  /** The problem this work addresses. */
  problem?: string;
  /** True for data that must be treated as demo/example content. */
  isDemo?: boolean;

  /* ---- trust model (all optional; derived by lib/verification when absent) ---- */
  evidenceLevel?: EvidenceLevel;
  sourceTier?: SourceTier;
  verificationHistory?: VerificationRecord[];
  /** Current verification state; the last history entry is authoritative. */
  verificationStatus?: VerificationStatus;
  /** How the source divides the reported work between AI and humans. */
  aiRole?: AiRole;
  /** What named humans contributed, in the source's terms. */
  humanContribution?: string;
  /** Primary ecosystem class. Normalized to Research when absent in legacy data. */
  eventType?: EventType;
  /** Optional legacy research subtype (Discovery, Proof, Benchmark, ...). */
  researchEventType?: ResearchEventType;
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

/** Normalized shape returned by every API route (camelCase, arrays kept as arrays). */
export type ResearchEventDTO = ResearchEvent;

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
  | "researchEventType"
  | "researchArea"
  | "subArea"
  | "direction"
  | "sourceUrl"
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
  | "verificationStatus"
>;

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

/**
 * Build-time dataset consumed by the client-rendered lists. One file per
 * language under public/data; a static export cannot answer queries.
 */
export interface StaticDataset {
  generatedAt: string;
  events: ListEvent[];
  topics: TopicStat[];
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
