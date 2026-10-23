import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/events/[slug] -> a single ResearchEvent or 404. */
export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    const event = await getStore().getEventBySlug(params.slug);
    if (!event) {
      return NextResponse.json({ error: "Research event not found" }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
