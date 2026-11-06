"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ListEvent, TopicStat } from "@/types";
import { EventGrid } from "@/components/research/EventGrid";
import { Pager } from "@/components/ui/Pager";
import { TrendChart } from "@/components/topics/TrendChart";
import { matchesQuery } from "@/lib/utils";
import { listSearchText } from "@/lib/staticData";
import { useT } from "@/lib/i18n/context";
import { countText, fill, pagesDict } from "@/lib/i18n/dict.pages";

/** Cards per page; the side panels still summarize the whole archive. */
const PAGE_SIZE = 30;

/**
 * One research direction: trend, facets and archive.
 *
 * The events are passed in by the statically generated page, so paging and
 * searching a direction never refetch the archive. Query-string state works
 * exactly as before, just resolved in the browser.
 */
export function TopicView({
  slug,
  stat,
  events,
}: {
  slug: string;
  stat: TopicStat;
  events: ListEvent[];
}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { lang, t } = useT();
  const p = pagesDict[lang];

  const q = (params.get("q") ?? "").trim();
  // Same searchable blob as /latest, so a topic archive matches Chinese text,
  // authors and models too instead of only the title and summary.
  const filtered = q ? events.filter((e) => matchesQuery(listSearchText(e), q)) : events;
  const progressSub = q
    ? fill(p.topic.progressMatch, { count: countText(p, filtered.length, "event"), q })
    : fill(p.topic.progressPlain, { count: countText(p, filtered.length, "event") });

  const psort = params.get("psort") === "title" ? "title" : "recent";

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const requested = Number.parseInt(params.get("page") ?? "", 10);
  const page = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), totalPages) : 1;
  const pageEvents = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /** Keep the other view state (search, paper sort, page) on every link. */
  const hrefFor = ({
    page: nextPage = page,
    psort: nextSort = psort,
  }: { page?: number; psort?: string } = {}) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (nextPage > 1) query.set("page", String(nextPage));
    if (nextSort !== "recent") query.set("psort", nextSort);
    const qs = query.toString();
    return qs ? `/topics/${slug}?${qs}` : `/topics/${slug}`;
  };

  const papers = new Map<string, { title: string; url?: string; venue?: string; latest: string }>();
  const models = new Set<string>();
  const benchmarks = new Set<string>();
  const datasets = new Set<string>();
  for (const e of events) {
    for (const paper of e.papers ?? []) {
      const existing = papers.get(paper.title);
      // Events arrive newest-first; `max` guards against an unsorted source.
      if (!existing) papers.set(paper.title, { ...paper, latest: e.date });
      else if (e.date > existing.latest) existing.latest = e.date;
    }
    for (const m of e.model ?? []) models.add(m);
    for (const b of e.benchmark ?? []) benchmarks.add(b);
    for (const ds of e.dataset ?? []) datasets.add(ds);
  }

  const paperList = [...papers.values()].sort((a, b) =>
    psort === "title"
      ? a.title.localeCompare(b.title)
      : b.latest.localeCompare(a.latest) || a.title.localeCompare(b.title)
  );

  const pageHref = (n: number) => hrefFor({ page: n });

  const submitSearch = (value: string) => {
    const query = new URLSearchParams();
    const trimmed = value.trim();
    if (trimmed) query.set("q", trimmed);
    if (psort !== "recent") query.set("psort", psort);
    const qs = query.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mono-label mb-4">{p.topic.timeTrend}</div>
          <TrendChart events={events} />
        </div>
        <div className="card p-5">
          <div className="mono-label mb-3">{p.topic.overview}</div>
          <dl className="space-y-3 text-sm">
            <Row label={p.topic.rowQuantity} value={countText(p, stat.count, "event")} />
            <Row label={t.home.statsPapers} value={`${papers.size}`} />
            <Row label={p.topic.rowModels} value={`${models.size}`} />
            <Row label={p.topic.rowBenchmarks} value={`${benchmarks.size}`} />
            <Row label={p.topic.rowDatasets} value={`${datasets.size}`} />
          </dl>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <FacetCard
          title={p.topic.relatedPapers}
          count={papers.size}
          empty={p.topic.noneRecorded}
          toolbar={
            <div className="mb-2.5 flex items-center gap-1.5">
              <span className="mono-label mr-0.5">{p.topic.paperSort}</span>
              <Link
                href={hrefFor({ psort: "recent" })}
                aria-current={psort === "recent" ? "true" : undefined}
                className={`chip py-0 ${psort === "recent" ? "chip-active" : "hover:border-ink-300 hover:text-ink-900"}`}
              >
                {p.topic.paperSortRecent}
              </Link>
              <Link
                href={hrefFor({ psort: "title" })}
                aria-current={psort === "title" ? "true" : undefined}
                className={`chip py-0 ${psort === "title" ? "chip-active" : "hover:border-ink-300 hover:text-ink-900"}`}
              >
                {p.topic.paperSortTitle}
              </Link>
            </div>
          }
        >
          {paperList.map((paper) => (
            <li key={paper.title} className="flex items-baseline gap-2 text-sm leading-snug">
              <span className="w-11 shrink-0 font-mono text-[11px] text-ink-400">
                {paper.latest.slice(0, 7)}
              </span>
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
        <FacetCard title={p.topic.relatedModels} count={models.size} empty={p.topic.noneRecorded}>
          {[...models].map((m) => (
            <li key={m} className="text-sm">
              <Chip href={`/latest?model=${encodeURIComponent(m)}`}>{m}</Chip>
            </li>
          ))}
        </FacetCard>
        <FacetCard
          title={p.topic.relatedBenchmarks}
          count={benchmarks.size}
          empty={p.topic.noneRecorded}
        >
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

      <section className="mt-9">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{p.topic.latestProgress}</h2>
            <p className="mt-1 text-sm text-ink-600">{progressSub}</p>
          </div>
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch(String(new FormData(event.currentTarget).get("q") ?? ""));
            }}
          >
            <input
              name="q"
              defaultValue={q}
              key={q}
              placeholder={p.topic.searchPlaceholder}
              aria-label={p.topic.searchPlaceholder}
              className="w-52 rounded-md border border-ink-200 px-3 py-1.5 text-sm focus:border-accent-500 focus:outline-none"
            />
            <button type="submit" className="btn-ghost">
              {p.topic.searchBtn}
            </button>
          </form>
        </div>
        <EventGrid events={pageEvents} />
        <Pager page={page} totalPages={totalPages} hrefFor={pageHref} labels={p.pager} />
      </section>

      <p className="mt-6 text-xs text-ink-400">
        {p.topic.slugA} <span className="font-mono">{stat.slug}</span>
        {p.topic.slugB}
        <span className="font-mono"> /topics/{stat.slug}</span>
        {p.topic.slugC}
      </p>
    </>
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
  empty,
  toolbar,
  children,
}: {
  title: string;
  count: number;
  empty: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="mono-label">{title}</span>
        <span className="font-mono text-xs text-ink-500">{count}</span>
      </div>
      {count === 0 ? (
        <p className="text-sm text-ink-400">{empty}</p>
      ) : (
        <>
          {toolbar}
          <ul className="space-y-1.5">{children}</ul>
        </>
      )}
    </div>
  );
}
