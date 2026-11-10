"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EVENT_TYPES, SOURCE_TIERS, type EventType, type SourceTier } from "@/types";
import { useT } from "@/lib/i18n/context";
import { componentsDict } from "@/lib/i18n/dict.components";
import { SearchGlyph } from "@/components/ui/SearchGlyph";

/**
 * Archive filters: event class, keyword, source tier. State lives in the URL.
 *
 * The class tabs mirror the feed's underline tabs (and use the same class
 * hue) instead of the old rounded chips, so the two list surfaces read as one
 * system. Keyword search was missing here even though the archive is the
 * surface where locating a specific record matters most.
 */
export function TimelineControls({ presentTypes }: { presentTypes: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { t, lang } = useT();
  const c = componentsDict[lang];

  // Ignore unknown values so the controls stay in sync with what the view
  // actually filtered on (invalid `?type=Foo` renders the unfiltered list).
  const rawType = params.get("type") ?? "";
  const active = (EVENT_TYPES as readonly string[]).includes(rawType) ? rawType : "";
  const rawTier = params.get("tier") ?? "";
  const tier = (SOURCE_TIERS as readonly string[]).includes(rawTier) ? rawTier : "";
  const q = params.get("q") ?? "";

  function setParams(values: Record<string, string | undefined>) {
    const merged = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(values)) {
      if (value) merged.set(key, value);
      else merged.delete(key);
    }
    const qs = merged.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const chips = ["All", ...EVENT_TYPES.filter((ty) => presentTypes.includes(ty))];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink-200">
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {chips.map((label) => {
            const isActive = label === "All" ? active === "" : active === label;
            return (
              <button
                key={label}
                type="button"
                data-type={label === "All" ? "" : label}
                onClick={() => setParams({ type: label === "All" ? undefined : label })}
                className={`-mb-px border-b-2 pb-2.5 pt-1 text-[13px] transition-colors ${
                  isActive
                    ? label === "All"
                      ? "border-accent-600 font-medium text-ink-900"
                      : "type-underline font-medium text-ink-900"
                    : "border-transparent text-ink-500 hover:text-ink-900"
                }`}
              >
                {label === "All" ? t.common.all : t.trust.type[label as EventType]}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <form
          className="flex min-w-[15rem] flex-1 items-center gap-2 rounded-md border border-ink-200 px-3 py-2 focus-within:border-accent-500"
          onSubmit={(e) => {
            e.preventDefault();
            const value = new FormData(e.currentTarget).get("q");
            setParams({ q: String(value ?? "").trim() || undefined });
          }}
        >
          <SearchGlyph />
          <input
            name="q"
            defaultValue={q}
            key={q}
            placeholder={t.common.searchEvents}
            aria-label={c.feed.searchAria}
            className="w-full bg-transparent text-sm placeholder:text-ink-400 focus:outline-none"
          />
        </form>

        <label className="sr-only" htmlFor="timeline-tier">
          {c.feed.tierLabel}
        </label>
        <select
          id="timeline-tier"
          value={tier}
          onChange={(e) => setParams({ tier: e.target.value || undefined })}
          className="select-control"
        >
          <option value="">{c.feed.tierAll}</option>
          {SOURCE_TIERS.map((s: SourceTier) => (
            <option key={s} value={s}>
              {s} · {t.trust.tier[s]}
            </option>
          ))}
        </select>

        {(active || tier || q) && (
          <button
            type="button"
            onClick={() => router.replace(pathname, { scroll: false })}
            className="text-xs font-medium text-ink-500 underline-offset-4 hover:text-accent-700 hover:underline"
          >
            {c.feed.clearFilters}
          </button>
        )}
      </div>
    </div>
  );
}
