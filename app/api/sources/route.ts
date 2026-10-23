import { NextResponse } from "next/server";
import { loadSourceOverview } from "@/lib/db/sourceStatus";

export const dynamic = "force-dynamic";

/** GET /api/sources — source registry plus persisted manual-sync history. */
export async function GET() {
  try {
    const { sources, pending } = await loadSourceOverview();
    return NextResponse.json({ sources, pending });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
