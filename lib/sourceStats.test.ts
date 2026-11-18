import { describe, expect, it } from "vitest";
import { computeSourceStats } from "./sourceStats";
import type { ResearchEvent } from "@/types";

function ev(overrides: Partial<ResearchEvent>): ResearchEvent {
  return {
    id: "x",
    slug: "x",
    title: "x",
    summary: "x",
    significance: "x",
    date: "2026-01-01",
    sourceType: "blog",
    sourceUrl: "https://example.com/x",
    authors: [],
    relatedWorks: [],
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...overrides,
  } as ResearchEvent;
}

describe("computeSourceStats", () => {
  it("counts source records and distinct events separately", () => {
    const stats = computeSourceStats([
      ev({
        sourceTier: "S1",
        sources: [
          { url: "https://a", tier: "S0" },
          { url: "https://b", tier: "S0" },
          { url: "https://c", tier: "S2" },
        ],
      }),
      ev({
        id: "y",
        sourceTier: "S0",
        sources: [{ url: "https://d", tier: "S0" }],
      }),
    ]);
    expect(stats.totalSources).toBe(4);
    // 3 S0 records across 2 events; 1 S2 record across 1 event.
    expect(stats.byTier.S0).toEqual({ sources: 3, events: 2 });
    expect(stats.byTier.S2).toEqual({ sources: 1, events: 1 });
    expect(stats.byTier.S1).toEqual({ sources: 0, events: 0 });
  });

  it("falls back to the event tier when sources are absent", () => {
    const stats = computeSourceStats([ev({ sourceTier: "S3" })]);
    expect(stats.totalSources).toBe(1);
    expect(stats.byTier.S3).toEqual({ sources: 1, events: 1 });
  });
});
