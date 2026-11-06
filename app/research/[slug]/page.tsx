import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/db";
import type { ResearchEvent } from "@/types";
import { formatDateLong, slugify, sourceHost } from "@/lib/utils";
import {
  AiRolePill,
  EvidenceLevelPill,
  EventTypePill,
  SourceTierPill,
  VerificationStatusPill,
} from "@/components/ui/TrustBadges";
import { LineageTimeline } from "@/components/research/LineageTimeline";
import { EventCard } from "@/components/research/EventCard";
import { EntityThreads } from "@/components/research/EntityThreads";
import { buildEntityThreads, threadsForEvent } from "@/lib/entities";
import { VerificationHistorySection } from "@/components/research/DetailSections";
import { TocNav } from "@/components/layout/TocNav";
import { BackToTop } from "@/components/ui/BackToTop";
import { getLang, t } from "@/lib/i18n/server";
import { localizeEvent, localizeEvents, displayArea, displaySubArea } from "@/lib/i18n/localize";
import { pagesDict } from "@/lib/i18n/dict.pages";

/** Every stored event gets its own page; unknown slugs are not exported. */
export async function generateStaticParams() {
  const events = await getStore().listEvents();
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const lang = getLang();
  const event = await getStore().getEventBySlug(params.slug);
  return { title: event ? localizeEvent(event, lang).title : "Ecosystem event" };
}

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

  // One store pass powers both contextual blocks: the entity threads and the
  // chronological neighbours in the same research area.
  const allEvents = await store.listEvents();
  const entityThreads = threadsForEvent(
    buildEntityThreads(allEvents),
    event.slug,
    Number.POSITIVE_INFINITY
  );
  const eventThreads = entityThreads
    .slice(0, 3)
    .map((thread) => ({ ...thread, events: localizeEvents(thread.events, lang) }));
  const otherThreads = entityThreads.slice(3).map(({ kind, name }) => ({ kind, name }));
  const areaTimeline = event.researchArea
    ? allEvents.filter((candidate) => candidate.researchArea === event.researchArea)
    : event.eventType
      ? allEvents.filter((candidate) => candidate.eventType === event.eventType)
      : [];
  const neighbourPool = areaTimeline.sort(
    (a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug)
  );
  const areaIndex = neighbourPool.findIndex((candidate) => candidate.slug === event.slug);
  const neighbourEvents =
    areaIndex >= 0
      ? localizeEvents(
          [
            ...neighbourPool.slice(Math.max(0, areaIndex - 2), areaIndex),
            ...neighbourPool.slice(areaIndex + 1, areaIndex + 3),
          ],
          lang
        )
      : [];

  const papers = event.papers ?? [];
  /** The one action a reader most likely wants: open the paper/source. */
  const primaryUrl = event.paperUrl ?? papers[0]?.url ?? event.sourceUrl;
  const isResearch = event.eventType === undefined || event.eventType === "Research";
  // When the paper list already links to the same URL as the header action,
  // repeating it at the bottom of the card adds nothing. With no paper list
  // the link is the section's only content, so it always renders.
  const sourceLinkIsPrimary =
    papers.length > 0 && event.sourceUrl !== undefined && event.sourceUrl === primaryUrl;
  // Most events carry no curated lineage, so the related block only earns a
  // place on the page when there is something in it. Lineage renders as a
  // three-stage diagram; works that are merely "related" are listed under it
  // rather than repeated in a second grid.
  const hasLineage = event.relatedWorks.some(
    (work) => work.relation === "previous" || work.relation === "followup"
  );
  const relatedOnly = event.relatedWorks.filter(
    (work) => work.relation !== "previous" && work.relation !== "followup"
  );
  const hasArtifacts =
    (event.model?.length ?? 0) +
      (event.benchmark?.length ?? 0) +
      (event.dataset?.length ?? 0) >
    0;
  // Some curated records list the institution itself as the author; printing
  // it twice ("Simons Foundation" over "Simons Foundation") reads as filler.
  const institution = event.institution?.trim();
  const authors = institution
    ? event.authors.filter((name) => name.trim().toLowerCase() !== institution.toLowerCase())
    : event.authors;
  const hasAuthors = authors.length > 0 || Boolean(institution);
  const meta = event.metadata;
  const hasEcosystem = Boolean(
    meta &&
      ((meta.people?.length ?? 0) > 0 ||
        (meta.initiatives?.length ?? 0) > 0 ||
        (meta.projects?.length ?? 0) > 0 ||
        meta.funding ||
        meta.education ||
        meta.policy)
  );

  // Only sections that actually render are linked, so the rail never points
  // at an anchor this particular record does not have.
  const toc = [
    { id: "what", label: d.detail.whatHappened },
    ...(keyFactsVisible(event) ? [{ id: "facts", label: d.detail.keyFacts }] : []),
    ...(event.aiRole && event.aiRole.level !== "not_applicable"
      ? [{ id: "ai-role", label: d.detail.aiRole }]
      : []),
    ...(event.significance?.trim() ? [{ id: "why", label: d.detail.whyMatters }] : []),
    ...((event.keyContributions?.length ?? 0) > 0
      ? [{ id: "contributions", label: d.detail.keyContribution }]
      : []),
    ...(papers.length > 0 || event.sourceUrl
      ? [
          {
            id: "source",
            label: isResearch && papers.length > 0 ? d.detail.relatedPaper : d.detail.source,
          },
        ]
      : []),
    ...(event.relatedWorks.length > 0
      ? [{ id: "related", label: d.detail.relatedWorks }]
      : []),
    ...(eventThreads.length > 0
      ? [{ id: "thread", label: d.detail.thread }]
      : []),
    ...((event.verificationHistory?.length ?? 0) > 0
      ? [{ id: "verification", label: d.detail.verificationHistory }]
      : []),
    ...(event.researchArea || event.eventType
      ? [
          {
            id: "more",
            label: event.researchArea
              ? d.detail.areaAround.replace("{area}", displayArea(event.researchArea, lang))
              : d.detail.typeAround.replace("{type}", d.trust.type[event.eventType!]),
          },
        ]
      : []),
    ...(hasEcosystem ? [{ id: "ecosystem", label: d.detail.ecosystemDetails }] : []),
    ...(hasArtifacts ? [{ id: "artifacts", label: d.detail.attachedArtifacts }] : []),
    ...(hasAuthors ? [{ id: "authors", label: d.detail.authorsInstitution }] : []),
  ];

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
              {displayArea(event.researchArea, lang)}
            </Link>
          </>
        )}
        <span className="mx-2 text-ink-300">/</span>
        <span className="text-ink-700">{p.detail.crumbEvent}</span>
      </div>

      {/* Below lg the rail is dropped, so the same section links fold into a
          native disclosure above the article instead of sitting at the end. */}
      <details className="mb-6 rounded-md border border-ink-200 px-4 py-3 lg:hidden">
        <summary className="cursor-pointer list-none font-mono text-xs text-ink-600">
          {d.detail.tocLabel}
        </summary>
        <TocNav items={toc} label={d.detail.tocLabel} className="mt-3" />
      </details>

      {/* Two-column layout: the narrative stays a single readable column; the
          rail is a table of contents, so on narrow screens it is simply
          dropped rather than pushed below the article. */}
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0 max-w-3xl">
        {/* Header: type + area + date on one line, then title. */}
        <div className="flex flex-wrap items-center gap-2">
          {event.eventType && <EventTypePill type={event.eventType} />}
          {event.researchArea && (
            <span className="text-xs text-ink-500">
              {event.subArea
                ? `${displayArea(event.researchArea, lang)} · ${displaySubArea(event.subArea, lang)}`
                : displayArea(event.researchArea, lang)}
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

        {/* Compact trust line — evidence, tier, provenance — plus the page's
            primary action, so the original paper is one click from the title. */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-b border-ink-100 pb-4">
          {event.evidenceLevel && <EvidenceLevelPill level={event.evidenceLevel} />}
          {event.sourceTier && <SourceTierPill tier={event.sourceTier} />}
          {event.verificationStatus && (
            <VerificationStatusPill status={event.verificationStatus} />
          )}

          {event.provenance === "automated" && (
            <span className="chip border-violet-200 bg-violet-50 text-violet-700">
              {d.common.automated}
            </span>
          )}

          <span className="ml-auto flex items-center gap-2">
            {primaryUrl && (
              <a
                href={primaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                {d.detail.readOriginal} ↗
              </a>
            )}
            {event.githubUrl && event.githubUrl !== primaryUrl && (
              <a
                href={event.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                {d.common.github} ↗
              </a>
            )}
          </span>
        </div>

        {/* What happened */}
        <section id="what" className="mt-7 scroll-mt-24">
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
            section surfaces everything the record already knows: the research
            subtype, where it came from, when it was recorded, and what would
            count as checking it. No new prose is generated; every row points
            at a real field. */}
        <KeyFactsSection event={event} />

        {/* AI attribution — only when the source says how the reported result
            was divided between AI systems and humans. Tooling, benchmark and
            institutional events carry no attribution and skip the section. */}
        <AiAttributionSection event={event} />

        {/* Why it matters */}
        {event.significance?.trim() && (
          <section id="why" className="mt-7 scroll-mt-24">
            <SectionTitle>{d.detail.whyMatters}</SectionTitle>
            <div className="mt-2 border-l-2 border-accent-400 pl-4">
              <p className="text-[15px] leading-relaxed text-ink-700">{event.significance}</p>
            </div>
          </section>
        )}

        {/* Key contribution */}
        {event.keyContributions && event.keyContributions.length > 0 && (
          <section id="contributions" className="mt-7 scroll-mt-24">
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

        {/* Original source — appears exactly once, never duplicated in a
            sidebar. Renders nothing when the record carries neither a paper
            list nor a source link, so the heading never sits above a lone
            "read the original" link. */}
        {(papers.length > 0 || event.sourceUrl) && (
          <section id="source" className="mt-7 scroll-mt-24">
            <SectionTitle>
              {isResearch && papers.length > 0 ? d.detail.relatedPaper : d.detail.source}
            </SectionTitle>
            <div className="card divide-y divide-ink-100">
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
              {event.sourceUrl && !sourceLinkIsPrimary && (
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
        )}

        {/* Related works — one block. Lineage events get the three-stage
            diagram; works that are merely "related" (not predecessor or
            follow-up) are listed underneath instead of repeating the same
            titles in a second card grid. */}
        {event.relatedWorks.length > 0 && (
          <section id="related" className="mt-7 scroll-mt-24">
            <SectionTitle>{d.detail.relatedWorks}</SectionTitle>
            {hasLineage && (
              <div className="mt-3">
                <LineageTimeline event={event} />
              </div>
            )}
            {relatedOnly.length > 0 && (
              <div className={hasLineage ? "mt-4" : "mt-2"}>
                {hasLineage && <div className="mono-label mb-1.5">{d.detail.related}</div>}
                <ul className="grid gap-2 sm:grid-cols-2">
                  {relatedOnly.map((work) => (
                    <li key={work.title} className="card px-4 py-3">
                      <div className="text-sm font-medium">
                        {work.url ? (
                          <a
                            href={work.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-accent-700"
                          >
                            {work.title}
                          </a>
                        ) : (
                          work.title
                        )}
                      </div>
                      {work.note && <div className="mt-1 text-xs text-ink-500">{work.note}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Entity threads — the event on the timeline of every named person,
            institution, project and system the record states. */}
        {eventThreads.length > 0 && (
          <EntityThreads
            threads={eventThreads}
            others={otherThreads}
            currentSlug={event.slug}
            labels={{
              title: d.detail.thread,
              intro: d.detail.threadIntro,
              current: d.detail.threadCurrent,
              count: d.detail.threadCount,
              start: d.detail.threadStart,
              latest: d.detail.threadLatest,
              position: d.detail.threadPosition,
              expandEarlier: d.detail.threadExpandEarlier,
              expandLater: d.detail.threadExpandLater,
              others: d.detail.threadOthers,
              kinds: d.detail.threadKinds,
            }}
          />
        )}

        {/* Verification history — collapsed by default. */}
        <VerificationHistorySection event={event} />

        {/* Around this event — chronological neighbours in the same area, or
            in the same event class when the record has no research area
            (people, institutions, funding, policy). */}
        {(event.researchArea || event.eventType) && (
          <section id="more" className="mt-9 scroll-mt-24 border-t border-ink-200 pt-7">
            <SectionTitle>
              {event.researchArea
                ? d.detail.areaAround.replace("{area}", displayArea(event.researchArea, lang))
                : d.detail.typeAround.replace("{type}", d.trust.type[event.eventType!])}
            </SectionTitle>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {neighbourEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
            {neighbourEvents.length === 0 && (
              <p className="mt-3 text-sm text-ink-500">
                {event.researchArea ? d.detail.noOtherEvents : d.detail.noOtherTypeEvents}
              </p>
            )}
          </section>
        )}

        {/* Ecosystem metadata — moved from sidebar to bottom of narrative. */}
        <EcosystemDetails event={event} />

        {/* Attached artifacts — moved from sidebar. */}
        {hasArtifacts && (
          <section id="artifacts" className="mt-7 scroll-mt-24">
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
        {hasAuthors && (
          <section id="authors" className="mt-7 scroll-mt-24">
            <h2 className="text-lg font-semibold tracking-tight">
              {d.detail.authorsInstitution}
            </h2>
            {authors.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-ink-700">
                {authors.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            )}
            {institution && (
              <div className="mt-2 text-sm text-ink-700">{institution}</div>
            )}
          </section>
        )}
        </div>

        {/* Right rail — a scroll-spy table of contents instead of a second
            copy of the badges printed above the fold. The only facts kept
            here are the ones the narrative never states: when the record was
            created, when it was last synced, and how it got here. The TOC is
            hidden below lg (it would sit under the whole article); the facts
            still stack at the bottom. Sticky offset clears the 56px header. */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <TocNav items={toc} label={d.detail.tocLabel} />
          <dl className="mt-6 divide-y divide-ink-100 border-t border-ink-200 text-sm">
            <MetaRow label={d.detail.keyFactsRecord}>
              {formatDateLong(event.createdAt ?? event.date, lang)}
            </MetaRow>
            {event.lastSyncedAt && (
              <MetaRow label={d.detail.lastSynced}>
                {formatDateLong(event.lastSyncedAt, lang)}
              </MetaRow>
            )}
            <MetaRow label={d.detail.metaProvenance}>
              {event.provenance === "automated"
                ? d.common.automated
                : d.detail.provenanceCurated}
            </MetaRow>
          </dl>
          <p className="mt-3 text-xs text-ink-500">
            {event.provenance === "automated"
              ? d.common.automatedHint
              : d.detail.provenanceCuratedHint}
          </p>
        </aside>
      </div>
      <BackToTop label={d.common.backToTop} />
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
 * field on the event (research subtype, source, and what the trust model says
 * would count as checking it). Curated events with a full narrative are
 * unaffected, and the record date stays in the rail where it always shows.
 */
function keyFactsVisible(event: ResearchEvent): boolean {
  const hasNarrative = Boolean(
    event.significance?.trim() || (event.keyContributions?.length ?? 0) > 0
  );
  return event.provenance === "automated" || !hasNarrative;
}

function KeyFactsSection({ event }: { event: ResearchEvent }) {
  const lang = getLang();
  const d = t(lang);
  if (!keyFactsVisible(event)) return null;

  const facts: { label: string; value: React.ReactNode }[] = [];

  // What this is: the research subtype when present (e.g. Proof, Benchmark).
  if (event.researchEventType) {
    facts.push({
      label: d.detail.keyFactsSubtype,
      value: <span className="text-ink-800">{d.trust.researchType[event.researchEventType]}</span>,
    });
  }

  // Where it came from: the outlet's host reads better than the raw class
  // ("news"), and it is what a reader would check against the link.
  const outlet = sourceHost(event.sourceUrl) ?? event.sourceType;
  if (outlet) {
    facts.push({
      label: d.detail.keyFactsWho,
      value: event.sourceUrl ? (
        <a
          href={event.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="link-quiet text-ink-800"
        >
          {outlet}
        </a>
      ) : (
        <span className="text-ink-800">{outlet}</span>
      ),
    });
  }

  // What would count as checking this: the evidence level's own definition,
  // stated in plain terms so a reader knows what the badge means.
  if (event.evidenceLevel) {
    facts.push({
      label: d.detail.keyFactsCheck,
      value: <span className="text-ink-800">{d.trust.evidence[event.evidenceLevel]}</span>,
    });
  }

  // The record date lives in the rail, so it is not repeated here.
  if (facts.length === 0) return null;

  return (
    <section id="facts" className="mt-7 scroll-mt-24">
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

function AiAttributionSection({ event }: { event: ResearchEvent }) {
  const lang = getLang();
  const d = t(lang);
  const role = event.aiRole;
  if (!role || role.level === "not_applicable") return null;

  return (
    <section id="ai-role" className="mt-7 scroll-mt-24">
      <SectionTitle>{d.detail.aiRole}</SectionTitle>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <AiRolePill level={role.level} />
      </div>
      {role.description ? (
        <p className="mt-2 text-[15px] leading-relaxed text-ink-700">{role.description}</p>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-ink-500">{d.detail.aiRoleHint}</p>
      )}
      {event.humanContribution && (
        <div className="mt-4 rounded-md border border-ink-200 bg-ink-50 p-4">
          <div className="mono-label mb-1">{d.detail.humanContribution}</div>
          <p className="text-sm leading-relaxed text-ink-700">{event.humanContribution}</p>
        </div>
      )}
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

  // Automated extraction omits what the source does not state, so a row is
  // only rendered when it has a value; "—" filler rows would be noise.
  if (m.funding) {
    if (m.funding.organization) {
      rows.push({ label: d.detail.fundingOrganization, value: m.funding.organization });
    }
    if (m.funding.recipient) {
      rows.push({ label: d.detail.fundingRecipient, value: m.funding.recipient });
    }
    rows.push({
      label: d.detail.amount,
      value: m.funding.amount
        ? `${m.funding.currency ?? ""}${m.funding.amount}`.trim()
        : m.funding.amountDisclosure ?? d.detail.amountNotDisclosed,
    });
  }

  if (m.education) {
    const e = m.education;
    if (e.institution) rows.push({ label: d.detail.educationInstitution, value: e.institution });
    if (e.department) rows.push({ label: d.detail.department, value: e.department });
    if (e.courseName) rows.push({ label: d.detail.courseName, value: e.courseName });
    if (e.courseCode) rows.push({ label: d.detail.courseCode, value: e.courseCode });
    if (e.instructor) rows.push({ label: d.detail.instructor, value: e.instructor });
    if (e.period) rows.push({ label: d.detail.period, value: e.period });
    if (e.description) rows.push({ label: d.detail.description, value: e.description });
  }

  if (m.policy) {
    if (m.policy.kind) rows.push({ label: d.detail.policyKind, value: m.policy.kind });
    if (m.policy.community) rows.push({ label: d.detail.community, value: m.policy.community });
    if (m.policy.issue) rows.push({ label: d.detail.issue, value: m.policy.issue });
    if (m.policy.participants?.length) {
      rows.push({ label: d.detail.participants, value: m.policy.participants.join(", ") });
    }
  }

  if (!hasPeople && !hasInitiatives && rows.length === 0) return null;

  return (
    <section id="ecosystem" className="mt-7 scroll-mt-24">
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
