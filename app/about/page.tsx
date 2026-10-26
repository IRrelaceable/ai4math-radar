import Link from "next/link";
import { PipelineStrip } from "@/components/research/PipelineStrip";
import { getLang, t } from "@/lib/i18n/server";
import { pagesDict } from "@/lib/i18n/dict.pages";

export async function generateMetadata() {
  const m = pagesDict[getLang()].meta.about;
  return { title: m.title, description: m.desc };
}

export default function AboutPage() {
  const lang = getLang();
  const d = t(lang);
  const p = pagesDict[lang].about;

  return (
    <div className="container-page py-10">
      <div className="max-w-3xl">
        <div className="mono-label mb-2">{p.label}</div>
        <h1 className="text-2xl font-semibold tracking-tight">{p.title}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
          {p.introA}
          <strong className="text-ink-900">{p.introStrong}</strong>
          {p.introB}
        </p>
      </div>

      {/* Questions */}
      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        {p.pillars.map((pillar) => (
          <div key={pillar.q} className="card p-4">
            <div className="text-sm font-semibold text-ink-900">{pillar.q}</div>
            <div className="mt-1 text-sm leading-relaxed text-ink-600">{pillar.a}</div>
          </div>
        ))}
      </section>

      {/* Data model */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">{p.dataModelTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-600">
          {p.dataModelA}
          <span className="font-mono text-xs text-ink-800">ResearchEvent</span>,{" "}
          <span className="font-mono text-xs text-ink-800">ResearchArea</span>,{" "}
          <span className="font-mono text-xs text-ink-800">Paper</span>,{" "}
          <span className="font-mono text-xs text-ink-800">Author</span>,{" "}
          <span className="font-mono text-xs text-ink-800">Institution</span>,{" "}
          <span className="font-mono text-xs text-ink-800">Model</span>,{" "}
          <span className="font-mono text-xs text-ink-800">Benchmark</span>,{" "}
          <span className="font-mono text-xs text-ink-800">Dataset</span>
          {p.dataModelMid}
          <span className="font-mono text-xs text-ink-800">ResearchEventPaper</span>,{" "}
          <span className="font-mono text-xs text-ink-800">ResearchEventAuthor</span>
          {p.dataModelAnd}
          <span className="font-mono text-xs text-ink-800">ResearchEventRelatedWork</span>
          {p.dataModelEnd}
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-ink-200 bg-ink-50 p-4 font-mono text-xs leading-relaxed text-ink-700">
{`ResearchEvent
├── title · summary · significance · date
├── eventType (five classes) → researchArea → subArea
├── verificationStatus · evidenceLevel · sourceTier
├── sourceType · sourceUrl · paperUrl · githubUrl
├── papers[] · authors[] · institution
├── models[] · benchmarks[] · datasets[]
└── relatedWorks[]  (previous | follow-up | related)`}
        </pre>
      </section>

      {/* Pipeline */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">{p.pipelineTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-600">{p.pipelineBody}</p>
        <div className="mt-4">
          <PipelineStrip />
        </div>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-ink-200 bg-ink-50 p-4 font-mono text-xs leading-relaxed text-ink-700">
{`curl -X POST http://localhost:3000/api/agents/ingest \\
     -H "content-type: application/json" \\
     -d '{ "useMockSource": true }'`}
        </pre>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href="/api/agents/ingest" className="btn-ghost">
            {p.inspectApi}
          </Link>
          <Link href="/topics" className="btn-ghost">
            {p.openTopics}
          </Link>
        </div>
      </section>

      {/* Data policy */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">{p.dataPolicyTitle}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-600">
          <li>
            {p.policy1A}
            <strong className="text-ink-900">{p.policy1Strong}</strong>
            {p.policy1B}
            <span className="chip border-dashed">{d.common.demo}</span>
            {p.policy1C}
          </li>
          <li>{p.policy2}</li>
          <li>
            {p.policy3A}
            <span className="font-mono text-xs">ResearchSource</span>
            {p.policy3B}
          </li>
        </ul>
      </section>

      {/* Not in v1 */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">{p.notInV1Title}</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {p.notInV1.map((x) => (
            <span key={x} className="chip border-dashed">
              {x}
            </span>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">{p.roadmapTitle}</h2>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {p.roadmap.map((item, i) => (
            <li
              key={item.v}
              className={`card p-4 ${i === 0 ? "border-accent-400 bg-accent-50" : ""}`}
            >
              <div className="mono-label">{item.v}</div>
              <div className="mt-1 text-sm font-medium text-ink-800">{item.label}</div>
            </li>
          ))}
        </ol>
        <p className="mt-4 max-w-3xl text-sm text-ink-600">
          {p.roadmapNoteA}
          <strong className="text-ink-900">{p.roadmapNoteStrong1}</strong>
          {p.roadmapNoteB}
          <strong className="text-ink-900">{p.roadmapNoteStrong2}</strong>
          {p.roadmapNoteC}
        </p>
      </section>
    </div>
  );
}

/** A derivation rule table: condition (in priority order) → the rating it yields. */
function DeriveTable({
  title,
  condLabel,
  resultLabel,
  rows,
}: {
  title: string;
  condLabel: string;
  resultLabel: string;
  rows: { cond: string; code: string }[];
}) {
  return (
    <div>
      <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
      <div className="mt-2 max-w-3xl overflow-hidden rounded-md border border-ink-200">
        <div className="flex gap-4 border-b border-ink-200 bg-ink-50 px-4 py-2">
          <span className="mono-label flex-1">{condLabel}</span>
          <span className="mono-label w-20 shrink-0">{resultLabel}</span>
        </div>
        {rows.map((r, i) => (
          <div
            key={r.code}
            className={`flex items-center gap-4 px-4 py-2.5 text-sm ${
              i % 2 === 1 ? "bg-white" : "bg-ink-50/40"
            } ${i < rows.length - 1 ? "border-b border-ink-100" : ""}`}
          >
            <span className="flex-1 text-ink-700">{r.cond}</span>
            <span className="w-20 shrink-0 font-mono font-medium text-ink-800">{r.code}</span>
          </div>
        ))}
      </div>
    </div>
  );
}



