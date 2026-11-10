import Link from "next/link";
import { TocNav } from "@/components/layout/TocNav";
import { SourceRegistry } from "@/components/sources/SourceRegistry";
import { loadSourceOverview } from "@/lib/db/sourceStatus";
import { getLang } from "@/lib/i18n/server";
import { pagesDict } from "@/lib/i18n/dict.pages";

export async function generateMetadata() {
  const m = pagesDict[getLang()].meta.about;
  return { title: m.title, description: m.desc };
}

export default function AboutPage() {
  const lang = getLang();
  const p = pagesDict[lang].about;
  const s = pagesDict[lang].sources;
  const { boards } = loadSourceOverview();
  const sections = [
    { id: "records", label: p.recordTitle },
    { id: "trust", label: p.trustTitle },
    { id: "sources", label: s.title },
  ];

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="mx-auto grid max-w-6xl gap-x-16 gap-y-10 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
        <header className="lg:sticky lg:top-20">
          <div className="mono-label mb-2">{p.label}</div>
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em]">{p.title}</h1>
          <p className="lede mt-3">
            {p.introA}
            <strong className="text-ink-900">{p.introStrong}</strong>
            {p.introB}
          </p>
          <TocNav items={sections} label={p.tocLabel} className="mt-8 hidden lg:block" />
        </header>

        <div>
          <section id="records" className="scroll-mt-24 lg:scroll-mt-28">
            <h2 className="h-section">{p.recordTitle}</h2>
            <p className="lede mt-2">{p.recordBody}</p>
            <dl className="mt-4 divide-y divide-ink-100 overflow-hidden rounded-md border border-ink-200 bg-white">
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

          <section id="trust" className="mt-12 scroll-mt-24 lg:scroll-mt-28">
            <h2 className="h-section">{p.trustTitle}</h2>
            <p className="lede mt-2">{p.trustBody}</p>
            <Link href="/methodology" className="link-quiet mt-2 inline-block text-sm">
              {p.trustLink}
            </Link>
          </section>

          {/* Reader-facing provenance only: which public channels feed the site.
              Sync cadence, cursors, ingest results and local controls are
              operator concerns and are deliberately not rendered here. */}
          <section
            id="sources"
            className="mt-12 scroll-mt-24 border-t border-ink-100 pt-10 lg:scroll-mt-28"
          >
            <h2 className="h-section">{s.title}</h2>
            <p className="lede mt-2 max-w-3xl">{s.subtitle}</p>
            <div className="mt-6">
              <SourceRegistry boards={boards} labels={s} />
            </div>
          </section>

          <nav className="mt-10 flex flex-wrap gap-3 border-t border-ink-100 pt-6">
            <Link href="/latest" className="btn-ghost">
              {p.linkLatest}
            </Link>
            <Link href="/topics" className="btn-ghost">
              {p.linkTopics}
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
