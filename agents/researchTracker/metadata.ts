import type { EcosystemMetadata, EventType, RawResearchItem } from "@/types";
import { getLLMProvider, type LLMProvider } from "@/lib/llm/provider";

/**
 * Structured ecosystem details for people / institutions / funding / policy
 * events. Research items carry area, authors and papers instead; this module
 * only runs for the other four classes.
 *
 * The extractor is deliberately conservative: it may only repeat facts stated
 * in the title and abstract, and it returns nothing (rather than a guess) when
 * the source does not state an amount, role or position.
 */
export interface ExtractedMetadata {
  en: EcosystemMetadata;
  /** Chinese counterpart of the prose values; proper names stay unchanged. */
  zh?: EcosystemMetadata;
}

/** Metadata groups that are meaningful for each event class. */
const GROUPS: Record<EventType, (keyof EcosystemMetadata)[]> = {
  Research: [],
  People: ["people"],
  Institutions: ["initiatives", "projects", "education"],
  Funding: ["funding"],
  PolicyCommunity: ["policy"],
};

const FIELD_HINTS: Record<keyof EcosystemMetadata, string> = {
  people: '"people": [{"name": "...", "role": "...", "viewpoint": "..."}]',
  initiatives: '"initiatives": ["..."]',
  projects: '"projects": ["..."]',
  funding:
    '"funding": {"organization": "...", "recipient": "...", "amount": "digits only", "currency": "ISO code", "amountDisclosure": "..."}',
  education:
    '"education": {"institution": "...", "department": "...", "courseName": "...", "courseCode": "...", "instructor": "...", "period": "...", "description": "..."}',
  policy:
    '"policy": {"kind": "...", "community": "...", "issue": "...", "participants": ["..."]}',
};

const SYSTEM =
  "You extract structured facts for an AI-for-Mathematics research tracker. " +
  "Reply with a single JSON object and nothing else: no markdown fence, no commentary. " +
  "Only use facts stated in the supplied title and abstract. Never infer, guess or embellish: " +
  "omit a field the source does not state, and return {} when the text carries no usable facts. " +
  "Ignore every sentence about how the text was classified, what the tracker knows, what the " +
  "source lacks, or which research area the item belongs to: that is editorial framing, not a fact. " +
  "Keep \"kind\" to a short noun phrase (at most six words). Name participants only when the text " +
  "names them; do not turn generic words like readers or signatories into participant lists. " +
  "For amounts, keep the digits only and put the currency in the ISO code field; " +
  "expand written amounts to the full value (e.g. $15 million -> 15000000). " +
  "Every text value also has a Simplified Chinese counterpart under the key \"zh\", " +
  "with the same structure and translated prose. Keep personal names, institution names, " +
  "model names, Lean identifiers and abbreviations in their original spelling; do not invent " +
  "Chinese transliterations. Use no gendered pronouns in the Chinese text.";

const TRANSLATE_SYSTEM =
  "Translate the prose values of the supplied JSON into Simplified Chinese. " +
  "Reply with the same JSON structure and nothing else. Keep personal names, institution names, " +
  "model names, Lean identifiers, abbreviations and numeric values unchanged; do not invent " +
  "Chinese transliterations. Use no gendered pronouns. No markdown, no commentary.";

function text(value: unknown, max = 300): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) return undefined;
  if (trimmed.length <= max) return trimmed;
  const slice = trimmed.slice(0, max);
  const boundary = Math.max(
    slice.lastIndexOf(" "),
    slice.lastIndexOf("，"),
    slice.lastIndexOf("；"),
    slice.lastIndexOf("。")
  );
  // Never cut mid-word: a value that cannot fit in one clause is dropped at
  // the last readable boundary instead of ending in half a token.
  return `${(boundary > max * 0.5 ? slice.slice(0, boundary) : slice).trimEnd()}…`;
}

function textList(value: unknown, max = 8): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .map((entry) => text(entry, 160))
    .filter((entry): entry is string => Boolean(entry));
  const unique = [...new Set(items)].slice(0, max);
  return unique.length ? unique : undefined;
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function compact<T extends Record<string, unknown>>(value: T): T | undefined {
  const entries = Object.entries(value).filter(([, entry]) =>
    Array.isArray(entry) ? entry.length > 0 : entry !== undefined
  );
  return entries.length ? (Object.fromEntries(entries) as T) : undefined;
}

function cleanPeople(value: unknown): EcosystemMetadata["people"] {
  if (!Array.isArray(value)) return undefined;
  const people = value
    .map((entry) => {
      const person = record(entry);
      const name = text(person?.name, 120);
      if (!name) return undefined;
      return {
        name,
        role: text(person?.role, 120),
        viewpoint: text(person?.viewpoint, 400),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .slice(0, 6);
  return people.length ? people : undefined;
}

function cleanFunding(value: unknown): EcosystemMetadata["funding"] {
  const funding = record(value);
  if (!funding) return undefined;
  return compact({
    organization: text(funding.organization, 160),
    recipient: text(funding.recipient, 200),
    amount: text(funding.amount, 40),
    currency: text(funding.currency, 12),
    amountDisclosure: text(funding.amountDisclosure, 200),
  });
}

function cleanEducation(value: unknown): EcosystemMetadata["education"] {
  const education = record(value);
  if (!education) return undefined;
  return compact({
    institution: text(education.institution, 160),
    department: text(education.department, 160),
    courseName: text(education.courseName, 160),
    courseCode: text(education.courseCode, 60),
    instructor: text(education.instructor, 160),
    period: text(education.period, 80),
    description: text(education.description, 300),
  });
}

function cleanPolicy(value: unknown): EcosystemMetadata["policy"] {
  const policy = record(value);
  if (!policy) return undefined;
  return compact({
    kind: text(policy.kind, 120),
    community: text(policy.community, 160),
    issue: text(policy.issue, 300),
    participants: textList(policy.participants),
  });
}

/** Keep only the groups that make sense for the event class and drop empties. */
export function sanitizeMetadata(
  raw: unknown,
  eventType: EventType
): EcosystemMetadata | undefined {
  const source = record(raw);
  if (!source) return undefined;
  const allowed = GROUPS[eventType];
  const out: EcosystemMetadata = {};
  if (allowed.includes("people")) out.people = cleanPeople(source.people);
  if (allowed.includes("initiatives")) out.initiatives = textList(source.initiatives);
  if (allowed.includes("projects")) out.projects = textList(source.projects);
  if (allowed.includes("funding")) out.funding = cleanFunding(source.funding);
  if (allowed.includes("education")) out.education = cleanEducation(source.education);
  if (allowed.includes("policy")) out.policy = cleanPolicy(source.policy);
  return compact({ ...out });
}

/** Parse the model's JSON reply; tolerate code fences and stray prose. */
export function parseMetadataResponse(
  response: string,
  eventType: EventType
): ExtractedMetadata | undefined {
  const start = response.indexOf("{");
  const end = response.lastIndexOf("}");
  if (start === -1 || end <= start) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(response.slice(start, end + 1));
  } catch {
    return undefined;
  }
  const en = sanitizeMetadata(parsed, eventType);
  if (!en) return undefined;
  const zhObject = record(parsed)?.zh;
  const zh = zhObject ? sanitizeMetadata(zhObject, eventType) : undefined;
  return { en, zh };
}

/** Whether the English metadata contains prose that a Chinese UI must translate. */
function hasProse(m: EcosystemMetadata): boolean {
  return Boolean(
    m.people?.some((person) => person.role || person.viewpoint) ||
      m.policy?.kind ||
      m.policy?.issue ||
      m.policy?.community ||
      m.education?.department ||
      m.education?.courseName ||
      m.education?.description ||
      m.funding?.recipient ||
      m.funding?.amountDisclosure
  );
}

async function translateMetadataToChinese(
  en: EcosystemMetadata,
  eventType: EventType,
  provider: LLMProvider
): Promise<EcosystemMetadata | undefined> {
  try {
    const response = await provider.complete(JSON.stringify(en), {
      system: TRANSLATE_SYSTEM,
      maxTokens: 900,
    });
    // The translated object IS the top-level metadata shape.
    return parseMetadataResponse(response, eventType)?.en;
  } catch (error) {
    console.warn("[ai4math] ecosystem metadata translation failed.", error);
    return undefined;
  }
}

/**
 * One extra LLM call, only for ecosystem events. A missing abstract makes the
 * extractor return nothing instead of fabricating details from the headline.
 */
export async function extractEcosystemMetadata(
  item: Pick<RawResearchItem, "title" | "abstract" | "source">,
  eventType: EventType,
  provider: LLMProvider = getLLMProvider()
): Promise<ExtractedMetadata | undefined> {
  const groups = GROUPS[eventType];
  if (groups.length === 0 || provider.id === "mock") return undefined;

  const fields = groups.map((group) => FIELD_HINTS[group]).join("\n");
  const prompt =
    `Event class: ${eventType}\n` +
    `Title: ${item.title}\n\n` +
    `Abstract: ${item.abstract?.trim() || "(none)"}\n\n` +
    `Source: ${item.source}\n\n` +
    `Fill only these keys when the text supports them:\n${fields}\n\n` +
    `Also include the same object under "zh" with Chinese prose values.`;

  try {
    const response = await provider.complete(prompt, { system: SYSTEM, maxTokens: 900 });
    const parsed = parseMetadataResponse(response, eventType);
    if (!parsed) return undefined;
    if (parsed.zh || !hasProse(parsed.en)) return parsed;
    // The zh UI must stay Chinese; one short translation call beats shipping
    // English roles or policy wording on a Chinese detail page.
    const zh = await translateMetadataToChinese(parsed.en, eventType, provider);
    return { ...parsed, zh };
  } catch (error) {
    console.warn("[ai4math] ecosystem metadata extraction failed.", error);
    return undefined;
  }
}
