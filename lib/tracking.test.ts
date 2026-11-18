import { describe, expect, it } from "vitest";
import {
  assertValidTracking,
  buildTrackedEvents,
  defaultEventId,
  isMediaReport,
  linkIncomingEvents,
  publishedEvents,
  publishedEventIdBySlug,
  trackingSummaryBySlug,
  updatesOf,
} from "@/lib/tracking";
import type { ResearchEvent } from "@/types";

function event(overrides: Partial<ResearchEvent> & Pick<ResearchEvent, "id" | "slug" | "date">): ResearchEvent {
  return {
    title: overrides.slug,
    summary: "",
    significance: "",
    sourceType: "arxiv",
    sourceUrl: `https://arxiv.org/abs/${overrides.id}`,
    authors: [],
    relatedWorks: [],
    eventType: "Research",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("tracked events", () => {
  it("keeps an unlinked historical source as a deterministic singleton event", () => {
    const source = event({ id: "evt_one", slug: "one", date: "2026-01-01" });
    const [tracked] = buildTrackedEvents([source]);
    expect(tracked.id).toBe(defaultEventId(source));
    expect(tracked.progress).toHaveLength(1);
  });

  it("groups an explicit follow-up without losing either source record", () => {
    const first = event({ id: "evt_one", slug: "one", date: "2026-01-01" });
    const second = event({
      id: "evt_two",
      slug: "two",
      date: "2026-02-01",
      tracking: { eventId: defaultEventId(first), kind: "followup", relation: "same-event", matchedBy: "curated" },
    });
    const [tracked] = buildTrackedEvents([first, second]);
    expect(tracked.progress.map((step) => step.eventSlug)).toEqual(["two", "one"]);
  });

  it("treats a second record of the same paper as a source, not an update", async () => {
    const first = event({ id: "evt_one", slug: "one", date: "2026-01-01", paperUrl: "https://arxiv.org/abs/1" });
    const next = event({ id: "evt_two", slug: "two", date: "2026-02-01", paperUrl: "https://arxiv.org/abs/1" });
    const [linked] = await linkIncomingEvents([next], [first]);
    expect(linked.tracking).toMatchObject({
      eventId: defaultEventId(first),
      kind: "report",
      relation: "same-event",
      matchedBy: "heuristic",
    });
    const [tracked] = buildTrackedEvents([first, linked]);
    expect(updatesOf(tracked)).toHaveLength(1);
    expect(tracked.progress).toHaveLength(2);
  });

  it("appends a numbered series episode even when the host is not extracted", async () => {
    const part1 = event({
      id: "evt_p1",
      slug: "series-part-i",
      date: "2026-01-01",
      sourceType: "blog",
      title: "Podcasts about the Topic",
      entities: { people: ["Host A", "Guest X"] },
    });
    const part2 = event({
      id: "evt_p2",
      slug: "series-part-ii",
      date: "2026-01-14",
      sourceType: "blog",
      title: "Podcasts about the Topic: Part II",
      entities: { people: ["Host A", "Guest Y"] },
    });
    const part3 = event({
      id: "evt_p3",
      slug: "series-part-iii",
      date: "2026-01-28",
      sourceType: "blog",
      title: "Podcasts about the Topic: Part III with Someone New",
      entities: { people: ["Guest Z"] },
    });
    const linked = await linkIncomingEvents([part2, part3], [part1]);
    expect(linked[0].tracking).toMatchObject({ kind: "followup", relation: "same-event" });
    expect(linked[1].tracking).toMatchObject({ kind: "followup", relation: "same-event" });
    const [tracked] = buildTrackedEvents([part1, ...linked]);
    expect(updatesOf(tracked)).toHaveLength(3);
  });

  it("does not silently regroup an already persisted assignment", async () => {
    const assigned = event({
      id: "evt_one",
      slug: "one",
      date: "2026-01-01",
      tracking: { eventId: "event-reviewed", kind: "initial", relation: "same-event", matchedBy: "curated" },
    });
    const [linked] = await linkIncomingEvents([assigned], []);
    expect(linked.tracking).toEqual(assigned.tracking);
  });

  it("publishes only events with updates, a project or a relation", () => {
    const singleton = event({ id: "evt_one", slug: "one", date: "2026-01-01" });
    const first = event({
      id: "evt_a",
      slug: "a",
      date: "2026-01-01",
      tracking: { eventId: "event-reviewed", kind: "initial", relation: "same-event", matchedBy: "curated" },
    });
    const followup = event({
      id: "evt_b",
      slug: "b",
      date: "2026-02-01",
      tracking: { eventId: "event-reviewed", kind: "followup", relation: "same-event", matchedBy: "curated" },
    });
    const events = [singleton, first, followup];

    expect(publishedEvents(events).map((tracked) => tracked.id)).toEqual(["event-reviewed"]);
    const index = publishedEventIdBySlug(events);
    expect(index.has("one")).toBe(false);
    expect(index.get("a")).toBe("event-reviewed");
    expect(index.get("b")).toBe("event-reviewed");
  });
});

describe("media re-reports", () => {
  it("adds a source but never an update", async () => {
    const paper = event({
      id: "evt_one",
      slug: "one",
      date: "2026-01-01",
      title: "Prover reaches new benchmark",
      paperUrl: "https://arxiv.org/abs/1",
    });
    const news = event({
      id: "evt_two",
      slug: "two",
      date: "2026-01-03",
      title: "Prover reaches new benchmark",
      sourceType: "news",
      paperUrl: "https://arxiv.org/abs/1",
    });
    expect(isMediaReport(news, paper)).toBe(true);
    const [linked] = await linkIncomingEvents([news], [paper]);
    expect(linked.tracking).toMatchObject({ kind: "report", relation: "same-event" });
    const [tracked] = buildTrackedEvents([paper, linked]);
    expect(updatesOf(tracked)).toHaveLength(1);
    expect(tracked.progress).toHaveLength(2);
    expect(tracked.latestAt).toBe("2026-01-01");
  });

  it("keeps a genuinely new development as an update even from news", async () => {
    const first = event({
      id: "evt_one",
      slug: "one",
      date: "2026-01-01",
      title: "Prover V1 released",
      paperUrl: "https://arxiv.org/abs/1",
    });
    const news = event({
      id: "evt_two",
      slug: "two",
      date: "2026-02-01",
      title: "Prover V2 released with tree search",
      sourceType: "news",
      paperUrl: "https://arxiv.org/abs/2",
      entities: { people: ["Alice"] },
    });
    const withEntities = { ...first, title: "Prover V1 released with synthetic data", entities: { people: ["Alice"] } };
    const [linked] = await linkIncomingEvents([news], [withEntities]);
    expect(linked.tracking?.kind).not.toBe("report");
  });
});

describe("five-relation routing", () => {
  it("routes a reproduction cue to a related-event edge, not a merge", async () => {
    const original = event({
      id: "evt_one",
      slug: "one",
      date: "2026-01-01",
      title: "System X solves benchmark",
      entities: { people: ["Dr. X"] },
    });
    const reproduction = event({
      id: "evt_two",
      slug: "two",
      date: "2026-02-01",
      title: "Independent reproduction of System X results",
      entities: { people: ["Dr. X"] },
    });
    const [linked] = await linkIncomingEvents([reproduction], [original]);
    expect(linked.tracking).toMatchObject({ relation: "related-event", kind: "initial" });
    expect(linked.tracking?.relatedTo).toMatchObject({ eventId: defaultEventId(original), kind: "reproduction" });
    expect(linked.tracking?.eventId).toBe(defaultEventId(reproduction));
  });

  it("does not merge same-institution announcements about different people", async () => {
    const a = event({
      id: "evt_one",
      slug: "one",
      date: "2026-01-01",
      title: "Professor A named 2027 AMS Fellow",
      eventType: "People",
      entities: { people: ["Professor A"], institutions: ["AMS"] },
    });
    const b = event({
      id: "evt_two",
      slug: "two",
      date: "2026-01-02",
      title: "Professor B named 2027 AMS Fellow",
      eventType: "People",
      entities: { people: ["Professor B"], institutions: ["AMS"] },
    });
    const [linked] = await linkIncomingEvents([b], [a]);
    expect(linked.tracking?.relation).not.toBe("same-event");
  });

  it("does not merge different editions of a recurring award", async () => {
    const a = event({
      id: "evt_one",
      slug: "one",
      date: "2025-02-01",
      title: "MIT faculty named 2025 Sloan Research Fellows",
      entities: { institutions: ["MIT"] },
    });
    const b = event({
      id: "evt_two",
      slug: "two",
      date: "2026-02-01",
      title: "MIT faculty named 2026 Sloan Research Fellows",
      entities: { institutions: ["MIT"] },
    });
    const [linked] = await linkIncomingEvents([b], [a]);
    expect(linked.tracking?.relation).not.toBe("same-event");
  });

  it("routes a new result under a named project to same-project", async () => {
    const member = event({
      id: "evt_one",
      slug: "deepseek-prover-large-scale-synthetic-data",
      date: "2024-05-01",
      title: "DeepSeek-Prover: large-scale synthetic data",
    });
    const fresh = event({
      id: "evt_two",
      slug: "two",
      date: "2026-02-01",
      title: "DeepSeek-Prover applies new curriculum",
      summary: "A different result under the DeepSeek-Prover programme.",
    });
    const [linked] = await linkIncomingEvents([fresh], [member]);
    expect(linked.tracking).toMatchObject({ relation: "same-project", projectId: "proj-deepseek-prover" });
    expect(linked.tracking?.eventId).toBe(defaultEventId(fresh));
  });
});

describe("tracking validity contract", () => {
  it("accepts a well-formed tracking link", () => {
    expect(() =>
      assertValidTracking(
        event({
          id: "evt_ok",
          slug: "ok",
          date: "2026-01-01",
          tracking: { eventId: "event-evt_ok", kind: "initial", relation: "independent", matchedBy: "seed" },
        })
      )
    ).not.toThrow();
  });

  it("rejects a missing tracking link", () => {
    expect(() => assertValidTracking(event({ id: "evt_x", slug: "x", date: "2026-01-01" }))).toThrow(
      /no valid tracking eventId/
    );
  });

  it("rejects an invalid relation (e.g. legacy same-technology)", () => {
    expect(() =>
      assertValidTracking(
        event({
          id: "evt_x",
          slug: "x",
          date: "2026-01-01",
          tracking: { eventId: "e", kind: "initial", relation: "same-technology" as never, matchedBy: "seed" },
        })
      )
    ).toThrow(/invalid relation/);
  });

  it("rejects an empty event id", () => {
    expect(() =>
      assertValidTracking(
        event({
          id: "evt_x",
          slug: "x",
          date: "2026-01-01",
          tracking: { eventId: "  ", kind: "initial", relation: "independent", matchedBy: "seed" },
        })
      )
    ).toThrow(/no valid tracking eventId/);
  });

  it("rejects a stored record with a broken link before matching", async () => {
    const broken = event({
      id: "evt_bad",
      slug: "bad",
      date: "2026-01-01",
      tracking: { eventId: "e", kind: "initial", relation: "same-technology" as never, matchedBy: "seed" },
    });
    await expect(linkIncomingEvents([broken], [])).rejects.toThrow(/invalid relation/);
  });

  it("every pipeline output satisfies the contract", async () => {
    const rows = [
      event({ id: "evt_a", slug: "a", date: "2026-01-01", title: "Alpha" }),
      event({ id: "evt_b", slug: "b", date: "2026-01-02", title: "Beta unrelated" }),
    ];
    const linked = await linkIncomingEvents(rows, []);
    for (const row of linked) expect(() => assertValidTracking(row)).not.toThrow();
  });
});

describe("tracking summary (current collection state)", () => {
  it("reports count = source records in the line, including media re-reports", async () => {
    const first = event({ id: "evt_one", slug: "one", date: "2026-01-01", paperUrl: "https://arxiv.org/abs/1" });
    const report = event({ id: "evt_two", slug: "two", date: "2026-02-01", paperUrl: "https://arxiv.org/abs/1" });
    const [linked] = await linkIncomingEvents([report], [first]);
    const events = [first, linked];

    const summaries = trackingSummaryBySlug(events);
    const tracked = buildTrackedEvents(events)[0];
    // progress.length = 2 (source + media re-report), even though updatesOf = 1.
    expect(tracked.progress).toHaveLength(2);
    expect(updatesOf(tracked)).toHaveLength(1);
    expect(summaries.get("one")).toEqual({ eventId: tracked.id, count: 2 });
    expect(summaries.get("two")).toEqual({ eventId: tracked.id, count: 2 });
  });

  it("gives every record a summary, singletons included", () => {
    const rows = [
      event({ id: "evt_a", slug: "a", date: "2026-01-01" }),
      event({ id: "evt_b", slug: "b", date: "2026-01-02" }),
    ];
    const summaries = trackingSummaryBySlug(rows);
    expect(summaries.size).toBe(2);
    expect(summaries.get("a")?.count).toBe(1);
    expect(summaries.get("b")?.count).toBe(1);
  });
});
describe("editorial event membership", () => {
  it("lets a curated link outrank a stored standalone link on ingested records", () => {
    const canonical = event({ id: "evt_openai", slug: "openai-math-manuscript-collection-release", date: "2026-10-06" });
    const ingested = event({
      id: "evt_audit",
      slug: "sharing-ai-progress-in-mathematics",
      date: "2026-10-06",
      tracking: {
        eventId: defaultEventId(event({ id: "evt_audit", slug: "x", date: "2026-01-01" })),
        kind: "initial",
        relation: "independent",
        matchedBy: "seed",
        reason: "no confirmed prior event",
      },
    });

    const summaries = trackingSummaryBySlug([canonical, ingested]);
    // curatedEventLinks routes the OpenAI announcement as a report on the
    // canonical release, so both records share one Event despite stored data.
    expect(summaries.get("sharing-ai-progress-in-mathematics")?.eventId).toBe(
      summaries.get("openai-math-manuscript-collection-release")?.eventId
    );
    expect(summaries.get("sharing-ai-progress-in-mathematics")?.count).toBe(2);
  });

  it("keeps the Event headline on the initial record when an audit appends a step", () => {
    const canonical = event({
      id: "evt_release",
      slug: "release",
      date: "2026-10-06",
      title: "Manuscript release",
    });
    const audit = event({
      id: "evt_audit",
      slug: "audit",
      date: "2026-10-26",
      title: "Audit paper that must not replace the headline",
      tracking: {
        eventId: defaultEventId(canonical),
        kind: "verification",
        relation: "same-event",
        matchedBy: "curated",
      },
    });

    const [tracked] = buildTrackedEvents([canonical, audit]);
    expect(tracked.title).toBe("Manuscript release");
    expect(tracked.latestAt).toBe("2026-10-26");
    expect(tracked.progress.map((step) => step.kind)).toEqual(["verification", "initial"]);
    expect(updatesOf(tracked)).toHaveLength(2);
  });

  it("records a related-event edge created on the first record of its Event", () => {
    const canonical = event({ id: "evt_release", slug: "release", date: "2026-10-06" });
    const reaction = event({
      id: "evt_reaction",
      slug: "reaction",
      date: "2026-10-07",
      tracking: {
        eventId: defaultEventId(event({ id: "evt_reaction", slug: "x", date: "2026-01-01" })),
        kind: "initial",
        relation: "related-event",
        matchedBy: "curated",
        relatedTo: { eventId: defaultEventId(canonical), kind: "related" },
      },
    });

    const tracked = buildTrackedEvents([canonical, reaction]);
    const reactionEvent = tracked.find((row) => row.id === defaultEventId(reaction));
    expect(reactionEvent?.relations).toHaveLength(1);
    expect(reactionEvent?.relations[0]).toMatchObject({
      toEventId: defaultEventId(canonical),
      kind: "related",
    });
  });
});

describe("headline ownership is order-independent", () => {
  it("keeps the initial record as the headline regardless of input order", () => {
    const initial = event({
      id: "evt_release",
      slug: "release",
      date: "2026-10-06",
      title: "Original release",
    });
    const audit = event({
      id: "evt_audit",
      slug: "audit",
      date: "2026-10-07",
      title: "Late audit paper",
      tracking: {
        eventId: defaultEventId(initial),
        kind: "verification",
        relation: "same-event",
        matchedBy: "curated",
      },
    });
    const followup = event({
      id: "evt_next",
      slug: "next",
      date: "2026-10-08",
      title: "Newest follow-up",
      tracking: {
        eventId: defaultEventId(initial),
        kind: "followup",
        relation: "same-event",
        matchedBy: "curated",
      },
    });

    for (const order of [[initial, audit, followup], [followup, initial, audit], [audit, followup, initial]]) {
      const [tracked] = buildTrackedEvents(order);
      // Follow-ups and audits advance the timeline but never replace the
      // Event's identity, which is fixed by its initial record.
      expect(tracked.title).toBe("Original release");
      expect(tracked.latestAt).toBe("2026-10-08");
      expect(tracked.progress.map((step) => step.kind)).toContain("followup");
    }
  });

  it("does not let a follow-up rename a published release Event", () => {
    const release = event({
      id: "evt_release",
      slug: "release",
      date: "2026-10-06",
      title: "Release of the manuscript collection",
    });
    const newResults = event({
      id: "evt_results",
      slug: "results",
      date: "2026-10-26",
      title: "Three new model results announced",
      tracking: {
        eventId: defaultEventId(release),
        kind: "followup",
        relation: "same-event",
        matchedBy: "curated",
      },
    });

    const [tracked] = buildTrackedEvents([release, newResults]);
    expect(tracked.title).toBe("Release of the manuscript collection");
    expect(tracked.progress.map((step) => step.kind)).toEqual(["followup", "initial"]);
  });
});

describe("bidirectional relation display", () => {
  it("backfills an incoming edge onto the target Event while the source keeps one outgoing edge", () => {
    const canonical = event({ id: "evt_canon", slug: "canon", date: "2026-10-06" });
    const reaction = event({
      id: "evt_reaction",
      slug: "reaction",
      date: "2026-10-07",
      tracking: {
        eventId: defaultEventId(event({ id: "evt_reaction", slug: "x", date: "2026-01-01" })),
        kind: "initial",
        relation: "related-event",
        matchedBy: "curated",
        relatedTo: { eventId: defaultEventId(canonical), kind: "related" },
      },
    });

    const tracked = buildTrackedEvents([canonical, reaction]);
    const target = tracked.find((t) => t.id === defaultEventId(canonical))!;
    const source = tracked.find((t) => t.id === defaultEventId(reaction))!;
    expect(target.relations).toHaveLength(1);
    expect(target.relations[0]).toMatchObject({
      fromEventId: defaultEventId(reaction),
      toEventId: defaultEventId(canonical),
      kind: "related",
    });
    // Storage is still unidirectional: the source holds a single outgoing edge.
    expect(source.relations).toHaveLength(1);
  });

  it("does not duplicate the backfilled edge when the source Event is processed again", () => {
    const a = event({ id: "evt_a", slug: "a", date: "2026-01-01" });
    const b = event({
      id: "evt_b",
      slug: "b",
      date: "2026-01-02",
      tracking: {
        eventId: defaultEventId(event({ id: "evt_b", slug: "x", date: "2026-01-01" })),
        kind: "initial",
        relation: "related-event",
        matchedBy: "curated",
        relatedTo: { eventId: defaultEventId(a), kind: "related" },
      },
    });
    const tracked = buildTrackedEvents([a, b]);
    // No event should ever carry a self-referential mirrored edge.
    for (const t of tracked) {
      for (const edge of t.relations) {
        expect(edge.fromEventId).not.toBe(edge.toEventId);
      }
    }
    expect(tracked.find((t) => t.id === defaultEventId(a))!.relations).toHaveLength(1);
  });
});

describe("correction timeline nodes", () => {
  it("treats a correction step as substantive progress and keeps the initial headline", () => {
    const initial = event({
      id: "evt_release",
      slug: "release",
      date: "2026-10-06",
      title: "Original release",
    });
    const correction = event({
      id: "evt_corr",
      slug: "corr",
      date: "2026-10-08",
      title: "First-round corrections",
      tracking: {
        eventId: defaultEventId(initial),
        kind: "correction",
        relation: "same-event",
        matchedBy: "curated",
      },
    });

    const [tracked] = buildTrackedEvents([initial, correction]);
    expect(tracked.title).toBe("Original release");
    expect(updatesOf(tracked).map((s) => s.kind)).toEqual(["correction", "initial"]);
    expect(tracked.progress).toHaveLength(2);
  });
});
