import type { CategoryBoard } from "@/lib/db/sourceStatus";
import type { PagesDict } from "@/lib/i18n/dict.pages";

type Labels = PagesDict["sources"];

/**
 * Public source registry for the About page.
 *
 * A deployed site is read by researchers, not operators. This answers the only
 * question a reader has about provenance — "which public channels do these
 * records come from?" — with a name and a source tier per channel. It carries
 * no sync state, cursors, failure counts, ingest results or local controls;
 * those live in data/ingested/source-status.json and the Actions run log.
 */
export function SourceRegistry({
  boards,
  labels,
}: {
  boards: CategoryBoard[];
  labels: Labels;
}) {
  const allSources = boards.flatMap((b) => b.sources);

  return (
    <div>
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-ink-200 bg-ink-200 sm:grid-cols-3">
        {[
          [String(allSources.length), labels.totalSources],
          [String(boards.length), labels.classCount],
          ["S0–S4", labels.tierAxis],
        ].map(([value, label]) => (
          <div key={label} className="bg-white px-5 py-4">
            <div className="font-mono text-[25px] font-semibold tracking-tight text-ink-900">
              {value}
            </div>
            <div className="mono-label mt-1">{label}</div>
          </div>
        ))}
      </div>

      <p className="mt-5 max-w-3xl text-xs leading-relaxed text-ink-500">{labels.registryHint}</p>
      <div className="mt-5 gap-4 lg:columns-2">
        {boards.map((board) => (
          <section key={board.category} className="mb-4 break-inside-avoid rounded-md border border-ink-200 bg-white p-5">
            <div className="flex items-center gap-3 border-b border-ink-200 pb-3">
              <span className="type-bar h-5" data-type={board.category} aria-hidden="true" />
              <h3 className="h-item">{labels.categories[board.category]}</h3>
              <span className="ml-auto font-mono text-[12px] text-ink-500">{board.sources.length}</span>
            </div>
            {board.sources.length === 0 ? (
              <p className="pt-3 text-xs text-ink-500">{labels.empty}</p>
            ) : (
              <ul className="divide-y divide-ink-100">
                {board.sources.map((source) => (
                  <li key={source.id} className="flex items-baseline justify-between gap-4 py-2 text-[13px]">
                    <span className="min-w-0 text-ink-700">{source.label}</span>
                    <span className="trust-tier shrink-0" data-level={source.sourceTier} title={labels.tiers[source.sourceTier].blurb}>
                      {source.sourceTier}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
