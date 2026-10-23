import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/research-map -> the same structure the Research Map page renders:
 * AI4Math -> areas -> sub areas, with counts and recorded lineage edges.
 */
export async function GET() {
  try {
    const store = getStore();
    const [events, areas] = await Promise.all([store.listEvents(), store.listTopics()]);

    const nodes = areas.map((a) => {
      const areaEvents = events.filter((e) => e.researchArea === a.topic);
      const subAreas = new Map<string, number>();
      for (const e of areaEvents) {
        if (e.subArea) subAreas.set(e.subArea, (subAreas.get(e.subArea) ?? 0) + 1);
      }
      return {
        id: a.slug,
        label: a.topic,
        kind: "area" as const,
        count: a.count,
        href: `/topics/${a.slug}`,
        children: [...subAreas.entries()].map(([name, count]) => ({
          id: `${a.slug}-${slugify(name)}`,
          label: name,
          kind: "subArea" as const,
          count,
        })),
      };
    });

    const edges = events.flatMap((e) =>
      e.relatedWorks.map((w) => ({
        from: w.title,
        to: e.title,
        relation: w.relation,
        url: w.url,
      }))
    );

    return NextResponse.json({
      root: { id: "ai4math", label: "AI4Math", kind: "root", count: events.length },
      nodes,
      edges,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
