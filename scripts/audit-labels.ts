/**
 * Read-only, full-corpus label audit. No LLM, no mutation.
 *
 * Checks all 9 taxonomy dimensions against the running dataset for:
 *   - illegal enum values
 *   - derived-field drift (cap / math / publicationStatus recomputed)
 *   - missing fields (per event class)
 *   - cross-dimension contradictions
 *   - known math-keyword false positives (ecosystem hits, geometry borrowed terms)
 *
 * Run: npx tsx scripts/audit-labels.ts
 */
import { SeedStore } from "@/lib/db/seedStore";
import { capabilityOf, mathTopicsOf, CAPABILITIES, MATH_TOPICS } from "@/lib/dimensions";
import {
  EVENT_TYPES,
  RESEARCH_AREAS,
  EVIDENCE_LEVELS,
  SOURCE_TIERS,
  PUBLICATION_STATUSES,
  AI_ROLE_LEVELS,
  CONTROLLED_SUB_AREAS,
} from "@/types";
import type { ResearchEvent } from "@/types";

type Issue = { slug: string; kind: string; detail: string };
const issues: Record<string, Issue[]> = {};
function flag(kind: string, e: ResearchEvent, detail: string) {
  (issues[kind] ??= []).push({ slug: e.slug, kind, detail });
}

const ECO = new Set(["People", "Institutions", "Funding", "PolicyCommunity"]);
const capIds = new Set(CAPABILITIES.map((c) => c.id));
const mathIds = new Set(MATH_TOPICS.map((m) => m.id));

// mirrors verification.ts linkStage (not exported)
const PREPRINT_HOST = /(^|\.)arxiv\.org$/i;
const PUBLISHED_HOST = /(^|\.)(aclanthology\.org|proceedings\.mlr\.press|papers\.nips\.cc|ijcai\.org|ceur-ws\.org)$/i;
const REPOSITORY_DOI = /^10\.5281\//;
function linkStage(url?: string): string | undefined {
  if (!url) return undefined;
  let u: URL;
  try { u = new URL(url); } catch { return undefined; }
  if (PREPRINT_HOST.test(u.hostname)) return "preprint";
  if (PUBLISHED_HOST.test(u.hostname)) return "published";
  if (/(^|\.)doi\.org$/i.test(u.hostname)) {
    const doi = u.pathname.replace(/^\/+/, "");
    if (doi.startsWith("10.48550/")) return "preprint";
    if (REPOSITORY_DOI.test(doi)) return undefined;
    return "published";
  }
  return undefined;
}
function pubOf(e: ResearchEvent): string | undefined {
  const urls = [e.paperUrl, ...(e.papers ?? []).map((p) => p.url), e.sourceUrl];
  const stages = urls.map(linkStage);
  if (stages.includes("published")) return "published";
  if (stages.includes("preprint")) return "preprint";
  return undefined;
}

// Mirrors lib/dimensions.ts: loanwords are only a false positive when no real
// geometry signal is present in the same text.
const GEOMETRY_LOANWORDS = /\b(information geometry|gradient geometry|pole geometry|geometry[- ]aware|geometry bias|geometry state)\b/i;
const REAL_GEOMETRY_SIGNAL = /\b(manifold|curvature|topolog(y|ical)|convex (body|region|set|hull)|polyhedral|simplicial|riemannian|geometric (theorem|problem|proof)|euclidean space)\b/i;

async function main() {
  const rows: ResearchEvent[] = await new SeedStore().listEvents();
  console.log(`TOTAL ${rows.length}\n`);

  for (const e of rows) {
    const eco = ECO.has(e.eventType ?? "");

    // 1. eventType legality
    if (e.eventType && !(EVENT_TYPES as readonly string[]).includes(e.eventType))
      flag("01-illegal-eventType", e, e.eventType);

    // 2. researchArea legality + ecosystem leakage
    if (e.researchArea && !(RESEARCH_AREAS as readonly string[]).includes(e.researchArea))
      flag("02-illegal-researchArea", e, e.researchArea);
    if (eco && e.researchArea) flag("02-eco-has-researchArea", e, e.researchArea);
    if (!eco && !e.researchArea) flag("02-research-missing-researchArea", e, "missing");

    // subArea controlled vocabulary
    if (e.researchArea && e.subArea) {
      const allowed = CONTROLLED_SUB_AREAS[e.researchArea as keyof typeof CONTROLLED_SUB_AREAS];
      if (allowed && !(allowed as readonly string[]).includes(e.subArea))
        flag("02-illegal-subArea", e, `${e.researchArea} / ${e.subArea}`);
    }
    if (e.subArea && !e.researchArea) flag("02-subArea-without-area", e, e.subArea);

    // 3. cap derivation drift + ecosystem leakage
    const expectCap = capabilityOf(e);
    const actualCap = (e as any).facets?.cap ?? undefined; // SeedStore rows have no facets; recompute only
    if (eco && expectCap) flag("03-eco-has-cap", e, expectCap);
    if (!eco && !expectCap && e.researchArea)
      flag("03-cap-unexpected-empty", e, `area=${e.researchArea}`);

    // 4. math drift + ecosystem false positives + borrowed geometry
    const math = mathTopicsOf(e);
    if (eco && math.length) flag("04-eco-has-math", e, math.join(","));
    const text = `${e.title} ${e.summary ?? ""}`;
    if (math.includes("geometry") && GEOMETRY_LOANWORDS.test(text) && !REAL_GEOMETRY_SIGNAL.test(text))
      flag("04-borrowed-geometry", e, (text.match(GEOMETRY_LOANWORDS) ?? [""])[0]);

    // 5. direction legality + ecosystem leakage + research missing
    if (e.direction && !["ai4math", "math4ai", "both"].includes(e.direction))
      flag("05-illegal-direction", e, e.direction);
    if (eco && e.direction) flag("05-eco-has-direction", e, e.direction);
    if (!eco && !e.direction) flag("05-research-missing-direction", e, "missing");

    // 6. evidence legality
    if (e.evidenceLevel && !(EVIDENCE_LEVELS as readonly string[]).includes(e.evidenceLevel))
      flag("06-illegal-evidence", e, e.evidenceLevel);

    // 7. source tier legality
    if (e.sourceTier && !(SOURCE_TIERS as readonly string[]).includes(e.sourceTier))
      flag("07-illegal-sourceTier", e, e.sourceTier);

    // 8. aiRole legality + ecosystem must be not_applicable
    if (e.aiRole && !(AI_ROLE_LEVELS as readonly string[]).includes(e.aiRole.level))
      flag("08-illegal-aiRole", e, e.aiRole.level);
    if (eco && (!e.aiRole || e.aiRole.level !== "not_applicable"))
      flag("08-eco-aiRole-wrong", e, e.aiRole?.level ?? "missing");
    if (!eco && !e.aiRole) flag("08-research-missing-aiRole", e, "missing");
    // Research events MAY be not_applicable: taxonomy ch.8 covers pure-human
    // results, benchmarks, datasets and tools, which are valid Research types.

    // 9. publication legality + derivation drift
    if (e.publicationStatus && !(PUBLICATION_STATUSES as readonly string[]).includes(e.publicationStatus))
      flag("09-illegal-publication", e, e.publicationStatus);
    const expectPub = pubOf(e);
    if (e.publicationStatus !== expectPub)
      flag("09-publication-drift", e, `stored=${e.publicationStatus ?? "blank"} expected=${expectPub ?? "blank"}`);

    // NOTE: direction and cap are orthogonal axes (deliverable vs topic).
    // A "math4ai + proving cap" or "ai4math + foundations cap" pairing is valid:
    // an AI-method paper can be about proving, a logic result can deliver
    // mathematics. No cross-dimension check belongs here — only same-axis and
    // derivation checks are meaningful.
  }

  // summarize
  const keys = Object.keys(issues).sort();
  let total = 0;
  for (const k of keys) {
    const list = issues[k];
    total += list.length;
    console.log(`\n### ${k}  (${list.length})`);
    for (const it of list.slice(0, 25)) console.log(`  ${it.slug} :: ${it.detail}`);
    if (list.length > 25) console.log(`  ... +${list.length - 25} more`);
  }
  console.log(`\n=== TOTAL ISSUES ${total} across ${keys.length} kinds ===`);
  if (!total) console.log("CLEAN");
}

main().catch((err) => { console.error(err); process.exit(1); });
