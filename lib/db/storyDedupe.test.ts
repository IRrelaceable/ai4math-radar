import { describe, expect, it } from "vitest";
import type { ResearchEvent } from "@/types";
import { dedupePersonStories, isSamePersonStory } from "./storyDedupe";

function makeEvent(overrides: Partial<ResearchEvent>): ResearchEvent {
  return {
    id: "evt-test",
    title: "Test",
    slug: "test",
    summary: "A short summary.",
    significance: "Why it matters.",
    date: "2026-10-21",
    eventType: "People",
    sourceType: "news",
    sourceUrl: "https://example.com/story",
    authors: [],
    relatedWorks: [],
    provenance: "automated",
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
    ...overrides,
  };
}

const ucla = makeEvent({
  id: "ucla",
  slug: "professor-needell-ams",
  title: "Professor Deanna Needell Elected as AMS Member at Large of the Council",
  date: "2026-10-23",
  metadata: {
    people: [{ name: "Deanna Needell", role: "Elected member at large of the AMS Council" }],
  },
});

const ubc = makeEvent({
  id: "ubc",
  slug: "dr-needell-ams",
  title: "Dr. Deanna Needell Elected to the Council of the American Mathematical Society",
  date: "2026-10-21",
  metadata: { people: [{ name: "Deanna Needell", role: "Elected to the AMS Council" }] },
});

describe("isSamePersonStory", () => {
  it("matches the same election reported by two universities", () => {
    expect(isSamePersonStory(ucla, ubc)).toBe(true);
  });

  it("does not match a different kind of news for the same person", () => {
    const award = makeEvent({
      id: "award",
      slug: "needell-award",
      title: "Deanna Needell Awarded an AMS Prize",
      date: "2026-10-22",
      metadata: { people: [{ name: "Deanna Needell" }] },
    });
    expect(isSamePersonStory(ucla, award)).toBe(false);
  });

  it("does not match elections to different organisations", () => {
    const siam = makeEvent({
      id: "siam",
      slug: "needell-siam",
      title: "Deanna Needell Elected to the Council of SIAM",
      date: "2026-10-22",
      metadata: { people: [{ name: "Deanna Needell" }] },
    });
    expect(isSamePersonStory(ucla, siam)).toBe(false);
  });

  it("does not match stories more than ten days apart", () => {
    const late = makeEvent({
      ...ubc,
      id: "late",
      slug: "late",
      date: "2026-11-10",
    });
    expect(isSamePersonStory(ucla, late)).toBe(false);
  });

  it("requires named people on both sides", () => {
    const anonymous = makeEvent({
      id: "anon",
      slug: "anon",
      title: "Deanna Needell Elected to the AMS Council",
      metadata: undefined,
    });
    expect(isSamePersonStory(ucla, anonymous)).toBe(false);
  });
});

describe("dedupePersonStories", () => {
  it("keeps one record and prefers curated provenance", () => {
    const curated = { ...ubc, id: "curated", provenance: undefined };
    const merged = dedupePersonStories([ucla, curated]);
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("curated");
  });

  it("keeps the richer automated record", () => {
    const thin = { ...ubc, id: "thin", summary: "Short." };
    const rich = {
      ...ucla,
      id: "rich",
      metadata: { people: [{ name: "Deanna Needell", role: "Elected member at large of the AMS Council", viewpoint: "Serves through 2029" }] },
    };
    const merged = dedupePersonStories([thin, rich]);
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("rich");
  });

  it("leaves unrelated events and other event classes untouched", () => {
    const research = makeEvent({ id: "research", eventType: "Research", metadata: undefined });
    const funding = makeEvent({
      id: "funding",
      eventType: "Funding",
      title: "Simons Foundation Awards a Grant",
      metadata: { funding: { organization: "Simons Foundation" } },
    });
    const merged = dedupePersonStories([ucla, ubc, research, funding]);
    expect(merged.map((event) => event.id)).toEqual(["ucla", "research", "funding"]);
  });
});
