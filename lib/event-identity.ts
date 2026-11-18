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
  const texts: string[] = [event.sourceUrl, event.paperUrl ?? "", event.githubUrl ?? ""];
  for (const source of event.sources ?? []) texts.push(source.url ?? "");
  for (const work of event.relatedWorks ?? []) texts.push(work.url ?? "");
  // URL-like strings inside prose are first-class identity evidence: a
  // verification paper usually names the object it audits in its abstract.
  texts.push(event.title, event.summary, event.significance ?? "");
  for (const value of Object.values(event.entities ?? {})) {
    texts.push(...(value ?? []));
  }
  return texts.filter(Boolean);
}

/** Extract stable identity keys from a record, scanning URLs, prose and entities. */
export function extractIdentityKeys(event: ResearchEvent): IdentityKeys {
  const keys: IdentityKeys = {
    arxiv: new Set(),
    doi: new Set(),
    repos: new Set(),
    hosts: new Set(),
    urls: new Set(),
    text: "",
  };
  keys.text = identityTexts(event).join(" \n ").toLowerCase();
  for (const text of identityTexts(event)) {
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
    index.set(id, { representative, keys, size: records.length });
  }
  return index;
}

const WEIGHT = { arxiv: 1.0, doi: 1.0, repo: 0.9, url: 0.7, alias: 0.55, host: 0.12 } as const;

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
  const index = indexByEvent(existing);
  const scored: Scored[] = [];

  for (const [eventId, entry] of index) {
    if (eventId === eventIdOf(incoming) && incoming.slug === entry.representative.slug) continue;
    const arxiv = intersectCount(incomingKeys.arxiv, entry.keys.arxiv);
    const doi = intersectCount(incomingKeys.doi, entry.keys.doi);
    const repo = intersectCount(incomingKeys.repos, entry.keys.repos);
    const url = intersectCount(incomingKeys.urls, entry.keys.urls);
    const host = intersectCount(incomingKeys.hosts, entry.keys.hosts);
    // Bidirectional alias: the Event's repo name in incoming prose, or the
    // incoming record's repo name in the Event line's prose.
    const eventAliases = repoAliases(entry.keys.repos);
    const incomingAliases = repoAliases(incomingKeys.repos);
    const alias =
      aliasHit(eventAliases, incomingKeys.text) ?? aliasHit(incomingAliases, entry.keys.text);

    const signals: string[] = [];
    if (arxiv) signals.push(`arXiv:${[...incomingKeys.arxiv].find((k) => entry.keys.arxiv.has(k))}`);
    if (doi) signals.push(`DOI:${[...incomingKeys.doi].find((k) => entry.keys.doi.has(k))}`);
    if (repo) signals.push(`repo:${[...incomingKeys.repos].find((k) => entry.keys.repos.has(k))}`);
    if (url && !arxiv && !doi && !repo) {
      signals.push(`url:${[...incomingKeys.urls].find((k) => entry.keys.urls.has(k))}`);
    }
    if (alias && !arxiv && !doi && !repo && !url) signals.push(`alias:${alias}`);
    if (host && signals.length === 0) signals.push(`host:${[...incomingKeys.hosts].find((k) => entry.keys.hosts.has(k))}`);

    // One strong shared id dominates; weaker signals aggregate but can never
    // outrank a matching arXiv id / DOI / repository on their own.
    const strong = arxiv * WEIGHT.arxiv + doi * WEIGHT.doi + repo * WEIGHT.repo;
    const weak = url * WEIGHT.url + (alias ? WEIGHT.alias : 0) + host * WEIGHT.host;
    const score = Math.min(1, strong + (strong > 0 ? weak * 0.3 : weak));
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
