import Link from "next/link";
import type { ListEvent } from "@/types";
import { formatDate } from "@/lib/utils";
import { cardTrustSummary } from "@/lib/trustLabels";
import { displayResearchArea } from "@/lib/i18n/localize";
import { SITE_LANG } from "@/lib/site";
import { dict } from "@/lib/i18n/dict";
import { pagesDict } from "@/lib/i18n/dict.pages";

/**
 * The standard Research Event card.
 *
 * Answers "What happened?" and "Why does it matter?" before anything else.
 * The layout is deliberately single-column: the two-column body/rail split it
 * used to have squeezed the title in narrow grid cells and duplicated the
 * trust information that the detail page already explains in full.
 *
 * Badge budget (see `cardTrustSummary` in lib/trustLabels.ts):
 *   1 event-type badge · 1 primary link.
 * Evidence + tier collapse to a compact "E2 · S2" string in the meta line,
 * and the research direction moves under the title as plain text so it reads
 * as context rather than as a second badge.
 *
 * Rendered on the server: the feed shows hundreds of these, so keeping them
 * out of the client bundle avoids hydrating a card grid on every navigation.
 */
export function EventCard({ event }: { event: ListEvent }) {
  const lang = SITE_LANG;
  const t = dict[lang];
  const trust = cardTrustSummary(event);
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
    <article className="card card-hover flex flex-col p-5">
      <h3 className="line-clamp-2 text-[17px] font-semibold leading-snug tracking-tight">
        <Link href={`/research/${event.slug}`} className="hover:text-accent-700">
          {event.title}
        </Link>
      </h3>

      {/* Class, research context and date sit together below the title.
          The direction axis labels every research event — an unlabelled card
          would leave readers guessing whether it means ai4math or no axis. */}
      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-500">
        {event.eventType && (
          <span
            title={pagesDict[lang].methodology.typeDesc[event.eventType]}
            className="chip border border-ink-200 bg-ink-50 font-medium text-ink-700"
          >
            {t.trust.type[event.eventType]}
          </span>
        )}
        {event.direction === "ai4math" && (
          <span className="chip border border-accent-200 bg-accent-50 font-medium text-accent-700">
            {t.trust.direction.ai4math}
          </span>
        )}
        {event.direction === "math4ai" && (
          <span className="chip border border-violet-200 bg-violet-50 font-medium text-violet-700">
            {t.trust.direction.math4ai}
          </span>
        )}
        {event.direction === "both" && (
          <span className="chip border border-amber-200 bg-amber-50 font-medium text-amber-700">
            {t.trust.direction.both}
          </span>
        )}
        {event.researchArea && <span>{areaLabel}</span>}
        <span className="ml-auto font-mono">{formatDate(event.date, lang)}</span>
      </div>

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
          <span className="font-mono text-ink-500">
            {trust.evidence}
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
