import type {
  ListEvent,
  ResearchArea,
  ResearchEvent,
  SearchGroup,
  SearchResult,
  TopicStat,
} from "@/types";
import type { Lang } from "@/lib/i18n/dict";
import { dict } from "@/lib/i18n/dict";
import { displayArea } from "@/lib/i18n/localize";
import { matchesQuery, truncateText } from "@/lib/utils";

/**
 * Client-side view over the build-time dataset (public/data/<lang>.json).
 *
 * The static export has no query endpoint, so the feed, timeline, topic
 * archive and search all filter the same in-memory list. Detail-only prose is
 * dropped here; cards clamp summaries anyway.
 */

/** Long enough for a three-line card and full-text search, short enough to ship. */
const SUMMARY_MAX = 600;
const SIGNIFICANCE_MAX = 400;

/** Project a stored event onto the fields list surfaces render. */
export function toListEvent(event: ResearchEvent): ListEvent {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    summary: truncateText(event.summary, SUMMARY_MAX),
    significance: truncateText(event.significance, SIGNIFICANCE_MAX),
    date: event.date,
    eventType: event.eventType,
    researchEventType: event.researchEventType,
    researchArea: event.researchArea,
    subArea: event.subArea,
    direction: event.direction,
    sourceUrl: event.sourceUrl,
    paperUrl: event.paperUrl,
    githubUrl: event.githubUrl,
    papers: event.papers,
    authors: event.authors,
    institution: event.institution,
    model: event.model,
    benchmark: event.benchmark,
    dataset: event.dataset,
    evidenceLevel: event.evidenceLevel,
    sourceTier: event.sourceTier,
    verificationStatus: event.verificationStatus,
  };
}

/** Searchable blob for one list event; the dataset is already localized. */
export function listSearchText(e: ListEvent): string {
  return [
    e.title,
    e.summary,
    e.significance,
    e.eventType ?? "",
    e.researchArea ?? "",
    e.subArea ?? "",
    e.institution ?? "",
    ...(e.authors ?? []),
    ...(e.model ?? []),
    ...(e.benchmark ?? []),
    ...(e.dataset ?? []),
    ...(e.papers ?? []).map((p) => p.title),
  ].join(" ");
}

/**
 * Full-site search over the static dataset: events, papers, topics, models and
 * benchmarks. Mirrors lib/db/shared.ts `searchEvents`, with group headings in
 * the reader's language because there is no request-time localization step.
 */
export function searchList(
  events: ListEvent[],
  topics: TopicStat[],
  rawQuery: string,
  lang: Lang
): SearchResult {
  const q = rawQuery.trim();
  if (!q) return { query: "", groups: [], total: 0 };
  const d = dict[lang];
  const groups: SearchGroup[] = [];

  for (const e of [...events].sort((a, b) => b.date.localeCompare(a.date))) {
    if (!matchesQuery(listSearchText(e), q)) continue;
    groups.push({
      kind: "event",
      title: e.title,
      subtitle: [e.eventType ? d.trust.type[e.eventType] : "", displayArea(e.researchArea, lang), e.date]
        .filter(Boolean)
        .join(" · "),
      href: `/research/${e.slug}`,
    });
  }

  const seenPapers = new Set<string>();
  for (const e of events) {
    for (const p of e.papers ?? []) {
      if (seenPapers.has(p.title) || !matchesQuery(p.title, q)) continue;
      seenPapers.add(p.title);
      groups.push({
        kind: "paper",
        title: p.title,
        subtitle: p.venue ?? d.common.paper,
        href: p.url ?? `/research/${e.slug}`,
      });
    }
  }

  for (const stat of topics) {
    const label = displayArea(stat.topic as ResearchArea, lang);
    if (!matchesQuery(`${label} ${stat.topic}`, q)) continue;
    groups.push({
      kind: "topic",
      title: label,
      subtitle: `${stat.count} ${d.common.events}`,
      href: `/topics/${stat.slug}`,
    });
  }

  const seenFacets = { model: new Set<string>(), benchmark: new Set<string>() };
  for (const e of events) {
    for (const label of ["model", "benchmark"] as const) {
      for (const value of e[label] ?? []) {
        if (seenFacets[label].has(value) || !matchesQuery(value, q)) continue;
        seenFacets[label].add(value);
        groups.push({
          kind: label,
          title: value,
          subtitle: label === "model" ? d.detail.model : d.detail.benchmark,
          href: `/latest/?${label}=${encodeURIComponent(value)}`,
        });
      }
    }
  }

  return { query: q, groups, total: groups.length };
}
