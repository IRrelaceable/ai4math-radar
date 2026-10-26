import Link from "next/link";
import { getStore } from "@/lib/db";
import { sortEvents } from "@/lib/utils";
import { SearchBox } from "@/components/search/SearchBox";
import { EventGrid } from "@/components/research/EventGrid";
import { TopicBar } from "@/components/topics/TopicBar";
import { TrendPanel } from "@/components/topics/TrendPanel";
import { EVENT_TYPES } from "@/types";
import { getLang, t } from "@/lib/i18n/server";
import { localizeEvents } from "@/lib/i18n/localize";

export const revalidate = 0;

/** Suggested searches shown under the hero search box. */
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

/** Latest events shown on the home page — enough to prove the feed is alive
 *  without pushing the fold past the first screen. */
const HOME_LATEST_COUNT = 8;

export default async function HomePage() {
  const lang = getLang();
  const d = t(lang);
  const store = getStore();
  const [all, topics] = await Promise.all([store.listEvents({ limit: 500 }), store.listTopics()]);
  const latest = sortEvents(all);
  const typeCounts = Object.fromEntries(
    EVENT_TYPES.map((type) => [type, all.filter((e) => e.eventType === type).length])
  ) as Record<(typeof EVENT_TYPES)[number], number>;

  return (
    <>
      {/* Hero — compact: name, one-line positioning, search. Height kept
          deliberately small so the classification nav and the first events
          stay inside the first screen. */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="container-page py-8 sm:py-10">
          <div className="max-w-3xl">
            <h1 className="text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px]">
              {d.nav.brand}
            </h1>
            <p className="mt-2 text-base text-ink-600">{d.home.heroTagline}</p>

            <div className="mt-5 max-w-2xl">
              <SearchBox variant="hero" />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
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

          {/* One compact metric row, not four tiles. */}
          <dl className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-ink-200 pt-4">
            {[
              [d.home.statsEvents, String(all.length)],
              [d.home.statsAreas, String(topics.length)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline gap-2">
                <dt className="sr-only">{label}</dt>
                <dd className="font-mono text-xl font-semibold tracking-tight">{value}</dd>
                <span className="mono-label">{label}</span>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Five-class navigation — compact horizontal chips, not large cards. */}
      <section className="container-page py-6">
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="mono-label">{d.home.browseByType}</h2>
          <Link href="/latest" className="text-sm font-medium text-accent-700 hover:underline">
            {d.home.viewLatest} →
          </Link>
        </div>
        <nav className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((type) => (
            <Link
              key={type}
              href={`/latest?type=${encodeURIComponent(type)}`}
              className="chip px-3 py-1.5 hover:border-ink-300 hover:text-ink-900"
            >
              <span>{d.trust.type[type]}</span>
              <span className="ml-2 font-mono text-ink-400">{typeCounts[type]}</span>
            </Link>
          ))}
        </nav>
      </section>

      {/* Latest ecosystem events — pulled up so the first screen shows real
          content, not just chrome. */}
      <section className="container-page pb-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{d.home.latestTitle}</h2>
            <p className="mt-1 text-sm text-ink-600">{d.home.latestSub}</p>
          </div>
          <Link href="/latest" className="text-sm font-medium text-accent-700 hover:underline">
            {d.common.viewAll} →
          </Link>
        </div>
        <EventGrid events={localizeEvents(latest.slice(0, HOME_LATEST_COUNT), lang)} />
      </section>

      {/* Research directions — moved below the fold on purpose. */}
      <section className="border-t border-ink-200 bg-ink-50">
        <div className="container-page py-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{d.home.areasTitle}</h2>
              <p className="mt-1 text-sm text-ink-600">{d.home.areasSub}</p>
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
      </section>

      {/* Momentum / trend detection — also below the fold. */}
      <section className="container-page py-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{d.home.momentumTitle}</h2>
            <p className="mt-1 text-sm text-ink-600">{d.home.momentumSub}</p>
          </div>
          <Link href="/timeline" className="text-sm font-medium text-accent-700 hover:underline">
            {d.home.timelineLink} →
          </Link>
        </div>
        <div className="card p-6">
          <TrendPanel events={all} windowDays={90} />
        </div>
      </section>
    </>
  );
}
