import fs from "node:fs";
import path from "node:path";
import { liveResearchSources } from "@/lib/sources";
import { getStore } from "@/lib/db";

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
 * Persist one manual source attempt. The file is intentionally local and
 * git-ignored: it describes this machine's sync history, not project content.
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
 * Source registry + statuses + exact pending-review count.
 *
 * Single source of truth for `app/sources/page.tsx` and `GET /api/sources` so
 * the two can never drift. The pending count calls `listEvents()` with no
 * limit — both stores return the complete list when `limit` is undefined, so
 * the count stays exact past any page size.
 */
export async function loadSourceOverview(): Promise<{
  sources: SourceView[];
  pending: number;
}> {
  const statuses = readSourceStatuses();
  const events = await getStore().listEvents();
  const pending = events.filter((event) => event.reviewStatus === "pending").length;

  const sources: SourceView[] = Object.entries(liveResearchSources).map(([id, source]) => {
    const stored = statuses[id];
    return {
      id,
      label: source.label,
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

  return { sources, pending };
}

