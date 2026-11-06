import fs from "node:fs";
import path from "node:path";
import type { ResearchEvent } from "@/types";
import { extractContribution } from "@/agents/researchTracker/contribution";

/**
 * One-off/repair tool: give already-stored Research events their AI role and
 * human contribution. New events get both during ingest, so this only fills
 * events written before the extractor was wired into the pipeline.
 *
 * The stored event keeps only the generated summary, so it is the source text
 * for this backfill — the extractor may only repeat facts it states.
 *
 *   npx tsx scripts/backfill-ai-role.ts [--dry] [--force] [--limit=5]
 */
const CONCURRENCY = 3;

/** Drop the summarizer's editorial framing before asking for attribution. */
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

/** Restrict a retry run to the slugs that previously returned no attribution. */
function parseOnly(): Set<string> | undefined {
  const arg = process.argv.find((value) => value.startsWith("--only="));
  if (!arg) return undefined;
  return new Set(arg.slice("--only=".length).split(",").filter(Boolean));
}

async function main() {
  loadEnv();
  const dry = process.argv.includes("--dry");
  const force = process.argv.includes("--force");
  const limit = parseLimit();
  const only = parseOnly();
  const file = path.join(process.cwd(), "data", "ingested", "events.json");
  const events = JSON.parse(fs.readFileSync(file, "utf8")) as ResearchEvent[];

  const research = events.filter(
    (event) =>
      event.provenance === "automated" &&
      (event.eventType === undefined || event.eventType === "Research")
  );
  const targets = (force ? research : research.filter((event) => !event.aiRole))
    .filter((event) => !only || only.has(event.slug))
    .slice(0, limit ?? Number.MAX_SAFE_INTEGER);
  console.log(`${targets.length} of ${research.length} Research events need AI attribution`);

  if (dry) {
    console.log("dry run — nothing requested, nothing written");
    for (const event of targets) console.log("  would process:", event.slug);
    return;
  }

  const write = () => {
    const temp = `${file}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(events, null, 2), "utf8");
    fs.renameSync(temp, file);
  };

  const levels: Record<string, number> = {};
  let enOnly = 0;
  let processed = 0;
  const queue = [...targets];

  async function worker(): Promise<void> {
    for (;;) {
      const event = queue.shift();
      if (!event) return;
      processed += 1;
      try {
        const text = sourceText(event.summary);
        const contribution = text
          ? await extractContribution({
              title: event.title,
              abstract: text,
              source: event.sourceUrl,
            })
          : undefined;
        if (!contribution) {
          levels.failed = (levels.failed ?? 0) + 1;
          console.log("no attribution:", event.slug);
        } else if (contribution.en.level === "not_applicable") {
          levels.not_applicable = (levels.not_applicable ?? 0) + 1;
          // A forced re-run can overturn an earlier attribution; keeping it
          // would leave a level the extractor no longer supports.
          if (force && (event.aiRole || event.humanContribution)) {
            delete event.aiRole;
            delete event.humanContribution;
            if (event.translations?.zh) {
              delete event.translations.zh.aiRoleDescription;
              delete event.translations.zh.humanContribution;
            }
            event.updatedAt = new Date().toISOString();
            write();
          }
        } else {
          const { level, description, humanContribution } = contribution.en;
          event.aiRole = description ? { level, description } : { level };
          event.humanContribution = humanContribution;
          event.translations = {
            ...event.translations,
            zh: {
              ...event.translations?.zh,
              aiRoleDescription: contribution.zh?.description,
              humanContribution: contribution.zh?.humanContribution,
            },
          };
          event.updatedAt = new Date().toISOString();
          levels[level] = (levels[level] ?? 0) + 1;
          if (description && !contribution.zh?.description) {
            enOnly += 1;
            console.log("missing zh attribution:", event.slug);
          }
          write();
        }
      } catch (error) {
        levels.failed = (levels.failed ?? 0) + 1;
        console.log("failed:", event.slug, String(error).slice(0, 160));
      }
      if (processed % 10 === 0) {
        console.log(`progress ${processed}/${targets.length}`, levels);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  write();
  console.log("done", levels, "en-only", enOnly);
}

main();
