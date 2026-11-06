import type { ResearchEvent } from "@/types";

/**
 * Cross-source story dedupe for People events.
 *
 * Department news feeds regularly announce the same appointment or award
 * (e.g. UCLA and UBC both reporting an AMS council election). The URLs differ,
 * so the URL-level merge cannot see them; this pass collapses records that
 * share the same people, the same kind of news, a close date and a
 * distinguishing organisation token. It is deliberately conservative: when
 * the evidence is weak, both records are kept.
 */

const WINDOW_DAYS = 10;

/** Full organisation names are canonicalised to the acronym used in headlines. */
const ORGANISATIONS: [RegExp, string][] = [
  [/\bamerican mathematical society\b/g, "ams"],
  [/\bmathematical association of america\b/g, "maa"],
  [/\bnational academy of sciences\b/g, "nas"],
  [/\bamerican academy of arts and sciences\b/g, "aaas"],
  [/\bamerican association for the advancement of science\b/g, "aaas"],
  [/\bnational science foundation\b/g, "nsf"],
  [/\bsociety for industrial and applied mathematics\b/g, "siam"],
  [/\binstitute of electrical and electronics engineers\b/g, "ieee"],
];

const CATEGORIES: { key: string; pattern: RegExp }[] = [
  {
    key: "election",
    pattern:
      /\b(elected?|election|appointed|named|joins?|council|board|chair|head|director|trustee)\b/,
  },
  {
    key: "award",
    pattern: /\b(awarded?|prize|medal|fellows?|fellowship|scholarship|grant|honou?red?)\b/,
  },
  {
    key: "talk",
    pattern: /\b(talk|lecture|interview|essay|podcast|publishes?|perspective)\b/,
  },
];

/** Words that describe the news category rather than the specific story. */
const GENERIC = new Set([
  ..."elected election appointed named joins join council board chair head director member trustee".split(" "),
  ..."award awarded prize medal fellow fellowship scholarship grant honours honored".split(" "),
  ..."talk lecture interview essay podcast publishes perspective professor dr doctor".split(" "),
  ..."at of the a an as to in on for and with from new".split(" "),
]);

function normalizeName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(professor|prof|dr|doctor)\b/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function peopleNames(event: ResearchEvent): string[] {
  const names = (event.metadata?.people ?? [])
    .map((person) => normalizeName(person.name))
    .filter(Boolean);
  return [...new Set(names)].sort();
}

function categoryOf(title: string): string | undefined {
  const lower = title.toLowerCase();
  return CATEGORIES.find((entry) => entry.pattern.test(lower))?.key;
}

/** Tokens that identify the story beyond the person and the news category. */
function storyTokens(title: string, names: string[]): Set<string> {
  let text = title.toLowerCase();
  for (const [pattern, acronym] of ORGANISATIONS) text = text.replace(pattern, acronym);
  const nameWords = new Set(names.join(" ").split(" ").filter(Boolean));
  return new Set(
    text
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 1 && !GENERIC.has(token) && !nameWords.has(token))
  );
}

function daysApart(a: string, b: string): number {
  const left = Date.parse(a);
  const right = Date.parse(b);
  if (Number.isNaN(left) || Number.isNaN(right)) return Number.POSITIVE_INFINITY;
  return Math.abs(left - right) / 86_400_000;
}

/** Same person(s), same kind of announcement, close date, shared org token. */
export function isSamePersonStory(a: ResearchEvent, b: ResearchEvent): boolean {
  if (a.eventType !== "People" || b.eventType !== "People") return false;
  if (a.id === b.id) return true;
  const category = categoryOf(a.title);
  if (!category || category !== categoryOf(b.title)) return false;
  if (daysApart(a.date, b.date) > WINDOW_DAYS) return false;

  const namesA = peopleNames(a);
  const namesB = peopleNames(b);
  // An incomplete extraction on either side makes a safe match impossible.
  if (namesA.length === 0 || namesA.join("|") !== namesB.join("|")) return false;

  const tokensA = storyTokens(a.title, namesA);
  const tokensB = storyTokens(b.title, namesB);
  return [...tokensA].some((token) => tokensB.has(token));
}

function isCurated(event: ResearchEvent): boolean {
  return (event.provenance ?? "curated") === "curated";
}

/** Prefer the richer record; a tie goes to the earlier announcement. */
function richness(event: ResearchEvent): number {
  const people = event.metadata?.people ?? [];
  const peopleText = people.reduce(
    (sum, person) => sum + (person.role?.length ?? 0) + (person.viewpoint?.length ?? 0),
    0
  );
  return peopleText + event.summary.length + event.significance.length;
}

function preferStory(a: ResearchEvent, b: ResearchEvent): ResearchEvent {
  if (isCurated(a) !== isCurated(b)) return isCurated(a) ? a : b;
  const difference = richness(b) - richness(a);
  if (difference !== 0) return difference > 0 ? b : a;
  return a.date <= b.date ? a : b;
}

/**
 * Collapse duplicate People stories, keeping the preferred record in the
 * position of the first copy. Non-People events pass through untouched.
 */
export function dedupePersonStories(events: ResearchEvent[]): ResearchEvent[] {
  const groups: ResearchEvent[][] = [];
  for (const event of events) {
    if (event.eventType !== "People") continue;
    const group = groups.find((candidate) => isSamePersonStory(candidate[0], event));
    if (group) group.push(event);
    else groups.push([event]);
  }
  if (groups.every((group) => group.length === 1)) return events;

  const dropped = new Set<string>();
  for (const group of groups) {
    const keep = group.reduce(preferStory);
    for (const event of group) if (event.id !== keep.id) dropped.add(event.id);
  }
  return events.filter((event) => !dropped.has(event.id));
}
