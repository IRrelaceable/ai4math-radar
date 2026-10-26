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

      {/* Two-column layout: the narrative stays a single readable column, and
          a slim right rail carries only the five compressed metadata rows the
          spec asks for. The rail drops below the body on narrow screens. */}
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0 max-w-3xl">
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

        {/* Key facts — derived purely from existing structured fields.
            Short auto-ingested entries leave the narrative thin, so this
            section surfaces everything the record already knows: the event
            class, the research subtype, where it came from, when it was
            recorded, and what would count as checking it. No new prose is
            generated; every row points at a real field. */}
        <KeyFactsSection event={event} />

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

        {/* Related works — first 3 shown, rest behind a toggle. Renders
            nothing when no lineage is recorded. */}
        <RelatedWorksSection event={event} />

        {/* More in this area — sits right after Related Works so that when an
            event has no curated lineage (64% of them), the column still gets
            real content here instead of ending at a dead placeholder. */}
        {event.researchArea && (
          <section className="mt-9 border-t border-ink-200 pt-7">
            <SectionTitle>
              {d.detail.moreIn.replace("{area}", event.researchArea)}
            </SectionTitle>
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

        {/* Timeline */}
        <section className="mt-7">
          <SectionTitle>{d.detail.timeline}</SectionTitle>
          <div className="mt-3">
            <LineageTimeline event={event} />
          </div>
        </section>

        {/* Verification history — collapsed by default. */}
        <VerificationHistorySection event={event} />

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

        {/* Compressed right rail — exactly the five metadata rows the spec
            calls for. No paper card, no duplicated links; on mobile the grid
            stacks it below the narrative. */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <dl className="divide-y divide-ink-100 border-t border-ink-200 text-sm">
            <MetaRow label={d.detail.metaEventType}>
              {event.eventType ? (
                <span className="text-ink-800">{d.trust.type[event.eventType]}</span>
              ) : (
                <span className="text-ink-400">—</span>
              )}
            </MetaRow>
            <MetaRow label={d.detail.metaResearchArea}>
              {event.researchArea ? (
                <Link
                  href={`/topics/${slugify(event.researchArea)}`}
                  className="link-quiet text-ink-800"
                >
                  {event.researchArea}
                  {event.subArea && (
                    <span className="block text-xs text-ink-500">{event.subArea}</span>
                  )}
                </Link>
              ) : (
                <span className="text-ink-400">—</span>
              )}
            </MetaRow>
            <MetaRow label={d.detail.metaVerification}>
              {event.verificationStatus ? (
                <VerificationBadge status={event.verificationStatus} />
              ) : (
                <span className="text-ink-400">—</span>
              )}
            </MetaRow>
            <MetaRow label={d.detail.metaEvidence}>
              {event.evidenceLevel ? (
                <EvidenceLevelPill level={event.evidenceLevel} />
              ) : (
                <span className="text-ink-400">—</span>
              )}
            </MetaRow>
            <MetaRow label={d.detail.metaSourceTier}>
              {event.sourceTier ? (
                <SourceTierPill tier={event.sourceTier} />
              ) : (
                <span className="text-ink-400">—</span>
              )}
            </MetaRow>
          </dl>
          {event.provenance === "automated" && (
            <p className="mt-3 text-xs text-ink-500">{d.common.automatedHint}</p>
          )}
        </aside>
      </div>
    </div>
  );
}

/** One metadata row in the right rail: mono label above, value below. */
function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-2.5">
      <dt className="mono-label normal-case tracking-normal">{label}</dt>
      <dd className="mt-1 text-ink-800">{children}</dd>
    </div>
  );
}

/**
 * "Key facts" — a structured restatement of what the record already knows.
 *
 * Auto-ingested entries often have only a short summary and no significance
 * or key contributions, which leaves the narrative column looking empty. This
 * section fills that gap without inventing any prose: every row is a real
 * field on the event (class, research subtype, source, record date, authors,
 * and what the trust model says would count as checking it). It renders
 * nothing when there is nothing to say, so curated events with a full
 * narrative are unaffected.
 */
function KeyFactsSection({ event }: { event: ResearchEvent }) {
  const lang = getLang();
  const d = t(lang);
  const facts: { label: string; value: React.ReactNode }[] = [];

  // What this is: the research subtype when present (e.g. Proof, Benchmark).
  if (event.researchEventType) {
    facts.push({
      label: d.detail.keyFactsSubtype,
      value: <span className="text-ink-800">{event.researchEventType}</span>,
    });
  }

  // Where it came from, with the source type spelled out.
  if (event.sourceType || event.sourceUrl) {
    facts.push({
      label: d.detail.keyFactsWho,
      value: event.sourceUrl ? (
        <a
          href={event.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="link-quiet text-ink-800"
        >
          {event.sourceType ?? new URL(event.sourceUrl).hostname}
        </a>
      ) : (
        <span className="text-ink-800">{event.sourceType}</span>
      ),
    });
  }

  // When it entered the tracker.
  facts.push({
    label: d.detail.keyFactsRecord,
    value: (
      <span className="text-ink-800">
        {formatDateLong(event.lastSyncedAt ?? event.createdAt ?? event.date, lang)}
      </span>
    ),
  });

  // What would count as checking this: the evidence level's own definition,
  // stated in plain terms so a reader knows what the badge means.
  if (event.evidenceLevel) {
    facts.push({
      label: d.detail.keyFactsCheck,
      value: <span className="text-ink-800">{d.trust.evidence[event.evidenceLevel]}</span>,
    });
  }

  // People or orgs attached to the event, when the record names them.
  if (event.authors.length > 0) {
    facts.push({
      label: d.detail.keyFactsAuthors,
      value: <span className="text-ink-800">{event.authors.join("、")}</span>,
    });
  }

  if (facts.length === 0) return null;

  return (
    <section className="mt-7">
      <SectionTitle>{d.detail.keyFacts}</SectionTitle>
      <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {facts.map((f) => (
          <div key={f.label} className="min-w-0">
            <dt className="mono-label normal-case tracking-normal">{f.label}</dt>
            <dd className="mt-0.5 text-sm leading-relaxed text-ink-700">{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
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
