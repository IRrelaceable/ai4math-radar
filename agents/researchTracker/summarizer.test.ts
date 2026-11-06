import { describe, expect, it } from "vitest";
import type { RawResearchItem } from "@/types";
import type { LLMProvider } from "@/lib/llm/provider";
import { summarize } from "./summarizer";

const item: RawResearchItem = {
  id: "evt-1",
  sourceId: "openai-news",
  title: "Working with academic communities",
  abstract: "Model results on the Kakeya conjecture.",
  source: "OpenAI News",
};

const classification = {
  isAI4Math: true,
  researchArea: "Mathematical Discovery & Symbolic Computation" as const,
  subArea: "AI-proved results & conjectures",
  reasons: [],
};

const bilingual = `SUMMARY: English summary.
WHY IT MATTERS: English significance.
TITLE_ZH: 与学术界合作
SUMMARY_ZH: 中文摘要。
WHY IT MATTERS_ZH: 中文意义。`;

describe("summarizer", () => {
  it("keeps English and Chinese sections from a single call", async () => {
    let calls = 0;
    const provider: LLMProvider = {
      id: "test",
      async complete() {
        calls += 1;
        return bilingual;
      },
    };

    const text = await summarize(item, classification, provider);
    expect(text.summary).toBe("English summary.");
    expect(text.significance).toBe("English significance.");
    expect(text.titleZh).toBe("与学术界合作");
    expect(text.summaryZh).toBe("中文摘要。");
    expect(text.significanceZh).toBe("中文意义。");
    expect(calls).toBe(1);
  });

  it("splits labels the model wrote with underscores", async () => {
    const provider: LLMProvider = {
      id: "test",
      async complete() {
        return `SUMMARY: English summary.
WHY IT MATTERS: English significance.
TITLE_ZH: 标题
SUMMARY_ZH: 中文摘要。
WHY_IT MATTERS_ZH: 中文意义。`;
      },
    };

    const text = await summarize(item, classification, provider);
    expect(text.summaryZh).toBe("中文摘要。");
    expect(text.significanceZh).toBe("中文意义。");
  });

  it("falls back to a second translate call when the Chinese block is missing", async () => {
    let calls = 0;
    const provider: LLMProvider = {
      id: "test",
      async complete() {
        calls += 1;
        if (calls === 1) return "SUMMARY: Only English.\nWHY IT MATTERS: Still English.";
        return "TITLE_ZH: 标题\nSUMMARY_ZH: 摘要\nWHY IT MATTERS_ZH: 意义";
      },
    };

    const text = await summarize(item, classification, provider);
    expect(calls).toBe(2);
    expect(text.titleZh).toBe("标题");
    expect(text.summaryZh).toBe("摘要");
  });
});
