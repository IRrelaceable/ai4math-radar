import type {
  EventEntities,
  EventLink,
  EventRelationEdge,
  EventUpdateKind,
  RelatedKind,
  ResearchEvent,
  TrackedEvent,
} from "@/types";
import { EVENT_RELATIONS, EVENT_UPDATE_KINDS } from "@/types";
import { getLLMProvider, type LLMProvider } from "@/lib/llm/provider";
import { curatedEventLinks } from "@/data/seed/event-links";
import { mentionedProject } from "@/data/seed/projects";

/** Five years covers a research programme without treating the whole archive as one candidate pool. */
export const EVENT_MATCH_LOOKBACK_DAYS = 365 * 5;

/** Stable even before an old record is explicitly migrated into event data. */
export function defaultEventId(event: Pick<ResearchEvent, "id">): string {
  return `event-${event.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

export function eventLinkOf(event: Pick<ResearchEvent, "id" | "slug" | "tracking">): EventLink | undefined {
  // A human-reviewed curated link is an editorial decision about Event
  // membership and outranks a stored link. Ingested records carry a default
  // standalone link from the pipeline; without this precedence a curated
  // release line could never regroup them without rewriting stored data.
  return curatedEventLinks[event.slug] ?? event.tracking;
}

export function eventIdOf(event: Pick<ResearchEvent, "id" | "slug" | "tracking">): string {
  return eventLinkOf(event)?.eventId ?? defaultEventId(event);
}

function mergeEntities(target: EventEntities, source: EventEntities | undefined): EventEntities {
  if (!source) return target;
  const out = { ...target };
  for (const key of ["people", "institutions", "projects", "systems"] as const) {
    const values = [...(out[key] ?? []), ...(source[key] ?? [])];
    if (values.length) out[key] = [...new Map(values.map((value) => [value.toLowerCase(), value])).values()];
  }
  return out;
}

/**
 * Materialize public Events from immutable source records. Existing events
 * without an explicit link each retain a deterministic singleton Event, so
 * the migration never loses history or breaks an old detail URL.
 */
export function buildTrackedEvents(events: ResearchEvent[]): TrackedEvent[] {
  const tracked = new Map<string, TrackedEvent>();
  for (const event of events) {
    const id = eventIdOf(event);
    const link = eventLinkOf(event);
    const step = {
      id: `${id}:${event.id}`,
      eventId: id,
      eventSlug: event.slug,
      date: event.date,
      kind: link?.kind ?? "initial",
      title: event.title,
      summary: event.summary,
      sourceUrl: event.sourceUrl,
      sources: event.sources,
      evidenceLevel: event.evidenceLevel,
      publicationStatus: event.publicationStatus,
    } as const;
    const existing = tracked.get(id);
    const relation =
      link?.relatedTo &&
      ({
        fromEventId: id,
        toEventId: link.relatedTo.eventId,
        kind: link.relatedTo.kind,
        reason: link.relatedTo.reason,
      } satisfies EventRelationEdge);
    if (!existing) {
      tracked.set(id, {
        id,
        title: event.title,
        summary: event.summary,
        startedAt: event.date,
        latestAt: event.date,
        researchArea: event.researchArea,
        eventType: event.eventType,
        entities: mergeEntities({}, event.entities),
        progress: [step],
        projectId: link?.projectId,
        relations: relation ? [relation] : [],
      });
      continue;
    }
    existing.progress.push(step);
    existing.entities = mergeEntities(existing.entities, event.entities);
    existing.projectId ??= link?.projectId;
    if (relation && !existing.relations.some((edge) => edge.toEventId === relation.toEventId && edge.kind === relation.kind)) {
      existing.relations.push(relation);
    }
    // A re-report adds a Source but never moves dates. Audits/corrections are
    // real progress points, so they advance the dates, but they never compete
    // for the headline. Which initial/followup owns the headline is decided
    // after all records are seen (below), so ingest order cannot change it.
    if (step.kind !== "report") {
      if (event.date < existing.startedAt) existing.startedAt = event.date;
      if (event.date >= existing.latestAt) existing.latestAt = event.date;
    }
  }
  const materialized = [...tracked.values()].map((event) => {
    const progress = event.progress.sort(
      (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
    );
    // An Event's headline is its identity: the initial record that established
    // it. Follow-ups, audits, corrections and re-reports are timeline steps,
    // not a new headline — a release Event stays the release even after new
    // results are added to it. Decided after grouping so record order cannot
    // change the result.
    const headline = progress.find((step) => step.kind === "initial");
    return {
      ...event,
      ...(headline
        ? { title: headline.title, summary: headline.summary }
        : {}),
      progress,
    };
  });

  // Relation edges are stored once, on the Event that points outward. Mirror
  // each edge onto its target so both pages show the connection; the curated
  // data stays unidirectional. `fromEventId` still names the source Event,
  // which is how the renderer tells an outgoing edge from an incoming one.
  const byId = new Map(materialized.map((event) => [event.id, event]));
  for (const source of materialized) {
    for (const edge of [...source.relations]) {
      if (edge.fromEventId !== source.id) continue;
      const target = byId.get(edge.toEventId);
      if (!target || target.id === source.id) continue;
      if (
        target.relations.some(
          (existing) =>
            existing.fromEventId === edge.fromEventId &&
            existing.toEventId === edge.toEventId &&
            existing.kind === edge.kind
        )
      )
        continue;
      target.relations.push({ ...edge });
    }
  }

  return materialized.sort(
    (a, b) => b.latestAt.localeCompare(a.latestAt) || a.id.localeCompare(b.id)
  );
}

/** Timeline steps; a "report" step is source-only and stays out of the timeline. */
export function updatesOf(event: TrackedEvent): TrackedEvent["progress"] {
  return event.progress.filter((step) => step.kind !== "report");
}

/**
 * Reader-facing tracked Events. A singleton Event still exists (its detail
 * page), but only Events with confirmed Updates, a Project or an explicit
 * relation earn a place in the /events index.
 */
export function isTracked(event: TrackedEvent): boolean {
  return updatesOf(event).length >= 2 || Boolean(event.projectId) || event.relations.length > 0;
}

export function publishedEvents(events: ResearchEvent[]): TrackedEvent[] {
  return buildTrackedEvents(events).filter(isTracked);
}

/** Source slug -> published Event id, for list surfaces that decide whether to show a link. */
export function publishedEventIdBySlug(events: ResearchEvent[]): Map<string, string> {
  const index = new Map<string, string>();
  for (const event of publishedEvents(events)) {
    for (const step of event.progress) index.set(step.eventSlug, event.id);
  }
  return index;
}

/**
 * Source slug -> current collection state of its Event line, for every card.
 * count = number of source records in the line (progress.length), including
 * media re-reports — NOT the timeline update count. Derived from the same
 * buildTrackedEvents() the detail page uses, so the two can never disagree.
 */
export function trackingSummaryBySlug(
  events: ResearchEvent[]
): Map<string, { eventId: string; count: number }> {
  const index = new Map<string, { eventId: string; count: number }>();
  for (const tracked of buildTrackedEvents(events)) {
    const summary = { eventId: tracked.id, count: tracked.progress.length };
    for (const step of tracked.progress) index.set(step.eventSlug, summary);
  }
  return index;
}

function dateBefore(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() - days);
  return value.toISOString().slice(0, 10);
}

function daysApart(a: string, b: string): number {
  return Math.abs(Date.parse(a) - Date.parse(b)) / 86_400_000;
}

function names(event: ResearchEvent): Set<string> {
  // Identity only: people, institutions, projects. A shared tool never makes
  // two records the same event.
  return new Set(
    [
      ...(event.entities?.people ?? []),
      ...(event.entities?.institutions ?? []),
      ...(event.entities?.projects ?? []),
    ]
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
}

function keywords(event: ResearchEvent): Set<string> {
  return new Set(
    `${event.title} ${event.summary}`
      .toLowerCase()
      .match(/[a-z0-9][a-z0-9-]{3,}/g)
      ?.filter((word) => !new Set(["with", "from", "that", "this", "using", "into", "through"]).has(word)) ?? []
  );
}

function overlap(a: Set<string>, b: Set<string>): number {
  let hits = 0;
  for (const item of a) if (b.has(item)) hits += 1;
  return hits;
}

function titleTokens(event: ResearchEvent): Set<string> {
  return new Set(
    event.title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2)
  );
}

function titleSimilarity(a: ResearchEvent, b: ResearchEvent): number {
  const ta = titleTokens(a);
  const tb = titleTokens(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let hits = 0;
  for (const token of ta) if (tb.has(token)) hits += 1;
  return hits / (ta.size + tb.size - hits);
}

export interface EventCandidate {
  event: ResearchEvent;
  score: number;
  entityOverlap: number;
  peopleOverlap: number;
  keywordOverlap: number;
}

/** Candidate retrieval is intentionally conservative and dependency-free. */
export function findEventCandidates(
  incoming: ResearchEvent,
  existing: ResearchEvent[],
  limit = 3
): EventCandidate[] {
  const oldest = dateBefore(incoming.date, EVENT_MATCH_LOOKBACK_DAYS);
  const incomingNames = names(incoming);
  const incomingPeople = new Set(
    [
      ...(incoming.entities?.people ?? []),
      ...(incoming.entities?.projects ?? []),
    ]
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
  const incomingWords = keywords(incoming);
  return existing
    .filter((event) => event.date >= oldest && event.slug !== incoming.slug)
    .map((event) => {
      const entityOverlap = overlap(incomingNames, names(event));
      const peopleOverlap = overlap(
        incomingPeople,
        new Set(
          [...(event.entities?.people ?? []), ...(event.entities?.projects ?? [])]
            .map((value) => value.trim().toLowerCase())
            .filter(Boolean)
        )
      );
      const keywordOverlap = overlap(incomingWords, keywords(event));
      const samePaper = Boolean(incoming.paperUrl && event.paperUrl && incoming.paperUrl === event.paperUrl);
      return {
        event,
        entityOverlap,
        peopleOverlap,
        keywordOverlap,
        score: samePaper ? 1 : Math.min(0.95, entityOverlap * 0.35 + keywordOverlap * 0.08),
      };
    })
    .filter((candidate) => candidate.entityOverlap > 0 || candidate.keywordOverlap >= 2 || candidate.score === 1)
    .sort((a, b) => b.score - a.score || b.event.date.localeCompare(a.event.date))
    .slice(0, limit);
}

/**
 * A restatement describes the same outcome again: it adds a Source to the
 * Event but never an Update. The same paper URL is always a restatement;
 * title resemblance only counts for media (news, or a blog reporting a
 * paper-backed result) — a blog that is itself the primary source (a podcast
 * episode, an announcement) is a development, not a re-report.
 */
export function isMediaReport(incoming: ResearchEvent, candidate: ResearchEvent): boolean {
  const samePaper = Boolean(incoming.paperUrl && incoming.paperUrl === candidate.paperUrl);
  if (samePaper) return true;
  if (incoming.sourceType !== "news" && incoming.sourceType !== "blog") return false;
  const candidateIsPaper = Boolean(candidate.paperUrl) || candidate.sourceType === "arxiv";
  if (incoming.sourceType === "blog" && !candidateIsPaper) return false;
  return daysApart(incoming.date, candidate.date) <= 14 && titleSimilarity(incoming, candidate) >= 0.6;
}

const SERIES_PART = /\bpart\s+([0-9]+|[ivx]+)\b/i;

/** "…: Part II" after "…: Part I" of the same named series is one Event's next Update. */
function seriesContinuation(a: ResearchEvent, b: ResearchEvent): boolean {
  const ma = a.title.match(SERIES_PART);
  const mb = b.title.match(SERIES_PART);
  if (!ma || !mb || ma[1].toLowerCase() === mb[1].toLowerCase()) return false;
  const stem = (title: string, at: number) =>
    title.slice(0, at).toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
  return stem(a.title, ma.index!) === stem(b.title, mb.index!);
}

const RELATED_CUE =
  /\b(reproduction|reproduces?|reproduced|replication|replicates?|replicated|refutes?|refuted|overturns?|overturned|rebuttal|revisiting|comment on)\b/i;

function titleYears(event: ResearchEvent): Set<string> {
  return new Set(event.title.match(/\b(?:19|20)\d{2}\b/g) ?? []);
}

/** Different named years in the titles mean different editions, not a follow-up. */
function yearClash(a: ResearchEvent, b: ResearchEvent): boolean {
  const ya = titleYears(a);
  const yb = titleYears(b);
  if (ya.size === 0 || yb.size === 0) return false;
  for (const year of ya) if (yb.has(year)) return false;
  return true;
}

function relatedKindOf(event: ResearchEvent): RelatedKind | undefined {
  // Title only: a cue buried in a summary is usually incidental prose.
  const text = event.title;
  if (!RELATED_CUE.test(text)) return undefined;
  if (/\b(refutes?|refuted|overturns?|overturned|rebuttal)\b/i.test(text)) return "overturn";
  if (/\b(reproduction|reproduces?|reproduced|replication|replicates?|replicated)\b/i.test(text)) return "reproduction";
  return "related";
}

function link(
  eventId: string,
  kind: EventUpdateKind,
  relation: EventLink["relation"],
  matchedBy: EventLink["matchedBy"],
  extra?: Partial<EventLink>
): EventLink {
  return { eventId, kind, relation, matchedBy, ...extra };
}

async function judgeCandidate(
  incoming: ResearchEvent,
  candidate: EventCandidate,
  provider: LLMProvider
): Promise<"followup" | "related" | undefined> {
  if (provider.id === "mock") return undefined;
  const prompt = [
    "Decide how the incoming source record relates to the candidate event.",
    "Reply with exactly FOLLOWUP, RELATED or SEPARATE.",
    "FOLLOWUP only when the source explicitly concerns the same named result, release, project or claim.",
    "RELATED when it is an independent reproduction, critique or overturning of the candidate's result.",
    "Shared field, institution or benchmark alone is SEPARATE.",
    `INCOMING TITLE: ${incoming.title}`,
    `INCOMING SUMMARY: ${incoming.summary}`,
    `CANDIDATE TITLE: ${candidate.event.title}`,
    `CANDIDATE SUMMARY: ${candidate.event.summary}`,
  ].join("\n\n");
  try {
    const answer = (await provider.complete(prompt, { maxTokens: 12 })).trim().toUpperCase();
    if (answer.startsWith("FOLLOWUP")) return "followup";
    if (answer.startsWith("RELATED")) return "related";
    return undefined;
  } catch (error) {
    console.warn("[ai4math] event match judgement failed; keeping a separate event.", error);
    return undefined;
  }
}

/**
 * Hard contract: every stored record must carry a valid tracking link.
 * Invalid enum values, an empty event id or a missing link are rejected so a
 * bad record can never enter the archive and silently break event grouping.
 */
export function assertValidTracking(event: ResearchEvent): void {
  const t = event.tracking;
  if (!t || typeof t.eventId !== "string" || !t.eventId.trim())
    throw new Error(`[tracking] record ${event.slug} has no valid tracking eventId`);
  if (!(EVENT_RELATIONS as readonly string[]).includes(t.relation))
    throw new Error(`[tracking] record ${event.slug} has invalid relation "${t.relation}"`);
  if (!(EVENT_UPDATE_KINDS as readonly string[]).includes(t.kind))
    throw new Error(`[tracking] record ${event.slug} has invalid kind "${t.kind}"`);
}

/**
 * Route an incoming record through the four relations. Curated choices stay
 * untouched; only same-event appends an Update, same-project creates a new
 * Event under a Project, related-event draws an edge, and everything else
 * stays independent. Every returned record satisfies assertValidTracking.
 */
export async function linkIncomingEvents(
  incoming: ResearchEvent[],
  existing: ResearchEvent[],
  provider: LLMProvider = getLLMProvider()
): Promise<ResearchEvent[]> {
  const context = [...existing];
  const linked: ResearchEvent[] = [];
  for (const event of incoming) {
    // Event membership is a durable editorial decision once persisted. A
    // re-sync may add records, but it must never silently regroup old ones.
    if (event.tracking) {
      // Reject an already-stored record with a broken link instead of letting
      // it through untouched (which would bypass the whole matching pass).
      assertValidTracking(event);
      linked.push(event);
      context.push(event);
      continue;
    }
    const candidates = findEventCandidates(event, context);
    const best = candidates[0];
    let assigned: EventLink;
    if (best && isMediaReport(event, best.event)) {
      const samePaper = Boolean(event.paperUrl && event.paperUrl === best.event.paperUrl);
      assigned = link(eventIdOf(best.event), "report", "same-event", "heuristic", {
        matchedToSlug: best.event.slug,
        reason: samePaper
          ? "same outcome restated by another source; source only"
          : "media re-report of the same result; source only",
      });
    } else if (best && relatedKindOf(event)) {
      // An explicit reproduction / critique cue is a relation, never a merge,
      // even when the two records share authors or vocabulary.
      assigned = link(defaultEventId(event), "initial", "related-event", "heuristic", {
        matchedToSlug: best.event.slug,
        relatedTo: {
          eventId: eventIdOf(best.event),
          kind: relatedKindOf(event)!,
          reason: "independent study of the candidate result",
        },
        reason: "reproduction / critique of another event",
      });
    } else if (
      best &&
      !yearClash(event, best.event) &&
      (best.score === 1 ||
        seriesContinuation(event, best.event) ||
        (best.peopleOverlap > 0 && titleSimilarity(event, best.event) >= 0.4))
    ) {
      assigned = link(eventIdOf(best.event), "followup", "same-event", "heuristic", {
        matchedToSlug: best.event.slug,
        reason: "shared source identity and entities",
      });
    } else if (mentionedProject(event)) {
      const project = mentionedProject(event)!;
      const oldest = dateBefore(event.date, EVENT_MATCH_LOOKBACK_DAYS);
      const member =
        best && eventLinkOf(best.event)?.projectId === project.id
          ? best.event
          : context.find(
              (other) =>
                other.slug !== event.slug &&
                other.date >= oldest &&
                eventLinkOf(other)?.projectId === project.id
            );
      assigned = member
        ? link(defaultEventId(event), "initial", "same-project", "heuristic", {
            matchedToSlug: member.slug,
            projectId: project.id,
            reason: `new result under ${project.name}`,
          })
        : link(defaultEventId(event), "initial", "independent", "seed", {
            reason: "no candidate event",
          });
    } else if (best && best.entityOverlap > 0) {
      // Only identity-overlapping candidates are worth an LLM judgement;
      // keyword-only overlap is almost always a separate result.
      const verdict = await judgeCandidate(event, best, provider);
      assigned =
        verdict === "followup"
          ? link(eventIdOf(best.event), "followup", "same-event", "llm", {
              matchedToSlug: best.event.slug,
              reason: "LLM-confirmed follow-up",
            })
          : verdict === "related"
            ? link(defaultEventId(event), "initial", "related-event", "llm", {
                matchedToSlug: best.event.slug,
                relatedTo: { eventId: eventIdOf(best.event), kind: "related", reason: "LLM-confirmed research relation" },
                reason: "LLM-confirmed research relation",
              })
            : link(defaultEventId(event), "initial", "independent", "seed", {
                matchedToSlug: best.event.slug,
                reason: `ambiguous match with ${best.event.slug}; not merged (stored as standalone event)`,
              });
    } else {
      assigned = link(defaultEventId(event), "initial", "independent", "seed", {
        reason: "no candidate event",
      });
    }
    const withLink = { ...event, tracking: assigned };
    assertValidTracking(withLink);
    linked.push(withLink);
    context.push(withLink);
  }
  return linked;
}