import type { AiRoleLevel, RawResearchItem } from "@/types";
import { getLLMProvider, type LLMProvider } from "@/lib/llm/provider";

/**
 * Attribution of a research result between AI systems and humans.
 *
 * This is deliberately separate from the summary: "AI is the subject of the
 * paper" is not the same as "an AI system produced the reported result". The
 * extractor only repeats what the source states and returns nothing when the
 * division of labour is absent.
 */
export interface ExtractedContribution {
  en: {
    level: AiRoleLevel;
    description?: string;
    humanContribution?: string;
  };
  /** Chinese prose counterparts; names and model identifiers stay unchanged. */
  zh?: {
    description?: string;
    humanContribution?: string;
  };
}

const LEVELS: readonly AiRoleLevel[] = [
  "autonomous",
  "assisted",
  "unclear",
  "not_applicable",
];

const SYSTEM =
  "You attribute a reported research result to AI systems and humans for an AI-for-Mathematics tracker. " +
  "Reply with a single JSON object and nothing else: no markdown fence, no commentary. " +
  "Use only facts stated in the supplied title and abstract. Choose exactly one level:\n" +
  "- autonomous: the source states an AI system produced the proof, solution, conjecture or discovery " +
  "with no or minimal human direction.\n" +
  "- assisted: the source reports mathematical results obtained by its own AI system — proofs, " +
  "solutions, conjectures, discoveries, or benchmark scores earned by that system — while humans built, " +
  "trained, curated data for, steered, formalized or checked it. This is the normal reading of a paper " +
  "or announcement about a system that solves mathematical problems.\n" +
  "- unclear: the source mentions AI involvement but says nothing about what the AI produced or what " +
  "the humans contributed.\n" +
  "- not_applicable: the event reports no mathematical work performed by an AI system — a benchmark's " +
  "problem set or another dataset/corpus release, a conference, education, funding, policy or community " +
  "milestone, a result produced only by humans (including historical results), or pure tooling that " +
  "reports no results.\n" +
  "Never call work autonomous when the source only announces a capability or a score; that is assisted. " +
  "A deterministic symbolic tool, compiler, metaprogram or script is not an AI system, and the word " +
  "\"automatically\" alone never establishes an AI role; such work is not_applicable. " +
  "Omit description or humanContribution when the source does not state it; humanContribution must " +
  "name what humans did — building, training, curating data, steering, formalizing, checking, " +
  "reviewing — never the AI's output, the result or the source itself. Keep each value to one " +
  "or two short sentences. Also include a \"zh\" object with the same two prose keys translated into " +
  "Simplified Chinese; keep personal names, model names, Lean identifiers and abbreviations in their " +
  "original spelling, do not invent Chinese transliterations, and use no gendered pronouns.";

const TRANSLATE_SYSTEM =
  "Translate the supplied English prose values into Simplified Chinese. " +
  "Reply with a single JSON object {\"description\": \"...\", \"humanContribution\": \"...\"} and nothing else. " +
  "Keep personal names, model names, Lean identifiers and abbreviations in their original spelling; " +
  "do not invent Chinese transliterations. Use no gendered pronouns.";

function text(value: unknown, max = 320): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) return undefined;
  if (trimmed.length <= max) return trimmed;
  const slice = trimmed.slice(0, max);
  const boundary = Math.max(
    slice.lastIndexOf(" "),
    slice.lastIndexOf("，"),
    slice.lastIndexOf("；"),
    slice.lastIndexOf("。")
  );
  return `${(boundary > max * 0.5 ? slice.slice(0, boundary) : slice).trimEnd()}…`;
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function parseJsonObject(response: string): Record<string, unknown> | undefined {
  const start = response.indexOf("{");
  const end = response.lastIndexOf("}");
  if (start === -1 || end <= start) return undefined;
  try {
    return record(JSON.parse(response.slice(start, end + 1)));
  } catch {
    return undefined;
  }
}

/** Parse and clamp a model reply; tolerate code fences and stray prose. */
export function parseContributionResponse(
  response: string
): ExtractedContribution | undefined {
  const start = response.indexOf("{");
  const end = response.lastIndexOf("}");
  if (start === -1 || end <= start) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(response.slice(start, end + 1));
  } catch {
    return undefined;
  }
  const source = record(parsed);
  if (!source) return undefined;
  const rawLevel = typeof source.level === "string" ? source.level.trim().toLowerCase() : "";
  const level = LEVELS.find((entry) => entry === rawLevel);
  if (!level) return undefined;
  const en = {
    level,
    description: text(source.description),
    humanContribution: text(source.humanContribution),
  };
  if (level === "not_applicable") return { en };
  const zhSource = record(source.zh);
  const zh = zhSource
    ? {
        description: text(zhSource.description),
        humanContribution: text(zhSource.humanContribution),
      }
    : undefined;
  return { en, zh };
}

/**
 * One extra LLM call, only for Research events. Items without an abstract are
 * skipped: a headline alone cannot establish how the work was divided.
 */
export async function extractContribution(
  item: Pick<RawResearchItem, "title" | "abstract" | "source">,
  provider: LLMProvider = getLLMProvider()
): Promise<ExtractedContribution | undefined> {
  if (provider.id === "mock") return undefined;
  if (!item.abstract?.trim()) return undefined;

  const prompt =
    `Title: ${item.title}\n\n` +
    `Abstract: ${item.abstract.trim()}\n\n` +
    `Source: ${item.source}\n\n` +
    `Reply with {"level": "...", "description": "...", "humanContribution": "...", "zh": {"description": "...", "humanContribution": "..."}}`;

  try {
    let parsed = parseContributionResponse(
      await provider.complete(prompt, { system: SYSTEM, maxTokens: 700 })
    );
    // Providers occasionally answer with an empty completion; one repeat is
    // enough and keeps a whole event from silently losing its attribution.
    if (!parsed) {
      parsed = parseContributionResponse(
        await provider.complete(prompt, { system: SYSTEM, maxTokens: 700 })
      );
    }
    if (!parsed || parsed.en.level === "not_applicable") return parsed;
    // Keep the zh page Chinese: retry once when the model returned prose
    // without its Chinese counterpart.
    if (parsed.en.description && !parsed.zh?.description) {
      try {
        const zhResponse = await provider.complete(
          JSON.stringify({
            description: parsed.en.description,
            humanContribution: parsed.en.humanContribution,
          }),
          { system: TRANSLATE_SYSTEM, maxTokens: 400 }
        );
        const zh = parseJsonObject(zhResponse);
        if (zh) {
          parsed.zh = {
            description: text(zh.description),
            humanContribution: text(zh.humanContribution),
          };
        }
      } catch (error) {
        console.warn("[ai4math] contribution translation failed.", error);
      }
    }
    return parsed;
  } catch (error) {
    console.warn("[ai4math] contribution extraction failed.", error);
    return undefined;
  }
}
