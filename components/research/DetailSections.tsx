"use client";

import { useState } from "react";
import Link from "next/link";
import type { PublicationCorrection } from "@/types";
import { sourceHost } from "@/lib/utils";
import { useT } from "@/lib/i18n/context";

/**
 * Publication corrections — errata appended after formal publication.
 * Only rendered when the record actually carries corrections; the folding
 * behaviour mirrors the evidence history so the two sections read alike.
 */
export function PublicationCorrectionsSection({
  corrections,
}: {
  corrections: PublicationCorrection[] | undefined;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useT();
  if (!corrections || corrections.length === 0) return null;

  return (
    <section id="publication-corrections" className="mt-7 scroll-mt-24">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <h2 className="h-section text-ink-900">{t.detail.publicationCorrections}</h2>
        <span className="text-sm font-medium text-accent-700">
          {open ? "−" : `+${corrections.length}`}
        </span>
      </button>
      {open && (
        <ul className="mt-3 space-y-3 border-l-2 border-ink-200 pl-5">
          {corrections.map((c, i) => (
            <li key={`${c.date}-${i}`} className="relative">
              <span className="absolute -left-[1.9rem] top-2 h-2 w-2 rounded-full bg-accent-500" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-ink-500">{c.date}</span>
                {c.sourceUrl && (
                  <Link
                    href={c.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-quiet text-xs"
                  >
                    ↗ {sourceHost(c.sourceUrl)}
                  </Link>
                )}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-ink-600">{c.note}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
