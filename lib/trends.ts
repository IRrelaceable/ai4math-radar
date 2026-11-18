import type { ResearchEvent } from "@/types";
import { capabilityOf } from "@/lib/dimensions";

/**
 * Trend detection: where is the recorded activity concentrating right now?
 *
 * This is a count of tracked events, not a claim about scientific significance —
 * pair it with the verification labels before drawing conclusions.
 */
export interface CapabilityTrend {
  capability: string;
  recent: number;
  previous: number;
  delta: number;
  ratio: number;
  rising: boolean;
  latest: string;
  recentEvents: { slug: string; title: string; date: string }[];
}

export interface TrendSummary {
  asOf: string;
  windowDays: number;
  totalRecent: number;
  totalPrevious: number;
  topRising: CapabilityTrend[];
  all: CapabilityTrend[];
}

const MS_PER_DAY = 86_400_000;

export function buildTrends(
  events: ResearchEvent[],
  windowDays = 90,
  asOf: Date = new Date()
): TrendSummary {
  const now = asOf.getTime();
  const currentStart = now - windowDays * MS_PER_DAY;
  const previousStart = now - 2 * windowDays * MS_PER_DAY;

  const byCapability = new Map<string, { recent: ResearchEvent[]; previous: ResearchEvent[] }>();

  for (const event of events) {
    // Trends track the capability axis; ecosystem events carry no facet.
    const capability = capabilityOf(event);
    if (!capability) continue;
    const t = Date.parse(event.date);
    if (Number.isNaN(t)) continue;
    const entry = byCapability.get(capability) ?? { recent: [], previous: [] };
    if (t >= currentStart) entry.recent.push(event);
    else if (t >= previousStart) entry.previous.push(event);
    byCapability.set(capability, entry);
  }

  const all: CapabilityTrend[] = [...byCapability.entries()]
    .map(([capability, buckets]) => {
      const recent = buckets.recent.sort((a, b) => b.date.localeCompare(a.date));
      const previous = buckets.previous;
      const delta = recent.length - previous.length;
      const ratio =
        previous.length === 0 ? (recent.length > 0 ? Infinity : 1) : recent.length / previous.length;
      return {
        capability,
        recent: recent.length,
        previous: previous.length,
        delta,
        ratio,
        rising: recent.length > 0 && recent.length >= previous.length,
        latest: recent[0]?.date ?? previous[0]?.date ?? "",
        recentEvents: recent.slice(0, 3).map((e) => ({ slug: e.slug, title: e.title, date: e.date })),
      };
    })
    .filter((t) => t.recent > 0 || t.previous > 0)
    .sort(
      (a, b) => b.recent - a.recent || b.delta - a.delta || a.capability.localeCompare(b.capability)
    );

  return {
    asOf: asOf.toISOString(),
    windowDays,
    totalRecent: all.reduce((s, t) => s + t.recent, 0),
    totalPrevious: all.reduce((s, t) => s + t.previous, 0),
    topRising: all.filter((t) => t.rising).slice(0, 5),
    all,
  };
}

