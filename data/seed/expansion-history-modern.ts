/**
 * Historical backfill: the machine-learning turn in formal mathematics,
 * 2004-2020.
 *
 * Each entry is anchored to its arXiv abs page, publisher DOI or repository
 * API record, all checked while compiling this file. Titles, authors and
 * submission dates are taken from those records; no result numbers are added
 * beyond what the abstract states.
 */
import type { ResearchEvent } from "../../types";

const t = "2026-10-29T00:00:00.000Z";

export const events: ResearchEvent[] = [
  {
    id: "evt-mptp-mizar-atp-benchmark",
    title: "MPTP turns the Mizar library into a large-theory benchmark for ATP",
    slug: "mptp-mizar-large-theory-benchmark",
    summary:
      "Josef Urban's MPTP translated the Mizar Mathematical Library into TPTP problems and paired it with machine-learned premise selection, giving automated theorem provers a large, noisy theory to reason in; the Journal of Automated Reasoning paper reported the design and first experiments in 2004.",
    significance:
      "Turned a real formal library into an ATP benchmark and established premise selection as a core problem for large-theory proving.",
    problem:
      "ATPs could not scale to libraries with tens of thousands of theorems because the available axiom set was too large.",
    date: "2004-10-01",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Proof search",
    sourceType: "conference",
    sourceUrl: "https://doi.org/10.1007/s10817-004-6245-1",
    paperUrl: "https://doi.org/10.1007/s10817-004-6245-1",
    papers: [
      {
        title: "MPTP – Motivation, Implementation, First Experiments",
        url: "https://doi.org/10.1007/s10817-004-6245-1",
        venue: "Journal of Automated Reasoning",
        year: 2004,
      },
    ],
    authors: ["Josef Urban"],
    institution: "Charles University, Prague",
    researchEventType: "Benchmark",
    evidenceLevel: "E2",
    keyContributions: [
      "Translated Mizar into TPTP format for ATP use",
      "Machine-learned premise selection for large theories",
      "First experiments on large-theory proving from Mizar",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-malarea-learning-reasoning-loop",
    title: "MaLARea: a learning–reasoning loop for large theories",
    slug: "malarea-learning-reasoning-loop",
    summary:
      "MaLARea (2008) combined machine-learned premise selection with ATP search and fed newly found proofs back into training, iterating the loop on large-theory Mizar problems.",
    significance:
      "Showed that learning and deduction can improve each other in a loop, an idea later central to hammer systems and neural provers.",
    problem:
      "Premise-selection models were trained once on static data; proofs discovered later were not reused.",
    date: "2008-01-01",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Proof search",
    sourceType: "conference",
    sourceUrl: "https://ceur-ws.org/Vol-257/05_Urban.pdf",
    paperUrl: "https://ceur-ws.org/Vol-257/05_Urban.pdf",
    papers: [
      {
        title: "MaLARea: a metasystem for automated reasoning in large theories",
        url: "https://ceur-ws.org/Vol-257/05_Urban.pdf",
        venue: "LPAR 2008 Workshops, CEUR Workshop Proceedings 257",
        year: 2008,
      },
    ],
    authors: ["Josef Urban"],
    institution: "Charles University, Prague",
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "Learned premise selection from Mizar proofs",
      "Iterated ATP proving and retraining",
      "Evaluated the loop on large-theory Mizar problems",
    ],
    relatedWorks: [
      {
        title: "MPTP turns the Mizar library into a large-theory benchmark for ATP",
        relation: "previous",
      },
    ],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-sledgehammer-judgement-day",
    title: "Sledgehammer brings strong automation into everyday Isabelle proofs",
    slug: "sledgehammer-isabelle-automation",
    summary:
      "Böhme and Nipkow's 2010 ITP paper evaluated Sledgehammer, Isabelle's bridge from interactive goals to external ATPs, showing that relevance filtering and parallel provers made one-click automation effective on Isabelle proof obligations.",
    significance:
      "Brought large-theory ATP into everyday interactive proving and made hammers a standard component of proof assistants.",
    problem:
      "Interactive proofs contain goals that are tedious but within ATP reach, yet invoking ATPs manually with the full theory does not scale.",
    date: "2010-07-01",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Prover tooling & interaction",
    sourceType: "conference",
    sourceUrl: "https://doi.org/10.1007/978-3-642-14203-1_9",
    paperUrl: "https://doi.org/10.1007/978-3-642-14203-1_9",
    papers: [
      {
        title: "Sledgehammer: Judgement Day",
        url: "https://doi.org/10.1007/978-3-642-14203-1_9",
        venue: "ITP 2010",
        year: 2010,
      },
    ],
    authors: ["Sascha Böhme", "Tobias Nipkow"],
    institution: "Technische Universität München",
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "Relevance filtering to select facts for ATPs",
      "Parallel invocation of multiple ATPs",
      "Evaluation of success rates on Isabelle proof obligations",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-odd-order-theorem-coq",
    title: "A machine-checked proof of the Odd Order Theorem in Coq",
    slug: "odd-order-theorem-coq-formalization",
    summary:
      "Gonthier and collaborators completed a Coq formalization of the Feit–Thompson Odd Order Theorem, presented at ITP 2012, covering the whole proof of a landmark group-theory result.",
    significance:
      "Demonstrated that a large, difficult research proof could be formalized end-to-end, and pushed Coq's library and engineering practices to research scale.",
    problem:
      "The Feit–Thompson proof spans hundreds of pages and many interacting algebraic structures; no machine-checked version existed.",
    date: "2012-08-01",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Formal corpora & libraries",
    sourceType: "conference",
    sourceUrl: "https://doi.org/10.1007/978-3-642-39634-2_14",
    paperUrl: "https://doi.org/10.1007/978-3-642-39634-2_14",
    papers: [
      {
        title: "A Machine-Checked Proof of the Odd Order Theorem",
        url: "https://doi.org/10.1007/978-3-642-39634-2_14",
        venue: "ITP 2012",
        year: 2012,
      },
    ],
    authors: [
      "Georges Gonthier",
      "Andrea Asperti",
      "Jeremy Avigad",
      "Yves Bertot",
      "Cyril Cohen",
      "François Garillot",
      "Stéphane Le Roux",
      "Assia Mahboubi",
      "Russell O'Connor",
      "Sidi Ould Biha",
      "Ioana Pasca",
      "Laurence Rideau",
      "Alexey Solovyev",
      "Enrico Tassi",
      "Laurent Théry",
    ],
    researchEventType: "Formalization",
    evidenceLevel: "E2",
    keyContributions: [
      "End-to-end Coq formalization of the Feit–Thompson theorem",
      "Large-scope library engineering for group theory",
      "Demonstrated research-scale formalization in a proof assistant",
    ],
    relatedWorks: [
      {
        title: "A formal proof of the Kepler conjecture",
        relation: "followup",
      },
    ],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-lean-repository-public",
    title: "Lean's theorem prover repository goes public",
    slug: "lean-theorem-prover-repository",
    summary:
      "On 2013-07-17 the leanprover/lean3 repository was created, making Leonardo de Moura's Lean theorem prover available as an open project; Lean was described at CADE 2015 as a dependently typed prover aimed at verification and mathematics.",
    significance:
      "Introduced the prover that, with mathlib and later AI provers, became the main platform for machine-checked mathematics and neural theorem proving.",
    problem:
      "Existing provers offered either expressive dependent types or practical automation and metaprogramming; Lean aimed to combine them.",
    date: "2013-07-17",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Proof assistant tooling",
    sourceType: "github",
    sourceUrl: "https://api.github.com/repos/leanprover/lean3",
    githubUrl: "https://github.com/leanprover/lean3",
    paperUrl: "https://doi.org/10.1007/978-3-319-21401-6_26",
    papers: [
      {
        title: "The Lean Theorem Prover (System Description)",
        url: "https://doi.org/10.1007/978-3-319-21401-6_26",
        venue: "CADE-25",
        year: 2015,
      },
    ],
    authors: [
      "Leonardo de Moura",
      "Soonho Kong",
      "Jeremy Avigad",
      "Floris van Doorn",
      "Jakob von Raumer",
    ],
    institution: "Microsoft Research",
    researchEventType: "System",
    evidenceLevel: "E1",
    keyContributions: [
      "Public Lean repository created on 2013-07-17",
      "Dependently typed prover with metaprogramming",
      "System description published at CADE 2015",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-holyhammer-hol-light",
    title: "HOL(y)Hammer brings ATP automation to HOL Light",
    slug: "holyhammer-hol-light-atp-service",
    summary:
      "HOL(y)Hammer combined premise selection with external ATPs to prove HOL Light goals and was deployed as an online service; the 2013 paper reported its architecture and evaluation.",
    significance:
      "Extended the hammer approach to HOL Light and showed that learned premise selection could make large-theory automation practical outside Isabelle.",
    problem:
      "HOL Light's library was growing beyond what unselective ATP invocation could handle.",
    date: "2013-09-19",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Prover tooling & interaction",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/1309.4962",
    paperUrl: "https://arxiv.org/abs/1309.4962",
    papers: [
      {
        title: "HOL(y)Hammer: Online ATP Service for HOL Light",
        url: "https://arxiv.org/abs/1309.4962",
        year: 2013,
      },
    ],
    authors: ["Cezary Kaliszyk", "Josef Urban"],
    institution: "University of Innsbruck",
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "Premise selection for HOL Light goals",
      "External ATP invocation with proof reconstruction",
      "Online hammer service for HOL Light users",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-mizar-40-hammer",
    title: "MizAR 40: a hammer for the Mizar proof assistant",
    slug: "mizar-40-hammer",
    summary:
      "MizAR 40 connected Mizar to external ATPs with premise selection and proof reconstruction, allowing Mizar users to discharge goals automatically; the 2013 paper reported its performance on the Mizar library.",
    significance:
      "Brought hammer-style automation to Mizar, complementing its proof checker with ATP search.",
    problem:
      "Mizar proofs were checked but not automatically found; users needed ATP assistance integrated with Mizar's semantics.",
    date: "2013-10-10",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Prover tooling & interaction",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/1310.2805",
    paperUrl: "https://arxiv.org/abs/1310.2805",
    papers: [
      {
        title: "MizAR 40 for Mizar 40",
        url: "https://arxiv.org/abs/1310.2805",
        year: 2013,
      },
    ],
    authors: ["Cezary Kaliszyk", "Josef Urban"],
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "ATP integration for Mizar goals",
      "Premise selection over the Mizar library",
      "Proof reconstruction inside Mizar",
    ],
    relatedWorks: [
      {
        title: "MPTP turns the Mizar library into a large-theory benchmark for ATP",
        relation: "previous",
      },
    ],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-flyspeck-formal-proof",
    title: "A formal proof of the Kepler conjecture completes the Flyspeck project",
    slug: "flyspeck-kepler-conjecture-formal-proof",
    summary:
      "Hales and collaborators published a formal proof of the Kepler conjecture in HOL Light and Isabelle, completing the Flyspeck project; the 2015 paper describes the formalization and its verification.",
    significance:
      "One of the largest formalizations of a major research theorem, showing that proof assistants can check a proof whose original refereeing was itself controversial.",
    problem:
      "The original Kepler proof relied on extensive computer calculation and was difficult for referees to check; a machine-checked proof was needed.",
    date: "2015-01-09",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Formal corpora & libraries",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/1501.02155",
    paperUrl: "https://arxiv.org/abs/1501.02155",
    papers: [
      {
        title: "A formal proof of the Kepler conjecture",
        url: "https://arxiv.org/abs/1501.02155",
        year: 2015,
      },
    ],
    authors: [
      "Thomas Hales",
      "Mark Adams",
      "Gertrud Bauer",
      "Dat Tat Dang",
      "John Harrison",
      "Truong Le Hoang",
      "Cezary Kaliszyk",
      "Victor Magron",
      "Sean McLaughlin",
      "Thang Tat Nguyen",
      "Truong Quang Nguyen",
      "Tobias Nipkow",
      "Steven Obua",
      "Joseph Pleso",
      "Jason Rute",
      "Alexey Solovyev",
      "An Hoai Thi Ta",
      "Trung Nam Tran",
      "Diep Thi Trieu",
      "Josef Urban",
      "Ky Khac Vu",
      "Roland Zumkeller",
    ],
    researchEventType: "Formalization",
    evidenceLevel: "E2",
    keyContributions: [
      "Complete formal proof of the Kepler conjecture",
      "Formalization split across HOL Light and Isabelle",
      "Machine-checked verification of a computation-heavy proof",
    ],
    relatedWorks: [
      {
        title: "A machine-checked proof of the Odd Order Theorem in Coq",
        relation: "related",
      },
    ],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-deepmath-premise-selection",
    title: "DeepMath applies deep sequence models to premise selection",
    slug: "deepmath-deep-sequence-models-premise-selection",
    summary:
      "Alemi, Chollet, Een, Irving, Szegedy and Urban trained deep sequence models on the Mizar library to select premises, improving over prior feature-based selection and giving ATPs smaller, more relevant axiom sets.",
    significance:
      "Brought modern deep learning to formal premise selection and set a strong baseline for neural methods on large formal corpora.",
    problem:
      "Premise selection from tens of thousands of Mizar facts was dominated by hand-engineered features.",
    date: "2016-06-14",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Proof search",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/1606.04442",
    paperUrl: "https://arxiv.org/abs/1606.04442",
    papers: [
      {
        title: "DeepMath - Deep Sequence Models for Premise Selection",
        url: "https://arxiv.org/abs/1606.04442",
        year: 2016,
      },
    ],
    authors: [
      "Alex A. Alemi",
      "Francois Chollet",
      "Niklas Een",
      "Geoffrey Irving",
      "Christian Szegedy",
      "Josef Urban",
    ],
    institution: "Google Brain; Charles University",
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "Deep sequence models for premise selection",
      "Evaluation on the Mizar library",
      "Strong baseline for neural large-theory proving",
    ],
    relatedWorks: [
      {
        title: "MPTP turns the Mizar library into a large-theory benchmark for ATP",
        relation: "previous",
      },
    ],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-holophrasm-neural-atp",
    title: "Holophrasm: a neural automated theorem prover for higher-order logic",
    slug: "holophrasm-neural-higher-order-prover",
    summary:
      "Whalen's Holophrasm used a neural network to guide proof search in HOL4, learning from the HOL4 library and proving theorems in higher-order logic.",
    significance:
      "An early end-to-end neural prover for a higher-order proof assistant, extending neural proving beyond first-order ATP.",
    problem:
      "Neural provers had mostly targeted first-order or Metamath settings; higher-order interactive provers posed richer state and action spaces.",
    date: "2016-08-08",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Proof search",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/1608.02644",
    paperUrl: "https://arxiv.org/abs/1608.02644",
    papers: [
      {
        title: "Holophrasm: a neural Automated Theorem Prover for higher-order logic",
        url: "https://arxiv.org/abs/1608.02644",
        year: 2016,
      },
    ],
    authors: ["Daniel Whalen"],
    institution: "University of Washington",
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "Neural guidance for HOL4 proof search",
      "Learning from the HOL4 library",
      "Early neural prover for higher-order logic",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-semantic-parsing-mathematics",
    title: "Learning to translate informal mathematics into formal statements",
    slug: "semantic-parsing-mathematics-aligned-corpora",
    summary:
      "Kaliszyk, Urban and Vyskočil learned to translate natural-language mathematical statements into formal ones using aligned corpora, and used theorem proving to improve the translation.",
    significance:
      "An early autoformalization pipeline that coupled learning from aligned examples with prover feedback, anticipating later LLM-based autoformalization.",
    problem:
      "Formal and informal mathematics were not aligned at scale, so translation had to be learned from scarce paired data.",
    date: "2016-11-29",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Autoformalization",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/1611.09703",
    paperUrl: "https://arxiv.org/abs/1611.09703",
    papers: [
      {
        title:
          "Semantic Parsing of Mathematics by Context-based Learning from Aligned Corpora and Theorem Proving",
        url: "https://arxiv.org/abs/1611.09703",
        year: 2016,
      },
    ],
    authors: ["Cezary Kaliszyk", "Josef Urban", "Jiří Vyskočil"],
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "Context-based learning from aligned informal–formal corpora",
      "Theorem proving as a signal for translation quality",
      "Early learned autoformalization pipeline",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-deep-network-guided-proof-search",
    title: "Deep network guided proof search for first-order ATP",
    slug: "deep-network-guided-proof-search",
    summary:
      "Loos, Irving, Szegedy and Kaliszyk used a deep network to guide the clause-selection loop of an ATP, learning from successful proofs and improving on the prover's default heuristics.",
    significance:
      "Showed that learned guidance could improve a traditional first-order ATP without replacing it, a hybrid pattern that recurred in later systems.",
    problem:
      "ATP heuristics were fixed and did not adapt to the problem distribution.",
    date: "2017-01-24",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Proof search",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/1701.06972",
    paperUrl: "https://arxiv.org/abs/1701.06972",
    papers: [
      {
        title: "Deep Network Guided Proof Search",
        url: "https://arxiv.org/abs/1701.06972",
        year: 2017,
      },
    ],
    authors: [
      "Sarah Loos",
      "Geoffrey Irving",
      "Christian Szegedy",
      "Cezary Kaliszyk",
    ],
    institution: "Google Brain; University of Innsbruck",
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "Deep-network guidance for clause selection",
      "Learning from successful ATP proofs",
      "Hybrid learned search inside a traditional prover",
    ],
    relatedWorks: [
      {
        title: "DeepMath applies deep sequence models to premise selection",
        relation: "previous",
      },
    ],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-holstep-dataset",
    title: "HolStep: a machine-learning dataset for HOL Light theorem proving",
    slug: "holstep-hol-light-dataset",
    summary:
      "Kaliszyk, Chollet and Szegedy released HolStep, a dataset of HOL Light proof steps annotated as useful or not, to support learning-guided theorem proving.",
    significance:
      "Provided one of the first large, curated datasets for learning inside a higher-order proof assistant.",
    problem:
      "Neural proving in HOL Light lacked a standard dataset of intermediate proof states and useful lemmas.",
    date: "2017-03-01",
    researchArea: "Benchmarks & Datasets",
    subArea: "Formal proving benchmarks",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/1703.00426",
    paperUrl: "https://arxiv.org/abs/1703.00426",
    papers: [
      {
        title: "HolStep: A Machine Learning Dataset for Higher-order Logic Theorem Proving",
        url: "https://arxiv.org/abs/1703.00426",
        year: 2017,
      },
    ],
    authors: ["Cezary Kaliszyk", "François Chollet", "Christian Szegedy"],
    institution: "University of Innsbruck; Google Brain",
    researchEventType: "Dataset",
    evidenceLevel: "E2",
    keyContributions: [
      "Annotated HOL Light proof-step dataset",
      "Useful/not-useful labels for learned premise selection",
      "Shared benchmark for higher-order neural proving",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-mathlib-created",
    title: "mathlib: a unified mathematical library for Lean",
    slug: "mathlib-lean-mathematics-library",
    summary:
      "The leanprover-community/mathlib repository was created on 2017-07-21, giving Lean 3 a community-maintained library of formal mathematics that grew into the standard corpus for Lean-based proving and AI4Math.",
    significance:
      "Became the shared formal mathematics corpus for Lean and the training and evaluation ground for later neural provers.",
    problem:
      "Lean's mathematical content was fragmented; the community needed one library with consistent conventions.",
    date: "2017-07-21",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Formal corpora & libraries",
    sourceType: "github",
    sourceUrl: "https://api.github.com/repos/leanprover-community/mathlib3",
    githubUrl: "https://github.com/leanprover-community/mathlib3",
    authors: ["leanprover-community"],
    institution: "leanprover-community",
    researchEventType: "Infrastructure",
    evidenceLevel: "E1",
    keyContributions: [
      "Community-maintained Lean 3 mathematics library",
      "Unified conventions for formalized mathematics",
      "Standard corpus for later Lean-based AI provers",
    ],
    relatedWorks: [
      {
        title: "Lean's theorem prover repository goes public",
        relation: "previous",
      },
    ],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-tactic-toe",
    title: "TacticToe learns to prove theorems with tactics in HOL4",
    slug: "tactictoe-learning-tactics-hol4",
    summary:
      "Gauthier, Kaliszyk, Urban, Kumar and Norrish learned tactic sequences from HOL4 proofs and used them to guide a prover, combining learned tactic selection with search.",
    significance:
      "Extended learning-based proving to tactic-level actions in an interactive prover, a precursor to tactic-based neural provers.",
    problem:
      "Tactic-style proofs offer a rich action space that earlier neural provers did not model directly.",
    date: "2018-04-02",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Proof search",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/1804.00596",
    paperUrl: "https://arxiv.org/abs/1804.00596",
    papers: [
      {
        title: "TacticToe: Learning to Prove with Tactics",
        url: "https://arxiv.org/abs/1804.00596",
        year: 2018,
      },
    ],
    authors: [
      "Thibault Gauthier",
      "Cezary Kaliszyk",
      "Josef Urban",
      "Ramana Kumar",
      "Michael Norrish",
    ],
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "Learned tactic sequences from HOL4 proofs",
      "Tactic-level guidance for proof search",
      "Evaluation in an interactive higher-order prover",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-neural-informal-formal-translation",
    title: "First neural translation experiments from informal to formal mathematics",
    slug: "neural-translation-informal-formal-mathematics",
    summary:
      "Wang, Kaliszyk and Urban trained neural sequence models to translate informal mathematical statements into formal ones, reporting first experiments on aligned corpora.",
    significance:
      "An early neural take on autoformalization, preceding the LLM-based wave by several years.",
    problem:
      "Rule-based and statistical translation of mathematics was brittle; neural sequence models offered a data-driven alternative.",
    date: "2018-05-10",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Autoformalization",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/1805.06502",
    paperUrl: "https://arxiv.org/abs/1805.06502",
    papers: [
      {
        title: "First Experiments with Neural Translation of Informal to Formal Mathematics",
        url: "https://arxiv.org/abs/1805.06502",
        year: 2018,
      },
    ],
    authors: ["Qingxiang Wang", "Cezary Kaliszyk", "Josef Urban"],
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "Neural sequence models for informal-to-formal translation",
      "Experiments on aligned mathematical corpora",
      "Early neural autoformalization baseline",
    ],
    relatedWorks: [
      {
        title: "Learning to translate informal mathematics into formal statements",
        relation: "previous",
      },
    ],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-rl-theorem-proving",
    title: "Reinforcement learning of theorem proving",
    slug: "reinforcement-learning-theorem-proving",
    summary:
      "Kaliszyk, Urban, Michalewski and Olšák formulated ATP proof search as a reinforcement-learning problem, learning clause-selection policies from prover feedback.",
    significance:
      "Brought reinforcement learning to large-theory ATP and showed that learned policies could outperform hand-tuned selection.",
    problem:
      "Clause selection in saturation provers was controlled by fixed heuristics.",
    date: "2018-05-19",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Proof search",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/1805.07563",
    paperUrl: "https://arxiv.org/abs/1805.07563",
    papers: [
      {
        title: "Reinforcement Learning of Theorem Proving",
        url: "https://arxiv.org/abs/1805.07563",
        year: 2018,
      },
    ],
    authors: [
      "Cezary Kaliszyk",
      "Josef Urban",
      "Henryk Michalewski",
      "Mirek Olšák",
    ],
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "Proof search as a reinforcement-learning problem",
      "Learned clause-selection policies",
      "Evaluation against ATP heuristics",
    ],
    relatedWorks: [
      {
        title: "Deep network guided proof search for first-order ATP",
        relation: "previous",
      },
    ],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-gamepad-learning-environment",
    title: "GamePad: a learning environment for theorem proving",
    slug: "gamepad-learning-environment-theorem-proving",
    summary:
      "Huang, Dhariwal, Song and Sutskever introduced GamePad, a Coq-based environment that exposes proof states and tactics to reinforcement-learning agents.",
    significance:
      "Gave reinforcement-learning researchers a standard interactive-proving environment, analogous to a control-task gym.",
    problem:
      "Reinforcement learning for theorem proving lacked a common, scriptable interface to a real proof assistant.",
    date: "2018-06-02",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Agent-based proving",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/1806.00608",
    paperUrl: "https://arxiv.org/abs/1806.00608",
    papers: [
      {
        title: "GamePad: A Learning Environment for Theorem Proving",
        url: "https://arxiv.org/abs/1806.00608",
        year: 2018,
      },
    ],
    authors: [
      "Daniel Huang",
      "Prafulla Dhariwal",
      "Dawn Song",
      "Ilya Sutskever",
    ],
    institution: "UC Berkeley; OpenAI",
    researchEventType: "Infrastructure",
    evidenceLevel: "E2",
    keyContributions: [
      "Coq-based interactive proving environment",
      "Proof-state and tactic interface for learning agents",
      "Standard testbed for reinforcement-learning provers",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-mathematics-dataset",
    title: "A procedurally generated dataset exposes limits of neural mathematical reasoning",
    slug: "mathematics-dataset-neural-reasoning",
    summary:
      "Saxton, Grefenstette, Hill and Kohli released a large procedurally generated mathematics dataset and showed that sequence models struggle to generalize beyond the training distribution.",
    significance:
      "Provided a controlled benchmark for mathematical reasoning and exposed the gap between pattern matching and systematic generalization.",
    problem:
      "Existing math word-problem datasets confounded reasoning ability with linguistic variation and memorization.",
    date: "2019-04-02",
    researchArea: "Benchmarks & Datasets",
    subArea: "Math word problem datasets",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/1904.01557",
    paperUrl: "https://arxiv.org/abs/1904.01557",
    papers: [
      {
        title: "Analysing Mathematical Reasoning Abilities of Neural Models",
        url: "https://arxiv.org/abs/1904.01557",
        year: 2019,
      },
    ],
    authors: [
      "David Saxton",
      "Edward Grefenstette",
      "Felix Hill",
      "Pushmeet Kohli",
    ],
    institution: "DeepMind",
    researchEventType: "Dataset",
    evidenceLevel: "E2",
    keyContributions: [
      "Large procedurally generated mathematics dataset",
      "Controlled evaluation of generalization",
      "Evidence that sequence models fail to extrapolate systematically",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-holist-environment",
    title: "HOList: a learning environment and benchmark for HOL Light",
    slug: "holist-higher-order-proving-environment",
    summary:
      "Bansal, Loos, Rabe, Szegedy and Wilcox released HOList, a HOL Light environment and benchmark for learning-guided higher-order theorem proving.",
    significance:
      "Turned HOL Light into a standard machine-learning benchmark and enabled reproducible comparison of neural provers.",
    problem:
      "Higher-order proving research lacked a shared environment and evaluation protocol.",
    date: "2019-04-05",
    researchArea: "Benchmarks & Datasets",
    subArea: "Formal proving benchmarks",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/1904.03241",
    paperUrl: "https://arxiv.org/abs/1904.03241",
    papers: [
      {
        title: "HOList: An Environment for Machine Learning of Higher-Order Theorem Proving",
        url: "https://arxiv.org/abs/1904.03241",
        year: 2019,
      },
    ],
    authors: [
      "Kshitij Bansal",
      "Sarah M. Loos",
      "Markus N. Rabe",
      "Christian Szegedy",
      "Stewart Wilcox",
    ],
    institution: "Google",
    researchEventType: "Benchmark",
    evidenceLevel: "E2",
    keyContributions: [
      "HOL Light environment for learning agents",
      "Shared benchmark and evaluation protocol",
      "Reproducible comparison of neural provers",
    ],
    relatedWorks: [
      {
        title: "HolStep: a machine-learning dataset for HOL Light theorem proving",
        relation: "previous",
      },
    ],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-coqgym",
    title: "CoqGym: learning to prove theorems by interacting with Coq",
    slug: "coqgym-coq-learning-environment",
    summary:
      "Yang and Deng introduced CoqGym, a Coq-based learning environment and dataset of proofs from 71 projects, together with ASTactic, a tactic-synthesis model.",
    significance:
      "Provided a large interactive-proving benchmark in Coq and demonstrated learning to synthesize tactics.",
    problem:
      "Coq's dependent type theory and large libraries made it hard to apply learning-based proving at scale.",
    date: "2019-05-21",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Agent-based proving",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/1905.09381",
    paperUrl: "https://arxiv.org/abs/1905.09381",
    papers: [
      {
        title: "Learning to Prove Theorems via Interacting with Proof Assistants",
        url: "https://arxiv.org/abs/1905.09381",
        year: 2019,
      },
    ],
    authors: ["Kaiyu Yang", "Jia Deng"],
    institution: "Princeton University",
    researchEventType: "Infrastructure",
    evidenceLevel: "E2",
    keyContributions: [
      "Coq environment and dataset spanning 71 projects",
      "Tactic-synthesis model ASTactic",
      "Benchmark for learning-based interactive proving",
    ],
    relatedWorks: [
      {
        title: "GamePad: a learning environment for theorem proving",
        relation: "previous",
      },
    ],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-metagen-theorem-generation",
    title: "MetaGen learns to prove by learning to generate theorems",
    slug: "metagen-learning-to-generate-theorems",
    summary:
      "Wang and Deng trained a theorem generator together with a prover, using generated theorems as training data to improve Metamath proving.",
    significance:
      "Introduced a data-generation loop for formal proving, anticipating later synthetic-theorem approaches.",
    problem:
      "Formal proof corpora were too small for data-hungry neural provers.",
    date: "2020-02-17",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Proof search",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2002.07019",
    paperUrl: "https://arxiv.org/abs/2002.07019",
    papers: [
      {
        title: "Learning to Prove Theorems by Learning to Generate Theorems",
        url: "https://arxiv.org/abs/2002.07019",
        year: 2020,
      },
    ],
    authors: ["Mingzhe Wang", "Jia Deng"],
    institution: "Princeton University",
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "Joint theorem generator and prover training",
      "Synthetic theorems as additional proving data",
      "Improved Metamath proving",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-gpt-f-metamath",
    title: "GPT-f: generative language modeling for automated theorem proving",
    slug: "gpt-f-generative-language-modeling-theorem-proving",
    summary:
      "Polu and Sutskever trained GPT-f on Metamath and used it to search for proofs; proofs it found were accepted into the main Metamath library, which the authors describe as the first time a deep-learning system contributed proofs adopted by a formal mathematics community.",
    significance:
      "The starting point of the LLM theorem-proving line: language-model-guided search producing proofs accepted by a formal community.",
    problem:
      "Automated provers could not generate the original mathematical terms that creative proofs require.",
    date: "2020-09-07",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Proof search",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2009.03393",
    paperUrl: "https://arxiv.org/abs/2009.03393",
    papers: [
      {
        title: "Generative Language Modeling for Automated Theorem Proving",
        url: "https://arxiv.org/abs/2009.03393",
        year: 2020,
      },
    ],
    authors: ["Stanislas Polu", "Ilya Sutskever"],
    institution: "OpenAI",
    researchEventType: "Discovery",
    evidenceLevel: "E2",
    aiRole: {
      level: "autonomous",
      description:
        "GPT-f generated candidate proofs with a language model and proof search; Metamath's checker verified them before they entered the main library.",
    },
    humanContribution:
      "Polu and Sutskever trained the model and built the proof search; the Metamath community accepted the contributed proofs into its library.",
    keyContributions: [
      "Language-model-guided proof search in Metamath",
      "New short proofs accepted into the main Metamath library",
      "First deep-learning system to contribute proofs adopted by a formal community",
    ],
    relatedWorks: [
      {
        title: "MetaGen learns to prove by learning to generate theorems",
        relation: "previous",
      },
      {
        title: "DeepMath applies deep sequence models to premise selection",
        relation: "previous",
      },
    ],
    createdAt: t,
    updatedAt: t,
  },
];
