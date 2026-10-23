import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { buildTrends } from "@/lib/trends";

export const dynamic = "force-dynamic";

/** Recent-vs-previous-window activity per research area. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const windowDays = Number(searchParams.get("windowDays") ?? 90);
  const events = await getStore().listEvents({ limit: 500 });
  const summary = buildTrends(
    events,
    Number.isFinite(windowDays) && windowDays > 0 ? windowDays : 90
  );
  return NextResponse.json(summary);
}
