"use client";

import Link from "next/link";
import type { ResearchEvent } from "@/types";
import { formatDate } from "@/lib/utils";
import { AreaBadge } from "@/components/ui/AreaBadge";
import { EvidenceLevelPill, EventTypePill, VerificationBadge } from "@/components/ui/TrustBadges";
import { useT } from "@/lib/i18n/context";

/**
 * The standard Research Event card: answers "What happened?" and
 * "Why does it matter?" before anything else.
 *
 * Two-column layout — body on the left, a meta rail (date, trust badges,
 * source links) on the right — switched by a native CSS container query in
 * globals.css, so it appears only once the card itself is wide enough; in
 * narrow grid cells the rail stacks under the body instead of squeezing the
 * title.
 */
export function EventCard({ event }: { event: ResearchEvent }) {
  const { t, lang } = useT();
  const primaryUrl = event.paperUrl || event.sourceUrl;

  return (
    <article className="card card-hover event-card-container flex flex-col p-5">
      <div className="event-card-body">
        {/* Body: what happened + why it matters */}
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-semibold leading-snug tracking-tight">
            <Link href={`/research/${event.slug}`} className="hover:text-accent-700">
              {event.title}
            </Link>
          </h3>

          {/* Automated entries can carry a full abstract; clamp so one long
              card never stretches its whole grid row. */}
          <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-ink-600">{event.summary}</p>

          {/* Auto-ingested events carry no curated significance; skip the block
              rather than echo a boilerplate disclaimer already shown by the
              trust badges. */}
          {event.significance?.trim() && (
            <div className="mt-3 border-l-2 border-accent-200 pl-3">
              <div className="mono-label mb-0.5">{t.common.whyItMatters}</div>
              <p className="line-clamp-3 text-sm leading-relaxed text-ink-700">{event.significance}</p>
            </div>
          )}
        </div>

        {/* Meta rail: date, taxonomy, trust labels, source links */}
        <div className="event-card-rail">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-ink-500">{formatDate(event.date, lang)}</span>
            {event.isDemo && (
              <span className="chip border-dashed border-ink-300 text-ink-400">{t.common.demo}</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {event.eventType && <EventTypePill type={event.eventType} />}
            <AreaBadge area={event.researchArea} subArea={event.subArea} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {event.verificationStatus && <VerificationBadge status={event.verificationStatus} />}
            {event.evidenceLevel && <EvidenceLevelPill level={event.evidenceLevel} />}
            {event.importanceTier && (
              <span
                className="chip border-amber-200 bg-amber-50 text-amber-800"
                title={`${t.trust.importance[event.importanceTier]} — ${
                  event.importanceNote ?? t.detail.importanceSubjective
                }`}
              >
                {event.importanceTier}
              </span>
            )}
            {event.reviewStatus === "pending" && (
              <span className="chip border-amber-200 bg-amber-50 text-amber-800">
                {t.common.pending}
              </span>
            )}
            {event.provenance === "automated" && (
              <span className="chip border-violet-200 bg-violet-50 text-violet-700" title={t.common.automatedHint}>
                {t.common.automated}
              </span>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-1.5 pt-1 text-sm">
            {primaryUrl && (
              <a
                href={primaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-quiet font-medium"
              >
                {event.eventType === undefined || event.eventType === "Research"
                  ? t.common.paper
                  : t.common.source}
              </a>
            )}
            {event.githubUrl && (
              <a
                href={event.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-quiet font-medium"
              >
                {t.common.github}
              </a>
            )}
            <Link
              href={`/research/${event.slug}`}
              className="inline-flex items-center gap-1 font-medium text-accent-700 hover:underline"
            >
              {t.common.viewDetails} →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
