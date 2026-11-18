import { SOURCE_TIERS } from "@/types";
import type { ResearchEvent, SourceStats, SourceTier } from "@/types";

/**
 * Count sources two different ways, as required by the source-type taxonomy:
 *   1. source records — every attached Source row;
 *   2. events — distinct events having at least one Source of that tier.
 * The event's own `sourceTier` is used as a fallback when sources are absent,
 * so legacy records are still counted.
 */
export function computeSourceStats(events: ResearchEvent[]): SourceStats {
  const byTier = Object.fromEntries(
    SOURCE_TIERS.map((tier) => [tier, { sources: 0, events: 0 }])
  ) as Record<SourceTier, { sources: number; events: number }>;

  let totalSources = 0;
  for (const event of events) {
    const sources = event.sources?.length
      ? event.sources
      : event.sourceUrl
        ? [{ url: event.sourceUrl, tier: event.sourceTier ?? "S0" }]
        : [];
    const tiers = new Set<SourceTier>();
    for (const source of sources) {
      if (!(source.tier in byTier)) continue;
      byTier[source.tier].sources += 1;
      tiers.add(source.tier);
    }
    for (const tier of tiers) byTier[tier].events += 1;
    totalSources += sources.length;
  }

  return { totalSources, byTier };
}
