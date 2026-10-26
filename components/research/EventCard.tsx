"use client";

import Link from "next/link";
import type { ResearchEvent } from "@/types";
import { formatDate } from "@/lib/utils";
import { cardTrustSummary, EventTypePill } from "@/components/ui/TrustBadges";
import { useT } from "@/lib/i18n/context";

/**
 * The standard Research Event card.
 *
 * Answers "What happened?" and "Why does it matter?" before anything else.
 * The layout is deliberately single-column: the two-column body/rail split it
 * used to have squeezed the title in narrow grid cells and duplicated the
 * trust information that the detail page already explains in full.
 *
 * Badge budget (see `cardTrustSummary` in TrustBadges.tsx):
 *   1 event-type badge · at most 1 status badge · 1 primary link.
 * Evidence + tier collapse to a compact "E2 · S2" string in the meta line,
 * and the research direction moves under the title as plain text so it reads
 * as context rather than as a second badge.
 */
export function EventCard({ event }: { event: ResearchEvent }) {
  const { t, lang } = useT();
  const trust = cardTrustSummary(event, t);
  const primaryUrl = event.paperUrl || event.sourceUrl;

  return (
    <article className="card card-hover flex flex-col p-5">
      {/* Type badge sits above the title — it classifies the card, so it reads first. */}
      <div className="flex flex-wrap items-center gap-2">
        {event.eventType && <EventTypePill type={event.eventType} />}
        <span className="font-mono text-xs text-ink-500">{formatDate(event.date, lang)}</span>
      </div>

      <h3 className="mt-2.5 text-[17px] font-semibold leading-snug tracking-tight">
        <Link href={`/research/${event.slug}`} className="hover:text-accent-700">
          {event.title}
        </Link>
      </h3>

      {/* Research direction as quiet meta text under the title, not a badge. */}
      {event.researchArea && (
        <div className="mt-1 text-xs text-ink-500">
          {event.subArea ? `${event.researchArea} · ${event.subArea}` : event.researchArea}
        </div>
      )}

      {/* Automated entries can carry a full abstract; clamp so one long card
          never stretches its whole grid row. */}
      <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-ink-600">{event.summary}</p>

      {/* Auto-ingested events carry no curated significance; skip the block
          rather than echo a boilerplate disclaimer already shown by the
          trust line. */}
      {event.significance?.trim() && (
        <div className="mt-3 border-l-2 border-accent-200 pl-3">
          <div className="mono-label mb-0.5">{t.common.whyItMatters}</div>
          <p className="line-clamp-2 text-sm leading-relaxed text-ink-700">{event.significance}</p>
        </div>
      )}

      {/* Footer: one trust summary line, then exactly one primary link and the
          detail link. GitHub is no longer shown here — it lives on the detail
          page, so a card never competes with itself for the reader's click. */}
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-ink-100 pt-3 text-xs">
        {trust.evidence && (
          <span className="font-mono text-ink-500" title={t.common.automatedHint}>
            {t.common.evidenceShort} {trust.evidence}
          </span>
        )}
        {trust.statusBadge && (
          <span
            className={`chip border font-medium ${trust.statusBadge.tone}`}
            title={trust.statusBadge.title}
          >
            {trust.statusBadge.label}
          </span>
        )}
        {trust.needsReview && !trust.statusBadge && (
          <span className="chip border border-amber-200 bg-amber-50 font-medium text-amber-800">
            {t.common.pending}
          </span>
        )}

        <span className="ml-auto flex items-center gap-3">
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
          <Link
            href={`/research/${event.slug}`}
            className="inline-flex items-center gap-1 font-medium text-accent-700 hover:underline"
          >
            {t.common.viewDetails} →
          </Link>
        </span>
      </div>
    </article>
  );
}
