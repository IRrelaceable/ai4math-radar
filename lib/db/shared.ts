import type { ResearchEvent, SearchGroup, SearchResult, TopicStat } from "@/types";
import { eventSearchText, matchesQuery, slugify, sortEvents } from "@/lib/utils";

/** Aggregate per-area topic statistics from a set of events (computed, never hard-coded). */
export function buildTopicStats(events: ResearchEvent[]): TopicStat[] {
  const map = new Map<string, TopicStat>();
  for (const e of events) {
    const slug = slugify(e.researchArea);
    let stat = map.get(slug);
    if (!stat) {
      stat = {
        topic: e.researchArea,
        slug,
        count: 0,
        latestDate: e.date,
        models: [],
        benchmarks: [],
      };
      map.set(slug, stat);
    }
    stat.count += 1;
    if (e.date > stat.latestDate) stat.latestDate = e.date;
    for (const m of e.model ?? []) if (!stat.models.includes(m)) stat.models.push(m);
    for (const b of e.benchmark ?? []) if (!stat.benchmarks.includes(b)) stat.benchmarks.push(b);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));
}

/**
 * Full-site search across Research Events, Papers, Topics, Models and Benchmarks.
 * Shared by the seed store and the Prisma store so results stay consistent.
 */
export function searchEvents(events: ResearchEvent[], rawQuery: string): SearchResult {
  const q = rawQuery.trim();
  if (!q) return { query: "", groups: [], total: 0 };
  const groups: SearchGroup[] = [];

  for (const e of sortEvents(events)) {
    if (matchesQuery(eventSearchText(e), q)) {
      groups.push({
        kind: "event",
        title: e.title,
        subtitle: `${e.eventType ?? "Research"} · ${e.researchArea} · ${e.date}`,
        href: `/research/${e.slug}`,
      });
    }
  }

  const seenPapers = new Set<string>();
  for (const e of events) {
    for (const p of e.papers ?? []) {
      if (seenPapers.has(p.title) || !matchesQuery(p.title, q)) continue;
      seenPapers.add(p.title);
      groups.push({
        kind: "paper",
        title: p.title,
        subtitle: p.venue ?? "Paper",
        href: p.url ?? `/research/${e.slug}`,
      });
    }
  }

  for (const t of buildTopicStats(events)) {
    if (matchesQuery(t.topic, q)) {
      groups.push({
        kind: "topic",
        title: t.topic,
        subtitle: `${t.count} research events`,
        href: `/topics/${t.slug}`,
      });
    }
  }

  const facet = (label: "model" | "benchmark") => {
    const seen = new Set<string>();
    for (const e of events) {
      const values = label === "model" ? e.model ?? [] : e.benchmark ?? [];
      for (const v of values) {
        if (seen.has(v) || !matchesQuery(v, q)) continue;
        seen.add(v);
        // Facet results navigate into the feed with that facet applied.
        groups.push({
          kind: label,
          title: v,
          subtitle: label === "model" ? "Model" : "Benchmark",
          href: `/latest?${label}=${encodeURIComponent(v)}`,
        });
      }
    }
  };
  facet("model");
  facet("benchmark");

  return { query: q, groups, total: groups.length };
}

