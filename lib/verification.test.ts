import { describe, expect, it } from "vitest";
import { applyTrustModel, deriveResearchEventType } from "@/lib/verification";
import { pagesDict } from "@/lib/i18n/dict.pages";
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

/**
 * Guard: the derivation rules published on /about must stay in lockstep
 * with applyTrustModel. Each documented rule is paired with a representative
 * event; if the derivation logic changes without a matching copy update, this
 * fails, so the site never describes rules it no longer applies.
 */
describe("/about derivation copy matches applyTrustModel", () => {
  const m = pagesDict.zh.about;

  it("evidence-level rules yield exactly the documented codes", () => {
    const cases: [Partial<ResearchEvent>, string][] = [
      [{ githubUrl: "https://github.com/x/y" }, "E3"], // GitHub → E3
      [{ paperUrl: "https://arxiv.org/abs/1" }, "E2"], // paper → E2
      [{ sourceUrl: "https://example.com/claim" }, "E1"], // source only → E1
      [{ sourceUrl: "" }, "E0"], // no links at all → E0
    ];
    for (const [overrides, expected] of cases) {
      expect(applyTrustModel(makeEvent(overrides)).evidenceLevel).toBe(expected);
    }
    // codes appear in the documented table, in ascending order
    expect(m.deriveEvidence.map((r) => r.code)).toEqual(["E3", "E2", "E1", "E0"]);
  });

  it("source-tier rules yield exactly the documented codes", () => {
    expect(applyTrustModel(makeEvent({ sourceType: "arxiv" })).sourceTier).toBe("S1");
    expect(applyTrustModel(makeEvent({ sourceType: "github" })).sourceTier).toBe("S1");
    expect(applyTrustModel(makeEvent({ sourceType: "conference" })).sourceTier).toBe("S1");
    expect(applyTrustModel(makeEvent({ sourceType: "blog" })).sourceTier).toBe("S2");
    expect(applyTrustModel(makeEvent({ sourceType: "demo" })).sourceTier).toBe("S2");
    expect(m.deriveTier.map((r) => r.code)).toEqual(["S1", "S2"]);
  });

  it("verification-status rules tie evidence level to status", () => {
    expect(applyTrustModel(makeEvent({ paperUrl: "https://arxiv.org/abs/1" })).verificationStatus).toBe(
      "paper_released"
    );
    expect(applyTrustModel(makeEvent({ githubUrl: "https://github.com/x/y" })).verificationStatus).toBe(
      "paper_released"
    );
    expect(applyTrustModel(makeEvent()).verificationStatus).toBe("claimed");
    expect(m.deriveStatus.map((r) => r.code)).toEqual(["paper_released", "claimed"]);
  });
});
