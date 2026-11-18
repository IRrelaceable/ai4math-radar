import { expect, it } from "vitest";
import { observeTrackingRelations } from "@/lib/relation-shadow";
import { defaultEventId } from "@/lib/tracking";
import type { ResearchEvent } from "@/types";

it("records a shadow disagreement without assigning the proposed link", async () => {
  const original: ResearchEvent = {
    id: "release",
    slug: "release",
    title: "A collection of mathematical manuscripts",
    summary: "",
    significance: "",
    eventType: "Research",
    sourceType: "github",
    sourceUrl: "https://github.com/example/math",
    date: "2026-10-06",
    createdAt: "2026-10-06T00:00:00Z",
    updatedAt: "2026-10-06T00:00:00Z",
    authors: [],
    relatedWorks: [],
  };
  const incoming: ResearchEvent = {
    ...original,
    id: "revision",
    slug: "revision",
    title: "Repository log correction",
    summary: "The repository log records a correction to three manuscripts.",
    sourceUrl: "https://github.com/example/math/blob/main/history.md",
    date: "2026-10-29",
  };
  const independent: ResearchEvent = {
    ...incoming,
    tracking: {
      eventId: defaultEventId(incoming),
      relation: "independent",
      kind: "initial",
      matchedBy: "seed",
    },
  };
  const [row] = await observeTrackingRelations([incoming], [independent], [original]);
  expect(row).toMatchObject({
    agrees: false,
    current: { kind: "initial", relation: "independent" },
    proposed: { updateKind: "correction", targetEventId: defaultEventId(original) },
    evidenceOrigin: "event summary or significance",
  });
  expect(row.candidates[0].eventId).toBe(defaultEventId(original));
  expect(independent.tracking?.eventId).toBe(defaultEventId(incoming));
  expect(incoming.tracking).toBeUndefined();
});
