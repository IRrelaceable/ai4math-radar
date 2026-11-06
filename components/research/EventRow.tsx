import Link from "next/link";
import type { ListEvent } from "@/types";
import { formatDate } from "@/lib/utils";
import { displayResearchArea } from "@/lib/i18n/localize";
import { SITE_LANG } from "@/lib/site";
import { dict } from "@/lib/i18n/dict";

/**
 * One-line list row for the home rails and the compact feed. Titles and dates
 * carry the scan; the summary stays to one clamped line so a 30-row page does
 * not turn into the same height as the card grid.
 */
export function EventRow({ event }: { event: ListEvent }) {
  const lang = SITE_LANG;
  const t = dict[lang];
  const area = displayResearchArea(event, lang);

  return (
    <Link
      href={`/research/${event.slug}`}
      className="group flex gap-3 px-4 py-3 transition-colors hover:bg-ink-50"
    >
      <time
        dateTime={event.date}
        className="w-[5.5rem] shrink-0 pt-0.5 font-mono text-[11px] leading-5 text-ink-400"
      >
        {formatDate(event.date, lang)}
      </time>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium leading-snug text-ink-900 group-hover:text-accent-700">
          {event.title}
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-ink-500">
          {[
            event.eventType ? t.trust.type[event.eventType] : "",
            area,
            event.summary,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <span
        aria-hidden="true"
        className="shrink-0 self-center font-mono text-xs text-ink-300 group-hover:text-accent-600"
      >
        →
      </span>
    </Link>
  );
}
