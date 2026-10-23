import fs from "node:fs";
import path from "node:path";
import type { ResearchEvent } from "@/types";

/**
 * File-backed cache for pipeline output (V2).
 *
 * The MVP deliberately has no required database, so accepted events from live
 * sources are persisted as JSON and merged into the seed store. Set DATABASE_URL
 * to move this responsibility to PostgreSQL instead.
 */
export const INGESTED_DIR = path.join(process.cwd(), "data", "ingested");
export const INGESTED_FILE = path.join(INGESTED_DIR, "events.json");

export function readIngestedEvents(): ResearchEvent[] {
  try {
    const raw = fs.readFileSync(INGESTED_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ResearchEvent[]) : [];
  } catch {
    return [];
  }
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
      createdAt: previous?.createdAt ?? event.createdAt,
      updatedAt: event.updatedAt,
    });
  }

  const next = [...bySlug.values()].sort((a, b) => b.date.localeCompare(a.date));
  fs.writeFileSync(INGESTED_FILE, JSON.stringify(next, null, 2), "utf8");
  return { added, updated, total: next.length };
}
