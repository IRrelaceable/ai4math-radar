import { NextResponse } from "next/server";
import { runPipeline } from "@/agents/researchTracker/tracker";
import { liveResearchSources, mockResearchSource } from "@/lib/sources";
import { createArxivSource } from "@/lib/sources/arxiv";
import { createGitHubSource } from "@/lib/sources/github";
import { appendIngestedEvents, readIngestedFingerprints, writeIngestedFingerprints } from "@/lib/db/ingested";
import { updateSourceStatus } from "@/lib/db/sourceStatus";
import type { RawResearchItem } from "@/types";

export const dynamic = "force-dynamic";

/**
 * Live sources pull broadly (this is how the site grows), so their default
 * candidate volume is much higher than the offline mock demo.
 */
const LIVE_DEFAULT_LIMIT = 250;

/**
 * POST /api/agents/ingest
 *
 * The agent data path:
 *
 *   ResearchSource -> RawResearchItem -> Normalizer -> Classifier -> ResearchEvent
 *
 * Body (all optional):
 *   { "items": RawResearchItem[] }  - custom items
 *   { "source": "<registered-source-id>" }       - default "mock" (offline)
 *   { "query": "..." }              - arXiv search query override
 *   { "since": "2026-10-01" }        - incremental lower bound (YYYY-MM-DD)
 *   { "limit": 250 }                - max candidates per source
 *                                     (default: 250 live / all mock items)
 *   { "persist": true|false }       - write accepted events to data/ingested
 *                                     (default: true for live sources)
 *
 * Live sources hit the public internet; the default mock run stays offline and
 * deterministic. Accepted live events are stored with provenance "automated"
 * and appear in /latest until a human reviews or removes them. Duplicate
 * slugs are merged (latest content wins), so re-runs are idempotent.
 */
export async function POST(request: Request) {
  let items: RawResearchItem[] | undefined;
  let source = "mock";
  let query: string | undefined;
  let limit: number | undefined;
  let since: string | undefined;
  let persist: boolean | undefined;

  if (request.headers.get("content-type")?.includes("application/json")) {
    try {
      const body = (await request.json()) as {
        items?: RawResearchItem[];
        source?: string;
        query?: string;
        limit?: number;
        since?: string;
        persist?: boolean;
      };
      if (Array.isArray(body.items)) items = body.items;
      if (typeof body.source === "string") source = body.source;
      if (typeof body.query === "string" && body.query.trim()) query = body.query.trim();
      if (Number.isFinite(body.limit)) limit = Number(body.limit);
      if (typeof body.since === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.since)) since = body.since;
      if (typeof body.persist === "boolean") persist = body.persist;
    } catch {
      // malformed body -> fall back to the mock source
    }
  }

  const isLive = source in liveResearchSources;
  const liveSource = isLive ? liveResearchSources[source] : undefined;
  const sources =
    items !== undefined
      ? []
      : source === "arxiv"
        ? [createArxivSource(query ? { query } : {})]
        : source === "github"
          ? [createGitHubSource()]
          : liveSource
            ? [liveSource]
            : [mockResearchSource];

  try {
    const result = await runPipeline(items, sources, {
      limit: limit ?? (isLive ? LIVE_DEFAULT_LIMIT : undefined),
      since,
      // Skip LLM re-summarization for slugs already stored with identical
      // source text (only meaningful when we are about to persist anyway).
      existingFingerprints:
        !items && (persist ?? isLive) ? readIngestedFingerprints() : undefined,
    });

    let persisted: { added: number; updated: number; total: number } | undefined;
    if (!items && (persist ?? isLive) && result.accepted.length > 0) {
      persisted = appendIngestedEvents(result.accepted);
      // Record what we just stored so the next run can skip it unchanged.
      writeIngestedFingerprints(result.fingerprints);
    }

    let sourceStatus;
    if (isLive) {
      const latestDate =
        result.latestSeenDate ??
        result.accepted
          .map((event) => event.date)
          .sort()
          .pop();
      sourceStatus = updateSourceStatus(source, {
        label: liveSource?.label ?? source,
        status: "success",
        lastAttemptAt: new Date().toISOString(),
        lastSuccessAt: new Date().toISOString(),
        lastError: undefined,
        accepted: result.accepted.length,
        added: persisted?.added ?? 0,
        updated: persisted?.updated ?? 0,
        rejected: result.rejected.length,
        total: persisted?.total,
        ...(latestDate ? { cursor: latestDate } : {}),
      });
    }

    return NextResponse.json({
      source: items ? "custom" : source,
      since,
      sourceStatus,
      accepted: result.accepted,
      rejectedCount: result.rejected.length,
      rejected: result.rejected.map((r) => ({ title: r.item.title, reason: r.reason })),
      trace: result.trace,
      persisted,
      note: isLive
        ? "Live pipeline output — accepted events are persisted with provenance 'automated' " +
          "and are visible in /latest until reviewed."
        : "Mock pipeline output — offline demo items; persisted only if 'persist' is set.",
    });
  } catch (error) {
    if (isLive) {
      updateSourceStatus(source, {
        status: "error",
        lastAttemptAt: new Date().toISOString(),
        lastError: String(error),
      });
    }
    return NextResponse.json(
      { error: String(error), source },
      { status: 502 }
    );
  }
}

