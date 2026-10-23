import { Suspense } from "react";
import { getStore } from "@/lib/db";
import {
  EVIDENCE_LEVELS,
  EVENT_TYPES,
  SOURCE_TIERS,
  TIME_WINDOWS,
  VERIFICATION_STATUSES,
  windowStartDate,
  type EventType,
  type ResearchArea,
} from "@/types";
import { FeedControls } from "@/components/research/FeedControls";
import { EventGrid } from "@/components/research/EventGrid";
import { getLang } from "@/lib/i18n/server";
import { localizeEvents } from "@/lib/i18n/localize";
import { pagesDict } from "@/lib/i18n/dict.pages";

export const dynamic = "force-dynamic";

/** Keep only values present in the taxonomy; unknown URL input is ignored. */
function oneOf<T extends string>(raw: string | undefined, allowed: readonly T[]): T | undefined {
  return raw && (allowed as readonly string[]).includes(raw) ? (raw as T) : undefined;
}

export async function generateMetadata() {
  const m = pagesDict[getLang()].meta.latest;
  return { title: m.title, description: m.desc };
}

export default async function LatestPage({
  searchParams,
}: {
  searchParams: {
    type?: string;
    area?: string;
    q?: string;
    status?: string;
    evidence?: string;
    tier?: string;
    model?: string;
    benchmark?: string;
    dataset?: string;
    time?: string;
    sort?: string;
  };
}) {
  const store = getStore();
  const lang = getLang();
  const p = pagesDict[lang];

  const eventType = oneOf(searchParams.type, EVENT_TYPES);
  const status = oneOf(searchParams.status, VERIFICATION_STATUSES);
  const evidence = oneOf(searchParams.evidence, EVIDENCE_LEVELS);
  const tier = oneOf(searchParams.tier, SOURCE_TIERS);

  // `time` is either a relative window ("90d") or a concrete year ("2025").
  const window = oneOf(searchParams.time, TIME_WINDOWS);
  const year = searchParams.time && /^\d{4}$/.test(searchParams.time)
    ? searchParams.time
    : undefined;

  const [events, allEvents] = await Promise.all([
    store.listEvents({
      eventType: eventType as EventType | undefined,
      area: searchParams.area,
      q: searchParams.q,
      status,
      evidence,
      tier,
      model: searchParams.model,
      benchmark: searchParams.benchmark,
      dataset: searchParams.dataset,
      since: window ? windowStartDate(window) : undefined,
      year,
      sort: searchParams.sort === "importance" ? "importance" : "date",
    }),
    store.listEvents(),
  ]);

  const availableAreas = [...new Set(allEvents.map((e) => e.researchArea))].sort();

  // Only offer filter values that actually occur in the data, so no option
  // can return an empty feed (same rule as the timeline's type chips).
  const present = <T extends string>(values: (T | undefined)[]): T[] =>
    [...new Set(values.filter((v): v is T => Boolean(v)))].sort();

  const presentYears = present(allEvents.map((e) => e.date.slice(0, 4)));
  // A relative window is offered only if at least one event falls inside it.
  const presentWindows = TIME_WINDOWS.filter((w) =>
    allEvents.some((e) => e.date >= windowStartDate(w))
  );

  return (
    <div className="container-page py-10">
      <div className="mb-6 max-w-3xl">
        <div className="mono-label mb-2">{p.latest.label}</div>
        <h1 className="text-2xl font-semibold tracking-tight">{p.latest.title}</h1>
        <p className="mt-2 text-sm text-ink-600">
          {p.latest.sub}
        </p>
      </div>

      <Suspense fallback={<div className="h-24" />}>
        <FeedControls
          availableAreas={availableAreas as ResearchArea[]}
          total={events.length}
          presentStatuses={present(allEvents.map((e) => e.verificationStatus))}
          presentEvidence={present(allEvents.map((e) => e.evidenceLevel))}
          presentTiers={present(allEvents.map((e) => e.sourceTier))}
          presentWindows={presentWindows}
          presentYears={presentYears}
        />
      </Suspense>

      <div className="mt-6">
        <EventGrid events={localizeEvents(events, lang)} />
      </div>
    </div>
  );
}

