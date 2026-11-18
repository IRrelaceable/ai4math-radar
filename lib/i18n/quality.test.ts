import { describe, expect, it } from "vitest";
import type { ResearchEvent } from "@/types";
import { missingChineseCardFields } from "./quality";

const event = {
  id: "test",
  slug: "test",
  title: "Lean Grimoire",
  summary: "A research note.",
  significance: "",
  date: "2026-11-12",
  sourceUrl: "https://example.com",
} as ResearchEvent;

describe("Chinese card publication gate", () => {
  it("rejects the English fallback caused by missing translations", () => {
    expect(missingChineseCardFields(event)).toEqual(["title", "summary"]);
  });

  it("accepts an untranslated proper name when the summary is Chinese", () => {
    expect(missingChineseCardFields({
      ...event,
      translations: { zh: { title: "Lean Grimoire", summary: "介绍数学可视化项目。" } },
    })).toEqual([]);
  });

  it("requires Chinese significance only when English significance is present", () => {
    expect(missingChineseCardFields({
      ...event,
      significance: "Why this work matters.",
      translations: { zh: { title: "研究项目", summary: "介绍研究项目。" } },
    })).toEqual(["significance"]);
  });
});
