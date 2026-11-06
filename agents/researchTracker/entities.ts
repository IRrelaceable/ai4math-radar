import type { EventEntities, RawResearchItem } from "@/types";
import { getLLMProvider, type LLMProvider } from "@/lib/llm/provider";

/**
 * Named entities for cross-event threads.
 *
 * The extractor only repeats names written in the supplied text. It must not
 * expand abbreviations, infer affiliations, or treat the publishing desk as a
 * subject: a thread is only useful when every link is a stated fact.
 */

const SYSTEM =
  "You extract named entities for an AI-for-Mathematics event tracker. " +
  "Reply with a single JSON object and nothing else: " +
  '{"people":[],"institutions":[],"projects":[],"systems":[]}. ' +
  "Use only names written in the supplied title and text; copy their spelling exactly. " +
  "Never infer an affiliation, expand an abbreviation, or split a compound name. " +
  "people = named individuals. institutions = named organizations, companies, universities, " +
  "funders and research institutes. projects = named programs, initiatives and collaborations. " +
  "systems = named models, benchmarks, datasets, proof assistants and solvers. " +
  "Do not list the publishing site, newsletter author, journal or the tracker itself. " +
  "Omit empty groups and reply {} when the text names nothing.";

const GROUPS = ["people", "institutions", "projects", "systems"] as const;

const MAX_ENTRIES = 8;
const MAX_LENGTH = 120;
const MAX_WORDS = 10;
const MIN_LENGTH = 3;

function cleanName(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const name = raw.replace(/\s+/g, " ").trim().replace(/[.,;:]+$/g, "");
  if (!name || name.length < MIN_LENGTH || name.length > MAX_LENGTH) return undefined;
  if (name.split(" ").length > MAX_WORDS) return undefined;
  if (!/\p{L}/u.test(name)) return undefined;
  return name;
}

/** Keep known groups, dedupe case-insensitively, and drop sentence-like noise. */
export function sanitizeEntities(raw: unknown): EventEntities | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const source = raw as Record<string, unknown>;
  const out: EventEntities = {};
  for (const group of GROUPS) {
    const value = source[group];
    if (!Array.isArray(value)) continue;
    const seen = new Set<string>();
    const names: string[] = [];
    for (const entry of value) {
      const name = cleanName(entry);
      if (!name) continue;
      const key = name.toLocaleLowerCase("en");
      if (seen.has(key)) continue;
      seen.add(key);
      names.push(name);
      if (names.length >= MAX_ENTRIES) break;
    }
    if (names.length > 0) out[group] = names;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/** Parse the model's JSON reply; tolerate code fences and stray prose. */
export function parseEntityResponse(response: string): EventEntities | undefined {
  const start = response.indexOf("{");
  const end = response.lastIndexOf("}");
  if (start === -1 || end <= start) return undefined;
  try {
    return sanitizeEntities(JSON.parse(response.slice(start, end + 1)));
  } catch {
    return undefined;
  }
}

/**
 * One extra LLM call per accepted item. Returns nothing when the provider is
 * the offline mock, so tests and offline runs stay deterministic.
 */
export async function extractNamedEntities(
  item: Pick<RawResearchItem, "title" | "abstract">,
  provider: LLMProvider = getLLMProvider()
): Promise<EventEntities | undefined> {
  if (provider.id === "mock") return undefined;
  const prompt =
    `Title: ${item.title}\n\n` +
    `Text: ${item.abstract?.trim() || "(none)"}\n\n` +
    "Name the people, institutions, projects and systems this text states.";
  try {
    const response = await provider.complete(prompt, { system: SYSTEM, maxTokens: 500 });
    return parseEntityResponse(response);
  } catch (error) {
    console.warn("[ai4math] entity extraction failed.", error);
    return undefined;
  }
}
