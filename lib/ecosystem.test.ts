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

  it("keeps every primary class intact", () => {
    for (const type of EVENT_TYPES) expect(normalizeEventType(type)).toBe(type);
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

  const base = {
    id: "evt-y",
    title: "An award",
    slug: "an-award",
    summary: "s",
    significance: "sig",
    date: "2026-01-01",
    sourceType: "news" as const,
    sourceUrl: "https://example.org/",
    authors: [],
    relatedWorks: [],
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  };

  it("assigns not_applicable to an ecosystem event with no AI role", () => {
    const out = normalizeEcosystemEvent({ ...base, eventType: "People" });
    expect(out.aiRole).toEqual({ level: "not_applicable" });
  });

  it("keeps an explicit AI role on an ecosystem event", () => {
    const out = normalizeEcosystemEvent({
      ...base,
      eventType: "People",
      aiRole: { level: "assisted", description: "AI drafted the citation" },
    });
    expect(out.aiRole?.level).toBe("assisted");
  });

  it("leaves a Research event unmarked when no AI role is known", () => {
    const out = normalizeEcosystemEvent({ ...base, eventType: "Research" });
    expect(out.aiRole).toBeUndefined();
  });

  it("fills human-adjudicated audit values for a reviewed Research slug", () => {
    const out = normalizeEcosystemEvent({
      ...base,
      slug: "lean-grimoire",
      eventType: "Research",
    });
    expect(out.researchArea).toBe("Mathematical Agents");
    expect(out.direction).toBe("math4ai");
    expect(out.aiRole?.level).toBe("not_applicable");
  });

  it("never overwrites a stored value with the audit overlay", () => {
    const out = normalizeEcosystemEvent({
      ...base,
      slug: "lean-grimoire",
      eventType: "Research",
      researchArea: "Geometry",
      direction: "ai4math",
      aiRole: { level: "assisted" },
    });
    expect(out.researchArea).toBe("Geometry");
    expect(out.direction).toBe("ai4math");
    expect(out.aiRole?.level).toBe("assisted");
  });

  it("gives a record with no tracking a deterministic standalone Event", () => {
    const out = normalizeEcosystemEvent({ ...base, eventType: "Research" });
    expect(out.tracking).toMatchObject({
      eventId: "event-evt-y",
      kind: "initial",
      relation: "independent",
      matchedBy: "seed",
    });
  });

  it("never overwrites an explicit tracking link", () => {
    const explicit = {
      eventId: "event-custom",
      kind: "followup" as const,
      relation: "same-event" as const,
      matchedBy: "curated" as const,
    };
    const out = normalizeEcosystemEvent({ ...base, eventType: "Research", tracking: explicit });
    expect(out.tracking).toEqual(explicit);
  });

  it("derives the default event id with the same rule as defaultEventId", () => {
    const out = normalizeEcosystemEvent({
      ...base,
      id: "evt_weird/id",
      eventType: "Research",
    });
    expect(out.tracking?.eventId).toBe("event-evt_weird-id");
  });

  it("materializes a curated release-series link instead of a standalone default", () => {
    const out = normalizeEcosystemEvent({
      ...base,
      slug: "ai-scientist-v2-workshop-level-agentic-tree-search",
      eventType: "Research",
    });
    expect(out.tracking).toMatchObject({
      eventId: "event-ai-scientist",
      kind: "followup",
      relation: "same-event",
      matchedBy: "curated",
    });
  });
});
