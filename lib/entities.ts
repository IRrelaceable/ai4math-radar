import type { EntityKind, EntityThread, ResearchEvent } from "@/types";

export type { EntityKind, EntityThread } from "@/types";

/**
 * Cross-event threads ("脉络").
 *
 * An event is placed on the timeline of every named entity the record states:
 * people, institutions, projects/initiatives, and named systems (models,
 * benchmarks, proof assistants). Only structured fields feed the index — never
 * free text — so a thread is a fact about the record, not a guess.
 */

export interface EntityRef {
  kind: EntityKind;
  /** Stable id: kind + normalized name. */
  key: string;
  /** Spelling as first recorded, used for display. */
  name: string;
}

const MIN_NAME_LENGTH = 3;

/**
 * Matching key for a name. Only case, spacing, padding punctuation and a
 * leading "The" are folded: anything looser ("DeepMind" ≈ "Google DeepMind")
 * would merge entities the sources keep apart, which is worse than missing a
 * link on a tracker whose whole point is verifiability.
 */
export function normalizeEntityName(name: string): string {
  return name
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^the\s+/i, "")
    .replace(/[.,;:]+$/g, "")
    .toLocaleLowerCase("en");
}

function usableName(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const name = raw.replace(/\s+/g, " ").trim();
  if (name.length < MIN_NAME_LENGTH) return undefined;
  // A name without any letter ("2026", "++++") cannot be an entity.
  if (!/\p{L}/u.test(name)) return undefined;
  return name;
}

/**
 * Entity references stated by one event.
 *
 * Research items use `authors` (arXiv / repository contributors). Ecosystem
 * items deliberately ignore `authors`: on news feeds that field holds the
 * publishing editor's account ("Susie" on Clay's site), and threading a Fields
 * Medal announcement by the newsletter account would be a false timeline.
 */
export function eventEntities(event: ResearchEvent): EntityRef[] {
  const refs = new Map<string, EntityRef>();
  const add = (kind: EntityKind, raw: string | undefined) => {
    const name = usableName(raw);
    if (!name) return;
    const key = `${kind}|${normalizeEntityName(name)}`;
    if (!refs.has(key)) refs.set(key, { kind, key, name });
  };

  const isResearch = !event.eventType || event.eventType === "Research";
  if (isResearch) {
    for (const author of event.authors ?? []) add("person", author);
  }

  for (const person of event.metadata?.people ?? []) add("person", person.name);
  for (const name of event.entities?.people ?? []) add("person", name);
  add("person", event.metadata?.education?.instructor);
  for (const name of event.metadata?.policy?.participants ?? []) add("person", name);

  add("institution", event.institution);
  add("institution", event.metadata?.funding?.organization);
  add("institution", event.metadata?.funding?.recipient);
  add("institution", event.metadata?.education?.institution);
  add("institution", event.metadata?.policy?.community);
  for (const name of event.entities?.institutions ?? []) add("institution", name);

  for (const name of event.metadata?.projects ?? []) add("project", name);
  for (const name of event.metadata?.initiatives ?? []) add("project", name);
  for (const name of event.entities?.projects ?? []) add("project", name);

  for (const name of event.model ?? []) add("system", name);
  for (const name of event.benchmark ?? []) add("system", name);
  for (const name of event.entities?.systems ?? []) add("system", name);

  return [...refs.values()];
}

/** Build every thread that has at least `minEvents` events. */
export function buildEntityThreads(
  events: ResearchEvent[],
  minEvents = 2
): EntityThread[] {
  interface Group {
    kind: EntityKind;
    key: string;
    spellings: Map<string, number>;
    events: Map<string, ResearchEvent>;
  }

  const groups = new Map<string, Group>();
  for (const event of events) {
    for (const ref of eventEntities(event)) {
      let group = groups.get(ref.key);
      if (!group) {
        group = { kind: ref.kind, key: ref.key, spellings: new Map(), events: new Map() };
        groups.set(ref.key, group);
      }
      group.spellings.set(ref.name, (group.spellings.get(ref.name) ?? 0) + 1);
      group.events.set(event.slug, event);
    }
  }

  mergeAcronymGroups(groups);

  const threads: EntityThread[] = [];
  for (const group of groups.values()) {
    if (group.events.size < minEvents) continue;
    const name = chooseName(group.spellings);
    const ordered = [...group.events.values()].sort(
      (a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug)
    );
    threads.push({ kind: group.kind, key: group.key, name, events: ordered });
  }

  const kindOrder: Record<EntityKind, number> = {
    person: 0,
    institution: 1,
    project: 2,
    system: 3,
  };
  // Longest chain first: it says the most about where this event sits.
  return threads.sort(
    (a, b) =>
      b.events.length - a.events.length ||
      kindOrder[a.kind] - kindOrder[b.kind] ||
      a.name.localeCompare(b.name)
  );
}

const ACRONYM_STOPWORDS = new Set(["of", "for", "and", "the", "in", "on", "at", "de", "la"]);

function isBareAcronym(name: string): boolean {
  return /^[A-Z0-9]{2,6}$/.test(name) && /[A-Z]/.test(name);
}

/**
 * Pick the spelling to show: a full name beats its acronym, a name without a
 * leading "The" beats one with it, then the most common spelling wins. Ties
 * prefer the longer form so a chain never displays a truncated name.
 */
function chooseName(spellings: Map<string, number>): string {
  return [...spellings.entries()].sort(
    (a, b) =>
      Number(isBareAcronym(a[0])) - Number(isBareAcronym(b[0])) ||
      Number(/^the\s/i.test(a[0])) - Number(/^the\s/i.test(b[0])) ||
      b[1] - a[1] ||
      b[0].length - a[0].length ||
      a[0].localeCompare(b[0])
  )[0][0];
}

/**
 * "IMO" and "International Mathematical Olympiad" are one entity. Merge an
 * all-caps group into the single same-kind group whose significant initials
 * spell it — and only when exactly one group matches, so two different
 * expansions never collapse into one chain.
 */
function mergeAcronymGroups(groups: Map<string, { kind: EntityKind; key: string; spellings: Map<string, number>; events: Map<string, ResearchEvent> }>) {
  const aliases = new Map<string, string>();
  for (const group of groups.values()) {
    const name = chooseName(group.spellings);
    if (!/^[A-Z]{2,6}$/.test(name)) continue;
    const matches = [...groups.values()].filter((candidate) => {
      if (candidate === group || candidate.kind !== group.kind) return false;
      return initialsOf(chooseName(candidate.spellings)) === name;
    });
    if (matches.length === 1) aliases.set(group.key, matches[0].key);
  }
  if (aliases.size === 0) return;

  for (const [from, to] of aliases) {
    const source = groups.get(from);
    const target = groups.get(to);
    if (!source || !target) continue;
    for (const [spelling, count] of source.spellings) {
      target.spellings.set(spelling, (target.spellings.get(spelling) ?? 0) + count);
    }
    for (const [slug, event] of source.events) target.events.set(slug, event);
    groups.delete(from);
  }
}

function initialsOf(name: string): string {
  return name
    .split(/[\s\-–—/]+/)
    .filter((word) => word && !ACRONYM_STOPWORDS.has(word.toLowerCase()))
    .map((word) => word.replace(/[^A-Za-z]/g, "").charAt(0))
    .join("")
    .toUpperCase();
}

/** Threads that contain `slug`, strongest chain first. */
export function threadsForEvent(
  threads: EntityThread[],
  slug: string,
  limit = 3
): EntityThread[] {
  return threads
    .filter((thread) => thread.events.some((event) => event.slug === slug))
    .slice(0, limit);
}
