import fs from "node:fs";
import path from "node:path";
import type { ResearchEvent } from "@/types";
import { translateToChinese } from "@/agents/researchTracker/summarizer";

/**
 * One-off/repair tool: give already-stored automated events their Chinese
 * translation. New events get one during ingest, so this only fills events
 * written before translations existed or whose translation call failed.
 *
 *   npx tsx scripts/backfill-translations.ts
 */
const CONCURRENCY = 4;

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

async function main() {
  loadEnv();
  const file = path.join(process.cwd(), "data", "ingested", "events.json");
  const events = JSON.parse(fs.readFileSync(file, "utf8")) as ResearchEvent[];
  const force = process.argv.includes("--force");
  const targets = force
    ? events
    : events.filter(
        (event) => !event.translations?.zh?.title || !event.translations?.zh?.summary
      );
  console.log(`${targets.length} of ${events.length} events need a Chinese translation`);

  let translated = 0;
  let failed = 0;
  const queue = [...targets];

  async function worker(): Promise<void> {
    for (;;) {
      const event = queue.shift();
      if (!event) return;
      try {
        const zh = await translateToChinese({
          title: event.title,
          summary: event.summary,
          significance: event.significance,
        });
        if (zh.title && zh.summary) {
          event.translations = {
            zh: { title: zh.title, summary: zh.summary, significance: zh.significance },
          };
          translated += 1;
        } else {
          failed += 1;
          console.log("empty translation:", event.slug);
        }
      } catch (error) {
        failed += 1;
        console.log("failed:", event.slug, String(error).slice(0, 120));
      }
      fs.writeFileSync(file, JSON.stringify(events, null, 2));
      if ((translated + failed) % 10 === 0) {
        console.log(`progress ${translated + failed}/${targets.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`translated ${translated}, failed ${failed}`);
}

main();
