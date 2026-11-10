import type { Lang } from "@/lib/i18n/dict";
import { fill } from "@/lib/i18n/dict.pages";
import { formatDate } from "@/lib/utils";

export type YearSummary = { year: string; count: number };

export type OverviewLabels = {
  total: string;
  span: string;
  years: string;
  updated: string;
  density: string;
  peak: string;
  scale: string;
  hint: string;
};

/**
 * The archive's front matter: what the reader is looking at before the long
 * chronological list starts.
 *
 * The density strip is the useful part. The dataset is extremely skewed
 * (roughly 60% of records land in the newest year), so a plain "year / decade"
 * jump bar gives the impression that all periods are equally sized. Height uses
 * a square-root scale: a linear scale would render every year before 2020 as a
 * 1px line.
 *
 * Width is deliberately elastic: one grid column PER YEAR, so 36 real years
 * span the whole card instead of leaving the right half blank. Decade captions
 * sit on a second grid row and span exactly the columns of their years, which
 * keeps the time axis honest (2020s really is wider than 1950s).
 */
export function TimelineOverview({
  years,
  total,
  earliest,
  latest,
  labels,
  lang,
}: {
  /** Ascending, only years that actually have records. */
  years: YearSummary[];
  total: number;
  earliest: string;
  latest: string;
  labels: OverviewLabels;
  lang: Lang;
}) {
  const max = Math.max(1, ...years.map((y) => y.count));
  const peak = years.reduce(
    (best, y) => (y.count > best.count ? y : best),
    years[0] ?? { year: "", count: 0 }
  );

  const decades: { label: string; span: number; count: number }[] = [];
  for (const y of years) {
    const label = `${y.year.slice(0, 3)}0s`;
    const last = decades[decades.length - 1];
    if (last?.label === label) {
      last.span += 1;
      last.count += y.count;
    } else {
      decades.push({ label, span: 1, count: y.count });
    }
  }

  const columns = `repeat(${Math.max(1, years.length)}, minmax(0, 1fr))`;
  const span = `${earliest.slice(0, 4)}–${latest.slice(0, 4)}`;

  return (
    <section className="card p-4 sm:p-5">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        <Metric label={labels.total} value={String(total)} />
        <Metric label={labels.span} value={span} />
        <Metric label={labels.years} value={String(years.length)} />
        <Metric label={labels.updated} value={formatDate(latest, lang)} />
      </dl>

      <div className="mt-5 border-t border-ink-100 pt-4">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div className="mono-label">{labels.density}</div>
          <div className="font-mono text-[11px] text-ink-400">
            {fill(labels.peak, { year: peak.year, n: peak.count })} · {labels.scale}
          </div>
        </div>

        <div className="grid gap-x-[3px]" style={{ gridTemplateColumns: columns }}>
          {years.map(({ year, count }) => {
            const ratio = Math.sqrt(count / max);
            return (
              <a
                key={year}
                href={`#year-${year}`}
                title={`${year} · ${count}`}
                aria-label={`${year} · ${count}`}
                className="group flex h-16 min-w-0 items-end border-b border-ink-200"
              >
                <span
                  className="block w-full rounded-t-sm transition-all group-hover:ring-2 group-hover:ring-ink-700"
                  style={{
                    height: `${Math.max(4, Math.round(56 * ratio))}px`,
                    background: `rgb(59 91 219 / ${(0.28 + 0.72 * ratio).toFixed(2)})`,
                  }}
                />
              </a>
            );
          })}

          {decades.map(({ label, span: width, count }) => (
            <div
              key={label}
              title={`${label} · ${count}`}
              aria-label={`${label} · ${count}`}
              style={{ gridColumn: `span ${width} / span ${width}` }}
              className="mt-1.5 truncate border-l border-ink-200 pl-1 font-mono text-[10px] text-ink-400"
            >
              {/* A one-year decade has ~20px: the short form still fits. */}
              {width <= 2 ? label.slice(2) : label}
            </div>
          ))}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <p className="text-[11px] leading-relaxed text-ink-400">{labels.hint}</p>
          <div className="flex shrink-0 items-center gap-1" aria-hidden="true">
            {[0.28, 0.46, 0.64, 0.82, 1].map((alpha) => (
              <span
                key={alpha}
                className="h-2 w-3 rounded-sm"
                style={{ background: `rgb(59 91 219 / ${alpha})` }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mono-label">{label}</dt>
      <dd className="mt-1.5 font-mono text-[17px] font-medium leading-none text-ink-900">
        {value}
      </dd>
    </div>
  );
}
