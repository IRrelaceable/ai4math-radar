"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  EVENT_TYPES,
  SOURCE_TIERS,
  type EventDirection,
  type EventType,
  type ListEvent,
  type SourceTier,
} from "@/types";
import { AreaBadge } from "@/components/ui/AreaBadge";
import { TimelineControls } from "@/components/research/TimelineControls";
import { TimelineOverview } from "./TimelineOverview";
import { useDataset } from "@/lib/useDataset";
import { listSearchText } from "@/lib/staticData";
import {
  formatDate,
  formatMonth,
  formatMonthDay,
  formatMonthShort,
  matchesQuery,
} from "@/lib/utils";
import { useT } from "@/lib/i18n/context";
import { componentsDict } from "@/lib/i18n/dict.components";
import { pagesDict } from "@/lib/i18n/dict.pages";

/** A year with this few records is cheaper to show in full than to fold. */
const SPARSE_YEAR_MAX = 12;
/** Beyond this, a month is split into day groups so it keeps navigable anchors. */
const DENSE_MONTH_MIN = 30;
/** Months kept open on first load, counted from the newest record backwards. */
const RECENT_MONTH_COUNT = 3;

/**
 * The client dataset is plain JSON, so the direction field is not narrowed by
 * the type system. Guard at runtime before rendering a direction mark.
 */
function hasDirection(value: unknown): value is EventDirection {
  return value === "ai4math" || value === "math4ai" || value === "both";
}

/** Newest day first, matching the overall reverse-chronological order. */
function groupByDay(items: ListEvent[]): [string, ListEvent[]][] {
  const byDay = new Map<string, ListEvent[]>();
  for (const event of items) {
    const list = byDay.get(event.date) ?? [];
    list.push(event);
    byDay.set(event.date, list);
  }
  return [...byDay.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

/**
 * Chronological view over the build-time dataset.
 *
 * The archive is heavily skewed — most records land in one recent year, and
 * two months alone hold about half of the dataset — while the older decades
 * often have a single event per month. One folding rule cannot serve both, so:
 *   - sparse years open every month and offer no expand/collapse control
 *   - dense years open the three most recent months that have records
 *   - dense months are split by day and link out to the filtered feed
 * A density overview above the controls makes that skew visible up front.
 *
 * Filters live in the URL and are applied in the browser because a static
 * export has no request to read `?type=` on.
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
  const q = (params.get("q") ?? "").trim();

  const filtered = data.events.filter(
    (e) =>
      (!type || e.eventType === type) &&
      (!tier || e.sourceTier === tier) &&
      (!q || matchesQuery(listSearchText(e), q))
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
    .map(([year, months]) => {
      const byType: Partial<Record<EventType, number>> = {};
      let count = 0;
      for (const list of months.values()) {
        for (const event of list) {
          count += 1;
          if (event.eventType) {
            byType[event.eventType] = (byType[event.eventType] ?? 0) + 1;
          }
        }
      }
      return { year, months, count, byType };
    });

  const overviewYears = [...years]
    .reverse()
    .map(({ year, count }) => ({ year, count }));
  const earliest = sorted[sorted.length - 1]?.date ?? "";
  const latest = sorted[0]?.date ?? "";

  // Recent years each get a chip; older eras stay aggregated so the sticky
  // bar remains scannable. The overview strip above carries the real density.
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

  // Walk the newest records, not the calendar: a gap month with no events
  // should not consume one of the three open slots. Recomputed after filters,
  // so a filtered archive always shows something on the first screen.
  const recentMonths = new Set<string>();
  for (const event of sorted) {
    recentMonths.add(event.date.slice(0, 7));
    if (recentMonths.size >= RECENT_MONTH_COUNT) break;
  }

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

  const openMonth = (month: string) =>
    document.getElementById(`month-${month}`)?.querySelector("details")?.setAttribute("open", "");

  /** One row, shared by flat months and day-grouped months. */
  const renderRow = (
    event: ListEvent,
    opts: { day?: boolean; dot?: boolean; compact?: boolean } = {}
  ) => {
    const { day = true, dot = true, compact = false } = opts;
    const primary = event.paperUrl
      ? { url: event.paperUrl, label: t.common.paper }
      : event.githubUrl
        ? { url: event.githubUrl, label: t.common.github }
        : event.sourceUrl
          ? { url: event.sourceUrl, label: t.common.source }
          : undefined;
    const direction = hasDirection(event.direction) ? event.direction : undefined;

    return (
      <li
        key={event.id}
        data-type={event.eventType ?? ""}
        className={`relative pl-6 ${compact ? "py-1.5" : "py-3"}`}
      >
        {dot && (
          <span
            className={`type-fill absolute -left-[5px] h-2 w-2 rounded-full border-2 border-white ${
              compact ? "top-3" : "top-6"
            }`}
            aria-hidden="true"
          />
        )}
        <div className="flex gap-3">
          {day && (
            <time
              dateTime={event.date}
              title={formatDate(event.date, lang)}
              className="w-[3.4rem] shrink-0 pt-0.5 font-mono text-xs text-ink-500"
            >
              {formatMonthDay(event.date)}
            </time>
          )}
          <div className="min-w-0 flex-1">
            <Link
              href={`/research/${event.slug}`}
              className="text-[15px] font-medium leading-snug text-ink-900 hover:text-accent-700"
            >
              {event.title}
            </Link>
            {event.summary && (
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-600">
                {event.summary}
              </p>
            )}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <AreaBadge area={event.researchArea} subArea={event.subArea} lang={lang} />
              {event.eventType && (
                <span title={p.methodology.typeDesc[event.eventType]} className="type-chip">
                  <span className="type-bar h-3" aria-hidden="true" />
                  {t.trust.type[event.eventType]}
                </span>
              )}
              {direction && (
                <span className="inline-flex items-center gap-1 text-[11px] text-ink-500">
                  <span className="direction-dot" data-direction={direction} aria-hidden="true" />
                  {t.trust.direction[direction]}
                </span>
              )}
              {event.evidenceLevel && (
                <span
                  className="trust-code trust-evidence"
                  data-level={event.evidenceLevel}
                  title={t.trust.evidence[event.evidenceLevel]}
                >
                  <span className="font-medium text-ink-800">{event.evidenceLevel}</span>
                </span>
              )}
              {event.sourceTier && (
                <span
                  className="trust-tier"
                  data-level={event.sourceTier}
                  title={t.trust.tier[event.sourceTier]}
                >
                  {event.sourceTier}
                </span>
              )}
              {primary && (
                <a
                  href={primary.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-quiet text-[11px] font-medium"
                >
                  {primary.label} ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </li>
    );
  };

  return (
    <>
      {earliest && (
        <TimelineOverview
          years={overviewYears}
          total={sorted.length}
          earliest={earliest}
          latest={latest}
          labels={p.timeline.overview}
          lang={lang}
        />
      )}

      <div className="mt-7 space-y-4">
        <TimelineControls presentTypes={presentTypes} />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
          <span className="font-mono text-xs">
            {sorted.length} {sorted.length === 1 ? t.common.event : t.common.events}
            {type ? ` · ${t.trust.type[type]}` : ""}
            {q ? ` · ${q}` : ""}
          </span>
          <Link href="/latest" className="link-quiet">
            {p.timeline.feedLink} →
          </Link>
        </div>
      </div>

      {years.length > 0 && (
        <nav
          aria-label={p.timeline.decadeNav}
          className="sticky top-16 z-10 -mx-1 mt-6 flex flex-nowrap items-center gap-1 overflow-x-auto border-b border-ink-200 bg-white/95 px-1 py-2 backdrop-blur [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
        {years.map(({ year, months, count, byType }) => {
          const sparse = count <= SPARSE_YEAR_MAX;
          const maxMonthCount = Math.max(1, ...[...months.values()].map((l) => l.length));
          const openCount = sparse
            ? count
            : [...months.entries()].reduce(
                (sum, [month, items]) => sum + (recentMonths.has(month) ? items.length : 0),
                0
              );
          // Three open months can be 300+ rows in a dense year. Cap the
          // offscreen estimate so the scrollbar stays sane; the `auto` keyword
          // swaps in the real measured height after the first render anyway.
          const estimatedHeight = Math.min(44 + 39 * months.size + 80 * openCount, 16000);

          return (
            <section
              key={year}
              id={`year-${year}`}
              style={{ containIntrinsicSize: `auto ${estimatedHeight}px` }}
              className="scroll-mt-32 [content-visibility:auto]"
            >
              <h2 className="section-head h-section">
                <span className="font-mono">{year}</span>
                <span className="font-mono text-xs font-normal text-ink-400">{count}</span>
                {!sparse && months.size > 1 && (
                  <button
                    type="button"
                    onClick={() => toggleYear(year)}
                    aria-expanded={expandedYears.has(year)}
                    className="ml-auto font-sans text-xs font-normal text-ink-500 hover:text-ink-900"
                  >
                    {expandedYears.has(year)
                      ? c.feed.collapseYearMonths
                      : c.feed.expandYearMonths}
                  </button>
                )}
              </h2>

              {/* Class mix for the year, using the same [data-type] hues as
                  the cards. Each segment filters the whole archive. */}
              <div className="-mt-1 mb-3 flex items-center gap-3">
                <div
                  className="flex h-1.5 flex-1 overflow-hidden rounded-sm bg-ink-100"
                  title={p.timeline.overview.composition}
                >
                  {EVENT_TYPES.map((ty) => {
                    const n = byType[ty] ?? 0;
                    if (!n) return null;
                    return (
                      <Link
                        key={ty}
                        href={`/timeline/?type=${encodeURIComponent(ty)}`}
                        data-type={ty}
                        className="type-fill block h-full transition-opacity hover:opacity-70"
                        style={{ width: `${(n / count) * 100}%` }}
                        title={`${t.trust.type[ty]} · ${n}`}
                        aria-label={`${t.trust.type[ty]} · ${n}`}
                      />
                    );
                  })}
                </div>
                <span className="mono-label hidden shrink-0 sm:inline">
                  {p.timeline.overview.composition}
                </span>
              </div>

              {/* Month index with counts and a density hint, so a 185-event
                  month is visible before the reader expands anything. */}
              {months.size > 1 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {[...months.entries()].map(([month, items]) => (
                    <a
                      key={month}
                      href={`#month-${month}`}
                      onClick={() => openMonth(month)}
                      className="inline-flex items-center gap-1 rounded border border-ink-200 px-1.5 py-0.5 font-mono text-[11px] text-ink-600 hover:border-ink-300 hover:bg-ink-50"
                    >
                      <span>{formatMonthShort(month, lang)}</span>
                      <span className="text-ink-400">{items.length}</span>
                      <span
                        className="inline-block h-1 rounded-sm bg-accent-500"
                        style={{
                          width: `${Math.max(2, Math.round((16 * items.length) / maxMonthCount))}px`,
                        }}
                        aria-hidden="true"
                      />
                    </a>
                  ))}
                </div>
              )}

              <div className="mt-3 border-l-2 border-ink-200">
                {[...months.entries()].map(([month, items]) => {
                  const dense = items.length > DENSE_MONTH_MIN;
                  const dayGroups = dense ? groupByDay(items) : undefined;
                  return (
                    <div key={month} id={`month-${month}`} className="scroll-mt-32">
                      <details
                        className="group"
                        open={sparse || recentMonths.has(month)}
                        onToggle={(event) => {
                          if (!event.currentTarget.open) forgetYear(year);
                        }}
                      >
                        <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-2 gap-y-1 pb-1 pl-6 pt-4 [&::-webkit-details-marker]:hidden">
                          <span className="font-mono text-sm font-semibold text-ink-700">
                            {formatMonth(month, lang)}
                          </span>
                          {!dense && (
                            <span className="font-mono text-[11px] text-ink-400">
                              {items.length}
                            </span>
                          )}
                          {dense && (
                            <span className="font-sans text-[11px] text-ink-400">
                              {p.timeline.denseMonth.replace("{n}", String(items.length))}
                            </span>
                          )}
                          <span
                            aria-hidden="true"
                            className="ml-1 inline-block text-[10px] text-ink-400 transition group-open:rotate-90"
                          >
                            ▸
                          </span>
                        </summary>

                        {dayGroups ? (
                          <ol className="divide-y divide-ink-100">
                            {dayGroups.map(([day, list]) => (
                              <li key={day} className="relative py-3 pl-6">
                                <span
                                  className="absolute -left-[5px] top-6 h-2 w-2 rounded-full border-2 border-white bg-ink-300"
                                  aria-hidden="true"
                                />
                                <div className="mb-1.5 flex items-baseline gap-2">
                                  <time
                                    dateTime={day}
                                    className="font-mono text-xs font-medium text-ink-700"
                                  >
                                    {formatMonthDay(day)}
                                  </time>
                                  <span className="font-mono text-[11px] text-ink-400">
                                    {list.length}
                                  </span>
                                </div>
                                <ol className="divide-y divide-ink-100">
                                  {list.map((e) =>
                                    renderRow(e, { day: false, dot: false, compact: true })
                                  )}
                                </ol>
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <ol className="divide-y divide-ink-100">
                            {items.map((e) => renderRow(e))}
                          </ol>
                        )}

                        {dense && (
                          <div className="py-3 pl-6 text-xs">
                            <Link href={`/latest?time=${month}`} className="link-quiet">
                              {p.timeline.monthInFeed} →
                            </Link>
                          </div>
                        )}
                      </details>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
