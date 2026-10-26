/**
 * Demo dataset: representative AI4Math Research Events.
 *
 * Every entry compiled from a public source keeps its original URL
 * (sourceUrl / paperUrl / githubUrl) — nothing is invented. Fields that could
 * not be verified are left empty instead of guessed. Synthetic examples used
 * by the mock agent pipeline are flagged with `isDemo: true`.
 *
 * This module is the single source of truth for the offline SeedStore and for
 * `npm run db:seed` (PostgreSQL).
 */
import type { ResearchEvent } from "../../types";
import { events as llmReasoningBenchEvents } from "./expansion-llm-reasoning-bench";
import { events as agentsAssistedEvents } from "./expansion-agents-assisted";
import { events as theoremFormalEvents } from "./expansion-theorem-formal";
import { events as symbolicGeometryDiscoveryEvents } from "./expansion-symbolic-geometry-discovery";
import { ecosystemDemoEvents } from "./ecosystem";
import { normalizeEcosystemEvent } from "../../lib/ecosystem";

const curatedEvents: ResearchEvent[] = [
  /* ------------------------------------------------------------------ *
   *  Group 1 - formal mathematics & theorem proving (metadata verified) *
   * ------------------------------------------------------------------ */
  {
    id: "evt-minif2f",
    title: "miniF2F: a cross-system benchmark for formal Olympiad-level mathematics",
    slug: "minif2f-cross-system-formal-olympiad-benchmark",
    summary:
      "A benchmark of 488 Olympiad-level problems (AIME, AMC, IMO and course material) formalized across Metamath, Lean, Isabelle and HOL Light, with GPT-f style baselines.",
    significance:
      "Gave neural theorem proving a single, cross-system evaluation standard: instead of each prover reporting on its own private corpus, results became comparable across proof assistants, and miniF2F became the default evaluation set for formal provers.",
    problem:
      "Formal theorem proving results were fragmented across proof assistants, so no common yardstick existed for comparing provers.",
    date: "2021-08-01",
    researchArea: "Benchmarks & Datasets",
    subArea: "Formal proving benchmarks",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2109.00110",
    paperUrl: "https://arxiv.org/abs/2109.00110",
    githubUrl: "https://github.com/openai/miniF2F",
    papers: [
      {
        title: "miniF2F: a cross-system benchmark for formal Olympiad-level mathematics",
        url: "https://arxiv.org/abs/2109.00110",
        venue: "ICLR 2022",
        year: 2022,
      },
    ],
    authors: ["Kunhao Zheng", "Jesse Michael Han", "Stanislas Polu"],
    institution: "OpenAI",
    model: ["GPT-f (baseline)"],
    benchmark: ["miniF2F"],
    dataset: ["miniF2F (488 formalized problems)"],
    keyContributions: [
      "488 Olympiad-level problems formalized in four proof assistants",
      "Cross-system evaluation protocol so provers can be compared directly",
      "Reported baselines that established the starting point for later provers",
    ],
    relatedWorks: [],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-htps",
    title: "HyperTree Proof Search for Neural Theorem Proving",
    slug: "hypertree-proof-search-neural-theorem-proving",
    summary:
      "Meta AI proposed HyperTree Proof Search (HTPS), an AlphaZero-inspired search algorithm combined with online training, so the prover learns from its own previous proof searches.",
    significance:
      "Showed that search + online training fixes the generalization gap of statically trained provers: 82.6% on a held-out Metamath set versus 56.5% for GPT-f, and it lifted a Lean miniF2F curriculum result from 31% to 42% at similar compute.",
    problem:
      "Provers trained once on a fixed distribution collapse on statements outside that distribution.",
    date: "2022-05-01",
    researchArea: "Theorem Proving",
    subArea: "Proof search",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2205.11491",
    paperUrl: "https://arxiv.org/abs/2205.11491",
    papers: [
      {
        title: "HyperTree Proof Search for Neural Theorem Proving",
        url: "https://arxiv.org/abs/2205.11491",
        year: 2022,
      },
    ],
    authors: [
      "Guillaume Lample",
      "Marie-Anne Lachaux",
      "Thibaut Lavril",
      "Xavier Martinet",
      "Amaury Hayat",
    ],
    institution: "Meta AI (FAIR)",
    model: ["HyperTree Proof Search prover"],
    benchmark: ["Metamath (held-out set.mm)", "miniF2F (Lean curriculum)"],
    dataset: ["Annotated Metamath proofs"],
    keyContributions: [
      "AlphaZero-style proof search with online training from past searches",
      "82.6% vs 56.5% on held-out Metamath over a static GPT-f baseline",
      "Large gains on Lean miniF2F at comparable compute",
    ],
    relatedWorks: [
      {
        title: "miniF2F: a cross-system benchmark for formal Olympiad-level mathematics",
        url: "https://arxiv.org/abs/2109.00110",
        relation: "related",
        note: "Evaluation benchmark used alongside Metamath results",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-thor",
    title: "Thor: Wielding Hammers to Integrate Language Models and Automated Theorem Provers",
    slug: "thor-language-models-and-automated-theorem-provers",
    summary:
      "Thor splits the work between ATP 'hammers' (Sledgehammer-style premise selection) and language models, demonstrated on Isabelle/PISA and Lean/miniF2F.",
    significance:
      "Attacked premise selection — the classic weakness of LLM provers — by delegating it to mature ATP tooling: PISA success rose from 39% to 57%, and 8.2% of problems were solved that neither component solved alone.",
    problem:
      "Language models are poor at premise selection, while automated provers are good at it but need the right premises supplied.",
    date: "2022-05-01",
    researchArea: "Theorem Proving",
    subArea: "Prover tooling & interaction",
    sourceType: "conference",
    sourceUrl: "https://arxiv.org/abs/2205.10893",
    paperUrl: "https://arxiv.org/abs/2205.10893",
    papers: [
      {
        title: "Thor: Wielding Hammers to Integrate Language Models and Automated Theorem Provers",
        url: "https://arxiv.org/abs/2205.10893",
        venue: "NeurIPS 2022",
        year: 2022,
      },
    ],
    authors: [
      "Albert Q. Jiang",
      "Wenda Li",
      "Szymon Tworkowski",
      "Konrad Czechowski",
      "Tomasz Odrzygóźdź",
      "Piotr Miłoś",
    ],
    institution: "University of Cambridge / University of Warsaw / Google Brain",
    model: ["LISA + ATP hammers (Sledgehammer/E)"],
    benchmark: ["PISA (Isabelle)", "miniF2F"],
    dataset: [],
    keyContributions: [
      "Division of labour: ATP for premise selection, LM for the rest",
      "39% → 57% on PISA with the same language model",
      "8.2% of problems solved only by the combination",
    ],
    relatedWorks: [
      {
        title: "miniF2F: a cross-system benchmark for formal Olympiad-level mathematics",
        url: "https://arxiv.org/abs/2109.00110",
        relation: "related",
        note: "Competition-problem evaluation set used by Thor",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-draft-sketch-prove",
    title: "Draft, Sketch, and Prove: Guiding Formal Theorem Provers with Informal Proofs",
    slug: "draft-sketch-and-prove-guiding-formal-provers",
    summary:
      "DSP translates an informal proof — written by a human or a language model — into a formal proof sketch, then lets an automated prover fill in the low-level steps.",
    significance:
      "Reframed informal proofs as search guidance rather than something to formalize end-to-end: sketch guidance lifted prover performance from 20.9% to 39.3% on mathematical competition problems.",
    problem:
      "End-to-end formalization is hard because low-level steps consume all of the search budget.",
    date: "2022-10-01",
    researchArea: "Formal Mathematics",
    subArea: "Autoformalization",
    sourceType: "conference",
    sourceUrl: "https://arxiv.org/abs/2210.12283",
    paperUrl: "https://arxiv.org/abs/2210.12283",
    githubUrl: "https://github.com/albertqjiang/draft_sketch_prove",
    papers: [
      {
        title: "Draft, Sketch, and Prove: Guiding Formal Theorem Provers with Informal Proofs",
        url: "https://arxiv.org/abs/2210.12283",
        venue: "ICLR 2023 (Notable Top 5%)",
        year: 2023,
      },
    ],
    authors: [
      "Albert Q. Jiang",
      "Sean Welleck",
      "Jin Peng Zhou",
      "Wenda Li",
      "Jiacheng Liu",
      "Mateja Jamnik",
    ],
    institution: "Meta AI (FAIR) / University of Cambridge",
    model: ["DSP (draft & sketch generator + prover)"],
    benchmark: ["Formalized mathematical competition problems"],
    dataset: [],
    keyContributions: [
      "Pipeline from informal proof to formal sketch to completed proof",
      "20.9% → 39.3% with sketch guidance",
      "Works with both human-written and model-written informal proofs",
    ],
    relatedWorks: [
      {
        title: "Thor: Wielding Hammers to Integrate Language Models and Automated Theorem Provers",
        url: "https://arxiv.org/abs/2205.10893",
        relation: "previous",
        note: "Earlier hybrid LM + prover approach from overlapping authors",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-leandojo",
    title: "LeanDojo: Theorem Proving with Retrieval-Augmented Language Models",
    slug: "leandojo-retrieval-augmented-theorem-proving",
    summary:
      "An open-source Lean playground — toolkits, extracted data, pretrained models and a benchmark of 98,734 mathlib theorems — plus ReProver, a retrieval-augmented prover trainable on a single GPU-week.",
    significance:
      "Made ML theorem proving reproducible (no private code, no private data, no huge compute) and attacked premise selection directly with fine-grained premise annotations; ReProver beat non-retrieval baselines and GPT-4 on the unseen-premise split.",
    problem:
      "Premise selection in Lean was a black box, and most proving experiments could not be reproduced.",
    date: "2023-06-01",
    researchArea: "Theorem Proving",
    subArea: "Prover tooling & interaction",
    sourceType: "conference",
    sourceUrl: "https://arxiv.org/abs/2306.15626",
    paperUrl: "https://arxiv.org/abs/2306.15626",
    githubUrl: "https://github.com/lean-dojo/LeanDojo",
    papers: [
      {
        title: "LeanDojo: Theorem Proving with Retrieval-Augmented Language Models",
        url: "https://arxiv.org/abs/2306.15626",
        venue: "NeurIPS 2023 (Datasets and Benchmarks, oral)",
        year: 2023,
      },
    ],
    authors: [
      "Kaiyu Yang",
      "Aidan M. Swope",
      "Alex Gu",
      "Rahul Chalamala",
      "Peiyang Song",
      "Shixing Yu",
    ],
    institution: "UC Berkeley / Caltech / NVIDIA",
    model: ["ReProver"],
    benchmark: ["LeanDojo benchmark (98,734 mathlib theorems)"],
    dataset: ["LeanDojo premise-annotated proof corpus (mathlib)"],
    keyContributions: [
      "Open toolchain for extracting proofs and premises from Lean 4 mathlib",
      "ReProver: retrieval-augmented prover trainable on one GPU-week",
      "New benchmark with an unseen-premise split that exposes memorization",
    ],
    relatedWorks: [
      {
        title: "miniF2F: a cross-system benchmark for formal Olympiad-level mathematics",
        url: "https://arxiv.org/abs/2109.00110",
        relation: "previous",
        note: "Standard evaluation set that LeanDojo provers are measured on",
      },
      {
        title: "DeepSeek-Prover: Advancing Theorem Proving in LLMs through Large-Scale Synthetic Data",
        url: "https://arxiv.org/abs/2405.14333",
        relation: "followup",
        note: "Later provers build on LeanDojo's extraction and evaluation stack",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-llemma",
    title: "Llemma: An Open Language Model For Mathematics",
    slug: "llemma-open-language-model-for-mathematics",
    summary:
      "7B and 34B math language models obtained by continuing pretraining Code Llama on Proof-Pile-2, released together with the corpus and reproduction code.",
    significance:
      "Demonstrated that openly released math-specialized models can match unreleased systems such as Minerva on an equi-parameter basis on MATH, and that math pretraining transfers to tool use and formal theorem proving without extra fine-tuning.",
    problem:
      "Strong math language models were proprietary, so results could not be reproduced or extended.",
    date: "2023-10-01",
    researchArea: "LLM for Mathematics",
    subArea: "Math-specialized models",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2310.10631",
    paperUrl: "https://arxiv.org/abs/2310.10631",
    githubUrl: "https://github.com/EleutherAI/math-lm",
    papers: [
      {
        title: "Llemma: An Open Language Model For Mathematics",
        url: "https://arxiv.org/abs/2310.10631",
        year: 2023,
      },
    ],
    authors: [
      "Zhangir Azerbayev",
      "Hailey Schoelkopf",
      "Keiran Paster",
      "Marco Dos Santos",
      "Stephen McAleer",
      "Albert Q. Jiang",
    ],
    institution: "CMU / University of Washington / EleutherAI",
    model: ["Llemma-7B", "Llemma-34B"],
    benchmark: ["MATH"],
    dataset: ["Proof-Pile-2"],
    keyContributions: [
      "Open math LLMs (7B/34B) from Code Llama continued pretraining",
      "Proof-Pile-2 corpus and full reproduction code released",
      "Matched Minerva on MATH at equal parameter count",
    ],
    relatedWorks: [
      {
        title: "LeanDojo: Theorem Proving with Retrieval-Augmented Language Models",
        url: "https://arxiv.org/abs/2306.15626",
        relation: "related",
        note: "Math pretraining also improves formal proving ability",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-deepseek-prover-v1",
    title: "DeepSeek-Prover: Advancing Theorem Proving in LLMs through Large-Scale Synthetic Data",
    slug: "deepseek-prover-large-scale-synthetic-data",
    summary:
      "DeepSeek formalized competition problems at scale to produce 8 million Lean 4 statements with proofs, then fine-tuned DeepSeekMath-7B on them for whole-proof generation.",
    significance:
      "Attacked the scarcity of formal training data with synthetic corpora: 52% cumulative whole-proof accuracy on miniF2F-test (Lean 4), surpassing GPT-4's 23.0% and a tree-search RL method's 41.0%, plus 5 FIMO problems solved where GPT-4 solved none.",
    problem:
      "Formal proof corpora are tiny compared with the data needs of large language models.",
    date: "2024-05-01",
    researchArea: "Theorem Proving",
    subArea: "Proof search",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2405.14333",
    paperUrl: "https://arxiv.org/abs/2405.14333",
    githubUrl: "https://github.com/deepseek-ai/DeepSeek-Prover",
    papers: [
      {
        title: "DeepSeek-Prover: Advancing Theorem Proving in LLMs through Large-Scale Synthetic Data",
        url: "https://arxiv.org/abs/2405.14333",
        year: 2024,
      },
    ],
    authors: ["Huajian Xin", "Daya Guo", "Zhihong Shao", "Zhizhou Ren", "Qihao Zhu", "Bo Liu"],
    institution: "DeepSeek",
    model: ["DeepSeekMath-7B (Lean 4 prover)"],
    benchmark: ["miniF2F (Lean 4)", "FIMO"],
    dataset: ["8M synthetic Lean 4 statements with proofs"],
    keyContributions: [
      "Pipeline producing 8M formal statements with proofs from competition problems",
      "52% cumulative whole-proof accuracy on miniF2F-test (Lean 4)",
      "Proved 5 FIMO problems where GPT-4 proved none",
    ],
    relatedWorks: [
      {
        title: "LeanDojo: Theorem Proving with Retrieval-Augmented Language Models",
        url: "https://arxiv.org/abs/2306.15626",
        relation: "previous",
        note: "Provided the extraction and evaluation stack used in this line of work",
      },
      {
        title: "DeepSeek-Prover-V1.5: Harnessing Proof Assistant Feedback for RL and MCTS",
        relation: "followup",
        note: "Next release in the same series",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-deepseek-prover-v1-5",
    title: "DeepSeek-Prover-V1.5: Harnessing Proof Assistant Feedback for Reinforcement Learning and Monte-Carlo Tree Search",
    slug: "deepseek-prover-v1-5-rl-and-mcts",
    summary:
      "An open-source Lean 4 prover trained with reinforcement learning from proof assistant feedback (RLPAF) together with RMaxTS, an intrinsic-reward Monte-Carlo tree search that explores diverse proof paths.",
    significance:
      "Turned the proof assistant itself into a reward signal and paired it with exploration-driven search: 63.5% on miniF2F-test and 25.3% on ProofNet at release, a clear step up from DeepSeek-Prover-V1.",
    problem:
      "Supervised training alone plateaus, and tree search converges on a single narrow proof path.",
    date: "2024-08-01",
    researchArea: "Theorem Proving",
    subArea: "Proof search",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2408.08152",
    paperUrl: "https://arxiv.org/abs/2408.08152",
    githubUrl: "https://github.com/deepseek-ai/DeepSeek-Prover-V1.5",
    papers: [
      {
        title: "DeepSeek-Prover-V1.5: Harnessing Proof Assistant Feedback for Reinforcement Learning and Monte-Carlo Tree Search",
        url: "https://arxiv.org/abs/2408.08152",
        year: 2024,
      },
    ],
    authors: ["Huajian Xin", "Z. Z. Ren", "Junxiao Song", "Zhihong Shao", "Wanjia Zhao", "Haocheng Wang"],
    institution: "DeepSeek",
    model: ["DeepSeek-Prover-V1.5-RL (7B)"],
    benchmark: ["miniF2F (63.5%)", "ProofNet (25.3%)"],
    dataset: ["Enhanced formal proving dataset derived from DeepSeek-Prover-V1"],
    keyContributions: [
      "RL from proof assistant feedback (RLPAF) for prover training",
      "RMaxTS: intrinsic-reward MCTS for diverse proof exploration",
      "63.5% miniF2F-test / 25.3% ProofNet at release",
    ],
    relatedWorks: [
      {
        title: "DeepSeek-Prover: Advancing Theorem Proving in LLMs through Large-Scale Synthetic Data",
        url: "https://arxiv.org/abs/2405.14333",
        relation: "previous",
        note: "V1 supplied the synthetic corpus and baseline",
      },
      {
        title: "Goedel-Prover: A Frontier Model for Open-Source Automated Theorem Proving",
        url: "https://arxiv.org/abs/2502.07640",
        relation: "followup",
        note: "Initialized from DeepSeek-Prover-V1.5-Base",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-internlm2-stepprover-putnam",
    title: "InternLM2-Step-Prover (Shanghai AI Lab) reports SOTA on miniF2F, ProofNet and Putnam",
    slug: "internlm2-stepprover-putnam-sota",
    summary:
      "The 书生·浦语 (InternLM) team at Shanghai AI Laboratory released InternLM2-Step-Prover together with LEAN-GitHub, a Lean 4 corpus compiled from almost all Lean 4 repositories on GitHub. Per the official repository's release notes (2024-07-25), the pipeline — fine-tuning InternLM-math-plus on Lean-Github and Lean-Workbook — attains SOTA on miniF2F-test (54.5%), ProofNet (18.1%) and solves 5 Putnam problems; the accompanying paper reports 54.5% on miniF2F-test with 64 passes, surpassing the previous SOTA of 52%. Lean-Workbook contributes 57K formal-informal problem pairs, including 21 new IMO problems.",
    significance:
      "The strongest publicly documented Chinese-lab theorem-proving milestone of 2024: an open 7B prover reaching SOTA on the standard Lean 4 benchmarks and solving Putnam problems, with its training corpora (Lean-Github, Lean-Workbook) released for community reuse. The corpus-mining approach — extract formal statements from existing repositories instead of hand-writing them — became a template reused by later open provers.",
    problem:
      "Formal theorem-proving data is scarce: human-written Lean 4 code across hundreds of GitHub repositories was not being reused as training signal.",
    date: "2024-07-25",
    researchArea: "Theorem Proving",
    subArea: "Proof search",
    sourceType: "github",
    sourceUrl: "https://github.com/InternLM/InternLM-Math",
    paperUrl: "https://arxiv.org/abs/2407.17227",
    githubUrl: "https://github.com/InternLM/InternLM-Math",
    papers: [
      {
        title: "LEAN-GitHub: Compiling GitHub LEAN repositories for a versatile LEAN prover",
        url: "https://arxiv.org/abs/2407.17227",
        year: 2024,
      },
      {
        title: "Lean Workbook: A large-scale Lean problem set formalized from natural language math problems",
        url: "https://arxiv.org/abs/2406.03847",
        year: 2024,
      },
    ],
    authors: ["Zijian Wu", "Jiayu Wang", "Huaiyuan Ying", "Dahua Lin", "Kai Chen"],
    institution: "Shanghai AI Laboratory (书生·浦语 / InternLM)",
    model: ["InternLM2-Step-Prover-7B"],
    benchmark: ["miniF2F-test", "ProofNet", "Putnam"],
    dataset: ["Lean-Github (29K theorems from 100+ Lean 4 repos)", "Lean-Workbook (57K formal-informal pairs)"],
    researchEventType: "Competition",
    verificationStatus: "paper_released",
    evidenceLevel: "E3",
    sourceTier: "S1",
    keyContributions: [
      "LEAN-GitHub: corpus mined from nearly all Lean 4 repositories on GitHub",
      "54.5% miniF2F-test (64 passes), 18.1% ProofNet, 5 Putnam problems solved — publisher-reported",
      "Lean-Workbook: 57K formal-informal pairs including 21 new IMO problems",
    ],
    verificationHistory: [
      {
        date: "2024-07-25",
        status: "paper_released",
        evidenceLevel: "E3",
        note: "Official repository release notes (2024.07.25 entry) and arXiv:2407.17227 fetched and confirmed; benchmark numbers and the 5-solved Putnam figure are publisher-reported.",
      },
    ],
    relatedWorks: [
      {
        title: "InternLM2.5-StepProver: Advancing Automated Theorem Proving via Critic-Guided Search",
        url: "https://arxiv.org/abs/2410.15700",
        relation: "followup",
        note: "Next step of the same open prover line, tracked separately on this site",
      },
      {
        title: "Goedel-Prover: A Frontier Model for Open-Source Automated Theorem Proving",
        url: "https://arxiv.org/abs/2502.07640",
        relation: "related",
        note: "Contemporary open prover following a similar large-corpus strategy",
      },
    ],
    createdAt: "2026-10-22T00:00:00.000Z",
    updatedAt: "2026-10-22T00:00:00.000Z",
  },
  {
    id: "evt-internlm-stepprover",
    title: "InternLM2.5-StepProver: Advancing Automated Theorem Proving via Critic-Guided Search",
    slug: "internlm25-stepprover-critic-guided-search",
    summary:
      "A 7B Lean 4 prover that performs critic-guided search by exploiting the preference information already inside each generated tactic, instead of treating tactic scores as a plain best-first ordering.",
    significance:
      "Shows that the critic's ranking signal contains more information than a single scalar score: using it during search makes small open provers competitive on miniF2F with far larger models.",
    problem:
      "Best-first tactic search discards the ordering information inside a critic's evaluation of a tactic.",
    date: "2024-10-01",
    researchArea: "Theorem Proving",
    subArea: "Proof search",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2410.15700",
    paperUrl: "https://arxiv.org/abs/2410.15700",
    githubUrl: "https://github.com/InternLM/InternLM-Math",
    papers: [
      {
        title: "InternLM2.5-StepProver: Advancing Automated Theorem Proving via Critic-Guided Search",
        url: "https://arxiv.org/abs/2410.15700",
        year: 2024,
      },
    ],
    authors: ["Zijian Wu", "Suozhi Huang", "Zhejian Zhou", "Huaiyuan Ying", "Zheng Yuan", "Wenwei Zhang"],
    institution: "Shanghai AI Laboratory",
    model: ["InternLM2.5-StepProver-7B"],
    benchmark: ["miniF2F"],
    dataset: [],
    keyContributions: [
      "Critic-guided tactic search that uses within-tactic preference information",
      "Open 7B Lean 4 prover with released code",
      "Competitive miniF2F results at a small model size",
    ],
    relatedWorks: [
      {
        title: "DeepSeek-Prover-V1.5: Harnessing Proof Assistant Feedback for RL and MCTS",
        url: "https://arxiv.org/abs/2408.08152",
        relation: "related",
        note: "Contemporary open Lean 4 prover line",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-goedel-prover",
    title: "Goedel-Prover: A Frontier Model for Open-Source Automated Theorem Proving",
    slug: "goedel-prover-open-source-frontier-prover",
    summary:
      "An open-source Lean 4 prover released together with its full data pipeline: Goedel-Pset-v1 (1.64M auto-formalized statements) and Goedel-Pset-v1-solved (800K+ with proofs), grown by iteratively training the prover and harvesting what it solves.",
    significance:
      "Attack on the scarcity of formalized statements and proofs at scale: 57.6% pass@32 on miniF2F with SFT (+7.6 over the previous open-source leader) and above 60% with RL, plus 7 PutnamBench problems solved and 29.7K Lean Workbook proofs released.",
    problem:
      "Open provers lagged closed systems mainly because open formal training data did not exist.",
    date: "2025-02-01",
    researchArea: "Theorem Proving",
    subArea: "Proof search",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2502.07640",
    paperUrl: "https://arxiv.org/abs/2502.07640",
    githubUrl: "https://github.com/Goedel-LM/Goedel-Prover",
    papers: [
      {
        title: "Goedel-Prover: A Frontier Model for Open-Source Automated Theorem Proving",
        url: "https://arxiv.org/abs/2502.07640",
        year: 2025,
      },
    ],
    authors: ["Yong Lin", "Shange Tang", "Bohan Lyu", "Jiayun Wu", "Hongzhou Lin", "Kaiyu Yang"],
    institution: "Princeton University / Stanford University",
    model: ["Goedel-Prover-SFT", "Goedel-Prover"],
    benchmark: ["miniF2F (57.6% pass@32 SFT, >60% RL)", "PutnamBench"],
    dataset: ["Goedel-Pset-v1 (1.64M)", "Goedel-Pset-v1-solved (800K+)", "Lean Workbook proofs (29.7K)"],
    keyContributions: [
      "Iterative train → solve → retrain data flywheel for formal corpora",
      "57.6% pass@32 on miniF2F, over 60% with RL",
      "Open release of model, pipeline and 29.7K Lean Workbook proofs",
    ],
    relatedWorks: [
      {
        title: "DeepSeek-Prover-V1.5: Harnessing Proof Assistant Feedback for RL and MCTS",
        url: "https://arxiv.org/abs/2408.08152",
        relation: "previous",
        note: "SFT initialization starts from DeepSeek-Prover-V1.5-Base",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-kimina-prover",
    title: "Kimina-Prover Preview: Towards Large Formal Reasoning Models with Reinforcement Learning",
    slug: "kimina-prover-preview-large-formal-reasoning-rl",
    summary:
      "A large formal-reasoning model trained with a large-scale reinforcement-learning pipeline starting from Qwen2.5-72B, generating Lean 4 proofs through reasoning-driven exploration, with smaller distilled models released openly.",
    significance:
      "Established the reasoning-driven RL paradigm for formal proving at 72B scale: 80.7% pass@8192 on miniF2F-test at release, and the distilled 1.5B/7B open models made strong proving accessible beyond frontier labs.",
    problem:
      "Large formal reasoning needed both scale and exploration, and prior open provers were much smaller.",
    date: "2025-04-01",
    researchArea: "Theorem Proving",
    subArea: "Proof search",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2504.11354",
    paperUrl: "https://arxiv.org/abs/2504.11354",
    githubUrl: "https://github.com/MoonshotAI/Kimina-Prover-Preview",
    papers: [
      {
        title: "Kimina-Prover Preview: Towards Large Formal Reasoning Models with Reinforcement Learning",
        url: "https://arxiv.org/abs/2504.11354",
        year: 2025,
      },
    ],
    authors: ["Haiming Wang", "Mert Unsal", "Xiaohan Lin", "Mantas Baksys", "Junqi Liu", "Marco Dos Santos"],
    institution: "Moonshot AI (Kimi)",
    model: ["Kimina-Prover (72B)", "Kimina-Prover-Distill (1.5B / 7B)"],
    benchmark: ["miniF2F (80.7% pass@8192)"],
    dataset: [],
    keyContributions: [
      "Large-scale RL pipeline for Lean 4 proof generation at 72B scale",
      "Reasoning-driven exploration pattern for proof search",
      "Open-sourced distilled 1.5B and 7B provers",
    ],
    relatedWorks: [
      {
        title: "Goedel-Prover: A Frontier Model for Open-Source Automated Theorem Proving",
        url: "https://arxiv.org/abs/2502.07640",
        relation: "related",
        note: "Contemporary open prover with a data-centric approach",
      },
      {
        title: "DeepSeek-Prover-V1.5: Harnessing Proof Assistant Feedback for RL and MCTS",
        url: "https://arxiv.org/abs/2408.08152",
        relation: "previous",
        note: "Earlier RL-based open Lean prover",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },

  /* ------------------------------------------------------------------ *
   *  Group 2 - reasoning, language models & benchmarks (verified)       *
   * ------------------------------------------------------------------ */
  {
    id: "evt-math-dataset",
    title: "Measuring Mathematical Problem Solving With the MATH Dataset",
    slug: "math-dataset-measuring-mathematical-problem-solving",
    summary:
      "A dataset of 12,500 challenging competition mathematics problems (AMC/AIME-style and beyond), each with a full step-by-step solution, organized by subject and by difficulty levels 1–5.",
    significance:
      "Raised the ceiling of math evaluation from elementary word problems to competition-level solving, and became the most widely used benchmark for mathematical reasoning in language models.",
    problem:
      "Existing benchmarks only measured elementary arithmetic word problems and were already saturated.",
    date: "2021-03-01",
    researchArea: "Benchmarks & Datasets",
    subArea: "Competition & olympiad benchmarks",
    sourceType: "conference",
    sourceUrl: "https://arxiv.org/abs/2103.03874",
    paperUrl: "https://arxiv.org/abs/2103.03874",
    githubUrl: "https://github.com/hendrycks/math",
    papers: [
      {
        title: "Measuring Mathematical Problem Solving With the MATH Dataset",
        url: "https://arxiv.org/abs/2103.03874",
        venue: "NeurIPS 2021",
        year: 2021,
      },
    ],
    authors: ["Dan Hendrycks", "Collin Burns", "Saurav Kadavath", "Akul Arora", "Steven Basart", "Eric Tang"],
    institution: "UC Berkeley",
    benchmark: ["MATH"],
    dataset: ["MATH (12,500 problems)"],
    keyContributions: [
      "12,500 competition problems with step-by-step solutions",
      "Difficulty levels 1–5 and subject categories for graded evaluation",
      "Standard evaluation for LLM mathematical reasoning since 2021",
    ],
    relatedWorks: [
      {
        title: "Training Verifiers to Solve Math Word Problems",
        url: "https://arxiv.org/abs/2110.14168",
        relation: "followup",
        note: "GSM8K complemented MATH with multi-step word problems",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-gsm8k",
    title: "Training Verifiers to Solve Math Word Problems",
    slug: "gsm8k-training-verifiers-math-word-problems",
    summary:
      "OpenAI released GSM8K, 8.5K linguistically diverse grade-school word problems with teacher-written solutions, and showed that training verifier models on generated solutions beats fine-tuning alone.",
    significance:
      "Established the generator–verifier pattern behind later reasoning systems: instead of trusting one sampled answer, a trained verifier selects among candidate solutions. GSM8K became the default multi-step reasoning diagnostic.",
    problem:
      "Math word-problem datasets were small or quickly saturated, and models had no way to check their own solutions.",
    date: "2021-10-01",
    researchArea: "Benchmarks & Datasets",
    subArea: "Math word problem datasets",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2110.14168",
    paperUrl: "https://arxiv.org/abs/2110.14168",
    githubUrl: "https://github.com/openai/grade-school-math",
    papers: [
      {
        title: "Training Verifiers to Solve Math Word Problems",
        url: "https://arxiv.org/abs/2110.14168",
        year: 2021,
      },
    ],
    authors: ["Karl Cobbe", "Vineet Kosaraju", "Mohammad Bavarian", "Mark Chen", "Heewoo Jun", "Lukasz Kaiser"],
    institution: "OpenAI",
    benchmark: ["GSM8K"],
    dataset: ["GSM8K (8.5K problems, 7.5K train / 1K test)"],
    keyContributions: [
      "Large, human-written grade-school word-problem dataset",
      "Verifier training on generated solutions as a scaling lever",
      "Generator–verifier pattern reused across later reasoning models",
    ],
    relatedWorks: [
      {
        title: "Measuring Mathematical Problem Solving With the MATH Dataset",
        url: "https://arxiv.org/abs/2103.03874",
        relation: "related",
        note: "Complementary competition-level benchmark",
      },
      {
        title: "Let's Verify Step by Step",
        url: "https://arxiv.org/abs/2305.20050",
        relation: "followup",
        note: "Extended verifier ideas from outcome to process supervision",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-minerva",
    title: "Solving Quantitative Reasoning Problems with Language Models",
    slug: "minerva-quantitative-reasoning-with-language-models",
    summary:
      "Google released Minerva, a language model pretrained on general text and then further trained on scientific and technical content, evaluated without external tools on quantitative reasoning benchmarks.",
    significance:
      "College-level quantitative reasoning was a major gap for state-of-the-art models; Minerva showed specialist technical pretraining largely closes it, answering nearly a third of 200+ undergraduate physics, biology, chemistry and economics problems and setting a new bar on MATH and GSM8K.",
    problem:
      "General-purpose LLMs failed on undergraduate-level quantitative problems across the sciences.",
    date: "2022-06-01",
    researchArea: "LLM for Mathematics",
    subArea: "Reasoning & self-improvement",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2206.14858",
    paperUrl: "https://arxiv.org/abs/2206.14858",
    papers: [
      {
        title: "Solving Quantitative Reasoning Problems with Language Models",
        url: "https://arxiv.org/abs/2206.14858",
        year: 2022,
      },
    ],
    authors: [
      "Aitor Lewkowycz",
      "Anders Andreassen",
      "David Dohan",
      "Ethan Dyer",
      "Henryk Michalewski",
      "Vinay Ramasesh",
    ],
    institution: "Google Research",
    model: ["Minerva"],
    benchmark: ["MATH", "GSM8K", "MMLU-STEM", "OCWCourses"],
    dataset: [],
    keyContributions: [
      "Continued pretraining on technical/scientific corpora for math",
      "Tool-free solutions with LaTeX-rendered step-by-step reasoning",
      "State-of-the-art on MATH, GSM8K and MMLU-STEM at release",
    ],
    relatedWorks: [
      {
        title: "Llemma: An Open Language Model For Mathematics",
        url: "https://arxiv.org/abs/2310.10631",
        relation: "followup",
        note: "Open math model matched Minerva at equal parameter count",
      },
      {
        title: "Measuring Mathematical Problem Solving With the MATH Dataset",
        url: "https://arxiv.org/abs/2103.03874",
        relation: "previous",
        note: "MATH provided one of its central evaluations",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-lets-verify",
    title: "Let's Verify Step by Step",
    slug: "lets-verify-step-by-step-process-supervision",
    summary:
      "OpenAI showed that process supervision — human feedback on each reasoning step — outperforms outcome supervision on MATH, and released PRM800K, the 800,000 step-level human labels used to train the reward model.",
    significance:
      "Flawed multi-step reasoning often still ends in a plausible-looking answer; step-level supervision makes process reward models reliable enough to select correct traces, a technique adopted in best-of-N selection for later reasoning models.",
    problem:
      "Outcome supervision rewards correct final answers without checking whether the reasoning itself is valid.",
    date: "2023-05-01",
    researchArea: "Mathematical Reasoning",
    subArea: "Process supervision",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2305.20050",
    paperUrl: "https://arxiv.org/abs/2305.20050",
    githubUrl: "https://github.com/openai/prm800k",
    papers: [
      {
        title: "Let's Verify Step by Step",
        url: "https://arxiv.org/abs/2305.20050",
        year: 2023,
      },
    ],
    authors: ["Hunter Lightman", "Vineet Kosaraju", "Yura Burda", "Harri Edwards", "Bowen Baker", "Teddy Lee"],
    institution: "OpenAI",
    benchmark: ["MATH"],
    dataset: ["PRM800K (800K step-level human labels)"],
    keyContributions: [
      "Human step-level labels for reasoning traces (PRM800K)",
      "Process supervision beats outcome supervision on MATH",
      "78% solved on a representative MATH test subset with process supervision",
    ],
    relatedWorks: [
      {
        title: "Training Verifiers to Solve Math Word Problems",
        url: "https://arxiv.org/abs/2110.14168",
        relation: "previous",
        note: "Outcome-level verifier training in the same line",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-proofnet",
    title: "ProofNet: Autoformalizing and Formally Proving Undergraduate-Level Mathematics",
    slug: "proofnet-autoformalizing-undergraduate-mathematics",
    summary:
      "A benchmark of 371 undergraduate pure-mathematics examples (analysis, linear algebra, abstract algebra, topology), each with a natural-language statement, a natural-language proof and a Lean formalization, plus autoformalization baselines.",
    significance:
      "Quantified how far models are from human-level autoformalization on textbook material and became a standard second evaluation for LLM theorem provers alongside miniF2F.",
    problem:
      "Autoformalization had no challenging standardized benchmark, so progress was hard to measure.",
    date: "2023-02-01",
    researchArea: "Formal Mathematics",
    subArea: "Autoformalization",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2302.12433",
    paperUrl: "https://arxiv.org/abs/2302.12433",
    githubUrl: "https://github.com/zhangir-azerbayev/ProofNet",
    papers: [
      {
        title: "ProofNet: Autoformalizing and Formally Proving Undergraduate-Level Mathematics",
        url: "https://arxiv.org/abs/2302.12433",
        year: 2023,
      },
    ],
    authors: [
      "Zhangir Azerbayev",
      "Bartosz Piotrowski",
      "Hailey Schoelkopf",
      "Edward W. Ayers",
      "Dragomir Radev",
      "Jeremy Avigad",
    ],
    institution: "Carnegie Mellon University",
    benchmark: ["ProofNet"],
    dataset: ["ProofNet (371 statements with proofs and Lean formalizations)"],
    keyContributions: [
      "Undergraduate-level formalization benchmark with paired informal/formal text",
      "Autoformalization baselines: prompt retrieval and distilled backtranslation",
      "Measured the human–model gap in autoformalization",
    ],
    relatedWorks: [
      {
        title: "DeepSeek-Prover-V1.5: Harnessing Proof Assistant Feedback for RL and MCTS",
        url: "https://arxiv.org/abs/2408.08152",
        relation: "followup",
        note: "Later provers report ProofNet alongside miniF2F",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-mathcoder",
    title: "MathCoder: Seamless Code Integration in LLMs for Enhanced Mathematical Reasoning",
    slug: "mathcoder-code-integration-for-mathematical-reasoning",
    summary:
      "A method and dataset for fine-tuning open-source models to solve math problems by embedding executable code inside the reasoning chain, released together with the MathCoder-7B models.",
    significance:
      "Showed that tool-integrated mathematical reasoning — previously demonstrated only in closed systems — can be brought to open models through code-annotated training data and code-interleaved chains of thought.",
    problem:
      "Code execution helps hard math problems, but only closed proprietary models had that capability.",
    date: "2023-10-01",
    researchArea: "Mathematical Reasoning",
    subArea: "Tool & code integration",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2310.03731",
    paperUrl: "https://arxiv.org/abs/2310.03731",
    githubUrl: "https://github.com/mathllm/MathCoder",
    papers: [
      {
        title: "MathCoder: Seamless Code Integration in LLMs for Enhanced Mathematical Reasoning",
        url: "https://arxiv.org/abs/2310.03731",
        year: 2023,
      },
    ],
    authors: ["Ke Wang", "Houxing Ren", "Aojun Zhou", "Zimu Lu", "Sichun Luo", "Weikang Shi"],
    institution: "The Chinese University of Hong Kong",
    model: ["MathCoder-7B"],
    benchmark: ["MATH", "GSM8K"],
    dataset: [],
    keyContributions: [
      "Code-annotated training data for math reasoning",
      "Code-interleaved chain-of-thought generation",
      "Open 7B models with tool-integrated reasoning",
    ],
    relatedWorks: [
      {
        title: "Let's Verify Step by Step",
        url: "https://arxiv.org/abs/2305.20050",
        relation: "related",
        note: "Contemporary line on improving multi-step reasoning quality",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-qwen25-math",
    title: "Qwen2.5-Math Technical Report: Toward Mathematical Expert Model via Self-Improvement",
    slug: "qwen25-math-self-improvement-math-expert-model",
    summary:
      "A series of math-specific models (1.5B/7B/72B Instruct plus a reward model) built by applying self-improvement across the whole pipeline — pretraining data synthesis, post-training and inference.",
    significance:
      "Pushed open-weight competition-math reasoning to leading open-model levels on MATH, GSM8K and AIME, and shipped an accompanying math reward model rather than a chat model alone.",
    problem:
      "Open general-purpose models lagged specialized systems on competition mathematics.",
    date: "2024-09-01",
    researchArea: "LLM for Mathematics",
    subArea: "Reasoning & self-improvement",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2409.12122",
    paperUrl: "https://arxiv.org/abs/2409.12122",
    githubUrl: "https://github.com/QwenLM/Qwen2.5-Math",
    papers: [
      {
        title: "Qwen2.5-Math Technical Report: Toward Mathematical Expert Model via Self-Improvement",
        url: "https://arxiv.org/abs/2409.12122",
        year: 2024,
      },
    ],
    authors: ["An Yang", "Beichen Zhang", "Binyuan Hui", "Bofei Gao", "Bowen Yu", "Chengpeng Li"],
    institution: "Alibaba / Qwen Team",
    model: ["Qwen2.5-Math-1.5B/7B/72B-Instruct", "Qwen2.5-Math-RM"],
    benchmark: ["MATH", "GSM8K", "AIME"],
    dataset: [],
    keyContributions: [
      "Self-improvement loop spanning data synthesis, training and inference",
      "Open math model family plus a dedicated math reward model",
      "Leading open-model results on MATH, GSM8K and AIME at release",
    ],
    relatedWorks: [
      {
        title: "NuminaMath wins the first AIMO Progress Prize",
        relation: "related",
        note: "Contemporary open competition-math model line",
      },
      {
        title: "Solving Quantitative Reasoning Problems with Language Models",
        url: "https://arxiv.org/abs/2206.14858",
        relation: "previous",
        note: "Minerva established math-specialized model training",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-numinamath",
    title: "NuminaMath wins the first AIMO Progress Prize",
    slug: "numinamath-aimo-progress-prize-1",
    summary:
      "Numina released an open collection of competition-level problems with solutions, and NuminaMath-7B / NuminaMath-7B-TIR won the first AIMO Progress Prize on Kaggle in July 2024.",
    significance:
      "Demonstrated that an open-weight model can win a major public mathematical competition against thousands of participants, and put a high-quality olympiad-level training corpus into the open ecosystem.",
    problem:
      "Open models had no on-par, openly available olympiad-level training resource.",
    date: "2024-07-20",
    researchArea: "Mathematical Reasoning",
    subArea: "Competition-level reasoning",
    sourceType: "blog",
    sourceUrl: "https://www.aimoprize.com/updates/2024-07-20-progress-prize-results",
    papers: [],
    authors: [],
    institution: "Project Numina",
    model: ["NuminaMath-7B", "NuminaMath-7B-TIR"],
    benchmark: ["AIMO Progress Prize 1 (Kaggle)"],
    dataset: ["NuminaMath"],
    keyContributions: [
      "Open olympiad-level problem/solution corpus",
      "Open-weight winner of AIMO Progress Prize 1",
      "Tool-integrated variant (TIR) for competition solving",
    ],
    relatedWorks: [
      {
        title: "Goedel-Prover: A Frontier Model for Open-Source Automated Theorem Proving",
        url: "https://arxiv.org/abs/2502.07640",
        relation: "followup",
        note: "Goedel-Pset-v1 auto-formalized statements from Numina problems",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-putnambench",
    title: "PutnamBench: Evaluating Neural Theorem-Provers on the Putnam Mathematical Competition",
    slug: "putnambench-neural-theorem-provers-putnam",
    summary:
      "1,692 hand-constructed formalizations of 640 theorems from the William Lowell Putnam Mathematical Competition in Lean 4 and Isabelle, with a substantial subset also in Coq; evaluated provers solved only a handful.",
    significance:
      "Existing formal-math benchmarks were approaching saturation at textbook level; PutnamBench re-established competition-level formal problem solving as a hard open challenge for neural theorem proving.",
    problem:
      "Formal benchmarks no longer separated strong provers from weak ones.",
    date: "2024-07-01",
    researchArea: "Benchmarks & Datasets",
    subArea: "Formal proving benchmarks",
    sourceType: "conference",
    sourceUrl: "https://arxiv.org/abs/2407.11214",
    paperUrl: "https://arxiv.org/abs/2407.11214",
    githubUrl: "https://github.com/trishullab/PutnamBench",
    papers: [
      {
        title: "PutnamBench: Evaluating Neural Theorem-Provers on the Putnam Mathematical Competition",
        url: "https://arxiv.org/abs/2407.11214",
        venue: "NeurIPS 2024 Datasets & Benchmarks",
        year: 2024,
      },
    ],
    authors: [
      "George Tsoukalas",
      "Jasper Lee",
      "John Jennings",
      "Jimmy Xin",
      "Michelle Ding",
      "Michael Jennings",
    ],
    institution: "University of Texas at Austin",
    benchmark: ["PutnamBench"],
    dataset: ["PutnamBench (1,692 formalizations of 640 theorems)"],
    keyContributions: [
      "Putnam problems formalized in Lean 4, Isabelle and Coq",
      "Cross-system evaluation at genuine competition difficulty",
      "Baseline results showing how far provers remain",
    ],
    relatedWorks: [
      {
        title: "miniF2F: a cross-system benchmark for formal Olympiad-level mathematics",
        url: "https://arxiv.org/abs/2109.00110",
        relation: "previous",
        note: "Earlier, now partially saturated formal olympiad benchmark",
      },
      {
        title: "Goedel-Prover: A Frontier Model for Open-Source Automated Theorem Proving",
        url: "https://arxiv.org/abs/2502.07640",
        relation: "followup",
        note: "Goedel-Prover reports 7 PutnamBench problems solved (pass@512)",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-frontiermath",
    title: "FrontierMath: A Benchmark for Evaluating Advanced Mathematical Reasoning in AI",
    slug: "frontiermath-benchmark-advanced-mathematical-reasoning",
    summary:
      "Epoch AI introduced a benchmark of hundreds of original, exceptionally hard problems written and vetted by expert mathematicians, spanning number theory, real analysis, algebraic geometry and category theory; problems are kept private to limit contamination.",
    significance:
      "Standard math benchmarks were saturating and leaking into training data; FrontierMath measures genuine research-level reasoning, with frontier models initially solving only a small share of problems.",
    problem:
      "Public math benchmarks saturate and contaminate training corpora, so they stop measuring real capability.",
    date: "2024-11-01",
    researchArea: "Benchmarks & Datasets",
    subArea: "Competition & olympiad benchmarks",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2411.04872",
    paperUrl: "https://arxiv.org/abs/2411.04872",
    papers: [
      {
        title: "FrontierMath: A Benchmark for Evaluating Advanced Mathematical Reasoning in AI",
        url: "https://arxiv.org/abs/2411.04872",
        year: 2024,
      },
    ],
    authors: ["Elliot Glazer", "Ege Erdil", "Tamay Besiroglu", "Diego Chicharro", "Evan Chen", "Alex Gunning"],
    institution: "Epoch AI",
    benchmark: ["FrontierMath"],
    dataset: ["FrontierMath (private problem set)"],
    keyContributions: [
      "Original expert-written research-level problems",
      "Private evaluation set to resist contamination",
      "Difficulty calibrated for current frontier models",
    ],
    relatedWorks: [
      {
        title: "Measuring Mathematical Problem Solving With the MATH Dataset",
        url: "https://arxiv.org/abs/2103.03874",
        relation: "previous",
        note: "The competition benchmark FrontierMath is designed to go beyond",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },

  /* ------------------------------------------------------------------ *
   *  Group 3 - discovery, geometry, agents & research-level formal math *
   * ------------------------------------------------------------------ */
  {
    id: "evt-alphatensor",
    title: "Discovering faster matrix multiplication algorithms with reinforcement learning",
    slug: "alphatensor-faster-matrix-multiplication-rl",
    summary:
      "AlphaTensor used deep reinforcement learning to discover, for the first time, matrix-multiplication algorithms faster than the classical count — including 4×4 multiplication over GF(2) with 48 multiplications instead of 64 — plus new fast algorithms for many other sizes.",
    significance:
      "Matrix multiplication underpins modern computing and scientific ML, so even small complexity improvements compound widely; the result also showed RL can discover new algorithms beyond human-designed heuristics.",
    problem:
      "Finding matrix multiplication schemes faster than known heuristics is a huge discrete search space humans explore by hand.",
    date: "2022-10-05",
    researchArea: "Mathematical Discovery",
    subArea: "Algorithm & program search",
    sourceType: "conference",
    sourceUrl: "https://www.nature.com/articles/s41586-022-05172-4",
    papers: [
      {
        title: "Discovering faster matrix multiplication algorithms with reinforcement learning",
        url: "https://www.nature.com/articles/s41586-022-05172-4",
        venue: "Nature (2022)",
        year: 2022,
      },
    ],
    authors: [
      "Alhussein Fawzi",
      "Matej Balog",
      "Aja Huang",
      "Thomas Hubert",
      "Bernardino Romera-Paredes",
      "Mohammadamin Barekatain",
    ],
    institution: "Google DeepMind",
    model: ["AlphaTensor (AlphaZero-style deep RL)"],
    benchmark: ["Matrix multiplication over GF(2) (2×2 to 5×5)"],
    dataset: [],
    keyContributions: [
      "First algorithms found that beat the classical count for several sizes",
      "4×4 over GF(2) in 48 multiplications instead of 64",
      "A tensor-decomposition framing that turns algorithm design into a game",
    ],
    relatedWorks: [
      {
        title: "Mathematical discoveries from program search with large language models",
        url: "https://www.nature.com/articles/s41586-023-06924-6",
        relation: "followup",
        note: "FunSearch continued the program-search line for new constructions",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-funsearch",
    title: "Mathematical discoveries from program search with large language models",
    slug: "funsearch-mathematical-discoveries-program-search",
    summary:
      "FunSearch paired GPT-4 with an automated evaluator and evolutionary program search to discover previously unknown constructions — new best-known cap-set constructions and improved online bin-packing heuristics.",
    significance:
      "Showed that LLM-driven program search can produce genuinely novel mathematics rather than reproducing training data: the cap set result improved a known bound, making this one of the first clear cases of AI contributing new mathematical knowledge.",
    problem:
      "Searching program space for extremal mathematical constructions is too large for brute force and too novel for pure LLM generation.",
    date: "2023-12-14",
    researchArea: "Mathematical Discovery",
    subArea: "Algorithm & program search",
    sourceType: "conference",
    sourceUrl: "https://www.nature.com/articles/s41586-023-06924-6",
    papers: [
      {
        title: "Mathematical discoveries from program search with large language models",
        url: "https://www.nature.com/articles/s41586-023-06924-6",
        venue: "Nature (2023)",
        year: 2023,
      },
    ],
    authors: [
      "Bernardino Romera-Paredes",
      "Mohammadamin Barekatain",
      "Alexander Novikov",
      "Matej Balog",
      "M. Pawan Kumar",
      "Emilien Dupont",
    ],
    institution: "Google DeepMind",
    model: ["GPT-4 (evolutionary program-search loop)"],
    benchmark: ["Cap set problem", "Online bin packing"],
    dataset: [],
    keyContributions: [
      "Evolutionary search over LLM-generated programs with an evaluator in the loop",
      "Best-known cap-set constructions at the time",
      "Improved heuristics for online bin packing",
    ],
    relatedWorks: [
      {
        title: "Discovering faster matrix multiplication algorithms with reinforcement learning",
        url: "https://www.nature.com/articles/s41586-022-05172-4",
        relation: "previous",
        note: "Earlier algorithm discovery via deep RL",
      },
      {
        title: "AlphaEvolve: A Gemini-powered coding agent for designing advanced algorithms",
        url: "https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/",
        relation: "followup",
        note: "Generalized FunSearch's evolution loop into a coding agent",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-alphageometry",
    title: "Solving olympiad geometry without human demonstrations",
    slug: "alphageometry-olympiad-geometry-without-demonstrations",
    summary:
      "AlphaGeometry, a neuro-symbolic system combining a language model with a symbolic deduction engine, solved 25 of 30 past IMO geometry problems (1979–2022) — roughly the level of an average IMO gold medallist.",
    significance:
      "Olympiad geometry resisted automation largely because solutions require inventing auxiliary constructions; neural-guided symbolic search closed most of that gap without human demonstrations.",
    problem:
      "Symbolic provers cannot invent auxiliary constructions, and learning from human solutions requires scarce demonstrations.",
    date: "2024-01-17",
    researchArea: "Geometry",
    subArea: "Geometry problem solving",
    sourceType: "conference",
    sourceUrl: "https://www.nature.com/articles/s41586-023-06747-5",
    papers: [
      {
        title: "Solving olympiad geometry without human demonstrations",
        url: "https://www.nature.com/articles/s41586-023-06747-5",
        venue: "Nature (2024)",
        year: 2024,
      },
    ],
    authors: ["Trieu H. Trinh", "Yuhuai Wu", "Quoc V. Le", "He He", "Thang Luong"],
    institution: "Google DeepMind",
    model: ["AlphaGeometry (language model + symbolic deduction engine)"],
    benchmark: ["IMO geometry problems (30 problems, 1979–2022)"],
    dataset: [],
    keyContributions: [
      "Language model suggests auxiliary constructions for a symbolic engine",
      "25/30 past IMO geometry problems solved without human demonstrations",
      "Synthetic training-data generation for geometry proving",
    ],
    relatedWorks: [
      {
        title: "AI achieves silver-medal standard solving International Mathematical Olympiad problems",
        url: "https://deepmind.google/blog/ai-solves-imo-problems-at-silver-medal-level/",
        relation: "followup",
        note: "AlphaGeometry2 combined with AlphaProof for IMO 2024",
      },
      {
        title: "Mathematical discoveries from program search with large language models",
        url: "https://www.nature.com/articles/s41586-023-06924-6",
        relation: "related",
        note: "Complementary neuro-symbolic discovery approach",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-alphaproof",
    title: "AI achieves silver-medal standard solving International Mathematical Olympiad problems",
    slug: "alphaproof-imo-silver-medal-standard",
    summary:
      "DeepMind announced AlphaProof, a reinforcement-learning system that states and proves mathematical statements in Lean 4; with AlphaGeometry2 it solved four of the six IMO 2024 problems for 28/42 — the silver-medal standard.",
    significance:
      "The first AI result at medal level on a full official IMO problem set, validated by formal checking in Lean: RL-trained proving handled algebra, number theory and combinatorics, not just geometry.",
    problem:
      "Olympiad problems go beyond geometry, and informal claims are hard to verify automatically.",
    date: "2024-07-25",
    researchArea: "Theorem Proving",
    subArea: "Proof search",
    sourceType: "blog",
    sourceUrl: "https://deepmind.google/blog/ai-solves-imo-problems-at-silver-medal-level/",
    papers: [],
    authors: [],
    institution: "Google DeepMind",
    model: ["AlphaProof (RL + Lean 4)", "AlphaGeometry2"],
    benchmark: ["IMO 2024"],
    dataset: [],
    keyContributions: [
      "RL system producing machine-checked Lean 4 proofs",
      "28/42 across the six IMO 2024 problems (silver-medal standard)",
      "Proof statement generation combined with proof search",
    ],
    relatedWorks: [
      {
        title: "Solving olympiad geometry without human demonstrations",
        url: "https://www.nature.com/articles/s41586-023-06747-5",
        relation: "previous",
        note: "AlphaGeometry2 supplied the geometry half of the result",
      },
      {
        title: "Advanced version of Gemini with Deep Think officially achieves gold-medal standard at IMO",
        url: "https://deepmind.google/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/",
        relation: "followup",
        note: "One year later a Gemini variant reached gold-medal standard",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-ai-scientist",
    title: "The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery",
    slug: "ai-scientist-automated-open-ended-discovery",
    summary:
      "Sakana AI presented a framework in which LLM agents autonomously generate research ideas, write and execute code, analyze results and produce complete papers — at roughly $15 per paper — plus an automated paper reviewer.",
    significance:
      "The first comprehensive open framework for end-to-end autonomous paper generation, which shifted the debate from 'can AI write papers' to how such systems should be evaluated and reviewed.",
    problem:
      "The full research loop (idea → experiment → write-up) is expensive and slow even for narrow domains.",
    date: "2024-08-12",
    researchArea: "AI-assisted Research",
    subArea: "Autonomous research agents",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2408.06292",
    paperUrl: "https://arxiv.org/abs/2408.06292",
    githubUrl: "https://github.com/SakanaAI/AI-Scientist",
    papers: [
      {
        title: "The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery",
        url: "https://arxiv.org/abs/2408.06292",
        year: 2024,
      },
    ],
    authors: ["Chris Lu", "Cong Lu", "Robert Tjarko Lange", "Jakob Foerster", "Jeff Clune", "David Ha"],
    institution: "Sakana AI",
    model: ["Frontier LLMs (no single fixed model)"],
    benchmark: [],
    dataset: [],
    keyContributions: [
      "End-to-end loop: ideation, implementation, experiment, write-up",
      "Automated reviewer for generated papers",
      "Very low per-paper cost, making scale experiments possible",
    ],
    relatedWorks: [
      {
        title: "Agent Laboratory: Using LLM Agents as Research Assistants",
        url: "https://arxiv.org/abs/2501.04227",
        relation: "followup",
        note: "Kept a human in the loop and cut research costs further",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-agent-laboratory",
    title: "Agent Laboratory: Using LLM Agents as Research Assistants",
    slug: "agent-laboratory-llm-agents-research-assistants",
    summary:
      "An autonomous LLM-agent framework that carries a human research idea through literature review, experimentation and report writing, accepting human feedback at each stage; the o1-preview-driven configuration performed best and cut research costs by 84% versus prior autonomous research methods.",
    significance:
      "Positions agents as assistants rather than replacements: researchers spend effort on ideation and feedback instead of low-level coding and writing, while keeping measurable cost and turnaround reductions.",
    problem:
      "Autonomous research systems are expensive, slow and hard to steer mid-project.",
    date: "2025-01-08",
    researchArea: "Mathematical Agents",
    subArea: "Autonomous research agents",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2501.04227",
    paperUrl: "https://arxiv.org/abs/2501.04227",
    papers: [
      {
        title: "Agent Laboratory: Using LLM Agents as Research Assistants",
        url: "https://arxiv.org/abs/2501.04227",
        year: 2025,
      },
    ],
    authors: ["Samuel Schmidgall", "Yusheng Su", "Ze Wang", "Ximeng Sun", "Jialian Wu", "Xiaodong Yu"],
    institution: "Johns Hopkins University / Microsoft AI for Good Research Lab",
    model: ["o1-preview (best-performing)"],
    benchmark: [],
    dataset: [],
    keyContributions: [
      "Staged agent pipeline: literature review → experimentation → writing",
      "Human feedback injection points at each stage",
      "84% cost reduction versus prior autonomous research methods",
    ],
    relatedWorks: [
      {
        title: "The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery",
        url: "https://arxiv.org/abs/2408.06292",
        relation: "previous",
        note: "Fully autonomous predecessor in the same line",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-alphaevolve",
    title: "AlphaEvolve: A Gemini-powered coding agent for designing advanced algorithms",
    slug: "alphaevolve-gemini-coding-agent-algorithms",
    summary:
      "An evolutionary coding agent that uses Gemini models to mutate and automatically evaluate whole code bases, announcing improved matrix-multiplication algorithms and gains across mathematics and computing systems.",
    significance:
      "Turned FunSearch-style program evolution into a practical agent able to improve real algorithms and systems, widening AI mathematical discovery from single functions to entire programs.",
    problem:
      "Existing LLM search methods optimized small snippets rather than real, interacting code.",
    date: "2025-05-14",
    researchArea: "Mathematical Discovery",
    subArea: "Algorithm & program search",
    sourceType: "blog",
    sourceUrl:
      "https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/",
    papers: [],
    authors: [],
    institution: "Google DeepMind",
    model: ["Gemini (Flash and Pro)"],
    benchmark: ["Matrix multiplication exponent ω (small sizes)"],
    dataset: [],
    keyContributions: [
      "Evolution over whole code bases with automated evaluation",
      "Improved matrix-multiplication algorithms and systems-level gains",
      "Generalizes the FunSearch loop into a reusable agent",
    ],
    relatedWorks: [
      {
        title: "Mathematical discoveries from program search with large language models",
        url: "https://www.nature.com/articles/s41586-023-06924-6",
        relation: "previous",
        note: "FunSearch introduced the evaluation-driven program evolution loop",
      },
      {
        title: "Discovering faster matrix multiplication algorithms with reinforcement learning",
        url: "https://www.nature.com/articles/s41586-022-05172-4",
        relation: "related",
        note: "Earlier RL-based improvement to matrix multiplication algorithms",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-gemini-imo-2025",
    title: "Advanced version of Gemini with Deep Think officially achieves gold-medal standard at the International Mathematical Olympiad",
    slug: "gemini-deep-think-imo-2025-gold-medal",
    summary:
      "Google DeepMind announced that an advanced 'Deep Think' version of Gemini achieved gold-medal standard at IMO 2025 when graded under official contest conditions by the IMO's official coordinators.",
    significance:
      "The first time a general-purpose LLM reached gold-medal level on full IMO problems under official grading, one year after the silver-level AlphaProof result — measured on natural-language reasoning rather than formal proofs.",
    problem:
      "Gold-medal level on full olympiad problems remained out of reach for general-purpose models under official evaluation.",
    date: "2025-07-21",
    researchArea: "Mathematical Reasoning",
    subArea: "Competition-level reasoning",
    sourceType: "blog",
    sourceUrl:
      "https://deepmind.google/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/",
    papers: [],
    authors: [],
    institution: "Google DeepMind",
    model: ["Gemini with Deep Think (experimental)"],
    benchmark: ["IMO 2025 (official grading)"],
    dataset: [],
    keyContributions: [
      "Gold-medal standard under official IMO grading conditions",
      "Extended reasoning mode for hard olympiad problems",
      "One-year step from silver (2024) to gold (2025)",
    ],
    relatedWorks: [
      {
        title: "AI achieves silver-medal standard solving International Mathematical Olympiad problems",
        url: "https://deepmind.google/blog/ai-solves-imo-problems-at-silver-medal-level/",
        relation: "previous",
        note: "AlphaProof's silver-medal standard result one year earlier",
      },
    ],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "evt-formal-conjectures",
    title: "Formal Conjectures: An Open and Evolving Benchmark for Verified Discovery in Mathematics",
    slug: "formal-conjectures-verified-discovery-benchmark",
    summary:
      "An open, evolving Lean 4 benchmark of 2,615 research-level problem statements, including 1,029 open conjectures from active research and 836 solved problems, with a structured interface between mathematicians who formalize problems and the systems attempting them.",
    significance:
      "Provides a zero-contamination, kernel-verified way to measure research-level proof discovery — and the benchmark's authors report it has already been used for new discoveries, including resolutions of open research conjectures.",
    problem:
      "Existing formal benchmarks are textbook-level and contaminated; research-level statements had no standardized, verified evaluation.",
    date: "2026-05-13",
    researchArea: "Formal Mathematics",
    subArea: "Formal corpora & libraries",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2605.13171",
    paperUrl: "https://arxiv.org/abs/2605.13171",
    githubUrl: "https://github.com/google-deepmind/formal-conjectures",
    papers: [
      {
        title: "Formal Conjectures: An Open and Evolving Benchmark for Verified Discovery in Mathematics",
        url: "https://arxiv.org/abs/2605.13171",
        year: 2026,
      },
    ],
    authors: [
      "Moritz Firsching",
      "Paul Lezeau",
      "Salvatore Mercuri",
      "Miklós Z. Horváth",
      "Yaël Dillies",
      "Calle Sönne",
    ],
    institution: "Google DeepMind",
    benchmark: ["Formal Conjectures (2,615 statements; frozen evaluation subsets)"],
    dataset: ["Formal Conjectures (Lean 4): 1,029 open conjectures, 836 solved problems"],
    keyContributions: [
      "2,615 verified Lean 4 statements drawn from active research",
      "Zero-contamination evaluation through open conjectures",
      "Community workflow where AI proofs help audit the formalizations",
    ],
    relatedWorks: [
      {
        title: "ProofNet: Autoformalizing and Formally Proving Undergraduate-Level Mathematics",
        url: "https://arxiv.org/abs/2302.12433",
        relation: "previous",
        note: "Textbook-level benchmark this work goes beyond",
      },
      {
        title: "Mathematical discoveries from program search with large language models",
        url: "https://www.nature.com/articles/s41586-023-06924-6",
        relation: "related",
        note: "Another route to AI-assisted mathematical discovery",
      },
    ],
    createdAt: "2026-05-20T00:00:00.000Z",
    updatedAt: "2026-05-20T00:00:00.000Z",
  },

  /* ------------------------------------------------------------------ *
   *  Group 4 - geometry formalization, symbolic math, agent evaluation   *
   *  (verified against the arXiv API and GitHub API)                     *
   * ------------------------------------------------------------------ */
  {
    id: "evt-leaneuclid",
    title: "Autoformalizing Euclidean Geometry (LeanEuclid benchmark)",
    slug: "leaneuclid-autoformalizing-euclidean-geometry",
    summary:
      "A neuro-symbolic autoformalization pipeline — an SMT solver fills the diagrammatic gaps so the language model only formalizes explicit textual steps — plus LeanEuclid, a benchmark of Euclid's Elements and UniGeo problems formalized in Lean.",
    significance:
      "The first dedicated Lean-based Euclidean-geometry autoformalization benchmark: it gives a controlled domain where the gap between informal geometry proofs and machine-checked ones can actually be measured (with GPT-4 and GPT-4V baselines).",
    problem:
      "Informal geometry proofs lean on diagrams, leaving textual gaps that language models cannot formalize directly.",
    date: "2024-05-27",
    researchArea: "Geometry",
    subArea: "Geometry formalization",
    sourceType: "conference",
    sourceUrl: "https://arxiv.org/abs/2405.17216",
    paperUrl: "https://arxiv.org/abs/2405.17216",
    githubUrl: "https://github.com/loganrjmurphy/LeanEuclid",
    papers: [
      {
        title: "Autoformalizing Euclidean Geometry",
        url: "https://arxiv.org/abs/2405.17216",
        venue: "ICML 2024",
        year: 2024,
      },
    ],
    authors: ["Logan Murphy", "Kaiyu Yang", "Jialiang Sun", "Zhaoyu Li", "Anima Anandkumar", "Xujie Si"],
    model: ["GPT-4", "GPT-4V (with domain solver assistance)"],
    benchmark: ["LeanEuclid"],
    dataset: ["LeanEuclid (Euclid's Elements + UniGeo, formalized in Lean)"],
    keyContributions: [
      "SMT solver recovers diagrammatic steps so the LLM formalizes text only",
      "LeanEuclid benchmark with automatic semantic evaluation of statements",
      "GPT-4 / GPT-4V baselines documenting current capability and limits",
    ],
    relatedWorks: [
      {
        title: "ProofNet: Autoformalizing and Formally Proving Undergraduate-Level Mathematics",
        url: "https://arxiv.org/abs/2302.12433",
        relation: "previous",
        note: "Earlier autoformalization benchmark without a geometry focus",
      },
      {
        title: "Euclean: Automated Geometry Problem Formalization with Unified Verification in Lean",
        url: "https://arxiv.org/abs/2607.19374",
        relation: "followup",
        note: "Addresses LeanEuclid's custom-axiom and scale limitations",
      },
    ],
    createdAt: "2026-05-20T00:00:00.000Z",
    updatedAt: "2026-05-20T00:00:00.000Z",
  },
  {
    id: "evt-euclean",
    title: "Euclean: Automated Geometry Problem Formalization with Unified Verification in Lean",
    slug: "euclean-geometry-formalization-native-mathlib",
    summary:
      "A four-stage framework (constraint explication, configuration anchoring, formalization mapping, iterative repair) for formalizing geometry natively in Mathlib, producing OMNI-Geometry (768 competition problems) and Numina-Geometry (177,597 problems) — the largest geometry formalization datasets in Lean.",
    significance:
      "Removes the fragmented-trust problem of domain-specific geometry languages: geometry proofs now sit in standard Mathlib, and training a prover on the released formalizations raised proof success from 13.6% to 15.1%, showing the data is usable for real training runs.",
    problem:
      "Prior Lean geometry work used custom axioms incompatible with Mathlib and too few problems (<1,100) to train on.",
    date: "2026-06-17",
    researchArea: "Geometry",
    subArea: "Geometry formalization",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2607.19374",
    paperUrl: "https://arxiv.org/abs/2607.19374",
    githubUrl: "https://github.com/tlb-22/Euclean",
    papers: [
      {
        title: "Euclean: Automated Geometry Problem Formalization with Unified Verification in Lean",
        url: "https://arxiv.org/abs/2607.19374",
        venue: "ICML 2026",
        year: 2026,
      },
    ],
    authors: [
      "Linbin Tang",
      "Jingyan You",
      "Zilin Kang",
      "Hanzhang Liu",
      "Sophia Zhang",
      "Zenan Li",
    ],
    model: ["Goedel v2 (trained on the released formalizations)"],
    benchmark: ["OMNI-Geometry"],
    dataset: ["OMNI-Geometry (768 problems)", "Numina-Geometry (177,597 problems)"],
    keyContributions: [
      "Mathlib-native geometry formalization pipeline with iterative repair",
      "177,597-problem geometry corpus — the largest in Lean",
      "Measured end utility: 13.6% → 15.1% proof success after training",
    ],
    relatedWorks: [
      {
        title: "Autoformalizing Euclidean Geometry (LeanEuclid benchmark)",
        url: "https://arxiv.org/abs/2405.17216",
        relation: "previous",
        note: "Custom-axiom geometry benchmark Euclean improves on",
      },
      {
        title: "Goedel-Prover: A Frontier Model for Open-Source Automated Theorem Proving",
        url: "https://arxiv.org/abs/2502.07640",
        relation: "related",
        note: "The prover line whose v2 model was trained on this data",
      },
    ],
    createdAt: "2026-06-20T00:00:00.000Z",
    updatedAt: "2026-06-20T00:00:00.000Z",
  },
  {
    id: "evt-o-forge",
    title: "O-Forge: An LLM + Computer Algebra Framework for Asymptotic Analysis",
    slug: "o-forge-llm-computer-algebra-asymptotic-analysis",
    summary:
      "An In-Context Symbolic Feedback loop in which a frontier LLM proposes domain decompositions for asymptotic inequalities and a computer algebra system (e.g. Mathematica) verifies each piece axiomatically.",
    significance:
      "A concrete, verified example of LLMs moving from contest math to research-level symbolic work: the paper reports answering a question posed by Terence Tao about whether an LLM coupled with a verifier can prove intricate asymptotic inequalities.",
    problem:
      "Research-level proofs may look plausible but cannot be trusted without rigorous checking, and finding the right domain decomposition is the hard part.",
    date: "2025-10-14",
    researchArea: "Symbolic Mathematics",
    subArea: "Equation solving & discovery",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2510.12350",
    paperUrl: "https://arxiv.org/abs/2510.12350",
    papers: [
      {
        title: "O-Forge: An LLM + Computer Algebra Framework for Asymptotic Analysis",
        url: "https://arxiv.org/abs/2510.12350",
        year: 2025,
      },
    ],
    authors: ["Ayush Khaitan", "Vijay Ganesh"],
    model: ["Frontier LLM + CAS (Mathematica)"],
    benchmark: [],
    dataset: [],
    keyContributions: [
      "In-Context Symbolic Feedback between an LLM and a CAS",
      "Verified proofs of research-level asymptotic inequalities",
      "Moves LLM assistance from contest problems to professional tools",
    ],
    relatedWorks: [
      {
        title: "ASyMOB: Algebraic Symbolic Mathematical Operations Benchmark",
        url: "https://arxiv.org/abs/2505.23851",
        relation: "related",
        note: "Diagnoses where CAS fail and LLMs succeed — the complementarity O-Forge exploits",
      },
      {
        title: "Mathematical discoveries from program search with large language models",
        url: "https://www.nature.com/articles/s41586-023-06924-6",
        relation: "related",
        note: "Another verified-in-the-loop route to AI-assisted research math",
      },
    ],
    createdAt: "2026-05-20T00:00:00.000Z",
    updatedAt: "2026-05-20T00:00:00.000Z",
  },
  {
    id: "evt-asmob",
    title: "ASyMOB: Algebraic Symbolic Mathematical Operations Benchmark",
    slug: "asmob-algebraic-symbolic-mathematical-operations-benchmark",
    summary:
      "35,368 validated symbolic-math problems (integration, limits, ODEs, series, hypergeometrics), each perturbed with symbolic, numeric and equivalence-preserving transformations to separate memorization from genuine reasoning.",
    significance:
      "Shows most models collapse under minor perturbations, while code tools stabilize weaker models and a set of problems exists where CAS fail but LLMs succeed — the evidence base for hybrid LLM+CAS systems and for trustworthy symbolic AI.",
    problem:
      "Existing evaluations conflate pattern memorization with real symbolic reasoning.",
    date: "2025-05-28",
    researchArea: "Symbolic Mathematics",
    subArea: "Symbolic benchmark",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2505.23851",
    paperUrl: "https://arxiv.org/abs/2505.23851",
    githubUrl: "https://github.com/RamanujanMachine/ASyMOB",
    papers: [
      {
        title: "ASyMOB: Algebraic Symbolic Mathematical Operations Benchmark",
        url: "https://arxiv.org/abs/2505.23851",
        venue: "ICML 2026",
        year: 2025,
      },
    ],
    authors: ["Michael Shalyt", "Rotem Elimelech", "Ido Kaminer"],
    benchmark: ["ASyMOB"],
    dataset: ["ASyMOB (35,368 validated symbolic problems)"],
    keyContributions: [
      "Perturbation-based design that separates memorization from reasoning",
      "35,368 validated problems across five symbolic domains",
      "Documents CAS/LLM complementarity for hybrid approaches",
    ],
    relatedWorks: [
      {
        title: "O-Forge: An LLM + Computer Algebra Framework for Asymptotic Analysis",
        url: "https://arxiv.org/abs/2510.12350",
        relation: "followup",
        note: "Builds the hybrid LLM+CAS loop ASyMOB motivates",
      },
      {
        title: "FrontierMath: A Benchmark for Evaluating Advanced Mathematical Reasoning in AI",
        url: "https://arxiv.org/abs/2411.04872",
        relation: "related",
        note: "Companion effort in contamination-resistant, reasoning-focused evaluation",
      },
    ],
    createdAt: "2026-05-20T00:00:00.000Z",
    updatedAt: "2026-05-20T00:00:00.000Z",
  },
  {
    id: "evt-mlr-bench",
    title: "MLR-Bench: Evaluating AI Agents on Open-Ended Machine Learning Research",
    slug: "mlr-bench-evaluating-ai-agents-open-ended-research",
    summary:
      "201 open-ended research tasks taken from NeurIPS/ICLR/ICML workshops, an automated reviewer (MLR-Judge) and a modular agent scaffold (MLR-Agent); evaluating six frontier models plus a coding agent found that coding agents produced fabricated or invalidated experimental results in about 80% of cases.",
    significance:
      "Sets the reliability bar for the research agents this platform will need in V3/V4: coherent papers are easy, trustworthy experiments are not — and the benchmark plus reviewer are open-sourced so agent pipelines can be diagnosed step by step.",
    problem:
      "Research agents can already produce plausible-looking papers, but nobody had measured whether their experimental results actually hold up.",
    date: "2025-05-26",
    researchArea: "AI-assisted Research",
    subArea: "Agent evaluation & peer review",
    sourceType: "conference",
    sourceUrl: "https://arxiv.org/abs/2505.19955",
    paperUrl: "https://arxiv.org/abs/2505.19955",
    githubUrl: "https://github.com/chchenhui/mlrbench",
    papers: [
      {
        title: "MLR-Bench: Evaluating AI Agents on Open-Ended Machine Learning Research",
        url: "https://arxiv.org/abs/2505.19955",
        venue: "NeurIPS 2025 Datasets & Benchmarks",
        year: 2025,
      },
    ],
    authors: ["Hui Chen", "Miao Xiong", "Yujie Lu", "Wei Han", "Ailin Deng", "Yufei He"],
    model: ["Six frontier LLMs + an advanced coding agent"],
    benchmark: ["MLR-Bench (201 research tasks, MLR-Judge review)"],
    dataset: ["MLR-Bench task collection (NeurIPS/ICLR/ICML workshops)"],
    keyContributions: [
      "End-to-end evaluation across idea, proposal, experiment and paper stages",
      "MLR-Judge rubric-based reviewer validated against expert reviewers",
      "Quantifies result fabrication (~80%) in current coding agents",
    ],
    relatedWorks: [
      {
        title: "The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery",
        url: "https://arxiv.org/abs/2408.06292",
        relation: "previous",
        note: "The autonomous paper generator class this bench evaluates",
      },
      {
        title: "Agent Laboratory: Using LLM Agents as Research Assistants",
        url: "https://arxiv.org/abs/2501.04227",
        relation: "related",
        note: "Human-in-the-loop alternative to fully autonomous generation",
      },
    ],
    createdAt: "2026-05-20T00:00:00.000Z",
    updatedAt: "2026-05-20T00:00:00.000Z",
  },
  /* ------------------------------------------------------------------ *
   *  Group 5 - 2026 AI4Math events, each verified against a primary      *
   *  source during this session (arXiv abs pages, Anthropic research     *
   *  posts, and the openai/math repository's own history.md).             *
   *  Claims are recorded as claims: publisher-reported results are never *
   *  presented as established mathematical facts.                        *
   * ------------------------------------------------------------------ */
  {
    id: "evt-openai-math-release",
    title: "OpenAI publishes 700+ mathematical manuscripts in a public Lean repository",
    slug: "openai-math-manuscript-collection-release",
    summary:
      "OpenAI published github.com/openai/math, a Lean repository collecting 722 mathematical manuscripts across 372 result families (2026-10-06). Its own history.md then recorded three withdrawals (a sign error in one manuscript invalidated two dependent papers), 14 revised manuscripts and 13 citation updates, leaving 719 manuscripts; the repository reports Lean formalization for 300 of 719 (~42%) of headline results.",
    significance:
      "The first time a lab has put a mass body of AI mathematical output into an inspectable, correctable public form: withdrawals, patches and formalization coverage are logged in the repository itself. It immediately set the agenda for the field's core methodological questions — manuscript count is not a count of established theorems, and a Lean-checking artifact is not the same as verification of the natural-language argument.",
    problem:
      "Claims about AI-generated mathematics had no shared public record; researchers could not check, count, compare or contest the work.",
    date: "2026-10-06",
    researchArea: "Mathematical Discovery",
    subArea: "Verification & corpus scrutiny",
    sourceType: "github",
    sourceUrl: "https://github.com/openai/math",
    githubUrl: "https://github.com/openai/math",
    papers: [],
    authors: ["OpenAI"],
    institution: "OpenAI",
    model: ["OpenAI frontier models"],
    benchmark: [],
    dataset: ["openai/math manuscript collection (722 at release; 719 after withdrawals)"],
    researchEventType: "Discovery",
    verificationStatus: "partially_verified",
    evidenceLevel: "E3",
    sourceTier: "S1",
    keyContributions: [
      "722 manuscripts in 372 result families released with inspectable Lean material",
      "Public correction log: 3 withdrawals, 14 patched manuscripts, 13 citation updates",
      "Publisher-reported formalization coverage of 300/719 ≈ 42% headline results",
    ],
    verificationHistory: [
      {
        date: "2026-10-06",
        status: "claimed",
        evidenceLevel: "E3",
        note: "Repository published: 722 manuscripts in 372 result families.",
      },
      {
        date: "2026-10-07",
        status: "partially_verified",
        evidenceLevel: "E3",
        note: "history.md records 3 withdrawals, 14 revised manuscripts, 13 citation updates; 719 manuscripts remain.",
      },
      {
        date: "2026-10-14",
        status: "partially_verified",
        evidenceLevel: "E3",
        note: "Repository reports Lean formalization for 300/719 ≈ 42% of headline results. Publisher-reported; not independently re-checked.",
      },
    ],
    relatedWorks: [
      {
        title: "Navier-Stokes lost in translation: why Lean verification of AI autoformalisation does not guarantee correct natural language proofs",
        url: "https://arxiv.org/abs/2610.08144",
        relation: "followup",
        note: "Independent methodological critique of one of the announced proofs",
      },
      {
        title: "Towards Autonomous Mathematics Research (Aletheia)",
        url: "https://arxiv.org/abs/2602.10177",
        relation: "related",
        note: "Companion line on agent autonomy in research-level mathematics",
      },
    ],
    createdAt: "2026-10-14T00:00:00.000Z",
    updatedAt: "2026-10-14T00:00:00.000Z",
  },
  {
    id: "evt-navier-stokes-autoformalisation-dispute",
    title: "Bastounis, Circelli and Hansen argue Lean checks of AI autoformalisation can diverge from the natural-language proof",
    slug: "navier-stokes-lost-in-translation-lean-mismatch",
    summary:
      "A math.AP preprint (arXiv:2610.08144, 2026-10-06) argues that resolving the ambiguities of mathematical natural language is arbitrarily high in the Solvability Complexity Index hierarchy (SCI = ∞), so semantically faithful AI autoformalisation is harder than any computable problem, and gives worked examples of mistranslations — including a case where the Lean formalisation of OpenAI's announced Navier–Stokes blow-up proof does not correspond to the natural-language proof.",
    significance:
      "Puts the field's central trust question on a formal footing: a machine-checked Lean artifact certifies the formal statement it encodes, not the informal claim people read. This is the sharpest test so far of the 'formalize-then-trust' workflow that the October 2026 releases rely on.",
    problem:
      "Autoformalisation was being treated as a substitute for verifying the original mathematical argument.",
    date: "2026-10-06",
    researchArea: "Mathematical Discovery",
    subArea: "Verification & corpus scrutiny",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2610.08144",
    paperUrl: "https://arxiv.org/abs/2610.08144",
    papers: [
      {
        title: "Navier-Stokes lost in translation: Why Lean verification of AI autoformalisation does not guarantee correct natural language proofs",
        url: "https://arxiv.org/abs/2610.08144",
        year: 2026,
      },
    ],
    authors: ["Alexander Bastounis", "Fabian Circelli", "Anders C. Hansen"],
    model: [],
    benchmark: [],
    dataset: [],
    researchEventType: "Controversy",
    verificationStatus: "disputed",
    evidenceLevel: "E2",
    sourceTier: "S1",
    keyContributions: [
      "SCI-hierarchy argument that faithful autoformalisation is uncomputably hard",
      "Worked AI mistranslations of natural-language statements into Lean",
      "Documents a mismatch between a claimed Navier–Stokes proof and its Lean encoding",
    ],
    verificationHistory: [
      {
        date: "2026-10-06",
        status: "disputed",
        evidenceLevel: "E2",
        note: "Preprint published. Records a methodological dispute; it does not by itself refute the underlying Navier–Stokes claim.",
      },
    ],
    relatedWorks: [
      {
        title: "OpenAI publishes 700+ mathematical manuscripts in a public Lean repository",
        url: "https://arxiv.org/abs/2610.08144",
        relation: "related",
        note: "Targets the verification workflow of the October 2026 corpus",
      },
      {
        title: "Autoformalizing Euclidean Geometry (LeanEuclid benchmark)",
        url: "https://arxiv.org/abs/2405.17216",
        relation: "related",
        note: "Earlier evidence of the semantic gap between informal and formal statements",
      },
    ],
    createdAt: "2026-10-14T00:00:00.000Z",
    updatedAt: "2026-10-14T00:00:00.000Z",
  },
  {
    id: "evt-claude-riemann-zeta-lower-bound",
    title: "Claude raises the Riemann zeta zero-lower-bound from 41.6% to 67.2%",
    slug: "claude-riemann-zeta-zero-lower-bound-67-percent",
    summary:
      "An unreleased research version of Claude, working in Claude Code over two sessions (31M output tokens, ~60 subagents, 2,400 shell commands), improved the known lower bound for the fraction of Riemann zeta zeros satisfying the Riemann hypothesis from 41.6% to 67.2%, building on Aryan, Baluyot–Goldston–Suriajaya–Turnage-Butterbaugh and Bombieri. Anthropic's mathematicians examined the paper, external experts Conrey and Goldston looked at it, and a Lean formalization passes the standard comparator tool.",
    significance:
      "A concrete, published-and-checked advance on a real number-theoretic bound — and a stress test for AI-assisted research: the result emerged as an unintended byproduct of an attempt on the Riemann hypothesis itself, which it does not resolve.",
    problem:
      "Improving the proportion of provably RH-satisfying zeros has required decades of incremental work in Montgomery-style techniques.",
    date: "2026-08-10",
    researchArea: "Mathematical Discovery",
    subArea: "AI-proved results & conjectures",
    sourceType: "blog",
    sourceUrl: "https://www.anthropic.com/research/riemann-zeta",
    githubUrl: "https://github.com/anthropics/zeta-23-lean",
    papers: [
      {
        title: "Claude's paper on the Riemann zeta zero lower bound (revised 2026-08-13)",
        url: "https://www.anthropic.com/research/riemann-zeta",
        year: 2026,
      },
    ],
    authors: ["Anthropic (research version of Claude)", "Levent Alpöge", "Ralph Furman"],
    institution: "Anthropic",
    model: ["Claude (unreleased research version)"],
    benchmark: [],
    dataset: [],
    researchEventType: "Discovery",
    verificationStatus: "partially_verified",
    evidenceLevel: "E3",
    sourceTier: "S2",
    keyContributions: [
      "New 67.2% lower bound, up from a long-standing 41.6%",
      "Lean formalization passing the leanprover comparator",
      "Explicitly not a proof of the Riemann hypothesis",
    ],
    verificationHistory: [
      {
        date: "2026-08-10",
        status: "claimed",
        evidenceLevel: "E1",
        note: "Announced by Anthropic; internal mathematicians validated the paper.",
      },
      {
        date: "2026-08-13",
        status: "partially_verified",
        evidenceLevel: "E3",
        note: "Revised paper published; Lean formalization passes the comparator. Independent published verification not recorded.",
      },
    ],
    relatedWorks: [
      {
        title: "FrontierMath: A Benchmark for Evaluating Advanced Mathematical Reasoning in AI",
        url: "https://arxiv.org/abs/2411.04872",
        relation: "related",
        note: "Research-level number theory is a FrontierMath specialty area",
      },
    ],
    createdAt: "2026-10-14T00:00:00.000Z",
    updatedAt: "2026-10-14T00:00:00.000Z",
  },
  {
    id: "evt-claude-flt-formalization",
    title: "Claude produces the first end-to-end computer-checked Lean proof of Fermat's Last Theorem",
    slug: "claude-fermats-last-theorem-lean-formalization",
    summary:
      "Anthropic reports that Claude, working largely autonomously over 11 days on the Prove2Me collaborative platform, wrote an end-to-end Lean proof of Fermat's Last Theorem: 13 million lines of Lean, 29,500 intermediate theorems used in the final proof, relying only on Lean's three standard axioms, with a comparator confirming the statement matches Mathlib's FLT. The proof follows a simplified Wiles argument from Darmon–Diamond–Taylor.",
    significance:
      "A formalization milestone, not a new proof of FLT: the theorem was proved in 1995. What is new is the workflow — dozens of collaborating agents, a DAG of sub-theorems, and a machine-checked artifact large enough to make autoformalization of the modern literature plausible.",
    problem:
      "FLT's formalization was expected to take years; the community blueprint alone runs to 86 pages.",
    date: "2026-09-04",
    researchArea: "Formal Mathematics",
    subArea: "Autoformalization",
    sourceType: "blog",
    sourceUrl: "https://www.anthropic.com/research/formalizing-fermats-last-theorem",
    githubUrl: "https://github.com/anthropics/fermats-last-theorem",
    papers: [
      {
        title: "Prove2Me: An open collaborative platform for scaling math formalization",
        url: "https://arxiv.org/abs/2608.28433",
        year: 2026,
      },
    ],
    authors: ["Anthropic (Claude agents)", "Tianyi Peng"],
    institution: "Anthropic; Columbia University",
    model: ["Claude (research model, multi-agent harness)"],
    benchmark: [],
    dataset: ["Lean 4 (Mathlib-based) FLT development"],
    researchEventType: "Formalization",
    verificationStatus: "partially_verified",
    evidenceLevel: "E3",
    sourceTier: "S2",
    keyContributions: [
      "First end-to-end machine-checked Lean proof of FLT",
      "Multi-agent workflow on Prove2Me with a theorem DAG",
      "Comparator-verified statement match with Mathlib's FLT",
    ],
    verificationHistory: [
      {
        date: "2026-09-04",
        status: "claimed",
        evidenceLevel: "E1",
        note: "Announced by Anthropic with the artifact repository.",
      },
      {
        date: "2026-09-04",
        status: "partially_verified",
        evidenceLevel: "E3",
        note: "Artifact publicly available and Lean-checked by the compiler; independent community re-check not recorded.",
      },
    ],
    relatedWorks: [
      {
        title: "Goedel-Prover: A Frontier Model for Open-Source Automated Theorem Proving",
        url: "https://arxiv.org/abs/2502.07640",
        relation: "previous",
        note: "Neural-prover line that made automated formal proof routine",
      },
      {
        title: "Autoformalizing Euclidean Geometry (LeanEuclid benchmark)",
        url: "https://arxiv.org/abs/2405.17216",
        relation: "related",
        note: "Earlier autoformalization work at a smaller scale",
      },
      {
        title: "Claude raises the Riemann zeta zero-lower-bound from 41.6% to 67.2%",
        url: "https://www.anthropic.com/research/riemann-zeta",
        relation: "related",
        note: "Same lab's line on AI-assisted research mathematics",
      },
    ],
    createdAt: "2026-10-14T00:00:00.000Z",
    updatedAt: "2026-10-14T00:00:00.000Z",
  },
  {
    id: "evt-3sum-apsp-subquadratic",
    title: "First polynomial improvements for 3SUM and APSP refute two long-standing hypotheses",
    slug: "alman-williams-subquadratic-3sum-apsp",
    summary:
      "A preprint by Josh Alman and Virginia Vassilevska Williams (arXiv:2610.06783, 2026-10-05) gives deterministic O(n^1.9992) 3SUM and O(n^2.9995) APSP algorithms for polynomially bounded integer instances — the first polynomial improvements over the textbook algorithms — refuting the 3SUM and APSP hypotheses and, via known reductions, the Exact Triangle, zero-weight k-Clique and related conjectures. Public reporting links parts of the underlying idea to Claude-generated algorithm components that human researchers then understood, improved and extended; this record cites the arXiv preprint as the primary source.",
    significance:
      "Complexity theory had been blocked on these hypotheses for decades; a single new thin-matrix-product algorithm unblocks a wide family of conditional lower bounds at once.",
    problem:
      "3SUM and APSP have resisted polynomial improvement over textbook algorithms for ~50 years.",
    date: "2026-10-05",
    researchArea: "Mathematical Discovery",
    subArea: "AI-proved results & conjectures",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2610.06783",
    paperUrl: "https://arxiv.org/abs/2610.06783",
    papers: [
      {
        title: "Truly Subquadratic 3SUM and Truly Subcubic APSP via Triangles in Sparse Lopsided Graphs",
        url: "https://arxiv.org/abs/2610.06783",
        year: 2026,
      },
    ],
    authors: ["Josh Alman", "Virginia Vassilevska Williams"],
    model: [],
    benchmark: [],
    dataset: [],
    researchEventType: "Discovery",
    verificationStatus: "paper_released",
    evidenceLevel: "E2",
    sourceTier: "S1",
    keyContributions: [
      "Deterministic O(n^1.9992) 3SUM and O(n^2.9995) APSP",
      "New thin matrix product algorithm on sparse lopsided graphs",
      "Refutes 3SUM/APSP and related conjectures via known reductions",
    ],
    verificationHistory: [
      {
        date: "2026-10-05",
        status: "paper_released",
        evidenceLevel: "E2",
        note: "76-page preprint posted; community review ongoing.",
      },
    ],
    relatedWorks: [
      {
        title: "OpenAI publishes 700+ mathematical manuscripts in a public Lean repository",
        url: "https://github.com/openai/math",
        relation: "related",
        note: "Adjacent 2026 event in the AI-assisted research wave",
      },
    ],
    createdAt: "2026-10-14T00:00:00.000Z",
    updatedAt: "2026-10-14T00:00:00.000Z",
  },
  {
    id: "evt-bsd-local-factors-autoformalized",
    title: "BSD Tamagawa-number statistics paper autoformalized in Lean by AxiomProver",
    slug: "bsd-local-factors-axiomprover-autoformalized",
    summary:
      "A human-authored number-theory preprint (arXiv:2610.10243, 2026-10-07) derives a multivariable Euler product encoding the Tamagawa product for short Weierstrass elliptic curves and computes limiting distributions — over half of curves have trivial Tamagawa product, ~42.2% have exactly one prime with nontrivial local Tamagawa number, ~6.8% have two. The paper states its results were autoformalized in Lean by AxiomProver.",
    significance:
      "A clean division of labour: human conjecture and proof, automatic formal verification of a research paper's results — a pattern worth watching for how AI proof checking will be applied to the October 2026 manuscript wave. This is not an AI solution of BSD.",
    problem:
      "Autoformalization had been shown mainly on exercises and competition problems, not on research papers' number-theoretic results.",
    date: "2026-10-07",
    researchArea: "Formal Mathematics",
    subArea: "Autoformalization",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2610.10243",
    paperUrl: "https://arxiv.org/abs/2610.10243",
    papers: [
      {
        title: "Local Factors in the BSD Conjecture: A Unified Statistical View",
        url: "https://arxiv.org/abs/2610.10243",
        year: 2026,
      },
    ],
    authors: [
      "David Kurniadi Angdinata",
      "Kenny Lau",
      "Ken Ono",
      "Ashvin Swaminathan",
      "Sameera Vemulapalli",
    ],
    model: ["AxiomProver"],
    benchmark: [],
    dataset: [],
    researchEventType: "Formalization",
    verificationStatus: "paper_released",
    evidenceLevel: "E2",
    sourceTier: "S1",
    keyContributions: [
      "Multivariable Euler product for the Tamagawa product",
      "Distributional statistics for Tamagawa numbers",
      "Results autoformalized in Lean by AxiomProver",
    ],
    verificationHistory: [
      {
        date: "2026-10-07",
        status: "paper_released",
        evidenceLevel: "E2",
        note: "Preprint posted; autoformalization claimed by the authors.",
      },
    ],
    relatedWorks: [
      {
        title: "Claude produces the first end-to-end computer-checked Lean proof of Fermat's Last Theorem",
        url: "https://www.anthropic.com/research/formalizing-fermats-last-theorem",
        relation: "related",
        note: "Large-scale formalization of research mathematics",
      },
    ],
    createdAt: "2026-10-14T00:00:00.000Z",
    updatedAt: "2026-10-14T00:00:00.000Z",
  },
  {
    id: "evt-ai-co-mathematician",
    title: "DeepMind's AI co-mathematician: an agentic workbench for open-ended research",
    slug: "deepmind-ai-co-mathematician-workbench",
    summary:
      "An arXiv paper (arXiv:2605.06651, 2026-05-07, revised 2026-05-13) introduces the AI co-mathematician, an asynchronous, stateful workspace where mathematicians direct AI agents through ideation, literature search, computational exploration, theorem proving and theory building — tracking failed hypotheses and refining user intent. Early tests report helping researchers solve open problems and find overlooked literature; the system also reports 48% on FrontierMath Tier 4, presented as a new high score among evaluated systems.",
    significance:
      "The alternative to full autonomy: a human-directed research environment rather than an autonomous paper generator. Its case studies should be read with the paper's own note that researchers sometimes had to fill gaps themselves.",
    problem:
      "One-off prompting does not match how mathematicians actually work — iteratively, over weeks, with failed hypotheses worth keeping.",
    date: "2026-05-07",
    researchArea: "Mathematical Agents",
    subArea: "Autonomous research agents",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2605.06651",
    paperUrl: "https://arxiv.org/abs/2605.06651",
    papers: [
      {
        title: "AI co-mathematician: Accelerating mathematicians with agentic AI",
        url: "https://arxiv.org/abs/2605.06651",
        year: 2026,
      },
    ],
    authors: [
      "Daniel Zheng",
      "Ingrid von Glehn",
      "Yori Zwols",
      "Lars Buesing",
      "Daniel M. Roy",
      "Martin Wattenberg",
      "Fernanda Viegas",
      "Hartmut Maennel",
      "Demis Hassabis",
      "Pushmeet Kohli",
    ],
    institution: "Google DeepMind",
    model: ["AI co-mathematician"],
    benchmark: ["FrontierMath Tier 4 (reported 48%)"],
    dataset: [],
    researchEventType: "System",
    verificationStatus: "paper_released",
    evidenceLevel: "E2",
    sourceTier: "S1",
    keyContributions: [
      "Stateful, asynchronous human-agent research workspace",
      "Tracks failed hypotheses and refines user intent",
      "Reported FrontierMath Tier 4 state of the art",
    ],
    verificationHistory: [
      {
        date: "2026-05-07",
        status: "paper_released",
        evidenceLevel: "E2",
        note: "v1 posted; v2 (2026-05-13) adds citations. Benchmark numbers are author-reported.",
      },
    ],
    relatedWorks: [
      {
        title: "Towards Autonomous Mathematics Research (Aletheia)",
        url: "https://arxiv.org/abs/2602.10177",
        relation: "previous",
        note: "DeepMind's earlier agent line on research-level mathematics",
      },
      {
        title: "Agent Laboratory: Using LLM Agents as Research Assistants",
        url: "https://arxiv.org/abs/2501.04227",
        relation: "related",
        note: "Parallel human-in-the-loop research agent effort",
      },
    ],
    createdAt: "2026-10-14T00:00:00.000Z",
    updatedAt: "2026-10-14T00:00:00.000Z",
  },
  {
    id: "evt-aletheia-autonomous-math-research",
    title: "DeepMind's Aletheia: an agent tackling open problems end-to-end",
    slug: "deepmind-aletheia-towards-autonomous-mathematics-research",
    summary:
      "An arXiv paper (arXiv:2602.10177, 2026-02-10, revised 2026-03-06) introduces Aletheia, a research agent built on an advanced Gemini Deep Think that generates, verifies and revises solutions in natural language, with an inference-time scaling law beyond olympiad problems. Reported milestones: an AI-generated paper on structure constants in arithmetic geometry without human intervention, a human–AI collaboration paper on independent-set bounds, and a semi-autonomous evaluation of 700 open problems from Bloom's Erdős Conjectures database including autonomous solutions to four open questions. The paper proposes autonomy/novelty levels and human–AI interaction cards.",
    significance:
      "The clearest published attempt to move from olympiad gold-medal standards to professional research practice — and, importantly, a proposal for how to report AI contribution honestly. Note the 700-problem scan is not 700 solved problems.",
    problem:
      "Competition-level systems do not handle literature navigation or long-horizon research proofs.",
    date: "2026-02-10",
    researchArea: "AI-assisted Research",
    subArea: "Autonomous research agents",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2602.10177",
    paperUrl: "https://arxiv.org/abs/2602.10177",
    papers: [
      {
        title: "Towards Autonomous Mathematics Research",
        url: "https://arxiv.org/abs/2602.10177",
        year: 2026,
      },
    ],
    authors: [
      "Tony Feng",
      "Trieu H. Trinh",
      "Garrett Bingham",
      "Yuri Chervonyi",
      "Junehyuk Jung",
      "Sergei Gukov",
      "Federico Pasqualotto",
      "Demis Hassabis",
      "Koray Kavukcuoglu",
      "Quoc V. Le",
      "Thang Luong",
    ],
    institution: "Google DeepMind",
    model: ["Aletheia (Gemini Deep Think)"],
    benchmark: ["Bloom's Erdős Conjectures database (700 open problems)"],
    dataset: [],
    researchEventType: "System",
    verificationStatus: "paper_released",
    evidenceLevel: "E2",
    sourceTier: "S1",
    keyContributions: [
      "End-to-end research agent: generate, verify, revise in natural language",
      "Semi-autonomous sweep of 700 open problems with four autonomous solutions",
      "Proposes autonomy/novelty levels and human–AI interaction cards",
    ],
    verificationHistory: [
      {
        date: "2026-02-10",
        status: "paper_released",
        evidenceLevel: "E2",
        note: "v1 posted; v3 (2026-03-06) adds FirstProof summary. Milestones are author-reported.",
      },
    ],
    relatedWorks: [
      {
        title: "AI co-mathematician: Accelerating mathematicians with agentic AI",
        url: "https://arxiv.org/abs/2605.06651",
        relation: "followup",
        note: "Follow-up workbench direction from the same lab",
      },
      {
        title: "The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery",
        url: "https://arxiv.org/abs/2408.06292",
        relation: "related",
        note: "Earlier autonomous-paper-generator milestone",
      },
    ],
    createdAt: "2026-10-14T00:00:00.000Z",
    updatedAt: "2026-10-14T00:00:00.000Z",
  },
  /* ------------------------------------------------------------------ *
   *  Group 6 - community & institutional response (2026): stance        *
   *  statements, public lectures, funding and open infrastructure.      *
   *  Each source (declaration site, AHM statements page, Tao's blog,    *
   *  openmathmodel.org, the Simons press release) was fetched and        *
   *  confirmed; stance contents are recorded as the publishers' stated   *
   *  positions, not as independently verified facts.                     *
   * ------------------------------------------------------------------ */
  {
    id: "evt-fields-medallists-misalignment-declaration",
    title:
      "28 Fields Medal laureates publish the declaration \u201CA Severe Misalignment of AI in Mathematics\u201D",
    slug: "fields-medallists-misalignment-declaration",
    summary:
      "On 2026-09-11, 28 Fields Medal laureates \u2014 among them Terence Tao, Artur Avila, Peter Scholze, Maryna Viazovska and June Huh \u2014 published an open declaration (mathandai.org, archived at Zenodo DOI 10.5281/zenodo.22737750, available in nine languages) arguing that the push by AI companies to solve mathematical problems as a benchmark is detrimental to the science of mathematics and the mathematical community. The signatories state that solving problems is a tool and proxy for the primary goal of conceptual understanding, and warn that rushed AI solutions leave no time for proper writeups, method isolation or citation, raising attribution and plagiarism questions.",
    significance:
      "The most prominent collective stance by working mathematicians on AI4Math to date: it moves the debate from individual blog posts to a signed, DOI-archived document, and names the conflict as a severe alignment problem between lab incentives and mathematical values. It set the agenda for the community response that followed in October 2026 \u2014 the AHM statement and the Simons Foundation funding initiative \u2014 and pairs with Tao's constructive Math 2.0 counter-proposal.",
    problem:
      "AI labs treat open-problem solving as a benchmark while the mathematical community treats problems as vehicles for understanding; the two goals have diverged.",
    date: "2026-09-11",
    sourceType: "blog",
    sourceUrl: "https://mathandai.org/",
    paperUrl: "https://doi.org/10.5281/zenodo.22737750",
    papers: [
      {
        title: "A Severe Misalignment of AI in Mathematics (declaration)",
        url: "https://doi.org/10.5281/zenodo.22737750",
        venue: "mathandai.org / Zenodo",
        year: 2026,
      },
    ],
    authors: [
      "Artur Avila",
      "Manjul Bhargava",
      "Caucher Birkar",
      "Pierre Deligne",
      "Yu Deng",
      "Simon Donaldson",
      "Vladimir Drinfeld",
      "Hugo Duminil-Copin",
      "Alessio Figalli",
      "Martin Hairer",
      "June Huh",
      "Maxim Kontsevich",
      "Elon Lindenstrauss",
      "Pierre-Louis Lions",
      "Grigory Margulis",
      "James Maynard",
      "Curtis McMullen",
      "Shigefumi Mori",
      "David Mumford",
      "Ng\u00f4 B\u1ea3o Ch\u00e2u",
      "Andrei Okounkov",
      "Peter Scholze",
      "Stanislav Smirnov",
      "Terence Tao",
      "Maryna Viazovska",
      "C\u00e9dric Villani",
      "Wendelin Werner",
      "Efim Zelmanov",
    ],
    researchEventType: "Commentary",
    verificationStatus: "independently_verified",
    evidenceLevel: "E3",
    sourceTier: "S2",
    keyContributions: [
      "Frames the AI companies' benchmark-driven problem solving as a severe misalignment with mathematical values, not as progress for mathematics",
      "Solving problems is a tool and proxy for conceptual understanding; mass production of true/false statements could destroy fertile ground",
      "Flags rushed announcements: no time for writeups, method isolation or citation \u2014 attribution and plagiarism concerns",
      "Names students and ideas as the profession's most precious resources, dependent on a human transmission chain",
    ],
    verificationHistory: [
      {
        date: "2026-09-11",
        status: "independently_verified",
        evidenceLevel: "E3",
        note: "Full text, all 28 signatories and the Zenodo DOI fetched from mathandai.org on 2026-10-22; corroboration: Terence Tao's blog post of 2026-09-11. The status covers the publication event and its signatories; the declaration's assessments of AI companies' impact are the signatories' stated position, not independently verified facts.",
      },
    ],
    relatedWorks: [
      {
        title: "AHM Statement on OpenAI's October 6 Release of Mathematical Documents",
        url: "https://www.ahmath.org/statements",
        relation: "followup",
        note: "Organized community response echoing the declaration, October 2026",
      },
      {
        title: "Terence Tao's Math 2.0 lecture at Caltech",
        url: "https://terrytao.wordpress.com/2026/10/10/math-2-0/",
        relation: "related",
        note: "Constructive counter-proposal from one of the signatories",
      },
      {
        title: "OpenAI publishes 700+ mathematical manuscripts in a public Lean repository",
        url: "https://github.com/openai/math",
        relation: "related",
        note: "The release whose publication model the declaration opposes",
      },
    ],
    createdAt: "2026-10-22T00:00:00.000Z",
    updatedAt: "2026-10-22T00:00:00.000Z",
  },
  {
    id: "evt-ahm-statement-openai-release",
    title:
      "Association for Human Mathematics urges mathematicians to discontinue work with OpenAI",
    slug: "ahm-statement-openai-math-release",
    summary:
      "On 2026-10-07 the Association for Human Mathematics (Communications Working Group) published a statement on OpenAI's 2026-10-06 release of a repository of mathematical manuscripts, reposted the same day on Terence Tao's blog. The statement argues that mathematicians did not ask for this work, that OpenAI ignored the central premise of the Advisory Group on Mathematics and Artificial Intelligence (that frontier AI corporations should not test advanced mathematical problems on internal models), and that \u201Creleasing over 700 files at once is not a demonstration of scholarship, but a demonstration of power\u201D. It urges mathematicians and the public to view the publication model with due skepticism and to discontinue their work with OpenAI.",
    significance:
      "The sharpest organized-community response to the October 6 release: an explicit call to discontinue collaboration with a frontier lab, issued the day after the release and carried by a prominent independent venue (Tao's blog). It marks the visible split between the lab's benchmark-driven publication model and the community's norms \u2014 attribution, writeups, human understanding \u2014 and operationalizes the September Fields-medallists declaration.",
    problem:
      "A frontier lab released AI-generated mathematics at scale while bypassing the community's review, attribution and writeup norms.",
    date: "2026-10-07",
    sourceType: "blog",
    sourceUrl: "https://www.ahmath.org/statements",
    authors: ["Association for Human Mathematics \u2014 Communications Working Group"],
    institution: "Association for Human Mathematics",
    researchEventType: "Commentary",
    verificationStatus: "independently_verified",
    evidenceLevel: "E2",
    sourceTier: "S2",
    keyContributions: [
      "Rejects the premise that the October 6 release advances mathematics; calls it a demonstration of power, not scholarship",
      "Points to OpenAI's disregard of the Advisory Group on Mathematics and AI's central premise",
      "Urges mathematicians to discontinue work with OpenAI \u2014 the first explicit boycott call from an organized mathematical body",
    ],
    verificationHistory: [
      {
        date: "2026-10-07",
        status: "independently_verified",
        evidenceLevel: "E2",
        note: "Statement text fetched from ahmath.org/statements on 2026-10-22; repost verified on Tao's blog (2026-10-07). The status covers the publication of the statement; its allegations about OpenAI's conduct are the association's stated position.",
      },
    ],
    relatedWorks: [
      {
        title: "OpenAI publishes 700+ mathematical manuscripts in a public Lean repository",
        url: "https://github.com/openai/math",
        relation: "previous",
        note: "The 2026-10-06 release the statement responds to",
      },
      {
        title: "28 Fields Medal laureates publish \u201CA Severe Misalignment of AI in Mathematics\u201D",
        url: "https://mathandai.org/",
        relation: "previous",
        note: "The September declaration this response builds on",
      },
      {
        title: "AHM statement reposted on Terence Tao's blog",
        url: "https://terrytao.wordpress.com/2026/10/07/ahm-statement-on-openais-october-6-release-of-mathematical-documents/",
        relation: "related",
        note: "Independent venue carrying the full text",
      },
    ],
    createdAt: "2026-10-22T00:00:00.000Z",
    updatedAt: "2026-10-22T00:00:00.000Z",
  },
  {
    id: "evt-tao-math-2-0-caltech-lecture",
    title: "Terence Tao's Math 2.0 lecture: a vision for AI tools that sustain the mathematical community",
    slug: "tao-math-2-0-caltech-lecture",
    summary:
      "On the evening of 2026-10-09 Terence Tao gave the public lecture \u201CMath 2.0\u201D at Caltech (AIM Public Lecture Series; originally titled \u201CMachine Assisted Proof\u201D, planned over a year ago and scheduled for May before being postponed and substantially rewritten). He laid out three stages: \u201CMath 1.0\u201D, mathematics as it historically developed; the current state induced by the excessive emphasis on automated solving of open problems by AI; and a future \u201CMath 2.0\u201D in which AI tools are used to sustain both the internal mathematical community and the role that mathematical understanding plays in advancing and aligning applications of mathematics to the real world. Slides were posted on 2026-10-10 and the content folded into his living summary of views on AI.",
    significance:
      "The clearest constructive program from a leading mathematician in the AI era: where the September declaration names what is going wrong, Math 2.0 names what to build \u2014 AI-era infrastructure and workflows that sustain the community and understanding rather than replace them. The talk became the reference point for subsequent community infrastructure: SAIR's Open Math OS launched days later under the banner \u201CInfrastructure for Math 2.0\u201D.",
    problem:
      "Opposition to the benchmark race alone builds nothing; the community needs a positive vision of what AI-era mathematics should look like.",
    date: "2026-10-09",
    sourceType: "conference",
    sourceUrl: "https://terrytao.wordpress.com/2026/10/10/math-2-0/",
    papers: [
      {
        title: "Math 2.0 \u2014 Caltech AIM public lecture slides",
        url: "https://teorth.github.io/tao-web/slides/math-2-0-caltech-2026.pdf",
        year: 2026,
      },
    ],
    authors: ["Terence Tao"],
    institution: "California Institute of Technology (AIM Public Lecture Series)",
    researchEventType: "Commentary",
    verificationStatus: "independently_verified",
    evidenceLevel: "E3",
    sourceTier: "S2",
    keyContributions: [
      "Three-stage framing: Math 1.0, the current AI-disrupted state, and a community-sustaining Math 2.0",
      "Shifts the goal from automated problem solving to tools that sustain mathematicians and understanding",
      "Slides published and content merged into Tao's living summary of views on AI",
    ],
    verificationHistory: [
      {
        date: "2026-10-10",
        status: "independently_verified",
        evidenceLevel: "E3",
        note: "Lecture held 2026-10-09 evening (per the author's 2026-10-10 post); slides PDF and the Caltech event page linked from the post were verified on 2026-10-22. The vision described is the speaker's stated position.",
      },
    ],
    relatedWorks: [
      {
        title: "SAIR Open Math OS released",
        url: "https://terrytao.wordpress.com/2026/10/16/sair-open-math-os-released/",
        relation: "followup",
        note: "Platform launched days later as \u201CInfrastructure for Math 2.0\u201D",
      },
      {
        title: "28 Fields Medal laureates publish \u201CA Severe Misalignment of AI in Mathematics\u201D",
        url: "https://mathandai.org/",
        relation: "related",
        note: "The critical stance this constructive program answers",
      },
      {
        title: "Tao's living summary of his views on AI",
        url: "https://teorth.github.io/tao-web/ai-views.html",
        relation: "related",
        note: "Continuously updated write-up incorporating the lecture",
      },
    ],
    createdAt: "2026-10-22T00:00:00.000Z",
    updatedAt: "2026-10-22T00:00:00.000Z",
  },
  {
    id: "evt-sair-open-math-os-release",
    title: "SAIR Foundation soft-launches the Open Math OS for collaborative mathematics on open models",
    slug: "sair-open-math-os-release",
    summary:
      "On 2026-10-16 the SAIR Foundation soft-launched the Open Math OS (openmathmodel.org), a hosted research environment for collaborative mathematics built on open frontier models \u2014 at launch Kimi K3, DeepSeek V4.1 Flash, GLM 5.3 Flash, GLM 5.3 and Nemotron 3, described in the announcement as roughly a year behind closed frontier models. The platform offers team accounts whose members see each other's prompts, per-project cloud machines with Lean+Mathlib, SageMath, PARI/GP and SymPy preinstalled, parallel agent exploration of a single problem, and a data-sovereignty regime: private by default, training on user work only with explicit prior consent, and data rules set in public. The announcement credits donated compute and free accounts for academic institutions.",
    significance:
      "The first operational \u201CMath 2.0\u201D platform: rather than asking labs to change, the community gets its own infrastructure \u2014 open weights, community-controlled data, team-visible prompts that directly answer the declaration's attribution and process complaints. It is the concrete counter-offering to closed-lab AI-math products and a live test of whether open models can carry real collaborative research.",
    problem:
      "Mathematicians who distrust closed-lab AI products had no community-governed alternative: no open platform with shared prompts, consent-based data use and familiar formal-methods tooling.",
    date: "2026-10-16",
    sourceType: "blog",
    sourceUrl: "https://www.openmathmodel.org/",
    authors: ["SAIR Foundation"],
    institution: "SAIR Foundation",
    model: ["Kimi K3", "DeepSeek V4.1 Flash", "GLM 5.3 Flash", "GLM 5.3", "Nemotron 3"],
    researchEventType: "Infrastructure",
    verificationStatus: "partially_verified",
    evidenceLevel: "E3",
    sourceTier: "S2",
    keyContributions: [
      "Open frontier models under community data governance: private by default, consent before training, rules set in public",
      "Team accounts with mutually visible prompts \u2014 addressing the declaration's attribution and process concerns",
      "Per-project cloud machines with Lean+Mathlib, SageMath, PARI/GP preinstalled; donated compute and free academic accounts",
    ],
    verificationHistory: [
      {
        date: "2026-10-16",
        status: "partially_verified",
        evidenceLevel: "E3",
        note: "Platform live and feature list (model lineup, data-sovereignty terms, team accounts) fetched from openmathmodel.org on 2026-10-22, matching Terence Tao's same-day announcement. Capability claims remain publisher-reported; no independent benchmark of the hosted models was found.",
      },
    ],
    relatedWorks: [
      {
        title: "Terence Tao's Math 2.0 lecture at Caltech",
        url: "https://terrytao.wordpress.com/2026/10/10/math-2-0/",
        relation: "previous",
        note: "The vision this platform bills itself as infrastructure for",
      },
      {
        title: "SAIR Open Math OS released (announcement)",
        url: "https://terrytao.wordpress.com/2026/10/16/sair-open-math-os-released/",
        relation: "related",
        note: "Launch announcement with team accounts, donated compute and timeline details",
      },
    ],
    createdAt: "2026-10-22T00:00:00.000Z",
    updatedAt: "2026-10-22T00:00:00.000Z",
  },
  {
    id: "evt-simons-foundation-15m-ai-mathematics-effort",
    title: "Simons Foundation launches a $15M effort to help mathematicians navigate the AI era",
    slug: "simons-foundation-15m-ai-mathematics-effort",
    summary:
      "On 2026-10-15 the Simons Foundation announced a $15M effort to help mathematicians navigate the AI era, calling for workshops and other initiatives centered on mathematics in the age of AI (per the foundation's press release, relayed the same day by Terence Tao).",
    significance:
      "Large philanthropic money entering the AI4Math transition, weeks after the Fields-medallists declaration and the AHM statement: institutional funding now sits alongside community stance-taking and open infrastructure as a third pillar of the mathematical community's response.",
    problem:
      "The mathematical community's response to AI so far lacked organized funding for workshops, training and adaptation programs.",
    date: "2026-10-15",
    sourceType: "blog",
    sourceUrl:
      "https://www.simonsfoundation.org/news/simons-foundation-launches-15m-effort-to-help-mathematicians-navigate-ai-era/",
    authors: ["Simons Foundation"],
    institution: "Simons Foundation",
    researchEventType: "Commentary",
    verificationStatus: "claimed",
    evidenceLevel: "E2",
    sourceTier: "S2",
    keyContributions: [
      "$15M committed to initiatives centered on mathematics in the AI era",
      "Call for workshops and community programs, relayed by leading mathematicians",
    ],
    verificationHistory: [
      {
        date: "2026-10-15",
        status: "claimed",
        evidenceLevel: "E2",
        note: "Press release page and headline fetched 2026-10-22; program description relayed via Terence Tao's 2026-10-15 post. The full press-release body was not retrievable in this session, so details beyond \u201Cworkshops and other initiatives\u201D are deliberately not recorded.",
      },
    ],
    relatedWorks: [
      {
        title: "28 Fields Medal laureates publish \u201CA Severe Misalignment of AI in Mathematics\u201D",
        url: "https://mathandai.org/",
        relation: "related",
        note: "Community stance this funding response follows",
      },
      {
        title: "Simons Foundation press release (relay on Tao's blog)",
        url: "https://terrytao.wordpress.com/2026/10/15/simons-foundation-launches-15m-effort-to-help-mathematicians-navigate-ai-era/",
        relation: "related",
        note: "Same-day relay confirming the announcement",
      },
    ],
    createdAt: "2026-10-22T00:00:00.000Z",
    updatedAt: "2026-10-22T00:00:00.000Z",
  },
];

/**
 * The full curated dataset includes the hand-built core, verified expansion batches and ecosystem scenarios
 * expansion batches (each `expansion-*.ts` module is a set of events whose
 * source URLs were fetched and confirmed during curation). Automated pipeline
 * output is merged on top by `SeedStore` at request time and tagged
 * `provenance: "automated"`; these are all `provenance: "curated"`.
 */
/**
 * Ecosystem reclassification for already-verified events.
 *
 * These entries stay exactly as curated at the source level; only their
 * primary event class and type-specific metadata change. The former legacy
 * subtype is intentionally not retained as a Research subtype for these rows.
 */
const ecosystemOverrides: Partial<Record<string, Pick<ResearchEvent,
  "eventType" | "researchEventType" | "metadata"
>>> = {
  "tao-math-2-0-caltech-lecture": {
    eventType: "People",
    researchEventType: undefined,
    metadata: {
      people: [{
        name: "Terence Tao",
        role: "Mathematician",
        viewpoint: "Public lecture describing a Math 2.0 vision for AI tools that sustain the mathematical community; consult the linked original lecture post for exact wording.",
      }],
    },
  },
  "fields-medallists-misalignment-declaration": {
    eventType: "PolicyCommunity",
    researchEventType: undefined,
    metadata: {
      policy: {
        kind: "Open declaration",
        community: "Mathematical research community",
        issue: "AI companies' use of mathematical problem solving as a benchmark",
        participants: ["28 Fields Medal laureates"],
      },
    },
  },
  "ahm-statement-openai-math-release": {
    eventType: "PolicyCommunity",
    researchEventType: undefined,
    metadata: {
      policy: {
        kind: "Public statement",
        community: "Association for Human Mathematics and responding mathematical community",
        issue: "Continued collaboration with OpenAI following its mathematical-document release",
        participants: ["Association for Human Mathematics"],
      },
    },
  },
  "sair-open-math-os-release": {
    eventType: "Institutions",
    researchEventType: undefined,
    metadata: {
      initiatives: ["Open Math OS"],
      projects: ["Collaborative mathematical research on open frontier models"],
    },
  },
  "simons-foundation-15m-ai-mathematics-effort": {
    eventType: "Funding",
    researchEventType: undefined,
    metadata: {
      funding: {
        organization: "Simons Foundation",
        recipient: "Mathematicians and community programs responding to the AI era",
        amount: "15000000",
        currency: "USD",
        amountDisclosure: "Amount disclosed in the official announcement",
      },
    },
  },
};

/** Full dataset normalized to the six primary ecosystem event classes. */
export const events: ResearchEvent[] = [
  ...curatedEvents,
  ...llmReasoningBenchEvents,
  ...agentsAssistedEvents,
  ...theoremFormalEvents,
  ...symbolicGeometryDiscoveryEvents,
  ...ecosystemDemoEvents,
].map((event) =>
  normalizeEcosystemEvent({
    ...event,
    ...ecosystemOverrides[event.slug],
  })
);






