"use client";

import type { ResearchEvent, RelatedWork } from "@/types";
import { formatDate } from "@/lib/utils";
import { useLang } from "@/lib/i18n/context";
import { componentsDict } from "@/lib/i18n/dict.components";

/**
 * Previous Work -> This Work -> Follow-up Work, derived from relatedWorks
 * relation labels. Falls back to a neutral "not yet recorded" state.
 */
export function LineageTimeline({ event }: { event: ResearchEvent }) {
  const { lang } = useLang();
  const c = componentsDict[lang];
  const previous = event.relatedWorks.filter((w) => w.relation === "previous");
  const followup = event.relatedWorks.filter((w) => w.relation === "followup");

  return (
    <div className="space-y-0">
      <Stage label={c.lineage.previousWork} items={previous} />
      <Connector />
      <div className="rounded-md border border-accent-300 bg-accent-50 px-4 py-3">
        <div className="mono-label text-accent-700">{c.lineage.thisWork}</div>
        <div className="mt-1 text-sm font-medium text-ink-900">{event.title}</div>
        <div className="mt-1 font-mono text-xs text-ink-500">{formatDate(event.date)}</div>
      </div>
      <Connector />
      <Stage label={c.lineage.followupWork} items={followup} />
    </div>
  );
}

function Connector() {
  return (
    <div className="flex justify-center py-1" aria-hidden="true">
      <span className="font-mono text-sm text-ink-400">↓</span>
    </div>
  );
}

function Stage({ label, items }: { label: string; items: RelatedWork[] }) {
  const { lang } = useLang();
  const c = componentsDict[lang];
  return (
    <div className="rounded-md border border-ink-200 bg-white px-4 py-3">
      <div className="mono-label">{label}</div>
      {items.length === 0 ? (
        <div className="mt-1 text-sm text-ink-400">{c.lineage.notRecorded}</div>
      ) : (
        <ul className="mt-1.5 space-y-1.5">
          {items.map((w) => (
            <li key={w.title} className="text-sm">
              {w.url ? (
                <a
                  href={w.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink-900 hover:text-accent-700"
                >
                  {w.title}
                </a>
              ) : (
                <span className="font-medium text-ink-900">{w.title}</span>
              )}
              {w.note && <span className="block text-xs text-ink-500">{w.note}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
