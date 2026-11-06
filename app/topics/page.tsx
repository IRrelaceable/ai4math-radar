import Link from "next/link";
import type { ResearchArea } from "@/types";
import { getStore } from "@/lib/db";
import { formatDate, slugify } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { BackToTop } from "@/components/ui/BackToTop";
import { getLang, t } from "@/lib/i18n/server";
import { countText, fill, pagesDict } from "@/lib/i18n/dict.pages";
import { displayArea, displaySubArea } from "@/lib/i18n/localize";

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
  const latest = topics.reduce((date, topic) => (topic.latestDate > date ? topic.latestDate : date), "");

  // Sub areas per topic, keyed by the same slug buildTopicStats uses
  // (slugify(researchArea)). Absorbs the research-map tree's only unique axis.
  const subAreasByTopic = new Map<string, { name: string; count: number }[]>();
  for (const e of events) {
    if (!e.researchArea || !e.subArea) continue;
    const key = slugify(e.researchArea);
    const list = subAreasByTopic.get(key) ?? [];
    const hit = list.find((s) => s.name === e.subArea);
    if (hit) hit.count += 1;
    else list.push({ name: e.subArea, count: 1 });
    subAreasByTopic.set(key, list);
  }
  for (const list of subAreasByTopic.values()) list.sort((a, b) => b.count - a.count);

  return (
    <div className="container-page py-10">
      <PageHeader
        title={d.nav.topics}
        description={p.topics.sub}
        meta={
          <>
            <span>{fill(p.topics.areaCount, { n: topics.length })}</span>
            <span>{countText(p, total, "researchEvent")}</span>
            {latest && (
              <span>
                {p.topics.updatedLabel} {formatDate(latest, lang)}
              </span>
            )}
          </>
        }
        action={
          <Link href="/latest?type=Research" className="btn-ghost">
            {p.topics.allProgress} →
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {topics.map((topic) => {
          const subAreas = subAreasByTopic.get(topic.slug) ?? [];
          const pct = Math.max(4, Math.round((topic.count / Math.max(1, max)) * 100));
          const href = `/topics/${topic.slug}`;

          return (
            <article key={topic.slug} className="card flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-[15px] font-semibold text-ink-900">
                  <Link href={href} className="hover:text-accent-700">
                    {displayArea(topic.topic as ResearchArea, lang)}
                  </Link>
                </h2>
                <span className="shrink-0 font-mono text-xs text-ink-500">
                  {countText(p, topic.count, "researchEvent")}
                </span>
              </div>

              <div className="mt-2 h-1.5 w-full rounded-sm bg-ink-100" aria-hidden="true">
                <div className="h-1.5 rounded-sm bg-accent-600" style={{ width: `${pct}%` }} />
              </div>

              {subAreas.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="mono-label mr-1">{p.topics.subAreasLabel}</span>
                  {subAreas.map((s) => (
                    <span
                      key={s.name}
                      className="chip"
                      title={fill(p.topics.subAreaTitle, {
                        count: s.count,
                        name: displaySubArea(s.name, lang) ?? s.name,
                      })}
                    >
                      {displaySubArea(s.name, lang) ?? s.name}
                      <span className="ml-1.5 font-mono text-[10px] text-ink-400">{s.count}</span>
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-4 text-xs text-ink-500">
                <span>
                  {p.topics.updatedLabel} {formatDate(topic.latestDate, lang)} ·{" "}
                  {p.topics.modelsLabel} {topic.models.length} · {p.topics.benchmarksLabel}{" "}
                  {topic.benchmarks.length}
                </span>
                <Link href={href} className="text-sm font-medium text-accent-700 hover:underline">
                  {p.topics.openTopic} →
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      <BackToTop label={d.common.backToTop} />
    </div>
  );
}
