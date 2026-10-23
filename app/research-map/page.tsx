import Link from "next/link";
import { getStore } from "@/lib/db";
import { ResearchMapTree } from "@/components/research-map/ResearchMapTree";
import { getLang, t } from "@/lib/i18n/server";
import { countText, pagesDict } from "@/lib/i18n/dict.pages";
import { EVENT_TYPES } from "@/types";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const m = pagesDict[getLang()].meta.map;
  return { title: m.title, description: m.desc };
}

export default async function ResearchMapPage() {
  const lang = getLang();
  const d = t(lang);
  const p = pagesDict[lang];
  const store = getStore();
  const events = await store.listEvents();
  const areas = await store.listTopics();

  const typeCounts = EVENT_TYPES.map((type) => ({
    type,
    count: events.filter((e) => e.eventType === type).length,
  }));
  const lineage = [...events]
    .filter((e) => e.relatedWorks.length > 0)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <div className="container-page py-10">
      <div className="mb-7 max-w-3xl">
        <div className="mono-label mb-2">{p.map.label}</div>
        <h1 className="text-2xl font-semibold tracking-tight">{d.nav.map}</h1>
        <p className="mt-2 text-sm text-ink-600">
          {p.map.sub}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <ResearchMapTree events={events} />

        <aside className="space-y-4">
          <div className="card p-5">
            <div className="mono-label mb-3">{p.map.eventClasses}</div>
            <ul className="space-y-2">
              {typeCounts.map(({ type, count }) => (
                <li key={type} className="flex items-center gap-2.5 text-sm">
                  <Link
                    href={`/latest?type=${encodeURIComponent(type)}`}
                    className="flex-1 hover:text-accent-700"
                  >
                    {d.trust.type[type]}
                  </Link>
                  <span className="font-mono text-xs text-ink-500">{count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <div className="mono-label mb-3">{p.map.areasGlance}</div>
            <ol className="space-y-2">
              {areas.map((a, i) => (
                <li key={a.slug} className="flex items-center gap-2.5 text-sm">
                  <span className="font-mono text-[10px] text-ink-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Link href={`/topics/${a.slug}`} className="flex-1 hover:text-accent-700">
                    {a.topic}
                  </Link>
                  <span className="font-mono text-xs text-ink-500">{a.count}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="card p-5">
            <div className="mono-label mb-3">{p.map.recordedLineage}</div>
            {lineage.length === 0 ? (
              <p className="text-sm text-ink-500">
                {p.map.lineageEmpty}
              </p>
            ) : (
              <ul className="space-y-3">
                {lineage.map((e) => (
                  <li key={e.id} className="border-l-2 border-accent-300 pl-3">
                    <Link
                      href={`/research/${e.slug}`}
                      className="block text-sm font-medium leading-snug hover:text-accent-700"
                    >
                      {e.title}
                    </Link>
                    <span className="mono-label mt-0.5 block normal-case tracking-normal">
                      {e.researchArea} · {countText(p, e.relatedWorks.length, "link")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

