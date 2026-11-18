/**
 * One-shot generator for the manual audit overlay. Encodes the human review of
 * the 8 missing researchArea / 40 missing direction / 215 missing aiRole gaps.
 * Reads scripts/audit-gaps.json for exact slugs and writes data/seed/audit-labels.ts.
 *
 * Judgment rule (taxonomy ch.4 / ch.8):
 *   - direction: ai4math when the deliverable is a mathematical result
 *     (proof, formalization, conjecture, math benchmark); math4ai when the
 *     deliverable is an AI method/system/tool with math as method or testbed.
 *   - aiRole: assisted ONLY when the source reports its own AI system producing
 *     mathematical results; pure-math theorems, historical systems, benchmarks,
 *     datasets and tools are not_applicable. No autonomous/unclear in this batch.
 */
import fs from "node:fs";
const gaps = require("./audit-gaps.json");

const AREA = "Theorem Proving & Formal Mathematics";
const REASON = "Mathematical Reasoning & LLMs";
const AGENT = "Mathematical Agents";
const DISCOVERY = "Mathematical Discovery & Symbolic Computation";

// researchArea: index into gaps.missingResearchArea -> value
const areaIdx: Record<number, string> = {
  0: AGENT, 1: AREA, 2: AREA, 3: AREA, 4: REASON, 5: AREA, 6: AREA, 7: REASON,
};

// direction: index into gaps.missingDirection -> value
const m4a = new Set([
  0, 2, 3, 5, 6, 7, 8, 10, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 24,
  25, 27, 28, 31, 32, 33, 35, 36,
]); // math4ai; every other index in the 40 list is ai4math

// aiRole assisted: index into gaps.missingAiRole
const assistedIdx: Record<number, { description: string; human: string }> = {
  3: { description: "An agent-native mid-training recipe improves formal theorem proving in Lean.", human: "Designed the training recipe and evaluated the prover." },
  5: { description: "The Fikiria model produces Swahili mathematical reasoning under an SFT+GRPO recipe.", human: "Built the reward, data pipeline and evaluation." },
  6: { description: "A language model generates proofs for automated software verification.", human: "Designed the method and checked the generated proofs." },
  9: { description: "Language models repair formal proofs using learned counterexamples.", human: "Built the pipeline and validated the repaired proofs." },
  10: { description: "A knowledge-guided agent formalizes mathematics over MK set theory.", human: "Supplied the knowledge guidance and oversaw the formalization." },
  11: { description: "AlphaProof Code agents wrote millions of Lean proof lines verifying Signal's encryption.", human: "Scoped the verification target and set up the harness." },
  16: { description: "A per-step model refactoring agent produced Lean proofs under a cost cap.", human: "Defined the refactoring rules and programmatic rewrites." },
  17: { description: "BiVerify couples backward and forward verification to self-correct LLM math solutions.", human: "Designed the verification loop and evaluated it." },
  19: { description: "An interpretable framework uses AI-guided Lean proof refinement to improve analytic constants.", human: "Designed the framework and checked the refined results." },
  29: { description: "Autonomous agents performed proof formalization in a simulated-collaboration study.", human: "Designed the study and compared agent vs human behavior." },
  35: { description: "Autonomous agents generate implementation code, specifications and mechanical proofs.", human: "Designed the spec-first architecture." },
  66: { description: "New lemmas and instruments were mined from OpenAI's AI-written mathematics release.", human: "Mined and validated the extracted mathematical ideas." },
  71: { description: "A reasoning model improves via a hindsight self-improvement loop on math problems.", human: "Built the loop and evaluated the gains." },
  79: { description: "A multi-agent prover worked on open problems and its failures were instrumented.", human: "Instrumented the runs and analyzed the failure modes." },
  93: { description: "An LLM-generated proof in HoTT was deformalized into a human-readable argument.", human: "Deformalized and verified the generated proof." },
  95: { description: "Independent agents autoformalize parts of a formalization project in a distributed protocol.", human: "Designed the protocol and integrated contributions." },
  99: { description: "AI agents grow, maintain and optimize a repository of formalized mathematics.", human: "Set up and oversee the repository." },
  124: { description: "An internal model produced a formal proof of Fermat's Last Theorem in Lean.", human: "Announced and reviewed the model's result." },
  129: { description: "ChatGPT 5.5 Pro produced mathematical work that revised Gowers' assessment.", human: "Gowers evaluated and reported the model's output." },
};

function esc(s: string) { return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"'); }

const areaLines: string[] = [];
for (const [i, v] of Object.entries(areaIdx)) areaLines.push(`  "${esc(gaps.missingResearchArea[+i].slug)}": "${esc(v)}",`);

const dirLines: string[] = [];
gaps.missingDirection.forEach((e: any, i: number) => {
  const dirValue = m4a.has(i) ? "math4ai" : "ai4math";
  dirLines.push(`  "${esc(e.slug)}": "${dirValue}",`);
});

const roleLines: string[] = [];
gaps.missingAiRole.forEach((e: any, i: number) => {
  const a = assistedIdx[i];
  if (a) roleLines.push(`  "${esc(e.slug)}": { level: "assisted", description: "${esc(a.description)}" },`);
  else roleLines.push(`  "${esc(e.slug)}": { level: "not_applicable" },`);
});

const out = `/* eslint-disable */
// Generated by scripts/build-audit-overlay.ts from the manual label audit.
// Human-adjudicated values for records that had no stored label. Applied at the
// normalization boundary so neither seed nor ingested source files are rewritten.
import type { ResearchArea, EventDirection, AiRole } from "../../types";

export const AUDIT_RESEARCH_AREAS: Record<string, ResearchArea> = {
${areaLines.join("\n")}
};

export const AUDIT_DIRECTIONS: Record<string, EventDirection> = {
${dirLines.join("\n")}
};

export const AUDIT_AI_ROLES: Record<string, AiRole> = {
${roleLines.join("\n")}
};
`;
fs.writeFileSync("data/seed/audit-labels.ts", out, "utf8");
console.log("areas", areaLines.length, "directions", dirLines.length, "roles", roleLines.length,
  "assisted", Object.keys(assistedIdx).length);
