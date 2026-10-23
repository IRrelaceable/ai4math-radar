import type { RawResearchItem } from "@/types";
import { getLLMProvider, type LLMProvider } from "@/lib/llm/provider";
import type { Classification } from "./classifier";

export interface GeneratedText {
  summary: string;
  significance: string;
}

const SYSTEM =
  "You are a research analyst for an AI-for-Mathematics tracking platform. " +
  "Answer with two short paragraphs labeled SUMMARY and WHY IT MATTERS. Be factual; never invent results.";

/**
 * Stage 6 (generate Research Event text). The mock path composes text from the
 * raw item so the platform never requires a live LLM API.
 */
export async function summarize(
  item: RawResearchItem,
  classification: Classification,
  provider: LLMProvider = getLLMProvider()
): Promise<GeneratedText> {
  const base = item.abstract?.trim();
  const fallbackSummary =
    base ?? `${item.title} was reported by ${item.source}.`;

  const fallbackSignificance =
    `Filed under ${classification.researchArea}` +
    `${classification.subArea ? ` → ${classification.subArea}` : ""}. ` +
    "Automated ingest — check the linked source before citing.";

  if (provider.id !== "mock") {
    try {
      const prompt =
        `Title: ${item.title}\n\nAbstract: ${item.abstract ?? "(none)"}\n\n` +
        `Classification: ${classification.researchArea} (${classification.subArea ?? "-"}).`;
      const out = await provider.complete(prompt, { system: SYSTEM });
      const parsed = parseLabeled(out);
      return {
        summary: parsed.summary || fallbackSummary,
        significance: parsed.significance || fallbackSignificance,
      };
    } catch (error) {
      console.warn("[ai4math] LLM summarization failed, using deterministic fallback.", error);
    }
  }

  return { summary: fallbackSummary, significance: fallbackSignificance };
}

function parseLabeled(text: string): Partial<GeneratedText> {
  const summary = /summary[:\s]*([\s\S]*?)(?:why it matters|$)/i.exec(text)?.[1]?.trim();
  const significance = /why it matters[:\s]*([\s\S]*)$/i.exec(text)?.[1]?.trim();
  return { summary, significance };
}
