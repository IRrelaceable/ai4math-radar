import Link from "next/link";
import type { ListEvent } from "@/types";
import { formatDate } from "@/lib/utils";
import { displayResearchArea } from "@/lib/i18n/localize";
import { SITE_LANG } from "@/lib/site";
import { dict } from "@/lib/i18n/dict";
import { pagesDict } from "@/lib/i18n/dict.pages";

/**
 * The standard Research Event card.
 *
 * Answers "What happened?" and "Why does it matter?" before anything else.
 * The top line carries classification (event class tag + direction dot), the
 * bottom line carries trust (evidence strength bar + outlined source tier).
 *
 * `data-type` on the <article> sets the class hue for the top rule, the tag,
 * the hover tint and the title hover; trust marks intentionally stay graphite
 * so colour never doubles as a reliability verdict. The "why it matters" note
 * uses a fixed warm panel because it is editorial, not event metadata. All
 * three text blocks reserve exactly two lines, so a short title cannot move
 * the coloured panels or the footer relative to the other cards in its row.
 *
 * Rendered on the server: the feed shows hundreds of these, so keeping them
 * out of the client bundle avoids hydrating a card grid on every navigation.
 */
export function EventCard({ event }: { event: ListEvent }) {
  const lang = SITE_LANG;
  const t = dict[lang];
  // The label must match the artifact: a paper only when the record really
  // carries a paper link, a repository when the source is the code, and a
  // plain source link otherwise (news, blog, policy page).
  const primaryLink = event.paperUrl
    ? { url: event.paperUrl, label: t.common.paper }
    : event.githubUrl
      ? { url: event.githubUrl, label: t.common.github }
      : event.sourceUrl
        ? { url: event.sourceUrl, label: t.common.source }
        : undefined;
  const areaLabel = displayResearchArea(event, lang);

  return (
    <article
      className="event-card group flex flex-col p-4"
      data-type={event.eventType ?? ""}
    >
      <div className="flex items-center gap-2 text-[11px] text-ink-500">
        {event.eventType && (
          <span
            title={pagesDict[lang].methodology.typeDesc[event.eventType]}
            className="type-chip"
          >
            <span className="type-bar h-3" aria-hidden="true" />
            {t.trust.type[event.eventType]}
          </span>
        )}
        {event.direction && (
          <span
            title={pagesDict[lang].methodology.directionDesc[event.direction]}
            className="inline-flex shrink-0 items-center gap-1.5"
          >
            <span className="direction-dot" data-direction={event.direction} aria-hidden="true" />
            {t.trust.direction[event.direction]}
          </span>
        )}
        {areaLabel && <span className="truncate text-ink-400">{areaLabel}</span>}
        <time dateTime={event.date} className="ml-auto shrink-0 font-mono text-[10px] text-ink-400">
          {formatDate(event.date, lang)}
        </time>
      </div>

      <h3 className="card-clamp-title mt-2 line-clamp-2 h-item">
        <Link href={`/research/${event.slug}`} className="card-title">
          {event.title}
        </Link>
      </h3>

      {/* Automated entries can carry a full abstract; clamp so one long card
          never stretches its whole grid row, and reserve the second line so a
          short abstract does not pull the note panel up. */}
      <p className="card-clamp-body mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-500">
        {event.summary}
      </p>

      {/* Auto-ingested events carry no curated significance; skip the block
          rather than echo a boilerplate disclaimer. */}
      {event.significance?.trim() && (
        <div className="note-block">
          <div className="note-label">{t.common.whyItMatters}</div>
          <p className="card-clamp-body line-clamp-2 text-[13px] leading-relaxed text-ink-600">
            {event.significance}
          </p>
        </div>
      )}

      <div className="card-footer mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-3 text-xs">
        {event.evidenceLevel && (
          <span className="trust-code trust-evidence" data-level={event.evidenceLevel}>
            <span className="font-medium text-ink-800">{event.evidenceLevel}</span>
            <span className="font-sans text-[11px]">{t.trust.evidence[event.evidenceLevel]}</span>
          </span>
        )}
        {event.sourceTier && (
          <span className="trust-tier" data-level={event.sourceTier}>
            {event.sourceTier}
          </span>
        )}

        <span className="ml-auto flex items-center gap-3">
          {primaryLink && (
            <a
              href={primaryLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-quiet font-medium"
            >
              {primaryLink.label}
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
