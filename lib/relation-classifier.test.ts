/**
 * Step-2 relation classifier tests. Covers the four acceptance cases from the
 * 722 Event line plus the two P1 false-merge regressions from step-1 review.
 * All assertions use the deterministic rule layer (mock provider), so they run
 * offline and prove no LLM is needed for the certain cases.
 */
import { describe, it, expect } from "vitest";
import { classifyRelation, decisionToLink, type RelationKind } from "@/lib/relation-classifier";
import { SeedStore } from "@/lib/db/seedStore";
import type { LLMProvider } from "@/lib/llm/provider";
import type { EventCandidate } from "@/lib/event-id";
import type { ResearchEvent } from "@/types";

let cache: ResearchEvent[] | null = null;
async function all(): Promise<ResearchEvent[]> {
  if (!cache) cache = await new SeedStore().listEvents();
  return cache;
}
function bySlug(rows: ResearchEvent[], slug: string): ResearchEvent {
  const e = rows.find((x) => x.slug === slug);
  if (!e) throw new Error(`fixture missing: ${slug}`);
  return e;
}

const CANON = "openai-math-manuscript-collection-release";
const RELEASE = "openai-math-first-corrections-722-to-719";
const WATCH = "watch-openai-math-history-96c4bb80a9f96ff7";
const MECHALIGN = "mechalign-evaluating-semantic-alignment-at-the-project-level-in-mathematical-formalization";
const NAVIER = "navier-stokes-lost-in-translation-lean-mismatch";
const XENA = "and-the-proof-is-checked-in-lean";
const SHARING = "sharing-ai-progress-in-mathematics";
const WORKING = "working-with-academic-communities-to-build-scientific-understanding";

function candidate(event: ResearchEvent, signals: string[] = [], score = 0.8): EventCandidate {
  return { event, score, entityOverlap: 0, peopleOverlap: 0, keywordOverlap: 0, signals };
}

describe("relation classifier — 722 acceptance cases", () => {
  it.each([
    [RELEASE, "followup", "correction"],
    [WATCH, "followup", "correction"],
  ])("repository correction (%s) is a correction Update on the release", async (slug, kind, updateKind) => {
    const rows = await all();
    const e = bySlug(rows, slug);
    const d = await classifyRelation(
      { ...e, slug: `__t_${slug}`, tracking: undefined },
      [candidate(bySlug(rows, CANON), ["repo:openai/math"])]
    );
    expect(d.kind).toBe<RelationKind>(kind as RelationKind);
    expect(d.updateKind).toBe(updateKind);
    expect(d.relation).toBe("same-event");
    expect(d.decidedBy).toBe("rule");
  });

  it.each([MECHALIGN, NAVIER])("independent audit (%s) is a verification Update", async (slug) => {
    const rows = await all();
    const e = bySlug(rows, slug);
    const sig = slug === MECHALIGN ? ["alias:openai math"] : ["arXiv:2610.08144"];
    const d = await classifyRelation(
      { ...e, slug: `__t_${slug}`, tracking: undefined },
      [candidate(bySlug(rows, CANON), sig)]
    );
    expect(d.kind).toBe<RelationKind>("verification");
    expect(d.relation).toBe("same-event");
    expect(d.decidedBy).toBe("rule");
  });

  it("Xena methodological post is RELATED, never a verification", async () => {
    const rows = await all();
    const e = bySlug(rows, XENA);
    const d = await classifyRelation(
      { ...e, slug: `__t_${XENA}`, tracking: undefined },
      [candidate(bySlug(rows, CANON), ["alias:openai math"])]
    );
    expect(d.kind).toBe<RelationKind>("related");
    expect(d.relation).toBe("related-event");
    expect(d.decidedBy).toBe("rule");
  });

  it("same-day publisher announcement is REPORT (source only, no Update)", async () => {
    const rows = await all();
    const e = bySlug(rows, SHARING);
    const d = await classifyRelation(
      { ...e, slug: `__t_${SHARING}`, tracking: undefined },
      [candidate(bySlug(rows, CANON), ["host:openai.com"])]
    );
    expect(d.kind).toBe<RelationKind>("report");
    expect(d.updateKind).toBe("report");
    expect(d.relation).toBe("same-event");
  });

  it("later publisher announcement adding results is a FOLLOW-UP", async () => {
    const rows = await all();
    const e = bySlug(rows, WORKING);
    const d = await classifyRelation(
      { ...e, slug: `__t_${WORKING}`, tracking: undefined },
      [candidate(bySlug(rows, CANON), ["host:openai.com"])]
    );
    expect(d.kind).toBe<RelationKind>("followup");
    expect(d.updateKind).toBe("followup");
  });

  it("retains evidence and a human-readable reason", async () => {
    const rows = await all();
    const e = bySlug(rows, MECHALIGN);
    const d = await classifyRelation(
      { ...e, slug: `__t_${MECHALIGN}`, tracking: undefined },
      [candidate(bySlug(rows, CANON), ["alias:openai math"])]
    );
    expect(d.evidence.length).toBeGreaterThan(0);
    expect(d.evidence.some((x) => x.startsWith("cue:"))).toBe(true);
    expect(d.reason.length).toBeGreaterThan(10);
    expect(d.matchedToSlug).toBe(CANON);
  });
});

describe("relation classifier — P1 false-merge regressions", () => {
  it("a paper using openai/math as one of six datasets stays independent", async () => {
    const rows = await all();
    const canon = bySlug(rows, CANON);
    const comparator: ResearchEvent = {
      ...bySlug(rows, MECHALIGN),
      id: "evt_false_cmp",
      slug: "six-datasets-comparator",
      title: "A unified benchmark over six theorem-proving corpora",
      summary:
        "We evaluate provers across six datasets: minif2f, fimo, proofnet, lean-workbook, " +
        "openai/math and mathlib. The comparison studies pass rates and reports aggregate scores.",
      paperUrl: "https://arxiv.org/abs/2611.00001",
      sourceUrl: "https://arxiv.org/abs/2611.00001",
      entities: { institutions: ["Acme University"] },
      significance: "",
      tracking: undefined,
    };
    const d = await classifyRelation(comparator, [candidate(canon, ["alias:openai math"])]);
    expect(d.kind).toBe<RelationKind>("independent");
    expect(d.relation).toBe("independent");
  });

  it("generic check/evaluation words do not fabricate a verification", async () => {
    const rows = await all();
    const canon = bySlug(rows, CANON);
    const survey: ResearchEvent = {
      ...bySlug(rows, MECHALIGN),
      id: "evt_false_survey",
      slug: "generic-evaluation-survey",
      title: "A survey of evaluation methods for formal proof assistants",
      summary:
        "We check and compare evaluation metrics and evaluation harnesses across proof " +
        "assistants. This is a general methods survey about no particular release.",
      paperUrl: "https://arxiv.org/abs/2611.00002",
      sourceUrl: "https://arxiv.org/abs/2611.00002",
      entities: {},
      significance: "",
      tracking: undefined,
    };
    const d = await classifyRelation(survey, [candidate(canon, ["repo:openai/math"])]);
    expect(d.kind).not.toBe<RelationKind>("verification");
    expect(d.decidedBy).not.toBe("llm"); // no model call; mock provider unused
  });

  it("no candidates yields a conservative independent decision", async () => {
    const rows = await all();
    const e = bySlug(rows, NAVIER);
    const d = await classifyRelation({ ...e, slug: "__t_none", tracking: undefined }, []);
    expect(d.kind).toBe<RelationKind>("independent");
    expect(d.decidedBy).toBe("default");
  });
});

describe("decisionToLink writes a valid EventLink shape", () => {
  it("maps a same-event verification to a same-event link with evidence in the reason", async () => {
    const rows = await all();
    const e = bySlug(rows, NAVIER);
    const d = await classifyRelation(
      { ...e, slug: "__t_link", tracking: undefined },
      [candidate(bySlug(rows, CANON), ["arXiv:2610.08144"])]
    );
    const link = decisionToLink(d, e);
    expect(link.relation).toBe("same-event");
    expect(link.eventId).toBeTruthy();
    expect(link.reason).toContain("[cue:");
    expect(link.matchedBy).toBe("heuristic");
  });

  it("maps a related decision to a related-event edge, not a merge", async () => {
    const rows = await all();
    const e = bySlug(rows, XENA);
    const d = await classifyRelation(
      { ...e, slug: "__t_rel", tracking: undefined },
      [candidate(bySlug(rows, CANON), ["alias:openai math"])]
    );
    const link = decisionToLink(d, e);
    expect(link.relation).toBe("related-event");
    expect(link.relatedTo?.kind).toBe("related");
  });

  it("uses a type-valid matchedBy for the default independent branch", async () => {
    const rows = await all();
    const e = bySlug(rows, NAVIER);
    const d = await classifyRelation({ ...e, slug: "__t_default", tracking: undefined }, []);
    expect(d.decidedBy).toBe("default");
    const link = decisionToLink(d, e);
    // "default" is not in EventLink["matchedBy"]; a standalone record is a seed.
    expect(["seed", "heuristic", "llm", "curated"]).toContain(link.matchedBy);
    expect(link.matchedBy).toBe("seed");
    expect(link.relation).toBe("independent");
  });
});

describe("relation classifier — subject-binding P1 regressions (same domain / same dataset)", () => {
  it("an unrelated OpenAI voice-product launch is NOT a followup of the 722 release", async () => {
    const rows = await all();
    const canon = bySlug(rows, CANON);
    const voice: ResearchEvent = {
      ...bySlug(rows, WORKING),
      id: "evt_voice_launch",
      slug: "openai-voice-mode-launch",
      date: "2026-11-01",
      title: "OpenAI announces a new voice mode with realtime speech",
      summary:
        "OpenAI released a voice assistant with improved realtime speech and audio. " +
        "The product adds natural conversation to the consumer app.",
      sourceUrl: "https://openai.com/index/introducing-voice-mode",
      sourceType: "news",
      entities: { institutions: ["OpenAI"] },
      significance: "",
      tracking: undefined,
    };
    // host + publisher + generic "released/announces" cue used to fire rule 3.
    const d = await classifyRelation(voice, [candidate(canon, ["host:openai.com"])]);
    expect(d.kind).toBe<RelationKind>("independent");
    expect(d.relation).toBe("independent");
    expect(d.decidedBy).not.toBe("rule");
  });

  it("a compiler paper using openai/math as one eval dataset is NOT a verification", async () => {
    const rows = await all();
    const canon = bySlug(rows, CANON);
    const compiler: ResearchEvent = {
      ...bySlug(rows, MECHALIGN),
      id: "evt_compiler_eval",
      slug: "bounded-compiler-repair-eval",
      title: "Bounded Compiler-Guided Repair in Lean 4",
      summary:
        "We reproduce and fix failing proof steps with a compiler-guided repair model. " +
        "Evaluation on six datasets (minif2f, fimo, proofnet, lean-workbook, openai/math, mathlib) " +
        "reports aggregate pass rates.",
      paperUrl: "https://arxiv.org/abs/2611.00009",
      sourceUrl: "https://arxiv.org/abs/2611.00009",
      entities: { institutions: ["Acme University"] },
      significance: "",
      tracking: undefined,
    };
    const d = await classifyRelation(compiler, [candidate(canon, ["alias:openai math"])]);
    expect(d.kind).toBe<RelationKind>("independent");
    expect(d.relation).toBe("independent");
  });
});

describe("relation classifier — evidence-sentence gate (same-day / denied audit)", () => {
  it("an unrelated voice launch ON RELEASE DAY is not added as a 722 source", async () => {
    const rows = await all();
    const canon = bySlug(rows, CANON);
    const voice: ResearchEvent = {
      ...bySlug(rows, WORKING),
      id: "evt_neg_voice_sameday",
      slug: "neg-voice-sameday",
      date: canon.date,
      title: "OpenAI announces a new voice mode with realtime speech",
      summary:
        "OpenAI released a voice assistant with improved realtime speech and audio. " +
        "The product adds natural conversation to the consumer app.",
      sourceUrl: "https://openai.com/index/introducing-voice-mode",
      sourceType: "news",
      entities: { institutions: ["OpenAI"] },
      significance: "",
      tracking: undefined,
    };
    const d = await classifyRelation(voice, [candidate(canon, ["host:openai.com"])]);
    expect(d.kind).toBe<RelationKind>("independent");
    expect(d.relation).toBe("independent");
    expect(d.evidenceQuote).toBeUndefined();
  });

  it("a paper stating the corpus is input only and was NOT audited stays independent", async () => {
    const rows = await all();
    const canon = bySlug(rows, CANON);
    const denied: ResearchEvent = {
      ...bySlug(rows, MECHALIGN),
      id: "evt_neg_denied_audit",
      slug: "neg-corpus-input-only",
      date: "2026-11-03",
      title: "Bounded Compiler-Guided Repair in Lean 4",
      summary:
        "We evaluate only our own repair system. The corpus is used only as input to our model; " +
        "we did not audit it. Evaluation on six datasets including openai/math reports aggregate pass rates.",
      paperUrl: "https://arxiv.org/abs/2611.00010",
      sourceUrl: "https://arxiv.org/abs/2611.00010",
      entities: { institutions: ["Acme University"] },
      significance: "",
      tracking: undefined,
    };
    const d = await classifyRelation(denied, [candidate(canon, ["alias:openai math"])]);
    expect(d.kind).toBe<RelationKind>("independent");
    expect(d.relation).toBe("independent");
    expect(d.evidenceQuote).toBeUndefined();
  });

  it("every same-event decision carries one original sentence binding action to result", async () => {
    const rows = await all();
    const canon = bySlug(rows, CANON);
    const cases: [string, string[], string][] = [
      [RELEASE, ["repo:openai/math"], "history.md"],
      [WATCH, ["repo:openai/math"], "repository log"],
      [MECHALIGN, ["alias:openai math"], "manuscript"],
      [NAVIER, ["arXiv:2610.08144"], "natural-language proof"],
      [SHARING, ["host:openai.com"], "results on open problems in mathematics"],
      [WORKING, ["host:openai.com"], "public repository"],
    ];
    for (const [slug, signals, fragment] of cases) {
      const e = bySlug(rows, slug);
      const d = await classifyRelation(
        { ...e, slug: `__q_${slug}`, tracking: undefined },
        [candidate(canon, signals)]
      );
      expect(d.relation, slug).toBe("same-event");
      expect(d.evidenceQuote, slug).toBeTruthy();
      expect(d.evidenceQuote, slug).toContain(fragment);
      expect(d.evidence.some((x) => x.startsWith("quote:")), slug).toBe(true);
    }
  });

  it("does not accept an LLM same-event label without a quoted original sentence", async () => {
    const rows = await all();
    const canon = bySlug(rows, CANON);
    const neutral: ResearchEvent = {
      ...bySlug(rows, MECHALIGN),
      id: "evt_llm_no_quote",
      slug: "llm-no-quote",
      title: "A study of proof-search heuristics",
      summary: "We study heuristic search over Lean tactics and report aggregate scores.",
      significance: "",
      tracking: undefined,
    };
    const provider: LLMProvider = { id: "test-llm", complete: async () => "FOLLOWUP" };
    const d = await classifyRelation(neutral, [candidate(canon, ["alias:openai math"])], { provider });
    expect(d.kind).toBe<RelationKind>("independent");
    expect(d.decidedBy).toBe("default");
  });

  it("writes the evidence sentence into the resulting link reason", async () => {
    const rows = await all();
    const e = bySlug(rows, WATCH);
    const d = await classifyRelation(
      { ...e, slug: "__q_link", tracking: undefined },
      [candidate(bySlug(rows, CANON), ["repo:openai/math"])]
    );
    expect(d.evidenceQuote).toBeTruthy();
    const link = decisionToLink(d, e);
    expect(link.reason).toContain(`quote:${d.evidenceQuote}`);
  });
});

describe("relation classifier — strict LLM label parsing", () => {
  const answering = (reply: string): LLMProvider => ({ id: "test-llm", complete: async () => reply });

  it("does not read a hedged 'FOLLOWUP is not justified' as a FOLLOWUP", async () => {
    const rows = await all();
    const canon = bySlug(rows, CANON);
    const neutral: ResearchEvent = {
      ...bySlug(rows, MECHALIGN),
      id: "evt_neutral_llm",
      slug: "neutral-llm-input",
      title: "A study of proof-search heuristics",
      summary: "We study heuristic search over Lean tactics.",
      significance: "",
      tracking: undefined,
    };
    const d = await classifyRelation(neutral, [candidate(canon, ["alias:openai math"])], {
      provider: answering("FOLLOWUP is not justified"),
    });
    expect(d.kind).toBe<RelationKind>("independent");
    expect(d.decidedBy).toBe("default");
  });

  it("accepts an exact label (with a trailing period)", async () => {
    const rows = await all();
    const canon = bySlug(rows, CANON);
    const neutral: ResearchEvent = {
      ...bySlug(rows, MECHALIGN),
      id: "evt_exact_llm",
      slug: "exact-llm-input",
      title: "A study of proof-search heuristics",
      summary: "We study heuristic search over Lean tactics.",
      significance: "",
      tracking: undefined,
    };
    const d = await classifyRelation(neutral, [candidate(canon, ["alias:openai math"])], {
      provider: answering("RELATED."),
    });
    expect(d.kind).toBe<RelationKind>("related");
    expect(d.decidedBy).toBe("llm");
  });
});
