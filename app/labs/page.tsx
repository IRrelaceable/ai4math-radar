import Link from "next/link";
import { getStore } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { EventRow } from "@/components/research/EventRow";
import { getLang, t } from "@/lib/i18n/server";
import { fill, pagesDict } from "@/lib/i18n/dict.pages";
import { localizeEvents } from "@/lib/i18n/localize";
import { LABS } from "@/types";
import { LAB_ARCHIVE } from "@/data/lab-archive/records";
import { LabArchive, type RelatedEvent } from "@/components/labs/LabArchive";

/**
 * Lab track — first-level entry for frontier-lab AI4Math work, including the
 * independent evaluations and follow-ups those results attract.
 *
 * Two data sources live here on purpose:
 *
 *   1. LAB_ARCHIVE — an editorial, year-by-year research archive (52 records,
 *      2020–2026). Many records deliberately share one paper URL, so they stay
 *      outside the event dataset, which deduplicates on source URL.
 *   2. lab-tagged events — recent items from the automated ingest pipeline.
 *      They share the event model, detail route and trust labels with the feed.
 *
 * Archive records link back to any site event citing the same source URL, so
 * the two views stay connected without being merged into one card stream.
 */
const ARCHIVE_RANGE = (() => {
  const years = LAB_ARCHIVE.map((record) => Number(record.date.slice(0, 4)));
  const min = Math.min(...years);
  const max = Math.max(...years);
  return min === max ? String(min) : `${min}—${max}`;
})();

export async function generateMetadata() {
  const m = pagesDict[getLang()].meta.labs;
  return {
    title: m.title,
    description: fill(m.desc, { range: ARCHIVE_RANGE, n: LAB_ARCHIVE.length }),
  };
}

/** Path-level URL identity, matching SeedStore.mergeEvents' dedupe key. */
function sourceKey(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.replace(/\/+$/, "");
    if (!pathname) return undefined;
    return `${parsed.hostname.replace(/^www\./, "")}${pathname}${parsed.search}`.toLowerCase();
  } catch {
    return undefined;
  }
}

/** Map archive records to already-published events that cite the same source. */
function linkRelated(
  events: { slug: string; title: string; sourceUrl: string }[]
): Record<string, RelatedEvent[]> {
  const byUrl = new Map<string, RelatedEvent>();
  for (const event of events) {
    const key = sourceKey(event.sourceUrl);
    if (key && !byUrl.has(key)) byUrl.set(key, { slug: event.slug, title: event.title });
  }
  const result: Record<string, RelatedEvent[]> = {};
  for (const record of LAB_ARCHIVE) {
    const seen = new Set<string>();
    const hits: RelatedEvent[] = [];
    for (const source of record.sources) {
      const event = byUrl.get(sourceKey(source.url) ?? "");
      if (event && !seen.has(event.slug)) {
        seen.add(event.slug);
        hits.push(event);
      }
    }
    result[record.id] = hits;
  }
  return result;
}

export default async function LabsPage() {
  const lang = getLang();
  const p = pagesDict[lang];
  const d = t(lang).detail;
  const all = await getStore().listEvents();
  const localized = localizeEvents(all, lang);
  const labEvents = all
    .filter((event) => event.lab)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  const related = linkRelated(
    localized.map((event) => ({
      slug: event.slug,
      title: event.title,
      sourceUrl: event.sourceUrl,
    }))
  );

  return (
    <div className="container-page py-10 sm:py-12">
      <PageHeader
        label={p.labs.label}
        title={p.labs.title}
        description={fill(p.labs.sub, { range: ARCHIVE_RANGE })}
        meta={
          <>
            <span>{ARCHIVE_RANGE}</span>
            <span>OpenAI · Anthropic</span>
          </>
        }
      />

      <LabArchive
        lang={lang}
        labels={p.labs.archive}
        related={related}
        discussion={{
          title: d.discussion,
          pending: d.discussionPending,
          hint: d.discussionHint,
          placeholder: d.discussionPlaceholder,
          button: d.discussionButton,
        }}
      />

      <section aria-labelledby="lab-automated-title" className="mt-14">
        <div className="section-head">
          <h2 id="lab-automated-title" className="h-section">
            {p.labs.automated.title}
          </h2>
          <span className="font-mono text-xs text-ink-500">
            {fill(labEvents.length === 1 ? p.labs.count.one : p.labs.count.many, {
              n: labEvents.length,
            })}
          </span>
        </div>
        <p className="mb-5 max-w-3xl text-[13px] leading-relaxed text-ink-500">
          {p.labs.automated.hint}
        </p>

        {labEvents.length === 0 && (
          <p className="rounded-md border border-dashed border-ink-300 px-4 py-6 text-sm leading-relaxed text-ink-600">
            {p.labs.pageEmpty}
          </p>
        )}

        <div className="space-y-10">
          {LABS.map((lab) => {
            const events = localizeEvents(
              labEvents.filter((event) => event.lab === lab),
              lang
            );
            return (
              <section key={lab} id={lab} className="scroll-mt-24">
                <div className="mb-3 flex items-baseline justify-between gap-4 border-b border-ink-200 pb-2">
                  <h3 className="text-lg font-semibold tracking-tight text-ink-900">
                    {p.labs[lab]}
                  </h3>
                  <span className="font-mono text-xs text-ink-500">
                    {fill(events.length === 1 ? p.labs.count.one : p.labs.count.many, {
                      n: events.length,
                    })}
                  </span>
                </div>
                {events.length === 0 ? (
                  <p className="py-3 text-sm text-ink-500">{p.labs.sectionEmpty}</p>
                ) : (
                  <div className="border border-ink-200">
                    {events.map((event) => (
                      <EventRow key={event.slug} event={event} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </section>

      <p className="mt-10 border-t border-ink-200 pt-4 text-xs leading-relaxed text-ink-500">
        {p.labs.howToRead}{" "}
        <Link href="/methodology" className="link-quiet">
          {p.detail.howToReadLabels} →
        </Link>
      </p>
    </div>
  );
}
