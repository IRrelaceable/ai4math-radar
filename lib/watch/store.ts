import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { WatchState, WatchTarget } from "@/lib/watch";

const WATCH_DIR = path.join(process.cwd(), "data", "watch");
export const WATCH_TARGETS_FILE = path.join(WATCH_DIR, "targets.json");
const WATCH_STATE_FILE = path.join(
  process.cwd(),
  "data",
  "ingested",
  "watch-state.json"
);

/**
 * Watch targets are configuration, kept in data/watch so a new monitoring
 * object is a data edit, not a code change. Each target must point at an
 * Event id that already exists in the archive.
 */
export function readWatchTargets(): WatchTarget[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(WATCH_TARGETS_FILE, "utf8")) as unknown;
    const rows = Array.isArray(parsed) ? parsed : (parsed as { targets?: unknown[] })?.targets;
    if (!Array.isArray(rows)) return [];
    return rows.filter((row): row is WatchTarget => {
      const value = row as Partial<WatchTarget>;
      return Boolean(
        value &&
          typeof value.id === "string" &&
          typeof value.eventId === "string" &&
          typeof value.fetchUrl === "string" &&
          typeof value.sourceUrl === "string" &&
          value.enabled === true
      );
    });
  } catch {
    return [];
  }
}

export function readWatchState(): WatchState {
  try {
    const parsed = JSON.parse(fs.readFileSync(WATCH_STATE_FILE, "utf8")) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as WatchState;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }
  throw new Error("Invalid watch-state.json: expected an object");
}

export function writeWatchState(state: WatchState): void {
  fs.mkdirSync(path.dirname(WATCH_STATE_FILE), { recursive: true });
  const tempFile = `${WATCH_STATE_FILE}.${randomUUID()}.tmp`;
  try {
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2) + "\n", "utf8");
    fs.renameSync(tempFile, WATCH_STATE_FILE);
  } finally {
    fs.rmSync(tempFile, { force: true });
  }
}
