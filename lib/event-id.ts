/**
 * Event-id derivation and link lookup, factored out of lib/tracking so both
 * the tracking pipeline and the identity matcher can share one definition
 * without a circular import. Pure functions only.
 */

import type { EventLink, ResearchEvent } from "@/types";
import { curatedEventLinks } from "@/data/seed/event-links";

/** A retrieved candidate Event and the evidence that produced it. */
export interface EventCandidate {
  event: ResearchEvent;
  score: number;
  entityOverlap: number;
  peopleOverlap: number;
  keywordOverlap: number;
  /** Identity evidence that produced this candidate (identity matcher only). */
  signals?: string[];
};

/** Five years covers a research programme without treating the whole archive as one candidate pool. */
export const EVENT_MATCH_LOOKBACK_DAYS = 365 * 5;

/** Stable even before an old record is explicitly migrated into event data. */
export function defaultEventId(event: Pick<ResearchEvent, "id">): string {
  return `event-${event.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

export function eventLinkOf(
  event: Pick<ResearchEvent, "id" | "slug" | "tracking">
): EventLink | undefined {
  // A human-reviewed curated link is an editorial decision about Event
  // membership and outranks a stored link. Ingested records carry a default
  // standalone link from the pipeline; without this precedence a curated
  // release line could never regroup them without rewriting stored data.
  return curatedEventLinks[event.slug] ?? event.tracking;
}

export function eventIdOf(
  event: Pick<ResearchEvent, "id" | "slug" | "tracking">
): string {
  return eventLinkOf(event)?.eventId ?? defaultEventId(event);
}
