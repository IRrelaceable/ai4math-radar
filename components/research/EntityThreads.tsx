import Link from "next/link";
import type { ResearchEvent } from "@/types";
import type { EntityKind } from "@/lib/entities";
import { truncateText } from "@/lib/utils";

/**
 * Related events, grouped by the kind of thing two records have in common.
 *
 * Co-occurrence is NOT a causal chain, so the section never presents itself as
 * one: short chains collapse to a single line, long chains show where the
 * current event sits, and every remaining thread stays reachable instead of
 * being reduced to a decorative, unclickable name chip.
 */
export interface EntityThreadView {
  kind: EntityKind;
  name: string;
  events: ResearchEvent[];
}

interface EntityThreadsLabels {
  title: string;
  intro: string;
  current: string;
  count: string;
  start: string;
  latest: string;
  position: string;
  expandEarlier: string;
  expandLater: string;
  more: string;
  short: string;
  kinds: Record<EntityKind, string>;
}

const WINDOW = 5;
const KIND_ORDER: EntityKind[] = ["person", "institution", "project", "system"];

function chainAround(events: ResearchEvent[], slug: string) {
  if (events.length <= WINDOW + 2) {
    return { visible: events, earlier: [] as ResearchEvent[], later: [] as ResearchEvent[] };
  }
  const index = events.findIndex((event) => event.slug === slug);
  const start = Math.min(Math.max(index - 2, 0), events.length - WINDOW);
  return {
    visible: events.slice(start, start + WINDOW),
    earlier: events.slice(0, start),
    later: events.slice(start + WINDOW),
  };
}

export function EntityThreads({
  threads,
  currentSlug,
  labels,
}: {
  threads: EntityThreadView[];
  currentSlug: string;
  labels: EntityThreadsLabels;
}) {
  if (threads.length === 0) return null;
  const groups = KIND_ORDER.map((kind) => ({
    kind,
    items: threads.filter((thread) => thread.kind === kind),
  })).filter((group) => group.items.length > 0);

  return (
    <section id="thread" className="mt-10 scroll-mt-24">
      <h2 className="section-head h-section">{labels.title}</h2>
      <p className="lede max-w-3xl">{labels.intro}</p>

      <div className="mt-5 space-y-6">
        {groups.map((group) => {
          const [lead, ...rest] = group.items;
          return (
            <div key={group.kind}>
              <div className="mono-label mb-1">{labels.kinds[group.kind]}</div>
              <ThreadCard
                thread={lead}
                currentSlug={currentSlug}
                labels={labels}
              />
              {rest.length > 0 && (
                <details className="disclosure mt-2 rounded-md border border-ink-200 px-3 py-2">
                  <summary className="cursor-pointer font-mono text-[11px] text-ink-500 hover:text-ink-800">
                    <span className="disclosure-sign mr-1.5 inline-block font-sans text-sm leading-none" />
                    {labels.more.replace("{n}", String(rest.length))}
                  </summary>
                  <div className="mt-3 space-y-3">
                    {rest.map((thread) => (
                      <ThreadCard
                        key={`${thread.kind}:${thread.name}`}
                        thread={thread}
                        currentSlug={currentSlug}
                        labels={labels}
                        compact
                      />
                    ))}
                  </div>
                </details>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ThreadCard({
  thread,
  currentSlug,
  labels,
  compact = false,
}: {
  thread: EntityThreadView;
  currentSlug: string;
  labels: EntityThreadsLabels;
  compact?: boolean;
}) {
  const index = thread.events.findIndex((event) => event.slug === currentSlug);
  const { visible, earlier, later } = chainAround(thread.events, currentSlug);
  const first = earlier[0];
  const last = later[later.length - 1];
  const hiddenEarlier = earlier.length > 1 ? earlier.slice(1) : [];
  const hiddenLater = later.length > 1 ? later.slice(0, -1) : [];

  // Two-event chains earn one line, not a timeline with three badges on it.
  if (thread.events.length <= 2) {
    const other = thread.events.find((event) => event.slug !== currentSlug) ?? thread.events[0];
    return (
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-md border border-ink-200 px-3 py-2 text-sm">
        <span className="font-medium text-ink-900">{thread.name}</span>
        <span className="text-ink-300">·</span>
        <Link href={`/research/${other.slug}`} className="link-quiet min-w-0">
          {other.title}
        </Link>
        <span className="ml-auto shrink-0 font-mono text-[11px] text-ink-400">
          {labels.short}
        </span>
      </div>
    );
  }

  // Secondary threads stay readable without flooding the page: a compact
  // window around this event plus both ends, with no summaries or folds.
  if (compact) {
    const rows = [
      ...(earlier.length ? [earlier[0]] : []),
      ...visible,
      ...(later.length ? [later[later.length - 1]] : []),
    ];
    return (
      <div className="rounded-md border border-ink-200 px-3 py-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="font-medium text-ink-900">{thread.name}</span>
          <span className="font-mono text-[11px] text-ink-500">
            {labels.count.replace("{n}", String(thread.events.length))}
          </span>
        </div>
        <ul className="mt-1.5 divide-y divide-ink-100">
          {rows.map((item) => (
            <li key={item.slug} className="flex gap-2 py-1 text-sm">
              <span className="shrink-0 font-mono text-[11px] text-ink-400">{item.date}</span>
              {item.slug === currentSlug ? (
                <span className="font-medium text-ink-900">{item.title}</span>
              ) : (
                <Link href={`/research/${item.slug}`} className="link-quiet">
                  {item.title}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const badgeFor = (event: ResearchEvent): ("start" | "latest" | "current")[] => {
    const badges: ("start" | "latest" | "current")[] = [];
    if (event === thread.events[0]) badges.push("start");
    if (event === thread.events[thread.events.length - 1]) badges.push("latest");
    if (event.slug === currentSlug) badges.push("current");
    return badges;
  };
  const row = (event: ResearchEvent, withSummary: boolean) => (
    <ThreadRow
      key={`${thread.kind}:${thread.name}:${event.slug}`}
      event={event}
      labels={labels}
      badges={badgeFor(event)}
      withSummary={withSummary}
    />
  );
  const progress = index >= 0 ? ((index + 1) / thread.events.length) * 100 : 0;

  return (
    <div className="rounded-md border border-ink-200 px-3 py-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="min-w-0 font-medium text-ink-900">{thread.name}</div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="h-1 w-14 overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-accent-600"
              style={{ width: `${Math.max(4, progress)}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-ink-500">
            {index >= 0
              ? labels.position
                  .replace("{i}", String(index + 1))
                  .replace("{n}", String(thread.events.length))
              : labels.count.replace("{n}", String(thread.events.length))}
          </span>
        </div>
      </div>

      <ol className="mt-2 border-l border-ink-200">
        {first && row(first, false)}
        {hiddenEarlier.length > 0 && (
          <Fold label={labels.expandEarlier.replace("{n}", String(hiddenEarlier.length))}>
            {hiddenEarlier.map((event) => row(event, false))}
          </Fold>
        )}
        {visible.map((event) => row(event, true))}
        {hiddenLater.length > 0 && (
          <Fold label={labels.expandLater.replace("{n}", String(hiddenLater.length))}>
            {hiddenLater.map((event) => row(event, false))}
          </Fold>
        )}
        {last && row(last, false)}
      </ol>
    </div>
  );
}

function Fold({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li className="relative pl-4">
      <span
        aria-hidden="true"
        className="absolute -left-[3px] top-[17px] h-1.5 w-1.5 rounded-full bg-ink-200"
      />
      <details className="group">
        <summary className="cursor-pointer list-none py-1.5 font-mono text-[11px] text-ink-400 transition hover:text-ink-700">
          <span className="inline-block transition group-open:rotate-90">▸</span>
          <span className="ml-1.5">{label}</span>
        </summary>
        <ol className="-ml-4 border-l border-dashed border-ink-200">{children}</ol>
      </details>
    </li>
  );
}

function ThreadRow({
  event,
  labels,
  badges,
  withSummary,
}: {
  event: ResearchEvent;
  labels: EntityThreadsLabels;
  badges: ("start" | "latest" | "current")[];
  withSummary: boolean;
}) {
  const isCurrent = badges.includes("current");
  return (
    <li className="relative py-1.5 pl-4">
      <span
        aria-hidden="true"
        className={`absolute -left-[3px] top-[13px] h-1.5 w-1.5 rounded-full ${
          isCurrent ? "bg-accent-600" : "bg-ink-300"
        }`}
      />
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-[11px] text-ink-400">{event.date}</span>
        {badges.map((badge) => (
          <span
            key={badge}
            className={
              badge === "current"
                ? "rounded border border-accent-200 bg-accent-50 px-1.5 py-px text-[10px] font-medium text-accent-700"
                : "rounded border border-ink-200 bg-ink-50 px-1.5 py-px text-[10px] font-medium text-ink-600"
            }
          >
            {badge === "start" ? labels.start : badge === "latest" ? labels.latest : labels.current}
          </span>
        ))}
      </div>
      <div className="mt-0.5">
        {isCurrent ? (
          <span aria-current="page" className="h-item text-ink-900">
            {event.title}
          </span>
        ) : (
          <Link
            href={`/research/${event.slug}`}
            className="text-sm leading-snug text-ink-700 hover:text-accent-700"
          >
            {event.title}
          </Link>
        )}
      </div>
      {withSummary && event.summary && (
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-500">
          {truncateText(event.summary, 180)}
        </p>
      )}
    </li>
  );
}
