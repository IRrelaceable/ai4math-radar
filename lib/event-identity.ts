/**
 * Cross-source identity matching for research events (step 1 of the tracking
 * roadmap). The legacy matcher in lib/tracking.ts only compares paperUrl by
 * exact string equality plus name/keyword overlap, so a follow-up that names
 * the original work through an arXiv id, a canonical repository URL, a DOI or
 * a link quoted in its summary is invisible to it.
 *
 * This module extracts *stable identity keys* from every identity-bearing
 * field of a record (URLs, source lists, related works, entities and prose),
 * groups the archive by Event id, and ranks Events by the identity evidence
 * they share with the incoming record. It is a pure, dependency-free
 * candidate retriever: the existing heuristic + LLM layers in linkIncomingEvents
 * stay in charge of the final relation/kind decision.
 */

import type { ResearchEvent } from "@/types";
import { mentionedProject } from "@/data/seed/projects";
import { eventIdOf, eventLinkOf } from "@/lib/event-id";
import type { EventCandidate } from "@/lib/event-id";

/** Normalized identity keys of one source record. */
export interface IdentityKeys {
  /** arXiv ids, normalized to "YYMM.NNNNN" (with optional old-style cs/0601001). */
  arxiv: Set<string>;
  /** Lowercased DOIs. */
  doi: Set<string>;
  /** GitHub repositories as "owner/repo" (lowercased, no .git / path / query). */
  repos: Set<string>;
  /** Non-arxiv, non-github official hosts the record links to. */
  hosts: Set<string>;
  /** Every absolute http(s) URL found, normalized (host + path, no query/hash). */
  urls: Set<string>;
  /** Lowercased concatenated prose + entity text, for project-alias phrases. */
  text: string;
}

const ARXIV_RE = /(?:arxiv\.org\/(?:abs|pdf)\/|arxiv\s*:\s*)([0-9]{4}\.[0-9]{4,5}|[a-z-]+(?:\.[A-Z]{2})?\/?[0-9]{7})/gi;
const DOI_RE = /\b10\.\d{4,9}\/[^\s"'<>),;]+/gi;
const GITHUB_RE = /github\.com\/([a-z0-9_.-]+)\/([a-z0-9_.-]+)/gi;
const URL_RE = /https?:\/\/[^\s"'<>)\],;]+/gi;

// Alternate descriptions of named releases, bound to the publisher's original
// artifact. An Event that only cites this repo does not own its aliases.
const COLLECTION_ALIASES = new Map([
  ["github.com/openai/math", [
    /\bopenai\b[^.!?]{0,90}\b(?:722|719)[- ](?:\w+[- ]){0,3}manuscripts?\b/i,
    /\b(?:722|719)\s+openai\s+(?:manuscripts?|results?|papers?)\b/i,
    /\bopenai(?:['’]s)?\s+october\s+(?:6(?:,?\s+2026)?|2026)\s+(?:collection|release|corpus)\b/i,
  ]],
]);

function normalizeArxiv(id: string): string {
  return id.trim().toLowerCase().replace(/v\d+$/, "");
}

function normalizeDoi(doi: string): string {
  return doi.trim().toLowerCase().replace(/^doi:\s*/i, "").replace(/[.,]$/, "");
}

/**
 * Query parameters that never change which article/record a URL identifies.
 * Everything else is KEPT: WordPress `/?p=3819` and `/?p=4132` are two
 * different posts (both have pathname "/"), so dropping the whole query
 * string silently fused distinct articles into one identity key.
 */
const TRACKING_PARAMS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "utm_id", "utm_name", "utm_reader", "utm_social", "utm_brand",
  "fbclid", "gclid", "gbraid", "wbraid", "msclkid", "mc_cid", "mc_eid",
  "ref", "ref_src", "referrer", "source", "src", "spm", "from",
  "share_token", "si", "feature", "context", "_ga", "_gl",
]);

function normalizeUrl(raw: string): string {
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    // Path case is significant: /docs/ABC and /docs/abc may be distinct
    // resources, so lowercasing the path fused two different URLs into one key.
    const path = url.pathname.replace(/\/$/, "");
    // Keep identity-bearing params, drop only known tracking params. Rebuild
    // through URLSearchParams so values are re-encoded: a single param whose
    // decoded value contains "&" or "=" (e.g. x=a%26b%3Dc) must NOT collide
    // with two separate params (x=a&b=c). toString() restores the separators.
    // WordPress /?p=3819 vs /?p=4132 stay distinct because p is kept.
    const kept = new URLSearchParams();
    for (const [key, value] of url.searchParams.entries()) {
      if (!TRACKING_PARAMS.has(key.toLowerCase())) kept.append(key.toLowerCase(), value);
    }
    kept.sort();
    const query = kept.toString();
    return `${host}${path}${query ? `?${query}` : ""}`;
  } catch {
    return raw;
  }
}

/** Collect all text that may carry an identity reference from a record. */
function identityTexts(event: ResearchEvent): string[] {
  const texts = primaryIdentityTexts(event);
  for (const source of event.sources ?? []) texts.push(source.url ?? "");
  // The archive can add a backlink years after this record was published.
  // It is not a reference that an incoming record made to an earlier work.
  for (const work of event.relatedWorks ?? []) {
    if (work.relation !== "followup") texts.push(work.url ?? "");
  }
  // URL-like strings inside prose are first-class identity evidence: a
  // verification paper usually names the object it audits in its abstract.
  texts.push(event.title, event.summary, event.significance ?? "");
  for (const value of Object.values(event.entities ?? {})) {
    texts.push(...(value ?? []));
  }
  return texts.filter(Boolean);
}

function primaryIdentityTexts(event: ResearchEvent): string[] {
  return [event.sourceUrl, event.paperUrl ?? "", event.githubUrl ?? ""];
}

/** Extract stable identity keys from a record, scanning URLs, prose and entities. */
export function extractIdentityKeys(event: ResearchEvent): IdentityKeys {
  return keysFromTexts(identityTexts(event));
}

function keysFromTexts(texts: string[]): IdentityKeys {
  const keys: IdentityKeys = {
    arxiv: new Set(),
    doi: new Set(),
    repos: new Set(),
    hosts: new Set(),
    urls: new Set(),
    text: "",
  };
  keys.text = texts.join(" \n ").toLowerCase();
  for (const text of texts) {
    for (const match of text.matchAll(ARXIV_RE)) keys.arxiv.add(normalizeArxiv(match[1]));
    for (const match of text.matchAll(DOI_RE)) keys.doi.add(normalizeDoi(match[0]));
    for (const match of text.matchAll(GITHUB_RE)) {
      const owner = match[1].toLowerCase();
      const repo = match[2].toLowerCase().replace(/\.git$/, "");
      if (repo && repo !== "topics" && repo !== "features") keys.repos.add(`${owner}/${repo}`);
    }
    for (const match of text.matchAll(URL_RE)) {
      const norm = normalizeUrl(match[0]);
      keys.urls.add(norm);
      if (norm.includes("arxiv.org") || norm.includes("github.com")) continue;
      try {
        keys.hosts.add(new URL(match[0]).hostname.toLowerCase().replace(/^www\./, ""));
      } catch {
        /* ignore malformed URLs */
      }
    }
  }
  return keys;
}

function intersectCount(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const item of a) if (b.has(item)) n += 1;
  return n;
}

interface EventIdentity {
  /** A representative stored record whose eventId is the group id. */
  representative: ResearchEvent;
  /** Union of identity keys across every record in the Event line. */
  keys: IdentityKeys;
  primary: IdentityKeys;
  /** Number of source records in the line (used only as a weak tie-breaker). */
  size: number;
}

/** Group archived records by Event id and union their identity keys. */
function indexByEvent(events: ResearchEvent[]): Map<string, EventIdentity> {
  const groups = new Map<string, ResearchEvent[]>();
  for (const event of events) {
    const id = eventIdOf(event);
    const list = groups.get(id) ?? [];
    list.push(event);
    groups.set(id, list);
  }
  const index = new Map<string, EventIdentity>();
  for (const [id, records] of groups) {
    const keys: IdentityKeys = {
      arxiv: new Set(),
      doi: new Set(),
      repos: new Set(),
      hosts: new Set(),
      urls: new Set(),
      text: "",
    };
    for (const record of records) {
      const rk = extractIdentityKeys(record);
      for (const k of rk.arxiv) keys.arxiv.add(k);
      for (const k of rk.doi) keys.doi.add(k);
      for (const k of rk.repos) keys.repos.add(k);
      for (const k of rk.hosts) keys.hosts.add(k);
      for (const k of rk.urls) keys.urls.add(k);
      keys.text += ` \n ${rk.text}`;
    }
    // Prefer the record whose effective link is initial (curated links count)
    // so eventIdOf() is stable and callers see the Event's headline, not a
    // late follow-up that happens to sort first.
    const representative =
      records.find((r) => (eventLinkOf(r)?.kind ?? "initial") === "initial") ?? records[0];
    index.set(id, { representative, keys, primary: keysFromTexts(primaryIdentityTexts(representative)), size: records.length });
  }
  return index;
}

const WEIGHT = { arxiv: 1.0, doi: 1.0, repo: 0.9, url: 0.7, prior: 0.25, sharedReference: 0.15, alias: 0.55, namedRelease: 0.8, host: 0.12 } as const;

/**
 * Project aliases from a repository key: "openai/math" -> "openai math".
 * Only multi-word phrases are produced so a generic token ("math", "prover")
 * can never become an alias on its own. A follow-up paper that names the
 * project in prose ("173 OpenAI Math projects") then links to its Event even
 * without quoting a URL or arXiv id.
 */
function repoAliases(repos: Set<string>): Set<string> {
  const aliases = new Set<string>();
  for (const repo of repos) {
    const [owner, name] = repo.split("/");
    if (owner && name) aliases.add(`${owner} ${name}`.replace(/[-_]/g, " "));
  }
  return aliases;
}

function aliasHit(aliases: Set<string>, text: string): string | undefined {
  for (const alias of aliases) if (text.includes(alias)) return alias;
  return undefined;
}

interface Scored {
  candidate: EventCandidate;
  signals: string[];
  /** Records in the Event line; a larger line is more likely the canonical Event. */
  size: number;
}

const ARTIFACT_KEYS = ["arxiv", "doi", "repos", "urls"] as const;
type ArtifactKind = (typeof ARTIFACT_KEYS)[number];

function sharesArtifact(a: IdentityKeys, b: IdentityKeys): boolean {
  return ARTIFACT_KEYS.some((kind) => intersectCount(a[kind], b[kind]) > 0);
}

function matchingArtifacts(
  kind: ArtifactKind, incoming: IdentityKeys, primary: IdentityKeys, candidate: EventIdentity
): string[] {
  return [...incoming[kind]].filter((key) =>
    candidate.keys[kind].has(key) && (primary[kind].has(key) || candidate.primary[kind].has(key))
  );
}

/**
 * Retrieve Events that share a stable identity with the incoming record.
 * Top-k is grouped by Event id (never by source slug), so several records of
 * one Event cannot crowd out a different candidate. Returns the same
 * EventCandidate shape as findEventCandidates and is a drop-in replacement.
 */
export function findIdentityCandidates(
  incoming: ResearchEvent,
  existing: ResearchEvent[],
  limit = 3
): EventCandidate[] {
  const incomingKeys = extractIdentityKeys(incoming);
  const incomingPrimary = keysFromTexts(primaryIdentityTexts(incoming));
  const incomingPrior = keysFromTexts((incoming.relatedWorks ?? [])
    .filter((work) => work.relation === "previous").map((work) => work.url ?? ""));
  const incomingAliases = repoAliases(incomingKeys.repos);
  const incomingProject = mentionedProject(incoming)?.id;
  const index = indexByEvent(existing);
  const scored: Scored[] = [];

  for (const [eventId, entry] of index) {
    if (eventId === eventIdOf(incoming) && incoming.slug === entry.representative.slug) continue;
    const arxiv = matchingArtifacts("arxiv", incomingKeys, incomingPrimary, entry);
    const doi = matchingArtifacts("doi", incomingKeys, incomingPrimary, entry);
    const repo = matchingArtifacts("repos", incomingKeys, incomingPrimary, entry);
    const url = matchingArtifacts("urls", incomingKeys, incomingPrimary, entry);
    const host = intersectCount(incomingKeys.hosts, entry.keys.hosts);
    const citesPrior = sharesArtifact(incomingPrior, entry.primary);
    // Bidirectional alias: the Event's repo name in incoming prose, or the
    // incoming record's repo name in the Event line's prose.
    const eventAliases = repoAliases(entry.keys.repos);
    const alias =
      aliasHit(eventAliases, incomingKeys.text) ?? aliasHit(incomingAliases, entry.keys.text);
    const project = incomingProject && incomingProject === eventLinkOf(entry.representative)?.projectId
      ? incomingProject
      : undefined;
    const primaryUrl = normalizeUrl(entry.representative.sourceUrl);
    const collection = COLLECTION_ALIASES.get(primaryUrl)?.some((pattern) => pattern.test(incomingKeys.text))
      ? primaryUrl
      : undefined;

    const signals: string[] = [];
    if (arxiv.length) signals.push(`arXiv:${arxiv[0]}`);
    if (doi.length) signals.push(`DOI:${doi[0]}`);
    if (repo.length) signals.push(`repo:${repo[0]}`);
    if (url.length && signals.length === 0) signals.push(`url:${url[0]}`);
    const sharesPrimary = signals.length > 0;
    const sharedReference = !sharesPrimary && sharesArtifact(incomingKeys, entry.keys);
    if (sharedReference) signals.push("shared-reference");
    if (alias && !sharesPrimary) signals.push(`alias:${alias}`);
    if (citesPrior) signals.push("prior-artifact");
    if (project) signals.push(`series:${project}`);
    if (collection) signals.push(`collection:${collection}`);
    if (host && signals.length === 0) signals.push(`host:${[...incomingKeys.hosts].find((k) => entry.keys.hosts.has(k))}`);

    // One strong shared id dominates; weaker signals aggregate but can never
    // outrank a matching arXiv id / DOI / repository on their own.
    const strong = arxiv.length * WEIGHT.arxiv + doi.length * WEIGHT.doi + repo.length * WEIGHT.repo;
    const nameWeight = project || collection ? WEIGHT.namedRelease : alias ? WEIGHT.alias : 0;
    const linkWeight = url.length * WEIGHT.url + (sharedReference ? WEIGHT.sharedReference : 0);
    const weak = linkWeight + nameWeight + host * WEIGHT.host;
    const score = Math.min(1, strong + (strong > 0 ? weak * 0.3 : weak) + (citesPrior ? WEIGHT.prior : 0));
    if (score <= 0) continue;

    scored.push({
      candidate: {
        event: entry.representative,
        score,
        entityOverlap: 0,
        peopleOverlap: 0,
        keywordOverlap: 0,
        signals,
      } as EventCandidate & { signals: string[] },
      signals,
      size: entry.size,
    });
  }

  return scored
    .sort(
      (a, b) =>
        b.candidate.score - a.candidate.score ||
        b.signals.length - a.signals.length ||
        b.size - a.size
    )
    .slice(0, limit)
    .map((s) => s.candidate);
}
