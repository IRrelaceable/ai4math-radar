"use client";

import type { ResearchEvent } from "@/types";
import { formatDate, monthKey } from "@/lib/utils";
import { useLang } from "@/lib/i18n/context";
import { componentsDict } from "@/lib/i18n/dict.components";

/**
 * Dependency-free time trend: events per month (ascending), computed from data.
 */
export function TrendChart({ events }: { events: ResearchEvent[] }) {
  const { lang } = useLang();
  const c = componentsDict[lang];

  if (events.length === 0) {
    return <p className="text-sm text-ink-500">{c.trendChart.empty}</p>;
  }

  const counts = new Map<string, number>();
  for (const e of events) {
    const key = monthKey(e.date);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const series = [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const max = Math.max(...series.map(([, n]) => n), 1);
  const last12 = series.slice(-12);

  return (
    <div>
      <div className="flex h-40 items-end gap-1.5">
        {last12.map(([key, count]) => (
          <div key={key} className="group flex flex-1 flex-col items-center gap-1.5">
            <span className="font-mono text-[10px] text-ink-500 opacity-0 transition-opacity group-hover:opacity-100">
              {count}
            </span>
            <div
              className="w-full rounded-t bg-accent-500 transition-colors group-hover:bg-accent-700"
              style={{ height: `${Math.max(6, Math.round((count / max) * 120))}px` }}
              title={c.trendChart.monthTitle
                .replace("{month}", key)
                .replace("{count}", String(count))}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 border-t border-ink-200 pt-2">
        {last12.map(([key]) => (
          <div key={key} className="flex-1 text-center font-mono text-[10px] text-ink-500">
            {key.slice(2)}
          </div>
        ))}
      </div>
      <div className="mono-label mt-3 normal-case tracking-normal">
        {c.trendChart.activeMonths.replace("{n}", String(series.length))} ·{" "}
        {c.trendChart.peakMonth.replace("{max}", String(max))} ·{" "}
        {c.trendChart.latestPrefix}
        {formatDate(events[0].date)}
      </div>
    </div>
  );
}
