import Link from "next/link";
import { getStore } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { EventRow } from "@/components/research/EventRow";
import { getLang } from "@/lib/i18n/server";
import { fill, pagesDict } from "@/lib/i18n/dict.pages";
import { localizeEvents } from "@/lib/i18n/localize";
import { LABS } from "@/types";

/**
 * Lab track — the first-level entry for the two frontier labs' own AI4Math
 * work. Records share the event model (direction, evidence, AI role) and the
 * detail route, so they inherit the discussion slot and every trust label.
 * The content is entered from an editorial source list; nothing here is
 * fetched at request time.
 */
export async function generateMetadata() {
  const m = pagesDict[getLang()].meta.labs;
  return { title: m.title, description: m.desc };
}

export default async function LabsPage() {
  const lang = getLang();
  const p = pagesDict[lang];
  const all = await getStore().listEvents();
  const labEvents = all
    .filter((event) => event.lab)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

  return (
    <div className="container-page py-10 sm:py-12">
      <PageHeader label={p.labs.label} title={p.labs.title} description={p.labs.sub} />

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
                <h2 className="text-lg font-semibold tracking-tight text-ink-900">
                  {p.labs[lab]}
                </h2>
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

      <p className="mt-10 border-t border-ink-200 pt-4 text-xs leading-relaxed text-ink-500">
        {p.labs.howToRead}{" "}
        <Link href="/methodology" className="link-quiet">
          {p.detail.howToReadLabels} →
        </Link>
      </p>
    </div>
  );
}
