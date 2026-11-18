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
    <section className="grid gap-5 rounded-md border border-ink-200 bg-sheet p-4 sm:p-5 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-7">
      <div className="border-b border-ink-200 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
        <div className="mono-label">{labels.total}</div>
        <div className="mt-2 font-mono text-[38px] font-medium leading-none tracking-tight text-ink-900">{total}</div>
        <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 lg:grid-cols-1">
          <Metric label={labels.span} value={span} />
          <Metric label={labels.years} value={String(years.length)} />
          <Metric label={labels.updated} value={formatDate(latest, lang)} />
        </dl>
      </div>

      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div className="mono-label">{labels.density}</div>
          <div className="font-mono text-[11px] text-ink-600">
            {fill(labels.peak, { year: peak.year, n: peak.count })}
          </div>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="grid min-w-[34rem] gap-x-[3px]" style={{ gridTemplateColumns: columns }}>
          {years.map(({ year, count }) => {
            const ratio = Math.sqrt(count / max);
            return (
              <a
                key={year}
                href={`#year-${year}`}
                title={`${year} · ${count}`}
                aria-label={`${year} · ${count}`}
                className="group flex h-28 min-w-0 items-end border-b border-ink-200"
              >
                <span
                  className="block w-full rounded-t-sm transition-all group-hover:ring-2 group-hover:ring-ink-700"
                  style={{
                    height: `${Math.max(4, Math.round(100 * ratio))}px`,
                    background: "var(--cobalt)",
                    opacity: 0.28 + 0.72 * ratio,
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
        </div>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <p className="max-w-xl text-[11px] leading-relaxed text-ink-500">{labels.hint}</p>
          <span className="font-mono text-[10px] text-ink-400">{labels.scale}</span>
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
