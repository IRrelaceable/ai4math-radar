import { describe, expect, it } from "vitest";
import {
  clamp,
  eventSearchText,
  formatDate,
  formatDateLong,
  formatMonth,
  formatMonthDay,
  matchesQuery,
  monthKey,
  slugify,
  sourceHost,
  sortEvents,
  truncateText,
  yearOf,
} from "@/lib/utils";
import type { ResearchEvent } from "@/types";

function makeEvent(overrides: Partial<ResearchEvent>): ResearchEvent {
  return {
    id: "evt-test",
    title: "Test",
    slug: "test",
    summary: "s",
    significance: "sig",
    date: "2026-01-01",
    researchArea: "Mathematical Reasoning & LLMs",
    sourceType: "arxiv",
    sourceUrl: "https://example.com/paper",
    authors: ["A"],
    relatedWorks: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Mathematical Reasoning & LLMs")).toBe("mathematical-reasoning-and-llms");
  });

  it("expands ampersand to 'and'", () => {
    expect(slugify("Benchmarks & Datasets")).toBe("benchmarks-and-datasets");
  });

  it("strips leading and trailing hyphens", () => {
    expect(slugify("  !! Hello !!  ")).toBe("hello");
  });
});

describe("date helpers", () => {
  it("formatDate renders day precision in English", () => {
    expect(formatDate("2024-07-25", "en")).toBe("Jul 25, 2024");
  });

  it("formatDate renders day precision in Chinese", () => {
    expect(formatDate("2024-07-25", "zh")).toBe("2024年7月25日");
  });

  it("formatDateLong renders full month in English", () => {
    expect(formatDateLong("2024-07-25", "en")).toBe("July 25, 2024");
  });

  it("formatDateLong renders day precision in Chinese", () => {
    expect(formatDateLong("2024-07-25", "zh")).toBe("2024年7月25日");
  });

  it("defaults to Chinese when no lang is passed", () => {
    expect(formatDate("2024-07-25")).toBe("2024年7月25日");
  });

  it("parses from the string, avoiding the UTC rollback", () => {
    // new Date("2024-07-25") is UTC midnight → July 24 in negative-offset zones.
    expect(formatDate("2024-07-25", "en")).toContain("25");
  });

  it("formatDateLong accepts pipeline timestamps", () => {
    expect(formatDateLong("2026-10-28T08:05:41.678Z", "zh")).toBe("2026年10月28日");
  });

  it("formatDate passes through invalid months", () => {
    expect(formatDate("2024-13-01", "en")).toBe("2024-13-01");
  });

  it("formatDate passes through malformed input untouched", () => {
    expect(formatDate("2024-07", "en")).toBe("2024-07");
    expect(formatDateLong("", "en")).toBe("");
  });

  it("formatMonth accepts a month key or a full date", () => {
    expect(formatMonth("2026-10", "zh")).toBe("10月");
    expect(formatMonth("2026-10-27", "en")).toBe("October");
    expect(formatMonth("2026-13", "en")).toBe("2026-13");
  });

  it("yearOf and monthKey slice the ISO string", () => {
    expect(yearOf("2025-11-08")).toBe("2025");
    expect(monthKey("2025-11-08")).toBe("2025-11");
  });

  it("formatMonthDay keeps zero padding for the timeline rail", () => {
    expect(formatMonthDay("2024-07-25")).toBe("07-25");
    expect(formatMonthDay("2026-10-28T08:05:41.678Z")).toBe("10-28");
    expect(formatMonthDay("2024-13-01")).toBe("2024-13-01");
  });

  it("sourceHost strips scheme, www and path", () => {
    expect(sourceHost("https://www.arxiv.org/abs/2405.14333")).toBe("arxiv.org");
    expect(sourceHost("https://openai.com/index/some-post")).toBe("openai.com");
    expect(sourceHost(undefined)).toBeUndefined();
    expect(sourceHost("not a url")).toBeUndefined();
  });

  it("clamp bounds values", () => {
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(5, 0, 10)).toBe(5);
  });
});

describe("truncateText", () => {
  it("leaves short text untouched", () => {
    expect(truncateText("short", 10)).toBe("short");
  });

  it("cuts long text near a word boundary and marks the omission", () => {
    const out = truncateText("The quick brown fox jumps over the lazy dog", 20);
    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(21);
    expect(out).not.toContain("jumps");
  });

  it("cuts CJK text without spaces", () => {
    const out = truncateText("定理证明中的形式化方法", 5);
    expect(out).toBe("定理证明中…");
  });
});

describe("eventSearchText", () => {
  it("includes the stored Chinese translation so zh queries match", () => {
    const e = makeEvent({
      title: "Theorem proving with Lean",
      translations: { zh: { title: "用 Lean 做定理证明", summary: "形式化数学" } },
    });
    expect(matchesQuery(eventSearchText(e), "定理证明")).toBe(true);
    expect(matchesQuery(eventSearchText(e), "形式化")).toBe(true);
    expect(matchesQuery(eventSearchText(e), "lean")).toBe(true);
  });
});

describe("matchesQuery", () => {
  it("is case-insensitive", () => {
    expect(matchesQuery("Navier-Stokes formalisation", "navier")).toBe(true);
  });

  it("empty query matches everything", () => {
    expect(matchesQuery("anything", "   ")).toBe(true);
  });

  it("non-matching text returns false", () => {
    expect(matchesQuery("abc", "xyz")).toBe(false);
  });
});

describe("sortEvents", () => {
  it("orders newest first without mutating the input", () => {
    const a = makeEvent({ id: "a", date: "2024-01-01" });
    const b = makeEvent({ id: "b", date: "2026-01-01" });
    const input = [a, b];
    const sorted = sortEvents(input);
    expect(sorted.map((e) => e.id)).toEqual(["b", "a"]);
    expect(input.map((e) => e.id)).toEqual(["a", "b"]);
  });
});


