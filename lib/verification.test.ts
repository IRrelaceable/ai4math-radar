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

describe("applyTrustModel — conservative derivation", () => {
  it("github artifact derives E1", () => {
    const out = applyTrustModel(makeEvent({ sourceType: "github", githubUrl: "https://github.com/x/y" }));
    expect(out.evidenceLevel).toBe("E1");
    expect(out.sourceTier).toBe("S0");
  });

  it("bare announcement derives E3", () => {
    expect(applyTrustModel(makeEvent()).evidenceLevel).toBe("E3");
  });

  it("explicit curated fields are never overwritten", () => {
    const out = applyTrustModel(makeEvent({ evidenceLevel: "E4", sourceTier: "S2" }));
    expect(out.evidenceLevel).toBe("E4");
    expect(out.sourceTier).toBe("S2");
  });

  it("manual override wins over a strong artifact", () => {
    const out = applyTrustModel(
      makeEvent({
        slug: "alphaproof-imo-silver-medal-standard",
        sourceType: "github",
        githubUrl: "https://github.com/x/y",
      })
    );
    expect(out.evidenceLevel).toBe("E3");
  });

  it("manual sourceTier wins over the catalog table", () => {
    const out = applyTrustModel(
      makeEvent({ sourceUrl: "https://mathandai.org/declaration", sourceTier: "S1" })
    );
    expect(out.sourceTier).toBe("S1");
  });

  it("catalog sourceTier is used when the event has no manual tier", () => {
    const out = applyTrustModel(makeEvent({ sourceUrl: "https://mathandai.org/declaration" }));
    expect(out.sourceTier).toBe("S4");
  });
  it("eventType defaults to Research and gets a derived subtype", () => {
    const out = applyTrustModel(
      makeEvent({
        researchArea: "Theorem Proving & Formal Mathematics",
        subArea: "Autoformalization",
      })
    );
    expect(out.eventType).toBe("Research");
    expect(out.researchEventType).toBe("Formalization");
  });

  it("non-Research events keep no derived research subtype", () => {
    const out = applyTrustModel(makeEvent({ eventType: "People" }));
    expect(out.eventType).toBe("People");
    expect(out.researchEventType).toBeUndefined();
  });

  it("generates evidence history with an artifact record for E1", () => {
    const out = applyTrustModel(makeEvent({ sourceType: "github", githubUrl: "https://github.com/x/y" }));
    expect(out.verificationHistory?.length).toBe(2);
    // The row is dated to the event, not to ingest time; the note says so.
    expect(out.verificationHistory?.[0].date).toBe("2026-01-01");
    expect(out.verificationHistory?.[0].note).toContain("on the event date");
  });

  it("derives a conservative verification state from the links", () => {
    expect(applyTrustModel(makeEvent()).verificationStatus).toBe("claimed");
    expect(
      applyTrustModel(makeEvent({ paperUrl: "https://arxiv.org/abs/1234.5678" })).verificationStatus
    ).toBe("paper_released");
    expect(
      applyTrustModel(
        makeEvent({ sourceType: "github", githubUrl: "https://github.com/x/y" })
      ).verificationStatus
    ).toBe("paper_released");
    // E0 is the only level that records an actual independent check.
    expect(
      applyTrustModel(makeEvent({ evidenceLevel: "E0" })).verificationStatus
    ).toBe("independently_verified");
  });

  it("never infers a dispute, correction or retraction", () => {
    const out = applyTrustModel(makeEvent({ paperUrl: "https://arxiv.org/abs/1234.5678" }));
    expect(["claimed", "paper_released"]).toContain(out.verificationStatus);
  });

  it("keeps an explicit state and the last recorded history state", () => {
    const explicit = applyTrustModel(makeEvent({ verificationStatus: "disputed" }));
    expect(explicit.verificationStatus).toBe("disputed");
    const fromHistory = applyTrustModel(
      makeEvent({
        verificationHistory: [
          { date: "2026-01-01", evidenceLevel: "E2", status: "paper_released" },
          { date: "2026-02-01", evidenceLevel: "E2", status: "under_verification" },
        ],
      })
    );
    expect(fromHistory.verificationStatus).toBe("under_verification");
  });

  it("passes AI attribution through untouched", () => {
    const out = applyTrustModel(
      makeEvent({
        aiRole: { level: "assisted", description: "Model proposed the proof." },
        humanContribution: "Researchers formalized the statement.",
      })
    );
    expect(out.aiRole?.level).toBe("assisted");
    expect(out.humanContribution).toBe("Researchers formalized the statement.");
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
      deriveResearchEventType({ researchArea: "Mathematical Reasoning & LLMs", title: "IMO gold" })
    ).toBe("Competition");
  });

  it("merged formal area splits by sub-area", () => {
    expect(
      deriveResearchEventType({
        researchArea: "Theorem Proving & Formal Mathematics",
        subArea: "Proof search",
        title: "Faster tactic",
      })
    ).toBe("Proof");
    expect(
      deriveResearchEventType({
        researchArea: "Theorem Proving & Formal Mathematics",
        subArea: "Autoformalization",
        title: "Paper to Lean",
      })
    ).toBe("Formalization");
  });

  it("merged discovery area maps to Discovery", () => {
    expect(
      deriveResearchEventType({
        researchArea: "Mathematical Discovery & Symbolic Computation",
        subArea: "Equation solving & discovery",
        title: "New identity",
      })
    ).toBe("Discovery");
  });

  it("unknown areas fall back to System", () => {
    expect(deriveResearchEventType({ researchArea: "Geometry", title: "Anything" })).toBe("System");
  });
});

describe("/methodology derivation copy matches applyTrustModel", () => {
  const m = pagesDict.zh.methodology;

  it("evidence-level rules yield exactly the documented codes", () => {
    const cases: [Partial<ResearchEvent>, string][] = [
      [{ githubUrl: "https://github.com/x/y" }, "E1"],
      [{ paperUrl: "https://arxiv.org/abs/1" }, "E2"],
      [{ sourceUrl: "https://example.com/claim" }, "E3"],
      [{ sourceUrl: "" }, "E4"],
    ];
    for (const [overrides, expected] of cases) {
      expect(applyTrustModel(makeEvent(overrides)).evidenceLevel).toBe(expected);
    }
    expect(m.deriveEvidence.map((r) => r.code)).toEqual(["E1", "E2", "E3", "E4"]);
  });

  it("source-tier rules yield exactly the documented codes", () => {
    expect(applyTrustModel(makeEvent({ sourceType: "arxiv" })).sourceTier).toBe("S0");
    expect(applyTrustModel(makeEvent({ sourceType: "github" })).sourceTier).toBe("S0");
    expect(applyTrustModel(makeEvent({ sourceType: "conference" })).sourceTier).toBe("S0");
    expect(applyTrustModel(makeEvent({ sourceType: "blog" })).sourceTier).toBe("S1");
    expect(applyTrustModel(makeEvent({ sourceType: "demo" })).sourceTier).toBe("S1");
    expect(m.deriveTier.map((r) => r.code)).toEqual(["S0", "S1"]);
  });
});
