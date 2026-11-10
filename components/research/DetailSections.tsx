"use client";

import { useState } from "react";
import Link from "next/link";
import type { ResearchEvent } from "@/types";
import { formatDateLong } from "@/lib/utils";
import { EvidenceLevelPill, VerificationStatusPill } from "@/components/ui/TrustBadges";
import { useT } from "@/lib/i18n/context";
import { pagesDict } from "@/lib/i18n/dict.pages";

/**
 * Verification history — collapsed by default, expanded on click.
 * Extracted as a client component because the detail page itself is a server
 * component and cannot host interactive state.
 */
export function VerificationHistorySection({ event }: { event: ResearchEvent }) {
  const [open, setOpen] = useState(false);
  const { t, lang } = useT();
  const d = t.detail;
  const history = event.verificationHistory ?? [];
  if (history.length === 0) return null;

  return (
    <section id="verification" className="mt-7 scroll-mt-24">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <h2 className="h-section text-ink-900">{d.verificationHistory}</h2>
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
                  <EvidenceLevelPill level={r.evidenceLevel} />
                  {r.status && <VerificationStatusPill status={r.status} />}
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
