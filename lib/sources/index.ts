import type { RawResearchItem } from "@/types";
import { arxivSource } from "./arxiv";
import { githubSource } from "./github";

/**
 * Unified data-input interface (ResearchSource).
 *
 * MVP ships a mock source only - no crawlers. Adding arXiv / GitHub later
 * means implementing this interface and registering it in `sources`.
 */
export interface ResearchSource {
  id: string;
  label: string;
  /** Returns unprocessed items newest first. */
  fetchRecent(options?: { limit?: number }): Promise<RawResearchItem[]>;
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
 * Live sources (V2). They hit the public internet, so they are opt-in via
 * `POST /api/agents/ingest {"source": "arxiv" | "github"}` and never part of
 * the default pipeline run.
 */
export const liveResearchSources = {
  arxiv: arxivSource,
  github: githubSource,
} as const satisfies Record<string, ResearchSource>;

export type LiveSourceId = keyof typeof liveResearchSources;
