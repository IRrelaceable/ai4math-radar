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
    <div className="space-y-5">
      <section className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-ink-200 bg-ink-200">
        {[
          [String(allSources.length), labels.totalSources],
          [String(boards.length), labels.classCount],
          ["S0–S4", labels.tierAxis],
        ].map(([value, label]) => (
          <div key={label} className="bg-white px-4 py-3">
            <div className="font-mono text-[19px] font-semibold tracking-tight text-ink-900">
              {value}
            </div>
            <div className="mono-label mt-1">{label}</div>
          </div>
        ))}
      </section>

      <details className="disclosure rounded-md border border-ink-200 bg-white">
        <summary className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm font-medium text-ink-800 transition-colors hover:bg-ink-50">
          <span
            className="disclosure-sign flex h-5 w-5 shrink-0 items-center justify-center rounded border border-ink-300 font-mono text-xs text-ink-600"
            aria-hidden="true"
          />
          <span>{labels.registryToggle}</span>
          <span className="mono-label ml-auto">
            {allSources.length} {labels.focusSources}
          </span>
        </summary>
        <div className="border-t border-ink-100 px-4 py-4">
          <p className="mb-4 text-xs leading-relaxed text-ink-500">{labels.registryHint}</p>
          <div className="grid gap-5 sm:grid-cols-2">
            {boards.map((board) => (
              <section key={board.category}>
                <div className="flex items-center gap-2 border-b border-ink-100 pb-2">
                  <span
                    className="type-bar h-4"
                    data-type={board.category}
                    aria-hidden="true"
                  />
                  <h3 className="h-item">{labels.categories[board.category]}</h3>
                  <span className="ml-auto font-mono text-[11px] text-ink-500">
                    {board.sources.length}
                  </span>
                </div>
                {board.sources.length === 0 ? (
                  <p className="pt-3 text-xs text-ink-500">{labels.empty}</p>
                ) : (
                  <ul className="mt-2 space-y-1.5">
                    {board.sources.map((source) => (
                      <li
                        key={source.id}
                        className="flex items-baseline justify-between gap-3 text-[13px]"
                      >
                        <span className="text-ink-700">{source.label}</span>
                        <span
                          className="trust-tier shrink-0"
                          data-level={source.sourceTier}
                          title={labels.tiers[source.sourceTier].blurb}
                        >
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
      </details>
    </div>
  );
}
