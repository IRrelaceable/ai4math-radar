"use client";

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
 * Feed controls for the ecosystem stream: ecosystem-class chips, then a
 * single wrapping row of search, trust-model filters, sort and result count.
 * State lives in the URL so results are shareable and server-rendered.
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

  const get = (key: string) => params.get(key) ?? "";
  const q = get("q");
  const sort = get("sort") === "importance" ? "importance" : "date";

  function update(values: Record<string, string | undefined>) {
    const merged = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(values)) {
      if (value) merged.set(key, value);
      else merged.delete(key);
    }
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
    <div className="space-y-4">
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

      {/* One wrapping row: search first, filters next, count pinned right. */}
      <div className="flex flex-wrap items-center gap-2">
        <form
          className="flex w-full items-center gap-2 rounded-md border border-ink-200 px-3 py-2 focus-within:border-accent-500 sm:w-72"
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

        <FilterSelect
          id="filter-area"
          label={c.feed.areaLabel}
          value={get("area")}
          all={c.feed.areaAll}
          options={availableAreas.map((a) => ({ value: a, label: a }))}
          onChange={(v) => update({ area: v })}
        />

        <FilterSelect
          id="filter-sort"
          label={t.common.sort}
          value={sort}
          all={t.common.byDate}
          allValue="date"
          options={[{ value: "importance", label: c.feed.byImportance }]}
          onChange={(v) => update({ sort: v })}
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

        <span className="ml-auto font-mono text-xs text-ink-500">
          {total} {t.common.events}
        </span>
      </div>
    </div>
  );
}
