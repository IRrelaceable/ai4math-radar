import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/db";
import type { ResearchEvent } from "@/types";
import { formatDateLong, slugify } from "@/lib/utils";
import { AreaBadge } from "@/components/ui/AreaBadge";
import {
  EvidenceLevelPill,
  EventTypePill,
  SourceTierPill,
  VerificationBadge,
} from "@/components/ui/TrustBadges";
import { LineageTimeline } from "@/components/research/LineageTimeline";
import { EventCard } from "@/components/research/EventCard";
import {
  RelatedWorksSection,
  VerificationHistorySection,
} from "@/components/research/DetailSections";
import { getLang, t } from "@/lib/i18n/server";
import { localizeEvent, localizeEvents } from "@/lib/i18n/localize";
import { pagesDict } from "@/lib/i18n/dict.pages";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const lang = getLang();
  const event = await getStore().getEventBySlug(params.slug);
  return { title: event ? localizeEvent(event, lang).title : "Ecosystem event" };
}

/** Related works shown before the "show more" button. */
const RELATED_PREVIEW_COUNT = 3;

export default async function ResearchDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = getStore();
  const lang = getLang();
  const d = t(lang);
  const p = pagesDict[lang];
  const found = await store.getEventBySlug(params.slug);
  if (!found) notFound();
  const event = localizeEvent(found, lang);

  const siblings = event.researchArea
    ? localizeEvents(
        (await store.listEvents({ area: event.researchArea, limit: 10 })).filter(
          (e) => e.slug !== event.slug
        ),
        lang
      )
    : [];
  const relatedEvents = siblings.slice(0, 3);

  const papers = event.papers ?? [];
  const primaryPaperUrl = event.paperUrl ?? papers[0]?.url;
  const isResearch = event.eventType === undefined || event.eventType === "Research";

  return (
    <div className="container-page py-10">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-ink-500">
        <Link href="/latest" className="link-quiet">
          {d.nav.latest}
        </Link>
        {event.researchArea && (
          <>
            <span className="mx-2 text-ink-300">/</span>
            <Link href={`/topics/${slugify(event.researchArea)}`} className="link-quiet">
              {event.researchArea}
            </Link>
          </>
        )}
        <span className="mx-2 text-ink-300">/</span>
        <span className="text-ink-700">{p.detail.crumbEvent}</span>
      </div>

      {/* Single-column narrative layout — no sidebar rail on desktop.
          The metadata block (area, trust, source) moves inline under the title,
          so the reader gets the full context without a second column. */}
      <div className="max-w-3xl">
        {/* Header: type + area + date on one line, then title. */}
        <div className="flex flex-wrap items-center gap-2">
          {event.eventType && <EventTypePill type={event.eventType} />}
          {event.researchArea && (
            <span className="text-xs text-ink-500">
              {event.subArea
                ? `${event.researchArea} · ${event.subArea}`
                : event.researchArea}
            </span>
          )}
          <span className="font-mono text-xs text-ink-500">
            {formatDateLong(event.date, lang)}
          </span>
          {event.isDemo && (
            <span className="chip border-dashed border-ink-300 text-ink-400">
              {p.detail.demoEntry}
            </span>
          )}
        </div>

        <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px]">
          {event.title}
        </h1>

        {/* Compact trust line — evidence, tier, verification in one row. */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-b border-ink-100 pb-4">
          {event.evidenceLevel && <EvidenceLevelPill level={event.evidenceLevel} />}
          {event.sourceTier && <SourceTierPill tier={event.sourceTier} />}
          {event.verificationStatus && (
            <VerificationBadge status={event.verificationStatus} />
          )}
          {event.provenance === "automated" && (
            <span className="chip border-violet-200 bg-violet-50 text-violet-700">
              {d.common.automated}
            </span>
          )}
        </div>

        {/* What happened */}
        <section className="mt-7">
          <SectionTitle>{d.detail.whatHappened}</SectionTitle>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-700">{event.summary}</p>
          {event.problem && (
            <div className="mt-4 rounded-md border border-ink-200 bg-ink-50 p-4">
              <div className="mono-label mb-1">{d.detail.problemAddressed}</div>
              <p className="text-sm leading-relaxed text-ink-700">{event.problem}</p>
            </div>
          )}
        </section>

        {/* Why it matters */}
        {event.significance?.trim() && (
          <section className="mt-7">
            <SectionTitle>{d.detail.whyMatters}</SectionTitle>
            <div className="mt-2 border-l-2 border-accent-400 pl-4">
              <p className="text-[15px] leading-relaxed text-ink-700">{event.significance}</p>
            </div>
          </section>
        )}

        {/* Key contribution */}
        {event.keyContributions && event.keyContributions.length > 0 && (
          <section className="mt-7">
            <SectionTitle>{d.detail.keyContribution}</SectionTitle>
            <ul className="mt-2 space-y-2">
              {event.keyContributions.map((c) => (
                <li key={c} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-600" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Original source — appears exactly once, never duplicated in a sidebar. */}
        <section className="mt-7">
          <SectionTitle>
            {isResearch ? d.detail.relatedPaper : d.detail.source}
          </SectionTitle>
          <div className="card divide-y divide-ink-100">
            {papers.length === 0 && isResearch && (
              <div className="px-4 py-3 text-sm text-ink-500">
                {event.githubUrl ? (
                  d.detail.papersInRepo
                ) : event.paperUrl ? (
                  d.detail.paperIsSource
                ) : (
                  <>
                    {d.detail.noPaper}{" "}
                    <span className="text-ink-700">{event.sourceType}</span>
                    {p.detail.noPaperSuffix}
                  </>
                )}
              </div>
            )}
            {papers.map((paper) => (
              <div key={paper.title} className="px-4 py-3">
                <div className="text-sm font-medium">
                  {paper.url ? (
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent-700"
                    >
                      {paper.title}
                    </a>
                  ) : (
                    paper.title
                  )}
                </div>
                <div className="mono-label mt-1 normal-case tracking-normal">
                  {[paper.venue, paper.year].filter(Boolean).join(" · ") ||
                    p.detail.venueMissing}
                </div>
              </div>
            ))}
            {event.sourceUrl && (
              <div className="px-4 py-3">
                <a
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-accent-700 hover:underline"
                >
                  {d.detail.readOriginal} →
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Related works — first 3 shown, rest behind a toggle. */}
        <RelatedWorksSection event={event} />

        {/* Timeline */}
        <section className="mt-7">
          <SectionTitle>{d.detail.timeline}</SectionTitle>
          <div className="mt-3">
            <LineageTimeline event={event} />
          </div>
        </section>

        {/* Verification history — collapsed by default. */}
        <VerificationHistorySection event={event} />

        {/* More in this area — 3 cards, no sidebar duplication. */}
        {event.researchArea && (
          <section className="mt-9 border-t border-ink-200 pt-7">
            <h2 className="text-lg font-semibold tracking-tight">
              {d.detail.moreIn} {event.researchArea}
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {relatedEvents.slice(0, 3).map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
            {relatedEvents.length === 0 && (
              <p className="mt-3 text-sm text-ink-500">{d.detail.noOtherEvents}</p>
            )}
          </section>
        )}

        {/* Ecosystem metadata — moved from sidebar to bottom of narrative. */}
        <EcosystemDetails event={event} />

        {/* Attached artifacts — moved from sidebar. */}
        {(event.model?.length ?? 0) +
          (event.benchmark?.length ?? 0) +
          (event.dataset?.length ?? 0) >
          0 && (
          <section className="mt-7">
            <h2 className="text-lg font-semibold tracking-tight">
              {d.detail.attachedArtifacts}
            </h2>
            <div className="mt-3">
              <Facet label={d.detail.model} values={event.model ?? []} param="model" />
              <Facet
                label={d.detail.benchmark}
                values={event.benchmark ?? []}
                param="benchmark"
              />
              <Facet label={d.detail.dataset} values={event.dataset ?? []} param="dataset" />
            </div>
          </section>
        )}

        {/* Authors — moved from sidebar. */}
        {(event.authors.length > 0 || event.institution) && (
          <section className="mt-7">
            <h2 className="text-lg font-semibold tracking-tight">
              {d.detail.authorsInstitution}
            </h2>
            {event.authors.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm text-ink-700">
                {event.authors.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            ) : (
              <div className="mt-2 text-sm text-ink-400">{d.detail.authorsMissing}</div>
            )}
            {event.institution && (
              <div className="mt-2 text-sm text-ink-700">{event.institution}</div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function EcosystemDetails({ event }: { event: ResearchEvent }) {
  const d = t(getLang());
  const m = event.metadata;
  if (!m) return null;

  const hasPeople = (m.people?.length ?? 0) > 0;
  const hasInitiatives =
    (m.initiatives?.length ?? 0) > 0 || (m.projects?.length ?? 0) > 0;
  const rows: { label: string; value: React.ReactNode }[] = [];

  if (m.funding) {
    rows.push({ label: d.detail.fundingOrganization, value: m.funding.organization ?? "—" });
    rows.push({ label: d.detail.fundingRecipient, value: m.funding.recipient ?? "—" });
    rows.push({
      label: d.detail.amount,
      value: m.funding.amount
        ? `${m.funding.currency ?? ""}${m.funding.amount}`.trim()
        : m.funding.amountDisclosure ?? d.detail.amountNotDisclosed,
    });
  }

  if (m.education) {
    rows.push({ label: d.detail.educationInstitution, value: m.education.institution ?? "—" });
    rows.push({ label: d.detail.department, value: m.education.department ?? "—" });
    rows.push({ label: d.detail.courseName, value: m.education.courseName ?? "—" });
    rows.push({ label: d.detail.courseCode, value: m.education.courseCode ?? "—" });
    rows.push({ label: d.detail.instructor, value: m.education.instructor ?? "—" });
    rows.push({ label: d.detail.period, value: m.education.period ?? "—" });
    rows.push({ label: d.detail.description, value: m.education.description ?? "—" });
  }

  if (m.policy) {
    rows.push({ label: d.detail.policyKind, value: m.policy.kind ?? "—" });
    rows.push({ label: d.detail.community, value: m.policy.community ?? "—" });
    rows.push({ label: d.detail.issue, value: m.policy.issue ?? "—" });
    rows.push({
      label: d.detail.participants,
      value: (m.policy.participants ?? []).join(", ") || "—",
    });
  }

  if (!hasPeople && !hasInitiatives && rows.length === 0) return null;

  return (
    <section className="mt-7">
      <h2 className="text-lg font-semibold tracking-tight">{d.detail.ecosystemDetails}</h2>

      {hasPeople && (
        <div className="mt-3">
          <div className="mono-label mb-1">{d.detail.people}</div>
          <ul className="space-y-2">
            {m.people!.map((person) => (
              <li key={person.name} className="text-sm text-ink-700">
                <div className="font-medium">{person.name}</div>
                {person.role && <div className="text-xs text-ink-500">{person.role}</div>}
                {person.viewpoint && (
                  <p className="mt-1 border-l-2 border-ink-200 pl-2 text-xs leading-relaxed text-ink-600">
                    {person.viewpoint}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasInitiatives && (
        <div className="mt-3 space-y-2">
          {m.initiatives && m.initiatives.length > 0 && (
            <div>
              <div className="mono-label mb-1">{d.detail.initiatives}</div>
              <div className="flex flex-wrap gap-1.5">
                {m.initiatives.map((v) => (
                  <span key={v} className="chip">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}
          {m.projects && m.projects.length > 0 && (
            <div>
              <div className="mono-label mb-1">{d.detail.projects}</div>
              <div className="flex flex-wrap gap-1.5">
                {m.projects.map((v) => (
                  <span key={v} className="chip">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {rows.length > 0 && (
        <dl className="mt-3 divide-y divide-ink-100 border-t border-ink-100">
          {rows.map((row) => (
            <div key={row.label} className="grid gap-1 py-2 sm:grid-cols-[7rem_1fr]">
              <dt className="mono-label normal-case tracking-normal">{row.label}</dt>
              <dd className="text-xs leading-relaxed text-ink-700">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold tracking-tight text-ink-900">{children}</h2>
  );
}

function Facet({
  label,
  values,
  param,
}: {
  label: string;
  values: string[];
  param: "model" | "benchmark" | "dataset";
}) {
  if (values.length === 0) return null;
  return (
    <div className="mb-3 last:mb-0">
      <div className="mono-label mb-1">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <Link
            key={v}
            href={`/latest?${param}=${encodeURIComponent(v)}`}
            className="chip hover:border-ink-300 hover:text-ink-900"
          >
            {v}
          </Link>
        ))}
      </div>
    </div>
  );
}
