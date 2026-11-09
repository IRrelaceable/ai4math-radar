import type { EventEntities, EventType, RawResearchItem, ResearchEvent, SourceType } from "@/types";
import { slugify } from "@/lib/utils";
import { applyTrustModel } from "@/lib/verification";
import { researchSources, type ResearchSource } from "@/lib/sources";
import { classifyItem, type Classification } from "./classifier";
import { summarize } from "./summarizer";
import { extractEcosystemMetadata, type ExtractedMetadata } from "./metadata";
import { extractContribution, type ExtractedContribution } from "./contribution";
import { extractNamedEntities } from "./entities";
import { classifyDirection } from "./direction";
import { fingerprintItem } from "@/lib/db/ingested";

export interface PipelineStepResult {
  step: string;
  detail: string;
}

export interface PipelineResult {
  accepted: ResearchEvent[];
  rejected: { item: RawResearchItem; reason: string }[];
  trace: PipelineStepResult[];
  /** slug -> source fingerprint for accepted items (caller may persist these). */
  fingerprints: [string, string][];
  /** Newest date observed in the raw fetch, including skipped unchanged items. */
  latestSeenDate?: string;
}

/** A classified item that survived dedupe and is waiting for summary text. */
interface PendingItem {
  normalized: RawResearchItem;
  effective: Classification;
  slug: string;
  fingerprint: string;
}

/**
 * researchTracker pipeline (第一版 mock 版本):
 *
 *   Source -> RawResearchItem -> Normalizer -> Classifier -> ResearchEvent
 *
 * Future work (V2/V3) only has to add real ResearchSource implementations and,
 * optionally, an LLM-backed classifier/summarizer behind the same functions.
 */
export async function runPipeline(
  items?: RawResearchItem[],
  sources: ResearchSource[] = researchSources,
  options: {
    limit?: number;
    since?: string;
    /**
     * slug -> source fingerprint for events already persisted. When a slug is
     * present and its source fingerprint is unchanged, summarization (the
     * per-item LLM call) is skipped and the stored event is reused verbatim.
     */
    existingFingerprints?: Map<string, string>;
    /**
     * slug -> source URL for everything already stored. Used to keep two
     * different records that share a headline from collapsing into one slug.
     */
    existingUrls?: Map<string, string>;
  } = {}
): Promise<PipelineResult> {
  const { limit, since, existingFingerprints, existingUrls } = options;
  const raw: RawResearchItem[] =
    items ??
      (
        await Promise.all(
          sources.map((s) =>
            s.fetchRecent({ limit, since })
          )
        )
      ).flat();

  const trace: PipelineStepResult[] = [
    {
      step: "ingest",
      detail:
        `received ${raw.length} raw research items` +
        (since ? ` since ${since}` : ""),
    },
  ];
  const accepted: ResearchEvent[] = [];
  const rejected: { item: RawResearchItem; reason: string }[] = [];
  const fingerprints: [string, string][] = [];
  const latestSeenDate = raw
    .map((item) => item.publishedAt)
    .filter((date): date is string => Boolean(date))
    .sort()
    .pop();
  let skippedUnchanged = 0;
  const pending: PendingItem[] = [];
  const takenSlugs = new Map(existingUrls ?? []);

  for (const item of raw) {
    const normalized = normalize(item);
    const classification = classifyItem(normalized);

    const effective: Classification =
      classification.isAI4Math && classification.researchArea
        ? classification
        : normalized.eventType && normalized.allowNonAI4Math
          ? {
              isAI4Math: true,
              researchArea: normalized.researchArea,
              subArea: normalized.sourceId,
              reasons: [
                `source-level ecosystem classification: ${normalized.eventType}` +
                  (normalized.sourceId ? ` (${normalized.sourceId})` : ""),
              ],
            }
          : classification;

    // Research items must land in a direction; ecosystem items record an event
    // class instead and are allowed to carry none.
    if (!effective.isAI4Math || (!effective.researchArea && !normalized.eventType)) {
      rejected.push({ item, reason: classification.reasons.join("; ") || "not AI4Math" });
      continue;
    }

    const slug = eventSlug(normalized, takenSlugs);
    const fingerprint = fingerprintItem(normalized);
    const previousFingerprint = existingFingerprints?.get(slug);

    // Already stored with identical source text: reuse the stored event and
    // skip the LLM call entirely. This keeps a re-sync cheap (no repeated
    // API spend) instead of re-summarizing every duplicate on every run.
    if (existingFingerprints && previousFingerprint === fingerprint) {
      skippedUnchanged += 1;
      continue;
    }

    pending.push({ normalized, effective, slug, fingerprint });
  }

  // Summarization is one network round-trip per accepted item and dominates
  // sync time (a 25-item arXiv batch ran ~4 minutes sequentially). A small
  // window keeps a batch near a minute without hammering the provider.
  const LLM_CONCURRENCY = 4;
  const results = await mapWithConcurrency(pending, LLM_CONCURRENCY, async (entry) => {
    const text = await summarize(entry.normalized, entry.effective);
    // People / Institutions / Funding / Policy events carry structured details
    // instead of a research area; Research items skip the extra call.
    const eventType = entry.normalized.eventType ?? "Research";
    const metadata =
      eventType === "Research"
        ? undefined
        : await extractEcosystemMetadata(entry.normalized, eventType);
    // Research items get a second small call that records how the source
    // divides the reported result between AI and humans. It stays separate
    // from the summary so a tooling or benchmark paper is not mislabelled as
    // an AI-produced result.
    const contribution =
      eventType === "Research" ? await extractContribution(entry.normalized) : undefined;
    // Named entities are what place the event on a person/institution/project
    // timeline; they come from the source text, never from a feed byline.
    const entities = await extractNamedEntities(entry.normalized);
    // The direction axis is judged from the just-written summary under the
    // fixed rubric; ecosystem items carry an event class instead and skip it.
    const direction =
      eventType === "Research" && entry.effective.researchArea
        ? await classifyDirection({
            title: entry.normalized.title,
            summary: text.summary,
            researchArea: entry.effective.researchArea,
            subArea: entry.effective.subArea,
          })
        : undefined;
    return { text, metadata, contribution, entities, direction };
  });

  pending.forEach((entry, index) => {
    fingerprints.push([entry.slug, entry.fingerprint]);
    const direction = results[index].direction;
    accepted.push({
      ...toEvent(
        entry.normalized,
        entry.effective,
        results[index].text,
        entry.normalized.eventType,
        entry.slug,
        results[index].metadata,
        results[index].contribution,
        results[index].entities
      ),
      ...(direction ? { direction } : {}),
    });
    trace.push({
      step: "classify+summarize",
      detail: `"${entry.normalized.title}" -> ${entry.normalized.eventType ?? "Research"} / ${entry.effective.researchArea}`,
    });
  });

  if (skippedUnchanged > 0) {
    trace.push({
      step: "skip-unchanged",
      detail: `${skippedUnchanged} items already stored with identical source text; LLM summarization skipped`,
    });
  }

  trace.push({
    step: "emit",
    detail: `${accepted.length} research events produced, ${rejected.length} items rejected`,
  });

  return { accepted, rejected, trace, fingerprints, latestSeenDate };
}

/** Runs `fn` over `items` with at most `limit` promises in flight, keeping input order. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

function normalize(item: RawResearchItem): RawResearchItem {
  return {
    ...item,
    title: item.title.trim(),
    abstract: item.abstract?.trim(),
    authors: item.authors ?? [],
    source: item.source || "unknown",
  };
}

function sourceTypeOf(item: Pick<RawResearchItem, "sourceType" | "source">): SourceType {
  if (item.sourceType) return item.sourceType;
  const s = item.source.toLowerCase();
  if (s.includes("arxiv")) return "arxiv";
  if (s.includes("github")) return "github";
  if (s.includes("conference") || s.includes("neurips") || s.includes("icml") || s.includes("iclr")) {
    return "conference";
  }
  if (s.includes("demo")) return "demo";
  return "blog";
}

/**
 * `paperUrl` is what the trust model reads as "a research record exists"
 * (E2). A news article, blog post or repository is a source link, not a
 * paper, so only paper venues may fill this field — otherwise every ingested
 * item is graded E2 no matter who published it.
 */
export function paperUrlFor(item: Pick<RawResearchItem, "url" | "sourceType" | "source">): string | undefined {
  if (!item.url) return undefined;
  const type = sourceTypeOf(item);
  return type === "arxiv" || type === "conference" ? item.url : undefined;
}

/** Stable 6-char hash so a disambiguated slug does not depend on ordering. */
function shortHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36).padStart(6, "0").slice(0, 6);
}

/**
 * Slug for a new item. Two records with the same headline from different
 * sources must not silently collapse into one event, and a title that
 * slugifies to nothing (e.g. all non-ASCII) must not produce `/research/`.
 */
export function eventSlug(
  item: Pick<RawResearchItem, "title"> & Partial<Pick<RawResearchItem, "url" | "id">>,
  takenBy?: Map<string, string>
): string {
  const identity = item.url ?? item.id ?? item.title;
  const base = slugify(item.title) || `event-${shortHash(identity)}`;
  const owner = takenBy?.get(base);
  const slug = owner !== undefined && owner !== identity ? `${base}-${shortHash(identity)}` : base;
  takenBy?.set(slug, identity);
  return slug;
}

function toEvent(
  item: RawResearchItem,
  classification: Classification,
  text: {
    summary: string;
    significance: string;
    titleZh?: string;
    summaryZh?: string;
    significanceZh?: string;
  },
  eventType: EventType = "Research",
  slug: string,
  metadata?: ExtractedMetadata,
  contribution?: ExtractedContribution,
  entities?: EventEntities
): ResearchEvent {
  const now = new Date().toISOString();
  const date = item.publishedAt ?? now.slice(0, 10);
  const isDemo = item.source.toLowerCase().includes("demo");
  const attributed =
    contribution && contribution.en.level !== "not_applicable" ? contribution : undefined;
  const event: ResearchEvent = {
    id: `evt_${item.id}`,
    title: item.title,
    slug,
    summary: text.summary,
    significance: text.significance,
    date,
    eventType,
    // Ecosystem classes (People / Institutions / Funding / Policy) record an
    // event class, not a research direction: showing one on them would invent
    // a direction the source never declared.
    researchArea: eventType === "Research" ? classification.researchArea : undefined,
    subArea: eventType === "Research" ? classification.subArea : undefined,
    sourceType: sourceTypeOf(item),
    sourceTier: item.sourceTier,
    sourceUrl: item.url ?? "",
    paperUrl: paperUrlFor(item),
    githubUrl: item.githubUrl,
    authors: item.authors ?? [],
    relatedWorks: [],
    isDemo,
    metadata: metadata?.en,
    entities,
    aiRole: attributed
      ? { level: attributed.en.level, description: attributed.en.description }
      : undefined,
    humanContribution: attributed?.en.humanContribution,
    // Everything the pipeline emits is automated until a human reviews it.
    provenance: "automated",
    // Chinese is generated in the same LLM call, so the zh UI never falls back
    // to English for auto-ingested entries.
    translations:
      text.titleZh && text.summaryZh
        ? {
            zh: {
              title: text.titleZh,
              summary: text.summaryZh,
              significance: text.significanceZh,
              metadata: metadata?.zh,
              aiRoleDescription: attributed?.zh?.description,
              humanContribution: attributed?.zh?.humanContribution,
            },
          }
        : metadata?.zh || attributed?.zh
          ? {
              zh: {
                metadata: metadata?.zh,
                aiRoleDescription: attributed?.zh?.description,
                humanContribution: attributed?.zh?.humanContribution,
              },
            }
          : undefined,
    lastSyncedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  // Derive verification/evidence labels so pipeline output carries the same
  // trust model as curated entries (claims stay claims).
  return applyTrustModel(event);
}

export { classifyItem } from "./classifier";
export { summarize } from "./summarizer";

