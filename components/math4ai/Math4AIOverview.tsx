import Link from "next/link";
import type { Lang } from "@/lib/i18n/dict";
import type { ResearchEvent } from "@/types";
import {
  CAPABILITIES,
  MATH_TOPICS,
  facetLabel,
  facetsOf,
} from "@/lib/dimensions";

/**
 * Structural overview for the Math4AI direction view, rendered on the server
 * from the same direction-filtered set the feed uses (direction math4ai + both).
 * It is deliberately a distribution summary (counts and bars), not a heatmap —
 * the cross-field heatmap is a separate, user-owned artefact.
 */
interface OverviewLabels {
  eyebrow: string;
  title: string;
  note: string;
  total: string;
  pure: string;
  both: string;
  byTheme: string;
  byField: string;
  byYear: string;
  unassigned: string;
  yearUnit: string;
}

function Distribution({
  rows,
  total,
  unassigned,
  facetKey,
}: {
  rows: { key: string; label: string; count: number }[];
  total: number;
  unassigned: string;
  facetKey: "cap" | "math";
}) {
  const withCount = rows.filter((r) => r.count > 0);
  return (
    <div className="divide-y divide-ink-100 border-t border-ink-200">
      {withCount.map((row) => (
        <Link
          key={row.key}
          href={`/math4ai?${facetKey}=${encodeURIComponent(row.key)}#math4ai-events`}
          className="group block py-3"
          title={row.label}
        >
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <span className="min-w-0 text-[13px] font-medium text-ink-700 group-hover:text-accent-700">{row.label}</span>
            <span className="shrink-0 font-mono text-[12px] text-ink-700">
              {row.count}
              <span className="ml-1 text-ink-400">
                {total > 0 ? Math.round((row.count / total) * 100) : 0}%
              </span>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-sm bg-ink-100">
            <div
              className="h-full rounded-sm bg-accent-500 transition-colors group-hover:bg-accent-700"
              style={{ width: `${total > 0 ? (row.count / total) * 100 : 0}%` }}
            />
          </div>
        </Link>
      ))}
      {withCount.length === 0 && <p className="py-4 text-[12px] text-ink-500">{unassigned}</p>}
    </div>
  );
}

export function Math4AIOverview({
  events,
  lang,
  labels,
}: {
  events: ResearchEvent[];
  lang: Lang;
  labels: OverviewLabels;
}) {
  const pure = events.filter((e) => e.direction === "math4ai").length;
  const both = events.filter((e) => e.direction === "both").length;

  const capCount = new Map<string, number>();
  const mathCount = new Map<string, number>();
  const yearCount = new Map<string, number>();
  for (const event of events) {
    const facets = facetsOf(event);
    if (facets.cap) capCount.set(facets.cap, (capCount.get(facets.cap) ?? 0) + 1);
    for (const math of facets.math) mathCount.set(math, (mathCount.get(math) ?? 0) + 1);
    const year = event.date.slice(0, 4);
    if (year) yearCount.set(year, (yearCount.get(year) ?? 0) + 1);
  }

  const themeRows = CAPABILITIES.map((v) => ({
    key: v.id,
    label: facetLabel([v], v.id, lang),
    count: capCount.get(v.id) ?? 0,
  })).sort((a, b) => b.count - a.count);
  const fieldRows = MATH_TOPICS.map((v) => ({
    key: v.id,
    label: facetLabel([v], v.id, lang),
    count: mathCount.get(v.id) ?? 0,
  })).sort((a, b) => b.count - a.count);
  const yearRows = [...yearCount.entries()]
    .map(([year, count]) => ({ key: year, label: year, count }))
    .sort((a, b) => a.key.localeCompare(b.key));
  const maxYearCount = Math.max(1, ...yearRows.map((row) => row.count));

  return (
    <section aria-labelledby="math4ai-overview-title" className="mb-12">
      <div className="mb-5 border-b border-ink-200 pb-4">
        <div className="mono-label mb-2">{labels.eyebrow}</div>
        <h2 id="math4ai-overview-title" className="h-section">{labels.title}</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <div className="flex flex-col rounded-md bg-ink-900 p-5 text-white sm:p-6">
          <div className="font-mono text-[11px] tracking-[0.14em] text-white/60">{labels.total}</div>
          <div className="mt-3 font-mono text-[54px] font-medium leading-none tracking-tight">{events.length}</div>
          <div className="mt-auto grid grid-cols-2 gap-4 border-t border-white/20 pt-5">
            <div>
              <div className="font-mono text-2xl leading-none">{pure}</div>
              <div className="mt-2 text-[11px] leading-snug text-white/65">{labels.pure}</div>
            </div>
            <div>
              <div className="font-mono text-2xl leading-none">{both}</div>
              <div className="mt-2 text-[11px] leading-snug text-white/65">{labels.both}</div>
            </div>
          </div>
        </div>

        <div className="min-w-0 rounded-md border border-ink-200 bg-white p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-ink-900">{labels.byYear}</h3>
          <div className="mt-5 overflow-x-auto pb-1">
            <div className="grid min-w-[28rem] items-end gap-2" style={{ gridTemplateColumns: `repeat(${Math.max(1, yearRows.length)}, minmax(0, 1fr))` }}>
              {yearRows.map((row) => (
                <Link key={row.key} href={`/math4ai?time=${row.key}#math4ai-events`} className="group block min-w-0 text-center" title={`${row.label}: ${row.count} ${labels.yearUnit}`}>
                  <span className="block font-mono text-[11px] text-ink-500 group-hover:text-accent-700">{row.count}</span>
                  <span className="mt-2 flex h-24 items-end border-b border-ink-200">
                    <span className="block w-full rounded-t-sm bg-accent-300 transition-colors group-hover:bg-accent-600" style={{ height: `${Math.max(4, (row.count / maxYearCount) * 94)}px` }} />
                  </span>
                  <span className="mt-2 block font-mono text-[10px] text-ink-500 group-hover:text-accent-700">{row.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-ink-200 bg-white p-5 sm:p-6">
          <div className="mono-label mb-2">01 / {labels.eyebrow}</div>
          <h3 className="mb-4 text-[16px] font-semibold text-ink-900">{labels.byTheme}</h3>
          <Distribution rows={themeRows} total={events.length} unassigned={labels.unassigned} facetKey="cap" />
        </div>
        <div className="rounded-md border border-ink-200 bg-white p-5 sm:p-6">
          <div className="mono-label mb-2">02 / {labels.eyebrow}</div>
          <h3 className="mb-4 text-[16px] font-semibold text-ink-900">{labels.byField}</h3>
          <Distribution rows={fieldRows} total={events.length} unassigned={labels.unassigned} facetKey="math" />
        </div>
      </div>
      <p className="mt-4 border-l-2 border-ink-300 pl-3 text-[12px] leading-relaxed text-ink-500">{labels.note}</p>
    </section>
  );
}
