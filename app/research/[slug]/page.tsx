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
import { getLang, t } from "@/lib/i18n/server";
import { pagesDict } from "@/lib/i18n/dict.pages";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const event = await getStore().getEventBySlug(params.slug);
  return { title: event ? event.title : "Ecosystem event" };
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
  const event = await store.getEventBySlug(params.slug);
  if (!event) notFound();

  const siblings = (await store.listEvents({ area: event.researchArea, limit: 10 })).filter(
    (e) => e.slug !== event.slug
  );
  // Related events: same area, newest first (no importance ranking).
  const relatedEvents = siblings.slice(0, 3);

  const papers = event.papers ?? [];
  const primaryPaperUrl = event.paperUrl ?? papers[0]?.url;

  return (
    <div className="container-page py-10">
      <div className="mb-6 text-sm text-ink-500">
        <Link href="/latest" className="link-quiet">
          {d.nav.latest}
        </Link>
        <span className="mx-2 text-ink-300">/</span>
        <Link href={`/topics/${slugify(event.researchArea)}`} className="link-quiet">
          {event.researchArea}
        </Link>
        <span className="mx-2 text-ink-300">/</span>
        <span className="text-ink-700">{p.detail.crumbEvent}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Main column */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {event.eventType && <EventTypePill type={event.eventType} />}
            <AreaBadge area={event.researchArea} subArea={event.subArea} />
            <span className="font-mono text-xs text-ink-500">{formatDateLong(event.date)}</span>
            {event.isDemo && (
              <span className="chip border-dashed border-ink-300 text-ink-400">
                {p.detail.demoEntry}
              </span>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {event.title}
          </h1>

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

          <section className="mt-7">
            <SectionTitle>{d.detail.whyMatters}</SectionTitle>
            <div className="mt-2 border-l-2 border-accent-400 pl-4">
              <p className="text-[15px] leading-relaxed text-ink-700">{event.significance}</p>
            </div>
          </section>

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

          <section className="mt-7">
            <SectionTitle>
              {event.eventType === undefined || event.eventType === "Research"
                ? d.detail.relatedPaper
                : d.detail.source}
            </SectionTitle>
            <div className="card divide-y divide-ink-100">
              {papers.length === 0 &&
                (event.eventType === undefined || event.eventType === "Research") && (
                <div className="px-4 py-3 text-sm text-ink-500">
                  {/* No structured paper list — but that doesn't mean no paper:
                      repository-hosted corpora and single-source events keep
                      their papers behind the source link. */}
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
                      <a href={paper.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent-700">
                        {paper.title}
                      </a>
                    ) : (
                      paper.title
                    )}
                  </div>
                  <div className="mono-label mt-1 normal-case tracking-normal">
                    {[paper.venue, paper.year].filter(Boolean).join(" · ") || p.detail.venueMissing}
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

          <section className="mt-7">
            <SectionTitle>{d.detail.relatedWorks}</SectionTitle>
            {event.relatedWorks.length === 0 ? (
              <p className="text-sm text-ink-500">
                {d.detail.lineagePending}
              </p>
            ) : (
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {event.relatedWorks.map((w) => (
                  <li key={`${w.relation}-${w.title}`} className="card px-4 py-3">
                    <div className="mono-label mb-1 normal-case tracking-normal">
                      {w.relation === "previous"
                        ? d.detail.previous
                        : w.relation === "followup"
                          ? d.detail.followup
                          : d.detail.related}
                    </div>
                    <div className="text-sm font-medium">
                      {w.url ? (
                        <a href={w.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent-700">
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
            )}
          </section>

          <section className="mt-7">
            <SectionTitle>{d.detail.timeline}</SectionTitle>
            <div className="mt-3 max-w-xl">
              <LineageTimeline event={event} />
            </div>
          </section>

          {(event.verificationHistory ?? []).length > 0 && (
            <section className="mt-7">
              <SectionTitle>{d.detail.verificationHistory}</SectionTitle>
              <p className="mt-1 text-sm text-ink-500">
                {d.detail.verificationHistoryHint}{" "}
                <Link href="/methodology" className="link-quiet">
                  {p.detail.howToReadLabels}
                </Link>
              </p>
              <ol className="mt-3 space-y-2 border-l-2 border-ink-200 pl-5">
                {(event.verificationHistory ?? []).map((r, i) => (
                  <li key={`${r.date}-${i}`} className="relative">
                    <span className="absolute -left-[1.9rem] top-2 h-2 w-2 rounded-full bg-accent-500" />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-ink-500">{formatDateLong(r.date)}</span>
                      <VerificationBadge status={r.status} />
                      <EvidenceLevelPill level={r.evidenceLevel} />
                    </div>
                    {r.note && <p className="mt-1 text-sm leading-relaxed text-ink-600">{r.note}</p>}
                  </li>
                ))}
              </ol>
            </section>
          )}

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
              <p className="mt-3 text-sm text-ink-500">
                {d.detail.noOtherEvents}
              </p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="card p-4">
            <div className="mono-label mb-2">{d.detail.researchArea}</div>
            <div className="text-sm font-medium">
              <Link href={`/topics/${slugify(event.researchArea)}`} className="hover:text-accent-700">
                {event.researchArea}
              </Link>
              {event.subArea && (
                <>
                  <span className="mx-1.5 text-ink-400">→</span>
                  <span className="text-ink-600">{event.subArea}</span>
                </>
              )}
            </div>
          </div>

          <div className="card p-4">
            <div className="mono-label mb-2">{d.detail.importance}</div>
            <div className="font-mono text-2xl font-semibold tracking-tight text-ink-900">
              {event.importanceScore !== undefined ? `${event.importanceScore}/100` : d.detail.importanceNotAssessed}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ink-500">
              {event.importanceNote ?? d.detail.importanceSubjective}
            </p>
          </div>

          <EcosystemDetails event={event} />

          <div className="card p-4">
            <div className="mono-label mb-2">{d.detail.evidenceTitle}</div>
            <dl className="space-y-2 text-sm">
              {event.verificationStatus && (
                <Row label={d.detail.verification}>
                  <VerificationBadge status={event.verificationStatus} />
                </Row>
              )}
              {event.evidenceLevel && (
                <Row label={d.detail.evidence}>
                  <EvidenceLevelPill level={event.evidenceLevel} />
                </Row>
              )}
              {event.sourceTier && (
                <Row label={d.detail.source}>
                  <SourceTierPill tier={event.sourceTier} />
                </Row>
              )}
              {event.eventType && (
                <Row label={d.detail.eventType}>
                  <EventTypePill type={event.eventType} />
                </Row>
              )}
              {event.researchEventType && (
                <Row label={d.detail.researchSubtype}>
                  <span className="chip border-ink-200 text-ink-600">{event.researchEventType}</span>
                </Row>
              )}
              {event.lastSyncedAt && (
                <Row label={d.detail.lastSynced}>
                  <span className="font-mono text-xs text-ink-500">{event.lastSyncedAt.slice(0, 10)}</span>
                </Row>
              )}
            </dl>
            <p className="mt-3 border-t border-ink-100 pt-2 text-xs leading-relaxed text-ink-500">
              {d.detail.howToRead}{" "}
              <Link href="/methodology" className="link-quiet">
                {d.detail.methodology}
              </Link>
            </p>
          </div>

          {(primaryPaperUrl || event.githubUrl) && (
            <div className="card p-4">
              <div className="mono-label mb-2">{d.detail.readTheWork}</div>
              <div className="flex flex-col gap-2">
                {primaryPaperUrl && (
                  <a
                    href={primaryPaperUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full"
                  >
                    {d.detail.paperOrSource}
                  </a>
                )}
                {event.githubUrl && (
                  <a
                    href={event.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost w-full"
                  >
                    {d.detail.codeOnGitHub}
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="card p-4">
            <div className="mono-label mb-2">{d.detail.authorsInstitution}</div>
            {event.authors.length > 0 ? (
              <ul className="space-y-1 text-sm text-ink-700">
                {event.authors.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-ink-400">{d.detail.authorsMissing}</div>
            )}
            {event.institution && (
              <div className="mt-2 border-t border-ink-100 pt-2 text-sm text-ink-700">
                {event.institution}
              </div>
            )}
          </div>

          {(event.model?.length ?? 0) + (event.benchmark?.length ?? 0) + (event.dataset?.length ?? 0) >
            0 && (
            <div className="card p-4">
              <div className="mono-label mb-2">{d.detail.attachedArtifacts}</div>
              <Facet label={d.detail.model} values={event.model ?? []} param="model" />
              <Facet
                label={d.detail.benchmark}
                values={event.benchmark ?? []}
                param="benchmark"
              />
              <Facet label={d.detail.dataset} values={event.dataset ?? []} param="dataset" />
            </div>
          )}

          <div className="card p-4">
            <div className="mono-label mb-2">{d.detail.source}</div>
            <div className="font-mono text-xs text-ink-600">{event.sourceType}</div>
            <div className="mono-label mt-2 normal-case tracking-normal">
              {d.detail.recordId} {event.id}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function EcosystemDetails({ event }: { event: ResearchEvent }) {
  const d = t(getLang());
  const m = event.metadata;
  if (!m) return null;

  const hasPeople = (m.people?.length ?? 0) > 0;
  const hasInitiatives = (m.initiatives?.length ?? 0) > 0 || (m.projects?.length ?? 0) > 0;
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
    rows.push({ label: d.detail.participants, value: (m.policy.participants ?? []).join(", ") || "—" });
  }

  if (!hasPeople && !hasInitiatives && rows.length === 0) return null;

  return (
    <div className="card p-4">
      <div className="mono-label mb-2">{d.detail.ecosystemDetails}</div>

      {hasPeople && (
        <div className="mb-3">
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
        <div className="mb-3 space-y-2">
          {m.initiatives && m.initiatives.length > 0 && (
            <div>
              <div className="mono-label mb-1">{d.detail.initiatives}</div>
              <div className="flex flex-wrap gap-1.5">
                {m.initiatives.map((v) => <span key={v} className="chip">{v}</span>)}
              </div>
            </div>
          )}
          {m.projects && m.projects.length > 0 && (
            <div>
              <div className="mono-label mb-1">{d.detail.projects}</div>
              <div className="flex flex-wrap gap-1.5">
                {m.projects.map((v) => <span key={v} className="chip">{v}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {rows.length > 0 && (
        <dl className="divide-y divide-ink-100 border-t border-ink-100">
          {rows.map((row) => (
            <div key={row.label} className="grid gap-1 py-2 sm:grid-cols-[7rem_1fr]">
              <dt className="mono-label normal-case tracking-normal">{row.label}</dt>
              <dd className="text-xs leading-relaxed text-ink-700">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold tracking-tight text-ink-900">{children}</h2>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/**
 * Facet chips link into the feed (`/latest?model=…` etc.) so a model,
 * benchmark or dataset is a navigation surface, not a dead label.
 */
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


