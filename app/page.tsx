import Link from "next/link";
import { getStore } from "@/lib/db";
import { sortEvents } from "@/lib/utils";
import { SearchBox } from "@/components/search/SearchBox";
import { EventRow } from "@/components/research/EventRow";
import { TopicBar } from "@/components/topics/TopicBar";
import { TrendPanel } from "@/components/topics/TrendPanel";
import { EVENT_TYPES, RESEARCH_AREAS } from "@/types";
import { getLang, t } from "@/lib/i18n/server";
import { displayArea, localizeEvents } from "@/lib/i18n/localize";

/** Rows per rail — enough to prove the feed is alive without pushing the fold
 *  past the first screen. */
const HOME_RAIL_COUNT = 5;

export default async function HomePage() {
  const lang = getLang();
  const d = t(lang);
  const store = getStore();
  const [all, topics] = await Promise.all([store.listEvents(), store.listTopics()]);
  const latest = sortEvents(all);
  const typeCounts = Object.fromEntries(
    EVENT_TYPES.map((type) => [type, all.filter((e) => e.eventType === type).length])
  ) as Record<(typeof EVENT_TYPES)[number], number>;

  const researchLatest = latest.filter((e) => e.eventType === "Research");
  const ecosystemLatest = latest.filter((e) => e.eventType !== "Research");

  const rails = [
    {
      key: "research",
      title: d.home.researchRail,
      href: "/latest?type=Research",
      events: localizeEvents(researchLatest.slice(0, HOME_RAIL_COUNT), lang),
    },
    {
      key: "ecosystem",
      title: d.home.ecosystemRail,
      href: "/latest",
      events: localizeEvents(ecosystemLatest.slice(0, HOME_RAIL_COUNT), lang),
    },
  ];

  return (
    <>
      {/* Hero — compact: positioning, search, six directions. Height is
          deliberately small so the latest rails stay near the first screen. */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="container-page py-8 sm:py-10">
          <div className="max-w-3xl">
            <div className="mono-label mb-2">{d.nav.brand}</div>
            <h1 className="text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px]">
              {d.home.heroTitle}
            </h1>
            <p className="mt-2 text-base text-ink-600">{d.home.heroTagline}</p>

            <div className="mt-5 max-w-2xl">
              <SearchBox variant="hero" />
            </div>

            {/* Same six directions as the /latest area filter, so the entry
                point and the feed never disagree about the taxonomy. */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="mono-label mr-1">{d.common.try}</span>
              {RESEARCH_AREAS.map((area) => (
                <Link
                  key={area}
                  href={`/latest?area=${encodeURIComponent(area)}`}
                  className="chip bg-white hover:border-ink-300 hover:text-ink-900"
                >
                  {displayArea(area, lang)}
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

      {/* Dual latest rails: research and ecosystem move on different clocks,
          so each gets its own column instead of competing in one feed. */}
      <section className="container-page py-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight">{d.home.latestHeading}</h2>
          <p className="mt-1 text-sm text-ink-600">{d.home.latestHeadingSub}</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {rails.map((rail) => (
            <div key={rail.key} className="min-w-0">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h3 className="mono-label">{rail.title}</h3>
                <Link
                  href={rail.href}
                  className="text-sm font-medium text-accent-700 hover:underline"
                >
                  {d.common.viewAll} →
                </Link>
              </div>
              <div className="divide-y divide-ink-100 overflow-hidden rounded-md border border-ink-200">
                {rail.events.map((event) => (
                  <EventRow key={event.slug} event={event} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Research directions — moved below the fold on purpose. */}
      <section className="border-b border-ink-200">
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
