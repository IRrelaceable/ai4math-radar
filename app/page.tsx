import Link from "next/link";
import { getStore } from "@/lib/db";
import { formatDate, sortEvents } from "@/lib/utils";
import { SearchBox } from "@/components/search/SearchBox";
import { EventRow } from "@/components/research/EventRow";
import { TrendPanel } from "@/components/topics/TrendPanel";
import { PageParticles } from "@/components/ui/PageParticles";
import { EVENT_TYPES } from "@/types";
import { CAPABILITIES, capabilityOf, facetsOf } from "@/lib/dimensions";
import { toListEvent } from "@/lib/staticData";
import { eventLinkOf, trackingSummaryBySlug } from "@/lib/tracking";
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
  const featuredRecord = researchLatest.find((event) =>
    eventLinkOf(event)?.kind === "initial" && (summaries.get(event.slug)?.count ?? 0) > 1
  ) ?? researchLatest[0];
  const featured = featuredRecord ? localizeEvents([featuredRecord], lang)[0] : undefined;
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
      <section className="border-b border-ink-200">
        <div className="container-page py-8 sm:py-11">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-ink-800 pb-3 sm:mb-9">
            <span className="mono-label text-accent-700">{d.home.heroLabel}</span>
            {latest[0] && (
              <span className="whitespace-nowrap font-mono text-[10px] tracking-[0.08em] text-ink-500">
                {p.timeline.overview.updated} {formatDate(latest[0].date, lang)}
              </span>
            )}
          </div>
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:gap-12">
            <div className="max-w-2xl">
              <h1 className="cover-title" aria-label={d.home.heroTitle}>
                <span className="cover-title-lead">{d.home.heroTitleLead}</span>
                <span className="cover-title-tail">{d.home.heroTitleTail}</span>
              </h1>
              <p className="lede mt-4 max-w-[34rem]">{d.home.heroSubtitle}</p>

              <div className="mt-5 max-w-lg">
                <SearchBox variant="hero" />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <span className="mono-label mr-1">{d.common.try}</span>
                {CAPABILITIES.map((cap) => (
                  <Link
                    key={cap.id}
                    href={`/latest?cap=${encodeURIComponent(cap.id)}`}
                    className="chip hover:border-ink-300 hover:text-ink-900"
                  >
                    {cap[lang]}
                  </Link>
                ))}
              </div>
            </div>

            <aside className="flex min-w-0 flex-col justify-center border-t border-ink-200 pt-5 lg:border-l lg:border-t-0 lg:pl-9 lg:pt-0">
              {featured && (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <span className="mono-label text-accent-700">{d.home.featured}</span>
                    <PageParticles />
                  </div>
                  <h2 className="cover-feature-title mt-2.5 break-words text-[25px] font-bold leading-tight text-ink-900 sm:text-[32px]">
                    <Link href={`/research/${featured.slug}`} className="hover:text-accent-700">
                      {featured.title}
                    </Link>
                  </h2>
                  <p className="mt-2.5 line-clamp-3 max-w-md text-sm leading-relaxed text-ink-600">{featured.summary}</p>
                  <Link href={`/research/${featured.slug}`} className="mt-3 w-fit text-sm font-medium text-accent-700 hover:underline">
                    {d.common.viewDetails} →
                  </Link>
                </>
              )}
              <dl className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-ink-200 pt-3">
                <div className="flex items-baseline gap-2"><dd className="font-mono font-semibold">{all.length}</dd><dt className="mono-label">{d.home.statsEvents}</dt></div>
                <div className="flex items-baseline gap-2"><dd className="font-mono font-semibold">{capStats.length}</dd><dt className="mono-label">{d.home.statsAreas}</dt></div>
              </dl>
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
              <div className="border-y border-ink-200">
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
