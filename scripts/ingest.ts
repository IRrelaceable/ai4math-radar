import { loadEnv } from "./env";
import fs from "node:fs";
import path from "node:path";
import { runPipeline } from "@/agents/researchTracker/tracker";
import { getStore } from "@/lib/db";
import {
  appendIngestedEvents,
  readIngestedFingerprints,
  writeIngestedFingerprints,
} from "@/lib/db/ingested";
import { backoffMs, readSourceStatuses, updateSourceStatus } from "@/lib/db/sourceStatus";
import { getLiveResearchSources, type ResearchSource } from "@/lib/sources";
import { writeStaticData } from "@/lib/buildDataset";
import { linkIncomingEvents } from "@/lib/tracking";
import { missingChineseCardFields } from "@/lib/i18n/quality";
import { observeTrackingRelations } from "@/lib/relation-shadow";

/**
 * Run the ingest pipeline outside Next.
 *
 * The site is a static export, so there is no API route to click: this script
 * is the sync. It is what the scheduled GitHub Actions job runs, and it is
 * also the local equivalent of the old /sources buttons.
 *
 *   npm run sync                          # every registered live source
 *   npm run sync -- --source=arxiv        # one source (repeatable)
 *   npm run sync -- --source=arxiv --since=2026-09-01 --limit=100
 *   npm run sync -- --dry                 # fetch + classify, persist nothing
 *   npm run sync -- --all --force        # ignore failure backoff, retry all sources
 *   npm run sync:shadow                   # sync all sources and log rule-only comparisons
 *   npm run sync -- --source=arxiv --shadow --dry  # write the observation report only
 *
 * Without `--since`, each source resumes from the cursor stored by its last
 * successful run.
 */
/**
 * Large enough to cover a multi-week source outage in one catch-up run: the
 * arXiv adapter pages 200 records at a time, and a month of the AI4Math query
 * is roughly 850 records. A smaller default would truncate the gap and then
 * advance the cursor past the records it never fetched.
 */
const DEFAULT_LIMIT = 600;

interface Options {
  all: boolean;
  sources: string[];
  since?: string;
  limit: number;
  dry: boolean;
  force: boolean;
  shadow: boolean;
}

function parseArgs(argv: string[]): Options {
  const options: Options = { all: false, sources: [], limit: DEFAULT_LIMIT, dry: false, force: false, shadow: false };
  for (const arg of argv) {
    if (arg === "--all") options.all = true;
    else if (arg === "--dry") options.dry = true;
    else if (arg === "--force") options.force = true;
    else if (arg === "--shadow") options.shadow = true;
    else if (arg.startsWith("--source=")) options.sources.push(arg.slice("--source=".length));
    else if (arg.startsWith("--since=")) options.since = arg.slice("--since=".length);
    else if (arg.startsWith("--limit=")) {
      const value = Number.parseInt(arg.slice("--limit=".length), 10);
      if (Number.isFinite(value) && value > 0) options.limit = value;
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  if (options.since && !/^\d{4}-\d{2}-\d{2}$/.test(options.since)) {
    throw new Error("--since must be YYYY-MM-DD");
  }
  return options;
}

async function main() {
  loadEnv();
  const options = parseArgs(process.argv.slice(2));
  const registry = getLiveResearchSources();

  const selected: ResearchSource[] = options.all
    ? Object.values(registry)
    : options.sources.map((id) => {
        const source = registry[id];
        if (!source) {
          throw new Error(
            `unknown source "${id}"; available: ${Object.keys(registry).join(", ")}`
          );
        }
        return source;
      });

  if (selected.length === 0) {
    console.log(`Usage: npm run sync -- [--all | --source=<id> ...] [--since=YYYY-MM-DD] [--limit=N] [--dry] [--force] [--shadow]`);
    console.log(`Available sources: ${Object.keys(registry).join(", ")}`);
    return;
  }

  const shadowPath = options.shadow
    ? path.join(".cache", "relation-shadow", `${new Date().toISOString().replace(/[:.]/g, "-")}-${process.pid}.jsonl`)
    : undefined;
  function logShadow(entry: object) {
    if (!shadowPath) return;
    try {
      fs.mkdirSync(path.dirname(shadowPath), { recursive: true });
      fs.appendFileSync(shadowPath, JSON.stringify(entry) + "\n", "utf8");
    } catch (error) {
      console.warn(`[shadow] report write failed: ${String(error)}`);
    }
  }
  if (shadowPath) console.log(`[shadow] rule-only report: ${path.resolve(shadowPath)}`);
  logShadow({ type: "run", date: new Date().toISOString(), mode: "rules-only", dry: options.dry, sources: selected.map((source) => source.id) });

  const statuses = readSourceStatuses();
  // Seed/stored events already own their slugs; a record that shares a headline
  // gets a hashed suffix instead of replacing the existing event.
  const existingRecords = await getStore().listEvents();
  const existingUrls = new Map(existingRecords.map((e) => [e.slug, e.sourceUrl]));

  let added = 0;
  let updated = 0;
  let failed = 0;
  let skipped = 0;
  // A manually selected source, a dry run and --force are explicit retries;
  // only the scheduled full sweep honours the cooldown.
  const applyBackoff = !options.dry && !options.force && options.sources.length === 0;

  for (const [index, source] of selected.entries()) {
    const previous = statuses[source.id];
    const since = options.since ?? previous?.cursor;
    const startedAt = new Date().toISOString();

    if (applyBackoff) {
      const failures =
        previous?.consecutiveFailures ?? (previous?.status === "error" ? 1 : 0);
      const waitMs = backoffMs(failures);
      const lastAttempt = previous?.lastAttemptAt
        ? Date.parse(previous.lastAttemptAt)
        : Number.NaN;
      const elapsedMs = Number.isFinite(lastAttempt)
        ? Date.now() - lastAttempt
        : Number.POSITIVE_INFINITY;
      if (waitMs > 0 && elapsedMs < waitMs) {
        skipped += 1;
        logShadow({ type: "source", source: source.id, status: "cooldown", since });
        console.log(
          `[${index + 1}/${selected.length}] ${source.id} skipped: ${failures} consecutive ` +
            `failure(s), retry in ${Math.ceil((waitMs - elapsedMs) / 60_000)} min (--force overrides)`
        );
        continue;
      }
    }

    console.log(
      `[${index + 1}/${selected.length}] ${source.id}${since ? ` since ${since}` : ""}`
    );

    let observations: Awaited<ReturnType<typeof observeTrackingRelations>> | undefined;
    let untranslated: { slug: string; fields: string[] }[] | undefined;
    try {
      const result = await runPipeline(undefined, [source], {
        limit: options.limit,
        since,
        existingFingerprints: options.dry && !options.shadow ? undefined : readIngestedFingerprints(),
        existingUrls,
      });

      // A source record is never overwritten by event matching: a confirmed
      // follow-up receives the same durable event id and becomes another
      // append-only progress step. This makes the scheduled job the one place
      // where source ingestion, event matching and static publication meet.
      const eventLinked =
        result.accepted.length > 0
          ? await linkIncomingEvents(result.accepted, existingRecords)
          : result.accepted;
      if (options.shadow && result.accepted.length > 0) {
        try {
          observations = await observeTrackingRelations(result.accepted, eventLinked, existingRecords);
        } catch (error) {
          logShadow({ type: "observation-error", source: source.id });
          console.warn(`[shadow] evaluation failed for ${source.id}: ${String(error)}`);
        }
      }
      if (!options.dry) {
        untranslated = eventLinked
          .map((event) => ({ slug: event.slug, fields: missingChineseCardFields(event) }))
          .filter((entry) => entry.fields.length > 0);
        if (untranslated.length > 0) {
          throw new Error(
            `Chinese translation incomplete for ${untranslated.length} event(s): ` +
            untranslated.map((entry) => `${entry.slug} (${entry.fields.join(", ")})`).join("; ")
          );
        }
      }
      let persisted: { added: number; updated: number; total: number } | undefined;
      if (!options.dry && eventLinked.length > 0) {
        persisted = appendIngestedEvents(eventLinked);
        writeIngestedFingerprints(result.fingerprints);
        for (const event of eventLinked) {
          existingUrls.set(event.slug, event.sourceUrl);
          existingRecords.push(event);
        }
      }

      const latestDate =
        result.latestSeenDate ?? result.accepted.map((e) => e.date).sort().pop();
      if (!options.dry) {
        updateSourceStatus(source.id, {
          label: source.label,
          status: "success",
          lastAttemptAt: startedAt,
          lastSuccessAt: new Date().toISOString(),
          accepted: result.accepted.length,
          added: persisted?.added ?? 0,
          updated: persisted?.updated ?? 0,
          rejected: result.rejected.length,
          total: persisted?.total,
          ...(latestDate ? { cursor: latestDate } : {}),
        });
      }

      added += persisted?.added ?? 0;
      updated += persisted?.updated ?? 0;
      logShadow({ type: "source", source: source.id, status: options.dry ? "dry" : "success",
        since, accepted: result.accepted.length, rejected: result.rejected.length,
        added: persisted?.added ?? 0, updated: persisted?.updated ?? 0, observations });
      console.log(
        `  accepted ${result.accepted.length}, rejected ${result.rejected.length}` +
          (persisted
            ? `, stored +${persisted.added} ~${persisted.updated}`
            : options.dry
              ? " (dry run)"
              : " (nothing stored)")
      );
    } catch (error) {
      failed += 1;
      logShadow({ type: "source", source: source.id, status: "error", since,
        ...((untranslated?.length ?? 0) > 0 && { untranslated }), observations });
      console.error(`  failed: ${String(error)}`);
      if (!options.dry) {
        updateSourceStatus(source.id, {
          label: source.label,
          status: "error",
          lastAttemptAt: startedAt,
          lastError: String(error),
        });
      }
    }
  }

  console.log(
    `\nDone: +${added} new, ~${updated} updated, ${failed} source(s) failed, ${skipped} cooled down.`
  );
  logShadow({ type: "summary", added, updated, failed, skipped });

  if (!options.dry) {
    const rows = await writeStaticData();
    for (const row of rows) {
      console.log(`[data] ${row.lang}: ${row.events} events, ${row.kb} KB`);
    }
  }

  // A partial failure still updates the site; a total failure should be red in CI.
  // Cooled-down sources are known-bad, so they count on the failed side.
  if (failed > 0 && failed + skipped === selected.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
