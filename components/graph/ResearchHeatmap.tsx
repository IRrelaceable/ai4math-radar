import Link from "next/link";
import type { GraphMatrix } from "@/lib/graph";
import { facetLabel } from "@/lib/dimensions";
import { fill, pagesDict } from "@/lib/i18n/dict.pages";

type GraphCopy = (typeof pagesDict)["zh"]["graph"];

/** Sequential indigo ramp built from the brand accent scale, in six discrete
 *  steps (same convention as the graphite trust bars). Colour encodes COUNT
 *  only — a density mark, never a verdict on reliability. Each step pairs a
 *  background with an ink that clears 4.5:1, so mid-range numerals stay
 *  readable instead of turning white-on-mid-indigo. */
const STEPS: { bg: string; ink: string }[] = [
  { bg: "#e2e6ff", ink: "#161c28" }, // accent-100
  { bg: "#c6cdff", ink: "#161c28" }, // accent-200
  { bg: "#9fa9fb", ink: "#161c28" }, // accent-300
  { bg: "#7582f2", ink: "#161c28" }, // accent-400
  { bg: "#3b5bdb", ink: "#ffffff" }, // accent-600
  { bg: "#2a3d93", ink: "#ffffff" }, // accent-800
];

function cellStep(count: number, max: number): { bg: string; ink: string } {
  // Square-root spread keeps mid-range cells legible instead of washing them
  // out against a single dominant cell (same convention as the timeline bars).
  const t = max > 0 ? Math.sqrt(count / max) : 0;
  const idx = t <= 0.2 ? 0 : t <= 0.4 ? 1 : t <= 0.6 ? 2 : t <= 0.75 ? 3 : t <= 0.9 ? 4 : 5;
  return STEPS[idx];
}

const GRID_COLS = "minmax(12rem,1.25fr) repeat(7, minmax(3.8rem,1fr)) minmax(3.5rem,0.5fr)";

export function ResearchHeatmap({
  matrix,
  lang,
  copy,
}: {
  matrix: GraphMatrix;
  lang: "zh" | "en";
  copy: GraphCopy;
}) {
  const { rows, cols, cells, rowTotals, colTotals, max } = matrix;

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="min-w-[52rem]">
          {/* Column headers: the math-domain axis. */}
          <div className="grid items-end gap-1" style={{ gridTemplateColumns: GRID_COLS }}>
            <div className="mono-label pb-1">{copy.themeAxis} ↓ / {copy.domainAxis} →</div>
            {cols.map((col) => (
              <div
                key={col.id}
                className="pb-1 text-center text-[11px] font-medium leading-tight text-ink-600"
              >
                {facetLabel(cols, col.id, lang)}
              </div>
            ))}
            <div className="mono-label pb-1 text-right">{copy.total}</div>
          </div>

          {/* One row per research theme. */}
          <div className="mt-1 flex flex-col gap-1">
            {rows.map((row) => (
              <div
                key={row.id}
                className="grid items-stretch gap-1"
                style={{ gridTemplateColumns: GRID_COLS }}
              >
                <Link
                  href={`/latest?cap=${encodeURIComponent(row.id)}`}
                  className="flex items-center gap-1.5 pr-2 text-[13px] font-medium leading-tight text-ink-800 hover:text-accent-700 hover:underline"
                >
                  {facetLabel(rows, row.id, lang)} <span aria-hidden="true" className="text-[10px] text-ink-400">↗</span>
                </Link>
                {cols.map((col) => {
                  const count = cells[row.id][col.id];
                  const label = fill(copy.cellHint, {
                    cap: facetLabel(rows, row.id, lang),
                    math: facetLabel(cols, col.id, lang),
                    n: count,
                  });
                  if (count === 0) {
                    return (
                      <div
                        key={col.id}
                        aria-label={label}
                        className="flex h-12 items-center justify-center rounded-sm bg-ink-50 font-mono text-sm text-ink-400"
                      >
                        {copy.empty}
                      </div>
                    );
                  }
                  const { bg, ink } = cellStep(count, max);
                  return (
                    <Link
                      key={col.id}
                      href={`/latest?cap=${encodeURIComponent(row.id)}&math=${encodeURIComponent(col.id)}`}
                      aria-label={label}
                      title={label}
                      className="flex h-12 items-center justify-center rounded-sm font-mono text-sm font-medium ring-accent-600 transition-[box-shadow,transform] hover:z-10 hover:ring-2 focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none"
                      style={{ backgroundColor: bg, color: ink }}
                    >
                      {count}
                    </Link>
                  );
                })}
                <Link href={`/latest?cap=${encodeURIComponent(row.id)}`} className="flex items-center justify-end font-mono text-xs text-ink-500 hover:text-accent-700 hover:underline" aria-label={`${facetLabel(rows, row.id, lang)} · ${rowTotals[row.id]}`}>
                  {rowTotals[row.id]}
                </Link>
              </div>
            ))}
          </div>

          {/* Column totals: distinct capped events per domain. */}
          <div className="mt-1 grid items-center gap-1 border-t border-ink-200 pt-2" style={{ gridTemplateColumns: GRID_COLS }}>
            <div className="mono-label">{copy.total}</div>
            {cols.map((col) => (
              <Link key={col.id} href={`/latest?math=${encodeURIComponent(col.id)}`} className="text-center font-mono text-xs text-ink-500 hover:text-accent-700 hover:underline" aria-label={`${facetLabel(cols, col.id, lang)} · ${colTotals[col.id]}`}>
                {colTotals[col.id]}
              </Link>
            ))}
            <div className="text-right font-mono text-xs font-semibold text-ink-700">
              {matrix.capped}
            </div>
          </div>
        </div>
      </div>

      {/* Legend + reading notes. */}
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <span className="mono-label">{copy.legend}</span>
          <span className="text-[11px] text-ink-500">{copy.legendLow}</span>
          <span className="flex items-center gap-0.5" aria-hidden="true">
            {STEPS.map((s) => (
              <span key={s.bg} className="h-2.5 w-5 rounded-[2px]" style={{ background: s.bg }} />
            ))}
          </span>
          <span className="text-[11px] text-ink-500">{copy.legendHigh}</span>
          <span className="font-mono text-[11px] text-ink-500">0–{max}</span>
        </div>
        <span className="text-[12px] text-ink-500">{copy.drill}</span>
      </div>

      <p className="mt-4 border-t border-ink-100 pt-4 text-[13px] leading-relaxed text-ink-600">{copy.multiLabel}</p>
    </div>
  );
}
