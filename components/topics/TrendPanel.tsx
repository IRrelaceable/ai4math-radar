import Link from "next/link";
import { buildTrends } from "@/lib/trends";
import { slugify } from "@/lib/utils";
import type { ResearchArea, ResearchEvent } from "@/types";
import { getLang } from "@/lib/i18n/server";
import { componentsDict } from "@/lib/i18n/dict.components";
import { displayArea } from "@/lib/i18n/localize";

/**
 * Momentum panel: recorded activity in the last N days vs the previous window.
 * Counts of tracked events only — pair with the verification labels.
 *
 * Server-rendered: the home page holds every event for its tiles and counts, so
 * building the trend summary here keeps those events out of the client bundle.
 */
export function TrendPanel({
  events,
  windowDays = 90,
}: {
  events: ResearchEvent[];
  windowDays?: number;
}) {
  const lang = getLang();
  const c = componentsDict[lang];
  const newest = events.reduce((max, e) => (e.date > max ? e.date : max), "");
  const nowMs = Date.now();
  // Guard against a stale local clock: never anchor the window before the
  // newest tracked event, otherwise a correct dataset would look empty.
  const asOf = newest && Date.parse(newest) > nowMs ? new Date(newest) : new Date(nowMs);
  const trends = buildTrends(events, windowDays, asOf);
  const max = Math.max(1, ...trends.all.map((t) => Math.max(t.recent, t.previous)));
  const rising = trends.topRising.slice(0, 5);

  if (trends.totalRecent === 0) {
    return (
      <p className="text-sm text-ink-500">
        {c.trendPanel.emptyWindow.replace("{days}", String(windowDays))}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-2xl font-semibold">{trends.totalRecent}</span>
        <span className="text-sm text-ink-600">
          {c.trendPanel.eventsInWindow.replace("{days}", String(windowDays))}
          {trends.totalPrevious > 0 && (
            <>
              {" "}·{" "}
              <span className="font-mono">
                {trends.totalRecent - trends.totalPrevious >= 0 ? "+" : ""}
                {trends.totalRecent - trends.totalPrevious}
              </span>{" "}
              {c.trendPanel.vsPrevious}
            </>
          )}
        </span>
      </div>

      {rising.length > 0 && (
        <ul className="space-y-2">
          {rising.map((t) => (
            <li key={t.area} className="flex items-center gap-3">
              <Link
                href={`/topics/${slugify(t.area)}`}
                className="w-44 shrink-0 truncate text-sm font-medium hover:text-accent-700"
                title={t.area}
              >
                {displayArea(t.area as ResearchArea, lang)}
              </Link>
              <div className="flex h-2 flex-1 items-center gap-1.5" aria-hidden>
                <div
                  className="h-2 rounded bg-ink-200"
                  style={{ width: `${(t.previous / max) * 100}%` }}
                />
                <div
                  className="h-2 rounded bg-accent-500"
                  style={{ width: `${(t.recent / max) * 100}%` }}
                />
              </div>
              <span className="w-20 shrink-0 font-mono text-xs text-ink-500">
                {t.previous} → {t.recent}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-ink-500">
        {c.trendPanel.legendNote.replace("{days}", String(windowDays))}{" "}
        <Link href="/methodology" className="link-quiet">
          {c.trendPanel.howToRead}
        </Link>
      </p>
    </div>
  );
}
