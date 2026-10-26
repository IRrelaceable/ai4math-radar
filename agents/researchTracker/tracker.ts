import type { EventType, RawResearchItem, ResearchEvent, SourceType } from "@/types";
import { slugify } from "@/lib/utils";
import { applyTrustModel } from "@/lib/verification";
import { researchSources, type ResearchSource } from "@/lib/sources";
import { classifyItem, type Classification } from "./classifier";
import { summarize } from "./summarizer";
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
  } = {}
): Promise<PipelineResult> {
  const { limit, since, existingFingerprints } = options;
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

  for (const item of raw) {
    const normalized = normalize(item);
    const classification = classifyItem(normalized);

    const effective: Classification =
      classification.isAI4Math && classification.researchArea
        ? classification
        : normalized.eventType && normalized.allowNonAI4Math
          ? {
              isAI4Math: true,
              researchArea: normalized.researchArea ?? "AI-assisted Research",
              subArea: normalized.sourceId,
              reasons: [
                `source-level ecosystem classification: ${normalized.eventType}` +
                  (normalized.sourceId ? ` (${normalized.sourceId})` : ""),
              ],
            }
          : classification;

    if (!effective.isAI4Math || !effective.researchArea) {
      rejected.push({ item, reason: classification.reasons.join("; ") || "not AI4Math" });
      continue;
    }

    const slug = slugify(normalized.title);
    const fingerprint = fingerprintItem(normalized);
    const previousFingerprint = existingFingerprints?.get(slug);

    // Already stored with identical source text: reuse the stored event and
    // skip the LLM call entirely. This keeps a re-sync cheap (no repeated
    // API spend) instead of re-summarizing every duplicate on every run.
    if (existingFingerprints && previousFingerprint === fingerprint) {
      skippedUnchanged += 1;
      continue;
    }

    const text = await summarize(normalized, effective);
    fingerprints.push([slug, fingerprint]);
    accepted.push(toEvent(normalized, effective, text, normalized.eventType));
    trace.push({
      step: "classify+summarize",
      detail: `"${normalized.title}" -> ${normalized.eventType ?? "Research"} / ${effective.researchArea}`,
    });
  }

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

function normalize(item: RawResearchItem): RawResearchItem {
  return {
    ...item,
    title: item.title.trim(),
    abstract: item.abstract?.trim(),
    authors: item.authors ?? [],
    source: item.source || "unknown",
  };
}

function sourceTypeOf(item: RawResearchItem): SourceType {
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

function toEvent(
  item: RawResearchItem,
  classification: Classification,
  text: { summary: string; significance: string },
  eventType: EventType = "Research"
): ResearchEvent {
  const now = new Date().toISOString();
  const date = item.publishedAt ?? now.slice(0, 10);
  const isDemo = item.source.toLowerCase().includes("demo");
  const event: ResearchEvent = {
    id: `evt_${item.id}`,
    title: item.title,
    slug: slugify(item.title),
    summary: text.summary,
    significance: text.significance,
    date,
    eventType,
    researchArea: classification.researchArea!,
    subArea: classification.subArea,
    sourceType: sourceTypeOf(item),
    sourceTier: item.sourceTier,
    sourceUrl: item.url ?? "",
    paperUrl: item.url ?? undefined,
    githubUrl: item.githubUrl,
    authors: item.authors ?? [],
    relatedWorks: [],
    isDemo,
    // Everything the pipeline emits is automated until a human reviews it.
    provenance: "automated",
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

