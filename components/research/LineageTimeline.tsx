"use client";

import Link from "next/link";
import type { ResearchEvent, RelatedWork } from "@/types";
import { formatDate } from "@/lib/utils";
import { useLang } from "@/lib/i18n/context";
import { componentsDict } from "@/lib/i18n/dict.components";

/**
 * Citation links: previous work above, this event in the middle, follow-up
 * work below. Unlike the old three-column diagram, an empty side simply is
 * not drawn — "not yet recorded" boxes spent two containers saying nothing.
 *
 * Every edge states where the link comes from and offers a direct link to the
 * original source, so the reader can check the citation without trusting us.
 */
export function LineageTimeline({
  event,
  extraPrevious = [],
  extraFollowup = [],
  sourceUrlBySlug,
}: {
  event: ResearchEvent;
  extraPrevious?: RelatedWork[];
  extraFollowup?: RelatedWork[];
  /** slug -> original paper/source URL, resolved once by the detail page. */
  sourceUrlBySlug: Record<string, string>;
}) {
  const { lang } = useLang();
  const c = componentsDict[lang].lineage;
  const previous = [
    ...event.relatedWorks.filter((w) => w.relation === "previous"),
    ...extraPrevious,
  ];
  const followup = [
    ...event.relatedWorks.filter((w) => w.relation === "followup"),
    ...extraFollowup,
  ];

  if (previous.length === 0 && followup.length === 0) return null;

  return (
    <ol className="relative ml-2 border-l border-ink-200 pl-5">
      {previous.map((work) => (
        <EdgeRow
          key={`previous:${work.title}`}
          work={work}
          label={c.previousWork}
          sourceUrlBySlug={sourceUrlBySlug}
        />
      ))}

      <li className="relative my-2 rounded-md border border-accent-300 bg-accent-50 px-3.5 py-2.5">
        <span
          aria-hidden="true"
          className="absolute -left-[23px] top-4 h-2.5 w-2.5 rounded-full bg-accent-600"
        />
        <div className="mono-label text-accent-700">{c.thisWork}</div>
        <div className="h-item mt-1">{event.title}</div>
        <div className="mt-1 font-mono text-xs text-ink-500">
          {formatDate(event.date, lang)}
        </div>
      </li>

      {followup.map((work) => (
        <EdgeRow
          key={`followup:${work.title}`}
          work={work}
          label={c.followupWork}
          sourceUrlBySlug={sourceUrlBySlug}
        />
      ))}
    </ol>
  );
}

/** Citation backfill stores two English notes; everything else is already localized. */
function localizedNote(note: string | undefined, c: ReturnType<typeof labels>): string | undefined {
  if (!note) return undefined;
  if (note === "Listed in this event's reference list") return c.referenceNote;
  if (note === "Cites this event's paper") return c.citationNote;
  return note;
}

function labels(lang: "zh" | "en") {
  return componentsDict[lang].lineage;
}

/** Internal edges point at a detail page; the reader still needs the underlying source. */
function originalUrl(
  work: RelatedWork,
  sourceUrlBySlug: Record<string, string>
): string | undefined {
  if (!work.url) return undefined;
  if (!work.url.startsWith("/")) return work.url;
  const slug = work.url.replace(/^\/research\//, "").replace(/\/$/, "");
  return sourceUrlBySlug[slug];
}

function EdgeRow({
  work,
  label,
  sourceUrlBySlug,
}: {
  work: RelatedWork;
  label: string;
  sourceUrlBySlug: Record<string, string>;
}) {
  const { lang } = useLang();
  const c = labels(lang);
  const note = localizedNote(work.note, c);
  const original = originalUrl(work, sourceUrlBySlug);

  return (
    <li className="relative pb-3 last:pb-0">
      <span
        aria-hidden="true"
        className="absolute -left-[23px] top-2 h-2 w-2 rounded-full border border-ink-300 bg-white"
      />
      <div className="mono-label">{label}</div>
      <div className="h-item mt-1">
        <WorkLink work={work} />
      </div>
      {(note || original) && (
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
          {note && <span>{note}</span>}
          {original && (
            <a
              href={original}
              target="_blank"
              rel="noopener noreferrer"
              className="link-quiet font-mono text-[11px]"
            >
              {c.original} ↗
            </a>
          )}
        </div>
      )}
    </li>
  );
}

function WorkLink({ work }: { work: RelatedWork }) {
  const className = "hover:text-accent-700";
  if (!work.url) return <span>{work.title}</span>;
  if (work.url.startsWith("/")) {
    return (
      <Link href={work.url} className={className}>
        {work.title}
      </Link>
    );
  }
  return (
    <a href={work.url} target="_blank" rel="noopener noreferrer" className={className}>
      {work.title}
    </a>
  );
}
