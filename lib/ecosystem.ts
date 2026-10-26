import type { EventType, ResearchEvent, ResearchEventType } from "@/types";
import { EVENT_TYPES, RESEARCH_EVENT_TYPES } from "@/types";

/** Map legacy and malformed values onto the five primary ecosystem classes. */
export function normalizeEventType(value?: string): EventType | undefined {
  if (!value) return undefined;
  if ((EVENT_TYPES as readonly string[]).includes(value)) return value as EventType;
  // Legacy `Commentary` is ecosystem policy/community; research subtypes stay Research.
  if (value === "Commentary") return "PolicyCommunity";
  // Legacy `Education` is folded into `Institutions` (education is a branch of
  // institution metadata, not its own top-level class).
  if (value === "Education") return "Institutions";
  if ((RESEARCH_EVENT_TYPES as readonly string[]).includes(value)) return "Research";
  return undefined;
}

export function normalizeResearchEventType(
  value?: string
): ResearchEventType | undefined {
  return value && (RESEARCH_EVENT_TYPES as readonly string[]).includes(value)
    ? (value as ResearchEventType)
    : undefined;
}

/**
 * One normalization boundary for seed, ingested and database records.
 * Existing research events become primary `Research` events while keeping
 * their original Discovery / Proof / Benchmark subtype for provenance.
 */
export function normalizeEcosystemEvent(event: ResearchEvent): ResearchEvent {
  const primary = normalizeEventType(event.eventType) ?? "Research";
  const researchEventType =
    event.researchEventType ??
    (primary === "Research" ? normalizeResearchEventType(event.eventType) : undefined);

  return {
    ...event,
    eventType: primary,
    researchEventType,
    reviewStatus:
      event.reviewStatus ??
      (event.provenance === "automated" ? "pending" : "approved"),

  };
}


