"use client";

import Link from "next/link";
import type { ResearchEvent } from "@/types";
import { slugify } from "@/lib/utils";
import { useT } from "@/lib/i18n/context";
import { componentsDict } from "@/lib/i18n/dict.components";

interface Branch {
  area: string;
  slug: string;
  count: number;
  subAreas: { name: string; count: number }[];
}

/**
 * v1 Research Map: a plain, dependency-free tree derived from the data.
 * No graph library - AI4Math -> Research Area -> sub area, sized by event count.
 */
export function ResearchMapTree({ events }: { events: ResearchEvent[] }) {
  const { t, lang } = useT();
  const c = componentsDict[lang];
  const byArea = new Map<string, Branch>();

  for (const e of events) {
    let branch = byArea.get(e.researchArea);
    if (!branch) {
      branch = {
        area: e.researchArea,
        slug: slugify(e.researchArea),
        count: 0,
        subAreas: [],
      };
      byArea.set(e.researchArea, branch);
    }
    branch.count += 1;

    if (e.subArea) {
      const existing = branch.subAreas.find((s) => s.name === e.subArea);
      if (existing) existing.count += 1;
      else branch.subAreas.push({ name: e.subArea, count: 1 });
    }
  }

  const branches = [...byArea.values()].sort((a, b) => b.count - a.count);
  const max = branches[0]?.count ?? 1;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-9 items-center rounded-md bg-ink-900 px-3.5 font-mono text-sm font-medium text-white">
          AI4Math
        </span>
        <span className="mono-label">
          {events.length} {c.map.eventsMapped}
        </span>
      </div>

      <div className="mt-4 space-y-3 border-l-2 border-dashed border-ink-200 pl-6">
        {branches.map((b) => {
          const pct = Math.round((b.count / Math.max(1, max)) * 100);
          return (
            <div key={b.slug} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-6 top-1/2 h-px w-6 border-t border-dashed border-ink-300"
              />
              <div className="rounded-lg border border-ink-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/topics/${b.slug}`}
                    className="rounded-md border border-ink-300 bg-ink-50 px-3 py-1.5 text-sm font-medium hover:border-accent-400 hover:bg-accent-50 hover:text-accent-700"
                  >
                    {b.area}
                  </Link>
                  <span className="font-mono text-xs text-ink-500">
                    {b.count} {t.common.events}
                  </span>
                  <span className="ml-auto h-2 w-32 overflow-hidden rounded-full bg-ink-100 sm:w-48">
                    <span
                      className="block h-2 rounded-full bg-accent-500"
                      style={{ width: `${Math.max(6, pct)}%` }}
                    />
                  </span>
                </div>

                {b.subAreas.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
                    <span className="mono-label">{c.map.subAreas}</span>
                    {b.subAreas
                      .sort((x, y) => y.count - x.count)
                      .map((s) => (
                        <Link
                          key={s.name}
                          href={`/topics/${b.slug}`}
                          className="chip hover:border-accent-400 hover:text-accent-700"
                          title={c.map.subAreaTitle
                            .replace("{count}", String(s.count))
                            .replace("{name}", s.name)}
                        >
                          {s.name}
                          <span className="ml-1.5 font-mono text-[10px] text-ink-400">
                            {s.count}
                          </span>
                        </Link>
                      ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
