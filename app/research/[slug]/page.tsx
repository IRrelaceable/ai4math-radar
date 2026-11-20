import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/db";
import type { RelatedWork, ResearchEvent } from "@/types";
import { formatDateLong, formatDate, slugify, sourceHost, arxivIdOf } from "@/lib/utils";
import {
  AiRolePill,
  EvidenceLevelPill,
  EventTypePill,
  PublicationStatusPill,
  SourceTierPill,
} from "@/components/ui/TrustBadges";
import { LineageTimeline } from "@/components/research/LineageTimeline";
import { EntityThreads } from "@/components/research/EntityThreads";
import { buildEntityThreads, threadsForEvent } from "@/lib/entities";
import { PublicationCorrectionsSection } from "@/components/research/DetailSections";
import { EventDiscussion } from "@/components/research/EventDiscussion";
import { TocNav } from "@/components/layout/TocNav";
import { BackToTop } from "@/components/ui/BackToTop";
import { PageParticles } from "@/components/ui/PageParticles";
import { getLang, t } from "@/lib/i18n/server";
import { localizeEvent, localizeEvents, displayArea, displaySubArea } from "@/lib/i18n/localize";
import { pagesDict } from "@/lib/i18n/dict.pages";
import { buildTrackedEvents, eventLinkOf, updatesOf } from "@/lib/tracking";
import { projectById } from "@/data/seed/projects";
import { DimensionChips } from "@/components/research/DimensionChips";
import type { EventTrackingNote, TrackedEvent } from "@/types";

// Module-level cache: every detail page calls listEvents() to build entity
// threads. The store content is identical across all ~685 renders in a single
// build, so compute it once and reuse it instead of re-filtering on every page.
let cachedAllEvents: ResearchEvent[] | null = null;
async function getAllEvents(): Promise<ResearchEvent[]> {
  if (!cachedAllEvents) cachedAllEvents = await getStore().listEvents();
  return cachedAllEvents;
}

let cachedTrackedBySlug: Map<string, TrackedEvent> | null = null;
async function getTrackedBySlug(): Promise<Map<string, TrackedEvent>> {
  if (!cachedTrackedBySlug) {
    const bySlug = new Map<string, TrackedEvent>();
    for (const tracked of buildTrackedEvents(await getAllEvents())) {
      for (const step of tracked.progress) bySlug.set(step.eventSlug, tracked);
    }
    cachedTrackedBySlug = bySlug;
  }
  return cachedTrackedBySlug;
}

let cachedSlugByEventId: Map<string, string> | null = null;
async function getSlugByEventId(): Promise<Map<string, string>> {
  if (!cachedSlugByEventId) {
    const trackedBySlug = await getTrackedBySlug();
    const byId = new Map<string, string>();
    for (const event of new Set(trackedBySlug.values())) {
      const headline = event.progress.find((step) => step.kind === "initial") ?? event.progress[0];
      if (headline) byId.set(event.id, headline.eventSlug);
    }
    cachedSlugByEventId = byId;
  }
  return cachedSlugByEventId;
}

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
  const eventLink = eventLinkOf(found);

  // One store pass powers both contextual blocks: entity threads and tracking.
  // Cached across renders.
  const allEvents = await getAllEvents();
  const tracked = (await getTrackedBySlug()).get(event.slug);
  const slugByEventId = await getSlugByEventId();
  const showTracking = Boolean(
    tracked &&
      (tracked.projectId ||
        updatesOf(tracked).length >= 2 ||
        tracked.relations.length > 0 ||
        tracked.progress.some((step) => step.kind === "report"))
  );
  const entityThreads = threadsForEvent(
    buildEntityThreads(allEvents),
    event.slug,
    Number.POSITIVE_INFINITY
  );
  // Localize once per event, not once per thread membership: a widely shared
  // entity (Lean spans 70 events) would otherwise be localized many times.
  const localizedBySlug = new Map(
    localizeEvents(allEvents, lang).map((localized) => [localized.slug, localized])
  );
  const eventThreads = entityThreads.map((thread) => ({
    ...thread,
    events: thread.events.map((item) => localizedBySlug.get(item.slug) ?? item),
  }));
  const papers = event.papers ?? [];
  /** The one action a reader most likely wants: open the paper/source. */
  const primaryUrl = event.paperUrl ?? papers[0]?.url ?? event.sourceUrl;
  const isResearch = event.eventType === undefined || event.eventType === "Research";
  // When the paper list already links to the same URL as the header action,
  // repeating it at the bottom of the card adds nothing. Without a paper list
  // the section does not render: the header button is the only copy.
  const sourceLinkIsPrimary =
    papers.length > 0 && event.sourceUrl !== undefined && event.sourceUrl === primaryUrl;
  // The reverse side of the lineage: records naming this event as their
  // previous work (citation backfill and handwritten seed entries alike).
  // Stored entries pointing here already cover the forward direction, so a
  // candidate is either a real follow-up or a real previous — never both.
  const internalHref = `/research/${event.slug}`;
  const eventArxiv = arxivIdOf(event.paperUrl ?? event.sourceUrl);
  const pointsHere = (url: string | undefined) =>
    Boolean(url) &&
    (url === internalHref ||
      url === event.paperUrl ||
      url === event.sourceUrl ||
      Boolean(eventArxiv && arxivIdOf(url) === eventArxiv));
  const storedUrls = new Set(
    event.relatedWorks
      .filter((work) => work.relation === "previous" || work.relation === "followup")
      .map((work) => work.url)
  );
  const derivedPrevious: { work: RelatedWork; date: string }[] = [];
  const derivedFollowup: { work: RelatedWork; date: string }[] = [];
  for (const candidate of allEvents) {
    if (candidate.slug === event.slug) continue;
    const links = candidate.relatedWorks ?? [];
    const candidateHref = `/research/${candidate.slug}`;
    if (storedUrls.has(candidateHref)) continue;
    const title = localizeEvent(candidate, lang).title;
    if (links.some((work) => work.relation === "previous" && pointsHere(work.url))) {
      derivedFollowup.push({
        date: candidate.date,
        work: {
          title,
          url: candidateHref,
          relation: "followup",
          note: d.detail.derivedFollowupNote,
        },
      });
    } else if (links.some((work) => work.relation === "followup" && pointsHere(work.url))) {
      derivedPrevious.push({
        date: candidate.date,
        work: {
          title,
          url: candidateHref,
          relation: "previous",
          note: d.detail.derivedPreviousNote,
        },
      });
    }
  }
  derivedPrevious.sort((a, b) => a.date.localeCompare(b.date));
  derivedFollowup.sort((a, b) => a.date.localeCompare(b.date));
  const previousWorks = derivedPrevious.map((entry) => entry.work);
  const followupWorks = derivedFollowup.map((entry) => entry.work);

  // Only the citation targets actually shown on this page are serialized to
  // the client component; passing all 650 source URLs inflated every page.
  const eventBySlug = new Map(allEvents.map((candidate) => [candidate.slug, candidate]));
  const sourceUrlBySlug: Record<string, string> = {};
  const lineageWorks = [
    ...event.relatedWorks.filter(
      (work) => work.relation === "previous" || work.relation === "followup"
    ),
    ...previousWorks,
    ...followupWorks,
  ];
  for (const work of lineageWorks) {
    if (!work.url?.startsWith("/research/")) continue;
    const slug = work.url.replace(/^\/research\//, "").replace(/\/$/, "");
    const target = eventBySlug.get(slug);
    const original = target?.paperUrl ?? target?.sourceUrl;
    if (original) sourceUrlBySlug[slug] = original;
  }

  // The lineage diagram lives inside the thread section, so it only earns its
  // place when there is something in it; works that are merely "related" keep
  // their own section.
  const hasLineage =
    previousWorks.length > 0 ||
    followupWorks.length > 0 ||
    event.relatedWorks.some(
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
    ...(showTracking ? [{ id: "tracking", label: p.events.label }] : []),
    ...(keyFactsVisible(event) ? [{ id: "facts", label: d.detail.keyFacts }] : []),
    ...(event.aiRole && event.aiRole.level !== "not_applicable"
      ? [{ id: "ai-role", label: d.detail.aiRole }]
      : []),
    ...(event.significance?.trim() ? [{ id: "why", label: d.detail.whyMatters }] : []),
    ...((event.keyContributions?.length ?? 0) > 0
      ? [{ id: "contributions", label: d.detail.keyContribution }]
      : []),
    ...(papers.length > 0
      ? [
          {
            id: "source",
            label: isResearch ? d.detail.relatedPaper : d.detail.source,
          },
        ]
      : []),
    ...(hasLineage ? [{ id: "lineage", label: d.detail.lineage }] : []),
    ...(eventThreads.length > 0 ? [{ id: "thread", label: d.detail.thread }] : []),
    ...(relatedOnly.length > 0
      ? [{ id: "related", label: d.detail.relatedWorks }]
      : []),
    ...((event.publicationCorrections?.length ?? 0) > 0
      ? [{ id: "publication-corrections", label: d.detail.publicationCorrections }]
      : []),
    ...(hasEcosystem ? [{ id: "ecosystem", label: d.detail.ecosystemDetails }] : []),
    ...(hasArtifacts ? [{ id: "artifacts", label: d.detail.attachedArtifacts }] : []),
    ...(hasAuthors ? [{ id: "authors", label: d.detail.authorsInstitution }] : []),
    { id: "discussion", label: d.detail.discussion },
  ];

  return (
    <div className="container-page py-10 lg:py-14">
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
        <span className="text-ink-700">
          {event.researchArea ? p.detail.crumbResearch : p.detail.crumbEvent}
        </span>
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
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {event.eventType && <EventTypePill type={event.eventType} />}
            {eventLink?.kind === "verification" && (
              <span className="chip border border-ink-200 bg-ink-50 text-ink-700">
                {p.events.kinds.verification}
              </span>
            )}
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
          <PageParticles />
        </div>

        <h1 className="h-display mt-4 break-words">
          {event.title}
        </h1>

        {/* Compact trust line — evidence and tier — plus the page's
            primary action, so the original paper is one click from the title. */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-ink-300 pb-5">
          {event.evidenceLevel && <EvidenceLevelPill level={event.evidenceLevel} />}
          {event.sourceTier && <SourceTierPill tier={event.sourceTier} />}
          {event.publicationStatus && (
            <PublicationStatusPill status={event.publicationStatus} />
          )}
          {/* Research events on either side of the direction axis carry a chip;
              events outside both sides and ecosystem records carry none. */}
          {event.direction === "ai4math" && (
            <span
              title={p.methodology.directionDesc.ai4math}
              className="chip border border-accent-200 bg-accent-50 font-medium text-accent-700"
            >
              {d.trust.direction.ai4math}
            </span>
          )}
          {event.direction === "math4ai" && (
            <span
              title={p.methodology.directionDesc.math4ai}
              className="chip border border-violet-200 bg-violet-50 font-medium text-violet-700"
            >
              {d.trust.direction.math4ai}
            </span>
          )}
          {event.direction === "both" && (
            <span
              title={p.methodology.directionDesc.both}
              className="chip border border-amber-200 bg-amber-50 font-medium text-amber-700"
            >
              {d.trust.direction.both}
            </span>
          )}

          <span className="flex flex-wrap items-center gap-2 sm:ml-auto">
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

        <DimensionChips event={found} lang={lang} />

        {/* What happened */}
        <section id="what" className="mt-7 scroll-mt-24">
          <SectionTitle>{d.detail.whatHappened}</SectionTitle>
          <p className="mt-2 max-w-prose break-words text-base leading-[1.8] text-ink-700">{event.summary}</p>
          {event.problem && (
            <div className="mt-4 rounded-md border border-ink-200 bg-ink-50 p-4">
              <div className="mono-label mb-1">{d.detail.problemAddressed}</div>
              <p className="text-sm leading-relaxed text-ink-700">{event.problem}</p>
            </div>
          )}
        </section>

        {/* Tracking context — the Event this record belongs to: project,
            technologies, confirmed updates, source-only re-reports and
            explicit relations to other events. */}
        {showTracking && tracked && (
          <TrackingSection tracked={tracked} slugByEventId={slugByEventId} titleBySlug={localizedBySlug} />
        )}

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

        {/* Original source — the header button already opens it, so this
            section exists only to list papers the record cites; a lone
            "read the original" link here would repeat the button verbatim. */}
        {(papers.length > 0 || (event.sources?.length ?? 0) > 0) && (
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
              {(event.sources ?? []).map((source) => (
                <div key={source.url} className="flex items-center justify-between gap-3 px-4 py-3">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:text-accent-700"
                  >
                    {source.title || sourceHost(source.url) || source.url}
                  </a>
                  <SourceTierPill tier={source.tier} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Two different relations, deliberately two sections: a citation is a
            documented link between papers; co-occurrence is only an entity two
            records happen to name. One shared heading made the latter causal. */}
        {hasLineage && (
          <section id="lineage" className="mt-10 scroll-mt-24">
            <SectionTitle>{d.detail.lineage}</SectionTitle>
            <p className="lede max-w-3xl">{d.detail.lineageIntro}</p>
            <div className="mt-5">
              <LineageTimeline
                event={event}
                extraPrevious={previousWorks}
                extraFollowup={followupWorks}
                sourceUrlBySlug={sourceUrlBySlug}
              />
            </div>
          </section>
        )}

        {eventThreads.length > 0 && (
          <EntityThreads
            threads={eventThreads}
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
              more: d.detail.threadMore,
              short: d.detail.threadShort,
              kinds: d.detail.threadKinds,
            }}
          />
        )}

        {/* Related works that are neither predecessor nor follow-up. */}
        {relatedOnly.length > 0 && (
          <section id="related" className="mt-7 scroll-mt-24">
            <SectionTitle>{d.detail.relatedWorks}</SectionTitle>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
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
          </section>
        )}

        {/* Errata appended after formal publication, when any exist. */}
        <PublicationCorrectionsSection corrections={event.publicationCorrections} />

        {/* Ecosystem metadata — moved from sidebar to bottom of narrative. */}
        <EcosystemDetails event={event} />

        {/* Attached artifacts — moved from sidebar. */}
        {hasArtifacts && (
          <section id="artifacts" className="mt-7 scroll-mt-24">
            <SectionTitle>{d.detail.attachedArtifacts}</SectionTitle>
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
            <SectionTitle>{d.detail.authorsInstitution}</SectionTitle>
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

        <EventDiscussion />
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
            {/* Both kinds of entry name where the record came from in plain
                language; the internal collection mechanism is not exposed. */}
            {(event.provenance ?? "curated") === "curated" ? (
              <MetaRow label={d.detail.metaProvenance}>
                {d.detail.provenanceCurated}
              </MetaRow>
            ) : (
              <MetaRow label={d.detail.metaProvenance}>
                {d.detail.automatedProvenance}
              </MetaRow>
            )}
          </dl>
          {(event.provenance ?? "curated") === "curated" ? (
            <p className="mt-3 text-xs text-ink-500">{d.detail.provenanceCuratedHint}</p>
          ) : (
            <p className="mt-3 text-xs text-ink-500">{d.detail.automatedProvenanceHint}</p>
          )}
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
 * field on the event (the outlet, and what the trust model says would count
 * as checking it). Curated events with a full narrative are unaffected, and
 * the record date stays in the rail where it always shows.
 */
function keyFactsVisible(event: ResearchEvent): boolean {
  const hasNarrative = Boolean(
    event.significance?.trim() || (event.keyContributions?.length ?? 0) > 0
  );
  return event.provenance === "automated" || !hasNarrative;
}

/** Key facts and provenance shown when a record has a narrative. */
function KeyFactsSection({ event }: { event: ResearchEvent }) {
  const lang = getLang();
  const d = t(lang);
  if (!keyFactsVisible(event)) return null;

  const facts: { label: string; value: React.ReactNode }[] = [];

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
      <SectionTitle>{d.detail.ecosystemDetails}</SectionTitle>

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
  return <h2 className="section-head h-section">{children}</h2>;
}

/** The Event context of this source record: project, technologies, updates,
    source-only re-reports and explicit relations. */
function TrackingSection({
  tracked,
  slugByEventId,
  titleBySlug,
}: {
  tracked: TrackedEvent;
  slugByEventId: Map<string, string>;
  titleBySlug: Map<string, { title: string }>;
}) {
  const lang = getLang();
  const p = pagesDict[lang].events;
  const updates = updatesOf(tracked);
  const initialCount = updates.filter((step) => step.kind === "initial").length;
  const changeCount = updates.filter((step) =>
    step.kind === "followup" || step.kind === "correction" || step.kind === "retraction"
  ).length;
  const verificationCount = updates.filter((step) => step.kind === "verification").length;
  const reports = tracked.progress.filter((step) => step.kind === "report");
  const project = tracked.projectId ? projectById(tracked.projectId) : undefined;

  return (
    <section id="tracking" className="mt-7 scroll-mt-24">
      <SectionTitle>{p.label}</SectionTitle>
      <div className="mt-2 flex flex-wrap gap-2">
        {project && (
          <span
            title={project.desc[lang]}
            className="chip border border-accent-200 bg-accent-50 font-medium text-accent-700"
          >
            {p.projectTitle} · {project.name}
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-600">
        {initialCount > 0 && <span>
          <strong className="font-semibold text-ink-900">{initialCount}</strong> {p.initialUnit}
        </span>}
        {changeCount > 0 && <span>
          <strong className="font-semibold text-ink-900">{changeCount}</strong> {p.changesUnit}
        </span>}
        {verificationCount > 0 && <span>
          <strong className="font-semibold text-ink-900">{verificationCount}</strong> {p.verificationUnit}
        </span>}
        <span>
          <strong className="font-semibold text-ink-900">{reports.length}</strong> {p.sourcesUnit}
        </span>
        <span>
          <strong className="font-semibold text-ink-900">{tracked.relations.length}</strong>{" "}
          {p.relationsUnit}
        </span>
      </div>
      {updates.length >= 2 && (
        <ol className="mt-4 border-l-2 border-ink-200 pl-5">
          {updates.map((step) => (
            <li key={step.id} className="relative pb-4 last:pb-0">
              <span className="absolute -left-[1.84rem] top-2 h-2 w-2 rounded-full bg-accent-500" />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <time dateTime={step.date} className="font-mono text-xs text-ink-500">
                  {formatDate(step.date, lang)}
                </time>
                <span className="chip text-[11px]">{p.kinds[step.kind]}</span>
              </div>
              <Link
                href={`/research/${step.eventSlug}`}
                className="mt-1 block text-sm font-medium text-ink-900 hover:text-accent-700"
              >
                {titleBySlug.get(step.eventSlug)?.title ?? step.title}
              </Link>
              {step.note && <TrackingNote note={step.note} lang={lang} />}
            </li>
          ))}
        </ol>
      )}
      {reports.length > 0 && (
        <div className="mt-4">
          <div className="mono-label mb-1">{p.sourcesTitle}</div>
          <p className="text-xs text-ink-500">{p.sourcesHint}</p>
          <ul className="mt-2 space-y-1">
            {reports.map((step) => (
              <li key={step.id}>
                <Link className="link-quiet text-sm" href={`/research/${step.eventSlug}`}>
                  {titleBySlug.get(step.eventSlug)?.title ?? step.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {tracked.relations.length > 0 && (
        <div className="mt-4">
          <div className="mono-label mb-1">{p.relationsTitle}</div>
          <ul className="mt-2 space-y-2">
            {tracked.relations.map((edge) => {
              // An edge is stored on the Event that points outward. On the
              // target page it appears as an incoming edge, so resolve the
              // "other" Event from the direction instead of always toEventId.
              const incoming = edge.fromEventId !== tracked.id;
              const otherEventId = incoming ? edge.fromEventId : edge.toEventId;
              const slug = slugByEventId.get(otherEventId);
              return (
                <li key={`${edge.fromEventId}:${edge.toEventId}:${edge.kind}`} className="text-sm">
                  <span className="chip text-[11px]">{p.relationKinds[edge.kind]}</span>{" "}
                  {slug ? (
                    <Link href={`/research/${slug}`} className="link-quiet">
                      {titleBySlug.get(slug)?.title ?? slug}
                    </Link>
                  ) : (
                    <span className="text-ink-500">{otherEventId}</span>
                  )}
                  {edge.note && <TrackingNote note={edge.note} lang={lang} />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

function TrackingNote({ note, lang }: { note: EventTrackingNote; lang: "zh" | "en" }) {
  return (
    <div className="mt-1.5 max-w-prose text-sm text-ink-600">
      <p className="leading-relaxed">{note.text[lang]}</p>
      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
        {note.references.map(({ title, url }) => (
          <li key={url}>
            <a className="link-quiet text-xs" href={url} target="_blank" rel="noreferrer">
              {title[lang]} <span aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
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
