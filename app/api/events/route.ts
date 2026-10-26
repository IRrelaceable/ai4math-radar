import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import type { ListEventsOptions } from "@/lib/db";
import { EVIDENCE_LEVELS, EVENT_TYPES, SOURCE_TIERS, VERIFICATION_STATUSES } from "@/types";
import type { EvidenceLevel, EventType, SourceTier, VerificationStatus } from "@/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/events?type=Research&area=Theorem Proving&q=lean&status=disputed
 *                 &tier=S1&model=GPT-4&benchmark=miniF2F&dataset=MATH
 *                 &since=2026-01-01&year=2025&limit=20
 * Returns ResearchEvent[] (newest first). All filters are optional and
 * combined with AND; unknown enum values are ignored.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit") ?? "0");

  const oneOf = <T extends string>(
    raw: string | null,
    allowed: readonly T[]
  ): T | undefined =>
    raw && (allowed as readonly string[]).includes(raw) ? (raw as T) : undefined;

  const sinceRaw = searchParams.get("since");
  const yearRaw = searchParams.get("year");

  const options: ListEventsOptions = {
    eventType: oneOf<EventType>(searchParams.get("type"), EVENT_TYPES),
    area: searchParams.get("area") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    status: oneOf<VerificationStatus>(
      searchParams.get("status"),
      VERIFICATION_STATUSES
    ),
    evidence: oneOf<EvidenceLevel>(searchParams.get("evidence"), EVIDENCE_LEVELS),
    tier: oneOf<SourceTier>(searchParams.get("tier"), SOURCE_TIERS),
    model: searchParams.get("model") ?? undefined,
    benchmark: searchParams.get("benchmark") ?? undefined,
    dataset: searchParams.get("dataset") ?? undefined,
    since:
      sinceRaw && /^\d{4}-\d{2}-\d{2}$/.test(sinceRaw) ? sinceRaw : undefined,
    year: yearRaw && /^\d{4}$/.test(yearRaw) ? yearRaw : undefined,
    limit: Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined,
  };

  try {
    const events = await getStore().listEvents(options);
    return NextResponse.json({ count: events.length, events });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}


