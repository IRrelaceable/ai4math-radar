import Link from "next/link";
import { getStore } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { AreaBadge } from "@/components/ui/AreaBadge";
import { EventTypePill, VerificationBadge } from "@/components/ui/TrustBadges";
import { TimelineControls } from "@/components/research/TimelineControls";
import { SOURCE_TIERS, type ResearchEvent, type SourceTier } from "@/types";
import { getLang, t } from "@/lib/i18n/server";
import { localizeEvents } from "@/lib/i18n/localize";
import { pagesDict } from "@/lib/i18n/dict.pages";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const m = pagesDict[getLang()].meta.timeline;
  return { title: m.title, description: m.desc };
}

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: { type?: string; tier?: string };
}) {
  const events = localizeEvents(await getStore().listEvents({ limit: 300 }), getLang());
  const lang = getLang();
  const d = t(lang);
  const p = pagesDict[lang];
  const type = searchParams.type ?? "";
  const tier = searchParams.tier ?? "";
  const tierValid =
    tier && (SOURCE_TIERS as readonly string[]).includes(tier)
      ? (tier as SourceTier)
      : "";

  const filtered = events.filter(
    (e) =>
      (!type || e.eventType === type) &&
      (!tierValid || e.sourceTier === tierValid)
  );
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  const groups = new Map<string, ResearchEvent[]>();
  for (const event of sorted) {
    const year = event.date.slice(0, 4);
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year)!.push(event);
  }
  const years = [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]));

  const presentTypes = [
    ...new Set(
      events.map((e) => e.eventType).filter((ty): ty is NonNullable<typeof ty> => Boolean(ty))
    ),
  ];

  return (
    <div className="container-page py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">{d.nav.timeline}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
          {p.timeline.sub}
        </p>
      </header>

      <div className="mt-8 space-y-4">
        <TimelineControls presentTypes={presentTypes} />
        <div className="flex items-center gap-3 text-sm text-ink-500">
          <span className="font-mono text-xs">
            {sorted.length} {sorted.length === 1 ? d.common.event : d.common.events}
            {type ? ` · ${type}` : ""}
          </span>
          <Link href="/latest" className="link-quiet">
            {p.timeline.feedLink} →
          </Link>
        </div>
      </div>

      {years.length > 0 && (
        <nav className="sticky top-14 z-10 -mx-1 mt-6 flex flex-wrap gap-1 border-b border-ink-200 bg-white/95 px-1 py-2 backdrop-blur">
          {years.map(([year, items]) => (
            <a
              key={year}
              href={`#year-${year}`}
              className="rounded px-2 py-1 font-mono text-xs text-ink-600 hover:bg-ink-100 hover:text-ink-900"
            >
              {year}
              <span className="ml-1 text-ink-400">{items.length}</span>
            </a>
          ))}
        </nav>
      )}

      {sorted.length === 0 && (
        <p className="mt-10 text-sm text-ink-500">{p.timeline.empty}</p>
      )}

      <div className="mt-8 space-y-12">
        {years.map(([year, items]) => (
          <section key={year} id={`year-${year}`} className="scroll-mt-24">
            <h2 className="font-mono text-2xl font-semibold tracking-tight text-ink-900">
              {year}
            </h2>
            <ol className="mt-4 divide-y divide-ink-100 border-l-2 border-ink-200 pl-0">
              {items.map((event) => (
                <li key={event.id} className="relative py-3 pl-6">
                  <span className="absolute -left-[5px] top-6 h-2 w-2 rounded-full border-2 border-white bg-accent-500" />
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="w-20 shrink-0 font-mono text-xs text-ink-500">
                      {formatDate(event.date)}
                    </span>
                    <Link
                      href={`/research/${event.slug}`}
                      className="text-[15px] font-medium leading-snug hover:text-accent-700"
                    >
                      {event.title}
                    </Link>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 pl-[5.75rem]">
                    <AreaBadge area={event.researchArea} subArea={event.subArea} />
                    {event.verificationStatus && (
                      <VerificationBadge status={event.verificationStatus} />
                    )}
                    {event.eventType && <EventTypePill type={event.eventType} />}
                    {event.researchEventType && (
                      <span className="chip border-ink-200 text-ink-500" title={d.detail.researchSubtype}>
                        {event.researchEventType}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

