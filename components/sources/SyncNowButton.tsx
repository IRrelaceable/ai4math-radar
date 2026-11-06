"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Phase = "idle" | "ingest" | "build" | "done" | "error";

type SyncStatus = {
  running: boolean;
  phase: Phase;
  startedAt: string | null;
  finishedAt: string | null;
  lines: string[];
  result: null | {
    ok?: boolean;
    added?: number;
    updated?: number;
    failedSources?: number;
    error?: string;
  };
};

type Labels = {
  action: string;
  runningIngest: string;
  runningBuild: string;
  done: string;
  failed: string;
  reload: string;
  offline: string;
  added: string;
  updated: string;
  failedSources: string;
};

/** Loopback endpoint started by `npm run dev` (scripts/sync-server.mjs). */
const ENDPOINT = "http://127.0.0.1:3100";
const POLL_MS = 1500;

/**
 * Runs the ingest pipeline from the sources page in local development.
 *
 * The published site is a static export with no server, so this control is
 * rendered in dev builds only and talks to a sidecar on the loopback interface.
 * The page's dataset is module-cached, so a completed sync only becomes
 * visible after a reload — hence the reload action instead of an auto-reload.
 */
export function SyncNowButton({ labels }: { labels: Labels }) {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [offline, setOffline] = useState(false);
  const [starting, setStarting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`${ENDPOINT}/status`, { cache: "no-store" });
      const next = (await res.json()) as SyncStatus;
      setStatus(next);
      setOffline(false);
      if (next.running) timer.current = setTimeout(poll, POLL_MS);
      else setStarting(false);
    } catch {
      setOffline(true);
      setStarting(false);
    }
  }, []);

  useEffect(() => {
    void poll();
    return stopPolling;
  }, [poll, stopPolling]);

  async function start() {
    stopPolling();
    setStarting(true);
    setOffline(false);
    try {
      const res = await fetch(`${ENDPOINT}/sync`, {
        method: "POST",
        headers: { "x-ai4math-sync": "1" },
      });
      if (!res.ok && res.status !== 409) throw new Error(`HTTP ${res.status}`);
      setStatus((await res.json()) as SyncStatus);
      void poll();
    } catch {
      setOffline(true);
      setStarting(false);
    }
  }

  const running = starting || (status?.running ?? false);
  const tail = status?.lines?.slice(-3) ?? [];
  const result = status?.result;

  let message = "";
  if (offline) message = labels.offline;
  else if (running) {
    message = status?.phase === "build" ? labels.runningBuild : labels.runningIngest;
  } else if (status?.phase === "done" && result) {
    message = `${labels.done} · +${result.added ?? 0} ${labels.added} · ~${result.updated ?? 0} ${labels.updated}`;
    if (result.failedSources) message += ` · ${result.failedSources} ${labels.failedSources}`;
  } else if (status?.phase === "error") message = labels.failed;

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={start}
          disabled={running || offline}
          className="rounded-md border border-ink-300 bg-white px-3 py-1.5 text-sm font-medium text-ink-800 transition hover:border-ink-400 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? message : labels.action}
        </button>
        {status?.phase === "done" && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-accent-700 underline-offset-2 hover:underline"
          >
            {labels.reload}
          </button>
        )}
      </div>
      {message && !running && <p className="mt-2 text-xs text-ink-600">{message}</p>}
      {tail.length > 0 && (
        <pre className="mt-2 max-h-24 overflow-auto rounded-md bg-ink-50 px-3 py-2 font-mono text-[11px] leading-relaxed text-ink-500">
          {tail.join("\n")}
        </pre>
      )}
    </div>
  );
}
