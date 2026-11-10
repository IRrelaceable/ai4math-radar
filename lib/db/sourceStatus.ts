import fs from "node:fs";
import path from "node:path";
import type { EventType, SourceTier } from "@/types";
import { EVENT_TYPES } from "@/types";
import { getLiveResearchSources } from "@/lib/sources";

export const SOURCE_STATUS_DIR = path.join(process.cwd(), "data", "ingested");
export const SOURCE_STATUS_FILE = path.join(SOURCE_STATUS_DIR, "source-status.json");

export type SourceSyncState = "idle" | "success" | "error";

export interface SourceSyncStatus {
  id: string;
  label: string;
  status: SourceSyncState;
  lastAttemptAt?: string;
  lastSuccessAt?: string;
  lastError?: string;
  cursor?: string;
  accepted?: number;
  added?: number;
  updated?: number;
  rejected?: number;
  total?: number;
}

export function readSourceStatuses(): Record<string, SourceSyncStatus> {
  try {
    const parsed = JSON.parse(fs.readFileSync(SOURCE_STATUS_FILE, "utf8")) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, SourceSyncStatus>;
  } catch {
    return {};
  }
}

/**
 * Persist one sync attempt. The file is committed with the ingested events so
 * a GitHub Actions run resumes cursors where the previous one stopped, and so
 * a local sync shows the same history as the deployed build.
 */
export function updateSourceStatus(
  id: string,
  patch: Partial<Omit<SourceSyncStatus, "id">> & { label?: string }
): SourceSyncStatus {
  const existing = readSourceStatuses()[id];
  const next = {
    ...existing,
    ...patch,
    id,
    label: patch.label ?? existing?.label ?? id,
    status: patch.status ?? existing?.status ?? "idle",
  } as SourceSyncStatus;
  // A successful run supersedes the previous failure; a stale message on the
  // sources page made a recovered feed look broken.
  if (next.status === "success" && patch.lastError === undefined) {
    delete next.lastError;
  }

  const current = readSourceStatuses();
  current[id] = next;
  fs.mkdirSync(SOURCE_STATUS_DIR, { recursive: true });
  fs.writeFileSync(SOURCE_STATUS_FILE, JSON.stringify(current, null, 2), "utf8");
  return next;
}

/** Registry entry merged with this machine's persisted sync history. */
export interface SourceView {
  id: string;
  label: string;
  category: EventType;
  /** Editorial evidence tier; shown as the per-source S0–S4 label. */
  sourceTier: SourceTier;
  status: SourceSyncState;
  lastAttemptAt?: string;
  lastSuccessAt?: string;
  lastError?: string;
  cursor?: string;
  accepted?: number;
  added?: number;
  updated?: number;
  rejected?: number;
  total?: number;
}

/**
 * One sync board: all sources sharing an event class. Grouped by event class
 * rather than by editorial tier so a reader can tell "which sources feed the
 * Funding feed" without understanding S0–S4; the tier survives as a per-source
 * label.
 */
export interface CategoryBoard {
  category: EventType;
  sources: SourceView[];
}

/**
 * Source registry + persisted sync statuses.
 *
 * Single source of truth for the public source registry on `/about` and for
 * the sync script, so the two can never drift.
 *
 * `boards` always contains all five event classes in EVENT_TYPES order, even
 * when a class has no sources, so the sync UI renders a stable five-board
 * layout.
 */
export function loadSourceOverview(): { boards: CategoryBoard[] } {
  const statuses = readSourceStatuses();

  const sources: SourceView[] = Object.entries(getLiveResearchSources()).map(([id, source]) => {
    const stored = statuses[id];
    return {
      id,
      label: source.label,
      category: source.defaultEventType ?? "Research",
      // Every registry source declares a tier; default to official (S1) if a
      // hand-added source forgets one so it still lands on a board.
      sourceTier: source.sourceTier ?? "S1",
      status: stored?.status ?? "idle",
      lastAttemptAt: stored?.lastAttemptAt,
      lastSuccessAt: stored?.lastSuccessAt,
      lastError: stored?.lastError,
      cursor: stored?.cursor,
      accepted: stored?.accepted,
      added: stored?.added,
      updated: stored?.updated,
      rejected: stored?.rejected,
      total: stored?.total,
    };
  });

  const boards: CategoryBoard[] = EVENT_TYPES.map((category) => ({
    category,
    sources: sources.filter((source) => source.category === category),
  }));

  return { boards };
}

