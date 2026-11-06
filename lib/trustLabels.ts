import type { EvidenceLevel, EventType, ResearchEvent, SourceTier } from "@/types";

export const EVIDENCE_LABELS: Record<EvidenceLevel, string> = {
  E0: "E0 · Independent check — independent checking is recorded",
  E1: "E1 · Inspectable artifact — code, proofs or data can be inspected",
  E2: "E2 · Research record — a paper or formal research record exists",
  E3: "E3 · Primary claim — the originating party made a public claim",
  E4: "E4 · No public evidence — no evidence recorded",
};

export const TIER_LABELS: Record<SourceTier, string> = {
  S0: "S0 · Primary research record (paper, artifact, official repository)",
  S1: "S1 · Official announcement (lab, university, venue record)",
  S2: "S2 · Independent source",
  S3: "S3 · Reputable science/tech media",
  S4: "S4 · Community discovery signal",
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  Research: "Research — technical and mathematical knowledge progress",
  People: "People — public statements, talks and researcher movements",
  Institutions: "Institutions & Education — initiatives, collaborations, courses and training",
  Funding: "Funding — grants, awards and resource commitments",
  PolicyCommunity: "Policy & Community — policies, declarations and community action",
};

/** Compact "E2 · S0" line used by event cards; pure, so server components can call it. */
export function cardTrustSummary(event: Pick<ResearchEvent, "evidenceLevel" | "sourceTier">): {
  evidence: string;
} {
  const evidence =
    event.evidenceLevel && event.sourceTier
      ? `${event.evidenceLevel} · ${event.sourceTier}`
      : event.evidenceLevel ?? event.sourceTier ?? "";

  return { evidence };
}
