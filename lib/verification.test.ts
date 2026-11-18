import { describe, expect, it } from "vitest";
import { applyTrustModel } from "@/lib/verification";
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

  it("derives a source list from links without touching stored data", () => {
    const out = applyTrustModel(
      makeEvent({
        paperUrl: "https://arxiv.org/abs/1",
        githubUrl: "https://github.com/x/y",
        sourceTier: "S1",
      })
    );
    // Paper + code are S0; the declared source carries the event tier.
    expect(out.sources?.map((s) => s.tier)).toEqual(["S0", "S0", "S1"]);
    expect(out.sources?.every((s) => s.publishedAt === "2026-01-01")).toBe(true);
  });

  it("explicit curated fields are never overwritten", () => {
    // E0 is manual-only and differs from the derived default (E3), so a
    // preserved value proves the explicit field was not recomputed.
    const out = applyTrustModel(makeEvent({ evidenceLevel: "E0", sourceTier: "S2" }));
    expect(out.evidenceLevel).toBe("E0");
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
  it("eventType defaults to Research when absent", () => {
    expect(applyTrustModel(makeEvent()).eventType).toBe("Research");
  });

  it("non-Research events keep their class", () => {
    expect(applyTrustModel(makeEvent({ eventType: "People" })).eventType).toBe("People");
  });

  it("derives preprint from an arXiv link", () => {
    const withPaper = applyTrustModel(makeEvent({ paperUrl: "https://arxiv.org/abs/1234.5678" }));
    expect(withPaper.publicationStatus).toBe("preprint");
    // An arXiv posting alone is not peer review: it stays preprint, not published.
    expect(applyTrustModel(makeEvent()).publicationStatus).toBeUndefined();
  });

  it("auto-derives published from proceedings / publisher links", () => {
    for (const paperUrl of [
      "https://aclanthology.org/2022.mathnlp-1.4/",
      "https://proceedings.mlr.press/v162/aygun22a.html",
      "https://papers.nips.cc/paper_files/paper/2022/hash/abc-Abstract-Conference.html",
      "https://doi.org/10.1007/978-3-319-21401-6_26",
      "https://www.ijcai.org/Proceedings/77-2/Papers/094.pdf",
      "https://ceur-ws.org/Vol-1234/paper5.pdf",
    ]) {
      expect(applyTrustModel(makeEvent({ paperUrl })).publicationStatus).toBe("published");
    }
    // A published record supersedes an arXiv draft.
    const mixed = applyTrustModel(
      makeEvent({
        paperUrl: "https://arxiv.org/abs/1234.5678",
        papers: [{ url: "https://aclanthology.org/2022.mathnlp-1.4/", title: "proc" }],
      })
    );
    expect(mixed.publicationStatus).toBe("published");
  });

  it("leaves repository deposits and technical reports unset", () => {
    expect(
      applyTrustModel(makeEvent({ paperUrl: "https://doi.org/10.5281/zenodo.22737750" })).publicationStatus
    ).toBeUndefined();
    expect(
      applyTrustModel(makeEvent({ paperUrl: "https://www.rand.org/pubs/papers/P868.html" })).publicationStatus
    ).toBeUndefined();
  });

  it("always derives publication status, ignoring any stored manual value", () => {
    // The pipeline is fully automatic: a stored publicationStatus (e.g. a legacy
    // backfill) never overrides the link-derived stage.
    const withArxiv = applyTrustModel(
      makeEvent({ publicationStatus: "published", paperUrl: "https://arxiv.org/abs/1234.5678" })
    );
    expect(withArxiv.publicationStatus).toBe("preprint");
    const withStoredPublished = applyTrustModel(
      makeEvent({ publicationStatus: "published", paperUrl: "https://example.com/paper" })
    );
    expect(withStoredPublished.publicationStatus).toBeUndefined();
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

describe("applyTrustModel derivation rules", () => {
  it("evidence-level rules yield the expected codes", () => {
    const cases: [Partial<ResearchEvent>, string][] = [
      [{ githubUrl: "https://github.com/x/y" }, "E1"],
      [{ paperUrl: "https://arxiv.org/abs/1" }, "E2"],
      [{ sourceUrl: "https://example.com/claim" }, "E3"],
      // No links at all also falls back to E3 — E4 has been removed.
      [{ sourceUrl: "" }, "E3"],
    ];
    for (const [overrides, expected] of cases) {
      expect(applyTrustModel(makeEvent(overrides)).evidenceLevel).toBe(expected);
    }
  });

  it("source-tier rules yield the expected codes", () => {
    expect(applyTrustModel(makeEvent({ sourceType: "arxiv" })).sourceTier).toBe("S0");
    expect(applyTrustModel(makeEvent({ sourceType: "github" })).sourceTier).toBe("S0");
    expect(applyTrustModel(makeEvent({ sourceType: "conference" })).sourceTier).toBe("S0");
    expect(applyTrustModel(makeEvent({ sourceType: "blog" })).sourceTier).toBe("S1");
    expect(applyTrustModel(makeEvent({ sourceType: "demo" })).sourceTier).toBe("S1");
  });
});
