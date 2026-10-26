"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SourceTier } from "@/types";

type SourceView = {
  id: string;
  label: string;
  sourceTier: SourceTier;
  status: "idle" | "success" | "error";
  lastAttemptAt?: string;
  lastSuccessAt?: string;
  lastError?: string;
  cursor?: string;
  accepted?: number;
  added?: number;
  updated?: number;
  rejected?: number;
  total?: number;
};

type TierBoard = {
  tier: SourceTier;
  sources: SourceView[];
};

type Labels = {
  title: string;
  subtitle: string;
  pending: string;
  sync: string;
  syncing: string;
  never: string;
  lastSuccess: string;
  lastAttempt: string;
  cursor: string;
  result: string;
  error: string;
  success: string;
  idle: string;
  /** Per-tier title/description, keyed by S1..S5. */
  tiers: Record<SourceTier, { name: string; blurb: string }>;
  /** Template with a `{n}` placeholder, replaced with the board's source count. */
  syncCount: string;
  empty: string;
};

function formatTime(value?: string) {
  return value ? value.replace("T", " ").replace(/\.\d{3}Z$/, " UTC") : "";
}

/** Aggregate status across a board: error > success > idle. */
function boardStatus(sources: SourceView[]): "success" | "error" | "idle" {
  if (sources.some((s) => s.status === "error")) return "error";
  if (sources.some((s) => s.status === "success")) return "success";
  return "idle";
}

export function SourceSyncPanel({
  boards,
  pending,
  labels,
}: {
  boards: TierBoard[];
  pending: number;
  labels: Labels;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<SourceTier | null>(null);
  const [message, setMessage] = useState<string>("");

  /** Sync every source in a board sequentially; each keeps its own cursor/status. */
  async function syncBoard(board: TierBoard) {
    if (board.sources.length === 0) return;
    setBusy(board.tier);
    setMessage("");
    let accepted = 0;
    let rejected = 0;
    const failures: string[] = [];

    for (const source of board.sources) {
      try {
        const body: Record<string, unknown> = { source: source.id, persist: true };
        if (source.cursor) body.since = source.cursor;
        const response = await fetch("/api/agents/ingest", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`);
        accepted += payload.accepted?.length ?? 0;
        rejected += payload.rejectedCount ?? 0;
      } catch (error) {
        failures.push(`${source.id}: ${String(error)}`);
      }
    }

    setMessage(
      `${labels.tiers[board.tier].name}: ${accepted} accepted, ${rejected} rejected` +
        (failures.length ? ` — ${failures.join("; ")}` : "")
    );
    router.refresh();
    setBusy(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{labels.title}</h1>
          <p className="mt-2 text-sm text-ink-600">{labels.subtitle}</p>
        </div>
        <div className="card px-4 py-3 text-right">
          <div className="mono-label">{labels.pending}</div>
          <div className="font-mono text-2xl font-semibold">{pending}</div>
        </div>
      </div>

      {message && (
        <div className="rounded-md border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-800">
          {message}
        </div>
      )}

      <div className="space-y-4">
        {boards.map((board) => {
          const status = boardStatus(board.sources);
          return (
            <section key={board.tier} className="card p-4">
              <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 pb-3">
                <span className="chip border-ink-200 bg-ink-50 font-mono text-ink-700">
                  {board.tier}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-ink-900">{labels.tiers[board.tier].name}</div>
                  <p className="mt-0.5 text-xs text-ink-500">{labels.tiers[board.tier].blurb}</p>
                </div>
                <span
                  className={`chip ${
                    status === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : status === "error"
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-ink-200 text-ink-500"
                  }`}
                >
                  {status === "success" ? labels.success : status === "error" ? labels.error : labels.idle}
                </span>
                <button
                  type="button"
                  onClick={() => syncBoard(board)}
                  disabled={busy !== null || board.sources.length === 0}
                  className="btn-primary"
                >
                  {busy === board.tier
                    ? labels.syncing
                    : board.sources.length === 0
                      ? labels.sync
                      : `${labels.sync} (${labels.syncCount.replace("{n}", String(board.sources.length))})`}
                </button>
              </div>

              {board.sources.length === 0 ? (
                <p className="pt-3 text-xs text-ink-500">{labels.empty}</p>
              ) : (
                <ul className="divide-y divide-ink-100">
                  {board.sources.map((source) => (
                    <li key={source.id} className="py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-ink-900">{source.label}</span>
                        <span className="mono-label normal-case tracking-normal">{source.id}</span>
                        <span
                          className={`chip ${
                            source.status === "success"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : source.status === "error"
                                ? "border-rose-200 bg-rose-50 text-rose-700"
                                : "border-ink-200 text-ink-500"
                          }`}
                        >
                          {source.status === "success"
                            ? labels.success
                            : source.status === "error"
                              ? labels.error
                              : labels.idle}
                        </span>
                      </div>
                      <dl className="mt-2 grid gap-2 text-xs text-ink-600 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <dt className="mono-label normal-case tracking-normal">{labels.lastSuccess}</dt>
                          <dd>{formatTime(source.lastSuccessAt) || labels.never}</dd>
                        </div>
                        <div>
                          <dt className="mono-label normal-case tracking-normal">{labels.lastAttempt}</dt>
                          <dd>{formatTime(source.lastAttemptAt) || labels.never}</dd>
                        </div>
                        <div>
                          <dt className="mono-label normal-case tracking-normal">{labels.cursor}</dt>
                          <dd>{source.cursor || labels.never}</dd>
                        </div>
                        <div>
                          <dt className="mono-label normal-case tracking-normal">{labels.result}</dt>
                          <dd>
                            {source.added ?? 0} added · {source.updated ?? 0} updated ·{" "}
                            {source.rejected ?? 0} rejected
                          </dd>
                        </div>
                      </dl>
                      {source.lastError && (
                        <p className="mt-2 text-xs text-rose-700">
                          {labels.error}: {source.lastError}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
