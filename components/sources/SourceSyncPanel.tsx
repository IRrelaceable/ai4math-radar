"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EventType, SourceTier } from "@/types";

type SourceView = {
  id: string;
  label: string;
  category: EventType;
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

type CategoryBoard = {
  category: EventType;
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
  syncCount: string;
  empty: string;
  healthOverview: string;
  totalSources: string;
  healthySources: string;
  failedSources: string;
  syncCategory: string;
  syncAll: string;
  upToDate: string;
  upToDateHint: string;
  tierLabel: string;
  categories: Record<EventType, string>;
  tiers: Record<SourceTier, { name: string; blurb: string }>;
};

function formatTime(value?: string) {
  return value ? value.replace("T", " ").replace(/\.\d{3}Z$/, " UTC") : "";
}

/** Failed sources first, then idle, then success — the reader wants problems first. */
function compareByUrgency(a: SourceView, b: SourceView): number {
  const rank = (s: SourceView) => (s.status === "error" ? 0 : s.status === "idle" ? 1 : 2);
  return rank(a) - rank(b) || a.label.localeCompare(b.label);
}

/** Aggregate status across a board: error > success > idle. */
function boardStatus(sources: SourceView[]): "success" | "error" | "idle" {
  if (sources.some((s) => s.status === "error")) return "error";
  if (sources.some((s) => s.status === "success")) return "success";
  return "idle";
}

const STATUS_CHIP: Record<string, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-rose-200 bg-rose-50 text-rose-700",
  idle: "border-ink-200 text-ink-500",
};

/**
 * Source sync panel, regrouped by EVENT CLASS rather than by S1–S5 tier.
 *
 * The tier is still shown, but as a quiet per-source label — a reader should
 * be able to tell "which sources are broken" without understanding the
 * editorial trust model. Failures sort to the top of each category, and a
 * successful sync with no new content reads as "Already up to date" instead
 * of a bare zero.
 */
export function SourceSyncPanel({
  boards,
  pending,
  labels,
}: {
  boards: CategoryBoard[];
  pending: number;
  labels: Labels;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<EventType | "all" | null>(null);
  const [message, setMessage] = useState<string>("");

  const allSources = boards.flatMap((b) => b.sources);
  const failedCount = allSources.filter((s) => s.status === "error").length;
  const healthyCount = allSources.filter((s) => s.status === "success").length;

  async function syncSources(sources: SourceView[], label: string) {
    if (sources.length === 0) return;
    setMessage("");
    let accepted = 0;
    let rejected = 0;
    const failures: string[] = [];

    for (const source of sources) {
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
      `${label}: ${accepted} accepted, ${rejected} rejected` +
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
          <p className="mt-2 max-w-2xl text-sm text-ink-600">{labels.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setBusy("all");
            void syncSources(allSources, labels.syncAll);
          }}
          disabled={busy !== null || allSources.length === 0}
          className="btn-primary"
        >
          {busy === "all"
            ? labels.syncing
            : `${labels.syncAll} (${labels.syncCount.replace("{n}", String(allSources.length))})`}
        </button>
      </div>

      {/* Health overview — four compact counters, readable without knowing S1–S5. */}
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-ink-200 bg-ink-200 sm:grid-cols-4">
        {[
          [labels.totalSources, String(allSources.length), "text-ink-900"],
          [labels.healthySources, String(healthyCount), "text-emerald-700"],
          [labels.failedSources, String(failedCount), failedCount > 0 ? "text-rose-700" : "text-ink-500"],
          [labels.pending, String(pending), "text-amber-700"],
        ].map(([label, value, tone]) => (
          <div key={label} className="bg-white px-4 py-3">
            <div className={`font-mono text-2xl font-semibold tracking-tight ${tone}`}>{value}</div>
            <div className="mono-label mt-1">{label}</div>
          </div>
        ))}
      </section>

      {message && (
        <div className="rounded-md border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-800">
          {message}
        </div>
      )}

      <div className="space-y-4">
        {boards.map((board) => {
          const status = boardStatus(board.sources);
          const sorted = [...board.sources].sort(compareByUrgency);
          return (
            <section key={board.category} className="card p-4">
              <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 pb-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-ink-900">{labels.categories[board.category]}</div>
                  <p className="mt-0.5 text-xs text-ink-500">{labels.tiers.S2.name}</p>
                </div>
                <span className={`chip ${STATUS_CHIP[status]}`}>
                  {status === "success" ? labels.success : status === "error" ? labels.error : labels.idle}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setBusy(board.category);
                    void syncSources(board.sources, labels.categories[board.category]);
                  }}
                  disabled={busy !== null || board.sources.length === 0}
                  className="btn-ghost"
                >
                  {busy === board.category
                    ? labels.syncing
                    : board.sources.length === 0
                      ? labels.sync
                      : `${labels.syncCategory} (${labels.syncCount.replace("{n}", String(board.sources.length))})`}
                </button>
              </div>

              {sorted.length === 0 ? (
                <p className="pt-3 text-xs text-ink-500">{labels.empty}</p>
              ) : (
                <ul className="divide-y divide-ink-100">
                  {sorted.map((source) => (
                    <li key={source.id} className="py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-ink-900">{source.label}</span>
                        <span className="mono-label normal-case tracking-normal">{source.id}</span>
                        <span className="chip border-ink-200 text-ink-500" title={labels.tiers[source.sourceTier].blurb}>
                          {source.sourceTier} · {labels.tiers[source.sourceTier].name}
                        </span>
                        <span className={`chip ${STATUS_CHIP[source.status]}`}>
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
                            {source.status === "success" && (source.added ?? 0) === 0 ? (
                              <span title={labels.upToDateHint}>0 new · {labels.upToDate}</span>
                            ) : (
                              <>
                                {source.added ?? 0} added · {source.updated ?? 0} updated ·{" "}
                                {source.rejected ?? 0} rejected
                              </>
                            )}
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
