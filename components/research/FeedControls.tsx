"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  EVENT_TYPES,
  type EvidenceLevel,
  type EventType,
  type ResearchArea,
  type SourceTier,
  type TimeWindow,
} from "@/types";
import { useT } from "@/lib/i18n/context";
import { displayArea } from "@/lib/i18n/localize";
import { componentsDict } from "@/lib/i18n/dict.components";

/** Adaptive width: shrinks to the label, capped so one long option can't eat the row. */
const SELECT_CLASS = "select-control max-w-36";

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
  return (
    <>
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value === allValue ? undefined : e.target.value)}
        className={SELECT_CLASS}
      >
        <option value={allValue}>{all}</option>
        {options.map((o, i) => (
          <option key={`${o.value}-${i}`} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
    </>
  );
}

/**
 * Feed controls for the ecosystem stream.
 *
 * Layout, top to bottom:
 *   1. Event-class chips (the one primary axis)
 *   2. Search, on its own row — it is a different interaction from filtering
 *      and deserves its own line
 *   3. Secondary filters: area, time, evidence and source tier,
 *      with the result count pinned to the right
 *
 * State lives in the URL so results are shareable and server-rendered.
 */
export function FeedControls({
  availableAreas,
  total,
  presentEvidence,
  presentTiers,
  presentWindows,
  presentYears,
  presentTypes,
  compact,
}: {
  availableAreas: ResearchArea[];
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
      get("area") ||
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

  // Time filter: relative windows first, then a divider, then concrete years.
  const timeOptions: Option[] = [
    ...presentWindows.map((w) => ({
      value: w,
      label: c.feed.windows[w],
    })),
    ...(presentWindows.length > 0 && presentYears.length > 0
      ? [{ value: "__divider__", label: "———", disabled: true }]
      : []),
    ...presentYears.map((y) => ({ value: y, label: y })),
  ];

  return (
    <div className="space-y-3">
      {/* 1. Primary axis: the event classes present in the data (+ All), view switch on the right. */}
      <div className="flex flex-wrap items-center gap-2">
        {(["All", ...(presentTypes ?? EVENT_TYPES)] as const).map((type) => {
          const active = type === "All" ? !get("type") : get("type") === type;
          const label = type === "All" ? t.common.all : t.trust.type[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => update({ type: type === "All" ? undefined : type })}
              className={`chip px-3 py-1 transition-colors ${
                active ? "chip-active" : "hover:border-ink-300 hover:text-ink-900"
              }`}
            >
              {label}
            </button>
          );
        })}

        <div
          className="ml-auto flex items-center gap-0.5 rounded-md border border-ink-200 p-0.5"
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
                    ? "bg-ink-100 font-medium text-ink-900"
                    : "text-ink-500 hover:text-ink-800"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Search gets its own row — it is not a filter in the same sense. */}
      <form
        className="flex w-full items-center gap-2 rounded-md border border-ink-200 px-3 py-2 focus-within:border-accent-500"
        onSubmit={(e) => {
          e.preventDefault();
          const value = new FormData(e.currentTarget).get("q");
          update({ q: String(value ?? "").trim() || undefined });
        }}
      >
        <input
          name="q"
          defaultValue={q}
          key={q}
          placeholder={t.common.searchEvents}
          aria-label={c.feed.searchAria}
          className="w-full bg-transparent text-sm placeholder:text-ink-400 focus:outline-none"
        />
      </form>

      {/* 3. Secondary row: all filters visible, count pinned right. */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          id="filter-area"
          label={c.feed.areaLabel}
          value={get("area")}
          all={c.feed.areaAll}
          options={availableAreas.map((a) => ({ value: a, label: displayArea(a, lang) }))}
          onChange={(v) => update({ area: v })}
        />

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

        {hasAnyFilter && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-ink-500 underline-offset-4 hover:text-accent-700 hover:underline"
          >
            {c.feed.clearFilters}
          </button>
        )}

        <span className="ml-auto font-mono text-xs text-ink-500">
          {c.feed.resultsCount.replace("{n}", String(total))}
        </span>
      </div>
    </div>
  );
}
