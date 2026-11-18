// Relative import on purpose: this module is shared with prisma/seed.ts, which
// runs under `tsx` without the Next.js path aliases.
import { CONTROLLED_SUB_AREAS, EVIDENCE_LEVELS } from "../types";
import { resolveSourceTier as resolveCatalogSourceTier } from "./sources/catalog";
import type {
  EvidenceLevel,
  EventType,
  PublicationStatus,
  ResearchEvent,
  Source,
  SourceTier,
} from "../types";

/**
 * Trust model — a deliberately lightweight version of the pattern used by
 * evidence-backed AI4Math archives. Two dimensions stay SEPARATE:
 *
 *   evidence level   = how mature the public evidence is
 *   source tier      = where the evidence comes from
 *
 * Evidence ≠ Importance: a historically big claim can still sit at E3
 * (announced by the originating party only), and a machine-checked artifact
 * does not equal independent checking. Never merge them into one ranking.
 */

/**
 * Manual overrides. Only used where the derived rules would be misleading.
 * Key = event slug.
 */
const OVERRIDES: Partial<
  Record<string, Partial<Pick<ResearchEvent, "evidenceLevel" | "eventType">>>
> = {
  // Official lab announcements of graded competition results: the grading claim
  // comes from the contest side, not from a paper, so it stays at E3.
  "alphaproof-imo-silver-medal-standard": { evidenceLevel: "E3" },
  "gemini-deep-think-imo-2025-gold-medal": { evidenceLevel: "E3" },
  "numinamath-aimo-progress-prize-1": { evidenceLevel: "E3" },
  "alphaevolve-gemini-coding-agent-algorithms": { evidenceLevel: "E3" },
  // Synthetic examples produced by the mock pipeline — not research evidence.
  "placeholder-event": { evidenceLevel: "E3" },
};

export interface TrustModel {
  evidenceLevel: EvidenceLevel;
  sourceTier: SourceTier;
  eventType: EventType;
}

function deriveEvidenceLevel(event: ResearchEvent): EvidenceLevel {
  if (event.githubUrl) return "E1";
  if (event.paperUrl || (event.papers ?? []).length > 0) return "E2";
  // No inspectable artifact or research record — a bare claim at best.
  // E4 ("no public evidence") was removed: every indexed event has a sourceUrl,
  // so the fallback is always a single-party claim (E3).
  return "E3";
}

function deriveSourceTier(event: ResearchEvent): SourceTier {
  const catalogTier = resolveCatalogSourceTier({
    sourceUrl: event.sourceUrl,
  });
  if (catalogTier) return catalogTier;
  if (event.sourceType === "arxiv" || event.sourceType === "conference") return "S0";
  if (event.sourceType === "github") return "S0";
  if (event.sourceType === "blog") return "S1";
  return "S1";
}

/** Link type deterministically indicates the publication stage — there is no
 *  manual annotation step. A preprint server (arXiv) hosts non-peer-reviewed
 *  drafts; a conference proceedings or publisher record (ACL Anthology, PMLR,
 *  NeurIPS, IJCAI, CEUR, publisher DOI) is a formal publication. Repository
 *  deposits (zenodo) and technical reports (RAND) are neither, so they stay
 *  unset. Stages such as acceptance or withdrawal cannot be read from a link
 *  and are not modelled. */
const PREPRINT_HOST = /(^|\.)arxiv\.org$/i;
const PUBLISHED_HOST = /(^|\.)(aclanthology\.org|proceedings\.mlr\.press|papers\.nips\.cc|ijcai\.org|ceur-ws\.org)$/i;
/** zenodo is a repository, not a formal publisher. */
const REPOSITORY_DOI = /^10\.5281\//;

function linkStage(url?: string): PublicationStatus | undefined {
  if (!url) return undefined;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return undefined;
  }
  if (PREPRINT_HOST.test(u.hostname)) return "preprint";
  if (PUBLISHED_HOST.test(u.hostname)) return "published";
  if (/(^|\.)doi\.org$/i.test(u.hostname)) {
    const doi = u.pathname.replace(/^\/+/, "");
    if (doi.startsWith("10.48550/")) return "preprint"; // arXiv DOI
    if (REPOSITORY_DOI.test(doi)) return undefined; // zenodo deposit
    return "published"; // publisher DOI
  }
  return undefined;
}

/** Furthest stage wins: a published record supersedes an arXiv draft. */
function derivePublicationStatus(event: ResearchEvent): PublicationStatus | undefined {
  const urls = [event.paperUrl, ...(event.papers ?? []).map((p) => p.url), event.sourceUrl];
  const stages = urls.map(linkStage);
  if (stages.includes("published")) return "published";
  if (stages.includes("preprint")) return "preprint";
  return undefined;
}

/**
 * Build the source list from the links an event already carries. Read-time
 * derivation only — the 714 stored events are untouched. The event's tier
 * labels the primary source; papers and code are added as S0 records.
 */
export function deriveSources(event: ResearchEvent, tier: SourceTier): Source[] {
  const collectedAt = event.lastSyncedAt ?? event.updatedAt;
  const sources: Source[] = [];
  const push = (url?: string, sourceTier: SourceTier = tier, title?: string) => {
    if (url && !sources.some((s) => s.url === url)) {
      sources.push({ url, tier: sourceTier, publishedAt: event.date, collectedAt, title });
    }
  };
  // Paper links are primary research records (S0).
  push(event.paperUrl, "S0");
  for (const paper of event.papers ?? []) push(paper.url, "S0", paper.title);
  push(event.githubUrl, "S0");
  // The declared source link carries the event's own tier.
  push(event.sourceUrl, tier);
  return sources;
}

/** Fill any missing trust-model fields with conservative, rule-derived values. */
export function applyTrustModel(event: ResearchEvent): ResearchEvent {
  const override = OVERRIDES[event.slug] ?? {};
  const evidenceLevel = override.evidenceLevel ?? event.evidenceLevel ?? deriveEvidenceLevel(event);
  const sourceTier = event.sourceTier ?? deriveSourceTier(event);
  const eventType = override.eventType ?? event.eventType ?? "Research";
  const publicationStatus = derivePublicationStatus(event);
  const sources = event.sources?.length ? event.sources : deriveSources(event, sourceTier);

  return {
    ...event,
    evidenceLevel,
    sourceTier,
    eventType,
    publicationStatus,
    sources,
  };
}

export const EVIDENCE_ORDER = EVIDENCE_LEVELS as readonly EvidenceLevel[];



/**
 * Validate that every `subArea` falls inside the controlled vocabulary for its
 * research area. Sub-areas used to be free text, which let one concept shatter
 * into many one-off labels ("Lean 4", "premise selection", "in-context
 * learning agent"); `CONTROLLED_SUB_AREAS` now pins each governed area to a
 * small closed set. Areas absent from that map are not yet governed and are
 * skipped, so the remaining directions can be migrated incrementally.
 *
 * Relative import on purpose (same reason as above): shared with prisma/seed.ts.
 */
export function validateSubAreas(events: readonly ResearchEvent[]): string[] {
  const problems: string[] = [];
  for (const e of events) {
    const sub = e.subArea;
    if (!e.researchArea || !sub) continue; // ungoverned area, or no sub-area set
    const allowed = CONTROLLED_SUB_AREAS[e.researchArea];
    if (!allowed) continue; // area not governed yet
    if (!allowed.includes(sub)) {
      problems.push(
        `${e.slug}: subArea "${sub}" is not in CONTROLLED_SUB_AREAS["${e.researchArea}"]`
      );
    }
  }
  return problems;
}
