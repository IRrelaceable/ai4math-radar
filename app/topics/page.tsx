import Link from "next/link";
import {
  EVENT_TYPES,
  type EventDirection,
  type ResearchArea,
  type ResearchEvent,
} from "@/types";
import { getStore } from "@/lib/db";
import { formatDate, slugify } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { BackToTop } from "@/components/ui/BackToTop";
import { getLang, t } from "@/lib/i18n/server";
import { countText, fill, pagesDict } from "@/lib/i18n/dict.pages";
import { displayArea, displaySubArea, localizeEvents } from "@/lib/i18n/localize";

type Axis = EventDirection | "none";
const AXES: Axis[] = ["ai4math", "math4ai", "both", "none"];

/** Twelve consecutive calendar months ending at `endMonth`, oldest first. */
function recentMonthKeys(endMonth: string): string[] {
  const [year, month] = endMonth.split("-").map(Number);
  const keys: string[] = [];
  for (let i = 11; i >= 0; i -= 1) {
    keys.push(new Date(Date.UTC(year, month - 1 - i, 1)).toISOString().slice(0, 7));
  }
  return keys;
}

function axisCountsOf(list: ResearchEvent[]): Record<Axis, number> {
  const out: Record<Axis, number> = { ai4math: 0, math4ai: 0, both: 0, none: 0 };
  for (const e of list) {
    const raw = e.direction as string | undefined;
    const axis: Axis =
      raw === "ai4math" || raw === "math4ai" || raw === "both" ? raw : "none";
    out[axis] += 1;
  }
  return out;
}

export async function generateMetadata() {
  const m = pagesDict[getLang()].meta.topics;
  return { title: m.title, description: m.desc };
}

/**
 * Direction index.
 *
 * Six areas, but they are not interchangeable: one is mostly AI-for-math
 * (proving), another mostly math-for-AI (reasoning). The old page showed only
 * a count and a blue bar, so every card looked alike. Each card now carries
 * its direction-axis mix (reusing the existing dot palette), a 12-month
 * sparkline, a one-line definition, sub areas and its two newest records.
 * The overview card explains the two colour axes before they are used.
 */
export default async function TopicsPage() {
  const lang = getLang();
  const d = t(lang);
  const p = pagesDict[lang];
  const store = getStore();
  const [topics, events] = await Promise.all([store.listTopics(), store.listEvents()]);

  const totalResearch = topics.reduce((sum, topic) => sum + topic.count, 0);
  const unassigned = Math.max(0, events.length - totalResearch);
  const latest = topics.reduce((date, topic) => (topic.latestDate > date ? topic.latestDate : date), "");

  const axisLabel = (axis: Axis) =>
    axis === "none" ? p.topics.unassignedAxis : d.trust.direction[axis];

  // Whole-archive distributions behind the two legends.
  const classCounts: Partial<Record<(typeof EVENT_TYPES)[number], number>> = {};
  for (const e of events) {
    if (e.eventType) classCounts[e.eventType] = (classCounts[e.eventType] ?? 0) + 1;
  }
  // The direction axis is a research-only property, so ecosystem records stay
  // out of this panel — otherwise they would pile into the "unassigned" slice.
  const researchEvents = events.filter((e) => e.eventType === "Research");
  const allAxisCounts = axisCountsOf(researchEvents);

  // Group by the same slug buildTopicStats uses, so counts and slugs agree.
  const bySlug = new Map<string, ResearchEvent[]>();
  const subAreasByTopic = new Map<string, { name: string; count: number }[]>();
  for (const e of events) {
    if (!e.researchArea) continue;
    const key = slugify(e.researchArea);
    const list = bySlug.get(key) ?? [];
    list.push(e);
    bySlug.set(key, list);

    if (e.subArea) {
      const subs = subAreasByTopic.get(key) ?? [];
      const hit = subs.find((s) => s.name === e.subArea);
      if (hit) hit.count += 1;
      else subs.push({ name: e.subArea, count: 1 });
      subAreasByTopic.set(key, subs);
    }
  }
  for (const list of bySlug.values()) list.sort((a, b) => b.date.localeCompare(a.date));
  for (const list of subAreasByTopic.values()) list.sort((a, b) => b.count - a.count);

  const areaDesc = p.topics.areaDesc as Record<string, string>;

  return (
    <div className="container-page py-10">
      <PageHeader
        label={p.topics.label}
        title={d.nav.topics}
        description={p.topics.sub}
        meta={
          <>
            <span>{fill(p.topics.areaCount, { n: topics.length })}</span>
            <span>{countText(p, totalResearch, "researchEvent")}</span>
            <span className="text-ink-400">{fill(p.topics.unassigned, { n: unassigned })}</span>
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

      {/* Two colour axes, stated once before the cards use them: class hues
          for event type, and the dot palette for the direction axis. */}
      <section className="card mb-6 p-4 sm:p-5">
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
          <div>
            <div className="mono-label mb-3">{p.topics.overviewClass}</div>
            <div className="flex h-2 w-full overflow-hidden rounded-sm bg-ink-100">
              {EVENT_TYPES.map((ty) => {
                const n = classCounts[ty] ?? 0;
                if (!n) return null;
                return (
                  <span
                    key={ty}
                    data-type={ty}
                    className="type-fill block h-full"
                    style={{ width: `${(n / events.length) * 100}%` }}
                    title={`${d.trust.type[ty]} · ${n}`}
                  />
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
              {EVENT_TYPES.map((ty) => (
                <span
                  key={ty}
                  data-type={ty}
                  className="inline-flex items-center gap-1.5 text-[11px] text-ink-600"
                >
                  <span className="type-fill h-2 w-2 rounded-sm" aria-hidden="true" />
                  {d.trust.type[ty]}
                  <span className="font-mono text-ink-400">{classCounts[ty] ?? 0}</span>
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="mono-label mb-3">{p.topics.overviewAxis}</div>
            <div className="flex h-2 w-full overflow-hidden rounded-sm bg-ink-100">
              {AXES.map((axis) => {
                const n = allAxisCounts[axis];
                if (!n) return null;
                return (
                  <span
                    key={axis}
                    data-axis={axis}
                    className="axis-fill block h-full"
                    style={{ width: `${(n / Math.max(1, researchEvents.length)) * 100}%` }}
                    title={`${axisLabel(axis)} · ${n}`}
                  />
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
              {AXES.map((axis) =>
                allAxisCounts[axis] ? (
                  <span
                    key={axis}
                    data-axis={axis}
                    className="inline-flex items-center gap-1.5 text-[11px] text-ink-600"
                  >
                    <span className="axis-fill h-2 w-2 rounded-sm" aria-hidden="true" />
                    {axisLabel(axis)}
                    <span className="font-mono text-ink-400">{allAxisCounts[axis]}</span>
                  </span>
                ) : null
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {topics.map((topic, index) => {
          const list = bySlug.get(topic.slug) ?? [];
          const subAreas = subAreasByTopic.get(topic.slug) ?? [];
          const shownSubs = subAreas.slice(0, 4);
          const hiddenSubs = subAreas.length - shownSubs.length;
          const href = `/topics/${topic.slug}`;
          const share = Math.round((topic.count / Math.max(1, totalResearch)) * 100);

          const mix = axisCountsOf(list);
          const dominant = [...AXES].sort((a, b) => mix[b] - mix[a])[0];
          const dominantPct = Math.round((mix[dominant] / Math.max(1, list.length)) * 100);

          const monthKeys = recentMonthKeys(topic.latestDate.slice(0, 7));
          const monthCounts = monthKeys.map(
            (key) => list.filter((e) => e.date.startsWith(key)).length
          );
          const recent12 = monthCounts.reduce((sum, n) => sum + n, 0);
          const maxMonth = Math.max(1, ...monthCounts);
          // The store holds the English source records; title overlays are
          // applied at render time, same as the detail page's event grid.
          const recentRecords = localizeEvents(list.slice(0, 2), lang);

          return (
            <article
              key={topic.slug}
              className="card card-hover flex h-full flex-col overflow-hidden"
            >
              {/* Direction-axis mix: real semantic colour, no new palette. */}
              <div className="flex h-1 w-full" title={p.topics.axisMix}>
                {AXES.map((axis) =>
                  mix[axis] ? (
                    <span
                      key={axis}
                      data-axis={axis}
                      className="axis-fill block h-full"
                      style={{ width: `${(mix[axis] / Math.max(1, list.length)) * 100}%` }}
                    />
                  ) : null
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[11px] text-ink-300">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h2 className="text-[18px] font-semibold leading-snug tracking-tight text-ink-900">
                        <Link href={href} className="hover:text-accent-700">
                          {displayArea(topic.topic as ResearchArea, lang)}
                        </Link>
                      </h2>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-600">
                      {areaDesc[topic.slug] ?? ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono text-[19px] font-medium leading-none text-ink-900">
                      {topic.count}
                    </div>
                    <div className="mt-1 whitespace-nowrap font-mono text-[10px] text-ink-400">
                      {fill(p.topics.share, { n: share })}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-500">
                  <span className="inline-flex items-center gap-1.5" title={p.topics.axisMix}>
                    <span className="direction-dot" data-direction={dominant} aria-hidden="true" />
                    {axisLabel(dominant)} {dominantPct}%
                  </span>
                  <span className="text-ink-300">·</span>
                  <span className="font-mono">
                    {p.topics.recent12} {recent12}
                  </span>
                  <span className="text-ink-300">·</span>
                  <span className="font-mono">{formatDate(topic.latestDate, lang)}</span>
                </div>

                <div className="mt-3 flex h-9 items-end gap-[3px]" aria-hidden="true">
                  {monthCounts.map((n, i) => (
                    <span
                      key={monthKeys[i]}
                      title={`${monthKeys[i]} · ${n}`}
                      className={`flex-1 rounded-t-sm ${i === 11 ? "bg-accent-600" : "bg-accent-300"}`}
                      style={{ height: `${Math.max(3, Math.round((n / maxMonth) * 32))}px` }}
                    />
                  ))}
                </div>
                <div className="mt-1 flex justify-between font-mono text-[10px] text-ink-400">
                  <span>{monthKeys[0]}</span>
                  <span>{monthKeys[11]}</span>
                </div>

                {shownSubs.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="mono-label mr-1">{p.topics.subAreasLabel}</span>
                    {shownSubs.map((s) => (
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
                    {hiddenSubs > 0 && (
                      <span className="text-[11px] text-ink-400">
                        {fill(p.topics.subAreasMore, { n: hiddenSubs })}
                      </span>
                    )}
                  </div>
                )}

                {recentRecords.length > 0 && (
                  <div className="mt-3 border-t border-ink-100 pt-3">
                    <div className="mono-label mb-1.5">{p.topics.recentRecords}</div>
                    <ul className="space-y-1">
                      {recentRecords.map((e) => (
                        <li key={e.id} className="flex gap-2 text-[12px] leading-snug">
                          <time className="shrink-0 font-mono text-[10px] text-ink-400">
                            {e.date.slice(5)}
                          </time>
                          <Link href={`/research/${e.slug}`} className="link-quiet line-clamp-1">
                            {e.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-4 text-xs text-ink-500">
                  <span>
                    {p.topics.modelsLabel} {topic.models.length} · {p.topics.benchmarksLabel}{" "}
                    {topic.benchmarks.length}
                  </span>
                  <Link href={href} className="text-sm font-medium text-accent-700 hover:underline">
                    {p.topics.openTopic} →
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <BackToTop label={d.common.backToTop} />
    </div>
  );
}
