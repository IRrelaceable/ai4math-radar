import Link from "next/link";
import { getStore } from "@/lib/db";
import { formatDate, slugify } from "@/lib/utils";
import { TopicBar } from "@/components/topics/TopicBar";
import { getLang, t } from "@/lib/i18n/server";
import { countText, fill, pagesDict } from "@/lib/i18n/dict.pages";
import { EVENT_TYPES } from "@/types";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const m = pagesDict[getLang()].meta.topics;
  return { title: m.title, description: m.desc };
}

export default async function TopicsPage() {
  const lang = getLang();
  const d = t(lang);
  const p = pagesDict[lang];
  const store = getStore();
  const [topics, events] = await Promise.all([store.listTopics(), store.listEvents()]);
  const max = topics[0]?.count ?? 1;
  const total = topics.reduce((sum, topic) => sum + topic.count, 0);

  // Sub areas per topic, keyed by the same slug buildTopicStats uses
  // (slugify(researchArea)). Absorbs the research-map tree's only unique axis.
  const subAreasByTopic = new Map<string, { name: string; count: number }[]>();
  for (const e of events) {
    if (!e.subArea) continue;
    const key = slugify(e.researchArea);
    const list = subAreasByTopic.get(key) ?? [];
    const hit = list.find((s) => s.name === e.subArea);
    if (hit) hit.count += 1;
    else list.push({ name: e.subArea, count: 1 });
    subAreasByTopic.set(key, list);
  }
  for (const list of subAreasByTopic.values()) list.sort((a, b) => b.count - a.count);

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
        <div className="mono-label mb-2">{d.home.statsAreas}</div>
        <h1 className="text-2xl font-semibold tracking-tight">{d.nav.topics}</h1>
        <p className="mt-2 text-sm text-ink-600">
          {fill(p.topics.sub, { events: total, areas: topics.length })}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {topics.map((topic) => {
          const subAreas = subAreasByTopic.get(topic.slug) ?? [];
          return (
            <div key={topic.slug} className="card p-5">
              <TopicBar stat={topic} max={max} />
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-ink-100 pt-3 text-center">
                <div>
                  <div className="font-mono text-lg font-semibold text-ink-900">{topic.count}</div>
                  <div className="mono-label">{d.common.events}</div>
                </div>
                <div>
                  <div className="font-mono text-lg font-semibold text-ink-900">
                    {topic.models.length}
                  </div>
                  <div className="mono-label">{p.topics.modelsLabel}</div>
                </div>
                <div>
                  <div className="font-mono text-lg font-semibold text-ink-900">
                    {topic.benchmarks.length}
                  </div>
                  <div className="mono-label">{p.topics.benchmarksLabel}</div>
                </div>
              </div>

              {subAreas.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
                  <span className="mono-label">{p.topics.subAreasLabel}</span>
                  {subAreas.map((s) => (
                    <Link
                      key={s.name}
                      href={`/topics/${topic.slug}`}
                      className="chip hover:border-accent-400 hover:text-accent-700"
                      title={p.topics.subAreaTitle
                        .replace("{count}", String(s.count))
                        .replace("{name}", s.name)}
                    >
                      {s.name}
                      <span className="ml-1.5 font-mono text-[10px] text-ink-400">{s.count}</span>
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <span className="mono-label normal-case tracking-normal">
                  {p.topics.latestLabel} {formatDate(topic.latestDate, lang)}
                </span>
                <Link
                  href={`/topics/${topic.slug}`}
                  className="text-sm font-medium text-accent-700 hover:underline"
                >
                  {p.topics.openTopic} →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mono-label mb-3">{p.topics.eventClasses}</div>
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
          <div className="mono-label mb-3">{p.topics.recordedLineage}</div>
          {lineage.length === 0 ? (
            <p className="text-sm text-ink-500">{p.topics.lineageEmpty}</p>
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
      </div>
    </div>
  );
}
