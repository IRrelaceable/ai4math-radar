import { describe, expect, it } from "vitest";
import { events } from "@/data/seed/events";
import { applyTrustModel, validateSubAreas } from "@/lib/verification";
import {
  EVIDENCE_LEVELS,
  EVENT_TYPES,
  IMPORTANCE_TIERS,
  RESEARCH_AREAS,
  RESEARCH_EVENT_TYPES,
  SOURCE_TIERS,
  VERIFICATION_STATUSES,
} from "@/types";

/**
 * Seed-data invariants: the whole site is only as trustworthy as this file,
 * so every hand-edited entry must satisfy these rules.
 */
describe("seed data integrity", () => {
  it("has events", () => {
    expect(events.length).toBeGreaterThan(50);
  });

  it("ids and slugs are unique", () => {
    const ids = new Set<string>();
    const slugs = new Set<string>();
    for (const e of events) {
      expect(ids.has(e.id), `duplicate id ${e.id}`).toBe(false);
      expect(slugs.has(e.slug), `duplicate slug ${e.slug}`).toBe(false);
      ids.add(e.id);
      slugs.add(e.slug);
    }
  });

  it("dates are ISO day precision and sortable", () => {
    for (const e of events) {
      expect(e.date, `${e.slug} date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("every event has a http(s) source", () => {
    for (const e of events) {
      expect(e.sourceUrl, `${e.slug} sourceUrl`).toMatch(/^https:\/\//);
    }
  });

  it("taxonomy fields use the declared enums", () => {
    for (const e of events) {
      if (e.researchArea) expect(RESEARCH_AREAS, `${e.slug} area`).toContain(e.researchArea);
      if (e.eventType) expect(EVENT_TYPES, `${e.slug} eventType`).toContain(e.eventType);
      if (e.researchEventType)
        expect(RESEARCH_EVENT_TYPES, `${e.slug} researchEventType`).toContain(e.researchEventType);
      if (e.verificationStatus)
        expect(VERIFICATION_STATUSES, `${e.slug} status`).toContain(e.verificationStatus);
      if (e.evidenceLevel) expect(EVIDENCE_LEVELS, `${e.slug} evidence`).toContain(e.evidenceLevel);
      if (e.sourceTier) expect(SOURCE_TIERS, `${e.slug} tier`).toContain(e.sourceTier);
    }
  });

  it("ecosystem events carry an event class, not a research direction", () => {
    const ECOSYSTEM = new Set(["People", "Institutions", "Funding", "PolicyCommunity"]);
    for (const e of events) {
      if (e.eventType && ECOSYSTEM.has(e.eventType)) {
        expect(e.researchArea, `${e.slug} is ${e.eventType} but still has a researchArea`)
          .toBeUndefined();
      }
    }
  });

  it("importance tiers stay within H1/H2/H3 and carry a subjective note", () => {
    for (const e of events) {
      if (e.importanceTier !== undefined) {
        expect(
          IMPORTANCE_TIERS as readonly string[],
          `${e.slug} tier`
        ).toContain(e.importanceTier);
        expect(e.importanceNote, `${e.slug} tier note`).toBeTruthy();
      }
    }
  });

  it("demo events are fully flagged; real events never use example.org", () => {
    for (const e of events) {
      if (e.isDemo) {
        expect(e.sourceType, `${e.slug} demo sourceType`).toBe("demo");
        expect(e.sourceUrl, `${e.slug} demo source`).toContain("example.org");
      } else {
        expect(e.sourceUrl, `${e.slug} must not use the demo domain`).not.toContain("example.org");
      }
    }
  });

  it("related works carry a title and a valid relation", () => {
    for (const e of events) {
      for (const w of e.relatedWorks) {
        expect(w.title.length, `${e.slug} related title`).toBeGreaterThan(0);
        expect(["previous", "followup", "related"], `${e.slug} relation`).toContain(w.relation);
      }
    }
  });

  it("trust model fills every gap without throwing", () => {
    for (const e of events) {
      const filled = applyTrustModel(e);
      expect(filled.verificationStatus).toBeTruthy();
      expect(filled.evidenceLevel).toBeTruthy();
      expect(filled.sourceTier).toBeTruthy();
      expect(filled.eventType).toBeTruthy();
    }
  });

  it("sub-areas stay inside the controlled vocabulary for their area", () => {
    const problems = validateSubAreas(events);
    expect(problems, problems.join("\n")).toEqual([]);
  });
});
