import { appendIngestedEvents, readIngestedEvents } from "@/lib/db/ingested";
import { getStore } from "@/lib/db";
import { linkIncomingEvents } from "@/lib/tracking";

/**
 * Assign durable event links to the file-backed ingest archive without
 * changing a record's source text or URL. Safe to re-run: curated links
 * remain untouched and every unconfirmed item keeps its own stable event.
 */
async function main() {
  const ingested = readIngestedEvents();
  if (ingested.length === 0) {
    console.log("[tracking] no ingested events to backfill");
    return;
  }
  const all = await getStore().listEvents();
  const ingestedSlugs = new Set(ingested.map((event) => event.slug));
  const context = all.filter((event) => !ingestedSlugs.has(event.slug));
  // Curated links are durable editorial decisions; heuristic/llm/seed links
  // are recomputable, so a re-run recalibrates them instead of freezing the
  // first pass's mistakes.
  const chronological = [...ingested]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((event) =>
      event.tracking?.matchedBy === "curated" ? event : { ...event, tracking: undefined }
    );
  const linked = await linkIncomingEvents(chronological, context);
  const result = appendIngestedEvents(linked);
  const byRelation: Record<string, number> = {};
  for (const event of linked) {
    const relation = event.tracking?.relation ?? "independent";
    byRelation[relation] = (byRelation[relation] ?? 0) + 1;
  }
  console.log(`[tracking] ${result.total} source records; relations: ${JSON.stringify(byRelation)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});