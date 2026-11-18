import { describe, expect, it } from "vitest";
import type { LLMProvider } from "@/lib/llm/provider";
import { parseEnrichment, enrichResearchItem } from "./enrich";
import type { RawResearchItem } from "@/types";

const REPLY = JSON.stringify({
  summary: "A Lean formalization of a combinatorics result.",
  significance: "It makes the proof machine-checkable.",
  titleZh: "一个组合结果的 Lean 形式化",
  summaryZh: "对该结果的形式化描述。",
  significanceZh: "它使证明可机器检查。",
  aiRole: {
    level: "assisted",
    description: "An AI system searched for the proof.",
    humanContribution: "Humans verified it.",
    zh: { description: "AI 搜索了证明。", humanContribution: "人类验证了它。" },
  },
  entities: {
    people: ["Terence Tao"],
    institutions: [],
    projects: [],
    systems: ["Lean 4"],
  },
  direction: "ai4math",
});

function countingProvider(
  reply: string,
  fail = false
): { provider: LLMProvider; calls: () => number; system: () => string | undefined } {
  let count = 0;
  let system: string | undefined;
  const provider: LLMProvider = {
    id: "fake",
    complete: async (_prompt, options) => {
      count += 1;
      system = options?.system;
      if (fail) throw new Error("provider down");
      return reply;
    },
  };
  return { provider, calls: () => count, system: () => system };
}

const item: RawResearchItem = {
  id: "x1",
  title: "Formalizing a combinatorics result in Lean",
  abstract: "We formalize the result and verify it in Lean 4.",
  source: "arXiv",
  url: "https://arxiv.org/abs/2601.00001",
  publishedAt: "2026-01-01",
};

const classification = {
  isAI4Math: true,
  researchArea: "Mathematical Reasoning & LLMs" as const,
  subArea: "theorem proving",
  reasons: ["test"],
};

describe("merged enrichment", () => {
  it("parses all four extractions from one JSON reply", () => {
    const parsed = parseEnrichment(`\`\`\`json\n${REPLY}\n\`\`\``);
    expect(parsed).toMatchObject({
      summary: "A Lean formalization of a combinatorics result.",
      significance: "It makes the proof machine-checkable.",
      titleZh: "一个组合结果的 Lean 形式化",
      direction: "ai4math",
      aiRole: { level: "assisted" },
      entities: { people: ["Terence Tao"], systems: ["Lean 4"] },
    });
  });

  it("rejects a reply without a summary instead of shipping partial data", () => {
    expect(parseEnrichment('{"direction":"ai4math"}')).toBeUndefined();
    expect(parseEnrichment("not json")).toBeUndefined();
  });

  it("rejects an English-only reply so the per-field path can restore Chinese", () => {
    const reply = JSON.stringify({ summary: "English only", direction: "ai4math" });
    expect(parseEnrichment(reply)).toBeUndefined();
  });

  it("rejects a reply that only fills the three formerly-required fields", () => {
    // The exact regression: summary + titleZh + summaryZh used to be accepted
    // as success while aiRole / entities / direction were silently dropped.
    const reply = JSON.stringify({
      summary: "An English summary.",
      titleZh: "中文标题",
      summaryZh: "中文摘要",
    });
    expect(parseEnrichment(reply)).toBeUndefined();
  });

  it("rejects a reply missing any single top-level key", () => {
    const full = JSON.parse(REPLY);
    for (const key of Object.keys(full)) {
      const partial = { ...full };
      delete partial[key];
      expect(parseEnrichment(JSON.stringify(partial)), `missing ${key} must fall back`).toBeUndefined();
    }
  });

  it("accepts explicit none values instead of treating them as missing", () => {
    const reply = JSON.stringify({
      ...JSON.parse(REPLY),
      significance: "",
      significanceZh: "",
      aiRole: { level: "not_applicable" },
      entities: { people: [], institutions: [], projects: [], systems: [] },
      direction: "none",
    });
    const parsed = parseEnrichment(reply);
    expect(parsed).toBeDefined();
    expect(parsed?.significance).toBe("");
    expect(parsed?.significanceZh).toBe("");
    expect(parsed?.aiRole.level).toBe("not_applicable");
    expect(parsed?.entities).toBeUndefined();
    expect(parsed?.direction).toBeUndefined();
  });

  it("rejects an entire reply whose aiRole level is invalid", () => {
    const reply = JSON.stringify({ ...JSON.parse(REPLY), aiRole: { level: "bogus" } });
    expect(parseEnrichment(reply)).toBeUndefined();
  });

  it("rejects an entity group that is not an explicit array", () => {
    const reply = JSON.parse(REPLY);
    reply.entities = { people: ["Terence Tao"] };
    expect(parseEnrichment(JSON.stringify(reply))).toBeUndefined();
  });

  it("uses exactly one provider call for a research item", async () => {
    const { provider, calls } = countingProvider(REPLY);
    const result = await enrichResearchItem(item, classification, provider);
    expect(result?.direction).toBe("ai4math");
    expect(calls()).toBe(1);
  });

  it("sends one authoritative output format and keeps direction boundary examples", async () => {
    const { provider, system } = countingProvider(REPLY);
    await enrichResearchItem(item, classification, provider);
    const prompt = system() ?? "";
    // One schema, stated once — no competing per-rubric "reply with JSON" lines.
    expect(prompt).toContain("using EXACTLY these eight keys");
    expect(prompt.match(/Reply with ONE JSON object/g)).toHaveLength(1);
    expect(prompt).not.toContain('"researchObject":"..."');
    expect(prompt).not.toContain("Omit empty groups and reply {}");
    // Judgment rules still present, including the locked boundary examples.
    expect(prompt).toContain("=== DIRECTION rubric");
    expect(prompt).toContain("Solving olympiad geometry without human demonstrations");
  });

  it("returns undefined on provider failure so the pipeline falls back", async () => {
    const { provider, calls } = countingProvider("", true);
    const result = await enrichResearchItem(item, classification, provider);
    expect(result).toBeUndefined();
    expect(calls()).toBe(1);
  });

  it("makes zero calls on the offline mock provider", async () => {
    const { provider, calls } = countingProvider(REPLY);
    provider.id = "mock";
    const result = await enrichResearchItem(item, classification, provider);
    expect(result).toBeUndefined();
    expect(calls()).toBe(0);
  });
});
