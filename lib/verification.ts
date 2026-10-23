// Relative import on purpose: this module is shared with prisma/seed.ts, which
// runs under `tsx` without the Next.js path aliases.
import { EVIDENCE_LEVELS } from "../types";
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
 * evidence-backed AI4Math archives. Three dimensions stay SEPARATE:
 *
 *   verification     = how far the core claim is corroborated right now
 *   evidence level   = how mature the public evidence is
 *   source tier      = where the evidence comes from
 *
 * Importance remains separate from this model. When a score is present it is
 * explicitly labelled as a subjective AI-assisted assessment, never as an
 * objective scientific metric.
 *
 * Significance ≠ Verification: a historically big claim can still be
 * `claimed`, and a machine-checked artifact does not equal independent
 * verification. Never merge these into one score.
 */

export const STATUS_LABELS: Record<VerificationStatus, string> = {
  claimed: "Claimed — announced by the originating party only",
  paper_released: "Paper released — a public research record exists",
  under_verification: "Under verification — material aspects still under scrutiny",
  partially_verified: "Partially verified — important corroboration, open questions remain",
  independently_verified: "Independently verified — reliable independent sources corroborate it",
  disputed: "Disputed — material contestation recorded",
  corrected: "Corrected — a correction has been recorded",
  retracted: "Retracted — the claim was withdrawn",
};

export const EVIDENCE_LABELS: Record<EvidenceLevel, string> = {
  E0: "E0 · Unsubstantiated — no public evidence recorded",
  E1: "E1 · Primary claim — the originating party made a public claim",
  E2: "E2 · Research record — a paper or formal research record exists",
  E3: "E3 · Inspectable artifact — code, proofs or data can be inspected",
  E4: "E4 · Independent check — independent checking is recorded",
};

export const TIER_LABELS: Record<SourceTier, string> = {
  S1: "S1 · Primary research (paper, artifact, official repository)",
  S2: "S2 · Official announcement (lab, university, venue record)",
  S3: "S3 · Independent scholarly corroboration",
  S4: "S4 · Reputable science/tech media",
  S5: "S5 · Community discovery signal",
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  Research: "Research — technical and mathematical knowledge progress",
  People: "People — public statements, talks and researcher movements",
  Institutions: "Institutions — organizational initiatives and collaborations",
  Funding: "Funding — grants, awards and resource commitments",
  Education: "Education — courses, training and teaching resources",
  PolicyCommunity: "Policy & Community — policies, declarations and community action",
};

/**
 * Manual overrides. Only used where the derived rules would be misleading.
 * Key = event slug.
 */
const OVERRIDES: Partial<
  Record<string, Partial<Pick<ResearchEvent, "verificationStatus" | "evidenceLevel" | "eventType">>>
> = {
  // Official lab announcements of graded competition results: the grading claim
  // comes from the contest side, not from a paper, so it stays at "claimed".
  "alphaproof-imo-silver-medal-standard": { verificationStatus: "claimed", evidenceLevel: "E1" },
  "gemini-deep-think-imo-2025-gold-medal": { verificationStatus: "claimed", evidenceLevel: "E1" },
  "numinamath-aimo-progress-prize-1": { verificationStatus: "claimed", evidenceLevel: "E1" },
  "alphaevolve-gemini-coding-agent-algorithms": { verificationStatus: "claimed", evidenceLevel: "E1" },
  // Synthetic examples produced by the mock pipeline — not research evidence.
  "placeholder-event": { verificationStatus: "claimed", evidenceLevel: "E0" },
};

export interface TrustModel {
  verificationStatus: VerificationStatus;
  evidenceLevel: EvidenceLevel;
  sourceTier: SourceTier;
  eventType: EventType;
  researchEventType?: ResearchEventType;
  verificationHistory: VerificationRecord[];
}

export function deriveResearchEventType(
  event: Pick<ResearchEvent, "researchArea" | "title" | "benchmark" | "dataset" | "subArea">
): ResearchEventType {
  if (event.researchArea === "Benchmarks & Datasets") return "Benchmark";
  const blob = [event.title, event.subArea, ...(event.benchmark ?? []), ...(event.dataset ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/\bimo\b|aimo|olympiad|putnam/.test(blob)) return "Competition";
  switch (event.researchArea) {
    case "Formal Mathematics":
      return "Formalization";
    case "Mathematical Discovery":
      return "Discovery";
    case "Theorem Proving":
      return "Proof";
    default:
      return "System";
  }
}

function deriveEvidenceLevel(event: ResearchEvent): EvidenceLevel {
  if (event.githubUrl) return "E3";
  if (event.paperUrl || (event.papers ?? []).length > 0) return "E2";
  if (event.sourceUrl) return "E1";
  return "E0";
}

function deriveSourceTier(event: ResearchEvent): SourceTier {
  if (event.sourceType === "arxiv" || event.sourceType === "conference") return "S1";
  if (event.sourceType === "github") return "S1";
  if (event.sourceType === "blog") return "S2";
  return "S2";
}

function deriveStatus(event: ResearchEvent, evidence: EvidenceLevel): VerificationStatus {
  if (evidence === "E2" || evidence === "E3") return "paper_released";
  return "claimed";
}

function deriveHistory(
  event: ResearchEvent,
  status: VerificationStatus,
  evidence: EvidenceLevel
): VerificationRecord[] {
  const first: EvidenceLevel = evidence === "E0" ? "E1" : evidence;
  const history: VerificationRecord[] = [
    {
      date: event.date,
      status,
      evidenceLevel: first,
      note: "Recorded when the event entered the tracker.",
    },
  ];
  if (evidence === "E3" || evidence === "E4") {
    history.push({
      date: event.date,
      status,
      evidenceLevel: "E3",
      note: "Inspectable artifact (code, proofs or data) is publicly available.",
    });
  }
  return history;
}

/** Fill any missing trust-model fields with conservative, rule-derived values. */
export function applyTrustModel(event: ResearchEvent): ResearchEvent {
  const override = OVERRIDES[event.slug] ?? {};
  const evidenceLevel = override.evidenceLevel ?? event.evidenceLevel ?? deriveEvidenceLevel(event);
  const verificationStatus =
    override.verificationStatus ?? event.verificationStatus ?? deriveStatus(event, evidenceLevel);
  const sourceTier = event.sourceTier ?? deriveSourceTier(event);
  const eventType = override.eventType ?? event.eventType ?? "Research";
  const researchEventType =
    event.researchEventType ??
    (eventType === "Research" ? deriveResearchEventType(event) : undefined);
  const verificationHistory =
    event.verificationHistory ?? deriveHistory(event, verificationStatus, evidenceLevel);

  return {
    ...event,
    evidenceLevel,
    verificationStatus,
    sourceTier,
    eventType,
    researchEventType,
    verificationHistory,
  };
}

export const EVIDENCE_ORDER = EVIDENCE_LEVELS as readonly EvidenceLevel[];

