import { getLang, t } from "@/lib/i18n/server";

/**
 * Route-level skeleton: page switches fetch fresh data (all pages are dynamic),
 * so show the page shape immediately instead of leaving the old screen frozen.
 * Geometry mirrors the common header + card grid to avoid a layout jump.
 */
export default function Loading() {
  const d = t(getLang());

  return (
    <div className="container-page py-10" aria-busy="true" aria-live="polite">
      <div className="mb-7 max-w-3xl">
        <div className="mb-2 h-3 w-20 animate-pulse rounded bg-ink-100" />
        <div className="h-7 w-64 animate-pulse rounded bg-ink-100" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-ink-100" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="card space-y-3 p-5">
            <div className="h-4 w-3/4 animate-pulse rounded bg-ink-100" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-ink-100" />
            <div className="h-3 w-full animate-pulse rounded bg-ink-100" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-ink-100" />
          </div>
        ))}
      </div>
      <span className="sr-only">{d.common.loading}</span>
    </div>
  );
}
