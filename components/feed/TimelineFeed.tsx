"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  EVENT_TYPES,
  SOURCE_TIERS,
  type EventType,
  type ListEvent,
  type SourceTier,
} from "@/types";
import { AreaBadge } from "@/components/ui/AreaBadge";
import { TimelineControls } from "@/components/research/TimelineControls";
import { useDataset } from "@/lib/useDataset";
import {
  formatDate,
  formatMonth,
  formatMonthDay,
  formatMonthShort,
  sourceHost,
  truncateText,
} from "@/lib/utils";
import { useT } from "@/lib/i18n/context";
import { componentsDict } from "@/lib/i18n/dict.components";
import { pagesDict } from "@/lib/i18n/dict.pages";

/**
 * Chronological view over the build-time dataset.
 *
 * Filters live in the URL as before, but they are applied in the browser: a
 * static export has no request to read `?type=` on. Rows carry a shortened
 * summary so the whole archive can ship as one file.
 */
export function TimelineFeed() {
  const params = useSearchParams();
  const { data, error } = useDataset();
  const { lang, t } = useT();
  const c = componentsDict[lang];
  const p = pagesDict[lang];
  const [expandedYears, setExpandedYears] = useState<Set<string>>(() => new Set());

  // A hash jump to a collapsed month has to open it first, otherwise the
  // reader lands on a heading with nothing underneath.
  useEffect(() => {
    const openFromHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash.startsWith("month-")) return;
      document.getElementById(hash)?.querySelector("details")?.setAttribute("open", "");
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  if (error) {
    return <p className="text-sm text-rose-600">{c.feed.loadError}</p>;
  }
  if (!data) {
    return <p className="text-sm text-ink-500">{c.feed.loading}</p>;
  }

  const rawType = params.get("type") ?? "";
  const type = (EVENT_TYPES as readonly string[]).includes(rawType)
    ? (rawType as EventType)
    : undefined;
  const rawTier = params.get("tier") ?? "";
  const tier = (SOURCE_TIERS as readonly string[]).includes(rawTier)
    ? (rawTier as SourceTier)
    : undefined;

  const filtered = data.events.filter(
    (e) => (!type || e.eventType === type) && (!tier || e.sourceTier === tier)
  );
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  const groups = new Map<string, Map<string, ListEvent[]>>();
  for (const event of sorted) {
    const year = event.date.slice(0, 4);
    const month = event.date.slice(0, 7);
    const months = groups.get(year) ?? new Map<string, ListEvent[]>();
    const items = months.get(month) ?? [];
    items.push(event);
    months.set(month, items);
    groups.set(year, months);
  }
  const years = [...groups.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, months]) => ({
      year,
      months,
      count: [...months.values()].reduce((n, list) => n + list.length, 0),
    }));

  // The archive is dense after 2020, so a single "2020s" chip would drop the
  // reader at the top of a multi-hundred-event block. Recent years each get a
  // chip; older eras stay aggregated so the sticky bar remains scannable.
  const RECENT_YEAR = 2020;
  const jumps: { label: string; count: number; anchor: string }[] = [];
  const decades = new Map<string, { count: number; anchor: string }>();
  for (const { year, count } of years) {
    if (Number(year) >= RECENT_YEAR) {
      jumps.push({ label: year, count, anchor: `year-${year}` });
      continue;
    }
    const label = `${year.slice(0, 3)}0s`;
    const entry = decades.get(label);
    if (entry) entry.count += count;
    else decades.set(label, { count, anchor: `year-${year}` });
  }
  for (const [label, { count, anchor }] of decades) jumps.push({ label, count, anchor });

  // Only the newest month starts open: the timeline is an archive, and
  // expanding every month would make the year index unusable again.
  const newestMonth = years[0] ? [...years[0].months.keys()][0] : undefined;

  const toggleYear = (year: string) => {
    const openAll = !expandedYears.has(year);
    document
      .querySelectorAll<HTMLDetailsElement>(`#year-${year} details`)
      .forEach((details) => {
        details.open = openAll;
      });
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (openAll) next.add(year);
      else next.delete(year);
      return next;
    });
  };

  const forgetYear = (year: string) => {
    setExpandedYears((prev) => {
      if (!prev.has(year)) return prev;
      const next = new Set(prev);
      next.delete(year);
      return next;
    });
  };

  const presentTypes = [
    ...new Set(data.events.map((e) => e.eventType).filter((ty): ty is EventType => Boolean(ty))),
  ];

  return (
    <>
      <div className="space-y-4">
        <TimelineControls presentTypes={presentTypes} />
        <div className="flex items-center gap-3 text-sm text-ink-500">
          <span className="font-mono text-xs">
            {sorted.length} {sorted.length === 1 ? t.common.event : t.common.events}
            {type ? ` · ${t.trust.type[type]}` : ""}
          </span>
          <Link href="/latest" className="link-quiet">
            {p.timeline.feedLink} →
          </Link>
        </div>
      </div>

      {years.length > 0 && (
        <nav
          aria-label={p.timeline.decadeNav}
          className="sticky top-14 z-10 -mx-1 mt-6 flex flex-nowrap items-center gap-1 overflow-x-auto border-b border-ink-200 bg-white/95 px-1 py-2 backdrop-blur [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {jumps.map(({ label, count, anchor }) => (
            <a
              key={label}
              href={`#${anchor}`}
              className="shrink-0 whitespace-nowrap rounded px-2 py-1 font-mono text-xs text-ink-600 hover:bg-ink-100 hover:text-ink-900"
            >
              {label}
              <span className="ml-1 text-ink-400">{count}</span>
            </a>
          ))}
        </nav>
      )}

      {sorted.length === 0 && <p className="mt-10 text-sm text-ink-500">{p.timeline.empty}</p>}

      <div className="mt-8 space-y-12">
        {years.map(({ year, months, count }) => (
          <section
            key={year}
            id={`year-${year}`}
            // Offscreen years skip layout and paint. Months are collapsed by
            // default, so the estimate counts their summaries (~39px each)
            // plus the events of the one open month (~127px per row); `auto`
            // replaces it with the measured height once rendered.
            style={{
              containIntrinsicSize: `auto ${
                44 +
                39 * months.size +
                127 *
                  (year === newestMonth?.slice(0, 4) ? (months.get(newestMonth ?? "")?.length ?? 0) : 0)
              }px`,
            }}
            className="scroll-mt-32 [content-visibility:auto]"
          >
            <h2 className="flex items-baseline gap-2 font-mono text-2xl font-semibold tracking-tight text-ink-900">
              {year}
              <span className="text-xs font-normal text-ink-400">{count}</span>
              {months.size > 1 && (
                <button
                  type="button"
                  onClick={() => toggleYear(year)}
                  aria-expanded={expandedYears.has(year)}
                  className="ml-auto font-sans text-xs font-normal text-ink-500 hover:text-ink-900"
                >
                  {expandedYears.has(year) ? c.feed.collapseYearMonths : c.feed.expandYearMonths}
                </button>
              )}
            </h2>
            {/* Month index for this year, one line. The month headings below
                already carry their counts; repeating them here reads like a
                date ("11月 17"). */}
            {months.size > 1 && (
              <div className="mt-1.5 flex flex-nowrap items-center gap-1 overflow-x-auto font-mono text-[11px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {[...months.keys()].map((month) => (
                  <a
                    key={month}
                    href={`#month-${month}`}
                    onClick={() =>
                      document
                        .getElementById(`month-${month}`)
                        ?.querySelector("details")
                        ?.setAttribute("open", "")
                    }
                    className="shrink-0 rounded px-1.5 py-0.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                  >
                    {formatMonthShort(month, lang)}
                  </a>
                ))}
              </div>
            )}
            {/* One rail per year; month headings split it without restarting
                the line, so a long year still has scannable anchors. */}
            <div className="mt-3 border-l-2 border-ink-200">
              {[...months.entries()].map(([month, items]) => (
                <div key={month} id={`month-${month}`} className="scroll-mt-32">
                  <details
                    className="group"
                    open={month === newestMonth}
                    onToggle={(event) => {
                      if (!event.currentTarget.open) forgetYear(year);
                    }}
                  >
                    <summary className="flex cursor-pointer list-none items-baseline gap-2 pb-1 pl-6 pt-4 [&::-webkit-details-marker]:hidden">
                      <span className="font-mono text-sm font-semibold text-ink-700">
                        {formatMonth(month, lang)}
                      </span>
                      <span className="font-mono text-[11px] text-ink-400">{items.length}</span>
                      <span
                        aria-hidden="true"
                        className="ml-1 inline-block text-[10px] text-ink-400 transition group-open:rotate-90"
                      >
                        ▸
                      </span>
                    </summary>
                    <ol className="divide-y divide-ink-100">
                    {items.map((event) => {
                      const host = sourceHost(event.sourceUrl);
                      return (
                        <li key={event.id} className="relative py-3 pl-6">
                          <span className="absolute -left-[5px] top-6 h-2 w-2 rounded-full border-2 border-white bg-accent-500" />
                          {/* Year and month are already headings, so the row
                              only carries the day; the full date stays in the
                              tooltip. */}
                          <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-x-3">
                            <time
                              dateTime={event.date}
                              title={formatDate(event.date, lang)}
                              className="pt-0.5 font-mono text-xs text-ink-500"
                            >
                              {formatMonthDay(event.date)}
                            </time>
                            <div className="min-w-0">
                              <Link
                                href={`/research/${event.slug}`}
                                className="text-[15px] font-medium leading-snug hover:text-accent-700"
                              >
                                {event.title}
                              </Link>
                              {event.summary && (
                                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-600">
                                  {truncateText(event.summary, 280)}
                                </p>
                              )}
                              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                <AreaBadge
                                  area={event.researchArea}
                                  subArea={event.subArea}
                                  lang={lang}
                                />
                                {event.eventType && (
                                  <span
                                    title={p.methodology.typeDesc[event.eventType]}
                                    className="chip border border-ink-200 bg-ink-50 font-medium text-ink-700"
                                  >
                                    {t.trust.type[event.eventType]}
                                  </span>
                                )}
                                {host && (
                                  <span className="font-mono text-[11px] text-ink-400">{host}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                    </ol>
                  </details>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
