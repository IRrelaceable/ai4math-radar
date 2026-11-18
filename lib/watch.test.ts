import { describe, expect, it } from "vitest";
import type { LLMProvider } from "@/lib/llm/provider";
import type { ResearchEvent } from "@/types";
import {
  contentFingerprint,
  detectWatchChanges,
  judgeWatchChange,
  parseWatchVerdict,
  watchChangeToEvent,
  type WatchChange,
  type WatchState,
  type WatchTarget,
} from "@/lib/watch";

const target: WatchTarget = {
  id: "history",
  label: "revision log",
  eventId: "event-evt-openai-math-release",
  sourceUrl: "https://example.com/history.md",
  fetchUrl: "https://example.com/history.md",
  sourceTier: "S0",
  researchArea: "Theorem Proving & Formal Mathematics",
  subArea: "Formal corpora & libraries",
  direction: "ai4math",
  enabled: true,
};

function fakeFetch(text: string) {
  return async () => new Response(text, { status: 200 });
}

const change: WatchChange = {
  id: "history-abc123",
  targetId: "history",
  text: "2026-11-18: 2 manuscripts withdrawn, coverage now 717.",
  date: "2026-11-18",
  anchor: "november-18-2026",
  detectedAt: "2026-11-18",
};

class ScriptedProvider implements LLMProvider {
  id = "openai-compatible";
  constructor(private readonly reply: string) {}
  async complete(): Promise<string> {
    return this.reply;
  }
}

const ACCEPTED =
  '{"belongs":true,"kind":"correction","title":"Two withdrawals","titleZh":"撤稿两篇",' +
  '"summary":"Two manuscripts were withdrawn from the release.",' +
  '"summaryZh":"两篇手稿从该发布中撤回。","date":"2026-11-18","reason":"correction to the corpus"}';

describe("watch change detection", () => {
  it("hashes whole documents deterministically", () => {
    expect(contentFingerprint("a\nb")).toBe(contentFingerprint("a\nb"));
    expect(contentFingerprint("a\nb")).not.toBe(contentFingerprint("a\nc"));
  });

  it("first run records a baseline and emits nothing", async () => {
    const document = "## 2026-11-01\nfirst\n## 2026-11-02\nsecond";
    const result = await detectWatchChanges([target], {}, fakeFetch(document), new Date("2026-11-18T00:00:00Z"));
    expect(result.changes).toEqual([]);
    expect(result.nextState.history.sections).toEqual({ "2026-11-01": "first", "2026-11-02": "second" });
    expect(result.nextState.history.fingerprint).toBe(contentFingerprint(document));
  });

  it("passes the full dated section for a new or edited entry", async () => {
    const first = await detectWatchChanges([target], {}, fakeFetch("## 2026-11-01\nfirst"));
    const second = await detectWatchChanges(
      [target],
      first.nextState,
      fakeFetch("## 2026-11-01\ncorrected\n\n## October 29, 2026\n\n**Formalization Fix**\n\n- Corrected two declarations."),
      new Date("2026-11-18T00:00:00Z")
    );
    expect(second.changes).toMatchObject([
      { text: "corrected", previousText: "first", date: "2026-11-01" },
      { text: "**Formalization Fix**\n\n- Corrected two declarations.", date: "2026-10-29" },
    ]);
  });

  it("does not queue an update when the dated sections are reordered", async () => {
    const first = await detectWatchChanges([target], {}, fakeFetch("## 2026-11-01\nfirst\n## 2026-11-02\nsecond"));
    const reordered = await detectWatchChanges(
      [target],
      first.nextState,
      fakeFetch("## 2026-11-02\nsecond\n## 2026-11-01\nfirst")
    );
    expect(reordered.changes).toEqual([]);
  });

  it("re-running the same change against the same state yields the same id (idempotent)", async () => {
    const base: WatchState = {
      history: {
        fingerprint: "old",
        lastCheckedAt: "2026-11-17",
        sections: { "2026-11-17": "existing" },
      },
    };
    const fetchFn = fakeFetch("## 2026-11-17\nexisting\n## 2026-11-18\nnew");
    const a = await detectWatchChanges([target], base, fetchFn);
    const b = await detectWatchChanges([target], base, fetchFn);
    expect(a.changes[0].id).toBe(b.changes[0].id);
    expect(a.changes[0].id).toMatch(/^history-[0-9a-f]{16}$/);
  });

  it("queues first-run backfill only after the cutoff and retains it during source failure", async () => {
    const backfillTarget = { ...target, backfillAfter: "2026-10-26" };
    const first = await detectWatchChanges(
      [backfillTarget], {}, fakeFetch("## October 29, 2026\nrevision\n## October 26, 2026\nold")
    );
    expect(first.changes.map((entry) => entry.date)).toEqual(["2026-10-29"]);
    const retry = await detectWatchChanges(
      [backfillTarget], first.nextState, async () => new Response(null, { status: 503 })
    );
    expect(retry.changes).toEqual(first.changes);
  });

  it("skips disabled targets and continues past a failing fetch", async () => {
    const disabled = { ...target, id: "off", enabled: false };
    const failing: WatchTarget = { ...target, fetchUrl: "https://example.com/404" };
    const result = await detectWatchChanges(
      [disabled, failing],
      {},
      async () => new Response("nope", { status: 404 })
    );
    expect(result.changes).toEqual([]);
    expect(result.trace.some((line) => line.includes("HTTP 404"))).toBe(true);
  });
});

describe("watch verdict parsing", () => {
  it("accepts a well-formed reply", () => {
    const verdict = parseWatchVerdict(ACCEPTED);
    expect(verdict?.belongs).toBe(true);
    expect(verdict?.kind).toBe("correction");
    expect(verdict?.titleZh).toBe("撤稿两篇");
  });

  it("tolerates surrounding prose around the JSON object", () => {
    expect(parseWatchVerdict(`Here is my answer:\n${ACCEPTED}\nDone.`)?.kind).toBe("correction");
  });

  it("rejects malformed, missing-kind, or missing-Chinese replies", () => {
    expect(parseWatchVerdict("not json")).toBeUndefined();
    expect(parseWatchVerdict('{"belongs":true,"kind":"bogus","summary":"x","summaryZh":"中文"}')).toBeUndefined();
    expect(parseWatchVerdict('{"belongs":true,"kind":"followup","summary":"x","summaryZh":"no han"}')).toBeUndefined();
  });

  it("keeps a SEPARATE decision without a kind", () => {
    const verdict = parseWatchVerdict('{"belongs":false,"reason":"different result"}');
    expect(verdict).toEqual({ belongs: false, reason: "different result" });
  });
});

describe("watch judgement", () => {
  it("treats the mock provider as a non-decision", async () => {
    const provider: LLMProvider = { id: "mock", complete: async () => ACCEPTED };
    const verdict = await judgeWatchChange(change, target, { title: "t", summary: "s" }, provider);
    expect(verdict.status).toBe("retry");
  });

  it("uses the LLM verdict when the provider is real", async () => {
    const verdict = await judgeWatchChange(
      change,
      target,
      { title: "t", summary: "s" },
      new ScriptedProvider(ACCEPTED)
    );
    expect(verdict).toMatchObject({ status: "decided", verdict: { belongs: true, kind: "correction" } });
  });
});

describe("watch event materialization", () => {
  it("appends to the bound Event with an llm tracking link", () => {
    const verdict = parseWatchVerdict(ACCEPTED)!;
    const event = watchChangeToEvent(change, target, verdict);
    expect(event.slug).toBe("watch-history-abc123");
    expect(event.tracking).toMatchObject({
      eventId: "event-evt-openai-math-release",
      kind: "correction",
      relation: "same-event",
      matchedBy: "llm",
    });
    expect(event.translations?.zh?.summary).toContain("撤回");
    expect(event.provenance).toBe("automated");
    expect(event.date).toBe("2026-11-18");
    expect(event.sourceUrl).toBe("https://example.com/history.md#november-18-2026");
  });

  it("refuses to materialize a rejected verdict", () => {
    expect(() =>
      watchChangeToEvent(change, target, { belongs: false })
    ).toThrow(/accepted verdict/);
  });

  it("does not change the headline: it is never an initial record", () => {
    const verdict = parseWatchVerdict(ACCEPTED)!;
    const event: ResearchEvent = watchChangeToEvent(change, target, verdict);
    expect(event.tracking?.kind).not.toBe("initial");
  });
});
