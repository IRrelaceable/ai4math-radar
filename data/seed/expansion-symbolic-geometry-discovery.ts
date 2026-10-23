import type { ResearchEvent } from "../../types";

/**
 * Expansion seed: "Symbolic Mathematics", "Geometry" and "Mathematical Discovery"
 * events. Every URL in this file was fetched with web_fetch and checked against
 * the primary source (arXiv abs pages; api.github.com for the two GitHub repos).
 */
export const events: ResearchEvent[] = [
  {
    id: "evt-inter-gps-geometry3k",
    title:
      "Inter-GPS: Interpretable Geometry Problem Solving with Formal Language and Symbolic Reasoning",
    slug: "inter-gps-geometry3k-formal-symbolic-solving",
    summary:
      "Inter-GPS parses geometry problem text and diagrams into formal language (rule-based text parsing plus neural object detection) and solves them with step-by-step symbolic reasoning guided by theorem knowledge, together with the release of Geometry3K, a benchmark of 3,002 geometry problems densely annotated in formal language.",
    significance:
      "It moved geometry problem solving away from implicit neural pattern matching toward interpretable, formally annotated symbolic proofs, and gave the community its first large public geometry benchmark with formal-language ground truth.",
    problem:
      "Existing geometry datasets were either too small or not public, and end-to-end neural solvers offered no interpretable chain of reasoning grounded in axiomatic theorem knowledge.",
    date: "2021-05-10",
    researchArea: "Geometry",
    subArea: "geometry problem solving with symbolic reasoning",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2105.04165",
    paperUrl: "https://arxiv.org/abs/2105.04165",
    papers: [
      {
        title:
          "Inter-GPS: Interpretable Geometry Problem Solving with Formal Language and Symbolic Reasoning",
        url: "https://arxiv.org/abs/2105.04165",
        venue: "ACL",
        year: 2021,
      },
    ],
    authors: [
      "Pan Lu",
      "Ran Gong",
      "Shibiao Jiang",
      "Liang Qiu",
      "Siyuan Huang",
      "Xiaodan Liang",
      "Song-Chun Zhu",
    ],
    model: ["Inter-GPS"],
    benchmark: ["Geometry3K", "GEOS"],
    dataset: ["Geometry3K"],
    keyContributions: [
      "Geometry3K: 3,002 geometry problems with dense formal-language annotation",
      "Formal parsing of problem text and diagrams into axiomatic descriptions",
      "Theorem predictor feeding a symbolic solver for step-by-step proof search",
      "State-of-the-art results on Geometry3K and GEOS at the time of publication",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-pretrained-lms-symbolic-solvers",
    title: "Pretrained Language Models are Symbolic Mathematics Solvers too!",
    slug: "pretrained-lms-symbolic-mathematics-solvers",
    summary:
      "The paper shows that a transformer first pretrained on language translation and then fine-tuned on symbolic mathematics attains integration accuracy comparable to the state of the art while using around 1.5 orders of magnitude fewer training samples, and reports language-dependent behaviour, distribution-shift robustness and lower accuracy on differential equations.",
    significance:
      "It framed symbolic mathematics solving as a sample-efficiency and transfer problem for language models, showing that cross-lingual pretraining rather than sheer data scale can carry much of the performance on symbolic tasks such as integration.",
    problem:
      "Sequence-to-sequence transformers trained end-to-end on symbolic mathematics needed enormous amounts of training data to generalize to unseen problems.",
    date: "2021-10-07",
    researchArea: "Symbolic Mathematics",
    subArea: "pretraining for symbolic equation solving",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2110.03501",
    paperUrl: "https://arxiv.org/abs/2110.03501",
    papers: [
      {
        title: "Pretrained Language Models are Symbolic Mathematics Solvers too!",
        url: "https://arxiv.org/abs/2110.03501",
        year: 2021,
      },
    ],
    authors: [
      "Kimia Noorbakhsh",
      "Modar Sulaiman",
      "Mahdi Sharifi",
      "Kallol Roy",
      "Pooyan Jamshidi",
    ],
    model: ["Translation-pretrained transformer"],
    benchmark: ["Function integration", "Differential equation solving"],
    keyContributions: [
      "Translation pretraining followed by symbolic fine-tuning reaches comparable integration accuracy with ~1.5 orders of magnitude less training data",
      "Anna Karenina Principle (AKP) analysis of generalizability across pretraining language pairs",
      "Evidence of language bias and improved robustness under distribution shift for integration",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-ml-knot-invariants-correlations",
    title: "Illuminating new and known relations between knot invariants",
    slug: "ml-knot-invariants-novel-correlations",
    summary:
      "The authors automate machine-learning searches over nearly 200,000 sets of knot invariants, training neural networks to predict one invariant from others and filtering genuine multipartite correlations, thereby rediscovering known relations between polynomial, homological and hyperbolic invariants and surfacing novel correlations not explained by existing knot theory results.",
    significance:
      "It is a concrete case of machine learning acting as a conjecture-generation engine in pure mathematics: learned correlations pointed to new links between Khovanov and knot Floer homology and to a connection between quantum algebraic and hyperbolic invariants reminiscent of the generalized volume conjecture.",
    problem:
      "Relations between knot invariants are typically found one at a time by hand; no systematic tool existed for scanning the huge space of candidate invariant relations.",
    date: "2022-11-02",
    researchArea: "Mathematical Discovery",
    subArea: "machine-learning conjecture generation in knot theory",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2211.01404",
    paperUrl: "https://arxiv.org/abs/2211.01404",
    papers: [
      {
        title: "Illuminating new and known relations between knot invariants",
        url: "https://arxiv.org/abs/2211.01404",
        year: 2022,
      },
    ],
    authors: ["Jessica Craven", "Mark Hughes", "Vishnu Jejjala", "Arjun Kar"],
    institution: "MPIM Bonn",
    model: ["Neural network regressors over knot invariant tables"],
    benchmark: ["~200,000 knot-invariant input/output sets"],
    keyContributions: [
      "Automated scan of nearly 200,000 invariant sets with multipartite correlation filtering",
      "Rediscovery of known polynomial, homological and hyperbolic invariant relations as a sanity check",
      "Novel unexplained correlations strengthening links between Khovanov and knot Floer homology",
      "Evidence for a new connection between quantum algebraic and hyperbolic invariants",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-llm-sr-equation-discovery",
    title: "LLM-SR: Scientific Equation Discovery via Programming with Large Language Models",
    slug: "llm-sr-scientific-equation-discovery",
    summary:
      "LLM-SR treats candidate equations as programs with mathematical operators and combines an LLM's scientific priors with evolutionary search: the model proposes new equation-skeleton hypotheses that are then fitted against data, and on four deliberately anti-recitation benchmarks across physics and biology it beats state-of-the-art symbolic regression baselines, especially out of distribution.",
    significance:
      "It showed that symbolic equation discovery improves when the search is guided by a language model's scientific knowledge instead of data alone, and that expression-tree representations were a key bottleneck in classic symbolic regression.",
    problem:
      "Symbolic regression methods extract equations from data alone, discard scientists' domain priors, and are restricted to low-expressivity representations such as expression trees, which limits both search efficiency and the equations they can express.",
    date: "2024-04-29",
    researchArea: "Symbolic Mathematics",
    subArea: "LLM-guided symbolic regression and equation discovery",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2404.18400",
    paperUrl: "https://arxiv.org/abs/2404.18400",
    githubUrl: "https://github.com/deep-symbolic-mathematics/LLM-SR",
    papers: [
      {
        title: "LLM-SR: Scientific Equation Discovery via Programming with Large Language Models",
        url: "https://arxiv.org/abs/2404.18400",
        venue: "ICLR",
        year: 2025,
      },
    ],
    authors: [
      "Parshin Shojaee",
      "Kazem Meidani",
      "Shashank Gupta",
      "Amir Barati Farimani",
      "Chandan K Reddy",
    ],
    model: ["LLM-SR"],
    benchmark: [
      "Four scientific equation-discovery benchmarks (physics, biology)",
    ],
    keyContributions: [
      "Equations-as-programs representation with LLM-proposed skeletons and evolutionary search",
      "Benchmarks designed to simulate the discovery process and prevent LLM recitation of known equations",
      "Significant gains over symbolic regression baselines, especially in out-of-domain tests",
      "Open-sourced code and data",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-lasr-learned-concept-library",
    title: "Symbolic Regression with a Learned Concept Library",
    slug: "lasr-symbolic-regression-learned-concept-library",
    summary:
      "LaSR enhances genetic-algorithm symbolic regression by inducing a library of abstract textual concepts that a large language model discovers and evolves through zero-shot queries, alternating evolutionary and LLM-guided steps conditioned on those concepts; it substantially outperforms state-of-the-art symbolic regression methods on the Feynman equations and synthetic tasks, and is used to discover a novel scaling law for LLMs.",
    significance:
      "It demonstrated that an LLM-driven concept abstraction layer makes symbolic regression both stronger and more interpretable, and that the method can produce a genuine scientific discovery — a new LLM scaling law — beyond the benchmark itself.",
    problem:
      "Classic genetic-programming symbolic regression searches purely syntactically, which leads to combinatorial explosion, overfitting and hard-to-interpret expressions, and it has no notion of reusable abstract concepts.",
    date: "2024-09-14",
    researchArea: "Symbolic Mathematics",
    subArea: "LLM-guided symbolic regression",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2409.09359",
    paperUrl: "https://arxiv.org/abs/2409.09359",
    papers: [
      {
        title: "Symbolic Regression with a Learned Concept Library",
        url: "https://arxiv.org/abs/2409.09359",
        venue: "NeurIPS",
        year: 2024,
      },
    ],
    authors: [
      "Arya Grayeli",
      "Atharva Sehgal",
      "Omar Costilla-Reyes",
      "Miles Cranmer",
      "Swarat Chaudhuri",
    ],
    model: ["LaSR"],
    benchmark: ["Feynman symbolic regression equations"],
    keyContributions: [
      "A concept library induced and evolved through zero-shot LLM queries",
      "Alternating evolutionary and LLM-guided search steps conditioned on discovered concepts",
      "Outperforms deep-learning and evolutionary symbolic regression baselines on Feynman equations",
      "Discovery of a novel and powerful scaling law for LLMs",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-geox-formalized-vision-language",
    title:
      "GeoX: Geometric Problem Solving Through Unified Formalized Vision-Language Pre-training",
    slug: "geox-formalized-vision-language-geometry",
    summary:
      "GeoX is a multi-modal model built specifically for geometry: a dedicated diagram encoder and symbol decoder are pre-trained unimodally, aligned to language through geometry-language alignment pre-training, and refined with a Generator-And-Sampler Transformer plus visual instruction tuning so that it can take geometric images and questions as input and emit verifiable solutions, outperforming generalists and geometric specialists on GeoQA, UniGeo, Geometry3K and PGPS9k.",
    significance:
      "It addressed the mismatch between natural image-text pre-training and geometric diagram-symbol input directly in the architecture, moving multimodal geometry solving towards verifiable, symbol-aware solutions rather than free-form answers.",
    problem:
      "Multi-modal large language models struggle with geometry problem solving because they are pre-trained on natural images and texts, lack automated verification during reasoning, and existing geometry specialists are too task-specific to generalize.",
    date: "2024-12-16",
    researchArea: "Geometry",
    subArea: "multimodal geometry problem solving",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2412.11863",
    paperUrl: "https://arxiv.org/abs/2412.11863",
    githubUrl: "https://github.com/InternScience/GeoX",
    papers: [
      {
        title:
          "GeoX: Geometric Problem Solving Through Unified Formalized Vision-Language Pre-training",
        url: "https://arxiv.org/abs/2412.11863",
        venue: "ICLR",
        year: 2025,
      },
    ],
    authors: [
      "Renqiu Xia",
      "Mingsheng Li",
      "Hancheng Ye",
      "Wenjie Wu",
      "Hongbin Zhou",
      "Jiakang Yuan",
      "Tianshuo Peng",
      "Xinyu Cai",
      "Xiangchao Yan",
      "Bin Wang",
      "Conghui He",
      "Botian Shi",
      "Tao Chen",
      "Junchi Yan",
      "Bo Zhang",
    ],
    model: ["GeoX"],
    benchmark: ["GeoQA", "UniGeo", "Geometry3K", "PGPS9k"],
    keyContributions: [
      "Unimodal pre-training of a geometric diagram encoder and symbol decoder",
      "Geometry-language alignment bridging the modality gap for geometric inputs",
      "Generator-And-Sampler Transformer (GS-Former) for discriminative geometric queries",
      "Visual instruction tuning producing verifiable solutions on four standard GPS benchmarks",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
];

