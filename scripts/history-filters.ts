import type { ResearchArea } from "@/types";

/**
 * Shared selection rules for historical backfill scripts.
 *
 * A year-level import has to answer two questions before spending an LLM call:
 * is the record about mathematics, and is it about AI doing mathematics. The
 * keyword rules below are the cheap first half; `classifyItem` stays the
 * authority and runs on every candidate afterwards.
 */

/**
 * At least one of these must appear in the title. Prefix matching is used for
 * mathematical words (algebra -> algebraic) but whole words elsewhere, because
 * "proving" also lives inside "improving" and "hol" inside "holistic".
 */
export const TITLE_MATH = new RegExp(
  "\\b(?:" +
    [
      "theorem",
      "proofs?",
      "provers?",
      "proving",
      "prove[dn]?",
      "formaliz\\w*",
      "autoformaliz\\w*",
      "lean",
      "isabelle",
      "coq",
      "hol",
      "mizar",
      "metamath",
      "mathemat\\w*",
      "math",
      "arithmetic",
      "word problems?",
      "algebra\\w*",
      "geometr\\w*",
      "conjectures?",
      "olympiads?",
      "putnam",
      "symbolic",
      "equations?",
    ].join("|") +
    ")",
  "i"
);

export const TITLE_AI =
  /\b(neural|learning|language model|llm|gpt|transformer|reinforcement|agent|artificial intelligence|autoformal|automated)\b/i;

/**
 * Conference proceedings carry a lot of math-flavoured machine learning —
 * interpretability's "symbolic corrections", control theory's "regret bounds",
 * a "lottery ticket hypothesis" being "proved". Unlike arXiv queries there is
 * no query narrowing the pool, so the title must name an AI-for-mathematics
 * task before an abstract is fetched. The classifier still has the final say.
 */
export const TITLE_AI4MATH_TASK = new RegExp(
  "\\b(?:" +
    [
      "theorem[\\s-]?prov\\w*",
      "prov\\w* theorems?",
      "proof assistants?",
      "formal proofs?",
      "formaliz\\w*",
      "autoformaliz\\w*",
      "proof search",
      "proof generation",
      "automated prov\\w*",
      "neural theorem",
      "lean\\b",
      "isabelle\\b",
      "coq\\b",
      "mizar\\b",
      "metamath",
      "mathlib",
      "math word problems?",
      "mathematical word problems?",
      "arithmetic word problems?",
      "programming word problems?",
      "probability word problems?",
      "algebra\\w* word problems?",
      "geometr\\w* word problems?",
      "math problems?",
      "mathematical problems?",
      "mathematical reasoning",
      "math reasoning",
      "geometr\\w* problems?",
      "geometric reasoning",
      "geometry reasoning",
      "geometry theorems?",
      "symbolic regression",
      "equation discovery",
      "premise selection",
      "conjecture (?:generation|discovery|proving)",
      "olympiads?",
      "putnam",
      "theorem (?:generation|discovery)",
      "formal mathematics",
      "formal math",
      "mathematical notation",
      "arithmetic reasoning",
      "mathematical discovery",
    ].join("|") +
    ")",
  "i"
);

/**
 * "Theorem proving" also names program/hardware/legal verification and maths
 * education tooling. Those are not AI4Math research, and the classifier alone
 * lets some through because their abstracts mention learning, training or
 * agents. This list is the precision half of the filter.
 */
export const NON_MATH_TITLE =
  /\b(filesystem|file system|blockchain|ethereum|smart contract|wireless|robot|robotic|hardware|circuit|compiler|operating system|datacenter|malware|security|protocol|cryptograph|medical|clinical|biological|chemical|climate|traffic|protein|molecul|quantum|physics|image classification|speech|recommendation|classroom|education|educational|teaching|students|legal|law|recipe|cooking|fact verification|geo-localization|fairness|safety-critical|pilot|aircraft|infrastructure|gamification|reliability|performance analysis|polymorphism|haskell|tutorial|\bIDE\b|softmax|inverse problems|string landscape|epistemic|probabilistic reasoning|game of theorems|dependability|financial|trading|shuffle-exchange|\bDFT\b|\bDRBD\b|deep neural network|neural network models|distance geometry problem|market maker|defi|3d|keypoints?|point clouds?)\b/i;

export const NON_MATH_ABSTRACT =
  /\b(filesystem|file system|blockchain|ethereum|smart contract|wireless|robotic|hardware|circuit|compiler|operating system|datacenter|malware|security protocol|cryptographic protocol|medical|clinical|biological|chemical|climate|traffic|protein|molecul|quantum circuit|image classification|speech recognition|legal reasoning|recipe|cooking|fact verification|geo-localization|fairness|safety-critical|aircraft|infrastructure framework|gamification|performance analysis|softmax|string landscape)\b/i;

export function normalizeTitle(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const TITLE_STOPWORDS = new Set([
  "a", "an", "the", "of", "for", "and", "on", "in", "to", "with", "via",
  "from", "by", "using", "towards", "toward",
]);

export function titleTokens(value: string): Set<string> {
  return new Set(
    value
      .normalize("NFKC")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 1 && !TITLE_STOPWORDS.has(token))
  );
}

/** Same paper under two publishers usually keeps most of its title tokens. */
export function titleOverlap(a: string, b: string): number {
  const left = titleTokens(a);
  const right = titleTokens(b);
  if (left.size === 0 || right.size === 0) return 0;
  let shared = 0;
  for (const token of left) if (right.has(token)) shared += 1;
  return shared / Math.min(left.size, right.size);
}

/** Round-robin across research areas so no single theme fills the year. */
export function pickBalanced<T extends { area?: ResearchArea; score: number }>(
  candidates: T[],
  count: number
): T[] {
  const groups = new Map<ResearchArea | "unknown", T[]>();
  for (const entry of [...candidates].sort((a, b) => b.score - a.score)) {
    const key = entry.area ?? "unknown";
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  }
  const order = [...groups.entries()]
    .sort((a, b) => (b[1][0]?.score ?? 0) - (a[1][0]?.score ?? 0))
    .map(([area]) => area);
  const picked: T[] = [];
  let round = 0;
  while (picked.length < count) {
    let advanced = false;
    for (const area of order) {
      const list = groups.get(area) ?? [];
      const entry = list[round];
      if (!entry) continue;
      advanced = true;
      picked.push(entry);
      if (picked.length === count) break;
    }
    if (!advanced) break;
    round += 1;
  }
  return picked;
}

export function decodeHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
