"use client";

import type { EvidenceLevel, EventType, ResearchEvent, SourceTier, VerificationStatus } from "@/types";
import { EVIDENCE_LABELS, EVENT_TYPE_LABELS, STATUS_LABELS, TIER_LABELS } from "@/lib/verification";
import { useT } from "@/lib/i18n/context";

const STATUS_TONE: Record<VerificationStatus, string> = {
  claimed: "border-amber-200 bg-amber-50 text-amber-800",
  paper_released: "border-accent-200 bg-accent-50 text-accent-800",
  under_verification: "border-violet-200 bg-violet-50 text-violet-800",
  partially_verified: "border-sky-200 bg-sky-50 text-sky-800",
  independently_verified: "border-emerald-200 bg-emerald-50 text-emerald-800",
  disputed: "border-rose-200 bg-rose-50 text-rose-800",
  corrected: "border-orange-200 bg-orange-50 text-orange-800",
  retracted: "border-ink-300 bg-ink-100 text-ink-600",
};

/** Compact verification pill used on cards. */
export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const { t } = useT();
  return (
    <span
      title={STATUS_LABELS[status]}
      className={`chip border ${STATUS_TONE[status]} font-medium`}
    >
      {t.trust.status[status]}
    </span>
  );
}

/** Evidence / tier / type pills used in the detail sidebar. */
export function TrustPill({
  label,
  code,
  title,
  tone = "default",
}: {
  label: string;
  code: string;
  title: string;
  tone?: "default" | "accent";
}) {
  return (
    <span
      title={title}
      className={`chip ${tone === "accent" ? "border-accent-300 bg-accent-50 text-accent-800" : ""}`}
    >
      <span className="font-mono">{code}</span>
      <span className="ml-1.5 text-ink-600">{label}</span>
    </span>
  );
}

export function EvidenceLevelPill({ level }: { level: EvidenceLevel }) {
  const { t } = useT();
  return <TrustPill code={level} label={t.trust.evidence[level]} title={EVIDENCE_LABELS[level]} tone="accent" />;
}

export function SourceTierPill({ tier }: { tier: SourceTier }) {
  const { t } = useT();
  return <TrustPill code={tier} label={t.trust.tier[tier]} title={TIER_LABELS[tier]} />;
}

export function EventTypePill({ type }: { type: EventType }) {
  const { t } = useT();
  return <TrustPill code={EVENT_TYPE_CODES[type]} label={t.trust.type[type]} title={EVENT_TYPE_LABELS[type]} />;
}

/** Single-letter/short codes for the five ecosystem classes, fixed here so the
 *  card badge, the /latest chips and the /sources grouping never drift apart. */
export const EVENT_TYPE_CODES: Record<EventType, string> = {
  Research: "RES",
  People: "PPL",
  Institutions: "INS",
  Funding: "FND",
  PolicyCommunity: "P&C",
};

/**
 * Card trust budget — the single source of truth for what a card may show.
 *
 * A card may show AT MOST:
 *   - 1 event-type badge (the only "what class is this" signal)
 *   - 1 status badge: the trust summary, or a state marker when the trust
 *     summary is not meaningful yet
 *   - 1 primary link (paper/source OR github, never both)
 *
 * The detailed verification / evidence / tier breakdown lives on the detail
 * page, where there is room to explain what each dimension means. Evidence
 * and tier collapse to a compact "E2 · S2" string; verification only earns a
 * badge when it is something a reader must act on (disputed / retracted /
 * corrected), because a green "independently verified" chip on every card is
 * noise, not signal.
 */
export type CardTrustSummary = {
  /** e.g. "E2 · S2" — evidence level and source tier in one string. */
  evidence: string;
  /** Optional badge; undefined when trust is routine and needs no flag. */
  statusBadge?: { label: string; tone: string; title: string };
  /** True when the entry was machine-ingested and not yet human-reviewed. */
  needsReview: boolean;
};

/** Verification states that always deserve a visible card badge. */
const ACTIONABLE_STATUS: Partial<Record<VerificationStatus, string>> = {
  disputed: "Disputed",
  retracted: "Retracted",
  corrected: "Corrected",
  under_verification: "Under review",
};

export function cardTrustSummary(
  event: ResearchEvent,
  t: { trust: { status: Record<VerificationStatus, string> }; common: { pending: string } }
): CardTrustSummary {
  const evidence =
    event.evidenceLevel && event.sourceTier
      ? `${event.evidenceLevel} · ${event.sourceTier}`
      : event.evidenceLevel ?? event.sourceTier ?? "";

  const status = event.verificationStatus;
  const actionable = status ? ACTIONABLE_STATUS[status] : undefined;
  const isPending = event.reviewStatus === "pending";

  let statusBadge: CardTrustSummary["statusBadge"];
  if (actionable && status) {
    statusBadge = {
      label: t.trust.status[status],
      tone: STATUS_TONE[status],
      title: STATUS_LABELS[status],
    };
  } else if (isPending) {
    statusBadge = {
      label: t.common.pending,
      tone: "border-amber-200 bg-amber-50 text-amber-800",
      title: "Awaiting human review",
    };
  }

  return { evidence, statusBadge, needsReview: isPending };
}

export function provenanceOf(event: ResearchEvent): "curated" | "automated" {
  return event.provenance ?? "curated";
}

