"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { fill, type PagesDict } from "@/lib/i18n/dict.pages";
import { DiscussionSlot, type DiscussionLabels } from "@/components/research/DiscussionSlot";
import type { Lang } from "@/lib/i18n/dict";
import {
  LAB_ARCHIVE,
  LAB_BASELINES,
  archiveByYear,
  type LabArchiveRecord,
  type LabTrack,
} from "@/data/lab-archive/records";

type Labels = PagesDict["labs"]["archive"];
type Filter = LabTrack | "all";
export interface RelatedEvent {
  slug: string;
  title: string;
}

/** Quiet, class-tinted badges: colour carries attribution, never reliability. */
const TRACK_CLASS: Record<LabTrack, string> = {
  openai: "border-[#cdd3fb] bg-[#eef0ff] text-[#33409e]",
  anthropic: "border-[#efd3a4] bg-[#fdf3e3] text-[#85500e]",
  joint: "border-[#dacdf5] bg-[#f2edfc] text-[#583e91]",
  independent: "border-[#cbd5e1] bg-[#f1f5f9] text-[#475569]",
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <dt className="mono-label pt-1">{label}</dt>
      <dd className="text-[13px] leading-relaxed text-ink-700">{children}</dd>
    </div>
  );
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Clean date for the closed row; the verbatim label, qualifiers included, stays in the expanded field. */
function rowDate(record: LabArchiveRecord, zh: boolean): string {
  const match = /(\d{4})[-年](\d{1,2})(?:[-月](\d{1,2}))?/.exec(record.dateLabel);
  if (!match) return record.date;
  const [, year, month, day] = match;
  if (zh) return day ? `${year}年${Number(month)}月${Number(day)}日` : `${year}年${Number(month)}月`;
  const mm = month.padStart(2, "0");
  return day ? `${year}-${mm}-${day.padStart(2, "0")}` : `${year}-${mm}`;
}

/**
 * One archive entry. The closed row shows only date / attribution / title;
 * opening it reveals the result, sources and related entries. The verbatim
 * editorial notes exist in Chinese only, so they sit behind a second, closed
 * disclosure on the Chinese site and are not shown to English readers.
 */
function ArchiveEntry({
  record,
  lang,
  labels,
  related,
  discussion,
}: {
  record: LabArchiveRecord;
  lang: Lang;
  labels: Labels;
  related: RelatedEvent[];
  discussion: DiscussionLabels;
}) {
  const f = labels.fields;
  const zh = lang === "zh";
  const result = zh ? record.result.zh : record.result.en;
  const attribution = zh ? record.attribution.zh : record.attribution.en;
  const nature = zh ? record.nature.zh : record.nature.en;

  const verbatim = (
    <dl className="space-y-3">
      <Field label={f.problem}>{record.problem}</Field>
      <Field label={f.model}>{record.model}</Field>
      <Field label={f.people}>{record.people}</Field>
      <Field label={f.division}>{record.division}</Field>
      <Field label={f.verification}>{record.verification}</Field>
      <Field label={f.scope}>{record.scope}</Field>
      {record.extras.length > 0 && (
        <Field label={f.extras}>
          <ol className="list-decimal space-y-2 pl-5">
            {record.extras.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        </Field>
      )}
    </dl>
  );

  return (
    <details
      id={record.id}
      className="disclosure group scroll-mt-24 border-b border-ink-200 bg-white last:border-b-0"
    >
      {/* Fixed date and badge columns from `sm` up: verbatim date labels vary
          in length, so per-row flex sizing would shift every title sideways. */}
      <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-3 gap-y-1.5 px-4 py-3 transition-colors hover:bg-ink-50 sm:grid sm:grid-cols-[9.5rem_5.5rem_minmax(0,1fr)_auto] sm:gap-y-0 sm:px-5">
        <span className="break-words font-mono text-xs leading-snug text-ink-500">
          {rowDate(record, zh)}
          {record.sample && (
            <>
              {" "}
              <span className="rounded-sm border border-ink-200 bg-ink-50 px-1 py-px text-[10px] text-ink-500">
                {labels.sampleTag}
              </span>
            </>
          )}
        </span>
        <span
          className={`w-fit justify-self-start rounded border px-1.5 py-0.5 font-mono text-[10px] leading-none ${TRACK_CLASS[record.track]}`}
        >
          {labels.badge[record.track]}
        </span>
        <span className="h-item min-w-[12rem] flex-1 sm:min-w-0">
          {zh ? record.title.zh : record.title.en}
        </span>
        <span
          className="disclosure-sign flex h-5 w-5 shrink-0 items-center justify-center rounded border border-ink-300 font-mono text-xs text-ink-600 sm:justify-self-end"
          aria-hidden="true"
        />
      </summary>

      <div className="border-t border-ink-100 px-4 pb-5 pt-4 sm:px-5">
        <dl className="space-y-3">
          <Field label={f.attribution}>
            {attribution}
            {nature && <span className="text-ink-500">　｜　{nature}</span>}
          </Field>
          <Field label={f.result}>{result}</Field>
          <Field label={labels.dateConvention}>
            {zh ? record.dateLabel : record.dateNoteEn}
          </Field>
        </dl>

        {/* The editorial source notes are Chinese-only and stay closed; an
            English reader should not be shown an untranslated audit trail. */}
        {zh && (
          <details className="disclosure verification-toggle mt-4 rounded-md border border-ink-200 bg-ink-50">
            <summary className="flex cursor-pointer items-center justify-between px-3 py-2 font-mono text-[11px] text-ink-600 hover:text-ink-900">
              <span>
                <span className="when-closed">{labels.expand}</span>
                <span className="when-open">{labels.collapse}</span>
              </span>
              <span
                className="disclosure-sign ml-2 inline-flex h-4 w-4 items-center justify-center"
                aria-hidden="true"
              />
            </summary>
            <div className="border-t border-ink-200 px-3 py-4">{verbatim}</div>
          </details>
        )}

        <div className="mt-4 border-t border-ink-100 pt-4">
          <div className="mono-label mb-2">{f.sources}</div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
            {record.sources.map((source) => (
              <li key={`${source.url}-${source.label.zh}`}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-quiet text-[13px]"
                >
                  {zh ? source.label.zh : source.label.en}
                  <span className="ml-1 font-mono text-[10px] text-ink-400">
                    {hostOf(source.url)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {related.length > 0 && (
          <div className="mt-4 border-t border-ink-100 pt-4">
            <div className="mono-label mb-2">{f.related}</div>
            <ul className="space-y-1">
              {related.map((event) => (
                <li key={event.slug}>
                  <Link className="link-quiet text-[13px]" href={`/research/${event.slug}`}>
                    {event.title} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <DiscussionSlot
          labels={discussion}
          sectionId={`discussion-${record.id}`}
          headingId={`discussion-${record.id}-title`}
          fieldId={`discussion-${record.id}-input`}
          headingLevel={3}
          className="mt-6"
        />
      </div>
    </details>
  );
}

/**
 * Frontier-lab research archive. The track filter is the only client state;
 * expansion uses native <details> so the whole archive still works without JS.
 */
export function LabArchive({
  lang,
  labels,
  related,
  discussion,
}: {
  lang: Lang;
  labels: Labels;
  related: Record<string, RelatedEvent[]>;
  discussion: DiscussionLabels;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(
    () => (filter === "all" ? LAB_ARCHIVE : LAB_ARCHIVE.filter((r) => r.track === filter)),
    [filter]
  );
  const groups = useMemo(() => archiveByYear(visible), [visible]);
  const zh = lang === "zh";
  const years = LAB_ARCHIVE.map((record) => Number(record.date.slice(0, 4)));
  const range = `${Math.min(...years)}—${Math.max(...years)}`;

  const options: { value: Filter; label: string }[] = [
    { value: "all", label: labels.filterAll },
    { value: "openai", label: labels.filterOpenai },
    { value: "anthropic", label: labels.filterAnthropic },
    { value: "joint", label: labels.filterJoint },
    { value: "independent", label: labels.filterIndependent },
  ];

  return (
    <section aria-labelledby="lab-archive-title" className="mt-12">
      <div className="section-head">
        <div>
          <div className="mono-label mb-2">{labels.label}</div>
          <h2 id="lab-archive-title" className="h-section">
            {fill(labels.title, { range })}
          </h2>
        </div>
        <span className="font-mono text-xs text-ink-500">
          {fill(visible.length === 1 ? labels.recordCountOne : labels.recordCount, {
            n: visible.length,
          })}
        </span>
      </div>

      <p className="lede mb-2 max-w-3xl">
        {fill(labels.intro, { n: LAB_ARCHIVE.length })}
      </p>
      {visible.some((record) => record.sample) && (
        <p className="mb-4 max-w-3xl text-xs leading-relaxed text-ink-500">{labels.sampleNote}</p>
      )}
      <details className="disclosure mb-5 rounded-md border border-ink-200 bg-ink-50">
        <summary className="flex cursor-pointer items-center justify-between px-3 py-2 font-mono text-[11px] text-ink-600 hover:text-ink-900">
          <span>{labels.readingTitle}</span>
          <span
            className="disclosure-sign ml-2 inline-flex h-4 w-4 items-center justify-center"
            aria-hidden="true"
          />
        </summary>
        <p className="border-t border-ink-200 px-3 py-3 text-[13px] leading-relaxed text-ink-600">
          {labels.caveat}
        </p>
      </details>

      <div className="mb-6 flex flex-wrap items-center gap-2" role="group" aria-label={labels.label}>
        {options.map((option) => {
          const count = option.value === "all"
            ? LAB_ARCHIVE.length
            : LAB_ARCHIVE.filter((r) => r.track === option.value).length;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              aria-pressed={filter === option.value}
              className={`chip transition-colors ${filter === option.value ? "chip-active" : "hover:border-ink-300 hover:bg-ink-50"}`}
            >
              {option.label}
              <span className="ml-1.5 font-mono text-[10px] text-ink-400">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-9">
        {groups.map((group) => (
          <section key={group.year} id={`lab-year-${group.year}`} className="scroll-mt-24">
            <div className="mb-3 flex items-baseline justify-between gap-4 border-b border-ink-200 pb-2">
              <h3 className="text-lg font-semibold tracking-tight text-ink-900">
                {fill(labels.yearOnly, { y: group.year })}
              </h3>
              <span className="font-mono text-xs text-ink-500">
                {fill(
                  group.records.length === 1 ? labels.yearCountOne : labels.yearCount,
                  { y: group.year, n: group.records.length }
                )}
              </span>
            </div>
            <div className="border border-ink-200">
              {group.records.map((record) => (
                <ArchiveEntry
                  key={record.id}
                  record={record}
                  lang={lang}
                  labels={labels}
                  related={related[record.id] ?? []}
                  discussion={discussion}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <details className="disclosure mt-8 rounded-md border border-ink-200 bg-white">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-ink-800 hover:bg-ink-50">
          {labels.baselinesTitle}
          <span className="ml-2 font-mono text-[11px] text-ink-400">{LAB_BASELINES.length}</span>
        </summary>
        <div className="border-t border-ink-100 px-4 py-4">
          <p className="mb-3 text-xs leading-relaxed text-ink-500">{labels.baselinesHint}</p>
          <ul className="space-y-3">
            {LAB_BASELINES.map((baseline) => (
              <li key={baseline.date} className="grid gap-1 sm:grid-cols-[7rem_1fr] sm:gap-4">
                <span className="font-mono text-xs text-ink-500">{baseline.date}</span>
                <span className="text-[13px] leading-relaxed text-ink-700">
                  {zh ? baseline.zh : baseline.en}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </details>

      <p className="mt-6 border-t border-ink-200 pt-4 text-xs leading-relaxed text-ink-500">
        {labels.sourceNote}
      </p>
    </section>
  );
}
