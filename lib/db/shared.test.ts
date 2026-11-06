import { describe, expect, it } from "vitest";
import { buildTopicStats, searchEvents } from "@/lib/db/shared";
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
    sourceUrl: "https://example.com/claim",
    authors: ["A"],
    relatedWorks: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildTopicStats", () => {
  it("aggregates counts, latest dates and facets per area", () => {
    const stats = buildTopicStats([
      makeEvent({ researchArea: "Geometry", date: "2025-01-01", model: ["M1"] }),
      makeEvent({ researchArea: "Geometry", date: "2026-01-01", model: ["M1", "M2"], benchmark: ["B1"] }),
      makeEvent({ researchArea: "Theorem Proving & Formal Mathematics", date: "2024-01-01" }),
    ]);
    expect(stats[0].topic).toBe("Geometry");
    expect(stats[0].count).toBe(2);
    expect(stats[0].latestDate).toBe("2026-01-01");
    expect(stats[0].models).toEqual(["M1", "M2"]);
    expect(stats[0].benchmarks).toEqual(["B1"]);
    expect(stats[1].count).toBe(1);
  });

  it("slugs areas for URLs", () => {
    const stats = buildTopicStats([makeEvent({ researchArea: "Benchmarks & Datasets" })]);
    expect(stats[0].slug).toBe("benchmarks-and-datasets");
  });
});

describe("searchEvents", () => {
  const events = [
    makeEvent({ id: "e1", slug: "navier-stokes", title: "Navier-Stokes autoformalisation" }),
    makeEvent({
      id: "e2",
      slug: "other",
      title: "Unrelated",
      papers: [{ title: "Attention Is All You Need", url: "https://example.com/attention" }],
      model: ["Kimi K3"],
    }),
  ];

  it("empty query returns nothing", () => {
    expect(searchEvents(events, "   ").total).toBe(0);
  });

  it("matches event titles into event groups", () => {
    const res = searchEvents(events, "navier");
    const group = res.groups.find((g) => g.kind === "event");
    expect(group?.href).toBe("/research/navier-stokes");
  });

  it("matches paper titles into paper groups", () => {
    const res = searchEvents(events, "attention");
    const group = res.groups.find((g) => g.kind === "paper");
    expect(group?.href).toBe("https://example.com/attention");
  });

  it("model facets link into the feed", () => {
    const res = searchEvents(events, "kimi");
    const group = res.groups.find((g) => g.kind === "model");
    expect(group?.href).toBe("/latest?model=Kimi%20K3");
  });

  it("total equals group count", () => {
    const res = searchEvents(events, "navier");
    expect(res.total).toBe(res.groups.length);
  });
});
