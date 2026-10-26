import type { ResearchEvent, RelatedWork, SearchResult, TopicStat } from "@/types";
import { sortEvents, sortEventsByImportance } from "@/lib/utils";
import { normalizeEcosystemEvent } from "@/lib/ecosystem";
import type { ListEventsOptions, ResearchStore, TopicDetail } from "./store";
import { buildTopicStats, searchEvents } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

const INCLUDE = {
  researchArea: true,
  institution: true,
  eventPapers: { include: { paper: true } },
  eventAuthors: { include: { author: true } },
  relatedWorks: true,
  verificationRecords: { orderBy: { date: "asc" as const } },
};

function toIsoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value.slice(0, 10);
  return String(value ?? "");
}

function mapEvent(row: any): ResearchEvent {
  const papers = (row.eventPapers ?? []).map((p: any) => ({
    title: p.paper?.title ?? p.title ?? "",
    url: p.paper?.url ?? undefined,
    venue: p.paper?.venue ?? undefined,
    year: p.paper?.year ?? undefined,
  }));

  const relatedWorks: RelatedWork[] = (row.relatedWorks ?? []).map((r: any) => ({
    title: r.title,
    url: r.url ?? undefined,
    relation: (r.relation as RelatedWork["relation"]) ?? "related",
    note: r.note ?? undefined,
  }));

  return normalizeEcosystemEvent({
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    significance: row.significance,
    date: toIsoDate(row.date),
    researchArea: row.researchArea?.name,
    subArea: row.subArea ?? undefined,
    sourceType: row.sourceType,
    sourceUrl: row.sourceUrl,
    paperUrl: row.paperUrl ?? undefined,
    githubUrl: row.githubUrl ?? undefined,
    papers,
    authors: (row.eventAuthors ?? []).map((a: any) => a.author?.name ?? "").filter(Boolean),
    institution: row.institution?.name ?? undefined,
    model: row.modelNames ?? [],
    benchmark: row.benchmarkNames ?? [],
    dataset: row.datasetNames ?? [],
    relatedWorks,
    keyContributions: row.keyContributions ?? [],
    problem: row.problem ?? undefined,
    isDemo: row.isDemo ?? false,
    /* trust model (objective, observable corroboration labels) */
    verificationStatus: row.verificationStatus ?? "claimed",
    evidenceLevel: row.evidenceLevel ?? "E2",
    sourceTier: row.sourceTier ?? "S1",
    eventType: row.eventType ?? undefined,
    researchEventType: row.researchEventType ?? undefined,
    metadata: (row.metadata ?? undefined) as ResearchEvent["metadata"],
    importanceTier: row.importanceTier ?? undefined,
    importanceNote: row.importanceNote ?? undefined,
    provenance: row.provenance ?? "curated",
    reviewStatus: row.reviewStatus ?? (row.provenance === "automated" ? "pending" : "approved"),
    verificationHistory: (row.verificationRecords ?? []).map((r: any) => ({
      date: toIsoDate(r.date),
      status: r.status,
      evidenceLevel: r.evidenceLevel,
      note: r.note ?? undefined,
    })),
    createdAt: toIsoDate(row.createdAt),
    updatedAt: toIsoDate(row.updatedAt),
  });
}

/**
 * PrismaStore - PostgreSQL-backed implementation of ResearchStore.
 *
 * The Prisma client is loaded lazily so that `next build` and `npm run dev`
 * keep working before `npx prisma generate` / `prisma db push` have been run.
 */
export class PrismaStore implements ResearchStore {
  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  private async allEvents(): Promise<ResearchEvent[]> {
    const rows = await this.client.researchEvent.findMany({
      include: INCLUDE,
      orderBy: { date: "desc" },
    });
    return rows.map(mapEvent);
  }

  async listEvents(options: ListEventsOptions = {}): Promise<ResearchEvent[]> {
    const { eventType, area, q, status, evidence, tier, model, benchmark, dataset, since, year, sort, limit } =
      options;
    const rows = await this.client.researchEvent.findMany({
      where: {
        ...(eventType ? { eventType } : {}),
        ...(area && area.toLowerCase() !== "all"
          ? { researchArea: { name: area } }
          : {}),
        ...(q && q.trim()
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { summary: { contains: q, mode: "insensitive" } },
                { significance: { contains: q, mode: "insensitive" } },
                { subArea: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
        /* trust-model filters */
        ...(status ? { verificationStatus: status } : {}),
        ...(evidence ? { evidenceLevel: evidence } : {}),
        ...(tier ? { sourceTier: tier } : {}),
        /* facet filters (denormalized String[] columns) */
        ...(model ? { modelNames: { has: model } } : {}),
        ...(benchmark ? { benchmarkNames: { has: benchmark } } : {}),
        ...(dataset ? { datasetNames: { has: dataset } } : {}),
        /* time filter */
        ...(since || year
          ? {
              date: {
                ...(since ? { gte: new Date(since) } : {}),
                ...(year
                  ? { lt: new Date(`${Number(year) + 1}-01-01`) }
                  : {}),
              },
            }
          : {}),
      },
      include: INCLUDE,
      orderBy: { date: "desc" },
    });
    const mapped = rows.map(mapEvent);
    const ordered =
      sort === "importance" ? sortEventsByImportance(mapped) : sortEvents(mapped);
    return limit && limit > 0 ? ordered.slice(0, limit) : ordered;
  }

  async getEventBySlug(slug: string): Promise<ResearchEvent | null> {
    const row = await this.client.researchEvent.findUnique({
      where: { slug },
      include: INCLUDE,
    });
    return row ? mapEvent(row) : null;
  }

  async listTopics(): Promise<TopicStat[]> {
    return buildTopicStats(await this.allEvents());
  }

  async getTopic(slug: string): Promise<TopicDetail | null> {
    const area = await this.client.researchArea.findUnique({ where: { slug } });
    if (!area) return null;
    const stat = (await this.listTopics()).find((t) => t.slug === slug);
    if (!stat) return null;
    const rows = await this.client.researchEvent.findMany({
      where: { researchAreaId: area.id },
      include: INCLUDE,
      orderBy: { date: "desc" },
    });
    return { stat, events: sortEvents(rows.map(mapEvent)) };
  }

  async search(query: string): Promise<SearchResult> {
    return searchEvents(await this.allEvents(), query);
  }
}



