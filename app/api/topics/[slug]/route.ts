import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/topics/[slug] -> topic stats + its ResearchEvents. */
export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    const detail = await getStore().getTopic(params.slug);
    if (!detail) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    return NextResponse.json(detail);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
