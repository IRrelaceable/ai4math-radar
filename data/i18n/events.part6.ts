import type { EventZh } from "./types";

/** zh translations for .i18n-src/batch-6.json */
export const eventsPart6: Record<string, EventZh> = {
  "ml-knot-invariants-novel-correlations": {
    title: "Illuminating new and known relations between knot invariants",
    summary: "作者将机器学习搜索自动化，覆盖近 200,000 组纽结不变量：训练神经网络从其他不变量预测某一个不变量，并筛选出真实的多方相关关系，从而重新发现多项式、同调与双曲不变量之间的已知联系，并揭示现有纽结理论结果无法解释的新相关关系。",
    significance: "这是机器学习在纯数学中充当猜想生成引擎的一个具体案例：学到的相关关系指向了 Khovanov 同调与纽结 Floer 同调之间的新联系，以及量子代数不变量与双曲不变量之间一种类似广义体积猜想的关联。",
    problem: "纽结不变量之间的关系通常靠人工一次一个地发现；此前没有系统性工具来扫描庞大的候选不变量关系空间。",
    keyContributions: [
      "自动化扫描近 200,000 组不变量集合，并进行多方相关性过滤",
      "作为合理性检验，重新发现已知的多项式、同调与双曲不变量关系",
      "发现无法解释的新相关关系，加强了 Khovanov 同调与纽结 Floer 同调之间的联系",
      "为量子代数不变量与双曲不变量之间的新联系提供证据"
    ]
  },
  "alphatensor-faster-matrix-multiplication-rl": {
    title: "Discovering faster matrix multiplication algorithms with reinforcement learning",
    summary: "AlphaTensor 用深度强化学习首次发现了比经典计数更快的矩阵乘法算法——包括在 GF(2) 上用 48 次乘法（而非 64 次）完成 4×4 矩阵乘法——并为许多其他尺寸给出了新的快速算法。",
    significance: "矩阵乘法是现代计算与科学机器学习的基础，因此哪怕很小的复杂度改进也会被广泛放大；该结果还表明强化学习能够发现超越人工设计启发式的新算法。",
    problem: "寻找比已知启发式更快的矩阵乘法方案是一个巨大的离散搜索空间，人类只能手工探索。",
    keyContributions: [
      "首次找到在若干尺寸上击败经典乘法计数的算法",
      "GF(2) 上的 4×4 矩阵乘法仅用 48 次乘法（而非 64 次）",
      "将算法设计转化为游戏的张量分解框架"
    ]
  },
  "draft-sketch-and-prove-guiding-formal-provers": {
    title: "Draft, Sketch, and Prove: Guiding Formal Theorem Provers with Informal Proofs",
    summary: "DSP 把一份非形式化证明——由人或语言模型写成——翻译成形式化证明草图，然后让自动证明器补全底层步骤。",
    significance: "它把非形式化证明重新定位为搜索引导，而不是需要端到端形式化的内容：草图引导将证明器在数学竞赛题上的表现从 20.9% 提升到 39.3%。",
    problem: "端到端形式化之所以困难，是因为底层步骤消耗了全部搜索预算。",
    keyContributions: [
      "从非形式化证明到形式化草图再到完整证明的流程",
      "借助草图引导，成绩从 20.9% 提升到 39.3%",
      "对人写的和模型写的非形式化证明都适用"
    ]
  },
  "minerva-quantitative-reasoning-with-language-models": {
    title: "Solving Quantitative Reasoning Problems with Language Models",
    summary: "Google 发布了 Minerva：一个先在通用文本上预训练、再在科学与技术内容上继续训练的语言模型，在不使用外部工具的情况下于定量推理基准测试上接受评测。",
    significance: "大学水平的定量推理是当时最先进模型的一大短板；Minerva 表明面向技术领域的专门预训练基本补齐了这一差距：在 200 多道本科物理、生物、化学和经济学题目上答对近三分之一，并在 MATH 和 GSM8K 上创下新纪录。",
    problem: "通用大语言模型在各学科的本科水平定量问题上表现不佳。",
    keyContributions: [
      "在技术/科学语料库上继续预训练以提升数学能力",
      "不使用外部工具、以 LaTeX 渲染的逐步推理给出解答",
      "发布时在 MATH、GSM8K 和 MMLU-STEM 上达到最先进水平"
    ]
  },
  "autoformalization-with-large-language-models": {
    title: "Autoformalization with Large Language Models",
    summary: "Wu 等人表明大语言模型可以将数学竞赛题自动形式化（autoformalization）为 Isabelle/HOL 规范，其中 25.3% 被完美翻译；他们还在这些自动形式化的定理上训练了一个神经定理证明器，在 miniF2F 上创下新的最先进水平（29.6% → 35.2%）。",
    significance: "它开启了基于大语言模型的自动形式化这一实用研究方向，并展示了如今主导该领域的数据飞轮：自动形式化的命题可以反馈回证明器训练，以提升基准测试成绩。",
    problem: "把非形式化数学翻译成证明助手规范是一项劳动密集的瓶颈，而没有大规模形式化命题语料库，神经证明器就无以为继。",
    keyContributions: [
      "大语言模型将 25.3% 的数学竞赛题完美翻译为 Isabelle/HOL 规范",
      "在自动形式化定理上训练的证明器在 miniF2F 上创下新的最先进水平，证明率从 29.6% 提升到 35.2%",
      "确立了自动形式化作为神经定理证明的可扩展数据生成流程"
    ]
  },
  "least-to-most-prompting-complex-reasoning": {
    title: "Least-to-Most Prompting Enables Complex Reasoning in Large Language Models",
    summary: "论文提出由易到难提示（least-to-most prompting）：把复杂问题分解为一系列更简单的子问题并依次求解，用先前子问题的答案去解后续子问题。配合 GPT-3 code-davinci-002，仅用 14 个示例就在 SCAN 的任意划分（包括长度划分）上达到至少 99% 的准确率，而思维链提示只有 16%。",
    significance: "它把由易到难的分解引入为一种提示策略，展示了对高于示例难度的问题的泛化能力——这是贯穿数学推理与智能体流程的“先分解后求解”范式的前身。",
    problem: "思维链提示无法泛化到比提示中示例更难的问题。",
    keyContributions: [
      "由易到难的分解：依次求解更简单的子问题以攻克更难的问题",
      "在 SCAN 长度划分上仅用 14 个示例就达到至少 99% 准确率，而思维链提示只有 16%",
      "在符号操作、组合泛化和数学推理上展示了由易到难的泛化"
    ]
  },
  "hypertree-proof-search-neural-theorem-proving": {
    title: "HyperTree Proof Search for Neural Theorem Proving",
    summary: "Meta AI 提出 HyperTree Proof Search（HTPS）：一种受 AlphaZero 启发的搜索算法，结合在线训练，使证明器能从自己此前的证明搜索中学习。",
    significance: "它表明搜索加在线训练可以弥补静态训练证明器的泛化差距：在留出的 Metamath 集合上达到 82.6%，而 GPT-f 为 56.5%；在相近算力下还把 Lean miniF2F 的课程学习结果从 31% 提升到 42%。",
    problem: "在固定分布上一次性训练的证明器，在该分布之外的命题上会性能崩溃。",
    keyContributions: [
      "AlphaZero 式的证明搜索，并利用过往搜索进行在线训练",
      "在留出的 Metamath 上达到 82.6%，对比静态 GPT-f 基线的 56.5%",
      "在相近算力下，Lean miniF2F 成绩大幅提升"
    ]
  },
  "thor-language-models-and-automated-theorem-provers": {
    title: "Thor: Wielding Hammers to Integrate Language Models and Automated Theorem Provers",
    summary: "Thor 把工作分配给 ATP 的“hammer”（Sledgehammer 式的前提选择）和语言模型，分别在 Isabelle/PISA 和 Lean/miniF2F 上得到验证。",
    significance: "它针对大语言模型证明器的经典弱点——前提选择——把该任务交给成熟的 ATP 工具：PISA 成功率从 39% 升至 57%，并且有 8.2% 的题目是两个组件单独都无法解决的。",
    problem: "语言模型不擅长前提选择，而自动证明器擅长这一点，但需要有人提供正确的前提。",
    keyContributions: [
      "分工：由 ATP 做前提选择，语言模型负责其余部分",
      "在相同语言模型下，PISA 成绩从 39% 提升到 57%",
      "8.2% 的题目只有两者结合才能解决"
    ]
  },
  "self-consistency-chain-of-thought-decoding": {
    title: "Self-Consistency Improves Chain of Thought Reasoning in Language Models",
    summary: "论文用自一致性（self-consistency）替代思维链提示中的贪心解码：采样一组多样化的推理路径，再通过边缘化得到最一致的答案。报告的提升包括 GSM8K +17.9%、SVAMP +11.0%、AQuA +12.2%、StrategyQA +6.4% 和 ARC-challenge +3.9%。",
    significance: "自一致性成为数学推理的标准测试时扩展基线——采样并边缘化推理路径至今仍是更新的验证器与强化学习方法所对照的参照技术。",
    problem: "贪心的思维链解码只走一条推理路径，因此即使模型知道如何解题，一步不走运也会毁掉答案。",
    keyContributions: [
      "一种解码策略：采样多样化的推理路径，再通过边缘化得到最一致的答案",
      "相比贪心思维链，在 GSM8K（+17.9%）和 SVAMP（+11.0%）上取得两位数提升",
      "确立了采样加边缘化作为推理的测试时算力基线"
    ]
  },
  "chain-of-thought-prompting-reasoning-llms": {
    title: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
    summary: "论文表明，用几个包含中间推理步骤（即“思维链”）的示例来提示大语言模型，可以显著提升算术、常识和符号推理任务的表现；用仅仅八个思维链示例提示一个 540B 参数模型，就在 GSM8K 上达到最先进的准确率，超过了带验证器的微调 GPT-3。",
    significance: "思维链提示成为大语言模型数学推理时代的奠基性技术——几乎所有后来的数学大语言模型工作（自一致性、过程监督、面向数学的强化学习）都建立在激发中间推理步骤之上。",
    problem: "大语言模型难以完成需要先把问题分解再作答的多步推理任务。",
    keyContributions: [
      "思维链提示：仅用几个含推理步骤的示例即可解锁复杂推理",
      "用 540B 模型和八个示例达到最先进的 GSM8K 准确率",
      "在算术、常识和符号推理任务上取得显著提升"
    ]
  },
  "pretrained-lms-symbolic-mathematics-solvers": {
    title: "Pretrained Language Models are Symbolic Mathematics Solvers too!",
    summary: "论文表明，一个先在语言翻译上预训练、再在符号数学上微调的 transformer，其积分准确率可与最先进水平相当，而使用的训练样本大约少 1.5 个数量级；论文还报告了语言相关行为、分布偏移下的鲁棒性，以及在微分方程上准确率较低。",
    significance: "它把符号数学求解定位为语言模型的样本效率与迁移问题，表明跨语言预训练（而非单纯的数据规模）就能承载积分等符号任务上的大部分性能。",
    problem: "在符号数学上端到端训练的序列到序列 transformer 需要极大量的训练数据才能泛化到未见过的问题。",
    keyContributions: [
      "先做翻译预训练、再做符号微调，训练数据少约 1.5 个数量级却达到相当的积分准确率",
      "用安娜·卡列尼娜原则（Anna Karenina Principle，AKP）分析不同预训练语言对下的泛化能力",
      "存在语言偏好的证据，以及积分任务在分布偏移下鲁棒性提升"
    ]
  },
  "gsm8k-training-verifiers-math-word-problems": {
    title: "Training Verifiers to Solve Math Word Problems",
    summary: "OpenAI 发布了 GSM8K：8.5K 道语言多样的小学数学应用题，附教师撰写的解答；并表明在生成的解答上训练验证器模型胜过仅做微调。",
    significance: "确立了后来推理系统所依托的生成器–验证器模式：不再信任单次采样的答案，而是由训练好的验证器在候选解答之间做选择。GSM8K 成为多步推理的默认诊断基准。",
    problem: "数学应用题数据集要么规模小，要么很快被饱和，而且模型无法检查自己的解答。",
    keyContributions: [
      "大规模、人工撰写的小学应用题数据集",
      "在生成的解答上训练验证器，作为扩展手段",
      "生成器–验证器模式被后来的推理模型反复复用"
    ]
  },
  "minif2f-cross-system-formal-olympiad-benchmark": {
    title: "miniF2F: a cross-system benchmark for formal Olympiad-level mathematics",
    summary: "一个包含 488 道奥林匹克级别题目（AIME、AMC、IMO 及课程材料）的基准测试，这些题目在 Metamath、Lean、Isabelle 和 HOL Light 中完成形式化，并给出 GPT-f 风格的基线。",
    significance: "为神经定理证明提供了统一的跨系统评测标准：证明器不再各自在私有语料库上汇报结果，成绩得以在不同证明助手之间比较；miniF2F 成为形式化证明器的默认评测集。",
    problem: "形式化定理证明的结果分散在各个证明助手之间，缺少比较证明器的共同标尺。",
    keyContributions: [
      "488 道奥林匹克级别题目在四个证明助手中完成形式化",
      "跨系统评测协议，使证明器可以直接比较",
      "给出的基线确立了后来证明器的起点"
    ]
  },
  "asdiv-diverse-math-word-problem-corpus": {
    title: "A Diverse Corpus for Evaluating and Developing English Math Word Problem Solvers (ASDiv)",
    summary: "论文提出 ASDiv（Academia Sinica Diverse MWP Dataset）：一个包含 2,305 道题的英语数学应用题语料库，覆盖更多文本模式和小学阶段教授的大多数题型，每道题都标注了题型和年级水平；此外还提出了一个衡量 MWP 语料库词汇使用多样性的指标。",
    significance: "ASDiv 弥补了现有 MWP 语料库覆盖面狭窄的问题，并被证明能更忠实地反映求解器的真实能力，成为小学水平数学应用题的标准多样化评测语料库。",
    problem: "现有 MWP 语料库要么在语言使用模式上受限，要么在题型上受限，因此在其上的提升无法泛化。",
    keyContributions: [
      "2,305 道英语 MWP，标注题型和年级水平",
      "一个词汇使用多样性指标，证明 ASDiv 比现有语料库更多样",
      "实验表明该语料库更忠实地反映求解器能力"
    ]
  },
  "inter-gps-geometry3k-formal-symbolic-solving": {
    title: "Inter-GPS: Interpretable Geometry Problem Solving with Formal Language and Symbolic Reasoning",
    summary: "Inter-GPS 把几何题的文本和图形解析为形式语言（基于规则的文本解析加上神经目标检测），并用定理知识引导的逐步符号推理来求解，同时发布了 Geometry3K：一个包含 3,002 道几何题、以形式语言密集标注的基准测试。",
    significance: "它把几何题求解从隐式的神经模式匹配推向可解释的、带形式化标注的符号证明，并为学界提供了首个带形式语言真值标注的大规模公开几何基准测试。",
    problem: "现有几何数据集要么太小，要么不公开；端到端神经求解器无法给出扎根于公理化定理知识的可解释推理链。",
    keyContributions: [
      "Geometry3K：3,002 道几何题，带有密集的形式语言标注",
      "将题目文本和图形形式化解析为公理化描述",
      "定理预测器为符号求解器提供支持，实现逐步证明搜索",
      "发表时在 Geometry3K 和 GEOS 上取得最先进结果"
    ]
  },
  "mathlib4-lean4-mathematics-library-created": {
    title: "mathlib4 代码仓库创建为 Lean 定理证明器社区的 Lean 4 数学库",
    summary: "2021-05-09，leanprover-community 组织创建了 leanprover-community/mathlib4 仓库，被描述为“The math library of Lean 4”，为社区的形式化数学库在 Lean 4 生态中提供了专门的归属（Apache-2.0 许可，用 Lean 编写）。",
    significance: "Lean 的数学库是 Lean 4 证明器生态系统所依托的共享机器校验数学语料库——后来的检索增强证明器如 LeanDojo/ReProver 就是在从该库提取的数千条定理上训练和评测的——因此为其建立 Lean 4 代码仓库，为 Lean 上的形式化数学与 AI4Math 铺设了核心基础设施。",
    problem: "随着生态迁移到 Lean 4 这一代证明器，Lean 社区的数学库需要一个专门的 Lean 4 代码仓库。",
    keyContributions: [
      "为 Lean 4 数学库设立专门的 GitHub 归属，于 2021-05-09 在 leanprover-community 组织下创建",
      "被该组织描述为“The math library of Lean 4”，用 Lean 编写，采用 Apache-2.0 许可",
      "后来的 Lean 证明器、基准测试和形式化项目都从这一核心形式化库中取用前提与训练数据"
    ]
  },
  "svamp-robustness-challenge-math-word-problems": {
    title: "SVAMP: Are NLP Models really able to Solve Simple Math Word Problems?",
    summary: "一篇 NAACL 2021 论文，表明数学应用题求解器依赖浅层启发式——看不到问题文本的模型、或把题目当作词袋处理的模型，仍能解出既有基准测试中的很大一部分——并提出 SVAMP：一个通过对既有数据集样本施加精心选择的变体构建的挑战集。",
    significance: "SVAMP 成为小学数学应用题的标准鲁棒性探针：它表明接近饱和的基准测试成绩并不反映真正的题目理解，并被广泛用于评测后来的大语言模型推理（例如作为自一致性提升的验证目标）。",
    problem: "小学水平的数学应用题基准测试看似已被解决，但并不清楚求解器是真的理解了题目，还是在利用数据集的人工痕迹。",
    keyContributions: [
      "证据表明 MWP 求解器依赖浅层启发式（不解题面也能求解、词袋基线）",
      "通过对既有样本施加精心选择的变体构建的 SVAMP 挑战数据集",
      "表明最先进准确率在这些变体下大幅下降"
    ]
  },
  "math-dataset-measuring-mathematical-problem-solving": {
    title: "Measuring Mathematical Problem Solving With the MATH Dataset",
    summary: "一个包含 12,500 道高难度竞赛数学题（AMC/AIME 风格及更难）的数据集，每题附完整的逐步解答，并按学科和 1–5 难度等级组织。",
    significance: "把数学评测的上限从小学应用题提升到竞赛级求解，并成为语言模型数学推理使用最广泛的基准测试。",
    problem: "既有基准测试只测量小学算术应用题，而且已经饱和。",
    keyContributions: [
      "12,500 道竞赛题，附逐步解答",
      "1–5 难度等级和学科分类，支持分级评测",
      "自 2021 年起成为大语言模型数学推理的标准评测"
    ]
  },
  "tacticzero-learning-to-prove-from-scratch-deep-rl": {
    title: "TacticZero: Learning to Prove Theorems from Scratch with Deep Reinforcement Learning",
    summary: "TacticZero 是一个用于 HOL4 交互式定理证明的深度强化学习框架，端到端地学习证明搜索策略以及 tactic 与参数的预测，并提出一种在潜在推导路径集合上进行回溯的新机制。",
    significance: "这是强化学习智能体能够从零证明定理的早期案例——学习搜索本身，而不是依赖固定启发式——并且在未见过的题目上胜过 HOL4 现有的自动化工具（hammers），由此开启了神经定理证明中的强化学习方向。",
    problem: "自动定理证明依赖人工设计的启发式以及在既有证明语料库上的监督训练，限制了从零证明新目标的能力。",
    keyContributions: [
      "把 HOL4 交互式定理证明端到端地形式化为马尔可夫决策过程（MDP），其中每个状态是一组潜在推导路径",
      "一种回溯机制：丢弃预测到的死路推导，从有希望的备选方案重新开始",
      "在 HOL4 定理证明器中实现；在未见过的题目上胜过 HOL4 内置的 hammers"
    ]
  }
};
