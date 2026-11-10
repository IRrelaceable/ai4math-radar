import Link from "next/link";
import { getStore } from "@/lib/db";
import { formatDate, sortEvents } from "@/lib/utils";
import { SearchBox } from "@/components/search/SearchBox";
import { EventRow } from "@/components/research/EventRow";
import { TopicBar } from "@/components/topics/TopicBar";
import { TrendPanel } from "@/components/topics/TrendPanel";
import { EVENT_TYPES, RESEARCH_AREAS } from "@/types";
import { getLang, t } from "@/lib/i18n/server";
import { pagesDict } from "@/lib/i18n/dict.pages";
import { displayArea, localizeEvents } from "@/lib/i18n/localize";

/** Rows per rail — enough to prove the feed is alive without pushing the fold
 *  past the first screen. */
const HOME_RAIL_COUNT = 5;

/** Class colours come from the shared [data-type] tokens in globals.css, so
    this distribution, the entry row below and the event cards cannot drift
    apart. Each segment declares its own class via `data-type`. */
const TYPE_FILL = "type-fill";

export default async function HomePage() {
  const lang = getLang();
  const d = t(lang);
  const p = pagesDict[lang];
  const store = getStore();
  const [all, topics] = await Promise.all([store.listEvents(), store.listTopics()]);
  const latest = sortEvents(all);
  const typeCounts = Object.fromEntries(
    EVENT_TYPES.map((type) => [type, all.filter((e) => e.eventType === type).length])
  ) as Record<(typeof EVENT_TYPES)[number], number>;
  const typeTotal = Object.values(typeCounts).reduce((sum, n) => sum + n, 0) || 1;

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
      {/* Hero — white, two-column. The left column is the pitch and search; the
          right column is a data anchor (headline counts + class distribution)
          so the first screen has a visual centre instead of one grey block
          holding two numbers and a row of identical chips. */}
      <section className="border-b border-ink-200">
        <div className="container-page py-10 sm:py-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-16">
            <div className="max-w-2xl">
              <div className="mono-label mb-4">{d.home.heroLabel}</div>
              <h1 className="h-display">{d.home.heroTitle}</h1>
              <p className="lede mt-4 max-w-prose">{d.home.heroSubtitle}</p>

              <div className="mt-7 max-w-xl">
                <SearchBox variant="hero" />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
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

            <aside className="lg:border-l lg:border-ink-200 lg:pl-8">
              <dl className="divide-y divide-ink-100 border-y border-ink-200">
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <dd className="font-mono text-[40px] font-semibold leading-none tracking-[-0.04em] text-ink-900">
                    {all.length}
                  </dd>
                  <dt className="mono-label text-right">{d.home.statsEvents}</dt>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <dd className="font-mono text-[40px] font-semibold leading-none tracking-[-0.04em] text-ink-900">
                    {topics.length}
                  </dd>
                  <dt className="mono-label text-right">{d.home.statsAreas}</dt>
                </div>
              </dl>

              {/* Five-class composition, read as one bar rather than five pills. */}
              <div className="mt-6">
                <div className="mono-label mb-2">{d.home.browseByType}</div>
                <div className="flex h-2 w-full overflow-hidden rounded-sm bg-ink-100" aria-hidden="true">
                  {EVENT_TYPES.map((type) => (
                    <span
                      key={type}
                      data-type={type}
                      className={TYPE_FILL}
                      style={{ width: `${(typeCounts[type] / typeTotal) * 100}%` }}
                    />
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  {EVENT_TYPES.map((type) => (
                    <span key={type} className="inline-flex items-center gap-1.5 text-[11px] text-ink-500">
                      <span
                        data-type={type}
                        className={`h-2 w-2 rounded-sm ${TYPE_FILL}`}
                        aria-hidden="true"
                      />
                      <span className="font-mono text-ink-700">{typeCounts[type]}</span>
                      {d.trust.type[type]}
                    </span>
                  ))}
                </div>
              </div>

              {latest[0] && (
                <div className="mt-6 flex items-baseline justify-between gap-3 border-t border-ink-100 pt-4 text-[11px] text-ink-500">
                  <span>
                    <span className="mr-1">{p.timeline.overview.updated}</span>
                    <span className="font-mono">{formatDate(latest[0].date, lang)}</span>
                  </span>
                  <Link href="/about#sources" className="link-quiet">
                    {d.nav.sources} →
                  </Link>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* Five-class entry row — links with counts, separated by rules instead
          of a second strip of rounded chips. */}
      <section className="border-b border-ink-200 bg-ink-50/60">
        <div className="container-page flex flex-wrap items-center gap-x-6 gap-y-3 py-4">
          <span className="mono-label">{d.home.browseByType}</span>
          <nav className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2">
            {EVENT_TYPES.map((type) => (
              <Link
                key={type}
                href={`/latest?type=${encodeURIComponent(type)}`}
                data-type={type}
                className="type-link inline-flex items-center gap-2 text-[13px] text-ink-700"
              >
                <span className="type-bar h-3.5" aria-hidden="true" />
                {d.trust.type[type]}
                <span className="type-count font-mono text-[11px] text-ink-400 transition-colors">
                  {typeCounts[type]}
                </span>
              </Link>
            ))}
          </nav>
          <Link href="/latest" className="text-[13px] font-medium text-accent-700 hover:underline">
            {d.home.viewLatest} →
          </Link>
        </div>
      </section>

      {/* Dual latest rails: research and ecosystem move on different clocks,
          so each gets its own column instead of competing in one feed. */}
      <section className="container-page py-10">
        <div className="section-head">
          <div>
            <h2 className="h-section">{d.home.latestHeading}</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-500">{d.home.latestHeadingSub}</p>
          </div>
          <Link href="/latest" className="text-[13px] font-medium text-accent-700 hover:underline">
            {d.common.viewAll} →
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {rails.map((rail) => (
            <div key={rail.key} className="min-w-0">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h3 className="mono-label">{rail.title}</h3>
                <Link
                  href={rail.href}
                  className="text-[13px] font-medium text-accent-700 hover:underline"
                >
                  {d.common.viewAll} →
                </Link>
              </div>
              {/* EventRow owns its own separators; the outer divide-y was
                  removed so compact rows no longer draw a double rule. */}
              <div className="overflow-hidden rounded-md border border-ink-200">
                {rail.events.map((event) => (
                  <EventRow key={event.slug} event={event} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Research directions. */}
      <section className="border-y border-ink-200 bg-ink-50/60">
        <div className="container-page py-10">
          <div className="section-head">
            <div>
              <h2 className="h-section">{d.home.areasTitle}</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-500">{d.home.areasSub}</p>
            </div>
            <Link href="/topics" className="text-[13px] font-medium text-accent-700 hover:underline">
              {d.home.allTopics} →
            </Link>
          </div>
          <div className="space-y-4">
            {topics.slice(0, 6).map((tp) => (
              <TopicBar key={tp.slug} stat={tp} max={topics[0]?.count ?? 1} />
            ))}
          </div>
        </div>
      </section>

      {/* Momentum / trend detection. */}
      <section className="container-page py-10">
        <div className="section-head">
          <div>
            <h2 className="h-section">{d.home.momentumTitle}</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-500">{d.home.momentumSub}</p>
          </div>
          <Link href="/timeline" className="text-[13px] font-medium text-accent-700 hover:underline">
            {d.home.timelineLink} →
          </Link>
        </div>
        <div className="card p-5">
          <TrendPanel events={all} windowDays={90} />
        </div>
      </section>
    </>
  );
}
