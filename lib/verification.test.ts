import { describe, expect, it } from "vitest";
import { applyTrustModel, deriveResearchEventType } from "@/lib/verification";
import type { ResearchEvent } from "@/types";

function makeEvent(overrides: Partial<ResearchEvent> = {}): ResearchEvent {
  return {
    id: "evt-test",
    title: "Test",
    slug: "test",
    summary: "s",
    significance: "sig",
    date: "2026-01-01",
    researchArea: "Mathematical Reasoning",
    sourceType: "arxiv",
    sourceUrl: "https://example.com/claim",
    authors: ["A"],
    relatedWorks: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("applyTrustModel — conservative derivation", () => {
  it("github artifact derives E3 + paper_released", () => {
    const out = applyTrustModel(makeEvent({ sourceType: "github", githubUrl: "https://github.com/x/y" }));
    expect(out.evidenceLevel).toBe("E3");
    expect(out.verificationStatus).toBe("paper_released");
    expect(out.sourceTier).toBe("S1");
  });

  it("bare announcement derives E1 + claimed", () => {
    const out = applyTrustModel(makeEvent());
    expect(out.evidenceLevel).toBe("E1");
    expect(out.verificationStatus).toBe("claimed");
  });

  it("explicit curated fields are never overwritten", () => {
    const out = applyTrustModel(
      makeEvent({ verificationStatus: "disputed", evidenceLevel: "E4", sourceTier: "S3" })
    );
    expect(out.verificationStatus).toBe("disputed");
    expect(out.evidenceLevel).toBe("E4");
    expect(out.sourceTier).toBe("S3");
  });

  it("manual override wins over a strong artifact", () => {
    const out = applyTrustModel(
      makeEvent({
        slug: "alphaproof-imo-silver-medal-standard",
        sourceType: "github",
        githubUrl: "https://github.com/x/y",
      })
    );
    expect(out.verificationStatus).toBe("claimed");
    expect(out.evidenceLevel).toBe("E1");
  });

  it("eventType defaults to Research and gets a derived subtype", () => {
    const out = applyTrustModel(makeEvent({ researchArea: "Formal Mathematics" }));
    expect(out.eventType).toBe("Research");
    expect(out.researchEventType).toBe("Formalization");
  });

  it("non-Research events keep no derived research subtype", () => {
    const out = applyTrustModel(makeEvent({ eventType: "People" }));
    expect(out.eventType).toBe("People");
    expect(out.researchEventType).toBeUndefined();
  });

  it("generates verification history with an artifact record for E3", () => {
    const out = applyTrustModel(makeEvent({ sourceType: "github", githubUrl: "https://github.com/x/y" }));
    expect(out.verificationHistory?.length).toBe(2);
    expect(out.verificationHistory?.[0].note).toContain("entered the tracker");
  });
});

describe("deriveResearchEventType", () => {
  it("Benchmarks & Datasets area wins", () => {
    expect(
      deriveResearchEventType({ researchArea: "Benchmarks & Datasets", title: "New prover" })
    ).toBe("Benchmark");
  });

  it("competition keywords win over area", () => {
    expect(
      deriveResearchEventType({ researchArea: "LLM for Mathematics", title: "IMO gold" })
    ).toBe("Competition");
  });

  it("Theorem Proving maps to Proof", () => {
    expect(deriveResearchEventType({ researchArea: "Theorem Proving", title: "Faster tactic" })).toBe(
      "Proof"
    );
  });

  it("unknown areas fall back to System", () => {
    expect(deriveResearchEventType({ researchArea: "Geometry", title: "Anything" })).toBe("System");
  });
});
