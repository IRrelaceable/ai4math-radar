import fs from "node:fs";
import path from "node:path";
import type { ResearchEvent } from "@/types";
import { extractEcosystemMetadata } from "@/agents/researchTracker/metadata";

/**
 * One-off/repair tool: give already-stored ecosystem events their structured
 * metadata (people, initiatives, funding, policy) plus the Chinese overlay.
 * New events get this during ingest, so this only fills events written before
 * the extractor existed.
 *
 * The stored event keeps only the generated summary, so it is the source text
 * for this backfill — the extractor may only repeat facts it states.
 *
 *   npx tsx scripts/backfill-metadata.ts [--dry] [--force] [--limit=5]
 */
const CONCURRENCY = 3;

/**
 * Stored summaries mix source facts with the summarizer's editorial framing
 * ("the item is classified as …", "no abstract was supplied"). The extractor
 * may only repeat source facts, so those sentences are removed first.
 */
const EDITORIAL =
  /classified|AI4Math|AI-assisted research|tracking (platform|record)|supplied metadata|this item|the item|this record|the record|research area|no abstract|not a research paper|the tracker|sub-area/i;

function sourceText(summary: string): string | undefined {
  const kept = summary
    .split(/(?<=[.!?。])\s+/)
    .filter((sentence) => !EDITORIAL.test(sentence))
    .join(" ")
    .trim();
  return kept || undefined;
}

function loadEnv(): void {
  const file = path.join(process.cwd(), ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    const value = match[2].replace(/^["']|["']$/g, "");
    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
}

function parseLimit(): number | undefined {
  const arg = process.argv.find((value) => value.startsWith("--limit="));
  if (!arg) return undefined;
  const limit = Number(arg.slice("--limit=".length));
  return Number.isInteger(limit) && limit > 0 ? limit : undefined;
}

async function main() {
  loadEnv();
  const dry = process.argv.includes("--dry");
  const force = process.argv.includes("--force");
  const limit = parseLimit();
  const file = path.join(process.cwd(), "data", "ingested", "events.json");
  const events = JSON.parse(fs.readFileSync(file, "utf8")) as ResearchEvent[];

  const ecosystem = events.filter(
    (event) =>
      event.provenance === "automated" &&
      event.eventType &&
      event.eventType !== "Research"
  );
  const targets = (force ? ecosystem : ecosystem.filter((event) => !event.metadata)).slice(
    0,
    limit ?? Number.MAX_SAFE_INTEGER
  );

  const byType = targets.reduce<Record<string, number>>((acc, event) => {
    const key = event.eventType ?? "none";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`${targets.length} of ${ecosystem.length} ecosystem events need metadata`, byType);

  if (dry) {
    console.log("dry run — nothing requested, nothing written");
    return;
  }

  const write = () => {
    const temp = `${file}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(events, null, 2), "utf8");
    fs.renameSync(temp, file);
  };

  let filled = 0;
  let empty = 0;
  let processed = 0;
  const queue = [...targets];

  async function worker(): Promise<void> {
    for (;;) {
      const event = queue.shift();
      if (!event) return;
      processed += 1;
      try {
        const metadata = await extractEcosystemMetadata(
          {
            title: event.title,
            abstract: sourceText(event.summary),
            source: event.sourceUrl,
          },
          event.eventType ?? "Research"
        );
        if (metadata) {
          event.metadata = metadata.en;
          if (metadata.zh) {
            event.translations = {
              ...event.translations,
              zh: { ...event.translations?.zh, metadata: metadata.zh },
            };
          }
          event.updatedAt = new Date().toISOString();
          filled += 1;
          write();
        } else {
          empty += 1;
          console.log("no metadata stated:", event.slug);
        }
      } catch (error) {
        empty += 1;
        console.log("failed:", event.slug, String(error).slice(0, 160));
      }
      if (processed % 10 === 0) {
        console.log(`progress ${processed}/${targets.length} (filled ${filled})`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  write();
  console.log(`filled ${filled}, empty/failed ${empty}`);
}

main();
