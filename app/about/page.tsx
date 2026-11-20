import Link from "next/link";
import { SourceRegistry } from "@/components/sources/SourceRegistry";
import { PageParticles } from "@/components/ui/PageParticles";
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
  const chapters = [
    { number: "01", title: p.recordTitle, body: p.recordBody, href: "#records" },
    { number: "02", title: p.trustTitle, body: p.hubLabels, href: "#trust" },
    { number: "03", title: s.title, body: p.hubSources, href: "#sources" },
  ];

  return (
    <div className="container-page py-10 lg:py-14">
      <header className="grid gap-10 border-b border-ink-200 pb-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-16 lg:pb-14">
        <div className="max-w-3xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="mono-label text-accent-700">{p.label} / {p.hubIntroTitle}</div>
            <PageParticles />
          </div>
          <h1 className="h-display max-w-2xl">{p.title}</h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-[1.85] text-ink-600">
            {p.introA}
            <strong className="font-semibold text-ink-900">{p.introStrong}</strong>
            {p.introB}
          </p>
          <Link href="/latest" className="mt-7 inline-flex items-center gap-2 border-b border-accent-300 pb-1 text-sm font-medium text-accent-700 transition-colors hover:border-accent-700">
            {p.linkLatest}<span aria-hidden="true">↗</span>
          </Link>
        </div>

        <nav aria-label={p.tocLabel} className="self-start border-t-2 border-ink-900 lg:border-t-0 lg:border-l-2 lg:pl-6">
          <div className="mono-label py-4 lg:pt-0">{p.tocLabel}</div>
          {chapters.map((chapter) => (
            <Link key={chapter.href} href={chapter.href} className="group grid grid-cols-[2rem_minmax(0,1fr)_1rem] gap-2 border-t border-ink-200 py-3.5 transition-colors hover:text-accent-700">
              <span className="font-mono text-[11px] text-ink-400">{chapter.number}</span>
              <span>
                <span className="block text-sm font-medium text-ink-900 group-hover:text-accent-700">{chapter.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-ink-500">{chapter.body}</span>
              </span>
              <span className="text-sm text-ink-400 group-hover:text-accent-700" aria-hidden="true">↗</span>
            </Link>
          ))}
        </nav>
      </header>

      <section id="records" className="grid scroll-mt-24 gap-7 border-b border-ink-200 py-11 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12 lg:py-14">
        <div>
          <div className="mono-label mb-2">01 / {p.hubIntroTitle}</div>
          <h2 className="h-section">{p.recordTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">{p.recordBody}</p>
        </div>
        <ol className="border-t border-ink-300">
          {p.classes.map((cls, index) => (
            <li key={cls.name} className="grid gap-1 border-b border-ink-200 py-4 sm:grid-cols-[2.5rem_11rem_minmax(0,1fr)] sm:gap-4">
              <span className="font-mono text-[11px] text-ink-400">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="text-[14px] font-semibold text-ink-900">{cls.name}</h3>
              <p className="text-[13px] leading-relaxed text-ink-600">{cls.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="trust" className="grid scroll-mt-24 gap-7 border-b border-ink-200 py-11 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12 lg:py-14">
        <div>
          <div className="mono-label mb-2">02 / {p.trustTitle}</div>
          <h2 className="h-section">{p.trustTitle}</h2>
        </div>
        <div className="grid gap-6 rounded-lg bg-ink-900 p-6 text-white sm:p-8 md:grid-cols-[minmax(0,1fr)_12rem] md:items-end">
          <div>
            <div className="flex flex-wrap gap-2 font-mono text-[11px] tracking-[0.08em]">
              <span className="rounded border border-white/25 px-2 py-1 text-white/80">E0–E3</span>
              <span className="rounded border border-white/25 px-2 py-1 text-white/80">S0–S4</span>
            </div>
            <p className="mt-5 max-w-xl text-[14px] leading-[1.85] text-white/85">{p.trustBody}</p>
          </div>
          <Link href="/methodology" className="inline-flex items-center justify-between gap-3 border-t border-white/30 pt-3 text-[13px] font-medium text-white transition-colors hover:text-accent-200">
            {p.linkMethodology}<span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section id="sources" className="scroll-mt-24 pt-11 lg:pt-14">
        <div className="grid gap-4 pb-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
          <div>
            <div className="mono-label mb-2">03 / {s.title}</div>
            <h2 className="h-section">{s.title}</h2>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-600">{s.subtitle}</p>
        </div>
        <SourceRegistry boards={boards} labels={s} />
      </section>
    </div>
  );
}
