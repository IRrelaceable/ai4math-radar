import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/topics -> topic statistics computed from the ResearchEvent store. */
export async function GET() {
  try {
    const topics = await getStore().listTopics();
    return NextResponse.json({ count: topics.length, topics });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
