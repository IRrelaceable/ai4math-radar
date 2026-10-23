import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/db";
import { formatDate, matchesQuery, slugify } from "@/lib/utils";
import { EventGrid } from "@/components/research/EventGrid";
import { TrendChart } from "@/components/topics/TrendChart";
import { getLang, t } from "@/lib/i18n/server";
import { localizeEvents } from "@/lib/i18n/localize";
import { countText, fill, pagesDict } from "@/lib/i18n/dict.pages";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { topic: string } }) {
  const detail = await getStore().getTopic(params.topic);
  return { title: detail ? detail.stat.topic : "Topic" };
}

export default async function TopicDetailPage({
  params,
  searchParams,
}: {
  params: { topic: string };
  searchParams?: { q?: string };
}) {
  const store = getStore();
  const lang = getLang();
  const d = t(lang);
  const p = pagesDict[lang];
  const detail = await store.getTopic(params.topic);
  if (!detail) notFound();

  const { stat, events } = detail;
  const q = searchParams?.q?.trim() ?? "";
  const filtered = q ? events.filter((e) => matchesQuery(e.title + e.summary, q)) : events;
  const progressSub = q
    ? fill(p.topic.progressMatch, { count: countText(p, filtered.length, "event"), q })
    : fill(p.topic.progressPlain, { count: countText(p, filtered.length, "event") });

  const papers = new Map<string, { title: string; url?: string; venue?: string }>();
  const models = new Set<string>();
  const benchmarks = new Set<string>();
  const datasets = new Set<string>();
  for (const e of events) {
    for (const p of e.papers ?? []) if (!papers.has(p.title)) papers.set(p.title, p);
    for (const m of e.model ?? []) models.add(m);
    for (const b of e.benchmark ?? []) benchmarks.add(b);
    for (const d of e.dataset ?? []) datasets.add(d);
  }

  const codeCount = events.filter((e) => e.githubUrl).length;

  return (
    <div className="container-page py-10">
      <div className="mb-6 text-sm text-ink-500">
        <Link href="/topics" className="link-quiet">
          {d.nav.topics}
        </Link>
        <span className="mx-2 text-ink-300">/</span>
        <span className="text-ink-700">{stat.topic}</span>
      </div>

      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mono-label mb-2">{d.detail.researchArea}</div>
          <h1 className="text-3xl font-semibold tracking-tight">{stat.topic}</h1>
          <p className="mt-2 text-sm text-ink-600">
            {fill(p.topic.statSub, {
              count: countText(p, stat.count, "researchEvent"),
              date: formatDate(stat.latestDate),
              code: codeCount,
            })}
          </p>
        </div>
        <Link href={`/latest?area=${encodeURIComponent(stat.topic)}`} className="btn-primary">
          {p.topic.openFeed} →
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mono-label mb-4">{p.topic.timeTrend}</div>
          <TrendChart events={events} />
        </div>
        <div className="card p-5">
          <div className="mono-label mb-3">{p.topic.overview}</div>
          <dl className="space-y-3 text-sm">
            <Row label={p.topic.rowQuantity} value={countText(p, stat.count, "event")} />
            <Row label={d.home.statsPapers} value={`${papers.size}`} />
            <Row label={p.topic.rowModels} value={`${models.size}`} />
            <Row label={p.topic.rowBenchmarks} value={`${benchmarks.size}`} />
            <Row label={p.topic.rowDatasets} value={`${datasets.size}`} />
          </dl>
        </div>
      </div>

      {/* Facets */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <FacetCard title={p.topic.relatedPapers} count={papers.size}>
          {[...papers.values()].map((paper) => (
            <li key={paper.title} className="text-sm leading-snug">
              {paper.url ? (
                <a href={paper.url} target="_blank" rel="noopener noreferrer" className="link-quiet">
                  {paper.title}
                </a>
              ) : (
                <span className="text-ink-700">{paper.title}</span>
              )}
            </li>
          ))}
        </FacetCard>
        <FacetCard title={p.topic.relatedModels} count={models.size}>
          {[...models].map((m) => (
            <li key={m} className="text-sm">
              <Chip href={`/latest?model=${encodeURIComponent(m)}`}>{m}</Chip>
            </li>
          ))}
        </FacetCard>
        <FacetCard title={p.topic.relatedBenchmarks} count={benchmarks.size}>
          {[...benchmarks].map((b) => (
            <li key={b} className="text-sm">
              <Chip href={`/latest?benchmark=${encodeURIComponent(b)}`}>{b}</Chip>
            </li>
          ))}
          {datasets.size > 0 && (
            <>
              <li className="mono-label pt-2">{p.topic.datasetsLabel}</li>
              {[...datasets].map((ds) => (
                <li key={ds} className="text-sm">
                  <Chip href={`/latest?dataset=${encodeURIComponent(ds)}`}>{ds}</Chip>
                </li>
              ))}
            </>
          )}
        </FacetCard>
      </div>

      {/* Recent progress */}
      <section className="mt-9">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{p.topic.latestProgress}</h2>
            <p className="mt-1 text-sm text-ink-600">{progressSub}</p>
          </div>
          <form className="flex items-center gap-2" action={`/topics/${params.topic}`}>
            <input
              name="q"
              defaultValue={q}
              placeholder={p.topic.searchPlaceholder}
              className="w-52 rounded-md border border-ink-200 px-3 py-1.5 text-sm focus:border-accent-500 focus:outline-none"
            />
            <button type="submit" className="btn-ghost">
              {p.topic.searchBtn}
            </button>
          </form>
        </div>
        <EventGrid events={localizeEvents(filtered, lang)} />
      </section>

      <p className="mt-6 text-xs text-ink-400">
        {p.topic.slugA}{" "}
        <span className="font-mono">{slugify(stat.topic)}</span>
        {p.topic.slugB}
        <span className="font-mono"> /topics/{slugify(stat.topic)}</span>
        {p.topic.slugC}
        {d.nav.map}
        {p.topic.slugD}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-ink-100 pb-2">
      <dt className="text-ink-600">{label}</dt>
      <dd className="font-mono text-ink-900">{value}</dd>
    </div>
  );
}

function Chip({ children, href }: { children: React.ReactNode; href?: string }) {
  if (href) {
    return (
      <Link href={href} className="chip hover:border-ink-300 hover:text-ink-900">
        {children}
      </Link>
    );
  }
  return <span className="chip">{children}</span>;
}

function FacetCard({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  const p = pagesDict[getLang()];
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="mono-label">{title}</span>
        <span className="font-mono text-xs text-ink-500">{count}</span>
      </div>
      {count === 0 ? (
        <p className="text-sm text-ink-400">{p.topic.noneRecorded}</p>
      ) : (
        <ul className="space-y-1.5">{children}</ul>
      )}
    </div>
  );
}
