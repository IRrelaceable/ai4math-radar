import { loadEnv } from "./env";
import { readIngestedEvents, INGESTED_FILE } from "@/lib/db/ingested";
import { getLLMProvider } from "@/lib/llm/provider";
import { extractNamedEntities } from "@/agents/researchTracker/entities";
import fs from "node:fs";
import type { ResearchEvent } from "@/types";

/**
 * One-off enrichment: name the people / institutions / projects / systems a
 * stored event states, so the detail page can place it on their timelines.
 *
 *   npm run backfill:entities              # events that have no entities yet
 *   npm run backfill:entities -- --force   # re-extract every event
 *   npm run backfill:entities -- --limit=5 # small sample first
 *
 * Extraction runs on the title and the stored summary (the original abstract
 * is not kept). It never rewrites the summary itself, so a backfill cannot
 * change what a card says.
 */
const CONCURRENCY = 4;

async function main() {
  loadEnv();
  const argv = process.argv.slice(2);
  const force = argv.includes("--force");
  const limitArg = argv.find((arg) => arg.startsWith("--limit="));
  const limit = limitArg ? Number.parseInt(limitArg.slice("--limit=".length), 10) : undefined;

  const provider = getLLMProvider();
  if (provider.id === "mock") {
    throw new Error("entity backfill needs a live provider; set LLM_PROVIDER=openai-compatible in .env");
  }

  const events = readIngestedEvents();
  const targets = events
    .filter((event) => force || !event.entities)
    .slice(0, limit && limit > 0 ? limit : undefined);
  if (targets.length === 0) {
    console.log("all stored events already have entities; nothing to do (use --force to redo)");
    return;
  }

  console.log(`extracting entities for ${targets.length}/${events.length} stored events`);

  const bySlug = new Map(events.map((event) => [event.slug, event]));
  let done = 0;
  let filled = 0;
  let cursor = 0;

  const workers = Array.from({ length: Math.min(CONCURRENCY, targets.length) }, async () => {
    while (cursor < targets.length) {
      const index = cursor;
      cursor += 1;
      const event = targets[index];
      const entities = await extractNamedEntities({
        title: event.title,
        abstract: event.summary,
      });
      done += 1;
      if (entities) {
        filled += 1;
        bySlug.set(event.slug, { ...event, entities });
      }
      console.log(`[${done}/${targets.length}] ${event.slug} -> ${entities ? summarise(entities) : "(none)"}`);
    }
  });
  await Promise.all(workers);

  if (done > 0 && filled > 0) {
    const next: ResearchEvent[] = events.map((event) => bySlug.get(event.slug) ?? event);
    fs.writeFileSync(INGESTED_FILE, JSON.stringify(next, null, 2), "utf8");
  }
  console.log(`\nDone: ${filled}/${done} events gained entities.`);
}

function summarise(entities: NonNullable<ResearchEvent["entities"]>): string {
  return (["people", "institutions", "projects", "systems"] as const)
    .flatMap((group) => (entities[group] ?? []).map((name) => `${group[0]}:${name}`))
    .join(", ");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
