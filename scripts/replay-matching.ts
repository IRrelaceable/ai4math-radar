/**
 * Offline, date-ordered CANDIDATE RECALL replay of the shadow retriever
 * against the 16 confirmed non-canonical records of the 722 / OpenAI-math
 * release Event line (the canonical initial record is the Event itself, not a
 * record that has an "original to find", so it is excluded from the sample).
 * Includes the 2026-10-29 repository-log correction backfill.
 *
 * This is a CANDIDATE RECALL replay, NOT a merge result: it measures whether
 * the correct Event enters the top-k candidate list. The relation/kind
 * decision (follow-up / verification / correction / related / independent)
 * is a separate stage and is deliberately NOT exercised here — compare this
 * output against actual merge results only after that stage runs.
 *
 * Replay discipline:
 *   - candidate pool = records dated ON OR BEFORE the incoming record's date
 *     (no future records leak into the retrieval);
 *   - the incoming record is stripped of tracking AND given a fresh slug so
 *     curatedEventLinks cannot hand it the answer;
 *   - retrieval goes through findCandidates() — the same layered function the
 *     shadow workflow uses, including its keyword fallback and Event-id
 *     dedupe. There is no "--identity only" shortcut that skips the fallback.
 *
 * This is a read-only analysis tool: it never writes data.
 *
 *   npx tsx scripts/replay-matching.ts
 */
import { SeedStore } from "@/lib/db/seedStore";
import { findCandidates, eventIdOf, eventLinkOf } from "@/lib/tracking";
import type { ResearchEvent } from "@/types";

const CANONICAL_SLUG = "openai-math-manuscript-collection-release";

/** The non-initial records curated onto the 722 release Event, with role. */
const TRUTH: { slug: string; role: string }[] = [
  { slug: "watch-openai-math-history-96c4bb80a9f96ff7", role: "correction" },
  { slug: "openai-math-first-corrections-722-to-719", role: "correction" },
  { slug: "sharing-ai-progress-in-mathematics", role: "report" },
  { slug: "mechalign-evaluating-semantic-alignment-at-the-project-level-in-mathematical-formalization", role: "verification" },
  { slug: "working-with-academic-communities-to-build-scientific-understanding", role: "followup" },
  { slug: "ahm-statement-openai-math-release", role: "related" },
  { slug: "statement-from-ini-director-on-722-openai-results", role: "related" },
  { slug: "updates-sharing-ai-progress-on-mathematics-amazing-and-my-lecture-plans", role: "related" },
  { slug: "how-to-formalize-all-of-mathematics", role: "related" },
  { slug: "and-the-proof-is-checked-in-lean", role: "related" },
  { slug: "what-the-machine-invented-mining-new-mathematical-instruments-from-openai-s-october-2026-release-of-ai-generated-mathematics", role: "related" },
  { slug: "ai-discovery-in-combinatorics-from-problems-to-solutions-and-back-to-bigger-problems", role: "related" },
  { slug: "studying-proof-data-with-proof-theory-the-case-of-ai-generated-mathematics", role: "related" },
  { slug: "global-convergence-of-detailed-balanced-mass-action-systems", role: "related" },
  { slug: "the-gold-rush-in-ai4math-ii-what-are-signatures-of-ai-assisted-proofs", role: "related" },
  { slug: "trust-but-verify-audit-and-attribute-a-human-in-the-loop-framework-for-checking-ai-produced-research-results", role: "related" },
];

async function main() {
  const all = await new SeedStore().listEvents();
  const canonical = all.find((e) => e.slug === CANONICAL_SLUG);
  if (!canonical) throw new Error(`canonical record not found: ${CANONICAL_SLUG}`);
  const canonicalEventId = eventIdOf(canonical);

  const truth = TRUTH.map(({ slug, role }) => {
    const record = all.find((e) => e.slug === slug);
    return record ? { slug, role, record } : undefined;
  }).filter((x): x is { slug: string; role: string; record: ResearchEvent } => Boolean(x));

  // Date-ordered replay, oldest first (mirrors how a real feed ingests).
  truth.sort((a, b) => a.record.date.localeCompare(b.record.date) || a.slug.localeCompare(b.slug));

  let top1 = 0;
  let inTop3 = 0;
  const rows: string[] = [];

  for (const { slug, role, record } of truth) {
    // Strip tracking + fresh slug => matcher cannot read curated membership.
    const incoming: ResearchEvent = { ...record, slug: `__replay_${slug}`, tracking: undefined };
    // Candidate pool: on-or-before the incoming date only, excluding itself.
    const pool = all.filter(
      (e) => e.slug !== slug && e.date <= record.date
    );
    const candidates = findCandidates(incoming, pool, 3);
    const rankedIds = candidates.map((c) => eventIdOf(c.event));
    const pos = rankedIds.indexOf(canonicalEventId);
    const label = pos === 0 ? "TOP1" : pos > 0 ? `TOP${pos + 1}` : "MISS";
    if (pos === 0) top1 += 1;
    if (pos >= 0 && pos < 3) inTop3 += 1;
    const sig = candidates.find((c) => eventIdOf(c.event) === canonicalEventId)?.signals?.join(",") ?? "";
    rows.push(
      `  ${label.padEnd(5)} ${role.padEnd(12)} ${record.date} ${slug.slice(0, 44).padEnd(44)} ${sig}`
    );
  }

  console.log("\n=== 候选回放 · CANDIDATE RECALL REPLAY · shadow findCandidates() ===");
  console.log(`sample: ${truth.length} confirmed records (canonical initial excluded; incl. 10-29 correction)`);
  console.log(`canonical event: ${canonicalEventId}`);
  console.log(`pool rule: records dated <= incoming date; self excluded; curated link stripped`);
  console.log(rows.join("\n"));
  console.log(
    `\nRESULT  top1=${top1}/${truth.length}  inTop3=${inTop3}/${truth.length}`
  );
  console.log(
    "\nNOTE: 候选回放 measures CANDIDATE RECALL only — correct Event entering " +
    "top-k, NOT a merge/relation decision. Relation/kind assignment " +
    "(follow-up / verification / correction / related / independent) is step 2. " +
    "Do NOT compare these numbers with actual merge counts."
  );
  // eventLinkOf is imported to make the ground-truth source explicit and
  // guard against accidental removal of the curated-link precedence.
  if (!eventLinkOf(canonical)) throw new Error("canonical record lost its curated link");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
