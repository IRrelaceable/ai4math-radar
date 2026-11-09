"use client";

import { useSearchParams } from "next/navigation";
import {
  EVIDENCE_LEVELS,
  EVENT_TYPES,
  RESEARCH_AREAS,
  SOURCE_TIERS,
  TIME_WINDOWS,
  windowStartDate,
  type EvidenceLevel,
  type EventDirection,
  type EventType,
  type SourceTier,
  type TimeWindow,
} from "@/types";
import { FeedControls } from "@/components/research/FeedControls";
import { EventGrid } from "@/components/research/EventGrid";
import { EventRow } from "@/components/research/EventRow";
import { BackToTop } from "@/components/ui/BackToTop";
import { Pager } from "@/components/ui/Pager";
import { useDataset } from "@/lib/useDataset";
import { listSearchText } from "@/lib/staticData";
import { matchesQuery } from "@/lib/utils";
import { useLang } from "@/lib/i18n/context";
import { componentsDict } from "@/lib/i18n/dict.components";
import { dict } from "@/lib/i18n/dict";
import { pagesDict } from "@/lib/i18n/dict.pages";

/** Cards per page. Filters still apply to the whole dataset. */
const PAGE_SIZE = 30;

/** Keep only values present in the taxonomy; unknown URL input is ignored. */
function oneOf<T extends string>(raw: string | null, allowed: readonly T[]): T | undefined {
  return raw && (allowed as readonly string[]).includes(raw) ? (raw as T) : undefined;
}

/**
 * The ecosystem feed.
 *
 * A static export cannot filter on the server, so the page ships the whole
 * build-time dataset once and this view applies the same filters the store
 * used to: event class, area, search, evidence, tier, facets, time window.
 * URL state is unchanged — every filter is still shareable. A page may pin
 * the direction axis via `presetDirection` (the /math4ai entry), which narrows
 * the dataset before any other filter and keeps the pager on its own path.
 */
export function LatestFeed({ presetDirection }: { presetDirection?: EventDirection } = {}) {
  const params = useSearchParams();
  const { data, error } = useDataset();
  const { lang } = useLang();
  const p = pagesDict[lang];
  const c = componentsDict[lang];

  if (error) {
    return <p className="text-sm text-rose-600">{c.feed.loadError}</p>;
  }
  if (!data) {
    return <p className="text-sm text-ink-500">{c.feed.loading}</p>;
  }

  // "both" serves either side, so it appears in every direction view.
  const all = presetDirection
    ? data.events.filter(
        (e) => e.direction === presetDirection || e.direction === "both"
      )
    : data.events;
  const eventType = oneOf<EventType>(params.get("type"), EVENT_TYPES);
  const evidence = oneOf<EvidenceLevel>(params.get("evidence"), EVIDENCE_LEVELS);
  const tier = oneOf<SourceTier>(params.get("tier"), SOURCE_TIERS);

  // `time` is either a relative window ("90d") or a concrete year ("2025").
  const rawTime = params.get("time");
  const window = oneOf<TimeWindow>(rawTime, TIME_WINDOWS);
  const year = rawTime && /^\d{4}$/.test(rawTime) ? rawTime : undefined;
  const since = window ? windowStartDate(window) : undefined;

  const area = params.get("area");
  const q = (params.get("q") ?? "").trim();
  const model = params.get("model");
  const benchmark = params.get("benchmark");
  const datasetFacet = params.get("dataset");
  const compact = params.get("view") === "compact";

  const filtered = all.filter(
    (e) =>
      (!eventType || e.eventType === eventType) &&
      (!area || e.researchArea === area) &&
      (!q || matchesQuery(listSearchText(e), q)) &&
      (!evidence || e.evidenceLevel === evidence) &&
      (!tier || e.sourceTier === tier) &&
      (!model || (e.model ?? []).includes(model)) &&
      (!benchmark || (e.benchmark ?? []).includes(benchmark)) &&
      (!datasetFacet || (e.dataset ?? []).includes(datasetFacet)) &&
      (!since || e.date >= since) &&
      (!year || e.date.startsWith(year))
  );

  // Options are data-derived: a level with no records would only ever yield an
  // empty result set. The full scale stays documented on /methodology.
  const presentAreas = new Set(all.map((e) => e.researchArea));
  const availableAreas = RESEARCH_AREAS.filter((a) => presentAreas.has(a));
  const presentTypes = EVENT_TYPES.filter((type) =>
    all.some((e) => e.eventType === type)
  );
  const presentEvidence = EVIDENCE_LEVELS.filter((level) =>
    all.some((e) => e.evidenceLevel === level)
  );
  const presentYears = [...new Set(all.map((e) => e.date.slice(0, 4)))].sort();
  const presentWindows = TIME_WINDOWS.filter((w) =>
    all.some((e) => e.date >= windowStartDate(w))
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const requested = Number.parseInt(params.get("page") ?? "", 10);
  const page = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), totalPages) : 1;
  const pageEvents = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /** Preserve active filters; page 1 stays canonical without `?page=1`. */
  const base = presetDirection ? "/math4ai" : "/latest";
  const pageHref = (n: number) => {
    const query = new URLSearchParams(params.toString());
    query.delete("page");
    if (n > 1) query.set("page", String(n));
    const qs = query.toString();
    return qs ? `${base}?${qs}` : base;
  };

  return (
    <>
      <FeedControls
        availableAreas={availableAreas}
        total={filtered.length}
        presentEvidence={presentEvidence}
        presentTiers={[...SOURCE_TIERS]}
        presentWindows={presentWindows}
        presentYears={presentYears}
        presentTypes={presentTypes}
        compact={compact}
      />

      <div className="mt-6">
        {compact ? (
          <div className="divide-y divide-ink-100 overflow-hidden rounded-md border border-ink-200">
            {pageEvents.map((event) => (
              <EventRow key={event.slug} event={event} />
            ))}
          </div>
        ) : (
          <EventGrid events={pageEvents} />
        )}
      </div>

      <Pager page={page} totalPages={totalPages} hrefFor={pageHref} labels={p.pager} />
      <BackToTop label={dict[lang].common.backToTop} />
    </>
  );
}
