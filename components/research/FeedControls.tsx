"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  EVENT_TYPES,
  type EvidenceLevel,
  type EventType,
  type SourceTier,
  type TimeWindow,
} from "@/types";
import { FACET_KEYS, facetLabel, type FacetKey, type FacetValue } from "@/lib/dimensions";
import { useT } from "@/lib/i18n/context";
import { formatMonthYear } from "@/lib/utils";
import { componentsDict } from "@/lib/i18n/dict.components";
import { SearchGlyph } from "@/components/ui/SearchGlyph";

type Option = { value: string; label: string; disabled?: boolean };

/** Screen-reader-labelled dropdown with a reset ("all") option. */
function FilterSelect({
  id,
  label,
  value,
  all,
  allValue = "",
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  all: string;
  allValue?: string;
  options: Option[];
  onChange: (next: string | undefined) => void;
}) {
  const selected = options.find((o) => o.value === value);
  return (
    <div className="min-w-0">
      <label className="mono-label mb-1.5 block" htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        title={selected ? selected.label : all}
        onChange={(e) => onChange(e.target.value === allValue ? undefined : e.target.value)}
        className="select-control h-10 w-full text-[13px]"
      >
        <option value={allValue}>{all}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Feed controls for the ecosystem stream.
 *
 * Layout, top to bottom:
 *   1. Event-class tabs as an underline (the one primary axis),
 *      with the view switch pinned right
 *   2. Search, one select per classification dimension (combinable), then
 *      time / evidence / tier; result count pinned right. The row wraps.
 *
 * Chips were replaced with tabs so the filter bar no longer competes with the
 * metadata chips inside each event card. State still lives in the URL so
 * results remain shareable.
 */
export function FeedControls({
  presentFacets,
  total,
  presentEvidence,
  presentTiers,
  presentWindows,
  presentYears,
  presentTypes,
  compact,
}: {
  /** Values with at least one record, per dimension; empty groups are hidden. */
  presentFacets: Record<FacetKey, FacetValue[]>;
  total: number;
  presentEvidence: EvidenceLevel[];
  presentTiers: SourceTier[];
  presentWindows: TimeWindow[];
  presentYears: string[];
  /** Event classes with at least one record; a class with no data would only ever yield an empty result. */
  presentTypes?: EventType[];
  compact: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { t, lang } = useT();
  const c = componentsDict[lang];

  const get = (key: string) => params.get(key) ?? "";
  const q = get("q");

  const hasAnyFilter = Boolean(
    get("type") ||
      FACET_KEYS.some((key) => get(key)) ||
      get("time") ||
      q ||
      get("evidence") ||
      get("tier") ||
      get("model") ||
      get("benchmark") ||
      get("dataset")
  );

  function update(values: Record<string, string | undefined>) {
    const merged = new URLSearchParams(params.toString());
    // Changing a filter re-shapes the result set, so the current page number
    // no longer refers to the same slice.
    merged.delete("page");
    for (const [key, value] of Object.entries(values)) {
      if (value) merged.set(key, value);
      else merged.delete(key);
    }
    const qs = merged.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function clearAll() {
    router.replace(pathname, { scroll: false });
  }

  /** View is presentation, not a filter, so the page number survives. */
  function setView(next: "card" | "compact") {
    const merged = new URLSearchParams(params.toString());
    if (next === "compact") merged.set("view", "compact");
    else merged.delete("view");
    const qs = merged.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Time filter: a month from a timeline deep link first, then relative
  // windows, a divider, and concrete years. Keeping the month in the list
  // stops the select from showing a blank value on such a page.
  const monthValue = /^\d{4}-\d{2}$/.test(get("time")) ? get("time") : undefined;
  const timeOptions: Option[] = [
    ...(monthValue ? [{ value: monthValue, label: formatMonthYear(monthValue, lang) }] : []),
    ...presentWindows.map((w) => ({
      value: w,
      label: c.feed.windows[w],
    })),
    ...(presentWindows.length > 0 && presentYears.length > 0
      ? [{ value: "__divider__", label: "———", disabled: true }]
      : []),
    ...presentYears.map((y) => ({ value: y, label: y })),
  ];

  // One select per dimension; values combine with AND semantics in the feed.
  function setFacet(key: FacetKey, next: string | undefined) {
    update({ [key]: next });
  }

  return (
    <div className="border-b border-ink-200 pb-4">
      {/* 1. Primary axis: event classes as underline tabs. */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink-200">
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1" aria-label={c.feed.classLabel}>
          {(["All", ...(presentTypes ?? EVENT_TYPES)] as const).map((type) => {
            const active = type === "All" ? !get("type") : get("type") === type;
            const label = type === "All" ? t.common.all : t.trust.type[type];
            return (
              <button
                key={type}
                type="button"
                data-type={type === "All" ? "" : type}
                onClick={() => update({ type: type === "All" ? undefined : type })}
                aria-pressed={active}
                className={`-mb-px border-b-2 pb-2.5 pt-1 text-[13px] transition-colors ${
                  active
                    ? type === "All"
                      ? "border-accent-600 font-medium text-ink-900"
                      : "type-underline font-medium text-ink-900"
                    : "border-transparent text-ink-500 hover:text-ink-900"
                }`}
              >
                {type !== "All" && (
                  <span className="type-swatch mr-1.5 align-[-1px]" aria-hidden="true" />
                )}
                {label}
              </button>
            );
          })}
        </nav>

        <div
          className="mb-2 flex items-center gap-0.5 rounded-md border border-ink-200 p-0.5"
          role="group"
          aria-label={c.feed.viewLabel}
        >
          {(
            [
              ["card", t.common.cardView],
              ["compact", t.common.compactView],
            ] as const
          ).map(([value, label]) => {
            const active = value === "compact" ? compact : !compact;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                aria-pressed={active}
                className={`rounded px-2 py-0.5 text-xs transition-colors ${
                  active
                    ? "bg-accent-50 font-medium text-accent-700"
                    : "text-ink-500 hover:text-ink-800"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* One row on desktop; narrower viewports wrap before controls become cramped. */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(12rem,1.35fr)_minmax(13.5rem,1.45fr)_minmax(8.5rem,0.8fr)_minmax(7rem,0.7fr)_minmax(9rem,0.85fr)_minmax(9rem,0.85fr)]">
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <label className="mono-label mb-1.5 block" htmlFor="feed-search">{c.feed.searchAria}</label>
          <form
            className="flex h-10 items-center gap-2 rounded-md border border-ink-200 bg-sheet px-3 focus-within:border-accent-500"
            onSubmit={(e) => {
              e.preventDefault();
              const value = new FormData(e.currentTarget).get("q");
              update({ q: String(value ?? "").trim() || undefined });
            }}
          >
            <SearchGlyph />
            <input
              id="feed-search"
              name="q"
              defaultValue={q}
              key={q}
              placeholder={t.common.searchEvents}
              aria-label={c.feed.searchAria}
              className="w-full bg-transparent text-sm placeholder:text-ink-400 focus:outline-none"
            />
          </form>
        </div>

        {FACET_KEYS.map((key) => (
          <FilterSelect
            key={key}
            id={`filter-${key}`}
            label={c.feed.dimGroups[key]}
            value={get(key)}
            all={c.feed.dimAlls[key]}
            options={presentFacets[key].map((v) => ({
              value: v.id,
              label: facetLabel(presentFacets[key], v.id, lang),
            }))}
            onChange={(v) => setFacet(key, v)}
          />
        ))}

        <FilterSelect
          id="filter-time"
          label={c.feed.timeLabel}
          value={get("time")}
          all={c.feed.timeAll}
          options={timeOptions}
          onChange={(v) => update({ time: v })}
        />

        <FilterSelect
          id="filter-evidence"
          label={c.feed.evidenceLabel}
          value={get("evidence")}
          all={c.feed.evidenceAll}
          options={presentEvidence.map((s) => ({
            value: s,
            label: `${s} · ${t.trust.evidence[s]}`,
          }))}
          onChange={(v) => update({ evidence: v })}
        />

        <FilterSelect
          id="filter-tier"
          label={c.feed.tierLabel}
          value={get("tier")}
          all={c.feed.tierAll}
          options={presentTiers.map((s) => ({
            value: s,
            label: `${s} · ${t.trust.tier[s]}`,
          }))}
          onChange={(v) => update({ tier: v })}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-3">
        <span className="font-mono text-xs font-medium text-ink-700" role="status" aria-live="polite">
          {c.feed.resultsCount.replace("{n}", String(total))}
        </span>
        {hasAnyFilter && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-ink-500 underline-offset-4 hover:text-accent-700 hover:underline"
          >
            {c.feed.clearFilters}
          </button>
        )}
      </div>
    </div>
  );
}
