/**
 * Chinese content overlay for research events.
 *
 * The seed data stores prose (title / summary / significance / …) in English
 * only; this directory adds a slug-keyed Chinese overlay rendered when the UI
 * language is `zh`. English stays the fallback: a missing entry, a missing
 * field or `lang === "en"` all render the original text.
 *
 * Scope: prose only. Taxonomy (event classes, research areas, model /
 * benchmark / dataset / author names, URLs, dates) deliberately stays in the
 * original — it feeds URLs, search keys and the trust model.
 */

/** Per-event Chinese prose. Fields optional — English is the per-field fallback. */
export interface EventZh {
  title?: string;
  summary?: string;
  significance?: string;
  problem?: string;
  /** Must keep the same length as the source array (enforced by tests). */
  keyContributions?: string[];
  /** Chinese counterpart of `event.aiRole.description`. */
  aiRoleDescription?: string;
  /** Chinese counterpart of `event.humanContribution`. */
  humanContribution?: string;
}

/** Exact-match English → Chinese map for boilerplate prose (notes, labels). */
export type PhraseZh = Record<string, string>;
