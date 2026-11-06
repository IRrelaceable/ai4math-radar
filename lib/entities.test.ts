import { describe, expect, it } from "vitest";
import type { ResearchEvent } from "@/types";
import {
  buildEntityThreads,
  eventEntities,
  normalizeEntityName,
  threadsForEvent,
} from "./entities";

function makeEvent(overrides: Partial<ResearchEvent>): ResearchEvent {
  return {
    id: `evt_${overrides.slug ?? "test"}`,
    title: "Test",
    slug: "test",
    summary: "s",
    significance: "",
    date: "2026-01-01",
    eventType: "Research",
    sourceType: "arxiv",
    sourceUrl: "https://example.com/story",
    authors: [],
    relatedWorks: [],
    provenance: "automated",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("entity threads", () => {
  it("folds case, spacing, padding punctuation and a leading The", () => {
    expect(normalizeEntityName("  The  Clay Mathematics Institute. ")).toBe(
      "clay mathematics institute"
    );
    expect(normalizeEntityName("Terence Tao")).toBe("terence tao");
  });

  it("threads research events by author name across spellings", () => {
    const events = [
      makeEvent({ slug: "a", title: "A", date: "2024-01-01", authors: ["Terence Tao"] }),
      makeEvent({ slug: "b", title: "B", date: "2025-01-01", authors: ["Terence  Tao"] }),
    ];
    const threads = buildEntityThreads(events);
    expect(threads).toHaveLength(1);
    expect(threads[0].kind).toBe("person");
    expect(threads[0].name).toBe("Terence Tao");
    expect(threads[0].events.map((e) => e.slug)).toEqual(["a", "b"]);
    expect(threadsForEvent(threads, "b")[0].events).toHaveLength(2);
  });

  it("drops one-off entities but keeps institution chains", () => {
    const events = [
      makeEvent({
        slug: "a",
        title: "A",
        date: "2024-01-01",
        institution: "Google DeepMind",
        authors: ["Solo Author"],
      }),
      makeEvent({
        slug: "b",
        title: "B",
        date: "2025-01-01",
        eventType: "Funding",
        institution: "The Google DeepMind",
      }),
    ];
    const threads = buildEntityThreads(events);
    expect(threads.map((t) => t.name)).toEqual(["Google DeepMind"]);
    expect(threads[0].kind).toBe("institution");
  });

  it("ignores news bylines on ecosystem events", () => {
    const events = [
      makeEvent({
        slug: "a",
        title: "Fields Medals",
        eventType: "People",
        authors: ["Susie"],
        metadata: { people: [{ name: "John Pardon" }] },
      }),
      makeEvent({
        slug: "b",
        title: "Clay Research Awards",
        eventType: "People",
        authors: ["Susie"],
        metadata: { people: [{ name: "John Pardon" }] },
      }),
    ];
    const keys = events.flatMap((event) => eventEntities(event)).map((ref) => ref.key);
    expect(keys).toContain("person|john pardon");
    expect(keys).not.toContain("person|susie");
  });

  it("threads named systems and projects as separate kinds", () => {
    const events = [
      makeEvent({ slug: "a", title: "A", benchmark: ["miniF2F"], authors: [] }),
      makeEvent({ slug: "b", title: "B", benchmark: ["miniF2F"], authors: [] }),
      makeEvent({
        slug: "c",
        title: "C",
        eventType: "Institutions",
        metadata: { projects: ["AI for Math Fund"] },
      }),
      makeEvent({
        slug: "d",
        title: "D",
        eventType: "Institutions",
        metadata: { projects: ["AI for Math Fund"] },
      }),
    ];
    const threads = buildEntityThreads(events);
    const kinds = Object.fromEntries(threads.map((t) => [t.name, t.kind]));
    expect(kinds["miniF2F"]).toBe("system");
    expect(kinds["AI for Math Fund"]).toBe("project");
  });

  it("merges an acronym with its full name when the match is unique", () => {
    const events = [
      makeEvent({
        slug: "a",
        title: "A",
        eventType: "Institutions",
        metadata: { projects: ["International Mathematical Olympiad", "IMO"] },
      }),
      makeEvent({
        slug: "b",
        title: "B",
        eventType: "Institutions",
        metadata: { projects: ["IMO"] },
      }),
    ];
    const threads = buildEntityThreads(events);
    expect(threads).toHaveLength(1);
    expect(threads[0].name).toBe("International Mathematical Olympiad");
    expect(threads[0].events.map((e) => e.slug)).toEqual(["a", "b"]);
  });

  it("does not merge an acronym that matches two different expansions", () => {
    const events = [
      makeEvent({
        slug: "a",
        title: "A",
        eventType: "Institutions",
        metadata: { projects: ["Machine Intelligence Team", "MIT"] },
      }),
      makeEvent({
        slug: "a2",
        title: "A2",
        eventType: "Institutions",
        metadata: { projects: ["Machine Intelligence Team", "MIT"] },
      }),
      makeEvent({
        slug: "b",
        title: "B",
        eventType: "Institutions",
        metadata: { projects: ["Mathematical Institute of Technology", "MIT"] },
      }),
      makeEvent({
        slug: "b2",
        title: "B2",
        eventType: "Institutions",
        metadata: { projects: ["Mathematical Institute of Technology", "MIT"] },
      }),
    ];
    const names = buildEntityThreads(events).map((t) => t.name);
    expect(names).toContain("MIT");
    expect(names).toContain("Machine Intelligence Team");
    expect(names).toContain("Mathematical Institute of Technology");
  });

  it("does not thread a name only one event states", () => {
    const threads = buildEntityThreads([
      makeEvent({ slug: "a", title: "A", authors: ["Lonely Author"] }),
    ]);
    expect(threads).toHaveLength(0);
  });
});
