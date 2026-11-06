"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EVENT_TYPES, SOURCE_TIERS, type EventType, type SourceTier } from "@/types";
import { useT } from "@/lib/i18n/context";
import { componentsDict } from "@/lib/i18n/dict.components";

/** Event-type chips + source-tier select for the timeline. State lives in the URL. */
export function TimelineControls({ presentTypes }: { presentTypes: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { t, lang } = useT();
  const c = componentsDict[lang];
  // Ignore unknown values so the controls stay in sync with what the server
  // actually filtered on (invalid `?type=Foo` renders the unfiltered list).
  const rawType = params.get("type") ?? "";
  const active = (EVENT_TYPES as readonly string[]).includes(rawType) ? rawType : "";
  const rawTier = params.get("tier") ?? "";
  const tier = (SOURCE_TIERS as readonly string[]).includes(rawTier) ? rawTier : "";

  function setParam(key: "type" | "tier", value?: string) {
    const merged = new URLSearchParams(params.toString());
    if (value) merged.set(key, value);
    else merged.delete(key);
    const qs = merged.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const chips = ["All", ...EVENT_TYPES.filter((t) => presentTypes.includes(t))];
  const selectClass =
    "rounded-md border border-ink-200 bg-white px-2 py-1.5 text-xs text-ink-700 " +
    "focus:border-accent-500 focus:outline-none";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((label) => {
        const value = label === "All" ? undefined : label;
        const isActive = label === "All" ? active === "" : active === label;
        return (
          <button
            key={label}
            type="button"
            onClick={() => setParam("type", value)}
            className={`chip px-3 py-1 transition-colors ${
              isActive ? "chip-active" : "hover:border-ink-300 hover:text-ink-900"
            }`}
          >
            {label === "All" ? t.common.all : t.trust.type[label as EventType]}
          </button>
        );
      })}

      <label className="sr-only" htmlFor="timeline-tier">
        {c.feed.tierLabel}
      </label>
      <select
        id="timeline-tier"
        value={tier}
        onChange={(e) => setParam("tier", e.target.value || undefined)}
        className={`${selectClass} ml-auto`}
      >
        <option value="">{c.feed.tierAll}</option>
        {SOURCE_TIERS.map((s: SourceTier) => (
          <option key={s} value={s}>
            {s} · {t.trust.tier[s]}
          </option>
        ))}
      </select>
    </div>
  );
}

