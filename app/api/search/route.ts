import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/search?q=lean theorem proving
 * Full-site search across Research Events, Papers, Topics, Models and Benchmarks.
 * Basic text matching (PostgreSQL `contains` when DATABASE_URL is configured);
 * no vector database in v1.
 */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  try {
    const result = await getStore().search(q);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
