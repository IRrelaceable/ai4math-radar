"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { SearchResult } from "@/types";
import { useDataset } from "@/lib/useDataset";
import { searchList } from "@/lib/staticData";
import { useT } from "@/lib/i18n/context";
import { componentsDict } from "@/lib/i18n/dict.components";

/**
 * Client-side results panel.
 *
 * The static export has no `/api/search`, so the query runs against the same
 * build-time dataset the feed uses. Group headings stay in the reader's
 * language because the dataset is already localized.
 */
export function SearchResults() {
  const params = useSearchParams();
  const query = (params.get("q") ?? "").trim();
  const { t, lang } = useT();
  const c = componentsDict[lang];
  const { data, error } = useDataset();

  // Group headings reuse core-dictionary labels where they exist.
  const GROUP_LABEL: Record<SearchResult["groups"][number]["kind"], string> = {
    event: c.results.groupEvents,
    paper: t.common.paper,
    topic: t.nav.topics,
    model: t.detail.model,
    benchmark: t.detail.benchmark,
  };

  if (!query) {
    return (
      <p className="text-sm text-ink-500">
        {c.results.typeQueryBefore}
        <span className="text-ink-800">{c.results.typeQueryExampleA}</span>
        {c.results.typeQueryMiddle}
        <span className="text-ink-800">{c.results.typeQueryExampleB}</span>
        {c.results.typeQueryAfter}
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-rose-600">
        {c.results.searchErrorPrefix}
        {error}
      </p>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-ink-500">
        {c.results.searchingPrefix}“{query}”…
      </p>
    );
  }

  const result = searchList(data.events, data.topics, query, lang);
  if (result.total === 0) {
    return (
      <p className="text-sm text-ink-500">
        {c.results.noResultsBefore}“{query}”{c.results.noResultsAfter}
      </p>
    );
  }

  return (
    <div className="space-y-7">
      <p className="text-sm text-ink-600">
        <span className="font-mono text-ink-900">{result.total}</span>
        {c.results.countPrefix}“{result.query}”{c.results.countSuffix}
      </p>

      {(["event", "paper", "topic", "model", "benchmark"] as const).map((kind) => {
        const items = result.groups.filter((g) => g.kind === kind);
        if (items.length === 0) return null;
        return (
          <section key={kind}>
            <div className="mb-2 flex items-baseline gap-2 border-b border-ink-200 pb-2">
              <h2 className="mono-label">{GROUP_LABEL[kind]}</h2>
              <span className="font-mono text-[11px] text-ink-400">{items.length}</span>
            </div>
            <ul className="divide-y divide-ink-100">
              {items.map((g) => (
                <li key={`${g.kind}-${g.title}`}>
                  <Link
                    href={g.href}
                    className="flex items-baseline gap-3 py-2.5 hover:bg-ink-50"
                  >
                    <span className="text-sm font-medium text-ink-900">{g.title}</span>
                    {g.subtitle && (
                      <span className="ml-auto shrink-0 font-mono text-[11px] text-ink-500">
                        {g.subtitle}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
