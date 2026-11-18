import type { EventFacets, ResearchEvent } from "@/types";
import { slugify } from "@/lib/utils";

/**
 * The two orthogonal classification facets. All are DERIVED from the
 * immutable source record (title / summary / subArea / direction), never
 * stored, so adding or recalibrating a facet never rewrites history.
 * Derivation always runs on the RAW record: build time for list surfaces
 * (shipped as ListEvent.facets), render time for detail pages. Localized or
 * truncated display text must never feed the patterns.
 * Each facet is optional: a record is described by whichever facets apply.
 */

export type { EventFacets };

export interface FacetValue {
  id: string;
  en: string;
  zh: string;
}

/** Research-theme axis (facet key `cap`, displayed 研究主题 / research theme).
 *  Geometry and "theorem proving as a math activity" are not AI-work themes;
 *  they live on the math-topic facet. The AI side of proving (proof search,
 *  autoformalization, agent proving) stays here. */
export const CAPABILITIES: FacetValue[] = [
  { id: "reasoning-llms", en: "Mathematical Reasoning & LLMs", zh: "数学推理与大模型" },
  { id: "agents", en: "Mathematical Agents", zh: "数学智能体" },
  { id: "neuro-symbolic-proving", en: "Neuro-symbolic Proving & Autoformalization", zh: "神经符号证明与自动形式化" },
  { id: "foundations-of-ai", en: "Mathematical Foundations of AI", zh: "AI 的数学基础理论" },
  { id: "discovery-symbolic", en: "Mathematical Discovery", zh: "数学发现" },
  { id: "benchmarks-datasets", en: "Benchmarks & Datasets", zh: "评测、基准与数学数据资源" },
];

/** Dimension 1: the branch of mathematics the work touches. Long-tail branches
 *  are folded into their parent field (number theory → algebra, PDE → analysis). */
export const MATH_TOPICS: FacetValue[] = [
  { id: "algebra", en: "Algebra & Number Theory", zh: "代数与数论" },
  { id: "geometry", en: "Geometry", zh: "几何" },
  { id: "analysis", en: "Analysis & Differential Equations", zh: "分析与微分方程" },
  { id: "combinatorics", en: "Combinatorics", zh: "组合数学" },
  { id: "probability-statistics", en: "Probability & Statistics", zh: "概率统计" },
  { id: "optimization", en: "Optimization Theory", zh: "优化理论" },
  { id: "mathematical-physics", en: "Mathematical Physics", zh: "数学物理" },
];

export function facetLabel(values: FacetValue[], id: string, lang: "zh" | "en"): string {
  const hit = values.find((v) => v.id === id);
  return hit ? hit[lang] : id;
}

export function facetSlug(value: FacetValue): string {
  return slugify(value.en);
}

/** Minimal shape every facet needs; both full records and list rows satisfy it. */
export type FacetSource = Pick<ResearchEvent, "title" | "summary"> &
  Partial<Pick<ResearchEvent, "eventType" | "researchArea" | "subArea" | "direction">>;

/** Ecosystem classes report events, not research about a math branch. */
const ECOSYSTEM_TYPES = new Set(["People", "Institutions", "Funding", "PolicyCommunity"]);

/** One derivation pass per record, shared by chips, feed filters and trends. */
export function facetsOf(event: FacetSource): EventFacets {
  return {
    cap: capabilityOf(event),
    math: mathTopicsOf(event),
  };
}

/** URL keys of the two filterable dimensions, in display order. */
export const FACET_KEYS = ["cap", "math"] as const;
export type FacetKey = (typeof FACET_KEYS)[number];

export const FACET_VALUES: Record<FacetKey, FacetValue[]> = {
  cap: CAPABILITIES,
  math: MATH_TOPICS,
};

export function facetIdsOf(facets: EventFacets, key: FacetKey): string[] {
  switch (key) {
    case "cap":
      return facets.cap ? [facets.cap] : [];
    case "math":
      return facets.math;
  }
}

const PURE_MATH_LOGIC = /\b(incompleteness|godel|gödel|set theory|arithmet(ic|ical)|proof theory|model theory|logic)\b/i;
const AI_CUE = /\b(llm|language model|neural|learning|agent|transformer|gpt|reinforcement|machine learning|ai)\b/i;

/** Map the legacy stored researchArea onto the clean capability facet. */
export function capabilityOf(event: FacetSource): string | undefined {
  const area = event.researchArea;
  if (!area) return undefined;
  switch (area) {
    case "Mathematical Reasoning & LLMs":
      return "reasoning-llms";
    case "Mathematical Agents":
      return "agents";
    case "Mathematical Discovery & Symbolic Computation":
      return "discovery-symbolic";
    case "Benchmarks & Datasets":
      return "benchmarks-datasets";
    case "Geometry":
      // math4ai geometry = geometry as a tool to study AI (foundations);
      // ai4math geometry = an AI system solving geometry (reasoning).
      return event.direction === "math4ai" ? "foundations-of-ai" : "reasoning-llms";
    case "Theorem Proving & Formal Mathematics": {
      const aiSide = ["Proof search", "Autoformalization", "Agent-based proving"].includes(event.subArea ?? "");
      if (aiSide) return "neuro-symbolic-proving";
      const text = `${event.title} ${event.summary}`;
      if (PURE_MATH_LOGIC.test(text) && !AI_CUE.test(text)) return "foundations-of-ai";
      return "neuro-symbolic-proving";
    }
    default:
      return undefined;
  }
}

/** Specificity order: narrow fields first, noisy "analysis" last. Title wins over summary.
 *  Merged buckets keep one entry per former branch so priority semantics stay unchanged. */
const TOPIC_PATTERNS: [string, RegExp][] = [
  ["analysis", /\b(partial differential|pdes?|navier[- ]stokes|elliptic|parabolic|hyperbolic)\b/i],
  ["algebra", /\bnumber[- ]theor(y|etic)\b|\bdiophantine\b|\bprime(s| number)\b/i],
  ["mathematical-physics", /\b(mathematical physics|quantum|statistical mechanics|field theory)\b/i],
  ["geometry", /\b(geometr(y|ic)|topolog(y|ical)|manifold|curvature)\b/i],
  ["combinatorics", /\bcombinator(ics|ial)\b|\bgraph theory\b|\bextremal\b/i],
  ["probability-statistics", /\b(probabilit(y|ic)|statistic(s|al)|stochastic|random (matrix|graph|walk))\b/i],
  ["optimization", /\boptimiz(ation|er|ing)\b|\bconvex\b|\bgradient descent\b/i],
  ["algebra", /\b(algebra|algebraic|group theory|representation theory|ring theory|homolog)\b/i],
  ["analysis", /\b(functional analysis|harmonic analysis|real analysis|complex analysis|analytic|inequalit)\b/i],
];

/** AI-context loanwords that match the geometry pattern but are not a branch
 *  of geometry. A real-geometry signal in the same text overrides the loanword,
 *  so genuine geometry-of-function-spaces work keeps its label. */
const GEOMETRY_LOANWORDS = /\b(information geometry|gradient geometry|pole geometry|geometry[- ]aware|geometry bias|geometry state)\b/i;
const REAL_GEOMETRY_SIGNAL = /\b(manifold|curvature|topolog(y|ical)|convex (body|region|set|hull)|polyhedral|simplicial|riemannian|geometric (theorem|problem|proof)|euclidean space)\b/i;

/** Multi-label: collect every matching branch, deduped, in specificity order.
 *  A work may touch several fields; absence stays meaningful (empty array).
 *  Ecosystem events carry no math topic — they report events, not research in
 *  a math branch (award/policy titles otherwise match keyword patterns). */
export function mathTopicsOf(event: FacetSource): string[] {
  if (event.eventType && ECOSYSTEM_TYPES.has(event.eventType)) return [];
  const hits = new Set<string>();
  const text = `${event.title} ${event.summary ?? ""}`;
  for (const [id, re] of TOPIC_PATTERNS) if (re.test(text)) hits.add(id);
  // Named problems in a title give a specific field even when the surrounding
  // abstract only describes AI-assisted formalization or verification.
  if (/\b(fermat['’]?s last theorem|riemann zeta)\b/i.test(event.title)) hits.add("algebra");
  if (hits.has("geometry") && GEOMETRY_LOANWORDS.test(text) && !REAL_GEOMETRY_SIGNAL.test(text))
    hits.delete("geometry");
  return [...hits];
}
