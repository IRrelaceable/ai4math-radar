import type { EventDirection, ResearchEvent } from "@/types";
import { getLLMProvider, type LLMProvider } from "@/lib/llm/provider";
import { truncateText } from "@/lib/utils";

/**
 * Direction axis — what the work is about, not who benefits in the abstract.
 *
 * The classifier follows three steps in order:
 *   1. research object — what the work studies;
 *   2. core goal — what problem it ultimately wants to solve;
 *   3. actual contribution — what it actually delivers.
 *
 * Step 3 is decisive: a paper that states a mathematical goal but delivers a
 * reusable AI method is Math4AI, and one whose headline artifact is a
 * math-specialized model/dataset/benchmark is AI4Math even if the technique is
 * general. "none" means the work belongs to neither side of the axis.
 */

/** Four-way verdict; `none` is deliberately not stored as an EventDirection. */
export type DirectionVerdict = EventDirection | "none";

export interface DirectionAnalysis {
  verdict: DirectionVerdict;
  /** What the work primarily studies, in Chinese for review reports. */
  researchObject: string;
  /** The problem it ultimately wants to solve. */
  coreGoal: string;
  /** What it actually delivers, independent of the stated motivation. */
  actualContribution: string;
  /** 0–1 self-assessment; low values are flagged for review, never trusted blindly. */
  confidence: number;
  /** One sentence pointing at the decisive evidence. */
  reason: string;
}

/** Required prose plus the optional fields the seed and audit can supply. */
export type DirectionEvent = Pick<
  ResearchEvent,
  "title" | "summary" | "researchArea" | "subArea"
> &
  Partial<Pick<ResearchEvent, "problem" | "keyContributions" | "significance">>;

export interface DirectionFixture {
  slug: string;
  /** Stored title, exactly as the classifier sees it. */
  title: string;
  expected: EventDirection;
  /** Where the backfill stores the answer, for the lock test. */
  source: "seed" | "ingested";
}

/**
 * Landmark events pinning the boundary. Their stored labels already follow the
 * three-step rubric, so the test below can assert data and prompt together.
 */
export const DIRECTION_FIXTURES: DirectionFixture[] = [
  // ai4math — the object and deliverable are mathematics.
  { slug: "alphageometry-olympiad-geometry-without-demonstrations", title: "Solving olympiad geometry without human demonstrations", expected: "ai4math", source: "seed" },
  { slug: "leandojo-retrieval-augmented-theorem-proving", title: "LeanDojo: Theorem Proving with Retrieval-Augmented Language Models", expected: "ai4math", source: "seed" },
  { slug: "minif2f-cross-system-formal-olympiad-benchmark", title: "miniF2F: a cross-system benchmark for formal Olympiad-level mathematics", expected: "ai4math", source: "seed" },
  { slug: "deepmind-aletheia-towards-autonomous-mathematics-research", title: "DeepMind's Aletheia: an agent tackling open problems end-to-end", expected: "ai4math", source: "seed" },
  { slug: "funsearch-mathematical-discoveries-program-search", title: "Mathematical discoveries from program search with large language models", expected: "ai4math", source: "seed" },
  { slug: "autoformalization-with-large-language-models", title: "Autoformalization with Large Language Models", expected: "ai4math", source: "seed" },
  { slug: "numina-fuse-interactive-autoformalization-in-lean-4", title: "Numina Fuse: Interactive Autoformalization in Lean 4", expected: "ai4math", source: "ingested" },
  // math4ai — the headline deliverable is a reusable AI method or theory.
  { slug: "chain-of-thought-prompting-reasoning-llms", title: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models", expected: "math4ai", source: "seed" },
  { slug: "self-consistency-chain-of-thought-decoding", title: "Self-Consistency Improves Chain of Thought Reasoning in Language Models", expected: "math4ai", source: "seed" },
  { slug: "math-shepherd-automatic-process-reward-models", title: "Math-Shepherd: Verify and Reinforce LLMs Step-by-step without Human Annotations", expected: "math4ai", source: "seed" },
  { slug: "mge-po-entropy-aware-credit-assignment-for-mathematical-reasoning", title: "MGE-PO: Entropy-Aware Credit Assignment for Mathematical Reasoning", expected: "math4ai", source: "ingested" },
  { slug: "a-tropical-geometry-view-of-forgetting-a-per-unit-projector-for-knowledge-preserving-fine-tuning", title: "A Tropical Geometry View of Forgetting: A Per-Unit Projector for Knowledge-Preserving Fine-Tuning", expected: "math4ai", source: "ingested" },
  // both — co-primary mathematical content and model evaluation.
  { slug: "formal-conjectures-verified-discovery-benchmark", title: "Formal Conjectures: An Open and Evolving Benchmark for Verified Discovery in Mathematics", expected: "both", source: "seed" },
];

/**
 * Prompt-only examples for verdicts that are not stored yet. They document the
 * migration the audit is about to measure, so they must not drive the stored
 * lock test until the confirmed slugs are applied.
 */
export const DIRECTION_EXAMPLES: { title: string; expected: DirectionVerdict }[] = [
  { title: "Llemma: An Open Language Model For Mathematics", expected: "ai4math" },
  { title: "FrontierMath: A Benchmark for Evaluating Advanced Mathematical Reasoning in AI", expected: "ai4math" },
  { title: "MathVista: Evaluating Mathematical Reasoning of Foundation Models in Visual Contexts", expected: "ai4math" },
  { title: "Minerva: Solving Quantitative Reasoning Problems with Language Models", expected: "ai4math" },
  { title: "ASDiv: A Diverse Corpus for Evaluating and Developing English Math Word Problem Solvers", expected: "ai4math" },
  { title: "The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery", expected: "none" },
  { title: "RE-Bench: Evaluating frontier AI R&D capabilities of language model agents against human experts", expected: "none" },
  // Formal proofs whose subject is software/hardware behaviour, not mathematics.
  { title: "Stop Handcrafting Your Engine! GenDB-V: Towards AI-Generated and Formally Verified Database Systems", expected: "none" },
  { title: "LARK: Lean-Assisted Reasoning for LLM-Generated GPU Kernels", expected: "none" },
  { title: "GTFormer: A Syntax-Free Graph Network Alternative to Transformers for 8192$\\times$ Length Extrapolation in Linear Time", expected: "none" },
  { title: "Trainable Boundary-Keeping Where No Formal Answer Exists: A Controlled Knock-In Study of Reward Training in Evidence-Sufficiency Judgment", expected: "none" },
  // Mathematics used to analyse an AI model, not AI used on mathematics.
  { title: "The Geometry of Limits in ReLU Function Spaces", expected: "math4ai" },
];

const RUBRIC = [
  "You classify events for an AI-for-Mathematics tracker on the direction axis.",
  "The axis asks what the work is about and what it actually delivers — not who benefits in the abstract.",
  "",
  "Follow these three steps in order for every event:",
  "1. Research object — what is this work primarily studying? Name the object: a mathematical result, proof, conjecture or formal corpus; a math problem-solving system; a math dataset or benchmark; an AI model, training procedure, algorithm, representation or interpretability question; or general scientific/research automation.",
  "2. Core goal — what problem does the work ultimately want to solve? Map it to the decision table below.",
  "3. Actual contribution — check what the work actually delivers, using the stored problem, summary, significance and key contributions. If the stated goal and the delivered contribution disagree, classify by the delivered contribution. Never decide from the title, venue or research area alone.",
  "",
  "Decision table (core goal -> direction):",
  "- improve AI's mathematical reasoning -> ai4math",
  "- automatically discover mathematical patterns or conjectures -> ai4math",
  "- automatically prove mathematical theorems -> ai4math",
  "- improve AI model training methods -> math4ai",
  "- explain mathematical properties of AI models -> math4ai",
  "- use mathematical theory to improve AI algorithms -> math4ai",
  "- deliver both kinds of core goal as co-primary contributions -> both",
  "- none of the above -> none",
  "",
  "Boundary rules:",
  "- When the goal is mixed, the headline deliverable wins: a math-specialized artifact (proof, prover, formal corpus, math model, math dataset or benchmark) -> ai4math; a reusable AI method, theory or algorithm whose evaluation happens to be mathematical -> math4ai.",
  "- A benchmark or tool for proving mathematical theorems belongs to the mathematical toolchain -> ai4math; a benchmark or tool for verifying software or hardware does not.",
  "- A machine-checked proof is mathematics only when what it proves is mathematics. Correctness of a kernel, compiler, operating system, database, bytecode, protocol, scheduler or circuit is software or hardware verification -> none, even when the proof is written in Lean, Isabelle, Coq or Rocq.",
  "- A generic AI training recipe, agent workflow or architecture improvement is none when mathematics is neither the method nor the testbed, even if the paper mentions reasoning or theorem proving.",
  "- The research-area label is machine-generated and may be wrong; when it conflicts with the title or abstract, trust the abstract.",
  "- A benchmark that is also a body of verified mathematical content may be both; one that only measures model performance is not both.",
  "- Interpretability, learning theory, scaling laws and mathematical analyses of AI models -> math4ai.",
  "- General AI research-automation or AI-for-science work with no mathematical object and no mathematical method for AI -> none.",
  "- both is rare: only when both sides are co-primary deliverables, not when one is a means to the other.",
  "",
  "Confidence: 0.9+ only when the text explicitly states the object and the contribution; 0.6-0.8 when the headline deliverable is mixed; below 0.6 when the text is insufficient.",
  "",
  'Reply with one JSON object and nothing else: {"researchObject":"...","coreGoal":"...","actualContribution":"...","direction":"ai4math|math4ai|both|none","confidence":0.0,"reason":"..."}',
  "Write researchObject, coreGoal, actualContribution and reason in Chinese; quote or paraphrase the decisive evidence. Keep each field to one short sentence, under 80 Chinese characters.",
  "",
  "Boundary examples (memorize these rulings):",
  ...[...DIRECTION_FIXTURES.map((f) => ({ title: f.title, expected: f.expected })), ...DIRECTION_EXAMPLES].map(
    (f) => `- "${f.title}" -> ${f.expected}`
  ),
];

export const DIRECTION_SYSTEM = RUBRIC.join("\n");

/** Bump when the rubric changes so cached judgements can be told apart. */
export const DIRECTION_RUBRIC_VERSION = "2026-11-09b";

function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Parse the richer audit reply; any malformed or unknown direction is a failure. */
export function parseDirectionAnalysis(response: string): DirectionAnalysis | undefined {
  const start = response.indexOf("{");
  const end = response.lastIndexOf("}");
  if (start === -1 || end <= start) return undefined;
  try {
    const raw = JSON.parse(response.slice(start, end + 1)) as Record<string, unknown>;
    const direction = raw.direction;
    if (direction !== "ai4math" && direction !== "math4ai" && direction !== "both" && direction !== "none") {
      return undefined;
    }
    const parsedConfidence = typeof raw.confidence === "number" ? raw.confidence : Number.NaN;
    return {
      verdict: direction,
      researchObject: textOf(raw.researchObject),
      coreGoal: textOf(raw.coreGoal),
      actualContribution: textOf(raw.actualContribution),
      confidence: Number.isFinite(parsedConfidence)
        ? Math.min(Math.max(parsedConfidence, 0), 1)
        : 0.5,
      reason: textOf(raw.reason),
    };
  } catch {
    return undefined;
  }
}

/** Stored-axis parser. `none` is a valid verdict, but it means "no stored axis". */
export function parseDirection(response: string): EventDirection | undefined {
  const analysis = parseDirectionAnalysis(response);
  if (analysis) return analysis.verdict === "none" ? undefined : analysis.verdict;
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

/** The prose the classifier is allowed to see, in a fixed order for cache hashing. */
export function directionInput(
  event: DirectionEvent
): string {
  const contributions = event.keyContributions?.filter(Boolean) ?? [];
  return [
    `Title: ${event.title}`,
    `Research area: ${event.researchArea ?? "(none)"}${event.subArea ? ` / ${event.subArea}` : ""}`,
    event.problem ? `Stated problem: ${event.problem}` : "",
    contributions.length > 0 ? `Stated contributions:\n- ${contributions.join("\n- ")}` : "",
    `Summary: ${truncateText(event.summary, 1200)}`,
    event.significance ? `Significance: ${truncateText(event.significance, 400)}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * One call per eligible event. Returns nothing on the offline mock or on any
 * failure, so a failed call is retried rather than stored as a guess. A
 * successful `none` verdict is returned as an analysis, not as a failure.
 */
export async function analyzeDirection(
  event: DirectionEvent,
  provider: LLMProvider = getLLMProvider()
): Promise<DirectionAnalysis | undefined> {
  return analyzeDirectionText(directionInput(event), provider, event.title);
}

/**
 * Same rubric, arbitrary evidence text. The source audit uses this to judge an
 * event from the original abstract instead of the stored summary, without
 * duplicating the prompt or parser.
 */
export async function analyzeDirectionText(
  text: string,
  provider: LLMProvider = getLLMProvider(),
  label = "event"
): Promise<DirectionAnalysis | undefined> {
  if (provider.id === "mock") return undefined;
  const prompt = `${text}\n\nClassify this event on the direction axis.`;
  let response = "";
  try {
    // 1500, not 500: the three-step reply carries three prose fields plus the
    // verdict, and a tight cap truncates the JSON mid-string.
    response = await provider.complete(prompt, { system: DIRECTION_SYSTEM, maxTokens: 1500 });
  } catch (error) {
    console.warn(`[ai4math] direction classification failed for "${label}".`, String(error).slice(0, 200));
    return undefined;
  }
  const analysis = parseDirectionAnalysis(response);
  if (!analysis) {
    console.warn(`[ai4math] unparseable direction reply for "${label}":`, response.slice(0, 200));
  }
  return analysis;
}

/**
 * Stored-axis adapter for the ingest pipeline and the backfill. `none` is not
 * an EventDirection, so it is reported as "no axis" here and handled by the
 * audit/apply scripts instead.
 */
export async function classifyDirection(
  event: DirectionEvent,
  provider: LLMProvider = getLLMProvider()
): Promise<EventDirection | undefined> {
  const analysis = await analyzeDirection(event, provider);
  if (!analysis) return undefined;
  if (analysis.verdict === "none") {
    console.warn(`[ai4math] direction: none for "${event.title}"`);
    return undefined;
  }
  return analysis.verdict;
}
