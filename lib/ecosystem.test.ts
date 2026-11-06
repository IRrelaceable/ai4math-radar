import { describe, expect, it } from "vitest";
import { EVENT_TYPES } from "@/types";
import { normalizeEcosystemEvent, normalizeEventType } from "./ecosystem";

describe("ecosystem event classes", () => {
  it("exposes exactly five primary classes", () => {
    expect(EVENT_TYPES).toEqual([
      "Research",
      "People",
      "Institutions",
      "Funding",
      "PolicyCommunity",
    ]);
  });

  it("folds legacy Education into Institutions", () => {
    expect(normalizeEventType("Education")).toBe("Institutions");
  });

  it("folds legacy Commentary into PolicyCommunity", () => {
    expect(normalizeEventType("Commentary")).toBe("PolicyCommunity");
  });

  it("keeps every primary class and research subtypes intact", () => {
    for (const type of EVENT_TYPES) expect(normalizeEventType(type)).toBe(type);
    expect(normalizeEventType("Discovery")).toBe("Research");
  });

  it("drops unknown classes", () => {
    expect(normalizeEventType("NotAClass")).toBeUndefined();
    expect(normalizeEventType(undefined)).toBeUndefined();
  });

  it("normalizeEcosystemEvent rewrites a legacy Education event to Institutions", () => {
    const event = normalizeEcosystemEvent({
      id: "evt-x",
      title: "Demo course",
      slug: "demo-course",
      summary: "s",
      significance: "sig",
      date: "2026-01-01",
      eventType: "Education" as never,
      researchArea: "Mathematical Agents",
      sourceType: "demo",
      sourceUrl: "https://example.org/",
      authors: [],
      relatedWorks: [],
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    });
    expect(event.eventType).toBe("Institutions");
  });
});
