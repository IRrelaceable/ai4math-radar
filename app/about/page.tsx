import Link from "next/link";
import { TocNav } from "@/components/layout/TocNav";
import { PipelineStrip } from "@/components/research/PipelineStrip";
import { getLang } from "@/lib/i18n/server";
import { pagesDict } from "@/lib/i18n/dict.pages";

export async function generateMetadata() {
  const m = pagesDict[getLang()].meta.about;
  return { title: m.title, description: m.desc };
}

export default function AboutPage() {
  const p = pagesDict[getLang()].about;
  const sections = [
    { id: "records", label: p.recordTitle },
    { id: "pipeline", label: p.pipelineTitle },
    { id: "trust", label: p.trustTitle },
    { id: "policy", label: p.dataPolicyTitle },
  ];

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="mx-auto grid max-w-6xl gap-x-16 gap-y-10 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
        <header className="lg:sticky lg:top-20">
          <div className="mono-label mb-2">{p.label}</div>
          <h1 className="text-2xl font-semibold tracking-tight">{p.title}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
            {p.introA}
            <strong className="text-ink-900">{p.introStrong}</strong>
            {p.introB}
          </p>
          <TocNav items={sections} label={p.tocLabel} className="mt-8 hidden lg:block" />
        </header>

        <div>
          <section id="records" className="scroll-mt-24 lg:scroll-mt-28">
            <h2 className="text-lg font-semibold tracking-tight">{p.recordTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{p.recordBody}</p>
            <dl className="mt-4 divide-y divide-ink-100 overflow-hidden rounded-lg border border-ink-200 bg-white">
              {p.classes.map((cls) => (
                <div
                  key={cls.name}
                  className="grid gap-x-4 gap-y-0.5 px-4 py-2.5 sm:grid-cols-[9rem_1fr]"
                >
                  <dt className="text-sm font-medium text-ink-900">{cls.name}</dt>
                  <dd className="text-sm leading-relaxed text-ink-600">{cls.desc}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="pipeline" className="mt-10 scroll-mt-24 lg:scroll-mt-28">
            <h2 className="text-lg font-semibold tracking-tight">{p.pipelineTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{p.pipelineBody}</p>
            <div className="mt-4">
              <PipelineStrip />
            </div>
          </section>

          <section id="trust" className="mt-10 scroll-mt-24 lg:scroll-mt-28">
            <h2 className="text-lg font-semibold tracking-tight">{p.trustTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{p.trustBody}</p>
            <Link href="/methodology" className="link-quiet mt-2 inline-block text-sm">
              {p.trustLink}
            </Link>
          </section>

          <section id="policy" className="mt-10 scroll-mt-24 lg:scroll-mt-28">
            <h2 className="text-lg font-semibold tracking-tight">{p.dataPolicyTitle}</h2>
            <ul className="mt-3 space-y-2">
              {p.policy.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-600">
                  <span
                    aria-hidden="true"
                    className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-ink-400"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <nav className="mt-10 flex flex-wrap gap-3 border-t border-ink-100 pt-6">
            <Link href="/latest" className="btn-ghost">
              {p.linkLatest}
            </Link>
            <Link href="/topics" className="btn-ghost">
              {p.linkTopics}
            </Link>
            <Link href="/sources" className="btn-ghost">
              {p.linkSources}
            </Link>
            <Link href="/methodology" className="btn-ghost">
              {p.linkMethodology}
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
