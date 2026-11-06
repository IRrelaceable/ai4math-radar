import type { EventType, SourceTier } from "@/types";
import type { CategoryBoard, SourceView } from "@/lib/db/sourceStatus";
import { PageHeader } from "@/components/ui/PageHeader";
import { SyncNowButton } from "./SyncNowButton";

type Labels = {
  title: string;
  subtitle: string;
  autoTitle: string;
  autoBody: string;
  localTitle: string;
  localBody: string;
  syncAction: string;
  syncRunningIngest: string;
  syncRunningBuild: string;
  syncDone: string;
  syncFailed: string;
  syncReload: string;
  syncOffline: string;
  never: string;
  lastSuccess: string;
  lastAttempt: string;
  cursor: string;
  result: string;
  added: string;
  updated: string;
  rejected: string;
  error: string;
  success: string;
  idle: string;
  empty: string;
  totalSources: string;
  healthySources: string;
  failedSources: string;
  upToDate: string;
  upToDateHint: string;
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
 * Source registry with the result of the last automatic sync.
 *
 * The published site is a static export, so syncing happens in the GitHub
 * Actions job (or `npm run sync` locally) and this page shows the state
 * captured when the site was built. Sources are grouped by event class rather
 * than by S0–S4 tier so a reader can tell which sources feed which feed; the
 * tier survives as a per-source label. In local development a button runs the
 * same pipeline through a loopback sidecar — production never renders it.
 */
export function SourceBoards({ boards, labels }: { boards: CategoryBoard[]; labels: Labels }) {
  const allSources = boards.flatMap((b) => b.sources);
  const failedCount = allSources.filter((s) => s.status === "error").length;
  const healthyCount = allSources.filter((s) => s.status === "success").length;

  return (
    <div className="space-y-5">
      <PageHeader title={labels.title} description={labels.subtitle} />

      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-ink-200 bg-ink-200 sm:grid-cols-3">
        {[
          [labels.totalSources, String(allSources.length), "text-ink-900"],
          [labels.healthySources, String(healthyCount), "text-emerald-700"],
          [
            labels.failedSources,
            String(failedCount),
            failedCount > 0 ? "text-rose-700" : "text-ink-500",
          ],
        ].map(([label, value, tone]) => (
          <div key={label} className="bg-white px-4 py-3">
            <div className={`font-mono text-2xl font-semibold tracking-tight ${tone}`}>{value}</div>
            <div className="mono-label mt-1">{label}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <div className="font-medium text-ink-900">{labels.autoTitle}</div>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{labels.autoBody}</p>
        </div>
        <div className="card p-4">
          <div className="font-medium text-ink-900">{labels.localTitle}</div>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{labels.localBody}</p>
          {process.env.NODE_ENV === "development" && (
            <SyncNowButton
              labels={{
                action: labels.syncAction,
                runningIngest: labels.syncRunningIngest,
                runningBuild: labels.syncRunningBuild,
                done: labels.syncDone,
                failed: labels.syncFailed,
                reload: labels.syncReload,
                offline: labels.syncOffline,
                added: labels.added,
                updated: labels.updated,
                failedSources: labels.failedSources,
              }}
            />
          )}
        </div>
      </section>

      <div className="space-y-4">
        {boards.map((board) => {
          const status = boardStatus(board.sources);
          const sorted = [...board.sources].sort(compareByUrgency);
          return (
            <section key={board.category} className="card p-4">
              <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 pb-3">
                <div className="min-w-0 flex-1 font-medium text-ink-900">
                  {labels.categories[board.category]}
                </div>
                <span className={`chip ${STATUS_CHIP[status]}`}>
                  {status === "success" ? labels.success : status === "error" ? labels.error : labels.idle}
                </span>
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
                        <span
                          className="chip border-ink-200 text-ink-500"
                          title={labels.tiers[source.sourceTier].blurb}
                        >
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
                              <span title={labels.upToDateHint}>0 · {labels.upToDate}</span>
                            ) : (
                              <>
                                {source.added ?? 0} {labels.added} · {source.updated ?? 0}{" "}
                                {labels.updated} · {source.rejected ?? 0} {labels.rejected}
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
