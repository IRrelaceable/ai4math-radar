import { describe, expect, it } from "vitest";
import { mergeEvents } from "./seedStore";
import type { ResearchEvent } from "@/types";

function makeEvent(overrides: Partial<ResearchEvent>): ResearchEvent {
  return {
    id: "evt-test",
    title: "Test",
    slug: "test",
    summary: "s",
    significance: "sig",
    date: "2026-01-01",
    eventType: "Research",
    sourceType: "news",
    sourceUrl: "https://example.com/story",
    authors: [],
    relatedWorks: [],
    provenance: "automated",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("mergeEvents", () => {
  it("keeps one card when the same article arrives from two sources", () => {
    const curated = makeEvent({
      id: "curated",
      slug: "simons-15m",
      provenance: "curated",
      sourceUrl: "https://www.simonsfoundation.org/news/story/",
    });
    const automated = makeEvent({
      id: "feed",
      slug: "simons-15m-feed-suffix",
      provenance: "automated",
      sourceUrl: "https://www.simonsfoundation.org/news/story",
    });

    const merged = mergeEvents([curated], [automated]);
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("curated");
  });

  it("prefers a seed record without provenance over a newer automated copy", () => {
    const seed = makeEvent({
      id: "seed",
      slug: "simons-15m",
      provenance: undefined,
      sourceUrl: "https://www.simonsfoundation.org/news/story/",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    const automated = makeEvent({
      id: "feed",
      slug: "simons-15m-feed-suffix",
      provenance: "automated",
      sourceUrl: "https://www.simonsfoundation.org/news/story",
      updatedAt: "2026-02-01T00:00:00.000Z",
    });

    const merged = mergeEvents([seed], [automated]);
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("seed");
  });

  it("does not merge distinct events that share a homepage URL", () => {
    const a = makeEvent({ id: "a", slug: "a", sourceUrl: "https://example.org/" });
    const b = makeEvent({ id: "b", slug: "b", sourceUrl: "https://example.org/" });

    expect(mergeEvents([a, b], [])).toHaveLength(2);
  });

  it("newer automated content replaces an older copy of the same story", () => {
    const older = makeEvent({ id: "older", slug: "older", updatedAt: "2026-01-01T00:00:00.000Z" });
    const newer = makeEvent({ id: "newer", slug: "newer", updatedAt: "2026-02-01T00:00:00.000Z" });

    const merged = mergeEvents([older], [newer]);
    expect(merged.map((event) => event.id)).toEqual(["newer"]);
  });
});
