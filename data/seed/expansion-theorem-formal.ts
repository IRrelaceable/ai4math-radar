/**
 * Expansion seed: human-verified research events in Theorem Proving and
 * Formal Mathematics (2021-2024 milestones).
 *
 * Every URL in this file was fetched and content-checked one by one:
 * - arXiv abs pages (sourceUrl / paperUrl) via web_fetch,
 * - GitHub repos (githubUrl) via api.github.com (github.com HTML is not fetchable).
 * Fields that could not be verified from a fetched primary source are omitted
 * rather than guessed (e.g. several institutions are left out on purpose).
 */
import type { ResearchEvent } from "../../types";

export const events: ResearchEvent[] = [
  {
    id: "evt-tacticzero-learning-to-prove-from-scratch-deep-rl",
    title:
      "TacticZero: Learning to Prove Theorems from Scratch with Deep Reinforcement Learning",
    slug: "tacticzero-learning-to-prove-from-scratch-deep-rl",
    summary:
      "TacticZero is a deep reinforcement learning framework for interactive theorem proving in HOL4 that learns proof search strategies as well as tactic and argument prediction end-to-end, with a novel backtracking mechanism over sets of potential derivation paths.",
    significance:
      "An early demonstration that an RL agent can prove theorems from scratch — learning search rather than relying on fixed heuristics — and that it outperforms HOL4's existing automation (hammers) on unseen problems, opening the reinforcement-learning line of work in neural theorem proving.",
    problem:
      "Automated theorem proving relied on hand-engineered heuristics and supervised training on existing proof corpora, limiting the ability to prove novel goals from scratch.",
    date: "2021-02-19",
    researchArea: "Theorem Proving",
    subArea: "Proof search",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2102.09756",
    paperUrl: "https://arxiv.org/abs/2102.09756",
    papers: [
      {
        title:
          "TacticZero: Learning to Prove Theorems from Scratch with Deep Reinforcement Learning",
        url: "https://arxiv.org/abs/2102.09756",
        year: 2021,
      },
    ],
    authors: [
      "Minchao Wu",
      "Michael Norrish",
      "Christian Walder",
      "Amir Dezfouli",
    ],
    model: ["TacticZero"],
    keyContributions: [
      "End-to-end RL formulation of interactive theorem proving as an MDP in which each state is a set of potential derivation paths",
      "A backtracking mechanism that discards predicted dead-end derivations and restarts from promising alternatives",
      "Implemented in the HOL4 theorem prover; outperforms HOL4's built-in hammers on unseen problems",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-mathlib4-lean4-mathematics-library-created",
    title:
      "The mathlib4 repository is created as the Lean 4 mathematics library of the Lean prover community",
    slug: "mathlib4-lean4-mathematics-library-created",
    summary:
      "On 2021-05-09 the leanprover-community organization created the leanprover-community/mathlib4 repository, described as 'The math library of Lean 4', giving the community's formal mathematics library a dedicated home in the Lean 4 ecosystem (Apache-2.0, written in Lean).",
    significance:
      "Lean's math library is the shared corpus of machine-checked mathematics that the Lean 4 prover ecosystem builds on — later retrieval-augmented provers such as LeanDojo/ReProver were trained and evaluated on thousands of theorems extracted from it — so establishing its Lean 4 repository laid core infrastructure for formal mathematics and AI4Math on Lean.",
    problem:
      "The Lean community's mathematics library needed a dedicated Lean 4 repository as the ecosystem moved to the Lean 4 generation of the prover.",
    date: "2021-05-09",
    researchArea: "Formal Mathematics",
    subArea: "Formal corpora & libraries",
    sourceType: "github",
    sourceUrl: "https://api.github.com/repos/leanprover-community/mathlib4",
    githubUrl: "https://github.com/leanprover-community/mathlib4",
    authors: [],
    institution: "leanprover-community",
    keyContributions: [
      "Dedicated GitHub home for the Lean 4 math library, created 2021-05-09 under the leanprover-community organization",
      "Described by the organization as 'The math library of Lean 4', written in Lean and licensed Apache-2.0",
      "The central formal library that later Lean provers, benchmarks and formalization projects draw premises and training data from",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-autoformalization-with-large-language-models",
    title: "Autoformalization with Large Language Models",
    slug: "autoformalization-with-large-language-models",
    summary:
      "Wu et al. showed that large language models can autoformalize mathematical competition problems into Isabelle/HOL, perfectly translating 25.3% of them, and trained a neural theorem prover on these autoformalized theorems, setting a new state of the art on miniF2F (29.6% → 35.2%).",
    significance:
      "Launched LLM-based autoformalization as a practical research direction and demonstrated the data flywheel that now dominates the field: autoformalized statements can be fed back into prover training to raise benchmark performance.",
    problem:
      "Translating informal mathematics into proof-assistant specifications is a labor-intensive bottleneck, and neural provers starve without large corpora of formal statements.",
    date: "2022-05-25",
    researchArea: "Formal Mathematics",
    subArea: "Autoformalization",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2205.12615",
    paperUrl: "https://arxiv.org/abs/2205.12615",
    papers: [
      {
        title: "Autoformalization with Large Language Models",
        url: "https://arxiv.org/abs/2205.12615",
        year: 2022,
      },
    ],
    authors: [
      "Yuhuai Wu",
      "Albert Q. Jiang",
      "Wenda Li",
      "Markus N. Rabe",
      "Charles Staats",
      "Mateja Jamnik",
      "Christian Szegedy",
    ],
    benchmark: ["miniF2F"],
    dataset: ["Autoformalized competition problems in Isabelle/HOL"],
    keyContributions: [
      "LLMs correctly translate 25.3% of mathematical competition problems perfectly to Isabelle/HOL specifications",
      "A prover trained on autoformalized theorems set a new state of the art on miniF2F, improving the proof rate from 29.6% to 35.2%",
      "Established autoformalization as a scalable data-generation pipeline for neural theorem proving",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-baldur-whole-proof-generation-repair-llms",
    title: "Baldur: Whole-Proof Generation and Repair with Large Language Models",
    slug: "baldur-whole-proof-generation-repair-llms",
    summary:
      "Baldur uses LLMs fine-tuned on proofs to generate whole Isabelle/HOL proofs at once instead of step by step, and pairs the generation model with a repair model that conditions on a prior failed attempt and its error message.",
    significance:
      "Demonstrated for the first time that whole-proof generation is possible and as effective as search-based techniques without costly search: Baldur proved 8.7% of theorems beyond the state-of-the-art tool Thor, and together they prove 65.7% of a 6,336-theorem Isabelle/HOL benchmark fully automatically.",
    problem:
      "Step-by-step neural provers depend on expensive proof search, and whole-proof generation had not previously been shown to be competitive for formal verification.",
    date: "2023-03-08",
    researchArea: "Theorem Proving",
    subArea: "Proof search",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2303.04910",
    paperUrl: "https://arxiv.org/abs/2303.04910",
    papers: [
      {
        title:
          "Baldur: Whole-Proof Generation and Repair with Large Language Models",
        url: "https://arxiv.org/abs/2303.04910",
        year: 2023,
      },
    ],
    authors: [
      "Emily First",
      "Markus N. Rabe",
      "Talia Ringer",
      "Yuriy Brun",
    ],
    model: ["Baldur (generation + repair models)"],
    benchmark: ["Isabelle/HOL benchmark (6,336 theorems)"],
    dataset: ["Isabelle/HOL theorems and proofs (6,336 theorems)"],
    keyContributions: [
      "First demonstration that whole-proof generation with transformers is possible and as effective as search-based techniques",
      "Proof repair conditioned on a prior failed proof attempt and the ensuing error message",
      "New state of the art for fully automated proof synthesis: +8.7% over Thor; 65.7% combined with Thor",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-magnushammer-transformer-premise-selection",
    title: "Magnushammer: A Transformer-Based Approach to Premise Selection",
    slug: "magnushammer-transformer-premise-selection",
    summary:
      "Magnushammer replaces Sledgehammer's engineered premise selection with a contrastively trained transformer, scoring 59.5% vs 38.3% (Sledgehammer) on PISA and 34.0% vs 20.9% on miniF2F, and lifts a combined language-model prover from 57.0% to 71.0% on PISA using 4x fewer parameters.",
    significance:
      "Showed that learned premise selection outperforms one of the most widely used automation tools in interactive theorem proving, and released the largest premise selection dataset then available — the first one for the Isabelle proof assistant.",
    problem:
      "Premise selection in interactive theorem proving long relied on symbolic methods requiring extensive domain knowledge and engineering effort.",
    date: "2023-03-08",
    researchArea: "Theorem Proving",
    subArea: "Prover tooling & interaction",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2303.04488",
    paperUrl: "https://arxiv.org/abs/2303.04488",
    papers: [
      {
        title: "Magnushammer: A Transformer-Based Approach to Premise Selection",
        url: "https://arxiv.org/abs/2303.04488",
        venue: "ICLR 2024",
        year: 2024,
      },
    ],
    authors: [
      "Maciej Mikuła",
      "Szymon Tworkowski",
      "Szymon Antoniak",
      "Bartosz Piotrowski",
      "Albert Qiaochu Jiang",
      "Jin Peng Zhou",
      "Christian Szegedy",
      "Łukasz Kuciński",
      "Piotr Miłoś",
      "Yuhuai Wu",
    ],
    model: ["Magnushammer"],
    benchmark: ["PISA", "miniF2F"],
    dataset: [
      "Premise selection dataset of (proof state, relevant premise) pairs — the first for Isabelle",
    ],
    keyContributions: [
      "Contrastively trained transformer premise selection that outperforms Sledgehammer on PISA (59.5% vs 38.3%) and miniF2F (34.0% vs 20.9%)",
      "Combined with an LM-based prover, improves the state of the art on PISA from 57.0% to 71.0% with 4x fewer parameters",
      "Open-sourced the largest available premise selection dataset and the first one for Isabelle",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-machine-learned-premise-selection-for-lean",
    title: "Machine-Learned Premise Selection for Lean",
    slug: "machine-learned-premise-selection-for-lean",
    summary:
      "Piotrowski, Fernández Mir and Ayers introduced a lightweight random-forest premise selector implemented directly in Lean 4 using its metaprogramming features, trained online on data extracted from mathlib and exposed to users as the suggest_premises tactic.",
    significance:
      "Brought machine-learned premise selection inside the proof assistant itself: because the model is implemented and trained natively in Lean, users get fast, install-free premise suggestions interactively while constructing proofs, instead of depending on heavyweight external services.",
    problem:
      "Proving theorems in a large library requires sifting through thousands of candidate premises, and existing machine-learning approaches were poorly integrated into the interactive proving workflow.",
    date: "2023-03-17",
    researchArea: "Formal Mathematics",
    subArea: "Proof assistant tooling",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2304.00994",
    paperUrl: "https://arxiv.org/abs/2304.00994",
    papers: [
      {
        title: "Machine-Learned Premise Selection for Lean",
        url: "https://arxiv.org/abs/2304.00994",
        year: 2023,
      },
    ],
    authors: [
      "Bartosz Piotrowski",
      "Ramon Fernández Mir",
      "Edward Ayers",
    ],
    model: ["Random forest (trained online)"],
    dataset: ["mathlib"],
    keyContributions: [
      "Custom random forest implemented directly in Lean 4 via its rich metaprogramming features",
      "Online training on data extracted from mathlib, Lean's mathematics library",
      "suggest_premises tactic callable from the editor during interactive proof construction",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-lego-prover-growing-skill-library",
    title: "LEGO-Prover: Neural Theorem Proving with Growing Libraries",
    slug: "lego-prover-growing-skill-library",
    summary:
      "LEGO-Prover augments LLM theorem proving with a growing skill library of verified lemmas: it retrieves existing skills, creates new ones during proving, and evolves them so proofs are built modularly from reusable components.",
    significance:
      "Advanced the state of the art on miniF2F at the time (valid 48.0% → 57.0%, test 45.5% → 47.1%) and generated over 20,000 skills, showing provers can grow their own reusable lemma libraries rather than assuming a fixed theorem library.",
    problem:
      "Prior LLM provers assume a fixed theorem library during the whole proving process and struggle even with middle-school-level theorems, while creating new useful lemmas is crucial for advancing mathematics.",
    date: "2023-10-01",
    researchArea: "Theorem Proving",
    subArea: "Agent-based proving",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2310.00656",
    paperUrl: "https://arxiv.org/abs/2310.00656",
    papers: [
      {
        title: "LEGO-Prover: Neural Theorem Proving with Growing Libraries",
        url: "https://arxiv.org/abs/2310.00656",
        year: 2023,
      },
    ],
    authors: [
      "Haiming Wang",
      "Huajian Xin",
      "Chuanyang Zheng",
      "Lin Li",
      "Zhengying Liu",
      "Qingxing Cao",
      "Yinya Huang",
      "Jing Xiong",
      "Han Shi",
      "Enze Xie",
      "Jian Yin",
      "Zhenguo Li",
      "Heng Liao",
      "Xiaodan Liang",
    ],
    model: ["LEGO-Prover"],
    benchmark: ["miniF2F-valid", "miniF2F-test"],
    dataset: ["Growing skill library (over 20,000 generated theorems/lemmas)"],
    keyContributions: [
      "Modular proof construction that retrieves and composes verified skills from a growing library",
      "Skills further evolved by prompting an LLM to enrich the library at another scale",
      "State-of-the-art miniF2F pass rates at the time; ablations show newly added skills lift success from 47.1% to 50.4%",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-copra-in-context-learning-agent-formal-theorem-proving",
    title: "An In-Context Learning Agent for Formal Theorem-Proving",
    slug: "copra-in-context-learning-agent-formal-theorem-proving",
    summary:
      "COPRA repeatedly asks GPT-4 to propose tactic applications inside a stateful backtracking search in Lean and Coq, feeding execution feedback, search-history information and retrieved lemmas back into the prompt — without any fine-tuning.",
    significance:
      "Showed that a prompting-only in-context agent can compete with (and on pass@1 beat) fine-tuned provers: on miniF2F for Lean it outperforms the fine-tuned ReProver, and it also handles Coq tasks from CompCert, pointing toward cross-assistant generality.",
    problem:
      "State-of-the-art theorem proving models are fine-tuned on environment-specific proof data, which is costly to produce and ties each model to a single proof assistant.",
    date: "2023-10-06",
    researchArea: "Theorem Proving",
    subArea: "Agent-based proving",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2310.04353",
    paperUrl: "https://arxiv.org/abs/2310.04353",
    githubUrl: "https://github.com/trishullab/copra",
    papers: [
      {
        title: "An In-Context Learning Agent for Formal Theorem-Proving",
        url: "https://arxiv.org/abs/2310.04353",
        year: 2023,
      },
    ],
    authors: [
      "Amitayush Thakur",
      "George Tsoukalas",
      "Yeming Wen",
      "Jimmy Xin",
      "Swarat Chaudhuri",
    ],
    model: ["COPRA", "GPT-4"],
    benchmark: ["miniF2F (Lean)", "CompCert tasks (Coq)"],
    keyContributions: [
      "In-context learning prover driven by a general-purpose LLM (GPT-4) with no fine-tuning",
      "Stateful backtracking search that feeds execution feedback, search history and retrieved lemmas into each prompt",
      "Outperforms the fine-tuned ReProver on miniF2F in terms of pass@1; evaluated on both Lean and Coq",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-lean-copilot-llm-copilots-for-lean",
    title: "Lean Copilot: Large Language Models as Copilots for Theorem Proving in Lean",
    slug: "lean-copilot-llm-copilots-for-lean",
    summary:
      "Lean Copilot is a general framework for running LLM inference natively in Lean, letting users build proof-automation tools that suggest proof steps, complete proof goals and select relevant premises with pretrained or user-supplied models running locally or in the cloud.",
    significance:
      "On the Mathematics in Lean textbook, human-in-the-loop proving with Lean Copilot needed only 2.08 manually entered proof steps on average (3.86 for the rule-based aesop automation), and it automated 74.2% of proof steps versus 40.1% for aesop — concrete evidence that LLM copilots accelerate real formalization work rather than only autonomous benchmarks.",
    problem:
      "Existing neural theorem provers are pretrained on fixed corpora and struggle to prove novel theorems in fully autonomous mode, where human insight may be critical; meanwhile LLMs were hard to integrate into Lean's interactive workflow.",
    date: "2024-04-18",
    researchArea: "Theorem Proving",
    subArea: "Prover tooling & interaction",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2404.12534",
    paperUrl: "https://arxiv.org/abs/2404.12534",
    githubUrl: "https://github.com/lean-dojo/LeanCopilot",
    papers: [
      {
        title:
          "Lean Copilot: Large Language Models as Copilots for Theorem Proving in Lean",
        url: "https://arxiv.org/abs/2404.12534",
        venue: "NeuS 2025",
        year: 2025,
      },
    ],
    authors: ["Peiyang Song", "Kaiyu Yang", "Anima Anandkumar"],
    model: ["Lean Copilot"],
    benchmark: ["Mathematics in Lean textbook"],
    keyContributions: [
      "General framework for running LLM inference natively inside Lean",
      "LLM-based tools for step suggestion, goal completion and premise selection, with local (CPU/GPU) or cloud models",
      "Averages 2.08 manual steps versus 3.86 for aesop when assisting humans, and automates 74.2% of proof steps versus 40.1% for aesop",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-lean-workbook-large-scale-lean-problem-set",
    title:
      "Lean Workbook: A large-scale Lean problem set formalized from natural language math problems",
    slug: "lean-workbook-large-scale-lean-problem-set",
    summary:
      "InternLM released Lean Workbook, built with a pipeline that iteratively generates and filters synthetic data translating natural-language math problems into Lean 4 statements and vice versa; the final dataset contains about 57K formal-informal question pairs with proofs searched from a math contest forum, plus 21 new IMO questions.",
    significance:
      "Directly attacked the scarcity of formal-language training data — the bottleneck the paper names for LLM theorem proving in Lean — with an open, large-scale formal-informal dataset that later prover work (e.g. InternLM2.5-StepProver, Goedel-Prover) used as shared training and evaluation material.",
    problem:
      "Large language models are weak at theorem proving in formal languages like Lean, largely because training data in these languages is scarce.",
    date: "2024-06-06",
    researchArea: "Formal Mathematics",
    subArea: "Formal corpora & libraries",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2406.03847",
    paperUrl: "https://arxiv.org/abs/2406.03847",
    githubUrl: "https://github.com/InternLM/InternLM-Math",
    papers: [
      {
        title:
          "Lean Workbook: A large-scale Lean problem set formalized from natural language math problems",
        url: "https://arxiv.org/abs/2406.03847",
        year: 2024,
      },
    ],
    authors: [
      "Huaiyuan Ying",
      "Zijian Wu",
      "Yihan Geng",
      "Zheng Yuan",
      "Dahua Lin",
      "Kai Chen",
    ],
    institution: "InternLM",
    dataset: [
      "Lean Workbook (~57K formal-informal question pairs)",
      "21 new IMO questions",
    ],
    keyContributions: [
      "Iterative synthetic-data pipeline that translates natural-language math problems into Lean 4 statements and back, with filtering",
      "About 57K formal-informal question pairs plus proofs searched from a math contest forum and 21 new IMO questions",
      "Open-sourced code (InternLM/InternLM-Math) and data (InternLM/Lean-Workbook on Hugging Face)",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-coqpilot-llm-based-coq-proof-generation-plugin",
    title: "CoqPilot, a plugin for LLM-based generation of proofs",
    slug: "coqpilot-llm-based-coq-proof-generation-plugin",
    summary:
      "CoqPilot is a VS Code extension for Coq that collects proof holes marked with the admit tactic, combines LLMs with non-machine-learning methods to generate proof candidates, checks each candidate against the proof assistant, and replaces the hole when a candidate succeeds.",
    significance:
      "Gave the Coq ecosystem an integrated, zero-setup LLM proof-completion tool with a built-in benchmarking system for comparing Coq generation methods — an important counterweight to the Lean-centric tooling of the era (published at the ASE 2024 Tool Demonstrations Track).",
    problem:
      "Experimenting with LLM-based Coq proof generation requires gluing together models, classical automation and the proof checker, a setup every research group had to rebuild from scratch.",
    date: "2024-10-25",
    researchArea: "Formal Mathematics",
    subArea: "Proof assistant tooling",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2410.19605",
    paperUrl: "https://arxiv.org/abs/2410.19605",
    githubUrl: "https://github.com/JetBrains-Research/coqpilot",
    papers: [
      {
        title: "CoqPilot, a plugin for LLM-based generation of proofs",
        url: "https://arxiv.org/abs/2410.19605",
        venue: "ASE 2024 (Tool Demonstrations Track)",
        year: 2024,
      },
    ],
    authors: [
      "Andrei Kozyrev",
      "Gleb Solovev",
      "Nikita Khramov",
      "Anton Podkopaev",
    ],
    institution: "JetBrains Research",
    model: ["CoqPilot"],
    keyContributions: [
      "VS Code extension that fills admit holes by combining LLMs with non-ML proof generation methods",
      "Every generated candidate is checked by Coq before it replaces a hole",
      "Ships a benchmarking system for Coq proof generation methods, used in a published experiment",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
];

