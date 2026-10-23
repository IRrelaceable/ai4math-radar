import type { RawResearchItem, ResearchEvent, SourceType } from "@/types";
import { slugify } from "@/lib/utils";
import { applyTrustModel } from "@/lib/verification";
import { researchSources, type ResearchSource } from "@/lib/sources";
import { classifyItem, type Classification } from "./classifier";
import { summarize } from "./summarizer";

export interface PipelineStepResult {
  step: string;
  detail: string;
}

export interface PipelineResult {
  accepted: ResearchEvent[];
  rejected: { item: RawResearchItem; reason: string }[];
  trace: PipelineStepResult[];
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
  options: { limit?: number; since?: string } = {}
): Promise<PipelineResult> {
  const raw: RawResearchItem[] =
    items ??
      (
        await Promise.all(
          sources.map((s) =>
            s.fetchRecent({ limit: options.limit, since: options.since })
          )
        )
      ).flat();

  const trace: PipelineStepResult[] = [
    {
      step: "ingest",
      detail:
        `received ${raw.length} raw research items` +
        (options.since ? ` since ${options.since}` : ""),
    },
  ];
  const accepted: ResearchEvent[] = [];
  const rejected: { item: RawResearchItem; reason: string }[] = [];

  for (const item of raw) {
    const normalized = normalize(item);
    const classification = classifyItem(normalized);

    if (!classification.isAI4Math || !classification.researchArea) {
      rejected.push({ item, reason: classification.reasons.join("; ") || "not AI4Math" });
      continue;
    }

    const text = await summarize(normalized, classification);
    accepted.push(toEvent(normalized, classification, text));
    trace.push({
      step: "classify+summarize",
      detail: `"${normalized.title}" -> ${classification.researchArea}`,
    });
  }

  trace.push({
    step: "emit",
    detail: `${accepted.length} research events produced, ${rejected.length} items rejected`,
  });

  return { accepted, rejected, trace };
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
  text: { summary: string; significance: string }
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
    eventType: "Research",
    researchArea: classification.researchArea!,
    subArea: classification.subArea,
    sourceType: sourceTypeOf(item),
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


