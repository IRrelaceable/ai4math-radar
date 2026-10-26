import { RESEARCH_AREAS, type RawResearchItem, type ResearchArea } from "@/types";

export interface Classification {
  /** Whether the item is about AI for Mathematics at all. */
  isAI4Math: boolean;
  researchArea?: ResearchArea;
  subArea?: string;
  /** Human-readable rule trace, useful for debugging the pipeline. */
  reasons: string[];
}

interface Rule {
  area: ResearchArea;
  subArea?: string;
  score: number;
  keywords: string[];
}

/**
 * Rule-based classifier (stage 3 of the pipeline).
 *
 * MVP uses transparent keyword rules; swap in an LLM-backed decision later by
 * calling `getLLMProvider()` with the same input/output contract.
 */
const RULES: Rule[] = [
  {
    area: "Theorem Proving",
    subArea: "Lean",
    score: 86,
    keywords: ["theorem prov", "proof search", "lean", "tactic", "formal proof", "prover", "isabelle", "coq"],
  },
  {
    area: "Mathematical Reasoning",
    subArea: "chain-of-thought",
    score: 74,
    keywords: ["reasoning", "chain-of-thought", "step-by-step", "problem solv", "quantitative"],
  },
  {
    area: "Formal Mathematics",
    subArea: "formalization",
    score: 80,
    // "kernel" removed: CNN/ML papers talk about convolution kernels, which
    // mis-filed them into formal mathematics.
    keywords: ["formaliz", "formal math", "verified", "proof assistant"],
  },
  {
    area: "Mathematical Discovery",
    subArea: "conjecture",
    score: 90,
    keywords: ["discover", "conjecture", "new construction", "autonomous research"],
  },
  {
    area: "Geometry",
    subArea: "olympiad geometry",
    score: 88,
    keywords: ["geometry", "olympiad", "euclidean", "diagram", "auxiliary construction"],
  },
  {
    area: "Mathematical Agents",
    subArea: "multi-step tools",
    score: 78,
    keywords: ["agent", "tool use", "agentic", "autonomous", "multi-step"],
  },
  {
    area: "Benchmarks & Datasets",
    subArea: "evaluation",
    score: 70,
    keywords: ["benchmark", "dataset", "evaluation", "leaderboard", "test suite"],
  },
  {
    area: "LLM for Mathematics",
    subArea: "math-specialized models",
    score: 76,
    keywords: ["large language model", "llm", "language model", "pretrain", "fine-tun"],
  },
  {
    area: "Symbolic Mathematics",
    subArea: "cas",
    score: 72,
    keywords: ["symbolic", "computer algebra", "simplification", "equation solving"],
  },
];

const NEGATIVE = ["pure analysis", "no machine learning", "unrelated field"];

/**
 * Two-tier math-signal gate. Live sources surface hundreds of cs.AI/cs.CL/cs.LG
 * papers per run; a single generic word ("mathematical", "optimization") must
 * not be enough, or robotics/federated-learning/CNN papers flood the feed.
 *
 * Tier 1 — decisive AI4Math vocabulary. One match passes the math gate.
 * Tier 2 — math-flavoured but also common in general ML papers. Two or more
 *           distinct tier-2 matches are required to pass.
 *
 * All signals are matched as word-start-anchored patterns ("lean" does not
 * match "clean"; "mathemat" matches "mathematical").
 */
const TIER1_MATH_SIGNALS = [
  "theorem",
  "proof",
  "prover",
  "lean",
  "mathlib",
  "formal proof",
  "proof assistant",
  "metamath",
  "isabelle",
  "coq",
  "conjecture",
  "olympiad",
  "putnam",
  "minerva",
];

const TIER2_MATH_SIGNALS = [
  // Math-domain-specific vocabulary only. Generic words that any cs.* paper
  // can carry ("mathematical analysis", "optimization", "verification",
  // "symbolic") were deliberately excluded: paired together they still let
  // robotics/MoE/efficiency papers through. "formaliz" also lives here —
  // academic writing uses the verb "formalize" for anything ("formalize
  // this intuition"), not just formalized mathematics.
  "formaliz",
  "algebra",
  "geometry",
  "number theory",
  "combinator",
  "matrix multiplication",
  "inequality",
  "polynomial",
];

/**
 * AI/ML component signals. Generic presentation words that appear in almost
 * any cs.* abstract (dataset, benchmark, attention, embedding, ablation,
 * state-of-the-art, leaderboard, representation) were removed — they proved
 * too weak to carry the AI half of the gate on their own.
 */
const AI_SIGNALS = [
  "llm",
  "large language model",
  "language model",
  "machine learning",
  "artificial intelligence",
  "neural",
  "deep learning",
  "gpt",
  "transformer",
  "reinforcement",
  "agent",
  "agentic",
  "autoformaliz",
  "automated theorem",
  "prover",
  "reward model",
  "trained",
  "training",
  "prompt",
  "fine-tun",
  "pretrain",
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Word-start anchored match: "lean" must not match "clean". */
function hasSignal(text: string, signal: string): boolean {
  return new RegExp(`\\b${escapeRegExp(signal)}`, "i").test(text);
}

function matchedKeywords(rule: Rule, text: string): string[] {
  return rule.keywords.filter((k) => hasSignal(text, k));
}

/** Stage 1 -> 2 of the MVP pipeline: RawResearchItem -> classification. */
export function classifyItem(item: RawResearchItem): Classification {
  // "proof of concept" in security/systems papers is not a mathematical
  // proof — strip it so it cannot satisfy the decisive "proof" signal.
  const text = `${item.title}\n${item.abstract ?? ""}`
    .toLowerCase()
    .replace(/proof[\s-]of[\s-]concept/g, " ");
  const reasons: string[] = [];

  const negative = NEGATIVE.filter((n) => text.includes(n));
  if (negative.length > 0) {
    reasons.push(`rejected by negative marker: ${negative.join(", ")}`);
    return { isAI4Math: false, reasons };
  }

  // Two-tier math gate: one decisive signal, or two distinct weak signals.
  const tier1Hits = TIER1_MATH_SIGNALS.filter((s) => hasSignal(text, s));
  const tier2Hits = TIER2_MATH_SIGNALS.filter((s) => hasSignal(text, s));
  if (tier1Hits.length === 0 && tier2Hits.length < 2) {
    reasons.push(
      "no strong AI4Math signal (theorem/proof/Lean/formalization/...); " +
        "needs one decisive signal or two math-flavoured signals"
    );
    return { isAI4Math: false, reasons };
  }

  if (!AI_SIGNALS.some((signal) => hasSignal(text, signal))) {
    reasons.push("no AI/ML component detected (plain mathematics is out of scope)");
    return { isAI4Math: false, reasons };
  }

  const hits = RULES.map((rule) => ({ rule, matched: matchedKeywords(rule, text) })).filter(
    (h) => h.matched.length > 0
  );
  if (hits.length === 0) {
    reasons.push("no AI4Math area keyword matched");
    return { isAI4Math: false, reasons };
  }

  // Area = most matched keywords, tie-broken by the rule's base score.
  // The rule score only arbitrates between candidate areas; it is not exposed
  // as an event-level editorial ranking.
  const primary = hits.reduce((best, h) =>
    h.matched.length > best.matched.length ||
    (h.matched.length === best.matched.length && h.rule.score > best.rule.score)
      ? h
      : best
  );
  reasons.push(
    ...hits.map((h) => `matched "${h.rule.area}" via ${h.matched.join("/")}`)
  );

  return {
    isAI4Math: true,
    researchArea: primary.rule.area,
    subArea: primary.rule.subArea,
    reasons,
  };
}

/** Convenience: does this area exist in the current taxonomy? */
export function isKnownArea(value: string): value is ResearchArea {
  return (RESEARCH_AREAS as readonly string[]).includes(value);
}

