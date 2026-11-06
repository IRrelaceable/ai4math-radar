import { loadEnv } from "./env";
import { runPipeline } from "@/agents/researchTracker/tracker";
import { getStore } from "@/lib/db";
import {
  appendIngestedEvents,
  readIngestedFingerprints,
  writeIngestedFingerprints,
} from "@/lib/db/ingested";
import { readSourceStatuses, updateSourceStatus } from "@/lib/db/sourceStatus";
import { getLiveResearchSources, type ResearchSource } from "@/lib/sources";
import { writeStaticData } from "@/lib/buildDataset";

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
}

function parseArgs(argv: string[]): Options {
  const options: Options = { all: false, sources: [], limit: DEFAULT_LIMIT, dry: false };
  for (const arg of argv) {
    if (arg === "--all") options.all = true;
    else if (arg === "--dry") options.dry = true;
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
    console.log(`Usage: npm run sync -- [--all | --source=<id> ...] [--since=YYYY-MM-DD] [--limit=N] [--dry]`);
    console.log(`Available sources: ${Object.keys(registry).join(", ")}`);
    return;
  }

  const statuses = readSourceStatuses();
  // Seed/stored events already own their slugs; a record that shares a headline
  // gets a hashed suffix instead of replacing the existing event.
  const existingUrls = new Map((await getStore().listEvents()).map((e) => [e.slug, e.sourceUrl]));

  let added = 0;
  let updated = 0;
  let failed = 0;

  for (const [index, source] of selected.entries()) {
    const since = options.since ?? statuses[source.id]?.cursor;
    const startedAt = new Date().toISOString();
    console.log(
      `[${index + 1}/${selected.length}] ${source.id}${since ? ` since ${since}` : ""}`
    );

    try {
      const result = await runPipeline(undefined, [source], {
        limit: options.limit,
        since,
        existingFingerprints: options.dry ? undefined : readIngestedFingerprints(),
        existingUrls,
      });

      let persisted: { added: number; updated: number; total: number } | undefined;
      if (!options.dry && result.accepted.length > 0) {
        persisted = appendIngestedEvents(result.accepted);
        writeIngestedFingerprints(result.fingerprints);
        for (const event of result.accepted) existingUrls.set(event.slug, event.sourceUrl);
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

  console.log(`\nDone: +${added} new, ~${updated} updated, ${failed} source(s) failed.`);

  if (!options.dry) {
    const rows = await writeStaticData();
    for (const row of rows) {
      console.log(`[data] ${row.lang}: ${row.events} events, ${row.kb} KB`);
    }
  }

  // A partial failure still updates the site; a total failure should be red in CI.
  if (failed > 0 && failed === selected.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
