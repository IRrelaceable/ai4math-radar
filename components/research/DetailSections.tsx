"use client";

import { useState } from "react";
import Link from "next/link";
import type { ResearchEvent } from "@/types";
import { formatDateLong } from "@/lib/utils";
import { EvidenceLevelPill, VerificationBadge } from "@/components/ui/TrustBadges";
import { useT } from "@/lib/i18n/context";
import { pagesDict } from "@/lib/i18n/dict.pages";

const RELATED_PREVIEW_COUNT = 3;

/**
 * Related works with a "show more" toggle — first 3 shown by default.
 * Extracted as a client component because the detail page itself is a server
 * component and cannot host interactive state.
 */
export function RelatedWorksSection({ event }: { event: ResearchEvent }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useT();
  const d = t.detail;

  // 64% of events carry no curated lineage. Rendering a heading plus a
  // "not recorded yet" sentence for those just adds a dead block to an
  // otherwise thin column, so the section disappears entirely and the
  // page falls back to "more in this area" for context.
  if (event.relatedWorks.length === 0) {
    return null;
  }

  const visible = expanded
    ? event.relatedWorks
    : event.relatedWorks.slice(0, RELATED_PREVIEW_COUNT);

  return (
    <section className="mt-7">
      <h2 className="text-lg font-semibold tracking-tight text-ink-900">
        {d.relatedWorks}
      </h2>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {visible.map((w) => (
          <li key={`${w.relation}-${w.title}`} className="card px-4 py-3">
            <div className="mono-label mb-1 normal-case tracking-normal">
              {w.relation === "previous"
                ? d.previous
                : w.relation === "followup"
                  ? d.followup
                  : d.related}
            </div>
            <div className="text-sm font-medium">
              {w.url ? (
                <a
                  href={w.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent-700"
                >
                  {w.title}
                </a>
              ) : (
                w.title
              )}
            </div>
            {w.note && <div className="mt-1 text-xs text-ink-500">{w.note}</div>}
          </li>
        ))}
      </ul>
      {event.relatedWorks.length > RELATED_PREVIEW_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-3 text-sm font-medium text-accent-700 hover:underline"
        >
          {expanded
            ? t.detail.showLess
            : `${t.detail.showMoreRelated} (${event.relatedWorks.length - RELATED_PREVIEW_COUNT})`}
        </button>
      )}
    </section>
  );
}

/**
 * Verification history — collapsed by default, expanded on click.
 * Extracted as a client component for the same reason as RelatedWorksSection.
 */
export function VerificationHistorySection({ event }: { event: ResearchEvent }) {
  const [open, setOpen] = useState(false);
  const { t, lang } = useT();
  const d = t.detail;
  const history = event.verificationHistory ?? [];
  if (history.length === 0) return null;

  return (
    <section className="mt-7">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <h2 className="text-lg font-semibold tracking-tight text-ink-900">
          {d.verificationHistory}
        </h2>
        <span className="text-sm font-medium text-accent-700">
          {open ? "−" : `+${history.length}`}
        </span>
      </button>
      {open && (
        <>
          <p className="mt-1 text-sm text-ink-500">
            {d.verificationHistoryHint}{" "}
            <Link href="/methodology" className="link-quiet">
              {pagesDict[lang].detail.howToReadLabels}
            </Link>
          </p>
          <ol className="mt-3 space-y-2 border-l-2 border-ink-200 pl-5">
            {history.map((r, i) => (
              <li key={`${r.date}-${i}`} className="relative">
                <span className="absolute -left-[1.9rem] top-2 h-2 w-2 rounded-full bg-accent-500" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-ink-500">
                    {formatDateLong(r.date, lang)}
                  </span>
                  <VerificationBadge status={r.status} />
                  <EvidenceLevelPill level={r.evidenceLevel} />
                </div>
                {r.note && (
                  <p className="mt-1 text-sm leading-relaxed text-ink-600">{r.note}</p>
                )}
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
