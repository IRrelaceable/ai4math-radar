"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  EVENT_TYPES,
  type EvidenceLevel,
  type ResearchArea,
  type SourceTier,
  type TimeWindow,
  type VerificationStatus,
} from "@/types";
import { useT } from "@/lib/i18n/context";
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
 *   3. Secondary filters: area, time, and an "Advanced" disclosure that
 *      holds the trust-model filters (verification / evidence / tier), with
 *      the result count pinned to the right
 *
 * State lives in the URL so results are shareable and server-rendered. The
 * advanced filters keep their URL keys, so existing shared links still work.
 */
export function FeedControls({
  availableAreas,
  total,
  presentStatuses,
  presentEvidence,
  presentTiers,
  presentWindows,
  presentYears,
}: {
  availableAreas: ResearchArea[];
  total: number;
  presentStatuses: VerificationStatus[];
  presentEvidence: EvidenceLevel[];
  presentTiers: SourceTier[];
  presentWindows: TimeWindow[];
  presentYears: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { t, lang } = useT();
  const c = componentsDict[lang];
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const get = (key: string) => params.get(key) ?? "";
  const q = get("q");

  // The three trust-model filters are collapsed behind "Advanced"; opening it
  // is a local UI concern, but if any of them is already set in the URL the
  // panel starts open so the reader can see what is narrowing their results.
  const advancedActive = Boolean(get("status") || get("evidence") || get("tier"));
  const showAdvanced = advancedOpen || advancedActive;
  const activeAdvancedCount = ["status", "evidence", "tier"].filter((k) => get(k)).length;

  const hasAnyFilter = Boolean(
    get("type") || get("area") || get("time") || q || advancedActive
  );

  function update(values: Record<string, string | undefined>) {
    const merged = new URLSearchParams(params.toString());
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
      {/* 1. Primary axis: the five event classes (+ All). */}
      <div className="flex flex-wrap gap-2">
        {(["All", ...EVENT_TYPES] as const).map((type) => {
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

      {/* 3. Secondary row: area + time + advanced disclosure, count pinned right. */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          id="filter-area"
          label={c.feed.areaLabel}
          value={get("area")}
          all={c.feed.areaAll}
          options={availableAreas.map((a) => ({ value: a, label: a }))}
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

        <button
          type="button"
          onClick={() => setAdvancedOpen((o) => !o)}
          aria-expanded={showAdvanced}
          aria-controls="advanced-filters"
          className={`chip px-3 py-1 transition-colors ${
            advancedActive || showAdvanced
              ? "chip-active"
              : "hover:border-ink-300 hover:text-ink-900"
          }`}
        >
          {c.feed.advancedLabel}
          {activeAdvancedCount > 0 && (
            <span className="ml-1.5 font-mono">{activeAdvancedCount}</span>
          )}
        </button>

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

      {/* Advanced: the trust-model filters, hidden until asked for. */}
      {showAdvanced && (
        <div
          id="advanced-filters"
          className="flex flex-wrap items-center gap-2 rounded-md border border-ink-200 bg-ink-50 p-2.5"
        >
          <FilterSelect
            id="filter-status"
            label={c.feed.statusLabel}
            value={get("status")}
            all={c.feed.statusAll}
            options={presentStatuses.map((s) => ({
              value: s,
              label: `${s} · ${t.trust.status[s]}`,
            }))}
            onChange={(v) => update({ status: v })}
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
      )}
    </div>
  );
}
