import type { EventType, RawResearchItem, ResearchArea, SourceTier } from "@/types";
import { arxivSource } from "./arxiv";
import { githubSource } from "./github";
import { OFFICIAL_SOURCE_DEFINITIONS, createOfficialSource } from "./catalog";

/**
 * Unified data-input interface (ResearchSource).
 *
 * The offline mock remains the default pipeline source. Live arXiv, GitHub and
 * official catalog sources are opt-in through the manual sync endpoint.
 */
export interface ResearchSource {
  id: string;
  label: string;
  /** Source-level fallback classification used when the generic classifier rejects a category-specific item. */
  defaultEventType?: EventType;
  defaultResearchArea?: ResearchArea;
  /** Editorial evidence tier this source belongs to; the sync UI groups sources into S1-S5 boards. */
  sourceTier?: SourceTier;
  /** Returns unprocessed items newest first; `since` enables incremental manual sync. */
  fetchRecent(options?: { limit?: number; since?: string }): Promise<RawResearchItem[]>;
}

const MOCK_RAW_ITEMS: RawResearchItem[] = [
  {
    id: "raw-001",
    title: "Scaling Automated Proofs for Lean 4 with Process-Supervised Search",
    abstract:
      "We present a search procedure that combines process reward models with tactic-level search " +
      "for Lean 4, improving success on a held-out set of undergraduate-level theorems and reducing " +
      "proof replay failures.",
    url: "",
    source: "demo (synthetic item)",
    publishedAt: "2025-03-01",
    authors: ["A. Researcher", "B. Mathematician"],
  },
  {
    id: "raw-002",
    title: "A Benchmark for Agentic Problem Solving in Olympiad Geometry",
    abstract:
      "We introduce a benchmark of olympiad geometry problems requiring multi-step tool use, and " +
      "show that current agents fail on problems needing auxiliary construction.",
    url: "",
    source: "demo (synthetic item)",
    publishedAt: "2025-03-05",
    authors: ["C. Geometer"],
  },
  {
    id: "raw-003",
    title: "An improved convolution bound for Toeplitz operators",
    abstract: "A pure analysis result with no machine learning component.",
    url: "",
    source: "demo (synthetic item)",
    publishedAt: "2025-03-06",
  },
];

/** Mock source used by the agent pipeline demo (POST /api/agents/ingest). */
export const mockResearchSource: ResearchSource = {
  id: "mock",
  label: "Mock Research Source (demo)",
  async fetchRecent(options = {}) {
    const limit = options.limit ?? MOCK_RAW_ITEMS.length;
    return MOCK_RAW_ITEMS.slice(0, limit);
  },
};

/** Default sources for `runPipeline()` — offline, deterministic demos. */
export const researchSources: ResearchSource[] = [mockResearchSource];

/**
 * Live sources hit the public internet, so they remain opt-in through the
 * manual `/sources` page or POST /api/agents/ingest. No scheduler is implied.
 */
const officialSources = OFFICIAL_SOURCE_DEFINITIONS.map(createOfficialSource);

export const liveResearchSources: Record<string, ResearchSource> = {
  arxiv: arxivSource,
  github: githubSource,
  ...Object.fromEntries(officialSources.map((source) => [source.id, source])),
};

export type LiveSourceId = string;

