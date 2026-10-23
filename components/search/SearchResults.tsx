"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SearchResult } from "@/types";
import { useT } from "@/lib/i18n/context";
import { componentsDict } from "@/lib/i18n/dict.components";

/** Client-side results panel: talks to the platform through GET /api/search. */
export function SearchResults({ query }: { query: string }) {
  const { t, lang } = useT();
  const c = componentsDict[lang];
  const [data, setData] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Group headings reuse core-dictionary labels where they exist.
  const GROUP_LABEL: Record<SearchResult["groups"][number]["kind"], string> = {
    event: c.results.groupEvents,
    paper: t.common.paper,
    topic: t.nav.topics,
    model: t.detail.model,
    benchmark: t.detail.benchmark,
  };

  useEffect(() => {
    if (!query) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`search failed (${res.status})`);
        return res.json() as Promise<SearchResult>;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  if (!query) {
    return (
      <p className="text-sm text-ink-500">
        {c.results.typeQueryBefore}
        <span className="text-ink-800">Lean theorem proving</span>
        {c.results.typeQueryMiddle}
        <span className="text-ink-800">mathematical agents</span>
        {c.results.typeQueryAfter}
      </p>
    );
  }

  if (loading) {
    return (
      <p className="text-sm text-ink-500">
        {c.results.searchingPrefix}“{query}”…
      </p>
    );
  }

  if (error) {
    return <p className="text-sm text-rose-600">{c.results.searchErrorPrefix}{error}</p>;
  }

  if (!data || data.total === 0) {
    return (
      <p className="text-sm text-ink-500">
        {c.results.noResultsBefore}“{query}”{c.results.noResultsAfter}
      </p>
    );
  }

  return (
    <div className="space-y-7">
      <p className="text-sm text-ink-600">
        <span className="font-mono text-ink-900">{data.total}</span>
        {c.results.countPrefix}“{data.query}”{c.results.countSuffix}
      </p>

      {(["event", "paper", "topic", "model", "benchmark"] as const).map((kind) => {
        const items = data.groups.filter((g) => g.kind === kind);
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
