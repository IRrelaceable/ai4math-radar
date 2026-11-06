import Link from "next/link";
import type { ResearchEvent } from "@/types";
import type { EntityKind } from "@/lib/entities";
import { truncateText } from "@/lib/utils";

/**
 * An event placed on the timeline of the people, institutions, projects and
 * systems the record names. Every row is a real stored event; the current one
 * is marked instead of linked, so the chain shows where this event sits.
 *
 * A chain reads as a story only if its ends are visible: the first and latest
 * events stay pinned, the window around the current event carries a one-line
 * summary, and the bulk in between lives behind a fold. Titles and dates alone
 * made a 35-event thread look like a flat list.
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
  others: string;
  kinds: Record<EntityKind, string>;
}

const WINDOW = 5;

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

type RowBadge = "start" | "latest" | "current";

export function EntityThreads({
  threads,
  others,
  currentSlug,
  labels,
}: {
  threads: EntityThreadView[];
  others: { kind: EntityKind; name: string }[];
  currentSlug: string;
  labels: EntityThreadsLabels;
}) {
  return (
    <section id="thread" className="mt-7 scroll-mt-24">
      <h2 className="text-lg font-semibold tracking-tight">{labels.title}</h2>
      <p className="mt-1 text-sm text-ink-500">{labels.intro}</p>
      <div className="mt-3 space-y-3">
        {threads.map((thread) => {
          const { visible, earlier, later } = chainAround(thread.events, currentSlug);
          const index = thread.events.findIndex((event) => event.slug === currentSlug);
          // The two ends anchor the story; the fold holds whatever sits between
          // them and the window around the current event.
          const first = earlier[0];
          const last = later[later.length - 1];
          const hiddenEarlier = earlier.length > 1 ? earlier.slice(1) : [];
          const hiddenLater = later.length > 1 ? later.slice(0, -1) : [];
          const badgeFor = (event: ResearchEvent): RowBadge[] => {
            const badges: RowBadge[] = [];
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

          return (
            <div
              key={`${thread.kind}:${thread.name}`}
              className="rounded-md border border-ink-200 p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <div className="mono-label">{labels.kinds[thread.kind]}</div>
                  <div className="truncate text-sm font-medium text-ink-900">{thread.name}</div>
                </div>
                <span className="shrink-0 font-mono text-[11px] text-ink-400">
                  {labels.count.replace("{n}", String(thread.events.length))}
                  {index >= 0 &&
                    ` · ${labels.position
                      .replace("{i}", String(index + 1))
                      .replace("{n}", String(thread.events.length))}`}
                </span>
              </div>
              <ol className="mt-2 border-l border-ink-200">
                {first && row(first, true)}
                {hiddenEarlier.length > 0 && (
                  <Fold
                    label={labels.expandEarlier.replace("{n}", String(hiddenEarlier.length))}
                  >
                    {hiddenEarlier.map((event) => row(event, false))}
                  </Fold>
                )}
                {visible.map((event) => row(event, true))}
                {hiddenLater.length > 0 && (
                  <Fold label={labels.expandLater.replace("{n}", String(hiddenLater.length))}>
                    {hiddenLater.map((event) => row(event, false))}
                  </Fold>
                )}
                {last && row(last, true)}
              </ol>
            </div>
          );
        })}
      </div>

      {others.length > 0 && (
        <div className="mt-3 rounded-md border border-dashed border-ink-200 p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mono-label mr-1">{labels.others}</span>
            {others.map((thread) => (
              <span key={`${thread.kind}:${thread.name}`} className="chip">
                {thread.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Fold({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="relative pl-4">
      <span
        aria-hidden="true"
        className="absolute left-[-3px] top-[17px] h-1.5 w-1.5 rounded-full bg-ink-200"
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
  badges: RowBadge[];
  withSummary: boolean;
}) {
  const isCurrent = badges.includes("current");
  return (
    <li className="relative py-1.5 pl-4">
      <span
        aria-hidden="true"
        className={`absolute left-[-3px] top-[13px] h-1.5 w-1.5 rounded-full ${
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
                ? "rounded-sm border border-accent-200 bg-accent-50 px-1.5 py-px text-[10px] font-medium text-accent-700"
                : "rounded-sm border border-ink-200 bg-ink-50 px-1.5 py-px text-[10px] font-medium text-ink-600"
            }
          >
            {badge === "start" ? labels.start : badge === "latest" ? labels.latest : labels.current}
          </span>
        ))}
      </div>
      <div className="mt-0.5">
        {isCurrent ? (
          <span aria-current="page" className="text-sm font-medium leading-snug text-ink-900">
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
