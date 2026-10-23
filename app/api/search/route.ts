import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { getLang } from "@/lib/i18n/server";
import { EVENT_ZH } from "@/data/i18n/events";

export const dynamic = "force-dynamic";

/**
 * GET /api/search?q=lean theorem proving
 * Full-site search across Research Events, Papers, Topics, Models and Benchmarks.
 * Basic text matching (PostgreSQL `contains` when DATABASE_URL is configured);
 * no vector database in v1.
 *
 * Matching always runs against the English source text; when the `lang`
 * cookie selects Chinese, event-group titles render from the zh overlay.
 */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  try {
    const result = await getStore().search(q);
    if (getLang() === "zh") {
      result.groups = result.groups.map((g) => {
        if (g.kind !== "event") return g;
        const zh = EVENT_ZH[g.href.replace("/research/", "")]?.title;
        return zh ? { ...g, title: zh } : g;
      });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
