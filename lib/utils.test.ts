import { describe, expect, it } from "vitest";
import {
  clamp,
  formatDate,
  formatDateLong,
  matchesQuery,
  monthKey,
  slugify,
  sortEvents,
  sortEventsByImportance,
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

describe("sortEventsByImportance", () => {
  it("assessed events first, highest tier first (H1 > H2 > H3)", () => {
    const low = makeEvent({ id: "low", date: "2026-01-01", importanceTier: "H3" });
    const high = makeEvent({ id: "high", date: "2025-01-01", importanceTier: "H1" });
    expect(sortEventsByImportance([low, high]).map((e) => e.id)).toEqual(["high", "low"]);
  });

  it("orders tiers H1, H2, H3 regardless of input order", () => {
    const h3 = makeEvent({ id: "h3", date: "2026-03-01", importanceTier: "H3" });
    const h1 = makeEvent({ id: "h1", date: "2024-01-01", importanceTier: "H1" });
    const h2 = makeEvent({ id: "h2", date: "2025-01-01", importanceTier: "H2" });
    expect(sortEventsByImportance([h3, h1, h2]).map((e) => e.id)).toEqual(["h1", "h2", "h3"]);
  });

  it("unassessed events follow assessed ones, newest first", () => {
    const old = makeEvent({ id: "old", date: "2024-01-01", importanceTier: "H3" });
    const none = makeEvent({ id: "none", date: "2026-06-01" });
    const newest = makeEvent({ id: "newest", date: "2026-01-01", importanceTier: "H2" });
    const sorted = sortEventsByImportance([old, none, newest]);
    expect(sorted.map((e) => e.id)).toEqual(["newest", "old", "none"]);
  });

  it("tier ties break by date (newest first)", () => {
    const a = makeEvent({ id: "a", date: "2026-01-01", importanceTier: "H2" });
    const b = makeEvent({ id: "b", date: "2025-01-01", importanceTier: "H2" });
    expect(sortEventsByImportance([a, b]).map((e) => e.id)).toEqual(["a", "b"]);
  });
});
