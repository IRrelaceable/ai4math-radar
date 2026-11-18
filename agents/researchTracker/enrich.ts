import type { AiRoleLevel, EventDirection, RawResearchItem } from "@/types";
import { getLLMProvider, type LLMProvider } from "@/lib/llm/provider";
import type { Classification } from "./classifier";
import { CONTRIBUTION_RULES } from "./contribution";
import { ENTITY_RULES, sanitizeEntities } from "./entities";
import { DIRECTION_RULES } from "./direction";

/**
 * One-call enrichment for Research items.
 *
 * The old pipeline made four separate network round-trips per new item
 * (summary+zh, AI/human contribution, named entities, direction). This module
 * sends them as ONE call whose JSON keys map onto the existing parsers, so
 * downstream shape and trust rules do not change.
 *
 * ONE output format: each rubric is imported in its rules-only form (format
 * instructions stripped), and a single authoritative schema below defines the
 * only accepted JSON shape. This removes the four competing "reply with ..."
 * formats that used to be concatenated into the prompt.
 *
 * What this saves: 4 round-trips -> 1 (the dominant cost on a 25-item arXiv
 * batch was ~4 min of sequential network time), plus three sets of response
 * framing and the per-call retry paths. What it does NOT save: the rubric
 * judgment tokens themselves — the rules are still sent in full. The direction
 * rubric keeps all 25 boundary examples because direction.test.ts locks them to
 * the stored fixtures. Whether the net token cost drops is measured by
 * scripts/compare-enrichment.ts, not asserted here. A strict presence gate in
 * parseEnrichment() rejects any reply that omits a key, so callers fall back to
 * the original four calls instead of shipping a half-enriched event.
 */

export interface Enrichment {
  summary: string;
  /** May be "" — an explicit "the source supports no why-it-matters". */
  significance: string;
  titleZh: string;
  summaryZh: string;
  /** May be "" for the same reason as significance. */
  significanceZh: string;
  /** Always present: level is the explicit attribution verdict. */
  aiRole: {
    level: AiRoleLevel;
    description?: string;
    humanContribution?: string;
    zh?: { description?: string; humanContribution?: string };
  };
  /** Present key, empty arrays → undefined after sanitize (explicit "no entities"). */
  entities?: ReturnType<typeof sanitizeEntities>;
  /** Present key, "none" → undefined (explicit "no axis"). */
  direction?: EventDirection;
}

/**
 * The ONLY output format. Every key is mandatory: an unanswered task must be
 * expressed in-band ("" / "none" / empty arrays / a valid level), never by
 * dropping the key. The rubric sections below are judgment rules only; ignore
 * any output-format wording you recall from them and use this schema alone.
 */
const OUTPUT_CONTRACT = [
  "Reply with ONE JSON object and nothing else, using EXACTLY these eight keys (do not omit any key):",
  "  summary: concise English prose (non-empty).",
  '  significance: concise English prose; use "" when the source supports no why-it-matters.',
  "  titleZh: Simplified Chinese title (non-empty).",
  "  summaryZh: Simplified Chinese summary (non-empty).",
  '  significanceZh: Simplified Chinese significance; use "" when significance is "".',
  "  aiRole: object with level exactly one of autonomous, assisted, unclear, not_applicable; use not_applicable for no AI role. Include description / humanContribution and their zh counterparts only when the source states them.",
  "  entities: object with ALL FOUR keys people, institutions, projects, systems, each an array of names; use [] for a group with no names.",
  "  direction: exactly one string of ai4math, math4ai, both, none; use none for no axis.",
  "Use only facts stated in the supplied title and abstract. Never invent results, and never omit a key to mean 'none'.",
].join("\n");

const TRANSLATION_RULE =
  "For all Chinese fields: translate theorem, conjecture and field names with the original in " +
  "parentheses on first mention; keep model names, Lean identifiers, abbreviations and personal " +
  "names in original spelling; no gendered pronouns; no markdown.";

const SYSTEM = [
  "You perform four extraction tasks for one AI-for-Mathematics research event.",
  OUTPUT_CONTRACT,
  TRANSLATION_RULE,
  "",
  "The sections below are JUDGMENT RULES for deciding each value. They are not output formats —",
  "do not follow any 'reply with JSON' wording inside them; the schema above is the only format.",
  "",
  "=== ATTRIBUTION rules (how to choose aiRole.level) ===",
  CONTRIBUTION_RULES,
  "",
  "=== ENTITY rules (how to fill entities) ===",
  ENTITY_RULES,
  "",
  "=== DIRECTION rubric (how to choose direction) ===",
  DIRECTION_RULES,
].join("\n");

const RESPONSE_SCHEMA =
  "Fill the eight keys of the output contract. Example shape (values are illustrative): " +
  '{"summary":"...","significance":"...","titleZh":"...","summaryZh":"...","significanceZh":"...",' +
  '"aiRole":{"level":"assisted","description":"...","humanContribution":"...","zh":{"description":"...","humanContribution":"..."}},' +
  '"entities":{"people":[],"institutions":[],"projects":[],"systems":[]},"direction":"ai4math"}';

function object(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function str(value: unknown, max = 1600): string | undefined {
  if (typeof value !== "string") return undefined;
  const s = value.replace(/\s+/g, " ").trim();
  if (!s) return undefined;
  return s.length <= max ? s : `${s.slice(0, max).trimEnd()}…`;
}

/** Like str(), but "" is a valid explicit answer ("the source supports no text here"). */
function strOrEmpty(value: unknown, max = 1600): string | undefined {
  if (typeof value !== "string") return undefined;
  const s = value.replace(/\s+/g, " ").trim();
  if (!s) return "";
  return s.length <= max ? s : `${s.slice(0, max).trimEnd()}…`;
}

function hasOwn(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

const VALID_LEVELS: readonly AiRoleLevel[] = [
  "autonomous",
  "assisted",
  "unclear",
  "not_applicable",
];
const VALID_DIRECTIONS = ["ai4math", "math4ai", "both", "none"] as const;
const ENTITY_GROUPS = ["people", "institutions", "projects", "systems"] as const;

/** The eight top-level keys every merged reply must state explicitly. */
const REQUIRED_KEYS = [
  "summary",
  "significance",
  "titleZh",
  "summaryZh",
  "significanceZh",
  "aiRole",
  "entities",
  "direction",
] as const;

/**
 * Extract a JSON object, tolerating code fences and stray prose.
 *
 * Strict contract: every one of the eight keys must be PRESENT with an explicit
 * value. "No result" is expressed in-band — "" for the prose fields, a valid
 * level (including "not_applicable") for aiRole, empty arrays for entities, and
 * "none" for direction. A MISSING key means the model did not answer that task,
 * so the whole reply is rejected and the tracked item falls back to the four
 * per-field calls. This is what prevents a partial reply from silently losing
 * aiRole / entities / direction while still looking like a success.
 */
export function parseEnrichment(response: string): Enrichment | undefined {
  const start = response.indexOf("{");
  const end = response.lastIndexOf("}");
  if (start === -1 || end <= start) return undefined;
  let raw: Record<string, unknown> | undefined;
  try {
    raw = object(JSON.parse(response.slice(start, end + 1)));
  } catch {
    return undefined;
  }
  if (!raw) return undefined;

  // Presence gate: no key may be omitted, even when its answer is "none".
  for (const key of REQUIRED_KEYS) {
    if (!hasOwn(raw, key)) return undefined;
  }

  // Prose: summary / titleZh / summaryZh must carry text (same guarantee as
  // summarize()); significance / significanceZh accept "" as an explicit none.
  const summary = str(raw.summary);
  const titleZh = str(raw.titleZh, 300);
  const summaryZh = str(raw.summaryZh);
  const significance = strOrEmpty(raw.significance);
  const significanceZh = strOrEmpty(raw.significanceZh);
  if (!summary || !titleZh || !summaryZh) return undefined;
  if (significance === undefined || significanceZh === undefined) return undefined;

  // Attribution: the level is mandatory; an invalid/missing level is a failed
  // task and must fall back instead of silently dropping the aiRole entirely.
  const aiRoleRaw = object(raw.aiRole);
  if (!aiRoleRaw) return undefined;
  const level = typeof aiRoleRaw.level === "string" ? aiRoleRaw.level.trim().toLowerCase() : "";
  if (!VALID_LEVELS.includes(level as AiRoleLevel)) return undefined;
  const zhRaw = object(aiRoleRaw.zh);
  const aiRole: Enrichment["aiRole"] = {
    level: level as AiRoleLevel,
    description: str(aiRoleRaw.description, 320),
    humanContribution: str(aiRoleRaw.humanContribution, 320),
    zh: zhRaw
      ? {
          description: str(zhRaw.description, 320),
          humanContribution: str(zhRaw.humanContribution, 320),
        }
      : undefined,
  };

  // Entities: the object must be present and each group must be an explicit
  // array (empty array = "this text names none in this group"). A missing
  // group is an unanswered task, so fall back rather than guess.
  const entitiesRaw = object(raw.entities);
  if (!entitiesRaw) return undefined;
  for (const group of ENTITY_GROUPS) {
    if (!hasOwn(entitiesRaw, group) || !Array.isArray(entitiesRaw[group])) return undefined;
  }
  const entities = sanitizeEntities(entitiesRaw);

  // Direction: "none" is an explicit verdict meaning no stored axis.
  const directionValue =
    typeof raw.direction === "string" ? raw.direction.trim().toLowerCase() : "";
  if (!(VALID_DIRECTIONS as readonly string[]).includes(directionValue)) return undefined;
  const direction =
    directionValue === "none" ? undefined : (directionValue as EventDirection);

  return {
    summary,
    significance,
    titleZh,
    summaryZh,
    significanceZh,
    aiRole,
    entities,
    direction,
  };
}

export async function enrichResearchItem(
  item: RawResearchItem,
  classification: Classification,
  provider: LLMProvider = getLLMProvider()
): Promise<Enrichment | undefined> {
  if (provider.id === "mock") return undefined;

  const prompt =
    `Title: ${item.title}\n\n` +
    `Abstract: ${item.abstract?.trim() || "(none)"}\n\n` +
    `Source: ${item.source}\n\n` +
    `Research area: ${classification.researchArea ?? "ecosystem event"} (${classification.subArea ?? "-"}).\n\n` +
    RESPONSE_SCHEMA;

  try {
    const response = await provider.complete(prompt, { system: SYSTEM, maxTokens: 3000 });
    return parseEnrichment(response);
  } catch (error) {
    console.warn("[ai4math] merged enrichment failed, using per-field fallbacks.", error);
    return undefined;
  }
}
