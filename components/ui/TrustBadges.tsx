"use client";

import Link from "next/link";
import type {
  AiRoleLevel,
  EvidenceLevel,
  EventType,
  ResearchEvent,
  SourceTier,
  VerificationStatus,
} from "@/types";
import { useT } from "@/lib/i18n/context";
import { pagesDict } from "@/lib/i18n/dict.pages";

export function TrustPill({
  label,
  code,
  title,
  tone = "default",
  href,
}: {
  label: string;
  code: string;
  title: string;
  tone?: "default" | "accent";
  href?: string;
}) {
  const className = `chip ${tone === "accent" ? "border-accent-300 bg-accent-50 text-accent-800" : ""}`;
  const body = (
    <>
      <span className="font-mono">{code}</span>
      <span className="ml-1.5 text-ink-600">{label}</span>
    </>
  );
  if (href) {
    return (
      <Link href={href} title={title} className={`${className} hover:border-ink-300`}>
        {body}
      </Link>
    );
  }
  return (
    <span title={title} className={className}>
      {body}
    </span>
  );
}

/** Long label for the tooltip, in the reader's language. */
function longLabel(lang: "zh" | "en", kind: "evidence" | "tier" | "type", code: string): string {
  const m = pagesDict[lang].methodology;
  const table = kind === "evidence" ? m.evidenceDesc : kind === "tier" ? m.tierDesc : m.typeDesc;
  return (table as Record<string, string>)[code] ?? code;
}

export function EvidenceLevelPill({ level }: { level: EvidenceLevel }) {
  const { t, lang } = useT();
  return (
    <TrustPill
      code={level}
      label={t.trust.evidence[level]}
      title={longLabel(lang, "evidence", level)}
      tone="accent"
      href="/methodology"
    />
  );
}

export function SourceTierPill({ tier }: { tier: SourceTier }) {
  const { t, lang } = useT();
  return (
    <TrustPill
      code={tier}
      label={t.trust.tier[tier]}
      title={longLabel(lang, "tier", tier)}
      href="/methodology"
    />
  );
}

export function VerificationStatusPill({ status }: { status: VerificationStatus }) {
  const { t, lang } = useT();
  const tone =
    status === "independently_verified"
      ? "chip border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "disputed" || status === "retracted"
        ? "chip border-rose-200 bg-rose-50 text-rose-700"
        : status === "corrected" || status === "under_verification"
          ? "chip border-amber-200 bg-amber-50 text-amber-800"
          : "chip";
  const description =
    pagesDict[lang].methodology.verificationDesc[status] ?? t.trust.verification[status];
  return (
    <span title={description} className={tone}>
      {t.trust.verification[status]}
    </span>
  );
}

export function AiRolePill({ level }: { level: AiRoleLevel }) {
  const { t, lang } = useT();
  const tone =
    level === "autonomous"
      ? "chip border-violet-200 bg-violet-50 text-violet-800"
      : level === "assisted"
        ? "chip border-accent-300 bg-accent-50 text-accent-800"
        : "chip border-ink-200 bg-ink-50 text-ink-700";
  return (
    <span title={pagesDict[lang].methodology.aiRoleDesc[level]} className={tone}>
      {t.trust.aiRole[level]}
    </span>
  );
}

export function EventTypePill({ type }: { type: EventType }) {
  const { t, lang } = useT();
  return (
    <span
      title={longLabel(lang, "type", type)}
      className="chip border border-ink-200 bg-ink-50 font-medium text-ink-700"
    >
      {t.trust.type[type]}
    </span>
  );
}

export function provenanceOf(event: ResearchEvent): "curated" | "automated" {
  return event.provenance ?? "curated";
}

