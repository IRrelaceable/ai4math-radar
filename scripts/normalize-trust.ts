import fs from "node:fs";
import path from "node:path";
import type { EvidenceLevel, ResearchEvent, SourceType } from "@/types";
import { applyTrustModel } from "@/lib/verification";
import { OFFICIAL_SOURCE_DEFINITIONS } from "@/lib/sources/catalog";

/**
 * One-off/repair tool: re-derive the trust model for stored automated events.
 *
 * The pipeline used to copy every item URL into `paperUrl`, which made the
 * trust model grade news, blog and repository items as E2 ("a paper or formal
 * research record exists"). This script drops the bogus paper links, forgets
 * the stored E/S labels and verification history, and lets `applyTrustModel`
 * rebuild them from the links that are actually there.
 *
 *   npx tsx scripts/normalize-trust.ts [--dry]
 */

const PAPER_SOURCES: readonly SourceType[] = ["arxiv", "conference"];

function distribution(events: ResearchEvent[], field: "evidenceLevel" | "sourceTier") {
  return events.reduce<Record<string, number>>((acc, event) => {
    const key = event[field] ?? "none";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function main() {
  const dry = process.argv.includes("--dry");
  const file = path.join(process.cwd(), "data", "ingested", "events.json");
  const events = JSON.parse(fs.readFileSync(file, "utf8")) as ResearchEvent[];

  const before = distribution(events, "evidenceLevel");
  let clearedPaperUrls = 0;
  let recomputed = 0;
  let correctedTypes = 0;

  // Page-mode source definitions are one event each; when a stored record
  // drifted from the catalog (e.g. a website filed as a conference paper),
  // the catalog wins and the paper link is re-evaluated below.
  const catalogByUrl = new Map(
    OFFICIAL_SOURCE_DEFINITIONS.map((definition) => [definition.url, definition.sourceType])
  );

  for (const event of events) {
    const catalogType = catalogByUrl.get(event.sourceUrl);
    if (catalogType && catalogType !== event.sourceType) {
      event.sourceType = catalogType;
      correctedTypes += 1;
    }
    const isPaper = PAPER_SOURCES.includes(event.sourceType);
    if (!isPaper && event.paperUrl === event.sourceUrl && event.paperUrl) {
      delete event.paperUrl;
      clearedPaperUrls += 1;
    }
    // Everything stored by the pipeline is automated, and its labels were
    // derived from (previously wrong) links, so they are safe to rebuild.
    if (event.provenance === "automated") {
      delete event.evidenceLevel;
      delete event.sourceTier;
      delete event.verificationHistory;
      const normalized = applyTrustModel(event);
      event.evidenceLevel = normalized.evidenceLevel;
      event.sourceTier = normalized.sourceTier;
      event.verificationHistory = normalized.verificationHistory;
      event.updatedAt = new Date().toISOString();
      recomputed += 1;
    }
  }

  const after = distribution(events, "evidenceLevel");
  console.log(`paper URLs cleared: ${clearedPaperUrls}`);
  console.log(`trust model recomputed: ${recomputed}`);
  console.log("evidence before:", before);
  console.log("evidence after: ", after);
  console.log("tiers after:    ", distribution(events, "sourceTier"));

  if (dry) {
    console.log("dry run — nothing written");
    return;
  }
  fs.writeFileSync(file, JSON.stringify(events, null, 2), "utf8");
  console.log(`wrote ${file}`);
}

main();
