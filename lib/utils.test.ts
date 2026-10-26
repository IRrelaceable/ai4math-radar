import { describe, expect, it } from "vitest";
import {
  clamp,
  formatDate,
  formatDateLong,
  matchesQuery,
  monthKey,
  slugify,
  sortEvents,
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
    researchArea: "Mathematical Reasoning",
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
    expect(slugify("Mathematical Reasoning")).toBe("mathematical-reasoning");
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

  it("formatDate passes through invalid months", () => {
    expect(formatDate("2024-13-01", "en")).toBe("2024-13-01");
  });

  it("formatDate passes through malformed input untouched", () => {
    expect(formatDate("2024-07", "en")).toBe("2024-07");
    expect(formatDateLong("", "en")).toBe("");
  });

  it("yearOf and monthKey slice the ISO string", () => {
    expect(yearOf("2025-11-08")).toBe("2025");
    expect(monthKey("2025-11-08")).toBe("2025-11");
  });

  it("clamp bounds values", () => {
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(5, 0, 10)).toBe(5);
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


