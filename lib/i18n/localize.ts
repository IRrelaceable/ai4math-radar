import type { EcosystemMetadata, ResearchEvent } from "@/types";
import type { Lang } from "./dict";
import { EVENT_ZH } from "@/data/i18n/events";
import { PHRASE_ZH } from "@/data/i18n/phrases";
import { renderMath } from "@/lib/math";

/**
 * Content localization overlay.
 *
 * Seed and ingested research prose is stored in English only; `data/i18n/`
 * carries a slug-keyed Chinese overlay. When the UI language is `zh`, every
 * prose field is replaced by its translation when one exists and falls back to
 * the English source field-by-field — never mutating the stored event.
 *
 * Taxonomy, names, URLs and dates are intentionally NOT overlaid (see
 * `data/i18n/types.ts`), so slugs, filters and trust metadata are untouched.
 *
 * Inline LaTeX (`$…$`) arriving from automated ingest is rendered to Unicode
 * for BOTH languages — the raw source is English too — so a detail page never
 * shows bare `$U \subseteq \mathbb R^n$`.
 */

/** Exact-match phrase lookup for boilerplate prose (notes, roles, labels). */
export function phrase(text?: string): string | undefined {
  if (!text) return text;
  return PHRASE_ZH[text] ?? text;
}

/**
 * Render inline math in the display-facing prose fields. Returns the same
 * object reference when no field changes, so math-free events cost nothing.
 */
function presentProse<T extends ResearchEvent>(event: T): T {
  const title = renderMath(event.title);
  const summary = renderMath(event.summary);
  const significance = renderMath(event.significance);
  const problem = event.problem === undefined ? undefined : renderMath(event.problem);
  const kc = event.keyContributions;
  const keyContributions = kc?.map((c) => renderMath(c));

  const unchanged =
    title === event.title &&
    summary === event.summary &&
    significance === event.significance &&
    problem === event.problem &&
    (keyContributions === kc ||
      (keyContributions !== undefined && kc !== undefined && keyContributions.every((c, i) => c === kc[i])));
  if (unchanged) return event;

  return { ...event, title, summary, significance, problem, keyContributions };
}

/** Localize one event for display: zh overlay (when lang is zh) + math rendering. */
export function localizeEvent<T extends ResearchEvent>(event: T, lang: Lang): T {
  if (lang !== "zh") return presentProse(event);
  const zh = EVENT_ZH[event.slug];
  const kc = zh?.keyContributions;
  const contributions = kc && event.keyContributions && kc.length === event.keyContributions.length
    ? kc
    : event.keyContributions;
  return presentProse({
    ...event,
    title: zh?.title ?? event.title,
    summary: zh?.summary ?? event.summary,
    significance: zh?.significance ?? event.significance,
    problem: zh?.problem ?? event.problem,
    keyContributions: contributions,
    verificationHistory: event.verificationHistory?.map((r) => ({ ...r, note: phrase(r.note) ?? r.note })),
    relatedWorks: event.relatedWorks?.map((w) => ({ ...w, note: phrase(w.note) ?? w.note })),
    metadata: event.metadata ? localizeMetadata(event.metadata) : event.metadata,
  });
}

/** Localize the prose fields inside ecosystem metadata (roles, initiatives …). */
function localizeMetadata(m: EcosystemMetadata): EcosystemMetadata {
  return {
    ...m,
    people: m.people?.map((person) => ({
      ...person,
      role: phrase(person.role) ?? person.role,
      viewpoint: phrase(person.viewpoint) ?? person.viewpoint,
    })),
    initiatives: m.initiatives?.map((x) => phrase(x) ?? x),
    projects: m.projects?.map((x) => phrase(x) ?? x),
    funding: m.funding
      ? { ...m.funding, amountDisclosure: phrase(m.funding.amountDisclosure) ?? m.funding.amountDisclosure }
      : m.funding,
    education: m.education
      ? { ...m.education, description: phrase(m.education.description) ?? m.education.description }
      : m.education,
    policy: m.policy
      ? {
          ...m.policy,
          kind: phrase(m.policy.kind) ?? m.policy.kind,
          issue: phrase(m.policy.issue) ?? m.policy.issue,
          community: phrase(m.policy.community) ?? m.policy.community,
        }
      : m.policy,
  };
}

/** Localize a list of events for display. */
export function localizeEvents<T extends ResearchEvent>(events: T[], lang: Lang): T[] {
  if (lang !== "zh") return events;
  return events.map((e) => localizeEvent(e, lang));
}

