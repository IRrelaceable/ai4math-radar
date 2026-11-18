import Link from "next/link";
import type { ListEvent } from "@/types";
import { formatDate } from "@/lib/utils";
import { SITE_LANG } from "@/lib/site";
import { dict } from "@/lib/i18n/dict";
import { pagesDict } from "@/lib/i18n/dict.pages";
import { DimensionChips } from "@/components/research/DimensionChips";

/**
 * The standard Research Event card.
 *
 * Answers "What happened?" and "Why does it matter?" before anything else.
 * The category label carries the class colour. The title and summary sit
 * together, and the footer holds evidence, source and tracking links.
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
  const hasMath = (event.eventType ?? "Research") === "Research" && event.facets.math.length > 0;
  const hasSignificance = Boolean(event.significance?.trim());
  return (
    <article
      className="event-card group flex flex-col overflow-hidden"
      data-type={event.eventType ?? ""}
    >
      <div className="px-4 pt-4 sm:px-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-ink-500">
          {event.eventType && (
            <span title={pagesDict[lang].methodology.typeDesc[event.eventType]} className="type-chip">
              <span className="type-bar h-3" aria-hidden="true" />
              {t.trust.type[event.eventType]}
            </span>
          )}
          {event.tracking?.kind === "verification" && (
            <span className="chip border border-ink-200 bg-ink-50 text-ink-700">
              {pagesDict[lang].events.kinds.verification}
            </span>
          )}
          {event.direction && (
            <span title={pagesDict[lang].methodology.directionDesc[event.direction]} className="inline-flex items-center gap-1.5">
              <span className="direction-dot" data-direction={event.direction} aria-hidden="true" />
              {t.trust.direction[event.direction]}
            </span>
          )}
          <time dateTime={event.date} className="ml-auto shrink-0 font-mono text-[11px] text-ink-500">
            {formatDate(event.date, lang)}
          </time>
        </div>

        <h3 className="mt-2.5 line-clamp-2 break-words text-[18px] font-semibold leading-snug tracking-tight text-ink-900">
          <Link href={`/research/${event.slug}`} className="card-title">{event.title}</Link>
        </h3>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-2 sm:px-5">
        <p className={`break-words text-sm leading-relaxed text-ink-600 ${hasSignificance ? "line-clamp-2" : "line-clamp-3"}`}>
          {event.summary}
        </p>
        {hasSignificance && (
          <div className="note-block">
            <div className="note-label">{t.common.whyItMatters}</div>
            <p className="line-clamp-2 break-words text-[13px] leading-relaxed text-ink-600">
              {event.significance}
            </p>
          </div>
        )}
      </div>

      <div className="card-footer mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t px-4 py-2.5 text-xs sm:px-5">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          {event.evidenceLevel && (
            <span
              title={t.trust.evidence[event.evidenceLevel]}
              className="trust-code trust-evidence"
              data-level={event.evidenceLevel}
            >
              <span className="font-medium text-ink-800">{event.evidenceLevel}</span>
            </span>
          )}
          {event.sourceTier && (
            <span className="trust-tier" data-level={event.sourceTier}>
              {event.sourceTier}
            </span>
          )}
          {hasMath && <DimensionChips event={event} lang={lang} variant="card" />}
        </div>

        <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {primaryLink && (
            <a
              href={primaryLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-quiet font-medium"
            >
              {primaryLink.label} ↗
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
