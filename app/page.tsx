import Link from "next/link";
import { getStore } from "@/lib/db";
import { sortEvents, slugify } from "@/lib/utils";
import { SearchBox } from "@/components/search/SearchBox";
import { EventGrid } from "@/components/research/EventGrid";
import { TopicBar } from "@/components/topics/TopicBar";
import { TrendPanel } from "@/components/topics/TrendPanel";
import { PipelineStrip } from "@/components/research/PipelineStrip";
import { EVENT_TYPES } from "@/types";
import { getLang, t } from "@/lib/i18n/server";
import { localizeEvents } from "@/lib/i18n/localize";

export const revalidate = 0;

const SUGGESTED = [
  "theorem proving",
  "mathematical reasoning",
  "geometry",
  "formal mathematics",
  "mathematical agents",
  "benchmarks",
  "Lean",
  "mathematical discovery",
];

export default async function HomePage() {
  const lang = getLang();
  const d = t(lang);
  const store = getStore();
  const [all, topics] = await Promise.all([store.listEvents({ limit: 500 }), store.listTopics()]);
  const latest = sortEvents(all);
  const totalPapers = new Set(
    all.flatMap((e) => (e.papers ?? []).map((p) => p.title))
  ).size;
  const withCode = all.filter((e) => e.githubUrl).length;
  const typeCounts = Object.fromEntries(
    EVENT_TYPES.map((type) => [type, all.filter((e) => e.eventType === type).length])
  ) as Record<(typeof EVENT_TYPES)[number], number>;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="container-page py-14 sm:py-16">
          <div className="max-w-3xl">
            <div className="mono-label mb-4">{d.home.heroLabel}</div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {d.nav.brand}
            </h1>
            <p className="mt-3 text-lg text-ink-600">
              {d.home.heroSubtitle}
            </p>

            <div className="mt-7 max-w-2xl">
              <SearchBox variant="hero" />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="mono-label mr-1">{d.common.try}</span>
              {SUGGESTED.map((s) => (
                <Link
                  key={s}
                  href={`/search?q=${encodeURIComponent(s)}`}
                  className="chip bg-white hover:border-ink-300 hover:text-ink-900"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-ink-200 bg-ink-200 sm:grid-cols-4">
            {[
              [d.home.statsEvents, String(all.length)],
              [d.home.statsAreas, String(topics.length)],
              [d.home.statsPapers, String(totalPapers)],
              [d.home.statsCode, String(withCode)],
            ].map(([label, value]) => (
              <div key={label} className="bg-white px-4 py-3.5">
                <div className="font-mono text-2xl font-semibold tracking-tight">{value}</div>
                <div className="mono-label mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Six-class ecosystem radar */}
      <section className="container-page py-10">
        <div className="mb-5">
          <h2 className="text-xl font-semibold tracking-tight">{d.home.radarTitle}</h2>
          <p className="mt-1 text-sm text-ink-600">{d.home.radarSub}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EVENT_TYPES.map((type) => (
            <Link
              key={type}
              href={`/latest?type=${encodeURIComponent(type)}`}
              className="card card-hover flex items-start justify-between gap-4 p-4"
            >
              <div>
                <div className="mono-label">{d.trust.type[type]}</div>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  {d.home.radarHints[type]}
                </p>
              </div>
              <span className="font-mono text-2xl font-semibold tracking-tight">
                {typeCounts[type]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest ecosystem events */}
      <section className="container-page py-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {d.home.latestTitle}
            </h2>
            <p className="mt-1 text-sm text-ink-600">
              {d.home.latestSub}
            </p>
          </div>
          <Link href="/latest" className="text-sm font-medium text-accent-700 hover:underline">
            {d.common.viewAll} →
          </Link>
        </div>
        <EventGrid events={localizeEvents(latest.slice(0, 6), lang)} />
      </section>

      {/* Topics (computed from the data itself) */}
      <section className="border-t border-ink-200 bg-ink-50">
        <div className="container-page py-10">
          <div>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">{d.home.areasTitle}</h2>
                <p className="mt-1 text-sm text-ink-600">
                  {d.home.areasSub}
                </p>
              </div>
              <Link href="/topics" className="text-sm font-medium text-accent-700 hover:underline">
                {d.home.allTopics} →
              </Link>
            </div>
            <div className="space-y-3">
              {topics.slice(0, 6).map((tp) => (
                <TopicBar key={tp.slug} stat={tp} max={topics[0]?.count ?? 1} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Momentum / trend detection */}
      <section className="container-page py-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{d.home.momentumTitle}</h2>
            <p className="mt-1 text-sm text-ink-600">
              {d.home.momentumSub}
            </p>
          </div>
          <Link href="/timeline" className="text-sm font-medium text-accent-700 hover:underline">
            {d.home.timelineLink} →
          </Link>
        </div>
        <div className="card p-6">
          <TrendPanel events={all} windowDays={90} />
        </div>
      </section>

      {/* Agent pipeline teaser */}
      <section className="container-page py-10">
        <div className="card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                {d.home.pipelineTitle}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-ink-600">
                {d.home.pipelineSub}
              </p>
            </div>
            <Link href="/about" className="btn-ghost">
              {d.home.howItWorks}
            </Link>
          </div>
          <div className="mt-5">
            <PipelineStrip />
          </div>
        </div>
      </section>
    </>
  );
}

