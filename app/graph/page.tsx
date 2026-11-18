import { getStore } from "@/lib/db";
import { buildGraphMatrix, buildScatterData } from "@/lib/graph";
import { CAPABILITIES, MATH_TOPICS } from "@/lib/dimensions";
import { ScatterMap, type ScatterLabels } from "@/components/graph/ScatterMap";
import { ResearchHeatmap } from "@/components/graph/ResearchHeatmap";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLang } from "@/lib/i18n/server";
import { dict } from "@/lib/i18n/dict";
import { fill, pagesDict } from "@/lib/i18n/dict.pages";

/** Scatter explorer plus an exact two-dimensional count matrix. */
export async function generateMetadata() {
  const m = pagesDict[getLang()].meta.graph;
  return { title: m.title, description: m.desc };
}

export default async function GraphPage() {
  const lang = getLang();
  const p = pagesDict[lang];
  const d = dict[lang];
  const all = await getStore().listEvents();
  const matrix = buildGraphMatrix(all);
  const scatter = buildScatterData(all, lang);
  const activePairs = matrix.rows.reduce(
    (total, row) => total + matrix.cols.filter((col) => matrix.cells[row.id][col.id] > 0).length,
    0
  );
  const labels: ScatterLabels = {
    cap: Object.fromEntries(CAPABILITIES.map((c) => [c.id, c[lang]])),
    math: Object.fromEntries(MATH_TOPICS.map((m) => [m.id, m[lang]])),
    type: d.trust.type,
    direction: d.trust.direction,
  };

  return (
    <div className="container-page py-10 sm:py-12">
      <PageHeader
        label={p.graph.label}
        title={p.graph.title}
        description={p.graph.sub}
        meta={
          <>
            <span>{fill(p.graph.metaEvents, { n: matrix.total })}</span>
            <span>{fill(p.graph.metaCapped, { n: matrix.capped })}</span>
          </>
        }
      />
      <section aria-labelledby="scatter-title">
        <div className="mb-5 border-b border-ink-200 pb-4">
          <h2 id="scatter-title" className="h-section">{p.graph.viewScatter}</h2>
          <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-ink-600">{p.graph.scatterSub}</p>
        </div>
        <ScatterMap data={scatter} copy={p.graph.scatter} labels={labels} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <p className="border-l-2 border-ink-400 bg-ink-50 px-4 py-3 text-[12px] leading-relaxed text-ink-600">
            {fill(p.graph.noMath, { n: matrix.noMath })}
          </p>
          <p className="border-l-2 border-ink-300 bg-ink-50 px-4 py-3 text-[12px] leading-relaxed text-ink-600">
            {fill(p.graph.noCap, { n: matrix.noCap })}
          </p>
        </div>
      </section>

      <section id="matrix" className="mt-14 scroll-mt-24 border-t border-ink-200 pt-8">
        <div className="mb-6 grid gap-6 border-b border-ink-200 pb-6 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-end">
          <div>
            <div className="mono-label mb-2">{p.graph.themeAxis} × {p.graph.domainAxis}</div>
            <h2 className="h-section">{p.graph.viewMatrix}</h2>
            <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-ink-600">{p.graph.matrixSub}</p>
          </div>
          <div className="flex items-baseline gap-3 border-l-2 border-accent-600 pl-4">
            <span className="font-mono text-4xl font-medium tracking-tight text-accent-700">{activePairs}</span>
            <span className="text-xs leading-relaxed text-ink-500">{p.graph.activePairs}</span>
          </div>
        </div>
        <div className="rounded-md border border-ink-200 bg-sheet p-4 sm:p-6">
          <ResearchHeatmap matrix={matrix} lang={lang} copy={p.graph} />
        </div>
      </section>
    </div>
  );
}
