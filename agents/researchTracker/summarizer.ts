import type { RawResearchItem } from "@/types";
import { getLLMProvider, type LLMProvider } from "@/lib/llm/provider";
import type { Classification } from "./classifier";

export interface GeneratedText {
  summary: string;
  significance: string;
  /** Simplified Chinese counterparts, so the zh UI never mixes languages. */
  titleZh?: string;
  summaryZh?: string;
  significanceZh?: string;
}

const SYSTEM =
  "You are a research analyst for an AI-for-Mathematics tracking platform. " +
  "Reply in plain text using exactly these labels, in this order: " +
  "SUMMARY:, WHY IT MATTERS:, TITLE_ZH:, SUMMARY_ZH:, WHY IT MATTERS_ZH:. " +
  "The first two are concise English prose; the last three express the same content in " +
  "Simplified Chinese, with TITLE_ZH translating the given title. In the Chinese text, " +
  "translate theorem, conjecture and field names into Chinese and keep the original term " +
  "in parentheses on first mention, e.g. 挂谷猜想（Kakeya conjecture）; leave model names, " +
  "Lean identifiers and abbreviations unchanged. Keep personal names in their original " +
  "spelling; never invent a Chinese transliteration the source does not give. Avoid " +
  "gendered pronouns (他/她/他们/她们): name the person or say 研究者、作者、团队. Keep class " +
  "years and similar shorthand as written (e.g. '11 stays '11). " +
  "Never use markdown, bullet lists or emphasis markers. Be factual; never invent results. " +
  "If the metadata has no abstract, say only what the title and source support and do not " +
  "comment on what the record lacks. " +
  "The classification line is background for you only: never mention the classification, " +
  "the taxonomy, or the tracking platform in your answer.";

const TRANSLATE_SYSTEM =
  "Translate the supplied event text into Simplified Chinese. " +
  "Reply in plain text with exactly these labels: TITLE_ZH:, SUMMARY_ZH:, WHY IT MATTERS_ZH:. " +
  "Translate theorem, conjecture and field names into Chinese and keep the original term in " +
  "parentheses on first mention, e.g. 挂谷猜想（Kakeya conjecture）; leave model names, Lean " +
  "identifiers and abbreviations unchanged. Keep personal names in their original spelling; " +
  "never invent a Chinese transliteration the source does not give. Avoid gendered pronouns " +
  "(他/她/他们/她们): name the person or say 研究者、作者、团队. " +
  "No markdown, no bullet lists, no commentary.";

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

  // Auto-ingested items have no curated "why it matters": the taxonomy and the
  // automated provenance are already surfaced by the area badge and the trust
  // badges, so leaving significance blank is more honest than echoing that
  // boilerplate into the prose. Card and detail views skip the section when it
  // is blank.
  const fallbackSignificance = "";

  if (provider.id !== "mock") {
    try {
      const prompt =
        `Title: ${item.title}\n\nAbstract: ${item.abstract ?? "(none)"}\n\n` +
        `Classification: ${classification.researchArea ?? "ecosystem event"} (${classification.subArea ?? "-"}).`;
      const out = await provider.complete(prompt, { system: SYSTEM, maxTokens: 1400 });
      const sections = parseSections(out);
      const text: GeneratedText = {
        summary: clean(sections.SUMMARY) || fallbackSummary,
        significance: clean(sections["WHY IT MATTERS"]) || fallbackSignificance,
        titleZh: clean(sections.TITLE_ZH) || undefined,
        summaryZh: clean(sections.SUMMARY_ZH) || undefined,
        significanceZh: clean(sections["WHY IT MATTERS_ZH"]) || undefined,
      };
      // Models occasionally drop the Chinese block while obeying the English
      // format; one cheap second call beats shipping a half-English card.
      if (!text.titleZh || !text.summaryZh) {
        try {
          const zh = await translateToChinese(
            { title: item.title, summary: text.summary, significance: text.significance },
            provider
          );
          text.titleZh ||= zh.title;
          text.summaryZh ||= zh.summary;
          text.significanceZh ||= zh.significance;
        } catch (error) {
          console.warn("[ai4math] Chinese translation failed, keeping English text.", error);
        }
      }
      return text;
    } catch (error) {
      console.warn("[ai4math] LLM summarization failed, using deterministic fallback.", error);
    }
  }

  return { summary: fallbackSummary, significance: fallbackSignificance };
}

/** Translate an already-written event into display Chinese (used for backfills). */
export async function translateToChinese(
  input: { title: string; summary: string; significance?: string },
  provider: LLMProvider = getLLMProvider()
): Promise<{ title?: string; summary?: string; significance?: string }> {
  if (provider.id === "mock") return {};
  const prompt =
    `TITLE: ${input.title}\n\nSUMMARY: ${input.summary}\n\n` +
    `WHY IT MATTERS: ${input.significance ?? ""}`;
  // Long, LaTeX-heavy summaries occasionally truncate before the last label;
  // one retry keeps the backfill moving without re-translating everything.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const out = await provider.complete(prompt, {
      system: TRANSLATE_SYSTEM,
      maxTokens: 1600,
    });
    const sections = parseSections(out);
    const title = clean(sections.TITLE_ZH) || undefined;
    const summary = clean(sections.SUMMARY_ZH) || undefined;
    if (title && summary) {
      return {
        title,
        summary,
        significance: clean(sections["WHY IT MATTERS_ZH"]) || undefined,
      };
    }
  }
  return {};
}

/**
 * Canonical section keys with a pattern that tolerates the model's habit of
 * joining label words with underscores ("WHY_IT MATTERS_ZH"). Longest labels
 * come first so "WHY IT MATTERS_ZH" is not consumed by "WHY IT MATTERS".
 */
const LABELS: { key: string; pattern: string }[] = [
  { key: "SUMMARY_ZH", pattern: "SUMMARY[ _]ZH" },
  { key: "WHY IT MATTERS_ZH", pattern: "WHY[ _]IT[ _]MATTERS[ _]ZH" },
  { key: "TITLE_ZH", pattern: "TITLE[ _]ZH" },
  { key: "SUMMARY", pattern: "SUMMARY" },
  { key: "WHY IT MATTERS", pattern: "WHY[ _]IT[ _]MATTERS" },
];

const LABEL_RESIDUE = /\b(?:SUMMARY|WHY[ _]IT[ _]MATTERS|TITLE)(?:[ _]ZH)?\s*[:：]/gi;

/** A label the model emitted but never filled in, left dangling at the end. */
const TRAILING_LABEL = /[\s:：]*(?:SUMMARY|WHY[ _]IT[ _]MATTERS|TITLE)(?:[ _]ZH)?\s*$/;

/**
 * Split labeled output into sections. An unrecognized label used to end up in
 * the adjacent section's prose, so the pattern here is deliberately loose.
 */
function parseSections(text: string): Record<string, string> {
  const pattern = LABELS.map((label) => label.pattern).join("|");
  // Chinese output often uses the full-width colon (：), so accept both.
  const re = new RegExp(`\\*{0,2}(${pattern})\\*{0,2}\\s*[:：]\\s*`, "gi");
  const matches = [...text.matchAll(re)];
  const sections: Record<string, string> = {};
  matches.forEach((match, index) => {
    const label = LABELS.find((entry) =>
      new RegExp(`^${entry.pattern}$`, "i").test(match[1])
    );
    if (!label) return;
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : text.length;
    sections[label.key] = text.slice(start, end).trim();
  });
  return sections;
}

/**
 * Models still wrap the labels in `**…**` even when told not to, which used to
 * leak raw asterisks into cards and the detail page. Strip emphasis markers
 * and any repeated label prefix, then collapse the whitespace.
 */
function clean(value?: string): string {
  if (!value) return "";
  return value
    .replace(/\*\*|__/g, "")
    .replace(/^\s*(?:summary|why it matters|title_zh|summary_zh|why it matters_zh)\s*:?\s*/i, "")
    // A label left over at the end (already split off, or dropped by the model)
    // must not survive as prose.
    .replace(LABEL_RESIDUE, " ")
    .replace(TRAILING_LABEL, "")
    .replace(/\s+/g, " ")
    .trim();
}
