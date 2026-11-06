// Relative import on purpose: this module is shared with prisma/seed.ts, which
// runs under `tsx` without the Next.js path aliases.
import { CONTROLLED_SUB_AREAS, EVIDENCE_LEVELS } from "../types";
import { resolveSourceTier as resolveCatalogSourceTier } from "./sources/catalog";
import type {
  EvidenceLevel,
  EventType,
  ResearchEvent,
  ResearchEventType,
  SourceTier,
  VerificationRecord,
  VerificationStatus,
} from "../types";

/**
 * Trust model — a deliberately lightweight version of the pattern used by
 * evidence-backed AI4Math archives. Two dimensions stay SEPARATE:
 *
 *   evidence level   = how mature the public evidence is
 *   source tier      = where the evidence comes from
 *
 * Evidence ≠ Importance: a historically big claim can still sit at E3
 * (announced by the originating party only), and a machine-checked artifact
 * does not equal independent checking. Never merge them into one ranking.
 */

/**
 * Manual overrides. Only used where the derived rules would be misleading.
 * Key = event slug.
 */
const OVERRIDES: Partial<
  Record<string, Partial<Pick<ResearchEvent, "evidenceLevel" | "eventType">>>
> = {
  // Official lab announcements of graded competition results: the grading claim
  // comes from the contest side, not from a paper, so it stays at E3.
  "alphaproof-imo-silver-medal-standard": { evidenceLevel: "E3" },
  "gemini-deep-think-imo-2025-gold-medal": { evidenceLevel: "E3" },
  "numinamath-aimo-progress-prize-1": { evidenceLevel: "E3" },
  "alphaevolve-gemini-coding-agent-algorithms": { evidenceLevel: "E3" },
  // Synthetic examples produced by the mock pipeline — not research evidence.
  "placeholder-event": { evidenceLevel: "E4" },
};

export interface TrustModel {
  evidenceLevel: EvidenceLevel;
  sourceTier: SourceTier;
  eventType: EventType;
  researchEventType?: ResearchEventType;
  verificationHistory: VerificationRecord[];
}

export function deriveResearchEventType(
  event: Pick<ResearchEvent, "researchArea" | "title"> &
    Partial<Pick<ResearchEvent, "benchmark" | "dataset" | "subArea">>
): ResearchEventType {
  if (event.researchArea === "Benchmarks & Datasets") return "Benchmark";
  const blob = [event.title, event.subArea, ...(event.benchmark ?? []), ...(event.dataset ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/\bimo\b|aimo|olympiad|putnam/.test(blob)) return "Competition";
  switch (event.researchArea) {
    case "Theorem Proving & Formal Mathematics":
      // The merged area covers both proof search and the formalization stack;
      // the sub-area is what still separates them.
      return event.subArea === "Autoformalization" ||
        event.subArea === "Formal corpora & libraries" ||
        event.subArea === "Proof assistant tooling"
        ? "Formalization"
        : "Proof";
    case "Mathematical Discovery & Symbolic Computation":
      return "Discovery";
    default:
      return "System";
  }
}

function deriveEvidenceLevel(event: ResearchEvent): EvidenceLevel {
  if (event.githubUrl) return "E1";
  if (event.paperUrl || (event.papers ?? []).length > 0) return "E2";
  if (event.sourceUrl) return "E3";
  return "E4";
}

function deriveSourceTier(event: ResearchEvent): SourceTier {
  const catalogTier = resolveCatalogSourceTier({
    sourceUrl: event.sourceUrl,
  });
  if (catalogTier) return catalogTier;
  if (event.sourceType === "arxiv" || event.sourceType === "conference") return "S0";
  if (event.sourceType === "github") return "S0";
  if (event.sourceType === "blog") return "S1";
  return "S1";
}

function deriveHistory(
  event: ResearchEvent,
  evidence: EvidenceLevel
): VerificationRecord[] {
  const first: EvidenceLevel = evidence === "E4" ? "E3" : evidence;
  const firstStatus = deriveVerificationStatus(evidence);
  const history: VerificationRecord[] = [
    {
      date: event.date,
      evidenceLevel: first,
      status: firstStatus,
      note: "Default evidence level derived from the record's links on the event date.",
    },
  ];
  if (evidence === "E0" || evidence === "E1") {
    history.push({
      date: event.date,
      evidenceLevel: evidence,
      status: deriveVerificationStatus(evidence),
      note:
        evidence === "E0"
          ? "Independent check is publicly recorded."
          : "Inspectable artifact (code, proofs or data) is publicly available.",
    });
  }
  return history;
}

/**
 * Conservative state derived from the link type alone.
 *
 * A released paper is not a verified claim, and a public artifact is not an
 * independent replay; only E0 records an actual independent check. Disputed,
 * corrected and retracted states are never inferred — a source must say so.
 */
function deriveVerificationStatus(evidence: EvidenceLevel): VerificationStatus | undefined {
  switch (evidence) {
    case "E0":
      return "independently_verified";
    case "E1":
    case "E2":
      return "paper_released";
    case "E3":
      return "claimed";
    default:
      return undefined;
  }
}

/** Fill any missing trust-model fields with conservative, rule-derived values. */
export function applyTrustModel(event: ResearchEvent): ResearchEvent {
  const override = OVERRIDES[event.slug] ?? {};
  const evidenceLevel = override.evidenceLevel ?? event.evidenceLevel ?? deriveEvidenceLevel(event);
  const sourceTier = event.sourceTier ?? deriveSourceTier(event);
  const eventType = override.eventType ?? event.eventType ?? "Research";
  const researchEventType =
    event.researchEventType ??
    (eventType === "Research" ? deriveResearchEventType(event) : undefined);
  const verificationHistory =
    event.verificationHistory ?? deriveHistory(event, evidenceLevel);
  // The current state is the latest state recorded, unless the record pins one
  // explicitly. Never recompute a disputed/corrected/retracted state from links.
  const lastRecordedStatus = [...verificationHistory]
    .reverse()
    .find((record) => record.status)?.status;
  const verificationStatus =
    event.verificationStatus ?? lastRecordedStatus ?? deriveVerificationStatus(evidenceLevel);

  return {
    ...event,
    evidenceLevel,
    sourceTier,
    eventType,
    researchEventType,
    verificationHistory,
    verificationStatus,
  };
}

export const EVIDENCE_ORDER = EVIDENCE_LEVELS as readonly EvidenceLevel[];



/**
 * Validate that every `subArea` falls inside the controlled vocabulary for its
 * research area. Sub-areas used to be free text, which let one concept shatter
 * into many one-off labels ("Lean 4", "premise selection", "in-context
 * learning agent"); `CONTROLLED_SUB_AREAS` now pins each governed area to a
 * small closed set. Areas absent from that map are not yet governed and are
 * skipped, so the remaining directions can be migrated incrementally.
 *
 * Relative import on purpose (same reason as above): shared with prisma/seed.ts.
 */
export function validateSubAreas(events: readonly ResearchEvent[]): string[] {
  const problems: string[] = [];
  for (const e of events) {
    const sub = e.subArea;
    if (!e.researchArea || !sub) continue; // ungoverned area, or no sub-area set
    const allowed = CONTROLLED_SUB_AREAS[e.researchArea];
    if (!allowed) continue; // area not governed yet
    if (!allowed.includes(sub)) {
      problems.push(
        `${e.slug}: subArea "${sub}" is not in CONTROLLED_SUB_AREAS["${e.researchArea}"]`
      );
    }
  }
  return problems;
}
