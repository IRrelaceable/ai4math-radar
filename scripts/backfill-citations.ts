import fs from "node:fs";
import { loadEnv } from "./env";
import { readIngestedEvents, INGESTED_FILE } from "@/lib/db/ingested";
import { events as seedEvents } from "@/data/seed/events";
import { arxivIdOf } from "@/lib/utils";
import type { RelatedWork, ResearchEvent } from "@/types";

/**
 * Citation-graph enrichment: OpenAlex reference lists become previous/followup
 * edges between events already tracked on this site.
 *
 *   npm run backfill:citations               # add missing edges only
 *   npm run backfill:citations -- --force    # redo every derived edge
 *   npm run backfill:citations -- --limit=5  # small sample first
 *
 * A citation is a fact stated by the paper itself, so every generated edge is
 * checkable: "previous" means the event's paper lists the target in its
 * reference list, "followup" means the other event's paper cites this one.
 * Only internal targets are linked — a paper the tracker does not cover has
 * no page to wire into the timeline.
 */

const OPENALEX = "https://api.openalex.org";
const UA = "AI4Math-Research-Tracker (https://github.com/; backfill script)";
const BATCH = 50;
const MAX_RETRIES = 4;

/** Distinguishes generated entries from handwritten ones; used by --force. */
const NOTE_PREVIOUS = "Listed in this event's reference list";
const NOTE_FOLLOWUP = "Cites this event's paper";

const RELATION_ORDER: Record<string, number> = { previous: 0, followup: 1, related: 2 };

async function fetchJson(url: string): Promise<any> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok) return res.json();
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= MAX_RETRIES) {
      throw new Error(`OpenAlex ${res.status} for ${url}: ${(await res.text()).slice(0, 200)}`);
    }
    const wait = [5_000, 15_000, 45_000, 120_000][attempt];
    console.log(`  ${res.status} — backing off ${wait / 1000}s (${attempt + 1}/${MAX_RETRIES})`);
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
}

interface ResolvedWork {
  openalexId: string;
  referencedWorkIds: string[];
}

async function resolveBatch(arxivIds: string[]): Promise<Map<string, ResolvedWork>> {
  const dois = arxivIds.map((id) => `10.48550/arXiv.${id}`);
  const url =
    `${OPENALEX}/works?filter=doi:${dois.join("|")}` +
    `&select=id,doi,referenced_works&per-page=100`;
  const json = await fetchJson(url);
  const out = new Map<string, ResolvedWork>();
  for (const work of json.results ?? []) {
    const id = arxivIdOf(work.doi);
    if (id) out.set(id, { openalexId: work.id, referencedWorkIds: work.referenced_works ?? [] });
  }
  return out;
}

async function main() {
  loadEnv();
  const argv = process.argv.slice(2);
  const force = argv.includes("--force");
  const limitArg = argv.find((arg) => arg.startsWith("--limit="));
  const limit = limitArg ? Number.parseInt(limitArg.slice("--limit=".length), 10) : undefined;

  const ingested = readIngestedEvents();
  const targets = ingested
    .map((event, index) => ({ event, index, arxivId: arxivIdOf(event.paperUrl ?? event.sourceUrl) }))
    .filter(
      (entry): entry is { event: ResearchEvent; index: number; arxivId: string } =>
        Boolean(entry.arxivId)
    )
    .slice(0, limit && limit > 0 ? limit : undefined);

  console.log(
    `citation backfill: ${targets.length}/${ingested.length} stored events have an arXiv id`
  );

  // Every tracked event can be a link target, seed included, so all of them
  // resolve against OpenAlex; only stored events get written to (seed records
  // live in TypeScript source and gain reverse edges at render time).
  const allEvents: ResearchEvent[] = [...seedEvents, ...ingested];
  const ingestedIndexBySlug = new Map<string, number>();
  ingested.forEach((event, index) => ingestedIndexBySlug.set(event.slug, index));

  const resolved = new Map<string, ResolvedWork>();
  const ids = [...new Set(allEvents.map((e) => arxivIdOf(e.paperUrl ?? e.sourceUrl)).filter((id): id is string => Boolean(id)))];
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = await resolveBatch(ids.slice(i, i + BATCH));
    for (const [id, work] of batch) resolved.set(id, work);
    console.log(`resolved ${resolved.size}/${ids.length} works in OpenAlex`);
    if (i + BATCH < ids.length) await new Promise((r) => setTimeout(r, 300));
  }

  const byOpenAlex = new Map<string, ResearchEvent>();
  for (const event of allEvents) {
    const id = arxivIdOf(event.paperUrl ?? event.sourceUrl);
    const work = id ? resolved.get(id) : undefined;
    if (work) byOpenAlex.set(work.openalexId, event);
  }

  // One pass over reference lists yields both directions: F cites T means
  // previous on F and followup on T.
  const additions = new Map<number, RelatedWork[]>();
  let edges = 0;
  const add = (index: number, entry: RelatedWork) => {
    const list = additions.get(index) ?? [];
    if (list.some((e) => e.relation === entry.relation && e.url === entry.url)) return;
    list.push(entry);
    additions.set(index, list);
  };

  for (const { event, index, arxivId } of targets) {
    const work = resolved.get(arxivId);
    if (!work) continue;
    for (const refId of work.referencedWorkIds) {
      const cited = byOpenAlex.get(refId);
      if (!cited || cited.slug === event.slug) continue;
      edges += 1;
      add(index, {
        title: cited.title,
        url: `/research/${cited.slug}`,
        relation: "previous",
        note: NOTE_PREVIOUS,
      });
      // The reverse edge is written only when the cited event is a stored one;
      // seed records get it at render time from the detail page.
      const citedIndex = ingestedIndexBySlug.get(cited.slug);
      if (citedIndex !== undefined) {
        add(citedIndex, {
          title: event.title,
          url: `/research/${event.slug}`,
          relation: "followup",
          note: NOTE_FOLLOWUP,
        });
      }
    }
  }

  let dirty = false;
  if (force) {
    // --force is a redo, not an erase: handwritten entries stay untouched.
    for (const [index, event] of ingested.entries()) {
      const kept = event.relatedWorks.filter(
        (work) => work.note !== NOTE_PREVIOUS && work.note !== NOTE_FOLLOWUP
      );
      if (kept.length !== event.relatedWorks.length) {
        ingested[index] = { ...event, relatedWorks: kept };
        dirty = true;
      }
    }
    console.log("force: removed previously generated edges before re-adding");
  }

  let changed = 0;
  for (const [index, entries] of additions) {
    if (entries.length === 0) continue;
    const event = ingested[index];
    const existing = new Set(event.relatedWorks.map((w) => `${w.relation}|${w.url}`));
    const fresh = entries.filter((entry) => !existing.has(`${entry.relation}|${entry.url}`));
    if (fresh.length === 0) continue;
    const merged = [...event.relatedWorks, ...fresh].sort(
      (a, b) => RELATION_ORDER[a.relation] - RELATION_ORDER[b.relation] || a.title.localeCompare(b.title)
    );
    ingested[index] = { ...event, relatedWorks: merged };
    changed += 1;
    dirty = true;
  }

  if (dirty) {
    fs.writeFileSync(INGESTED_FILE, JSON.stringify(ingested, null, 2), "utf8");
  }

  const withPrevious = ingested.filter((e) =>
    e.relatedWorks.some((w) => w.relation === "previous")
  ).length;
  const withFollowup = ingested.filter((e) =>
    e.relatedWorks.some((w) => w.relation === "followup")
  ).length;
  console.log(
    `\nDone: ${edges} citation edges, ${changed} events updated. ` +
      `Stored events with previous: ${withPrevious}, with followup: ${withFollowup}.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
