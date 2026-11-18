import type { EventType, ResearchEvent } from "@/types";
import { EVENT_TYPES } from "@/types";
import { AUDIT_RESEARCH_AREAS, AUDIT_DIRECTIONS, AUDIT_AI_ROLES } from "@/data/seed/audit-labels";
import { curatedEventLinks } from "@/data/seed/event-links";

/** Map legacy and malformed values onto the five primary ecosystem classes. */
export function normalizeEventType(value?: string): EventType | undefined {
  if (!value) return undefined;
  if ((EVENT_TYPES as readonly string[]).includes(value)) return value as EventType;
  // Legacy `Commentary` is ecosystem policy/community.
  if (value === "Commentary") return "PolicyCommunity";
  // Legacy `Education` is folded into `Institutions` (education is a branch of
  // institution metadata, not its own top-level class).
  if (value === "Education") return "Institutions";
  return undefined;
}

/**
 * One normalization boundary for seed, ingested and database records.
 * Missing or unrecognized classes fall back to the primary `Research` class.
 * Ecosystem classes carry no AI-performed research, so their AI role is
 * deterministically `not_applicable`; only Research events are left unmarked
 * for per-event audit.
 */
/**
 * Durable tracking for a record with no stored link. Every stored record
 * belongs to exactly one Event, so a gap is filled at the normalization
 * boundary instead of being resolved ad hoc per surface.
 *
 * Order matters: a human-reviewed curated link (release series such as AI
 * Scientist or DeepSeek-Prover) must win, otherwise materializing a default
 * would break the eventLinkOf() fallback and split those lines apart. Only a
 * record with neither a stored link nor a curated one becomes a standalone.
 * The id rule mirrors defaultEventId() in lib/tracking.
 */
function defaultTracking(event: ResearchEvent): ResearchEvent["tracking"] {
  const curated = curatedEventLinks[event.slug];
  if (curated) return curated;
  return {
    eventId: `event-${event.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`,
    kind: "initial",
    relation: "independent",
    matchedBy: "seed",
    reason: "curated archive record: standalone event",
  };
}

export function normalizeEcosystemEvent(event: ResearchEvent): ResearchEvent {
  const primary = normalizeEventType(event.eventType) ?? "Research";
  const out: ResearchEvent = { ...event, eventType: primary };

  // Every record owns an Event. Records without a pipeline-assigned link get a
  // deterministic standalone one; existing links (curated or heuristic) win.
  // This fills the seed archive's gap without touching the source files.
  if (!out.tracking) out.tracking = defaultTracking(out);

  // Human-adjudicated audit values fill gaps at the shared normalization
  // boundary, so both seed and ingested source files stay untouched and a
  // re-sync never overwrites a curated judgment. Stored values always win.
  if (primary === "Research") {
    if (!out.researchArea && AUDIT_RESEARCH_AREAS[out.slug])
      out.researchArea = AUDIT_RESEARCH_AREAS[out.slug];
    if (!out.direction && AUDIT_DIRECTIONS[out.slug])
      out.direction = AUDIT_DIRECTIONS[out.slug];
    if (!out.aiRole && AUDIT_AI_ROLES[out.slug])
      out.aiRole = AUDIT_AI_ROLES[out.slug];
  } else {
    out.aiRole = out.aiRole ?? { level: "not_applicable" };
  }
  return out;
}
