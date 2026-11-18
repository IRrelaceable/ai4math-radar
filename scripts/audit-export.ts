/**
 * One-shot export of every audit gap with the full raw text needed for manual
 * classification. Read-only. Writes scripts/audit-gaps.json.
 *
 * Run: npx tsx scripts/audit-export.ts
 */
import fs from "node:fs";
import { SeedStore } from "@/lib/db/seedStore";
import { mathTopicsOf } from "@/lib/dimensions";
import type { ResearchEvent } from "@/types";

const ECO = new Set(["People", "Institutions", "Funding", "PolicyCommunity"]);
const BORROWED_GEO = /\b(information geometry|gradient geometry|pole geometry|geometry of (relu|function|landscape|representation)|geometry state|geometry-aware|geometry bias)\b/i;

function slim(e: ResearchEvent) {
  return {
    slug: e.slug,
    eventType: e.eventType,
    title: e.title,
    summary: (e.summary ?? "").slice(0, 400),
    researchArea: e.researchArea ?? null,
    subArea: e.subArea ?? null,
    direction: e.direction ?? null,
    aiRole: e.aiRole ?? null,
    sourceTier: e.sourceTier ?? null,
    sourceUrl: e.sourceUrl ?? null,
  };
}

async function main() {
  const rows: ResearchEvent[] = await new SeedStore().listEvents();
  const res = rows.filter((e) => e.eventType === "Research");
  const eco = rows.filter((e) => ECO.has(e.eventType ?? ""));

  const out = {
    total: rows.length,
    research: res.length,
    eco: eco.length,
    // A: Research missing researchArea
    missingResearchArea: res.filter((e) => !e.researchArea).map(slim),
    // C1: Research missing direction
    missingDirection: res.filter((e) => !e.direction).map(slim),
    // C2: Research missing aiRole
    missingAiRole: res.filter((e) => !e.aiRole).map(slim),
    // B: ecosystem events with math hits (false positives)
    ecoMathHits: eco.filter((e) => mathTopicsOf(e).length).map((e) => ({
      ...slim(e),
      math: mathTopicsOf(e),
    })),
    // B: borrowed-geometry hits
    borrowedGeometry: rows.filter((e) => {
      const m = mathTopicsOf(e);
      const text = `${e.title} ${e.summary ?? ""}`;
      return m.includes("geometry") && BORROWED_GEO.test(text) &&
        !/(geometr(y|ic) (theorem|problem|proof)|manifold|curvature|topolog)/i.test(text);
    }).map((e) => ({ ...slim(e), math: mathTopicsOf(e) })),
  };

  const path = "scripts/audit-gaps.json";
  fs.writeFileSync(path, JSON.stringify(out, null, 2), "utf8");
  console.log("TOTAL", out.total, "research", out.research, "eco", out.eco);
  console.log("missingResearchArea", out.missingResearchArea.length);
  console.log("missingDirection", out.missingDirection.length);
  console.log("missingAiRole", out.missingAiRole.length);
  console.log("ecoMathHits", out.ecoMathHits.length);
  console.log("borrowedGeometry", out.borrowedGeometry.length);
  console.log("wrote", path);
}

main().catch((err) => { console.error(err); process.exit(1); });
