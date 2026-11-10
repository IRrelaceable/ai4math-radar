"use client";

import Link from "next/link";
import type {
  AiRoleLevel,
  EvidenceLevel,
  EventType,
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
  const className = `chip gap-1.5 ${tone === "accent" ? "border-accent-300 bg-accent-50 text-accent-800" : ""}`;
  const body = (
    <>
      <span className="font-mono font-medium">{code}</span>
      <span>{label}</span>
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

/**
 * Evidence is a strength scale, so it gets a five-step filled bar rather than
 * a pill. `data-level` drives the ink depth in globals.css.
 */
export function EvidenceLevelPill({ level }: { level: EvidenceLevel }) {
  const { t, lang } = useT();
  return (
    <Link
      href="/methodology"
      title={longLabel(lang, "evidence", level)}
      className="inline-flex items-center hover:opacity-70"
    >
      <span className="trust-code trust-evidence" data-level={level}>
        <span className="font-medium text-ink-800">{level}</span>
        <span className="font-sans text-[11px]">{t.trust.evidence[level]}</span>
      </span>
    </Link>
  );
}

/** Source tier is a provenance axis, so it stays an outlined square code. */
export function SourceTierPill({ tier }: { tier: SourceTier }) {
  const { t, lang } = useT();
  return (
    <Link
      href="/methodology"
      title={longLabel(lang, "tier", tier)}
      className="inline-flex items-center hover:opacity-70"
    >
      <span className="trust-tier gap-1.5" data-level={tier}>
        <span className="font-medium">{tier}</span>
        <span className="font-sans text-[10px]">{t.trust.tier[tier]}</span>
      </span>
    </Link>
  );
}

export function VerificationStatusPill({ status }: { status: VerificationStatus }) {
  const { t, lang } = useT();
  const tone =
    status === "independently_verified"
      ? "chip border-emerald-300 bg-emerald-50 text-emerald-800"
      : status === "disputed" || status === "retracted"
        ? "chip border-rose-300 bg-rose-50 text-rose-700"
        : status === "corrected" || status === "under_verification"
          ? "chip border-amber-300 bg-amber-50 text-amber-800"
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
      ? "chip border-violet-300 bg-violet-50 text-violet-800"
      : level === "assisted"
        ? "chip border-accent-300 bg-accent-50 text-accent-800"
        : "chip border-ink-200 bg-ink-50 text-ink-700";
  return (
    <span title={pagesDict[lang].methodology.aiRoleDesc[level]} className={tone}>
      {t.trust.aiRole[level]}
    </span>
  );
}

/** Event class reads as a leading colour bar plus plain text, not a pill. */
export function EventTypePill({ type }: { type: EventType }) {
  const { t, lang } = useT();
  return (
    <span
      title={longLabel(lang, "type", type)}
      className="inline-flex items-center gap-1.5 text-xs text-ink-600"
    >
      <span className="type-bar h-3.5" data-type={type} aria-hidden="true" />
      {t.trust.type[type]}
    </span>
  );
}
