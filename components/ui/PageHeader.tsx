import type { ReactNode } from "react";
import { PageParticles } from "@/components/ui/PageParticles";

/**
 * Shared page heading used by the list surfaces. Titles were drifting between
 * 24px and 30px with inconsistent label/meta placement; one component keeps
 * the first screen of every section aligned.
 */
export function PageHeader({
  label,
  title,
  description,
  meta,
  action,
}: {
  label?: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-ink-300 pb-5">
      <div className="max-w-2xl">
        <div className="mb-2 flex items-center justify-between gap-3">
          {label && <div className="mono-label text-accent-700">{label}</div>}
          <PageParticles />
        </div>
        <h1 className="h-display">{title}</h1>
        {description && (
          <p className="lede mt-3">{description}</p>
        )}
        {meta && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-ink-500">
            {meta}
          </div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
