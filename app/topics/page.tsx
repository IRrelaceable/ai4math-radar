import Link from "next/link";
import { getStore } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { TopicBar } from "@/components/topics/TopicBar";
import { getLang, t } from "@/lib/i18n/server";
import { fill, pagesDict } from "@/lib/i18n/dict.pages";

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
  const topics = await store.listTopics();
  const max = topics[0]?.count ?? 1;
  const total = topics.reduce((sum, topic) => sum + topic.count, 0);

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
        {topics.map((topic) => (
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
        ))}
      </div>
    </div>
  );
}
