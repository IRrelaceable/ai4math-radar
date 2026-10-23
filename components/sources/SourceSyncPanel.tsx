"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SourceView = {
  id: string;
  label: string;
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
};

function formatTime(value?: string) {
  return value ? value.replace("T", " ").replace(/\.\d{3}Z$/, " UTC") : "";
}

export function SourceSyncPanel({
  initialSources,
  pending,
  labels,
}: {
  initialSources: SourceView[];
  pending: number;
  labels: Labels;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  async function sync(source: SourceView) {
    setBusy(source.id);
    setMessage("");
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
      setMessage(
        `${source.label}: ${payload.accepted?.length ?? 0} accepted, ${
          payload.rejectedCount ?? 0
        } rejected`
      );
      router.refresh();
    } catch (error) {
      setMessage(`${source.label}: ${String(error)}`);
    } finally {
      setBusy(null);
    }
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

      <div className="space-y-3">
        {initialSources.map((source) => (
          <div key={source.id} className="card p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-ink-900">{source.label}</div>
                <div className="mono-label mt-1 normal-case tracking-normal">{source.id}</div>
              </div>
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
              <button type="button" onClick={() => sync(source)} disabled={busy !== null} className="btn-primary">
                {busy === source.id ? labels.syncing : labels.sync}
              </button>
            </div>

            <dl className="mt-3 grid gap-2 border-t border-ink-100 pt-3 text-xs text-ink-600 sm:grid-cols-2 lg:grid-cols-4">
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
                <dd>{source.added ?? 0} added · {source.updated ?? 0} updated · {source.rejected ?? 0} rejected</dd>
              </div>
            </dl>

            {source.lastError && (
              <p className="mt-3 border-t border-ink-100 pt-2 text-xs text-rose-700">
                {labels.error}: {source.lastError}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
