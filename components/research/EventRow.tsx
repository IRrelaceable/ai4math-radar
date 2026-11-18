import Link from "next/link";
import type { ListEvent } from "@/types";
import { formatDate } from "@/lib/utils";
import { SITE_LANG } from "@/lib/site";
import { dict } from "@/lib/i18n/dict";
import { MATH_TOPICS, facetLabel } from "@/lib/dimensions";

/**
 * Compact list row for the home rails and the compact feed.
 *
 * The right-hand side used to be empty apart from an arrow, so a wide screen
 * wasted half the row. The date, class bar, title, context and trust codes now
 * sit in one scannable line while the row stays shorter than a card.
 */
export function EventRow({ event }: { event: ListEvent }) {
  const lang = SITE_LANG;
  const t = dict[lang];
  const { math } = event.facets;
  const context = [event.eventType ? t.trust.type[event.eventType] : "", event.summary]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/research/${event.slug}`}
      className="feed-row group"
      data-type={event.eventType ?? ""}
    >
      <time
        dateTime={event.date}
        className="w-[5.5rem] shrink-0 pt-0.5 font-mono text-[10px] leading-5 text-ink-400"
      >
        {formatDate(event.date, lang)}
      </time>

      <span
        className="type-bar h-9 self-start"
        data-type={event.eventType ?? ""}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        <div className="row-title h-item line-clamp-1 transition-colors">{event.title}</div>
        <div className="mt-0.5 flex items-center gap-2 overflow-hidden text-[11px] text-ink-500">
          {event.direction && (
            <span className="inline-flex shrink-0 items-center gap-1">
              <span className="direction-dot" data-direction={event.direction} aria-hidden="true" />
              {t.trust.direction[event.direction]}
            </span>
          )}
          {math.map((id) => (
            <span key={id} className="chip hidden shrink-0 px-1.5 py-0 text-[10px] leading-4 sm:inline-flex">
              {facetLabel(MATH_TOPICS, id, lang)}
            </span>
          ))}
          {event.trackingSummary.count > 1 && (
            <span className="shrink-0 whitespace-nowrap text-ink-400">
              {t.common.lineRecords.replace("{n}", String(event.trackingSummary.count))}
            </span>
          )}
          <span className="truncate">{context}</span>
        </div>
      </div>

      {event.evidenceLevel && (
        <span
          className="trust-code trust-evidence hidden shrink-0 sm:inline-flex"
          data-level={event.evidenceLevel}
          title={t.trust.evidence[event.evidenceLevel]}
        >
          <span className="text-ink-700">{event.evidenceLevel}</span>
        </span>
      )}
      {event.sourceTier && (
        <span
          className="trust-tier hidden shrink-0 md:inline-flex"
          data-level={event.sourceTier}
          title={t.trust.tier[event.sourceTier]}
        >
          {event.sourceTier}
        </span>
      )}

      <span
        aria-hidden="true"
        className="row-arrow shrink-0 self-center font-mono text-xs text-ink-300 transition-colors"
      >
        →
      </span>
    </Link>
  );
}
