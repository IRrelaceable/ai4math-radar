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
  const code = type === "PolicyCommunity" ? "P&C" : type.slice(0, 3).toUpperCase();
  return <TrustPill code={code} label={t.trust.type[type]} title={EVENT_TYPE_LABELS[type]} />;
}

export function provenanceOf(event: ResearchEvent): "curated" | "automated" {
  return event.provenance ?? "curated";
}

