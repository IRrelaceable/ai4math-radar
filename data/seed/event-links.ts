import type { EventLink } from "@/types";

/**
 * Human-reviewed starter links. These use explicit release-series names in
 * the source records; they are deliberately few rather than turning citation
 * or broad topic similarity into a false event timeline.
 */
export const curatedEventLinks: Record<string, EventLink> = {
  "deepseek-prover-large-scale-synthetic-data": {
    eventId: "event-deepseek-prover",
    kind: "initial",
    relation: "same-event",
    matchedBy: "curated",
    projectId: "proj-deepseek-prover",
    reason: "Named DeepSeek-Prover release series",
  },
  "deepseek-prover-v1-5-rl-and-mcts": {
    eventId: "event-deepseek-prover",
    kind: "followup",
    relation: "same-event",
    matchedBy: "curated",
    matchedToSlug: "deepseek-prover-large-scale-synthetic-data",
    projectId: "proj-deepseek-prover",
    reason: "V1.5 release explicitly follows the DeepSeek-Prover series",
  },
  "ai-scientist-automated-open-ended-discovery": {
    eventId: "event-ai-scientist",
    kind: "initial",
    relation: "same-event",
    matchedBy: "curated",
    projectId: "proj-ai-scientist",
    reason: "Named AI Scientist release series",
  },
  "ai-scientist-v2-workshop-level-agentic-tree-search": {
    eventId: "event-ai-scientist",
    kind: "followup",
    relation: "same-event",
    matchedBy: "curated",
    matchedToSlug: "ai-scientist-automated-open-ended-discovery",
    projectId: "proj-ai-scientist",
    reason: "V2 release explicitly follows The AI Scientist",
  },
  "openai-navier-stokes-finite-time-blow-up": {
    eventId: "event-evt-openai-navier-stokes-blow-up",
    kind: "initial",
    relation: "same-event",
    matchedBy: "curated",
    reason: "OpenAI’s initial announcement and separate Lean repository for the Navier–Stokes proof claim",
  },
  "navier-stokes-lost-in-translation-lean-mismatch": {
    eventId: "event-evt-openai-navier-stokes-blow-up",
    kind: "verification",
    relation: "same-event",
    matchedBy: "curated",
    matchedToSlug: "openai-navier-stokes-finite-time-blow-up",
    reason: "Section 3 checks the September Navier–Stokes manuscript against the cited Lean commit",
    note: {
      text: {
        zh: "作者逐项比较 9 月发布的 Navier–Stokes 论文与其 Lean 仓库的指定提交，指出引理 8.6 的估计和压力通量界存在对应差异。",
        en: "The authors compare the September Navier–Stokes manuscript with a pinned Lean commit and report discrepancies in the estimate from Lemma 8.6 and in the pressure-flux bound.",
      },
      references: [
        {
          title: { zh: "核查预印本第 3 节", en: "Audit preprint, §3" },
          url: "https://arxiv.org/html/2610.08144v1#S3",
        },
        {
          title: { zh: "论文核查的 Lean 提交", en: "Lean commit examined in the audit" },
          url: "https://github.com/openai/NavierStokesAndEuler/tree/f9e8bc5b38b6e212696e8a30e3e91517af887bbd",
        },
      ],
    },
  },
};

/**
 * The 2026-10-06 OpenAI math-manuscript release is one public Event, not one
 * Event per article about it. Canonical id is the repository record itself;
 * each source below is routed by what it contributes to that Event:
 *   report       - restates the same release, adds a Source only
 *   verification - audits the release's claims/corpus, changes what we know
 *   followup     - the publisher's own later communication
 *   related      - independent work using the corpus, or public reaction;
 *                  an edge to the Event, never a merge into its timeline.
 * Re-report volume never inflates the Event's progress count.
 */
const OPENAI_MATH_EVENT = "event-evt-openai-math-release";

Object.assign(curatedEventLinks, {
  // --- same Event: the release and what directly changes it ---
  "openai-math-manuscript-collection-release": {
    eventId: OPENAI_MATH_EVENT,
    kind: "initial",
    relation: "same-event",
    matchedBy: "curated",
    reason: "Canonical Event: the 2026-10-06 public Lean manuscript release itself",
  },
  // The publisher's own correction log is a timeline node, not a re-report:
  // it changes the collection count, specific results and coverage. history.md
  // is dated 7 Oct; the logged change was committed 8 Oct UTC.
  "openai-math-first-corrections-722-to-719": {
    eventId: OPENAI_MATH_EVENT,
    kind: "correction",
    relation: "same-event",
    matchedBy: "curated",
    matchedToSlug: "openai-math-manuscript-collection-release",
    reason: "First-round corrections recorded in the repository's own history.md: withdrawals, patches and coverage change the release",
    note: {
      text: {
        zh: "OpenAI 在一篇关于分裂阿贝尔八维簇上 Weil 类的论文中发现符号错误，并撤回该论文及依赖它的另外两篇论文。仓库修订日志列出了撤回与修订明细。",
        en: "A sign error in the manuscript on Weil classes on split abelian eightfolds led OpenAI to withdraw that manuscript and two papers that depended on it.",
      },
      references: [
        {
          title: { zh: "OpenAI 仓库的撤回与修订记录", en: "OpenAI repository history: withdrawals and patches" },
          url: "https://github.com/openai/math/blob/main/history.md#october-7-2026",
        },
      ],
    },
  },
  "sharing-ai-progress-in-mathematics": {
    eventId: OPENAI_MATH_EVENT,
    kind: "report",
    relation: "same-event",
    matchedBy: "curated",
    matchedToSlug: "openai-math-manuscript-collection-release",
    reason: "OpenAI's own announcement of the same 2026-10-06 manuscript release; source only",
  },
  "mechalign-evaluating-semantic-alignment-at-the-project-level-in-mathematical-formalization": {
    eventId: OPENAI_MATH_EVENT,
    kind: "verification",
    relation: "same-event",
    matchedBy: "curated",
    matchedToSlug: "openai-math-manuscript-collection-release",
    reason: "Audits 173 OpenAI Math projects for statement fidelity; directly assesses the release's formalization claim",
    note: {
      text: {
        zh: "作者初步抽查了 OpenAI Math 的 173 个项目中的 201 个主要结果，核对 Lean 陈述与原稿的对应关系。其中一个双曲群案例定位到了原稿里的二维条件在 Lean 陈述中未被显式保留。",
        en: "The authors preliminarily compared 201 main results from 173 OpenAI Math projects with their Lean statements. In one hyperbolic-group example, the manuscript’s two-dimensionality requirement was not explicit in the Lean statement.",
      },
      references: [
        {
          title: { zh: "MechAlign §4：抽查范围与案例", en: "MechAlign §4: review scope and case study" },
          url: "https://arxiv.org/html/2610.35269v1#S4",
        },
      ],
    },
  },
  "working-with-academic-communities-to-build-scientific-understanding": {
    eventId: OPENAI_MATH_EVENT,
    kind: "followup",
    relation: "same-event",
    matchedBy: "curated",
    matchedToSlug: "openai-math-manuscript-collection-release",
    reason: "Announces three new results (Kakeya/local smoothing, ETH, QCD/Yang-Mills). Only two were publicly added to the collection on 2026-10-26 (Local smoothing, ETH); the QCD materials were held back by the external collaboration. The two confirmed additions make this progress, not a re-report",
  },
  "turing-agent-agentic-formal-verification-for-mathematical-research": {
    eventId: OPENAI_MATH_EVENT,
    kind: "verification",
    relation: "same-event",
    matchedBy: "curated",
    matchedToSlug: "openai-math-manuscript-collection-release",
    reason: "The preprint reports formalizing three identified TCS tasks from the October collection. The verification applies to those tasks.",
    note: {
      text: {
        zh: "作者报告，Turing Agent 完成了合集里三项原先尚未完成的 Lean 核验。",
        en: "The authors report completing Lean verification for three tasks left unfinished in the original collection.",
      },
      references: [
        {
          title: { zh: "任意正特征下的统一矩阵命中点", en: "Uniform matrix hitting points in positive characteristic" },
          url: "https://arxiv.org/html/2611.21299v1#S5.SS1",
        },
        {
          title: { zh: "超图性质的一致影响力上界", en: "A uniform influence bound for hypergraph properties" },
          url: "https://arxiv.org/html/2611.21299v1#S5.SS2",
        },
        {
          title: { zh: "随机 3-SAT 停时的线性方差界", en: "Linear variance of the random 3-SAT hitting time" },
          url: "https://arxiv.org/html/2611.21299v1#S5.SS3",
        },
      ],
    },
  },

  // --- related Event: independent work or public reaction, linked not merged ---
  "axiom-minimal-model-program-formalized-in-lean": {
    eventId: "event-evt-axiom-minimal-model-program-lean",
    kind: "initial",
    relation: "related-event",
    matchedBy: "curated",
    relatedTo: {
      eventId: OPENAI_MATH_EVENT,
      kind: "related",
      reason: "Axiom cites OpenAI’s paper on termination for projective log canonical fourfolds with rational boundary as the basis for its four-dimensional theorem.",
    },
    reason: "Axiom released a separate Lean library with results in dimensions two through four.",
    note: {
      text: {
        zh: "Axiom 在四维定理的说明中引用了 722 合集里关于射影对数典范四维对的极小模型程序终止性的论文。",
        en: "For the four-dimensional theorem in Axiom’s Lean library, the repository cites the OpenAI collection’s paper on termination of the minimal model program for projective log canonical fourfolds.",
      },
      references: [
        {
          title: { zh: "OpenAI 原论文：四维极小模型程序的终止性", en: "OpenAI paper: termination for projective log canonical fourfolds" },
          url: "https://github.com/openai/math/tree/main/preprints/Termination-for-projective-log-canonical-fourfolds-with-rational-boundary-September-24-2026",
        },
        {
          title: { zh: "Axiom Lean 仓库与定理说明", en: "Axiom Lean repository and theorem statement" },
          url: "https://github.com/AxiomMath/MMP",
        },
      ],
    },
  },
  "yang-mills-informalization-second-and-third-drafts": {
    eventId: "event-evt-yang-mills-informalization-third-draft",
    kind: "initial",
    relation: "related-event",
    matchedBy: "curated",
    relatedTo: { eventId: OPENAI_MATH_EVENT, kind: "related", reason: "The drafts explain the separate Yang–Mills result discussed in OpenAI’s October 26 announcement." },
    reason: "The new drafts revise the exposition and clarify the scope of the formal result.",
  },
  "introducing-mathhelm-a-place-to-discuss-ai-generated-papers": {
    eventId: "event-evt-mathhelm-launch",
    kind: "initial",
    relation: "related-event",
    matchedBy: "curated",
    relatedTo: { eventId: OPENAI_MATH_EVENT, kind: "related", reason: "MathHelm launched in response to the 722-manuscript release and explicitly hosts discussion of that collection." },
    reason: "The announcement launches a community discussion forum.",
  },
  "crossing-numbers-of-complete-graphs-the-independent-odd-crossing-number": {
    eventId: "event-evt_arxiv-2611-21516",
    kind: "initial",
    relation: "related-event",
    matchedBy: "curated",
    relatedTo: { eventId: OPENAI_MATH_EVENT, kind: "related", reason: "Extends two crossing-number bounds cited from OpenAI to a different crossing-number notion." },
    reason: "An independent mathematical extension of bounds from the collection.",
  },
  "humanise-yang-mills-humanizeym-v2-working-manuscript": {
    eventId: "event-evt-humanise-yang-mills-pr-482",
    kind: "initial",
    relation: "related-event",
    matchedBy: "curated",
    relatedTo: { eventId: OPENAI_MATH_EVENT, kind: "related", reason: "Working manuscript in the project producing a human-readable account of the Yang–Mills work discussed in the October 26 announcement." },
    reason: "The draft leaves essential estimates open and the PR reports no new Lean build or whole-proof verification.",
  },
  "ahm-statement-openai-math-release": {
    eventId: "event-evt-ahm-statement-openai-release",
    kind: "initial",
    relation: "related-event",
    matchedBy: "curated",
    relatedTo: { eventId: OPENAI_MATH_EVENT, kind: "related", reason: "Community statement responding to the release" },
    reason: "Formal protest about the release; does not change what the corpus establishes",
  },
  "statement-from-ini-director-on-722-openai-results": {
    eventId: "event-evt_https---www-newton-ac-uk--p-93474",
    kind: "initial",
    relation: "related-event",
    matchedBy: "curated",
    matchedToSlug: "statement-from-ini-director-on-722-openai-results",
    relatedTo: { eventId: OPENAI_MATH_EVENT, kind: "related", reason: "Institution's response to the release" },
    reason: "Institutional statement; stance, not evidence about the corpus",
  },
  "updates-sharing-ai-progress-on-mathematics-amazing-and-my-lecture-plans": {
    eventId: "event-evt_http---gilkalai-wordpress-com--p-32744",
    kind: "initial",
    relation: "related-event",
    matchedBy: "curated",
    relatedTo: { eventId: OPENAI_MATH_EVENT, kind: "related", reason: "Blog round-up of reactions to the release" },
    reason: "Personal round-up of reactions; no new evidence about the corpus",
  },
  "how-to-formalize-all-of-mathematics": {
    eventId: "event-evt_http---xenaproject-wordpress-com--p-3913",
    kind: "initial",
    relation: "related-event",
    matchedBy: "curated",
    relatedTo: { eventId: OPENAI_MATH_EVENT, kind: "related", reason: "Community discussion prompted by the release" },
    reason: "Discussion of formalization strategy; not an audit of this release",
  },
  "and-the-proof-is-checked-in-lean": {
    eventId: "event-evt_http---xenaproject-wordpress-com--p-3911",
    kind: "initial",
    relation: "related-event",
    matchedBy: "curated",
    relatedTo: { eventId: OPENAI_MATH_EVENT, kind: "related", reason: "Technical commentary on what Lean checks can establish for the 722-manuscript release" },
    reason: "Methodological explanation with preliminary corpus observations; not a systematic verification or a change to the release",
  },
  "what-the-machine-invented-mining-new-mathematical-instruments-from-openai-s-october-2026-release-of-ai-generated-mathematics": {
    eventId: "event-evt_arxiv-2610-17090",
    kind: "initial",
    relation: "related-event",
    matchedBy: "curated",
    relatedTo: { eventId: OPENAI_MATH_EVENT, kind: "related", reason: "Independent study mining the released corpus" },
    reason: "Uses the corpus as raw material; explicitly does not establish the source proofs",
  },
  "ai-discovery-in-combinatorics-from-problems-to-solutions-and-back-to-bigger-problems": {
    eventId: "event-evt_arxiv-2610-16555",
    kind: "initial",
    relation: "related-event",
    matchedBy: "curated",
    relatedTo: { eventId: OPENAI_MATH_EVENT, kind: "related", reason: "Collaborative benchmark work overlapping the release" },
    reason: "Independent benchmark work with OpenAI, not an audit of the corpus",
  },
  "studying-proof-data-with-proof-theory-the-case-of-ai-generated-mathematics": {
    eventId: "event-evt_arxiv-2610-25357",
    kind: "initial",
    relation: "related-event",
    matchedBy: "curated",
    relatedTo: { eventId: OPENAI_MATH_EVENT, kind: "related", reason: "Independent proof-theoretic study using the corpus" },
    reason: "Methodology paper measuring proof compression; a study, not a verdict on the release",
  },
  "global-convergence-of-detailed-balanced-mass-action-systems": {
    eventId: "event-evt_arxiv-2610-30808",
    kind: "initial",
    relation: "related-event",
    matchedBy: "curated",
    relatedTo: { eventId: OPENAI_MATH_EVENT, kind: "related", reason: "Independent result citing a construct from the release" },
    reason: "Self-contained math result that cites OpenAI's barrier construction; not about the release",
  },
  "the-gold-rush-in-ai4math-ii-what-are-signatures-of-ai-assisted-proofs": {
    eventId: "event-evt_arxiv-2611-08412",
    kind: "initial",
    relation: "related-event",
    matchedBy: "curated",
    relatedTo: { eventId: OPENAI_MATH_EVENT, kind: "related", reason: "Independent detection study using the corpus" },
    reason: "ProofTrace study across five corpora; detector research, not a verdict on the release",
  },
  "trust-but-verify-audit-and-attribute-a-human-in-the-loop-framework-for-checking-ai-produced-research-results": {
    eventId: "event-evt_arxiv-2611-13042",
    kind: "initial",
    relation: "related-event",
    matchedBy: "curated",
    relatedTo: { eventId: OPENAI_MATH_EVENT, kind: "related", reason: "General verification framework citing the release" },
    reason: "Domain-agnostic human-in-the-loop framework; the release is background, not the subject",
  },
});
