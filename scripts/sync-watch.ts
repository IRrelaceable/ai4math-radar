import { loadEnv } from "./env";
import { SeedStore } from "@/lib/db/seedStore";
import { appendIngestedEvents } from "@/lib/db/ingested";
import { writeStaticData } from "@/lib/buildDataset";
import { eventIdOf, eventLinkOf } from "@/lib/tracking";
import {
  detectWatchChanges,
  judgeWatchChange,
  watchChangeToEvent,
  type WatchTarget,
} from "@/lib/watch";
import { readWatchState, readWatchTargets, writeWatchState } from "@/lib/watch/store";
import { missingChineseCardFields } from "@/lib/i18n/quality";
import type { ResearchEvent } from "@/types";

/**
 * Automatic watch sync: monitor the configured source documents, ask the LLM
 * whether each dated section is a genuine development of its bound Event, and
 * append accepted changes as progress steps to that Event.
 *
 *   npm run sync:watch            # detect + judge + persist + rebuild data
 *   npm run sync:watch -- --dry   # detect + judge, print decisions, write nothing
 *
 * A section is acknowledged after a clear rejection or after its bilingual
 * record has been saved and the datasets rebuilt. Other decisions are retried.
 */

interface Options {
  dry: boolean;
}

function parseArgs(argv: string[]): Options {
  const options: Options = { dry: false };
  for (const arg of argv) {
    if (arg === "--dry") options.dry = true;
    else throw new Error(`unknown argument: ${arg}`);
  }
  return options;
}

/** The canonical (initial) source record of an Event line, for LLM context. */
function contextFor(target: WatchTarget, all: ResearchEvent[]) {
  const members = all.filter((event) => eventIdOf(event) === target.eventId);
  return members.find((event) => (eventLinkOf(event)?.kind ?? "initial") === "initial");
}

async function main() {
  loadEnv();
  const options = parseArgs(process.argv.slice(2));
  const configured = readWatchTargets();
  const allEvents = await new SeedStore().listEvents();
  const byTarget = new Map(configured.flatMap((target) => {
    const context = contextFor(target, allEvents);
    if (context) return [[target.id, { target, context }] as const];
    console.log(`[watch] ${target.id}: no initial record for Event ${target.eventId}`);
    return [];
  }));
  const targets = [...byTarget.values()].map(({ target }) => target);
  if (targets.length === 0) {
    console.log("No enabled watch targets in data/watch/targets.json.");
    return;
  }

  const state = readWatchState();
  const { changes, nextState, trace } = await detectWatchChanges(targets, state);
  for (const line of trace) console.log(`[watch] ${line}`);
  // Save before judging so a restart can resume even if the source changes.
  if (!options.dry && JSON.stringify(state) !== JSON.stringify(nextState)) {
    writeWatchState(nextState);
  }

  const existing = new Set(allEvents.map((event) => event.slug));
  const accepted: ResearchEvent[] = [];
  const completed = new Set<string>();
  let rebuild = false;
  let skipped = 0;

  for (const change of changes) {
    const source = byTarget.get(change.targetId);
    if (!source) continue;
    const { target, context } = source;
    if (existing.has(`watch-${change.id}`)) {
      completed.add(change.id);
      rebuild = true;
      continue;
    }
    const decision = await judgeWatchChange(change, target, context);
    if (decision.status === "retry") {
      console.warn(`[watch] ${change.id}: pending retry (${decision.reason})`);
      continue;
    }
    const { verdict } = decision;
    if (!verdict.belongs || !verdict.kind) {
      console.log(
        `[watch] ${change.id}: not a development (${verdict.reason ?? "no reason"}); skipped`
      );
      skipped += 1;
      completed.add(change.id);
      continue;
    }
    const event = watchChangeToEvent(change, target, verdict);
    const missing = missingChineseCardFields(event);
    if (missing.length > 0) {
      console.warn(`[watch] ${change.id}: pending retry (incomplete Chinese: ${missing.join(", ")})`);
      continue;
    }
    console.log(
      `[watch] ${change.id}: ${verdict.kind} -> ${target.eventId} (${verdict.title ?? event.title})`
    );
    accepted.push(event);
    completed.add(change.id);
  }

  const pending = changes.length - completed.size;
  if (options.dry) {
    console.log(
      `\nDry run: ${accepted.length} would be appended, ${skipped} rejected, ${pending} pending. Nothing written.`
    );
    return;
  }

  if (accepted.length > 0) {
    const result = appendIngestedEvents(accepted);
    console.log(`\nStored +${result.added} ~${result.updated} watch update(s).`);
    rebuild = true;
  }
  if (rebuild) {
    const rows = await writeStaticData();
    for (const row of rows) {
      console.log(`[data] ${row.lang}: ${row.events} events, ${row.kb} KB`);
    }
  }
  if (completed.size > 0) {
    for (const target of targets) {
      const entry = nextState[target.id];
      if (entry?.pending) entry.pending = entry.pending.filter((change) => !completed.has(change.id));
    }
    writeWatchState(nextState);
  }
  console.log(`Done: ${accepted.length} appended, ${skipped} rejected, ${pending} pending.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
