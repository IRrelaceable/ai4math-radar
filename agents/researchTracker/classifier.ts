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
    area: "Theorem Proving & Formal Mathematics",
    subArea: "Prover tooling & interaction",
    score: 86,
    keywords: ["theorem prov", "proof search", "lean", "tactic", "formal proof", "prover", "isabelle", "coq"],
  },
  {
    area: "Mathematical Reasoning & LLMs",
    subArea: "Prompting & decoding",
    score: 74,
    keywords: ["reasoning", "chain-of-thought", "step-by-step", "problem solv", "quantitative", "word problem"],
  },
  {
    area: "Theorem Proving & Formal Mathematics",
    subArea: "Autoformalization",
    score: 80,
    // "kernel" removed: CNN/ML papers talk about convolution kernels, which
    // mis-filed them into formal mathematics.
    keywords: ["formaliz", "formal math", "verified", "proof assistant"],
  },
  {
    area: "Mathematical Discovery & Symbolic Computation",
    subArea: "AI-proved results & conjectures",
    score: 90,
    keywords: ["discover", "conjecture", "new construction", "autonomous research"],
  },
  {
    area: "Geometry",
    subArea: "Geometry problem solving",
    score: 88,
    keywords: ["geometry", "olympiad", "euclidean", "diagram", "auxiliary construction"],
  },
  {
    area: "Mathematical Agents",
    subArea: "Engineering & tool agents",
    score: 78,
    keywords: ["agent", "tool use", "agentic", "autonomous", "multi-step"],
  },
  {
    area: "Benchmarks & Datasets",
    subArea: "Theorem & multimodal benchmarks",
    score: 70,
    keywords: ["benchmark", "dataset", "evaluation", "leaderboard", "test suite"],
  },
  {
    area: "Mathematical Reasoning & LLMs",
    subArea: "Math-specialized models",
    score: 76,
    keywords: ["large language model", "llm", "language model", "pretrain", "fine-tun"],
  },
  {
    area: "Mathematical Discovery & Symbolic Computation",
    subArea: "Equation solving & discovery",
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
  // A math word problem, geometry problem or symbolic-regression task is the
  // subject of the paper, not a passing example — these phrases are as
  // decisive as "theorem" and were previously rejected for lacking one.
  "word problem",
  "math problem",
  "mathematical problem",
  "mathematical reasoning",
  "geometry problem",
  "geometric reasoning",
  "symbolic regression",
  "equation discovery",
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
  // Frontier-lab names: their blog posts describe model output without always
  // naming the model, e.g. "OpenAI shares model results on the Kakeya conjecture".
  // "claude" covers Anthropic's model families (Fable, Mythos, Opus): a launch
  // post can say "Claude formalized …" with no generic AI noun anywhere.
  "openai",
  "anthropic",
  "claude",
  "deepmind",
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * "Lean" is also an ordinary English word: "Leaner Transformers", "machine
 * leaning", and the all-caps acronym "LEAN:" all matched the old prefix rule
 * and filed ML papers under theorem proving. The proof assistant is written
 * "Lean" (or lowercase "lean" as a standalone token), so match it
 * case-sensitively and reject letter continuations ("leaner", "leaning") while
 * still accepting "Lean 4", "Lean4" and "LeanDojo".
 */
const LEAN_NAME = /(?<![A-Za-z])(?:Lean|lean)(?![a-z])/;

/** Word-start anchored match: "lean" must not match "clean". */
function hasSignal(text: string, signal: string, original?: string): boolean {
  if (signal === "lean") return LEAN_NAME.test(original ?? text);
  return new RegExp(`\\b${escapeRegExp(signal)}`, "i").test(text);
}

function matchedKeywords(rule: Rule, text: string, original?: string): string[] {
  return rule.keywords.filter((k) => hasSignal(text, k, original));
}

/** Stage 1 -> 2 of the MVP pipeline: RawResearchItem -> classification. */
export function classifyItem(item: RawResearchItem): Classification {
  // "proof of concept" in security/systems papers is not a mathematical
  // proof — strip it so it cannot satisfy the decisive "proof" signal.
  const raw = `${item.title}\n${item.abstract ?? ""}`;
  const text = raw
    .toLowerCase()
    .replace(/proof[\s-]of[\s-]concept/g, " ");
  const reasons: string[] = [];

  const negative = NEGATIVE.filter((n) => text.includes(n));
  if (negative.length > 0) {
    reasons.push(`rejected by negative marker: ${negative.join(", ")}`);
    return { isAI4Math: false, reasons };
  }

  // Two-tier math gate: one decisive signal, or two distinct weak signals.
  const tier1Hits = TIER1_MATH_SIGNALS.filter((s) => hasSignal(text, s, raw));
  const tier2Hits = TIER2_MATH_SIGNALS.filter((s) => hasSignal(text, s, raw));
  if (tier1Hits.length === 0 && tier2Hits.length < 2) {
    reasons.push(
      "no strong AI4Math signal (theorem/proof/Lean/formalization/...); " +
        "needs one decisive signal or two math-flavoured signals"
    );
    return { isAI4Math: false, reasons };
  }

  if (!AI_SIGNALS.some((signal) => hasSignal(text, signal, raw))) {
    reasons.push("no AI/ML component detected (plain mathematics is out of scope)");
    return { isAI4Math: false, reasons };
  }

  const hits = RULES.map((rule) => ({
    rule,
    matched: matchedKeywords(rule, text, raw),
  })).filter((h) => h.matched.length > 0);
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
