/**
 * Expansion set: verified research events for
 *  - LLM for Mathematics
 *  - Mathematical Reasoning
 *  - Benchmarks & Datasets
 *
 * Every sourceUrl / paperUrl was fetched from the arXiv abs page and its
 * content matched before inclusion; githubUrl entries were confirmed via the
 * official GitHub API (api.github.com). Fields that could not be verified
 * from a primary source are omitted rather than guessed.
 */
import type { ResearchEvent } from "../../types";

export const events: ResearchEvent[] = [
  {
    id: "evt-svamp-robustness-challenge-math-word-problems",
    title:
      "SVAMP: Are NLP Models really able to Solve Simple Math Word Problems?",
    slug: "svamp-robustness-challenge-math-word-problems",
    summary:
      "A NAACL 2021 paper showing that math word problem solvers rely on shallow heuristics — models without access to the question, or treating problems as bag-of-words, still solve a large fraction of existing benchmarks — and introducing SVAMP, a challenge set built by applying carefully chosen variations to examples from existing datasets.",
    significance:
      "SVAMP became the standard robustness probe for elementary math word problems: it demonstrated that near-saturated benchmark scores did not reflect real problem understanding, and it is widely used to evaluate later LLM reasoning (e.g., as a target of self-consistency gains).",
    problem:
      "Elementary-level math word problem benchmarks appeared solved, but it was unclear whether solvers actually understood the problems rather than exploiting dataset artifacts.",
    date: "2021-03-12",
    researchArea: "Benchmarks & Datasets",
    subArea: "math word problem robustness benchmark",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2103.07191",
    paperUrl: "https://arxiv.org/abs/2103.07191",
    githubUrl: "https://github.com/arkilpatel/SVAMP",
    papers: [
      {
        title:
          "Are NLP Models really able to Solve Simple Math Word Problems?",
        url: "https://arxiv.org/abs/2103.07191",
        venue: "NAACL 2021",
        year: 2021,
      },
    ],
    authors: ["Arkil Patel", "Satwik Bhattamishra", "Navin Goyal"],
    benchmark: ["SVAMP"],
    dataset: ["SVAMP (challenge set over existing MWP datasets)"],
    keyContributions: [
      "Evidence that MWP solvers rely on shallow heuristics (solving without the question, bag-of-words baselines)",
      "SVAMP challenge dataset built via carefully chosen variations of existing examples",
      "Showed state-of-the-art accuracy drops substantially under the variations",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-asdiv-diverse-math-word-problem-corpus",
    title:
      "A Diverse Corpus for Evaluating and Developing English Math Word Problem Solvers (ASDiv)",
    slug: "asdiv-diverse-math-word-problem-corpus",
    summary:
      "The paper presents ASDiv (Academia Sinica Diverse MWP Dataset), an English math word problem corpus of 2,305 problems covering more text patterns and most problem types taught in elementary school, with each problem annotated by problem type and grade level, plus a metric for measuring lexicon usage diversity of MWP corpora.",
    significance:
      "ASDiv addressed the narrow coverage of existing MWP corpora and was shown to reflect the true capability of solvers more faithfully, making it a standard diverse evaluation corpus for elementary-level math word problems.",
    problem:
      "Existing MWP corpora were limited either in language usage patterns or in problem types, so gains on them did not generalize.",
    date: "2021-06-30",
    researchArea: "Benchmarks & Datasets",
    subArea: "math word problem dataset",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2106.15772",
    paperUrl: "https://arxiv.org/abs/2106.15772",
    papers: [
      {
        title:
          "A Diverse Corpus for Evaluating and Developing English Math Word Problem Solvers",
        url: "https://arxiv.org/abs/2106.15772",
        venue: "ACL 2020",
        year: 2020,
      },
    ],
    authors: ["Shen-Yun Miao", "Chao-Chun Liang", "Keh-Yih Su"],
    institution: "Academia Sinica",
    dataset: ["ASDiv (2,305 annotated MWPs)"],
    keyContributions: [
      "2,305 English MWPs annotated with problem type and grade level",
      "A lexicon-usage-diversity metric demonstrating ASDiv is more diverse than existing corpora",
      "Experiments showing the corpus reflects solver capability more faithfully",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-chain-of-thought-prompting-reasoning-llms",
    title:
      "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
    slug: "chain-of-thought-prompting-reasoning-llms",
    summary:
      "The paper shows that prompting large language models with a few exemplars that contain intermediate reasoning steps ('chains of thought') significantly improves performance on arithmetic, commonsense and symbolic reasoning tasks; prompting a 540B-parameter model with just eight chain-of-thought exemplars reaches state-of-the-art accuracy on GSM8K, surpassing finetuned GPT-3 with a verifier.",
    significance:
      "Chain-of-thought prompting became the foundational technique of the LLM mathematical-reasoning era — essentially all later math-LLM work (self-consistency, process supervision, RL for math) builds on eliciting intermediate reasoning steps.",
    problem:
      "Large language models struggled with multi-step reasoning tasks that require decomposing a problem before answering it.",
    date: "2022-01-28",
    researchArea: "Mathematical Reasoning",
    subArea: "chain-of-thought prompting",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2201.11903",
    paperUrl: "https://arxiv.org/abs/2201.11903",
    papers: [
      {
        title:
          "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
        url: "https://arxiv.org/abs/2201.11903",
        year: 2022,
      },
    ],
    authors: [
      "Jason Wei",
      "Xuezhi Wang",
      "Dale Schuurmans",
      "Maarten Bosma",
      "Brian Ichter",
      "Fei Xia",
      "Ed Chi",
      "Quoc Le",
      "Denny Zhou",
    ],
    model: ["540B-parameter language model", "GPT-3 (fine-tuned baseline)"],
    benchmark: ["GSM8K"],
    keyContributions: [
      "Chain-of-thought prompting: a few reasoning-step exemplars unlock complex reasoning",
      "State-of-the-art GSM8K accuracy with a 540B model and eight exemplars",
      "Striking gains across arithmetic, commonsense and symbolic reasoning tasks",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-self-consistency-chain-of-thought-decoding",
    title:
      "Self-Consistency Improves Chain of Thought Reasoning in Language Models",
    slug: "self-consistency-chain-of-thought-decoding",
    summary:
      "The paper replaces greedy decoding in chain-of-thought prompting with self-consistency: sample a diverse set of reasoning paths and marginalize to the most consistent answer. Reported gains include GSM8K +17.9%, SVAMP +11.0%, AQuA +12.2%, StrategyQA +6.4% and ARC-challenge +3.9%.",
    significance:
      "Self-consistency became the standard test-time scaling baseline for math reasoning — sampling and marginalizing reasoning paths is still the reference technique that newer verifiers and RL methods are compared against.",
    problem:
      "Greedy chain-of-thought decoding takes a single reasoning path, so one unlucky step ruins the answer even when the model knows how to solve the problem.",
    date: "2022-03-21",
    researchArea: "Mathematical Reasoning",
    subArea: "sampling-based decoding",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2203.11171",
    paperUrl: "https://arxiv.org/abs/2203.11171",
    papers: [
      {
        title:
          "Self-Consistency Improves Chain of Thought Reasoning in Language Models",
        url: "https://arxiv.org/abs/2203.11171",
        venue: "ICLR 2023",
        year: 2022,
      },
    ],
    authors: [
      "Xuezhi Wang",
      "Jason Wei",
      "Dale Schuurmans",
      "Quoc Le",
      "Ed Chi",
      "Sharan Narang",
      "Aakanksha Chowdhery",
      "Denny Zhou",
    ],
    benchmark: ["GSM8K", "SVAMP", "AQuA", "StrategyQA", "ARC-challenge"],
    keyContributions: [
      "A decoding strategy that samples diverse reasoning paths and marginalizes to the most consistent answer",
      "Double-digit gains on GSM8K (+17.9%) and SVAMP (+11.0%) over greedy chain-of-thought",
      "Established sampling-and-marginalizing as a test-time compute baseline for reasoning",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-least-to-most-prompting-complex-reasoning",
    title:
      "Least-to-Most Prompting Enables Complex Reasoning in Large Language Models",
    slug: "least-to-most-prompting-complex-reasoning",
    summary:
      "The paper proposes least-to-most prompting: decompose a complex problem into a series of simpler subproblems and solve them in sequence, using answers to earlier subproblems to solve later ones. With GPT-3 code-davinci-002 it solves SCAN in any split (including length split) with at least 99% accuracy using just 14 exemplars, versus 16% accuracy with chain-of-thought prompting.",
    significance:
      "It introduced easy-to-hard decomposition as a prompting strategy, demonstrating generalization to problems harder than the exemplars — a precursor to the decompose-then-solve paradigm used across mathematical reasoning and agent pipelines.",
    problem:
      "Chain-of-thought prompting fails to generalize to problems harder than the exemplars shown in the prompt.",
    date: "2022-05-21",
    researchArea: "Mathematical Reasoning",
    subArea: "decomposition prompting",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2205.10625",
    paperUrl: "https://arxiv.org/abs/2205.10625",
    papers: [
      {
        title:
          "Least-to-Most Prompting Enables Complex Reasoning in Large Language Models",
        url: "https://arxiv.org/abs/2205.10625",
        venue: "ICLR 2023",
        year: 2022,
      },
    ],
    authors: [
      "Denny Zhou",
      "Nathanael Schärli",
      "Le Hou",
      "Jason Wei",
      "Nathan Scales",
      "Xuezhi Wang",
      "Dale Schuurmans",
      "Claire Cui",
      "Olivier Bousquet",
      "Quoc Le",
      "Ed Chi",
    ],
    model: ["GPT-3 code-davinci-002"],
    benchmark: ["SCAN"],
    keyContributions: [
      "Least-to-most decomposition: solve simpler subproblems in sequence to tackle harder ones",
      "At least 99% accuracy on SCAN length split with 14 exemplars vs 16% for chain-of-thought",
      "Demonstrated easy-to-hard generalization on symbolic manipulation, compositional generalization and math reasoning",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-pal-program-aided-language-models",
    title: "PAL: Program-aided Language Models",
    slug: "pal-program-aided-language-models",
    summary:
      "The paper presents Program-Aided Language models (PAL): the LLM reads the natural-language problem and emits a program as the intermediate reasoning steps, while a Python interpreter executes it. Across 13 mathematical, symbolic and algorithmic reasoning tasks from BIG-Bench Hard and other benchmarks, PAL with Codex reaches state-of-the-art few-shot accuracy on GSM8K, surpassing chain-of-thought PaLM-540B by 15% absolute top-1.",
    significance:
      "PAL founded the 'neural LLM + symbolic interpreter' line for math reasoning: delegating computation to a program runtime removes arithmetic slip-ups, and the approach directly fed into later tool-integrated reasoning agents such as ToRA.",
    problem:
      "LLMs often make logical and arithmetic mistakes when solving problems step-by-step in natural language, even when the decomposition is correct.",
    date: "2022-11-18",
    researchArea: "LLM for Mathematics",
    subArea: "program-aided reasoning",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2211.10435",
    paperUrl: "https://arxiv.org/abs/2211.10435",
    papers: [
      {
        title: "PAL: Program-aided Language Models",
        url: "https://arxiv.org/abs/2211.10435",
        year: 2022,
      },
    ],
    authors: [
      "Luyu Gao",
      "Aman Madaan",
      "Shuyan Zhou",
      "Uri Alon",
      "Pengfei Liu",
      "Yiming Yang",
      "Jamie Callan",
      "Graham Neubig",
    ],
    model: ["Codex", "PaLM-540B (chain-of-thought baseline)"],
    benchmark: ["GSM8K", "BIG-Bench Hard"],
    keyContributions: [
      "Offload execution of reasoning steps to a Python interpreter while the LLM handles decomposition",
      "State-of-the-art few-shot GSM8K accuracy, +15% absolute over chain-of-thought PaLM-540B",
      "Demonstrated across 13 mathematical, symbolic and algorithmic reasoning tasks",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-theoremqa-theorem-driven-question-answering",
    title: "TheoremQA: A Theorem-driven Question Answering dataset",
    slug: "theoremqa-theorem-driven-question-answering",
    summary:
      "The paper introduces TheoremQA, the first theorem-driven question-answering dataset: 800 expert-curated questions covering 350 theorems (from Taylor's theorem to Huffman coding, quantum and elasticity theorems) across Math, Physics, EE&CS and Finance. Among 16 evaluated large language and code models, GPT-4 reaches 51% with Program-of-Thoughts prompting, while all open-sourced models stay below 15%.",
    significance:
      "TheoremQA moved evaluation beyond GSM8K-style arithmetic to applying named theorems to hard science questions, quantifying a large gap between proprietary and open models and remaining a standard harder math/science QA benchmark.",
    problem:
      "LLMs exceed 90% on fundamental benchmarks like GSM8K, but their ability to apply domain-specific theorems to challenging science problems was untested.",
    date: "2023-05-21",
    researchArea: "Benchmarks & Datasets",
    subArea: "theorem-driven QA benchmark",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2305.12524",
    paperUrl: "https://arxiv.org/abs/2305.12524",
    githubUrl: "https://github.com/wenhuchen/TheoremQA",
    papers: [
      {
        title: "TheoremQA: A Theorem-driven Question Answering dataset",
        url: "https://arxiv.org/abs/2305.12524",
        venue: "EMNLP 2023",
        year: 2023,
      },
    ],
    authors: [
      "Wenhu Chen",
      "Ming Yin",
      "Max Ku",
      "Pan Lu",
      "Yixin Wan",
      "Xueguang Ma",
      "Jianyu Xu",
      "Xinyi Wang",
      "Tony Xia",
    ],
    model: ["GPT-4", "PaLM-2"],
    benchmark: ["TheoremQA"],
    dataset: ["TheoremQA (800 questions over 350 theorems)"],
    keyContributions: [
      "First theorem-driven QA dataset: 800 questions covering 350 theorems across four domains",
      "Systematic evaluation of 16 language and code models with Chain-of-Thoughts and Program-of-Thoughts",
      "GPT-4 at 51% vs open-source models below 15%, exposing a large capability gap",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-tora-tool-integrated-reasoning-agents",
    title: "ToRA: A Tool-Integrated Reasoning Agent for Mathematical Problem Solving",
    slug: "tora-tool-integrated-reasoning-agents",
    summary:
      "The paper proposes ToRA, a series of Tool-integrated Reasoning Agents that combine natural language reasoning with external tools such as computation libraries and symbolic solvers, trained on curated tool-use trajectories with imitation learning and output space shaping. ToRA models outperform open-source models on 10 mathematical reasoning datasets with 13%-19% absolute improvements on average; ToRA-7B reaches 44.6% on MATH (+22% over WizardMath-70B) and ToRA-Code-34B is the first open-source model above 50% on MATH, beating GPT-4's chain-of-thought result.",
    significance:
      "ToRA defined the tool-integrated paradigm for open math models — language reasoning interleaved with symbolic computation — and set the open-source state of the art on MATH at the time, directly extending the PAL line to trained agents.",
    problem:
      "Language models are strong at analysis but weak at heavy computation, while tools are strong at computation but need the reasoning scaffolding a model provides.",
    date: "2023-09-29",
    researchArea: "LLM for Mathematics",
    subArea: "tool-integrated reasoning",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2309.17452",
    paperUrl: "https://arxiv.org/abs/2309.17452",
    githubUrl: "https://github.com/microsoft/ToRA",
    papers: [
      {
        title:
          "ToRA: A Tool-Integrated Reasoning Agent for Mathematical Problem Solving",
        url: "https://arxiv.org/abs/2309.17452",
        venue: "ICLR 2024",
        year: 2023,
      },
    ],
    authors: [
      "Zhibin Gou",
      "Zhihong Shao",
      "Yeyun Gong",
      "Yelong Shen",
      "Yujiu Yang",
      "Minlie Huang",
      "Nan Duan",
      "Weizhu Chen",
    ],
    institution: "Microsoft",
    model: ["ToRA-7B", "ToRA-Code-34B", "WizardMath-70B (baseline)", "GPT-4 (baseline)"],
    benchmark: ["MATH", "10 mathematical reasoning datasets"],
    keyContributions: [
      "Tool-integrated reasoning agents trained on curated tool-use trajectories with output space shaping",
      "13%-19% absolute average improvements across 10 mathematical reasoning datasets",
      "First open-source model above 50% on MATH, competitive with GPT-4 solving problems with programs",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-mathvista-visual-mathematical-reasoning-benchmark",
    title:
      "MathVista: Evaluating Mathematical Reasoning of Foundation Models in Visual Contexts",
    slug: "mathvista-visual-mathematical-reasoning-benchmark",
    summary:
      "The paper presents MathVista, a benchmark combining challenges from diverse mathematical and visual tasks: 6,141 examples derived from 28 existing multimodal datasets plus 3 newly created ones (IQTest, FunctionQA, PaperQA). In the evaluation of 12 prominent foundation models, GPT-4V leads with 49.9% overall accuracy, 15.1% ahead of Bard but still 10.4% below human performance.",
    significance:
      "MathVista became the standard benchmark for visual mathematical reasoning, revealing that even the strongest multimodal models struggle with complex figures and compositional reasoning — a gap that frames much subsequent work on multimodal math agents.",
    problem:
      "Mathematical reasoning ability of foundation models in visual contexts had not been systematically studied.",
    date: "2023-10-03",
    researchArea: "Benchmarks & Datasets",
    subArea: "visual mathematical reasoning benchmark",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2310.02255",
    paperUrl: "https://arxiv.org/abs/2310.02255",
    githubUrl: "https://github.com/lupantech/MathVista",
    papers: [
      {
        title:
          "MathVista: Evaluating Mathematical Reasoning of Foundation Models in Visual Contexts",
        url: "https://arxiv.org/abs/2310.02255",
        venue: "ICLR 2024",
        year: 2023,
      },
    ],
    authors: [
      "Pan Lu",
      "Hritik Bansal",
      "Tony Xia",
      "Jiacheng Liu",
      "Chunyuan Li",
      "Hannaneh Hajishirzi",
      "Hao Cheng",
      "Kai-Wei Chang",
      "Michel Galley",
      "Jianfeng Gao",
    ],
    model: ["GPT-4V", "Bard"],
    benchmark: ["MathVista"],
    dataset: [
      "MathVista (6,141 examples from 28 datasets plus IQTest, FunctionQA, PaperQA)",
    ],
    keyContributions: [
      "Benchmark of 6,141 examples combining mathematical and visual tasks",
      "Comprehensive evaluation of 12 foundation models with fine-grained error analysis",
      "GPT-4V at 49.9%, still 10.4% below human performance — quantifying the visual math gap",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-math-shepherd-automatic-process-reward-models",
    title:
      "Math-Shepherd: Verify and Reinforce LLMs Step-by-step without Human Annotations",
    slug: "math-shepherd-automatic-process-reward-models",
    summary:
      "The paper presents Math-Shepherd, a process-oriented math process reward model that scores each step of a solution, trained on automatically constructed process-wise supervision data instead of manual annotation. With step-by-step PPO, Mistral-7B improves from 77.9% to 84.1% on GSM8K and from 28.6% to 33.0% on MATH, reaching 89.1% and 43.5% respectively with Math-Shepherd verification.",
    significance:
      "By automating step-level supervision, Math-Shepherd removed the human-annotation bottleneck of process reward models and became the automatic-PRM reference point for the RL-for-math wave that followed.",
    problem:
      "Existing process supervision relied on heavy manual annotation of every reasoning step.",
    date: "2023-12-14",
    researchArea: "Mathematical Reasoning",
    subArea: "process reward models",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2312.08935",
    paperUrl: "https://arxiv.org/abs/2312.08935",
    papers: [
      {
        title:
          "Math-Shepherd: Verify and Reinforce LLMs Step-by-step without Human Annotations",
        url: "https://arxiv.org/abs/2312.08935",
        year: 2023,
      },
    ],
    authors: [
      "Peiyi Wang",
      "Lei Li",
      "Zhihong Shao",
      "R.X. Xu",
      "Damai Dai",
      "Yifei Li",
      "Deli Chen",
      "Y.Wu",
      "Zhifang Sui",
    ],
    model: ["Mistral-7B"],
    benchmark: ["GSM8K", "MATH"],
    keyContributions: [
      "Process reward model trained on automatically constructed step-wise supervision (no human annotations)",
      "Step-by-step PPO lifts Mistral-7B to 84.1% GSM8K and 33.0% MATH",
      "Verification with the PRM further raises results to 89.1% GSM8K and 43.5% MATH",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-deepseekmath-grpo-open-math-reasoning",
    title:
      "DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models",
    slug: "deepseekmath-grpo-open-math-reasoning",
    summary:
      "The paper introduces DeepSeekMath 7B, continued-pretrained on 120B math-related tokens from Common Crawl plus natural language and code data, reaching 51.7% on the competition-level MATH benchmark without external toolkits or voting (60.9% with self-consistency over 64 samples), and proposes Group Relative Policy Optimization (GRPO), a memory-efficient PPO variant for reinforcement-learning-based math reasoning.",
    significance:
      "DeepSeekMath showed that carefully selected public web data plus GRPO can make a 7B open model approach frontier closed models on MATH; GRPO became the dominant RL algorithm behind the 2024-2025 reasoning-model wave.",
    problem:
      "Open models lagged far behind frontier models on competition-level mathematics, and PPO-style RL for math was memory-expensive.",
    date: "2024-02-05",
    researchArea: "LLM for Mathematics",
    subArea: "math pretraining and RL",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2402.03300",
    paperUrl: "https://arxiv.org/abs/2402.03300",
    githubUrl: "https://github.com/deepseek-ai/DeepSeek-Math",
    papers: [
      {
        title:
          "DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models",
        url: "https://arxiv.org/abs/2402.03300",
        year: 2024,
      },
    ],
    authors: [
      "Zhihong Shao",
      "Peiyi Wang",
      "Qihao Zhu",
      "Runxin Xu",
      "Junxiao Song",
      "Xiao Bi",
      "Haowei Zhang",
      "Mingchuan Zhang",
      "Y.K. Li",
      "Y. Wu",
      "Daya Guo",
    ],
    institution: "DeepSeek",
    model: ["DeepSeekMath 7B"],
    benchmark: ["MATH"],
    keyContributions: [
      "Engineered data-selection pipeline harvesting 120B math tokens from Common Crawl",
      "51.7% on MATH without toolkits or voting; 60.9% with self-consistency over 64 samples",
      "Group Relative Policy Optimization (GRPO), a PPO variant optimized for memory and math reasoning",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
  {
    id: "evt-omni-math-olympiad-benchmark-llm",
    title:
      "Omni-MATH: A Universal Olympiad Level Mathematic Benchmark For Large Language Models",
    slug: "omni-math-olympiad-benchmark-llm",
    summary:
      "The paper proposes Omni-MATH, an Olympiad-level benchmark of 4,428 competition-level problems with rigorous human annotation, categorized into over 33 sub-domains and spanning more than 10 difficulty levels. Even advanced reasoning models struggle on its hardest problems: OpenAI o1-mini and o1-preview reach 60.54% and 52.55% accuracy respectively.",
    significance:
      "As GSM8K and MATH saturated (o1 reaches 94.8% on MATH), Omni-MATH became a harder, fine-grained Olympiad benchmark that remains far from solved, giving the field a durable target for competition-level reasoning.",
    problem:
      "Existing benchmarks like GSM8K and MATH are solved with high accuracy and no longer challenge frontier models.",
    date: "2024-10-10",
    researchArea: "Benchmarks & Datasets",
    subArea: "olympiad-level benchmark",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/2410.07985",
    paperUrl: "https://arxiv.org/abs/2410.07985",
    papers: [
      {
        title:
          "Omni-MATH: A Universal Olympiad Level Mathematic Benchmark For Large Language Models",
        url: "https://arxiv.org/abs/2410.07985",
        year: 2024,
      },
    ],
    authors: [
      "Bofei Gao",
      "Feifan Song",
      "Zhe Yang",
      "Zefan Cai",
      "Yibo Miao",
      "Qingxiu Dong",
      "Lei Li",
      "Chenghao Ma",
      "Liang Chen",
      "Runxin Xu",
      "Zhengyang Tang",
      "Benyou Wang",
      "Daoguang Zan",
      "Shanghaoran Quan",
      "Ge Zhang",
      "Lei Sha",
      "Yichang Zhang",
      "Xuancheng Ren",
      "Tianyu Liu",
      "Baobao Chang",
    ],
    model: ["OpenAI o1-mini", "OpenAI o1-preview"],
    benchmark: ["Omni-MATH", "MATH (context)"],
    dataset: ["Omni-MATH (4,428 annotated competition problems)"],
    keyContributions: [
      "4,428 rigorously annotated competition-level problems covering 33+ sub-domains and 10+ difficulty levels",
      "Evaluation showing o1-mini at 60.54% and o1-preview at 52.55%, far from saturation",
      "In-depth analysis of failure patterns on Olympiad-level mathematical reasoning",
    ],
    relatedWorks: [],
    createdAt: "2026-10-21T00:00:00.000Z",
    updatedAt: "2026-10-21T00:00:00.000Z",
  },
];

