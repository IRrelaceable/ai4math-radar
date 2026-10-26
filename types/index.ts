/**
 * Core domain types for the AI4Math Ecosystem Radar.
 *
 * The platform's primary data unit is the ResearchEvent ("something worth
 * tracking happened in AI4Math"), NOT a paper. Papers, models, benchmarks,
 * datasets and related works are attached to an event.
 */

export const RESEARCH_AREAS = [
  "Mathematical Reasoning",
  "Theorem Proving",
  "Formal Mathematics",
  "Mathematical Discovery",
  "Geometry",
  "Symbolic Mathematics",
  "Mathematical Agents",
  "LLM for Mathematics",
  "Benchmarks & Datasets",
  "AI-assisted Research",
] as const;

export type ResearchArea = (typeof RESEARCH_AREAS)[number];


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

/** Human review state for automated/manual ecosystem events. */
export const REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

/**
 * Trust-model fields describe how well a claim is corroborated and where its
 * evidence comes from — deliberately objective, observable properties. Any
 * optional importance score stays outside this model and must be labelled as
 * a subjective AI-assisted assessment.
 */

/** How far the core event description is corroborated right now. */
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

/** How mature the public evidence is: claim -> record -> artifact -> replay. */
export const EVIDENCE_LEVELS = ["E0", "E1", "E2", "E3", "E4"] as const;
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];

/** Where the evidence comes from: primary research -> official -> independent -> media -> community. */
export const SOURCE_TIERS = ["S1", "S2", "S3", "S4", "S5"] as const;
export type SourceTier = (typeof SOURCE_TIERS)[number];

/**
 * Editorial importance, deliberately coarse so it never fakes precision.
 * Three tiers — a historical turning point, a field milestone, or context —
 * rather than a 0-100 number, because no one can defend "86 rather than 89".
 * This stays OUTSIDE the objective trust model and is always labelled
 * subjective; absent tier means "not assessed", never a default rank.
 */
export const IMPORTANCE_TIERS = ["H1", "H2", "H3"] as const;
export type ImportanceTier = (typeof IMPORTANCE_TIERS)[number];

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
  status: VerificationStatus;
  evidenceLevel: EvidenceLevel;
  note?: string;
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
  researchArea: ResearchArea;
  subArea?: string;
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
  verificationStatus?: VerificationStatus;
  evidenceLevel?: EvidenceLevel;
  sourceTier?: SourceTier;
  verificationHistory?: VerificationRecord[];
  /** Primary ecosystem class. Normalized to Research when absent in legacy data. */
  eventType?: EventType;
  /** Optional legacy research subtype (Discovery, Proof, Benchmark, ...). */
  researchEventType?: ResearchEventType;
  /** Type-specific ecosystem details; represented as JSON by Prisma. */
  metadata?: EcosystemMetadata;
  /** Optional editorial importance tier (H1/H2/H3), subjective — never an objective metric. */
  importanceTier?: ImportanceTier;
  importanceNote?: string;
  /** "curated" = hand-verified entry; "automated" = produced by the ingest pipeline. */
  provenance?: "curated" | "automated";
  /** pending = automated item awaiting human confirmation; curated defaults to approved. */
  reviewStatus?: ReviewStatus;
  /** ISO timestamps of the last automated sync, when provenance is automated. */
  lastSyncedAt?: string;

  createdAt: string;
  updatedAt: string;
}

/** Normalized shape returned by every API route (camelCase, arrays kept as arrays). */
export type ResearchEventDTO = ResearchEvent;

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





