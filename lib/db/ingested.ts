import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import type { RawResearchItem, ResearchEvent } from "@/types";

/**
 * File-backed cache for pipeline output (V2).
 *
 * The MVP deliberately has no required database, so accepted events from live
 * sources are persisted as JSON and merged into the seed store. Set DATABASE_URL
 * to move this responsibility to PostgreSQL instead.
 */
export const INGESTED_DIR = path.join(process.cwd(), "data", "ingested");
export const INGESTED_FILE = path.join(INGESTED_DIR, "events.json");
const FINGERPRINT_FILE = path.join(INGESTED_DIR, "fingerprints.json");

export function readIngestedEvents(): ResearchEvent[] {
  try {
    const raw = fs.readFileSync(INGESTED_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ResearchEvent[]) : [];
  } catch {
    return [];
  }
}

/**
 * Content fingerprint of the *source* item, not of the event.
 *
 * Summarization is the expensive step (an LLM call per accepted item), so it
 * must be skipped when a slug is already stored and its source text has not
 * changed. The event's own summary is LLM-rewritten, so it cannot be used to
 * tell whether the source moved on — hash the raw title + abstract instead.
 */
export function fingerprintItem(item: RawResearchItem): string {
  const canonical = `${item.title.trim()}\n\n${item.abstract?.trim() ?? ""}`;
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

/**
 * slug -> source fingerprint for every event persisted so far. Used by the
 * pipeline to decide whether an already-stored slug needs re-summarizing.
 */
export function readIngestedFingerprints(): Map<string, string> {
  try {
    const raw = fs.readFileSync(FINGERPRINT_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return new Map(
        Object.entries(parsed as Record<string, string>).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string"
        )
      );
    }
    return new Map();
  } catch {
    return new Map();
  }
}

/** Record fingerprints for the items that were actually persisted. */
export function writeIngestedFingerprints(entries: Iterable<[string, string]>): void {
  const merged = readIngestedFingerprints();
  for (const [slug, fp] of entries) merged.set(slug, fp);
  fs.mkdirSync(INGESTED_DIR, { recursive: true });
  fs.writeFileSync(
    FINGERPRINT_FILE,
    JSON.stringify(Object.fromEntries(merged), null, 2),
    "utf8"
  );
}

/** Merge by slug: newer content wins, the original createdAt is preserved. */
export function appendIngestedEvents(events: ResearchEvent[]): {
  added: number;
  updated: number;
  total: number;
} {
  fs.mkdirSync(INGESTED_DIR, { recursive: true });
  const existing = readIngestedEvents();
  const bySlug = new Map(existing.map((e) => [e.slug, e]));

  let added = 0;
  let updated = 0;
  for (const event of events) {
    const previous = bySlug.get(event.slug);
    if (previous) updated += 1;
    else added += 1;
    bySlug.set(event.slug, {
      ...event,
      reviewStatus: previous?.reviewStatus ?? event.reviewStatus ?? "pending",
      createdAt: previous?.createdAt ?? event.createdAt,
      updatedAt: event.updatedAt,
    });
  }

  const next = [...bySlug.values()].sort((a, b) => b.date.localeCompare(a.date));
  fs.writeFileSync(INGESTED_FILE, JSON.stringify(next, null, 2), "utf8");
  return { added, updated, total: next.length };
}
