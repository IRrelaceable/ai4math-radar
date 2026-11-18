import Link from "next/link";
import { getStore } from "@/lib/db";
import { formatDate, sortEvents } from "@/lib/utils";
import { SearchBox } from "@/components/search/SearchBox";
import { EventRow } from "@/components/research/EventRow";
import { TrendPanel } from "@/components/topics/TrendPanel";
import { EVENT_TYPES } from "@/types";
import { CAPABILITIES, capabilityOf, facetsOf } from "@/lib/dimensions";
import { toListEvent } from "@/lib/staticData";
import { trackingSummaryBySlug } from "@/lib/tracking";
import { getLang, t } from "@/lib/i18n/server";
import { pagesDict } from "@/lib/i18n/dict.pages";
import { componentsDict } from "@/lib/i18n/dict.components";
import { localizeEvents } from "@/lib/i18n/localize";

/** Rows per rail — enough to prove the feed is alive without pushing the fold
 *  past the first screen. */
const HOME_RAIL_COUNT = 5;

export default async function HomePage() {
  const lang = getLang();
  const d = t(lang);
  const p = pagesDict[lang];
  const store = getStore();
  const all = await store.listEvents();
  const latest = sortEvents(all);
  const typeCounts = Object.fromEntries(
    EVENT_TYPES.map((type) => [type, all.filter((e) => e.eventType === type).length])
  ) as Record<(typeof EVENT_TYPES)[number], number>;
  const researchLatest = latest.filter((e) => e.eventType === "Research");
  const ecosystemLatest = latest.filter((e) => e.eventType !== "Research");

  // Capability-axis activity bars: counts derived from the corpus, never stored.
  const capCounts = new Map<string, number>();
  for (const e of all) {
    const cap = capabilityOf(e);
    if (cap) capCounts.set(cap, (capCounts.get(cap) ?? 0) + 1);
  }
  const capStats = CAPABILITIES.filter((v) => capCounts.has(v.id))
    .map((value) => ({ value, count: capCounts.get(value.id)! }))
    .sort((a, b) => b.count - a.count);
  const capMax = capStats[0]?.count ?? 1;

  const researchRail = researchLatest.slice(0, HOME_RAIL_COUNT);
  const ecosystemRail = ecosystemLatest.slice(0, HOME_RAIL_COUNT);
  const summaries = trackingSummaryBySlug(all);
  const rails = [
    {
      key: "research",
      title: d.home.researchRail,
      href: "/latest?type=Research",
      events: localizeEvents(researchRail, lang).map((e, i) =>
        toListEvent(e, undefined, facetsOf(researchRail[i]), summaries.get(e.slug)!)
      ),
    },
    {
      key: "ecosystem",
      title: d.home.ecosystemRail,
      href: "/latest",
      events: localizeEvents(ecosystemRail, lang).map((e, i) =>
        toListEvent(e, undefined, facetsOf(ecosystemRail[i]), summaries.get(e.slug)!)
      ),
    },
  ];

  return (
    <>
      {/* Hero — a cover-style masthead over two columns. The left column is the
          pitch and search; the right column holds only the two headline counts,
          since the full class breakdown sits directly below the fold. */}
      <section className="border-b border-ink-200">
        <div className="cover-grid container-page py-10 sm:py-14">
          <div className="mb-8 flex items-baseline justify-between gap-6 border-b border-ink-200 pb-3">
            <span className="mono-label">{d.home.heroLabel}</span>
            {latest[0] && (
              <span className="whitespace-nowrap font-mono text-[10px] tracking-[0.08em] text-ink-500">
                {p.timeline.overview.updated} {formatDate(latest[0].date, lang)}
              </span>
            )}
          </div>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-16">
            <div className="max-w-2xl">
              <h1 aria-label={d.home.heroTitle}>
                <span className="cover-title-lead">{d.home.heroTitleLead}</span>
                <span className="cover-title-tail">{d.home.heroTitleTail}</span>
              </h1>
              <p className="lede mt-5 max-w-prose">{d.home.heroSubtitle}</p>

              <div className="mt-7 max-w-xl">
                <SearchBox variant="hero" />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <span className="mono-label mr-1">{d.common.try}</span>
                {CAPABILITIES.map((cap) => (
                  <Link
                    key={cap.id}
                    href={`/latest?cap=${encodeURIComponent(cap.id)}`}
                    className="chip bg-white hover:border-ink-300 hover:text-ink-900"
                  >
                    {cap[lang]}
                  </Link>
                ))}
              </div>
            </div>

            <aside className="lg:border-l lg:border-ink-200 lg:bg-white lg:pl-8">
              <dl className="grid grid-cols-2 gap-x-6 border-y border-ink-200 lg:block lg:divide-y lg:divide-ink-100">
                <div className="py-4 lg:flex lg:items-baseline lg:justify-between lg:gap-4">
                  <dd className="font-mono text-[38px] font-semibold leading-none tracking-[-0.04em] text-ink-900 lg:text-[48px]">
                    {all.length}
                  </dd>
                  <dt className="mono-label mt-2 lg:mt-0 lg:text-right">{d.home.statsEvents}</dt>
                </div>
                <div className="border-l border-ink-100 py-4 pl-6 lg:flex lg:items-baseline lg:justify-between lg:gap-4 lg:border-l-0 lg:pl-0">
                  <dd className="font-mono text-[38px] font-semibold leading-none tracking-[-0.04em] text-ink-900 lg:text-[48px]">
                    {capStats.length}
                  </dd>
                  <dt className="mono-label mt-2 lg:mt-0 lg:text-right">{d.home.statsAreas}</dt>
                </div>
              </dl>

              {latest[0] && (
                <div className="mt-5 text-right text-[11px] text-ink-500">
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
          <nav className="order-2 flex w-full flex-wrap items-center gap-x-5 gap-y-2 sm:gap-x-6 lg:order-none lg:w-auto lg:flex-1">
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
          <Link
            href="/latest"
            className="order-1 ml-auto text-[13px] font-medium text-accent-700 hover:underline lg:order-none lg:ml-0"
          >
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

      {/* Capability axis: the merged direction entry, counts from the corpus. */}
      <section className="border-y border-ink-200 bg-ink-50/60">
        <div className="container-page py-10">
          <div className="section-head">
            <div>
              <h2 className="h-section">{d.home.areasTitle}</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-500">{d.home.areasSub}</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <Link href="/graph#matrix" className="text-[13px] font-medium text-accent-700 hover:underline">
                {p.graph.viewMatrix} →
              </Link>
              <Link href="/latest" className="text-[13px] font-medium text-accent-700 hover:underline">
                {d.home.allTopics} →
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            {capStats.map(({ value, count }) => (
              <Link key={value.id} href={`/latest?cap=${encodeURIComponent(value.id)}`} className="block group">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="h-item group-hover:text-accent-700">{value[lang]}</span>
                  <span className="font-mono text-xs text-ink-600">
                    {count}{" "}
                    <span className="text-ink-400">
                      {count === 1
                        ? componentsDict[lang].topic.researchEvent
                        : componentsDict[lang].topic.researchEvents}
                    </span>
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-sm bg-ink-100" aria-hidden="true">
                  <div
                    className="h-1.5 rounded-sm bg-accent-600 transition-[width] group-hover:bg-accent-700"
                    style={{ width: `${Math.max(4, Math.round((count / capMax) * 100))}%` }}
                  />
                </div>
              </Link>
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
