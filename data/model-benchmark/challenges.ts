/**
 * Model-capability comparison — same problem, different models (2020– ).
 *
 * Stage 1 records published OpenAI and Anthropic task results. A task may be
 * a named benchmark or one mathematical statement; those units are labelled
 * separately. Domestic runs will be added only after they actually exist.
 *
 * Honesty contract:
 * - `frontier` attempts carry results actually published in the cited source,
 *   with the source URL attached. Numbers are copied from that source, never
 *   estimated or upgraded.
 * - No empty domestic attempt is displayed as though a comparison exists.
 * - The public task and its reference result must be traceable to a source.
 */

export type ModelOrigin = "frontier" | "domestic";
export type AttemptStatus = "reported" | "pending";

export interface ResourceFigure {
  /** What is measured, e.g. "输出 token" / "搜索次数" / "时间". */
  label: { zh: string; en: string };
  /** Measured value from the source, or "待填" for a pending attempt. */
  value: { zh: string; en: string };
}

export interface ModelAttempt {
  id: string;
  /** Model / system label exactly as the source names it; "待填" when pending. */
  model: { zh: string; en: string };
  origin: ModelOrigin;
  /** Organisation running the model (lab or domestic team). */
  vendor: { zh: string; en: string };
  status: AttemptStatus;
  /** Published solving result, or "待填" for a pending attempt. */
  result: { zh: string; en: string };
  /** Resources consumed; empty array only when nothing is disclosed. */
  resources: ResourceFigure[];
  /** Primary source for a reported attempt; absent for a pending attempt. */
  sourceUrl?: string;
}

export interface BenchmarkChallenge {
  id: string;
  /** Dataset-level aggregate or one named mathematical statement. */
  unit: "benchmark" | "problem";
  /** Short task name. */
  title: { zh: string; en: string };
  /** The reproducible problem / task, described so it can be re-run. */
  task: { zh: string; en: string };
  /** Dataset, benchmark or tournament the task comes from. */
  benchmark: { zh: string; en: string };
  /** The frontier-lab public case that surfaced this task. */
  sourceCase: {
    lab: "openai" | "anthropic";
    /** Corresponding entry in the supplied timeline, when one exists. */
    archiveId?: string;
    date: string;
    caption: { zh: string; en: string };
    url: string;
  };
  /** How results are scored, and the caveat on comparing them. */
  metric: { zh: string; en: string };
  attempts: ModelAttempt[];
}

export const BENCHMARK_CHALLENGES: BenchmarkChallenge[] = [
  {
    id: "ch-gsm8k",
    unit: "benchmark",
    title: { zh: "GSM8K 小学数学应用题", en: "GSM8K grade-school word problems" },
    task: {
      zh: "用自然语言解决需要 2—8 步计算的小学数学应用题。题集公开，可逐题重跑同一批题目并比对最终答案正确率。",
      en: "Solve grade-school math word problems requiring 2–8 arithmetic steps. The dataset is public, so the same questions can be re-run and final-answer accuracy compared.",
    },
    benchmark: {
      zh: "GSM8K（约 8500 题：7500 训练 / 1000 测试，公开）",
      en: "GSM8K (~8,500 problems: 7,500 train / 1,000 test, public)",
    },
    sourceCase: {
      lab: "openai",
      archiveId: "lab-02",
      date: "2021-10-27",
      caption: {
        zh: "OpenAI《Training Verifiers to Solve Math Word Problems》",
        en: "OpenAI, “Training Verifiers to Solve Math Word Problems”",
      },
      url: "https://arxiv.org/abs/2110.14168",
    },
    metric: {
      zh: "最终答案正确率。注意：只检查最终答案，可能奖励推导错误但碰巧答对的解；候选数与验证器口径需一并写明。",
      en: "Final-answer accuracy. Caveat: checking only the final answer can reward a wrong derivation that happens to land on the right number; candidate count and verifier setup must be stated.",
    },
    attempts: [
      {
        id: "gsm8k-frontier-6b-verifier",
        model: { zh: "6B 生成器 + 验证器", en: "6B generator + verifier" },
        origin: "frontier",
        vendor: { zh: "OpenAI", en: "OpenAI" },
        status: "reported",
        result: {
          zh: "6B 模型加验证器略胜 175B 纯微调模型（论文口径）。",
          en: "A 6B model with a verifier slightly beat a 175B fine-tuned-only model (per the paper).",
        },
        resources: [
          {
            label: { zh: "每题候选解", en: "Candidates per problem" },
            value: { zh: "一般约 100 个", en: "typically ~100" },
          },
          {
            label: { zh: "模型规模", en: "Model scale" },
            value: { zh: "6B（对照 175B）", en: "6B (vs 175B)" },
          },
        ],
        sourceUrl: "https://arxiv.org/abs/2110.14168",
      },
      {
        id: "gsm8k-anthropic-claude2",
        model: { zh: "Claude 2", en: "Claude 2" },
        origin: "frontier",
        vendor: { zh: "Anthropic", en: "Anthropic" },
        status: "reported",
        result: {
          zh: "Anthropic 公告报告 GSM8K 得分 88.0%；未披露可用于严格对齐 OpenAI 论文的完整评测协议。",
          en: "Anthropic reported 88.0% on GSM8K; its announcement does not disclose a full protocol aligned with the OpenAI paper.",
        },
        resources: [],
        sourceUrl: "https://www.anthropic.com/news/claude-2",
      },
    ],
  },
  {
    id: "ch-minif2f",
    unit: "benchmark",
    title: { zh: "miniF2F 形式化竞赛题", en: "miniF2F formalised competition problems" },
    task: {
      zh: "在 Lean 中证明形式化的竞赛数学命题（AMC/AIME 及改编的 IMO 命题）。基准公开，证明可由 Lean 内核验算，可逐题重跑。",
      en: "Prove formalised competition-math statements in Lean (AMC/AIME and adapted IMO problems). The benchmark is public and proofs are checked by the Lean kernel, so each problem can be re-run.",
    },
    benchmark: {
      zh: "miniF2F（验证集 / 测试集各 244 题，公开）",
      en: "miniF2F (244 validation / 244 test problems, public)",
    },
    sourceCase: {
      lab: "openai",
      archiveId: "lab-03",
      date: "2022-02-02",
      caption: {
        zh: "OpenAI《Formal Mathematics Statement Curriculum Learning》",
        en: "OpenAI, “Formal Mathematics Statement Curriculum Learning”",
      },
      url: "https://arxiv.org/abs/2202.01344",
    },
    metric: {
      zh: "在给定尝试次数下的证明完成率，由 Lean 内核检查。不同尝试次数不可直接比较，须注明预算。",
      en: "Proof success rate at a given attempt budget, checked by the Lean kernel. Rates at different budgets are not directly comparable; the budget must be stated.",
    },
    attempts: [
      {
        id: "minif2f-frontier-expert-iteration",
        model: { zh: "GPT-f 路线 774M + 专家迭代", en: "GPT-f-line 774M + expert iteration" },
        origin: "frontier",
        vendor: { zh: "OpenAI", en: "OpenAI" },
        status: "reported",
        result: {
          zh: "64 次尝试：验证集 47.3% / 测试集 36.6%；8 次尝试：41.2% / 34.5%（论文 Table 2）。",
          en: "At 64 attempts: 47.3% validation / 36.6% test; at 8 attempts: 41.2% / 34.5% (paper Table 2).",
        },
        resources: [
          {
            label: { zh: "搜索预算", en: "Search budget" },
            value: { zh: "64 次 / 8 次尝试", en: "64 / 8 attempts" },
          },
          {
            label: { zh: "模型规模", en: "Model scale" },
            value: { zh: "774M", en: "774M" },
          },
        ],
        sourceUrl: "https://arxiv.org/abs/2202.01344",
      },
    ],
  },
  {
    id: "ch-metamath",
    unit: "benchmark",
    title: { zh: "Metamath set.mm 已知定理重证明", en: "Metamath set.mm reproof of known theorems" },
    task: {
      zh: "在 Metamath 的 set.mm 数学库中，为已知定理自动找到正确证明，并寻找比原证明更短的推导。库与保留测试集公开，证明可由 Metamath 内核验算。",
      en: "Automatically find correct proofs for known theorems in Metamath's set.mm library, including shorter derivations. The library and held-out split are public and proofs are checkable by the Metamath kernel.",
    },
    benchmark: {
      zh: "set.mm 保留测试定理（约 1000 题，公开）",
      en: "set.mm held-out theorems (~1,000, public)",
    },
    sourceCase: {
      lab: "openai",
      archiveId: "lab-01",
      date: "2020-09-07",
      caption: {
        zh: "OpenAI《Generative Language Modeling for Automated Theorem Proving》",
        en: "OpenAI, “Generative Language Modeling for Automated Theorem Proving”",
      },
      url: "https://arxiv.org/abs/2009.03393",
    },
    metric: {
      zh: "保留定理上的证明完成率 + 被主库接受的缩短证明数。这是已知定理的重证明，不是解决开放问题，不能混为一谈。",
      en: "Proof success rate on held-out theorems plus shortened proofs accepted into the main library. These are reproofs of known theorems, not solutions to open problems.",
    },
    attempts: [
      {
        id: "metamath-frontier-gptf",
        model: { zh: "GPT-f（最大 700M）", en: "GPT-f (up to 700M)" },
        origin: "frontier",
        vendor: { zh: "OpenAI", en: "OpenAI" },
        status: "reported",
        result: {
          zh: "约 1000 道保留定理上 56.22% 完成率；23 个缩短证明被 set.mm 主库接受。",
          en: "56.22% on ~1,000 held-out theorems; 23 shortened proofs accepted into set.mm.",
        },
        resources: [
          {
            label: { zh: "搜索预算", en: "Search budget" },
            value: { zh: "每题 32 次尝试", en: "32 attempts per problem" },
          },
          {
            label: { zh: "模型规模", en: "Model scale" },
            value: { zh: "最大 700M", en: "up to 700M" },
          },
        ],
        sourceUrl: "https://arxiv.org/abs/2009.03393",
      },
    ],
  },
  {
    id: "ch-flt-formalization",
    unit: "problem",
    title: { zh: "费马大定理的 Lean 形式化", en: "Lean formalization of Fermat's Last Theorem" },
    task: {
      zh: "在 Lean 中完成费马大定理的端到端形式化，并由 Lean 内核检查最终定理。原实验使用内部模型和多代理系统，公开目标可核对，但完整运行条件无法照搬。",
      en: "Formalize Fermat's Last Theorem end to end in Lean and check the final statement with the Lean kernel. The public target is inspectable, while the original internal-model and multi-agent setup cannot be reproduced exactly.",
    },
    benchmark: { zh: "单项定理；已知结果的形式化", en: "Single theorem; formalization of a known result" },
    sourceCase: {
      lab: "anthropic",
      archiveId: "lab-38",
      date: "2026-09-04",
      caption: { zh: "Anthropic《Formalizing Fermat's Last Theorem》", en: "Anthropic, “Formalizing Fermat's Last Theorem”" },
      url: "https://www.anthropic.com/research/formalizing-fermats-last-theorem",
    },
    metric: {
      zh: "最终 Lean 定理是否通过内核检查，并核对其陈述与目标定理一致；所用模型、工具与预算需分别记录。",
      en: "Whether Lean checks the final theorem and its statement matches the target; model, tools and budget must be recorded separately.",
    },
    attempts: [{
      id: "flt-anthropic-claude-research",
      model: { zh: "Claude 内部研究模型 + Prove2Me 多代理系统", en: "Claude internal research model + Prove2Me multi-agent system" },
      origin: "frontier",
      vendor: { zh: "Anthropic", en: "Anthropic" },
      status: "reported",
      result: {
        zh: "Anthropic 报告完成端到端 Lean 形式化，公开证明工件；这是对已知定理的形式化，不是首次解决费马大定理。",
        en: "Anthropic reports an end-to-end Lean formalization and publishes the proof artifact. This formalizes a known theorem; it is not a new solution to FLT.",
      },
      resources: [
        { label: { zh: "历时", en: "Elapsed time" }, value: { zh: "约 11 天", en: "about 11 days" } },
        { label: { zh: "输出 Token", en: "Output tokens" }, value: { zh: "约 60 亿", en: "about 6 billion" } },
      ],
      sourceUrl: "https://www.anthropic.com/research/formalizing-fermats-last-theorem",
    }],
  },
  {
    id: "ch-unit-distance",
    unit: "problem",
    title: { zh: "平面单位距离的超线性构造", en: "Superlinear constructions for planar unit distances" },
    task: {
      zh: "构造无限多种平面点集，使相距恰为 1 的点对数达到点数的某个固定大于 1 的幂次；原文给出证明，不能把它写成精确求出单位距离问题的最大值。",
      en: "Construct infinitely many planar point sets with at least n to some fixed power greater than 1 unit-distance pairs. The source does not determine the exact extremal function.",
    },
    benchmark: { zh: "单项开放问题；单位距离猜想", en: "Single open problem; unit-distance conjecture" },
    sourceCase: {
      lab: "openai", archiveId: "lab-26", date: "2026-05-20",
      caption: { zh: "OpenAI《An OpenAI model has disproved a central conjecture in discrete geometry》", en: "OpenAI, “An OpenAI model has disproved a central conjecture in discrete geometry”" },
      url: "https://openai.com/index/model-disproves-discrete-geometry-conjecture/",
    },
    metric: {
      zh: "检查构造、渐近下界和证明是否成立；原实验使用未公开内部模型，模型能力与实验条件不能按公开产品直接复现。",
      en: "Check the construction, asymptotic lower bound and proof. The original internal model is unpublished, so its setup cannot be matched to a public product.",
    },
    attempts: [{
      id: "unit-distance-openai-internal",
      model: { zh: "OpenAI 未公开内部模型", en: "Unreleased OpenAI internal model" },
      origin: "frontier", vendor: { zh: "OpenAI", en: "OpenAI" }, status: "reported",
      result: {
        zh: "OpenAI 公布超线性单位距离构造及证明；外部数学家另写核查说明。原证明未给出明确指数，后续改进另计。",
        en: "OpenAI published a superlinear unit-distance construction and proof, with a separate note by external mathematicians. The original proof did not give an explicit exponent; later improvements are separate.",
      },
      resources: [],
      sourceUrl: "https://cdn.openai.com/pdf/74c24085-19b0-4534-9c90-465b8e29ad73/unit-distance-proof.pdf",
    }],
  },
];

/** Stable display order: newest source case first. */
export const BENCHMARK_ORDER = [...BENCHMARK_CHALLENGES].sort((a, b) =>
  b.sourceCase.date.localeCompare(a.sourceCase.date)
);
