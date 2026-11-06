/**
 * Historical backfill: early automated mathematics, 1956-1997.
 *
 * Every entry is anchored to a primary record that was fetched and checked:
 * RAND/IBM/ACM/institutional publication pages, the Crossref record behind
 * each DOI, and official project histories. Only facts stated by those
 * records are written down; dates are day precision where the record gives
 * one and month precision (YYYY-MM-01) otherwise.
 */
import type { ResearchEvent } from "../../types";

const t = "2026-10-29T00:00:00.000Z";

export const events: ResearchEvent[] = [
  {
    id: "evt-logic-theorist",
    title: "Logic Theorist: the first program to prove theorems in Principia Mathematica",
    slug: "logic-theorist-first-theorem-prover",
    summary:
      "Newell, Shaw and Simon's Logic Theorist, described in RAND paper P-868 (December 1956), searched for proofs of theorems from Whitehead and Russell's Principia Mathematica and found a new proof of Theorem 2.85.",
    significance:
      "Widely regarded as the first AI program and the first machine proof of mathematical theorems; it framed theorem proving as heuristic search, the paradigm automated deduction inherited.",
    problem:
      "General-purpose search was hopeless for deriving proofs in a formal system; the program needed domain heuristics to choose among proof steps.",
    date: "1956-12-01",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Proof search",
    sourceType: "conference",
    sourceUrl: "https://www.rand.org/pubs/papers/P868.html",
    paperUrl: "https://www.rand.org/pubs/papers/P868.html",
    papers: [
      {
        title: "The Logic Theory Machine: A Complex Information Processing System",
        url: "https://www.rand.org/pubs/papers/P868.html",
        venue: "RAND Corporation P-868",
        year: 1956,
      },
    ],
    authors: ["Allen Newell", "J. C. Shaw", "Herbert A. Simon"],
    institution: "Carnegie Institute of Technology; RAND Corporation",
    researchEventType: "Proof",
    evidenceLevel: "E2",
    aiRole: {
      level: "autonomous",
      description:
        "The Logic Theorist searched a space of proofs and constructed its own derivations, including a new proof of Principia Mathematica Theorem 2.85.",
    },
    humanContribution:
      "Newell, Shaw and Simon designed the heuristics and encoded the Principia axioms and inference rules; the program then produced the proofs.",
    keyContributions: [
      "Treated theorem proving as heuristic search over proof steps",
      "Derived theorems from Principia Mathematica, including a new proof of Theorem 2.85",
      "Presented the Logic Theory Machine as a model of human problem solving",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-geometry-theorem-machine",
    title: "The Geometry Theorem Machine proves theorems in Euclidean plane geometry",
    slug: "geometry-theorem-machine-ibm-704",
    summary:
      "In early spring 1959 an IBM 704 running Gelernter's Geometry Theorem Machine proved its first theorem in elementary Euclidean plane geometry; Gelernter, Hansen and Loveland reported the system's empirical results in 1960.",
    significance:
      "One of the first programs to prove non-trivial mathematical theorems, and an early demonstration that domain-specific geometric knowledge could guide search.",
    problem:
      "Blind search in geometry was intractable; the program needed a way to use diagrams and auxiliary constructions as search guidance.",
    date: "1960-01-01",
    researchArea: "Geometry",
    subArea: "Geometry problem solving",
    sourceType: "conference",
    sourceUrl:
      "https://research.ibm.com/publications/empirical-explorations-of-the-geometry-theorem-machine",
    papers: [
      {
        title: "Empirical explorations of the geometry theorem machine",
        venue: "Western Joint IRE-AIEE-ACM Computer Conference",
        year: 1960,
      },
    ],
    authors: ["H. Gelernter", "J. R. Hansen", "D. W. Loveland"],
    institution: "IBM Research",
    researchEventType: "Proof",
    evidenceLevel: "E2",
    aiRole: {
      level: "autonomous",
      description:
        "The program found proofs in elementary Euclidean geometry itself, using a diagram-based heuristic to guide its search.",
    },
    humanContribution:
      "Gelernter designed the geometry machine and its heuristics; Hansen and Loveland contributed to the implementation and the empirical evaluation.",
    keyContributions: [
      "Proved elementary Euclidean geometry theorems on an IBM 704",
      "Used diagram information and auxiliary constructions as search heuristics",
      "Reported an early empirical evaluation of a geometry prover",
    ],
    relatedWorks: [
      {
        title: "Logic Theorist: the first program to prove theorems in Principia Mathematica",
        relation: "previous",
      },
    ],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-saint-symbolic-integration",
    title: "SAINT: a heuristic program that solves symbolic integration problems",
    slug: "saint-symbolic-integration-heuristic-program",
    summary:
      "James Slagle's SAINT, reported in the Journal of the ACM in 1963, solved freshman-calculus symbolic integration problems by combining goal reduction with heuristics for choosing transformations.",
    significance:
      "One of the first AI programs to perform a mathematically substantive task, and an ancestor of computer algebra systems.",
    problem:
      "Symbolic integration requires choosing among transformations; no uniform algorithm handled the range of freshman-calculus problems.",
    date: "1963-10-01",
    researchArea: "Mathematical Discovery & Symbolic Computation",
    subArea: "Equation solving & discovery",
    sourceType: "conference",
    sourceUrl: "https://doi.org/10.1145/321186.321193",
    paperUrl: "https://doi.org/10.1145/321186.321193",
    papers: [
      {
        title: "A Heuristic Program that Solves Symbolic Integration Problems in Freshman Calculus",
        url: "https://doi.org/10.1145/321186.321193",
        venue: "Journal of the ACM",
        year: 1963,
      },
    ],
    authors: ["James R. Slagle"],
    institution: "Massachusetts Institute of Technology",
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "Heuristic goal-reduction search for symbolic integration",
      "Solved a benchmark of freshman-calculus integrals",
      "Early demonstration of symbolic computation as an AI task",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-resolution-principle",
    title: "Robinson's resolution principle gives automated theorem proving a single inference rule",
    slug: "resolution-principle-first-order-logic",
    summary:
      "J. A. Robinson's 1965 Journal of the ACM paper introduced resolution, a single inference rule for first-order logic based on unification and refutation, which became the foundation of most later automated theorem provers.",
    significance:
      "Made first-order theorem proving a uniform search problem and underpins saturation provers, logic programming and many verification tools.",
    problem:
      "Earlier provers used many special-purpose inference rules; a complete, machine-friendly single rule was needed.",
    date: "1965-01-01",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Proof search",
    sourceType: "conference",
    sourceUrl: "https://doi.org/10.1145/321250.321253",
    paperUrl: "https://doi.org/10.1145/321250.321253",
    papers: [
      {
        title: "A Machine-Oriented Logic Based on the Resolution Principle",
        url: "https://doi.org/10.1145/321250.321253",
        venue: "Journal of the ACM",
        year: 1965,
      },
    ],
    authors: ["John Alan Robinson"],
    institution: "Rice University",
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "A single sound and complete inference rule for first-order logic",
      "Unification-based resolution",
      "Refutation-style proof search",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-automath-language",
    title: "de Bruijn's Automath language makes mechanical proof checking a design goal",
    slug: "automath-language-for-mathematics",
    summary:
      "N. G. de Bruijn's Automath (1968) introduced a formal language in which mathematical statements and proofs are written so that a machine can check them, an early type-theoretic foundation for proof assistants.",
    significance:
      "Introduced the idea of a small trusted checker for complete mathematical texts, later called the de Bruijn criterion, and influenced type-theoretic proof assistants.",
    problem:
      "Mathematical arguments could not be checked mechanically without a precise formal language and a checker.",
    date: "1968-01-01",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Proof assistant tooling",
    sourceType: "conference",
    sourceUrl: "https://research.tue.nl/en/publications/automath-a-language-for-mathematics/",
    papers: [
      {
        title: "Automath, a language for mathematics",
        venue: "Technische Hogeschool Eindhoven",
        year: 1968,
      },
    ],
    authors: ["N. G. de Bruijn"],
    institution: "Technische Hogeschool Eindhoven (now Eindhoven University of Technology)",
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "A formal language for complete mathematical texts",
      "Machine-checkable proof terms",
      "Type-theoretic foundations for proof checking",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-macsyma-system",
    title: "MACSYMA brings large-scale symbolic algebra to interactive computing",
    slug: "macsyma-interactive-symbolic-algebra",
    summary:
      "MACSYMA, reported by Martin and Fateman at SYMSAC 1971, integrated symbolic algebra, simplification, calculus and linear algebra into an interactive system developed at MIT's Project MAC.",
    significance:
      "A landmark general-purpose computer algebra system that shaped later CAS and made symbolic mathematics a practical interactive tool.",
    problem:
      "Symbolic algorithms existed in isolation; users needed an integrated interactive system.",
    date: "1971-08-01",
    researchArea: "Mathematical Discovery & Symbolic Computation",
    subArea: "Equation solving & discovery",
    sourceType: "conference",
    sourceUrl: "https://doi.org/10.1145/800204.806267",
    paperUrl: "https://doi.org/10.1145/800204.806267",
    papers: [
      {
        title: "The MACSYMA system",
        url: "https://doi.org/10.1145/800204.806267",
        venue: "SYMSAC '71",
        year: 1971,
      },
    ],
    authors: ["William A. Martin", "Richard J. Fateman"],
    institution: "MIT Project MAC",
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "Integrated symbolic algebra and calculus",
      "Interactive user environment for symbolic computation",
      "Foundation for later computer algebra systems",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-lcf-tactics-ml",
    title: "LCF introduces machine-checked proofs with tactics and the ML metalanguage",
    slug: "lcf-tactics-ml-metalanguage",
    summary:
      "Robin Milner's 1972 LCF system implemented Scott's logic for computable functions and introduced the tactic style of interactive proof, in which proofs are constructed by programs written in ML.",
    significance:
      "The LCF approach — a small trusted kernel, tactics and a functional metalanguage — shaped HOL, Isabelle, Coq and essentially every modern proof assistant.",
    problem:
      "Interactive theorem proving needed a principled way to build proofs under program control without trusting untrusted automation.",
    date: "1972-08-01",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Prover tooling & interaction",
    sourceType: "conference",
    sourceUrl: "https://doi.org/10.1145/800235.807067",
    paperUrl: "https://doi.org/10.1145/800235.807067",
    papers: [
      {
        title: "Implementation and applications of Scott's logic for computable functions",
        url: "https://doi.org/10.1145/800235.807067",
        venue: "ACM Conference on Proving Assertions about Programs",
        year: 1972,
      },
    ],
    authors: ["Robin Milner"],
    institution: "University of Cambridge",
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "Tactic-based interactive proof",
      "ML as the proof metalanguage",
      "Small trusted kernel separating proof construction from checking",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-pltp-boyer-moore",
    title: "The Boyer–Moore theorem prover proves theorems about Lisp functions",
    slug: "pltp-boyer-moore-lisp-theorem-prover",
    summary:
      "Boyer and Moore's 1973 Edinburgh Pure Lisp Theorem Prover, described in 'Proving Theorems about LISP Functions' at IJCAI-73, proved properties of recursive Lisp functions automatically and became the basis of the Nqthm/ACL2 line.",
    significance:
      "Founded the Boyer–Moore line of induction-based provers and established automatic proof by induction as a practical goal.",
    problem:
      "Properties of recursive programs require induction, which general-purpose first-order provers did not handle well.",
    date: "1973-08-01",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Proof search",
    sourceType: "conference",
    sourceUrl: "https://www.cs.utexas.edu/~moore/best-ideas/pltp/index.html",
    papers: [
      {
        title: "Proving Theorems about LISP Functions",
        venue: "IJCAI 1973",
        year: 1973,
      },
    ],
    authors: ["Robert S. Boyer", "J Strother Moore"],
    institution: "University of Edinburgh",
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "Automatic proof by induction for Lisp functions",
      "Heuristic simplification and rewriting",
      "Precursor of the Nqthm and ACL2 provers",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-wu-method",
    title: "Wu's method turns elementary geometry into polynomial algebra",
    slug: "wu-method-mechanical-geometry",
    summary:
      "Wu Wen-tsün's algebraic method (1977) reduced elementary geometry theorems to polynomial equations and used characteristic sets to decide them, giving a mechanical procedure that proved large classes of geometry theorems.",
    significance:
      "Founded the algebraic approach to mechanical geometry theorem proving and connected classical mathematics to automated deduction.",
    problem:
      "Geometry theorem proving by search was inefficient; a uniform algebraic decision procedure was needed.",
    date: "1977-01-01",
    researchArea: "Geometry",
    subArea: "Geometry problem solving",
    sourceType: "blog",
    sourceUrl:
      "https://www.cas.cn/zt/hyzt/ysdh21st/ysfc/202406/t20240621_5022393.shtml",
    authors: ["Wu Wen-tsün"],
    institution: "Institute of Systems Science, Chinese Academy of Sciences",
    researchEventType: "Proof",
    evidenceLevel: "E3",
    keyContributions: [
      "Algebraic formulation of elementary geometry theorems",
      "Characteristic-set method for mechanical proving",
      "Mechanical proofs of large classes of geometry theorems",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-am-automated-mathematician",
    title: "Lenat's Automated Mathematician discovers concepts and conjectures",
    slug: "am-automated-mathematician-concept-discovery",
    summary:
      "Douglas Lenat's AM (Automated Mathematician), presented at IJCAI 1977, used heuristic search over mathematical tasks to discover elementary set-theoretic concepts and conjectures.",
    significance:
      "An early and influential attempt at autonomous mathematical discovery; its mixed results shaped later work on machine-generated conjectures.",
    problem:
      "It was assumed that new mathematical concepts require human insight; AM tested whether heuristic search could generate them.",
    date: "1977-08-01",
    researchArea: "Mathematical Discovery & Symbolic Computation",
    subArea: "AI-proved results & conjectures",
    sourceType: "conference",
    sourceUrl: "https://www.ijcai.org/Proceedings/77-2/Papers/094.pdf",
    paperUrl: "https://www.ijcai.org/Proceedings/77-2/Papers/094.pdf",
    papers: [
      {
        title: "The Automated Mathematician",
        url: "https://www.ijcai.org/Proceedings/77-2/Papers/094.pdf",
        venue: "IJCAI 1977",
        year: 1977,
      },
    ],
    authors: ["Douglas B. Lenat"],
    institution: "Stanford University",
    researchEventType: "Discovery",
    evidenceLevel: "E2",
    aiRole: {
      level: "autonomous",
      description:
        "AM searched a space of mathematical tasks and generated new concepts and conjectures from its heuristics.",
    },
    humanContribution:
      "Lenat designed the heuristic search and the initial set-theoretic knowledge base, then evaluated the discoveries.",
    keyContributions: [
      "Heuristic search over mathematical tasks",
      "Discovery of elementary concepts and conjectures",
      "Early testbed for machine discovery",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-edinburgh-lcf",
    title: "Edinburgh LCF turns the LCF idea into a usable proof assistant",
    slug: "edinburgh-lcf-proof-assistant",
    summary:
      "The 1979 Edinburgh LCF system, documented by Gordon, Milner and Wadsworth, implemented a programmable proof assistant for a logic of computable functions with a small kernel, tactics and the ML metalanguage.",
    significance:
      "Made the LCF architecture a working, widely copied proof assistant and established ML and abstract types as tools for trustworthy proof engineering.",
    problem:
      "The original LCF experiment needed a robust implementation and a clear separation between trusted kernel and untrusted tactics.",
    date: "1979-01-01",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Proof assistant tooling",
    sourceType: "conference",
    sourceUrl: "https://doi.org/10.1007/3-540-09724-4",
    paperUrl: "https://doi.org/10.1007/3-540-09724-4",
    papers: [
      {
        title: "Edinburgh LCF",
        url: "https://doi.org/10.1007/3-540-09724-4",
        venue: "Lecture Notes in Computer Science",
        year: 1979,
      },
    ],
    authors: ["Michael J. Gordon", "Robin Milner", "Christopher P. Wadsworth"],
    institution: "University of Edinburgh",
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "Working LCF proof assistant",
      "Kernel and tactic separation",
      "ML metalanguage for proof construction",
    ],
    relatedWorks: [
      {
        title: "LCF introduces machine-checked proofs with tactics and the ML metalanguage",
        relation: "previous",
      },
    ],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-maple-symbolic-computation",
    title: "Maple offers portable interactive symbolic computation",
    slug: "maple-symbolic-computation-system",
    summary:
      "The Maple symbolic computation system, described by Char, Geddes and Gonnet in 1983, provided interactive symbolic algebra and calculus with a focus on efficiency and portability.",
    significance:
      "Became one of the dominant general-purpose computer algebra systems of the 1980s and a lasting tool for symbolic mathematics.",
    problem:
      "Computer algebra was expensive and tied to large machines; Maple aimed for a portable, efficient system.",
    date: "1983-08-01",
    researchArea: "Mathematical Discovery & Symbolic Computation",
    subArea: "Equation solving & discovery",
    sourceType: "conference",
    sourceUrl: "https://doi.org/10.1145/1089338.1089344",
    paperUrl: "https://doi.org/10.1145/1089338.1089344",
    papers: [
      {
        title: "The maple symbolic computation system",
        url: "https://doi.org/10.1145/1089338.1089344",
        year: 1983,
      },
    ],
    authors: ["Bruce W. Char", "Keith O. Geddes", "Gaston H. Gonnet"],
    institution: "University of Waterloo",
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "Portable symbolic computation system",
      "Efficient polynomial and calculus algorithms",
      "Interactive user language",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-coq-started",
    title: "Coq is started at Inria as an implementation of the Calculus of Constructions",
    slug: "coq-proof-assistant-started",
    summary:
      "The Coq proof assistant was started in 1984 by Gérard Huet and Thierry Coquand; version 1 appeared in 1985, and later versions added universes, automation, extraction and inductive types, as recorded in the Rocq reference manual's history.",
    significance:
      "Created one of the longest-running and most widely used proof assistants, and a core platform for formalized mathematics and verification.",
    problem:
      "The Calculus of Constructions needed a practical implementation for writing and checking proofs.",
    date: "1984-01-01",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Proof assistant tooling",
    sourceType: "blog",
    sourceUrl: "https://rocq-prover.org/doc/V8.20.1/refman/history.html",
    authors: ["Gérard Huet", "Thierry Coquand"],
    institution: "Inria",
    researchEventType: "System",
    evidenceLevel: "E3",
    keyContributions: [
      "Implementation of the Calculus of Constructions",
      "Proof assistant with a kernel and tactics",
      "Lineage continued through Coq and Rocq releases",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-nuprl-number-theory",
    title: "Nuprl implements number theory in a constructive type theory",
    slug: "nuprl-number-theory-constructive-type-theory",
    summary:
      "Howe's 1986 paper reported an experiment implementing number theory in Nuprl, the constructive type-theory proof system developed at Cornell by Constable and colleagues.",
    significance:
      "Demonstrated that a dependent constructive type theory could host real mathematics, a step toward Nuprl's later formal libraries.",
    problem:
      "Constructive mathematics needed a machine-checked implementation with a rich dependent type theory.",
    date: "1986-01-01",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Formal corpora & libraries",
    sourceType: "conference",
    sourceUrl: "https://doi.org/10.1007/3-540-16780-3_108",
    paperUrl: "https://doi.org/10.1007/3-540-16780-3_108",
    papers: [
      {
        title: "Implementing number theory: An experiment with Nuprl",
        url: "https://doi.org/10.1007/3-540-16780-3_108",
        venue: "Lecture Notes in Computer Science",
        year: 1986,
      },
    ],
    authors: ["Douglas J. Howe"],
    institution: "Cornell University",
    researchEventType: "Formalization",
    evidenceLevel: "E2",
    keyContributions: [
      "Constructive type-theory proof assistant",
      "Formalized number theory experiment",
      "Influential dependent-type-theory design",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-hol-proof-generating-system",
    title: "HOL: a proof-generating system for higher-order logic",
    slug: "hol-proof-generating-system-higher-order-logic",
    summary:
      "Mike Gordon's 1987 technical report described HOL, a proof-generating system for higher-order logic built in the LCF style and aimed at hardware verification.",
    significance:
      "Established HOL as a practical higher-order proof assistant and the basis of the HOL family (HOL88, HOL4, HOL Light).",
    problem:
      "Hardware and software verification needed machine-checked higher-order logic with a trusted kernel.",
    date: "1987-01-01",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Proof assistant tooling",
    sourceType: "conference",
    sourceUrl: "https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-103.html",
    papers: [
      {
        title: "HOL: A proof generating system for higher-order logic",
        venue: "University of Cambridge Computer Laboratory Technical Report 103",
        year: 1987,
      },
    ],
    authors: ["Michael J. C. Gordon"],
    institution: "University of Cambridge",
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "Higher-order logic instantiation of LCF",
      "Proof generation with a small kernel",
      "Foundation for the HOL prover family",
    ],
    relatedWorks: [
      {
        title: "Edinburgh LCF turns the LCF idea into a usable proof assistant",
        relation: "previous",
      },
    ],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-hol88-release",
    title: "HOL88 brings the HOL system to a wider user community",
    slug: "hol88-hol-system-release",
    summary:
      "HOL88, developed by Gordon and Melham at Cambridge, was a widely distributed version of the HOL proof assistant that made the HOL approach available beyond the original implementation.",
    significance:
      "The first widely used HOL release and the direct ancestor of HOL4 and HOL Light, which later hosted major formalizations.",
    problem:
      "The original HOL system needed a stable, distributable implementation for external users.",
    date: "1988-01-01",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Proof assistant tooling",
    sourceType: "conference",
    sourceUrl: "https://www.cl.cam.ac.uk/archive/mjcg/papers/HolHistory.pdf",
    authors: ["Michael J. C. Gordon", "Thomas F. Melham"],
    institution: "University of Cambridge",
    researchEventType: "System",
    evidenceLevel: "E3",
    keyContributions: [
      "Distributed HOL system release",
      "Higher-order logic verification environment",
      "Ancestor of HOL4 and HOL Light",
    ],
    relatedWorks: [
      {
        title: "HOL: a proof-generating system for higher-order logic",
        relation: "previous",
      },
    ],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-graffiti-conjectures",
    title: "Graffiti: a computer program that conjectures graph-theory results",
    slug: "graffiti-graph-theory-conjecture-program",
    summary:
      "Siemion Fajtlowicz's Graffiti program generated conjectures in graph theory by combining invariants; 'On conjectures of Graffiti' (1988) reported conjectures that mathematicians then investigated.",
    significance:
      "One of the most productive conjecture-generating programs, and a landmark in machine-assisted mathematical discovery.",
    problem:
      "Conjecture generation was assumed to require human intuition; Graffiti tested automated pattern-finding over graph invariants.",
    date: "1988-12-01",
    researchArea: "Mathematical Discovery & Symbolic Computation",
    subArea: "AI-proved results & conjectures",
    sourceType: "conference",
    sourceUrl: "https://doi.org/10.1016/0012-365X(88)90199-9",
    paperUrl: "https://doi.org/10.1016/0012-365X(88)90199-9",
    papers: [
      {
        title: "On conjectures of Graffiti",
        url: "https://doi.org/10.1016/0012-365X(88)90199-9",
        venue: "Discrete Mathematics",
        year: 1988,
      },
    ],
    authors: ["Siemion Fajtlowicz"],
    institution: "University of Houston",
    researchEventType: "Discovery",
    evidenceLevel: "E2",
    aiRole: {
      level: "autonomous",
      description:
        "Graffiti generated graph-theory conjectures by searching combinations of graph invariants.",
    },
    humanContribution:
      "Fajtlowicz designed Graffiti and chose its invariants; mathematicians evaluated, proved or refuted the conjectures it produced.",
    keyContributions: [
      "Automated generation of graph-theory conjectures",
      "Conjectures that stimulated published mathematical work",
      "Early example of human–machine mathematical collaboration",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-coq-calculus-of-inductive-constructions",
    title: "Coq adopts the Calculus of Inductive Constructions",
    slug: "coq-calculus-of-inductive-constructions",
    summary:
      "Coq version 5 (1989) moved to the Calculus of Inductive Constructions, adding inductive types and a stronger dependent type theory that shaped all later Coq versions, according to the Rocq reference manual's history.",
    significance:
      "Gave Coq the type theory it still uses, enabling direct formalization of mathematical structures and inductive proofs.",
    problem:
      "The original Calculus of Constructions lacked inductive types, which are central to formal mathematics.",
    date: "1989-01-01",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Proof assistant tooling",
    sourceType: "blog",
    sourceUrl: "https://rocq-prover.org/doc/V8.20.1/refman/history.html",
    authors: ["Coq development team"],
    institution: "Inria",
    researchEventType: "System",
    evidenceLevel: "E3",
    keyContributions: [
      "Calculus of Inductive Constructions as Coq's foundation",
      "Inductive types and dependent elimination",
      "Basis for later Coq and Rocq libraries",
    ],
    relatedWorks: [
      {
        title: "Coq is started at Inria as an implementation of the Calculus of Constructions",
        relation: "previous",
      },
    ],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-isabelle-generic-prover",
    title: "Isabelle: a generic theorem prover in the LCF tradition",
    slug: "isabelle-generic-theorem-prover",
    summary:
      "Paulson's 1989 Journal of Automated Reasoning paper described Isabelle, a generic proof assistant in which object logics are embedded as theories and proofs are constructed with tactics.",
    significance:
      "Introduced a generic LCF-style framework that became one of the main platforms for formal mathematics and verification.",
    problem:
      "Building a proof assistant for each logic duplicated infrastructure; a generic framework could host many object logics.",
    date: "1989-09-01",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Proof assistant tooling",
    sourceType: "conference",
    sourceUrl: "https://doi.org/10.1007/BF00248324",
    paperUrl: "https://doi.org/10.1007/BF00248324",
    papers: [
      {
        title: "The foundation of a generic theorem prover",
        url: "https://doi.org/10.1007/BF00248324",
        venue: "Journal of Automated Reasoning",
        year: 1989,
      },
    ],
    authors: ["Lawrence C. Paulson"],
    institution: "University of Cambridge",
    researchEventType: "System",
    evidenceLevel: "E2",
    keyContributions: [
      "Generic LCF-style framework",
      "Object logics as Isabelle theories",
      "Basis for Isabelle/HOL and its libraries",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-qed-manifesto",
    title: "The QED Manifesto calls for a computer-checked corpus of all mathematics",
    slug: "qed-manifesto-formal-mathematics-corpus",
    summary:
      "The 1994 QED Manifesto argued for a long-term project to formalize mathematics in machine-checkable form and to build a shared library of checked proofs.",
    significance:
      "Articulated the ambition behind large-scale formalization and helped motivate projects and communities devoted to formal mathematics libraries.",
    problem:
      "Formal proofs were scattered across incompatible systems, with no shared corpus of checked mathematics.",
    date: "1994-01-01",
    researchArea: "Theorem Proving & Formal Mathematics",
    subArea: "Formal corpora & libraries",
    sourceType: "blog",
    sourceUrl: "https://www.cs.ru.nl/~freek/qed/qed.html",
    papers: [
      {
        title: "The QED Manifesto",
        venue: "QED project",
        year: 1994,
      },
    ],
    authors: ["QED Manifesto contributors"],
    researchEventType: "Infrastructure",
    evidenceLevel: "E2",
    keyContributions: [
      "A public call for a universal formal mathematics corpus",
      "Agenda for shared formal libraries and interoperability",
      "Reference point for later formalization projects",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-casc-1996",
    title: "CASC: the CADE ATP System Competition",
    slug: "casc-cade-atp-system-competition",
    summary:
      "The first CADE ATP System Competition was held at CADE-13 in 1996, evaluating automated theorem provers on TPTP problems under common hardware and time limits.",
    significance:
      "Became the standard competitive benchmark for first-order ATP and drove sustained engineering progress in prover performance.",
    problem:
      "ATP systems were evaluated on incomparable problem sets and hardware, making claims hard to compare.",
    date: "1996-06-01",
    researchArea: "Benchmarks & Datasets",
    subArea: "Formal proving benchmarks",
    sourceType: "conference",
    sourceUrl: "https://lics.siglog.org/floc96/cade-comp.html",
    paperUrl: "https://doi.org/10.1023/A:1005839515219",
    papers: [
      {
        title: "The CADE-13 ATP System Competition",
        url: "https://doi.org/10.1023/A:1005839515219",
        venue: "Journal of Automated Reasoning",
        year: 1997,
      },
    ],
    authors: ["Geoff Sutcliffe", "Christian Suttner"],
    researchEventType: "Benchmark",
    evidenceLevel: "E2",
    keyContributions: [
      "Common TPTP problem set and evaluation protocol",
      "Head-to-head competition among ATP systems",
      "Recurring benchmark for ATP progress",
    ],
    relatedWorks: [],
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "evt-robbins-conjecture-solved",
    title: "EQP solves the Robbins conjecture",
    slug: "eqp-robbins-conjecture-proof",
    summary:
      "McCune's EQP equational prover found a proof of the Robbins conjecture in 1996; the 1997 Journal of Automated Reasoning paper 'Solution of the Robbins Problem' reported the result, which answered a decades-old open question in Boolean algebra.",
    significance:
      "One of the clearest early cases of an automated prover resolving a longstanding open mathematical conjecture.",
    problem:
      "The Robbins conjecture — whether every Robbins algebra is a Boolean algebra — had remained open since the 1930s.",
    date: "1997-12-01",
    researchArea: "Mathematical Discovery & Symbolic Computation",
    subArea: "AI-proved results & conjectures",
    sourceType: "conference",
    sourceUrl: "https://doi.org/10.1023/A:1005843212881",
    paperUrl: "https://doi.org/10.1023/A:1005843212881",
    papers: [
      {
        title: "Solution of the Robbins Problem",
        url: "https://doi.org/10.1023/A:1005843212881",
        venue: "Journal of Automated Reasoning",
        year: 1997,
      },
    ],
    authors: ["William McCune"],
    institution: "Argonne National Laboratory",
    researchEventType: "Discovery",
    evidenceLevel: "E2",
    aiRole: {
      level: "autonomous",
      description:
        "EQP searched for and found an equational proof of the Robbins conjecture without step-level human guidance.",
    },
    humanContribution:
      "McCune designed and implemented EQP and set up the proof search; the program produced the proof.",
    keyContributions: [
      "A fully automatic proof of the Robbins conjecture",
      "Demonstrated ATP on an open research problem",
      "Proof found by the EQP equational prover",
    ],
    relatedWorks: [
      {
        title: "CASC: the CADE ATP System Competition",
        relation: "previous",
      },
    ],
    createdAt: t,
    updatedAt: t,
  },
];
