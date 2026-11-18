/**
 * Step-2 RELATION DECISION replay — strict, end-to-end, on the 17 confirmed
 * records of the 722 / OpenAI-math release Event line.
 *
 * Companion to replay-matching.ts (candidate recall). This script walks the
 * FULL chain for each record:
 *
 *   候选检索 (findCandidates) → 关系判定 (classifyRelation) → 目标事件 (targetEventId)
 *
 * A record counts as FULLY CORRECT only when ALL THREE agree with the curated
 * truth: the canonical Event enters top-3, the relation kind + updateKind match,
 * AND the decision targets the canonical Event id. The old `8/8` overstated the
 * result because it (a) omitted the 2026-10-29 watch correction, (b) only
 * checked the relation KIND for `related`, ignoring which Event the edge pointed
 * at — Xena's methodological post was tagged `related` but hung off a different
 * Xena article — and (c) measured only over recalled records.
 *
 * Four adversarial NEGATIVE samples are replayed through the same production
 * chain: an unrelated OpenAI voice-product launch, a compiler paper that lists
 * openai/math only as an evaluation dataset, the same voice news dated on the
 * release day (used to pass on publisher + date alone), and a compiler paper
 * explicitly disclaiming "the corpus is used only as input ... we did not audit
 * it". All must end INDEPENDENT (no merge, no canonical target). They are the
 * false merges fixed by the subject-binding, evidence-sentence and denial gates.
 *
 * RECALL-MISS is no longer a single bucket: when the canonical Event is not in
 * top-3 but the decision still attaches the record to a DIFFERENT Event id,
 * that is a wrong-event merge and is counted separately (the INI statement is
 * rule-merged as a follow-up of another Newton Institute record).
 *
 * Truth labels come from data/seed/event-links.ts plus the watch backfill. The
 * incoming record is stripped of tracking and given a fresh slug so no curated
 * answer leaks in. Read-only: never writes data.
 *
 *   npx tsx scripts/replay-relations.ts
 */
import { SeedStore } from "@/lib/db/seedStore";
import { findCandidates, eventIdOf } from "@/lib/tracking";
import { classifyRelation } from "@/lib/relation-classifier";
import { curatedEventLinks } from "@/data/seed/event-links";
import type { RelationKind } from "@/lib/relation-classifier";
import type { EventUpdateKind, ResearchEvent } from "@/types";

const CANONICAL_SLUG = "openai-math-manuscript-collection-release";
const CANONICAL_EVENT = "event-evt-openai-math-release";

/** The 17 confirmed non-canonical records (same explicit list as replay-matching). */
const TRUTH: { slug: string; role: string }[] = [
  { slug: "watch-openai-math-history-96c4bb80a9f96ff7", role: "correction" },
  { slug: "openai-math-first-corrections-722-to-719", role: "correction" },
  { slug: "sharing-ai-progress-in-mathematics", role: "report" },
  { slug: "navier-stokes-lost-in-translation-lean-mismatch", role: "verification" },
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

interface Expected {
  kind: RelationKind;
  updateKind: EventUpdateKind;
  target: string;
}

/** Curated truth -> the classifier's relation vocabulary + target Event id. */
function expectedOf(slug: string, role: string): Expected {
  const link = curatedEventLinks[slug];
  if (!link) {
    // 2026-10-29 watch backfill: a correction on the release, not curated yet.
    return { kind: "followup", updateKind: "correction", target: CANONICAL_EVENT };
  }
  const target = link.relation === "related-event" ? link.relatedTo?.eventId ?? CANONICAL_EVENT : link.eventId;
  if (link.kind === "report") return { kind: "report", updateKind: "report", target };
  if (link.kind === "verification") return { kind: "verification", updateKind: "verification", target };
  if (link.kind === "correction") return { kind: "followup", updateKind: "correction", target };
  if (link.kind === "followup") return { kind: "followup", updateKind: "followup", target };
  if (link.relation === "related-event") return { kind: "related", updateKind: "initial", target };
  return { kind: "independent", updateKind: "initial", target };
}

/** Two P1 false-merge counterexamples, replayed as standalone incoming records. */
function negatives(base: ResearchEvent[]): ResearchEvent[] {
  const pick = (slug: string) => {
    const e = base.find((x) => x.slug === slug);
    if (!e) throw new Error(`negative fixture base missing: ${slug}`);
    return e;
  };
  return [
    {
      ...pick("working-with-academic-communities-to-build-scientific-understanding"),
      id: "evt_neg_voice_launch",
      slug: "neg-openai-voice-mode-launch",
      date: "2026-11-01",
      title: "OpenAI announces a new voice mode with realtime speech",
      summary:
        "OpenAI released a voice assistant with improved realtime speech and audio. " +
        "The product adds natural conversation to the consumer app.",
      sourceUrl: "https://openai.com/index/introducing-voice-mode",
      sourceType: "news",
      entities: { institutions: ["OpenAI"] },
      significance: "",
      tracking: undefined,
    },
    {
      ...pick("mechalign-evaluating-semantic-alignment-at-the-project-level-in-mathematical-formalization"),
      id: "evt_neg_compiler_eval",
      slug: "neg-bounded-compiler-repair-eval",
      date: "2026-11-02",
      title: "Bounded Compiler-Guided Repair in Lean 4",
      summary:
        "We reproduce and fix failing proof steps with a compiler-guided repair model. " +
        "Evaluation on six datasets (minif2f, fimo, proofnet, lean-workbook, openai/math, mathlib) " +
        "reports aggregate pass rates.",
      paperUrl: "https://arxiv.org/abs/2611.00009",
      sourceUrl: "https://arxiv.org/abs/2611.00009",
      entities: { institutions: ["Acme University"] },
      significance: "",
      tracking: undefined,
    },
    {
      // Same publisher + SAME DAY as the release used to satisfy rule 5's
      // `sameDayAnnouncement` on anchor alone and add this as a 722 Source.
      ...pick("working-with-academic-communities-to-build-scientific-understanding"),
      id: "evt_neg_voice_sameday",
      slug: "neg-openai-voice-mode-launch-sameday",
      date: "2026-10-06",
      title: "OpenAI announces a new voice mode with realtime speech",
      summary:
        "OpenAI released a voice assistant with improved realtime speech and audio. " +
        "The product adds natural conversation to the consumer app.",
      sourceUrl: "https://openai.com/index/introducing-voice-mode",
      sourceType: "news",
      entities: { institutions: ["OpenAI"] },
      significance: "",
      tracking: undefined,
    },
    {
      // Explicitly disclaims auditing the corpus; "audit" + "the corpus" used
      // to fire rule 4 as an independent verification of the 722 release.
      ...pick("mechalign-evaluating-semantic-alignment-at-the-project-level-in-mathematical-formalization"),
      id: "evt_neg_denied_audit",
      slug: "neg-compiler-corpus-input-only",
      date: "2026-11-03",
      title: "Bounded Compiler-Guided Repair in Lean 4",
      summary:
        "We evaluate only our own repair system. The corpus is used only as input to our model; " +
        "we did not audit it. Evaluation on six datasets including openai/math reports aggregate pass rates.",
      paperUrl: "https://arxiv.org/abs/2611.00010",
      sourceUrl: "https://arxiv.org/abs/2611.00010",
      entities: { institutions: ["Acme University"] },
      significance: "",
      tracking: undefined,
    },
  ];
}

async function runChain(incoming: ResearchEvent, pool: ResearchEvent[]) {
  const candidates = findCandidates(incoming, pool, 3);
  const recalled = candidates.some((c) => eventIdOf(c.event) === CANONICAL_EVENT);
  const decision = await classifyRelation(incoming, candidates);
  return { candidates, recalled, decision };
}

async function main() {
  const all = await new SeedStore().listEvents();
  const canonical = all.find((e) => e.slug === CANONICAL_SLUG);
  if (!canonical) throw new Error(`canonical record not found: ${CANONICAL_SLUG}`);
  if (eventIdOf(canonical) !== CANONICAL_EVENT)
    throw new Error(`canonical event id drifted: ${eventIdOf(canonical)}`);

  const truth = TRUTH.map(({ slug, role }) => {
    const record = all.find((e) => e.slug === slug);
    return record ? { slug, role, record } : undefined;
  }).filter((x): x is { slug: string; role: string; record: ResearchEvent } => Boolean(x));

  let recalled = 0;
  let fullyCorrect = 0;
  let recalledButWrong = 0;
  let recallMiss = 0;
  let wrongEventMerges = 0;
  let wrongEventEdges = 0;
  let sameEventDecisions = 0;
  let quotedMerges = 0;
  const rows: string[] = [];
  const wrongRows: string[] = [];

  for (const { slug, role, record } of truth) {
    const expected = expectedOf(slug, role);
    const incoming: ResearchEvent = { ...record, slug: `__replay_${slug}`, tracking: undefined };
    const pool = all.filter((e) => e.slug !== slug && e.date <= record.date);
    const { recalled: hit, decision } = await runChain(incoming, pool);

    if (decision.relation === "same-event") {
      sameEventDecisions += 1;
      if (decision.evidenceQuote) quotedMerges += 1;
    }

    let label: string;
    if (!hit) {
      recallMiss += 1;
      label = "RECALL-MISS";
      // The canonical Event was never retrieved, yet the classifier still
      // attached the record elsewhere. Count that as a distinct failure mode
      // instead of silently folding it into plain recall miss.
      const attachedElsewhere =
        decision.relation !== "independent" &&
        Boolean(decision.targetEventId) &&
        decision.targetEventId !== expected.target;
      if (attachedElsewhere) {
        if (decision.relation === "same-event") {
          wrongEventMerges += 1;
          label = "MISS+MERGED-ELSEWHERE";
        } else {
          wrongEventEdges += 1;
          label = "MISS+EDGE-ELSEWHERE";
        }
        wrongRows.push(`  ${label.padEnd(23)} ${record.slug} → ${decision.targetEventId}`);
      }
    } else {
      recalled += 1;
      const kindOk = decision.kind === expected.kind;
      const updateOk = decision.updateKind === expected.updateKind;
      const targetOk = decision.targetEventId === expected.target;
      if (kindOk && updateOk && targetOk) {
        fullyCorrect += 1;
        label = "FULL-OK";
      } else {
        recalledButWrong += 1;
        const why = [!kindOk && "kind", !updateOk && "type", !targetOk && "TARGET"].filter(Boolean).join("+");
        label = `WRONG(${why})`;
      }
    }
    rows.push(
      `  ${label.padEnd(18)} want=${(expected.kind + "/" + expected.updateKind).padEnd(22)} ` +
      `got=${(decision.kind + "/" + decision.updateKind).padEnd(22)} ` +
      `target=${(decision.targetEventId === CANONICAL_EVENT ? "CANON" : decision.targetEventId ?? "none").padEnd(46)} ` +
      `${record.slug.slice(0, 38)}`
    );
  }

  console.log("\n=== 关系判定严格回放 · STRICT RELATION DECISION REPLAY ===");
  console.log("chain: 候选检索(findCandidates) → 关系判定(classifyRelation) → 目标事件(targetEventId)");
  console.log(`sample: ${truth.length} curated records on the 722 Event (incl. 2026-10-29 watch correction; canonical initial excluded)`);
  console.log("pool rule: records dated <= incoming; self excluded; curated link stripped");
  console.log("FULL-OK requires: recalled AND kind AND updateKind AND targetEventId all match curated truth");
  console.log(rows.join("\n"));
  console.log(
    `\nRESULT  fullyCorrect=${fullyCorrect}/${truth.length}  recalled=${recalled}/${truth.length}  ` +
    `recalledButWrong=${recalledButWrong}  recallMiss=${recallMiss}  ` +
    `wrongEventMerge=${wrongEventMerges}  wrongEventEdge=${wrongEventEdges}`
  );
  console.log(
    `EVIDENCE  same-event merges=${sameEventDecisions}  withOriginalQuote=${quotedMerges}`
  );
  console.log("--- attached to a different event while the canonical Event was NOT recalled ---");
  console.log(wrongRows.length ? wrongRows.join("\n") : "  none");

  // --- Adversarial negatives: ALL must stay independent through the SAME chain. ---
  const negativesList = negatives(all);
  const negativeRows: string[] = [];
  let negativePass = 0;
  for (const incoming of negativesList) {
    const pool = all.filter((e) => e.slug !== incoming.slug && e.date <= incoming.date);
    const { recalled: hit, decision } = await runChain(incoming, pool);
    const staysIndependent = decision.kind === "independent" && decision.relation === "independent";
    if (staysIndependent) negativePass += 1;
    negativeRows.push(
      `  ${staysIndependent ? "PASS" : "FAIL"}  canonicalRecalled=${hit ? "Y" : "n"} ` +
      `got=${decision.kind + "/" + decision.updateKind} (${decision.decidedBy})  ${incoming.slug}`
    );
  }
  console.log("\n--- adversarial negatives (same domain / same dataset / same day / denied audit must NOT merge) ---");
  console.log(negativeRows.join("\n"));
  console.log(`NEGATIVE  independent=${negativePass}/${negativesList.length}`);
  console.log(
    "\nNOTE: FULL-OK is the honest end-to-end count. RECALL-MISS is a step-1 limitation " +
    "(the canonical Event never entered top-3); a relation decision cannot create an edge " +
    "to an unretrieved Event. RECALL-MISS, WRONG(TARGET), wrongEventMerge and wrongEventEdge " +
    "are all counted as NOT fully correct."
  );

  if (negativePass !== negativesList.length) {
    throw new Error(
      `P1 regression: ${negativesList.length - negativePass} adversarial record(s) were merged into the Event`
    );
  }
  if (quotedMerges !== sameEventDecisions) {
    throw new Error(
      `evidence regression: ${sameEventDecisions - quotedMerges} same-event decision(s) lack an original-sentence quote`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
