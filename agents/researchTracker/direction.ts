import type { EventDirection, ResearchEvent } from "@/types";
import { getLLMProvider, type LLMProvider } from "@/lib/llm/provider";
import { truncateText } from "@/lib/utils";

/**
 * Direction axis — who the progress directly serves.
 *
 * researchArea says how AI engages mathematics; direction says whether the
 * beneficiary is mathematics itself or general AI capability. This is an
 * editorial classification, not an evidence claim, so an LLM assigns it from
 * the stored prose under a fixed rubric. The fixtures below are the written
 * rubric: they double as few-shot examples in the prompt and as stored-value
 * assertions in direction.test.ts, so a drifted prompt fails the suite.
 */

export interface DirectionFixture {
  slug: string;
  /** Stored title, exactly as the classifier sees it. */
  title: string;
  expected: EventDirection;
  /** Where the backfill stores the answer, for the lock test. */
  source: "seed" | "ingested";
}

/**
 * Landmark events pinning the boundary. Rulings encoded here:
 * - verifiable new mathematics (proofs, algorithms, formal corpora) = ai4math;
 * - evaluating or upgrading general model capability on math = math4ai;
 * - formal-prover benchmarks serve the math toolchain = ai4math;
 * - a benchmark that is also a body of verified mathematical content = both.
 */
export const DIRECTION_FIXTURES: DirectionFixture[] = [
  // ai4math — the output is mathematics a mathematician would credit.
  { slug: "alphageometry-olympiad-geometry-without-demonstrations", title: "Solving olympiad geometry without human demonstrations", expected: "ai4math", source: "seed" },
  { slug: "leandojo-retrieval-augmented-theorem-proving", title: "LeanDojo: Theorem Proving with Retrieval-Augmented Language Models", expected: "ai4math", source: "seed" },
  { slug: "minif2f-cross-system-formal-olympiad-benchmark", title: "miniF2F: a cross-system benchmark for formal Olympiad-level mathematics", expected: "ai4math", source: "seed" },
  { slug: "deepmind-aletheia-towards-autonomous-mathematics-research", title: "DeepMind's Aletheia: an agent tackling open problems end-to-end", expected: "ai4math", source: "seed" },
  { slug: "funsearch-mathematical-discoveries-program-search", title: "Mathematical discoveries from program search with large language models", expected: "ai4math", source: "seed" },
  { slug: "autoformalization-with-large-language-models", title: "Autoformalization with Large Language Models", expected: "ai4math", source: "seed" },
  { slug: "numina-fuse-interactive-autoformalization-in-lean-4", title: "Numina Fuse: Interactive Autoformalization in Lean 4", expected: "ai4math", source: "ingested" },
  // math4ai — the beneficiary is model capability; math is the medium.
  { slug: "chain-of-thought-prompting-reasoning-llms", title: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models", expected: "math4ai", source: "seed" },
  { slug: "self-consistency-chain-of-thought-decoding", title: "Self-Consistency Improves Chain of Thought Reasoning in Language Models", expected: "math4ai", source: "seed" },
  { slug: "deepseekmath-grpo-open-math-reasoning", title: "DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models", expected: "math4ai", source: "seed" },
  { slug: "frontiermath-benchmark-advanced-mathematical-reasoning", title: "FrontierMath: A Benchmark for Evaluating Advanced Mathematical Reasoning in AI", expected: "math4ai", source: "seed" },
  { slug: "llemma-open-language-model-for-mathematics", title: "Llemma: An Open Language Model For Mathematics", expected: "math4ai", source: "seed" },
  { slug: "math-shepherd-automatic-process-reward-models", title: "Math-Shepherd: Verify and Reinforce LLMs Step-by-step without Human Annotations", expected: "math4ai", source: "seed" },
  { slug: "mge-po-entropy-aware-credit-assignment-for-mathematical-reasoning", title: "MGE-PO: Entropy-Aware Credit Assignment for Mathematical Reasoning", expected: "math4ai", source: "ingested" },
  { slug: "a-tropical-geometry-view-of-forgetting-a-per-unit-projector-for-knowledge-preserving-fine-tuning", title: "A Tropical Geometry View of Forgetting: A Per-Unit Projector for Knowledge-Preserving Fine-Tuning", expected: "math4ai", source: "ingested" },
  // both — a benchmark that is also a body of verified mathematical content.
  { slug: "formal-conjectures-verified-discovery-benchmark", title: "Formal Conjectures: An Open and Evolving Benchmark for Verified Discovery in Mathematics", expected: "both", source: "seed" },
];

const RUBRIC = [
  "You decide the direction axis of an event for an AI-for-Mathematics tracker.",
  'Reply with a single JSON object and nothing else: {"direction":"ai4math"}.',
  'Allowed values: "ai4math", "math4ai", "both".',
  "",
  "Criterion — who benefits directly:",
  '- ai4math: the progress serves mathematics as a practice done with machines — new proofs, new algorithms, new conjectures, autoformalization, proof assistants, mathematical discovery tooling, and benchmarks that serve that toolchain.',
  '- math4ai: the progress serves general AI capability — training, prompting, evaluation, interpretability or alignment — where mathematics is only the medium, dataset or testbed.',
  "- both: rare — the record itself must be co-primary for both sides: it evaluates models AND is a body of verifiable mathematical content (e.g. a corpus of formally verified statements). A benchmark that only measures model performance is math4ai.",
  "",
  "Boundary rulings:",
  "- AI that produces verifiable new mathematics (olympiad- or research-level proofs, discovered algorithms) is ai4math even when it doubles as a capability demo.",
  "- Evaluating general language models on mathematics is math4ai, even when the questions are research-level.",
  "- Benchmarks of formal provers and proof tooling are ai4math: the toolchain belongs to mathematics.",
  "- Math-specialized language models and prompting or reward-method papers are math4ai.",
  "- The research area alone never decides the answer; classify the event's own purpose.",
  "",
  "Boundary examples (memorize these rulings):",
  ...DIRECTION_FIXTURES.map((f) => `- "${f.title}" -> ${f.expected}`),
];

export const DIRECTION_SYSTEM = RUBRIC.join("\n");

/** Parse the model's reply; only a clean JSON, a key/value pair or a bare token is accepted. */
export function parseDirection(response: string): EventDirection | undefined {
  const start = response.indexOf("{");
  const end = response.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      const value = (JSON.parse(response.slice(start, end + 1)) as { direction?: unknown }).direction;
      if (value === "ai4math" || value === "math4ai" || value === "both") return value;
    } catch {
      // fall through to the looser checks
    }
  }
  // A reply cut off after the value still states it ("{\"direction\":\"ai4math").
  const pair = /"direction"\s*:\s*"(ai4math|math4ai|both)/.exec(response);
  if (pair) return pair[1] as EventDirection;
  const bare = response.trim().toLowerCase();
  if (bare === "ai4math" || bare === "math4ai" || bare === "both") return bare;
  return undefined;
}

/** Ecosystem events carry no direction, same rule as researchArea. */
export function isDirectionEligible(event: Pick<ResearchEvent, "researchArea">): boolean {
  return Boolean(event.researchArea);
}

/**
 * One extra LLM call per eligible event. Returns nothing on the offline mock
 * or on any failure, so a failed call is skipped (and retried on the next
 * run) rather than stored as a guess.
 */
export async function classifyDirection(
  event: Pick<ResearchEvent, "title" | "summary" | "researchArea" | "subArea">,
  provider: LLMProvider = getLLMProvider()
): Promise<EventDirection | undefined> {
  if (provider.id === "mock") return undefined;
  const prompt =
    `Title: ${event.title}\n` +
    `Research area: ${event.researchArea ?? "(none)"}` +
    `${event.subArea ? ` / ${event.subArea}` : ""}\n` +
    `Text: ${truncateText(event.summary, 800)}\n\n` +
    "Classify this event on the direction axis.";
  try {
    // 500, not 64: some backends emit reasoning before the answer and a
    // tight cap cut the JSON mid-value ("{\"direction\":\"math4").
    const response = await provider.complete(prompt, { system: DIRECTION_SYSTEM, maxTokens: 500 });
    const direction = parseDirection(response);
    if (!direction) {
      console.warn(`[ai4math] unparseable direction reply for "${event.title}":`, response.slice(0, 200));
    }
    return direction;
  } catch (error) {
    console.warn(`[ai4math] direction classification failed for "${event.title}".`, String(error).slice(0, 200));
    return undefined;
  }
}
