import fs from "node:fs";
import path from "node:path";
import type { ResearchEvent } from "@/types";
import { OFFICIAL_SOURCE_DEFINITIONS, createOfficialSource } from "@/lib/sources/catalog";
import { readCustomSources } from "@/lib/sources/custom";

/**
 * One-off/repair tool: fill `authors` on already-stored automated events.
 *
 * The RSS adapter learned to read <dc:creator> / Atom <author> after the news
 * and blog events were stored, and a re-sync skips unchanged items (identical
 * title + abstract) before they reach the store. So those events keep an empty
 * author list until this script copies the byline from the live feed. Only real
 * bylines are copied — the parser drops desk labels like "MIT News".
 *
 *   npx tsx scripts/backfill-authors.ts [--dry]
 */

const CONCURRENCY = 6;
const PER_FEED = 120;

function normalizeUrl(url: string): string {
  return url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[#?].*$/, "")
    .replace(/\/+$/, "");
}

async function main() {
  const dry = process.argv.includes("--dry");
  const file = path.join(process.cwd(), "data", "ingested", "events.json");
  const events = JSON.parse(fs.readFileSync(file, "utf8")) as ResearchEvent[];
  const targets = events.filter(
    (event) => (event.authors?.length ?? 0) === 0 && event.sourceUrl
  );
  console.log(`${targets.length} of ${events.length} events have no authors`);

  const definitions = [...OFFICIAL_SOURCE_DEFINITIONS, ...readCustomSources()].filter(
    (definition) => definition.mode === "rss"
  );
  const byUrl = new Map<string, string[]>();
  const queue = definitions.map(createOfficialSource);
  let failed = 0;

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      while (queue.length > 0) {
        const source = queue.shift()!;
        try {
          const items = await source.fetchRecent({ limit: PER_FEED });
          let withAuthors = 0;
          for (const item of items) {
            if (!item.url || !item.authors?.length) continue;
            const key = normalizeUrl(item.url);
            if (!byUrl.has(key)) byUrl.set(key, item.authors);
            withAuthors += 1;
          }
          console.log(`  ${source.id}: ${items.length} items, ${withAuthors} with bylines`);
        } catch (error) {
          failed += 1;
          console.warn(`  ${source.id}: ${(error as Error).message}`);
        }
      }
    })
  );

  let filled = 0;
  for (const event of targets) {
    const authors = byUrl.get(normalizeUrl(event.sourceUrl!));
    if (!authors?.length) continue;
    event.authors = authors;
    event.updatedAt = new Date().toISOString();
    filled += 1;
    console.log(`+ ${event.slug} -> ${authors.join(", ")}`);
  }

  if (!dry && filled > 0) {
    fs.writeFileSync(file, JSON.stringify(events, null, 2), "utf8");
  }
  console.log(`${filled} events filled, ${failed} feeds failed${dry ? " (dry run)" : ""}`);
}

void main();
