import Link from "next/link";
import {
  AI_ROLE_LEVELS,
  EVIDENCE_LEVELS,
  EVENT_TYPES,
  SOURCE_TIERS,
  VERIFICATION_STATUSES,
} from "@/types";
import { getLang, t } from "@/lib/i18n/server";
import { pagesDict } from "@/lib/i18n/dict.pages";

export async function generateMetadata() {
  const m = pagesDict[getLang()].meta.methodology;
  return { title: m.title, description: m.desc };
}

type Marker = "evidence" | "tier" | "type" | "direction" | "text";

type Entry = {
  key: string;
  code?: string;
  term?: string;
  text: string;
  marker: Marker;
};

/**
 * A reader-facing glossary. It only explains the marks a reader sees on the
 * feed, on cards and on detail pages. How those marks are derived, how the
 * ingest pipeline works and our editorial policy are operator concerns and
 * are deliberately not part of the public site.
 */
export default function GlossaryPage() {
  const lang = getLang();
  const d = t(lang);
  const m = pagesDict[lang].methodology;

  const groups: { id?: string; title: string; entries: Entry[] }[] = [
    {
      id: "evidence",
      title: m.legendEvidence,
      entries: EVIDENCE_LEVELS.map((s) => ({
        key: s,
        code: s,
        text: m.evidenceDesc[s],
        marker: "evidence" as const,
      })),
    },
    {
      id: "tier",
      title: m.legendTier,
      entries: SOURCE_TIERS.map((s) => ({
        key: s,
        code: s,
        text: m.tierDesc[s],
        marker: "tier" as const,
      })),
    },
    {
      title: m.legendType,
      entries: EVENT_TYPES.map((s) => ({
        key: s,
        code: s,
        term: d.trust.type[s],
        text: m.typeDesc[s],
        marker: "type" as const,
      })),
    },
    {
      title: m.legendVerification,
      entries: VERIFICATION_STATUSES.map((s) => ({
        key: s,
        term: d.trust.verification[s],
        text: m.verificationDesc[s],
        marker: "text" as const,
      })),
    },
    {
      title: m.legendAiRole,
      entries: AI_ROLE_LEVELS.map((s) => ({
        key: s,
        term: d.trust.aiRole[s],
        text: m.aiRoleDesc[s],
        marker: "text" as const,
      })),
    },
    {
      id: "direction",
      title: m.legendDirection,
      entries: (["ai4math", "math4ai", "both"] as const).map((s) => ({
        key: s,
        code: s,
        term: m.directionLabels[s],
        text: m.directionDesc[s],
        marker: "direction" as const,
      })),
    },
  ];

  return (
    <div className="container-page max-w-5xl py-10 lg:py-14">
      <header className="max-w-3xl">
        <div className="mono-label mb-2">{m.label}</div>
        <h1 className="h-display">{m.title}</h1>
        <p className="lede mt-4">{m.intro}</p>
      </header>

      <p className="mt-7 rounded-md border border-ink-200 bg-ink-50 px-4 py-3 text-sm leading-relaxed text-ink-700">
        {m.note}
      </p>

      <div className="mt-11 gap-x-12 md:columns-2">
        {groups.map((group) => (
          <Legend key={group.title} {...group} />
        ))}
      </div>

      <section id="direction-note" className="mt-8 border-t border-ink-100 pt-5">
        <p className="text-sm leading-relaxed text-ink-500">{m.directionHint}</p>
      </section>

      <nav className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink-100 pt-6 text-sm">
        <span className="mono-label">{m.seeAlso}</span>
        <Link href="/about#sources" className="link-quiet">
          {m.linkSources} →
        </Link>
        <Link href="/latest" className="link-quiet">
          {m.linkLatest} →
        </Link>
      </nav>
    </div>
  );
}

function Legend({ id, title, entries }: { id?: string; title: string; entries: Entry[] }) {
  return (
    <section id={id} className="mb-10 break-inside-avoid scroll-mt-24">
      <h2 className="section-head h-section">{title}</h2>
      <dl className="divide-y divide-ink-100">
        {entries.map((entry) => (
          <div
            key={entry.key}
            className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 py-2.5 sm:grid-cols-[7.5rem_minmax(0,1fr)]"
          >
            <dt className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium leading-snug text-ink-800">
              <GlossaryMarker entry={entry} />
              {entry.term && <span>{entry.term}</span>}
            </dt>
            <dd className="text-[13px] leading-relaxed text-ink-600">{entry.text}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** The same visual code the reader sees in the feed, so the glossary doubles as a legend. */
function GlossaryMarker({ entry }: { entry: Entry }) {
  switch (entry.marker) {
    case "evidence":
      return (
        <span className="trust-code trust-evidence" data-level={entry.code}>
          <span className="font-medium text-ink-800">{entry.code}</span>
        </span>
      );
    case "tier":
      return (
        <span className="trust-tier" data-level={entry.code}>
          {entry.code}
        </span>
      );
    case "type":
      return <span className="type-bar h-3.5" data-type={entry.code} aria-hidden="true" />;
    case "direction":
      return <span className="direction-dot" data-direction={entry.code} aria-hidden="true" />;
    default:
      return null;
  }
}
