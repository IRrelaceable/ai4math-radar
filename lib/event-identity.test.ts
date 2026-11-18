import { describe, expect, it } from "vitest";
import {
  extractIdentityKeys,
  findIdentityCandidates,
} from "@/lib/event-identity";
import { defaultEventId, findCandidates, linkIncomingEvents } from "@/lib/tracking";
import type { ResearchEvent } from "@/types";

function ev(
  id: string,
  slug: string,
  date: string,
  extra: Partial<ResearchEvent> = {}
): ResearchEvent {
  return {
    id,
    slug,
    date,
    title: slug,
    summary: "",
    significance: "",
    sourceType: "arxiv",
    sourceUrl: `https://example.org/${slug}`,
    authors: [],
    relatedWorks: [],
    eventType: "Research",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...extra,
  };
}

describe("identity extraction", () => {
  it("normalizes arXiv ids across abs/pdf and version suffixes", () => {
    const keys = extractIdentityKeys(
      ev("e", "x", "2026-01-01", {
        sourceUrl: "https://arxiv.org/abs/2610.08144v2",
        summary: "We build on arXiv:2610.08144 and arxiv.org/pdf/2610.08144.",
      })
    );
    expect([...keys.arxiv]).toEqual(["2610.08144"]);
  });

  it("reduces github commit/blob URLs to the repo key", () => {
    const keys = extractIdentityKeys(
      ev("e", "x", "2026-01-01", {
        githubUrl: "https://github.com/openai/math/commit/3014888",
        sourceUrl: "https://github.com/openai/math/blob/main/history.md",
      })
    );
    expect([...keys.repos]).toEqual(["openai/math"]);
  });

  it("extracts a DOI from prose", () => {
    const keys = extractIdentityKeys(
      ev("e", "x", "2026-01-01", { summary: "See doi:10.1234/abc.DEF." })
    );
    expect([...keys.doi]).toContain("10.1234/abc.def");
  });

  it("keeps identity-bearing query params (/?p=3819 != /?p=4132)", () => {
    const a = extractIdentityKeys(
      ev("a", "a", "2026-01-01", { sourceUrl: "https://example.org/?p=3819" })
    );
    const b = extractIdentityKeys(
      ev("b", "b", "2026-01-01", { sourceUrl: "https://example.org/?p=4132" })
    );
    expect([...a.urls]).not.toEqual([...b.urls]);
    expect([...a.urls][0]).toBe("example.org?p=3819");
  });

  it("strips tracking params but keeps content params regardless of order", () => {
    const a = extractIdentityKeys(
      ev("a", "a", "2026-01-01", {
        sourceUrl: "https://example.org/post?id=7&utm_source=x&p=3",
      })
    );
    const b = extractIdentityKeys(
      ev("b", "b", "2026-01-01", {
        sourceUrl: "https://example.org/post?p=3&id=7&fbclid=abc",
      })
    );
    expect([...a.urls]).toEqual([...b.urls]);
    expect([...a.urls][0]).toBe("example.org/post?id=7&p=3");
  });

  it("keeps path case (/docs/ABC != /docs/abc)", () => {
    const a = extractIdentityKeys(
      ev("a", "a", "2026-01-01", { sourceUrl: "https://example.org/docs/ABC" })
    );
    const b = extractIdentityKeys(
      ev("b", "b", "2026-01-01", { sourceUrl: "https://example.org/docs/abc" })
    );
    expect([...a.urls]).not.toEqual([...b.urls]);
    expect([...a.urls][0]).toBe("example.org/docs/ABC");
  });

  it("does not collide an encoded separator with two real params", () => {
    // x=a%26b%3Dc is ONE param whose value decodes to "a&b=c"; x=a&b=c is TWO
    // params. Naive `key=value` concatenation fused them; URLSearchParams
    // re-encoding must keep them distinct.
    const single = extractIdentityKeys(
      ev("a", "a", "2026-01-01", { sourceUrl: "https://example.org/?x=a%26b%3Dc" })
    );
    const double = extractIdentityKeys(
      ev("b", "b", "2026-01-01", { sourceUrl: "https://example.org/?x=a&b=c" })
    );
    expect([...single.urls]).not.toEqual([...double.urls]);
  });
});

describe("cross-source candidate retrieval", () => {
  const canonical = ev("evt_release", "release", "2026-10-06", {
    githubUrl: "https://github.com/openai/math",
    sourceUrl: "https://github.com/openai/math",
    relatedWorks: [{ title: "audit", url: "https://arxiv.org/abs/2610.08144", relation: "related" }],
  });

  it("finds a follow-up that only cites the original arXiv id in prose", () => {
    const followup = ev("evt_f", "followup", "2026-10-10", {
      summary: "An independent check of arXiv:2610.08144 from the October release.",
    });
    const [top] = findIdentityCandidates(followup, [canonical], 3);
    expect(top.event.slug).toBe("release");
    expect(top.signals?.some((s) => s.startsWith("arXiv:"))).toBe(true);
  });

  it("finds a correction via the canonical repository commit URL", () => {
    const correction = ev("evt_c", "correction", "2026-10-08", {
      sourceUrl: "https://github.com/openai/math/commit/abc123",
      githubUrl: "https://github.com/openai/math/commit/abc123",
    });
    const [top] = findIdentityCandidates(correction, [canonical], 3);
    expect(top.event.slug).toBe("release");
    expect(top.signals?.some((s) => s.startsWith("repo:"))).toBe(true);
  });

  it("finds a verification that names the project alias but quotes no URL", () => {
    const audit = ev("evt_a", "mechalign", "2026-10-26", {
      sourceUrl: "https://arxiv.org/abs/2610.35269",
      summary: "A preliminary review covers 201 main results from 173 OpenAI Math projects.",
    });
    const [top] = findIdentityCandidates(audit, [canonical], 3);
    expect(top.event.slug).toBe("release");
    expect(top.signals?.some((s) => s.startsWith("alias:"))).toBe(true);
  });

  it("does NOT merge a same-institution but unrelated result (negative control)", () => {
    const unrelated = ev("evt_u", "openai-hardware", "2026-10-09", {
      sourceUrl: "https://openai.com/index/a-new-chip",
      summary: "OpenAI announces a new inference accelerator chip for data centres.",
      entities: { institutions: ["OpenAI"] },
    });
    const candidates = findIdentityCandidates(unrelated, [canonical], 3);
    // host-only overlap may surface a weak candidate, but it must never be a
    // strong (arXiv/repo/alias) match that would justify a same-event merge.
    for (const c of candidates) {
      const strong = c.signals?.some((s) => /^(arXiv|DOI|repo|alias|url):/.test(s));
      expect(strong ?? false).toBe(false);
    }
  });

  it("does NOT merge a different paper sharing only the same lab and vocabulary", () => {
    const other = ev("evt_o", "other-prover", "2026-10-07", {
      sourceUrl: "https://arxiv.org/abs/2610.99999",
      summary: "We present a Lean prover with synthetic data and theorem proving benchmarks.",
      entities: { institutions: ["OpenAI"] },
    });
    const candidates = findIdentityCandidates(other, [canonical], 3);
    for (const c of candidates) {
      const strong = c.signals?.some((s) => /^(arXiv|DOI|repo|alias|url):/.test(s));
      expect(strong ?? false).toBe(false);
    }
  });

  it("groups candidates by Event id, not by source slug", () => {
    // The canonical Event has three records; they must occupy one candidate.
    const followup = ev("evt_f2", "f2", "2026-10-10", {
      summary: "Follow-up on arXiv:2610.08144.",
    });
    const line = [
      canonical,
      ev("evt_w", "watch-1", "2026-10-08", {
        tracking: { eventId: defaultEventId(canonical), kind: "followup", relation: "same-event", matchedBy: "curated" },
        githubUrl: "https://github.com/openai/math/blob/main/history.md",
      }),
    ];
    const candidates = findIdentityCandidates(followup, line, 3);
    const ids = new Set(candidates.map((c) => {
      // Representative of the canonical line is the initial record.
      return c.event.slug;
    }));
    expect(ids.size).toBe(candidates.length); // no duplicate representative
    expect(candidates[0].event.slug).toBe("release");
  });

  it("dedupes by Event id on the keyword fallback branch too", () => {
    // No identity signals anywhere -> findCandidates falls back to the legacy
    // keyword matcher. Three records of ONE Event line share names/keywords;
    // they must not occupy all three top slots.
    const lineId = defaultEventId(canonical);
    const incoming = ev("evt_new", "new", "2026-11-01", {
      title: "Lean theorem proving with openai math corpus",
      summary: "formalization proof theorem corpus",
      entities: { people: ["Alice"], institutions: ["OpenAI"] },
    });
    const sameLine = [
      canonical,
      ev("evt_r1", "rec-1", "2026-10-12", {
        tracking: { eventId: lineId, kind: "followup", relation: "same-event", matchedBy: "curated" },
        title: "Lean theorem proving corpus update one",
        entities: { people: ["Alice"], institutions: ["OpenAI"] },
      }),
      ev("evt_r2", "rec-2", "2026-10-14", {
        tracking: { eventId: lineId, kind: "followup", relation: "same-event", matchedBy: "curated" },
        title: "Lean theorem proving corpus update two",
        entities: { people: ["Alice"], institutions: ["OpenAI"] },
      }),
    ];
    // findEventCandidates itself dedupes; findCandidates must preserve the
    // invariant on its fallback path. At most one candidate per Event id.
    const final = findCandidates(incoming, sameLine, 3);
    const ids = new Set(final.map((c) => defaultEventId(c.event)));
    expect(ids.size).toBe(final.length);
    expect(final.length).toBeGreaterThan(0);
  });

  it("merges identity AND keyword hits so a cited-anchor paper keeps its true event", () => {
    // Reproduces the review finding: a new paper cites openai/math as a
    // benchmark (identity retrieval fires on the repo alias), but its own
    // author + title identify a DIFFERENT correct Event. Returning identity
    // hits alone dropped that correct Event entirely. findCandidates must
    // merge both retrieval paths, dedupe by Event id, then take top-k.
    const incoming = ev("evt_new", "benchmark-paper", "2026-11-05", {
      title: "Scalable proof search with relay gradients",
      summary: "We evaluate on six corpora including miniF2F.",
      // Quoting the canonical repo URL in relatedWorks triggers identity
      // retrieval, exactly how a benchmark paper cites openai/math.
      relatedWorks: [{ title: "corpus", url: "https://github.com/openai/math", relation: "related" }],
      entities: { people: ["Bob Researcher"], institutions: ["Acme Lab"] },
    });
    // Identity anchor: canonical openai/math release.
    // True event: strong people + title overlap, no identity anchor.
    const trueEvent = ev("evt_true", "relay-gradients-series", "2026-10-20", {
      title: "Scalable proof search with relay gradients",
      summary: "relay gradients proof search scalable",
      entities: { people: ["Bob Researcher"], institutions: ["Acme Lab"] },
    });
    const candidates = findCandidates(incoming, [canonical, trueEvent], 3);
    const slugs = candidates.map((c) => c.event.slug);
    // The correct Event survives alongside the identity hit (recall layer).
    expect(slugs).toContain("relay-gradients-series");
    expect(slugs).toContain("release");
  });
});

/**
 * Regression for the two "writes the wrong event line" bugs found in review:
 * a paper that merely USES openai/math as one dataset among several must not
 * be auto-merged as a follow-up, and generic audit vocabulary ("check",
 * "evaluation") must not produce a fake `matchedBy: "llm"` verification.
 * These assert the WRITE path (linkIncomingEvents), which is deliberately
 * kept on the legacy matcher while identity retrieval stays candidate-only.
 */
describe("no false merges into the 722 event line (write path)", () => {
  const release = ev("evt_release", "release", "2026-10-06", {
    githubUrl: "https://github.com/openai/math",
    sourceUrl: "https://github.com/openai/math",
    relatedWorks: [{ title: "a", url: "https://arxiv.org/abs/2610.08144", relation: "related" }],
  });

  it("does not merge a paper that uses openai/math as one of six datasets", async () => {
    const comparator = ev("evt_cmp", "six-datasets-benchmark", "2026-11-01", {
      sourceType: "arxiv",
      sourceUrl: "https://arxiv.org/abs/2611.00001",
      paperUrl: "https://arxiv.org/abs/2611.00001",
      title: "A unified benchmark over six theorem-proving corpora",
      summary:
        "We evaluate provers across six datasets: minif2f, fimo, proofnet, "
        + "lean-workbook, openai/math and mathlib. The comparison studies "
        + "pass rates; it is not about any single release.",
      entities: { institutions: ["OpenAI"] },
    });
    // Retrieval may surface the release as a candidate (mentions openai/math),
    // but the write path must NOT turn that into a same-event link.
    const [linked] = await linkIncomingEvents([comparator], [release]);
    expect(linked.tracking?.relation).not.toBe("same-event");
    expect(linked.tracking?.kind).not.toBe("followup");
  });

  it("does not fabricate an llm verification from generic check/evaluation words", async () => {
    const generic = ev("evt_gen", "generic-survey", "2026-11-02", {
      sourceType: "arxiv",
      sourceUrl: "https://arxiv.org/abs/2611.00002",
      paperUrl: "https://arxiv.org/abs/2611.00002",
      title: "A survey of evaluation methods for formal proof assistants",
      summary:
        "We check and compare evaluation metrics and evaluation harnesses "
        + "across proof assistants. This is a general methods survey.",
      // No identity link to the release at all.
    });
    const [linked] = await linkIncomingEvents([generic], [release]);
    expect(linked.tracking?.kind).not.toBe("verification");
    // No candidate had entity overlap, so no LLM call is made; matchedBy stays
    // a non-llm value rather than claiming a model decision that never ran.
    expect(linked.tracking?.matchedBy).not.toBe("llm");
  });
});
