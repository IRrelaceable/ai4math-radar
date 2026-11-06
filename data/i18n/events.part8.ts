import type { EventZh } from "./types";

/** zh translations for the 2004-2020 machine-learning backfill. */
export const eventsPart8: Record<string, EventZh> = {
  "mptp-mizar-large-theory-benchmark": {
    title: "MPTP 把 Mizar 形式库变成面向 ATP 的大理论基准",
    summary:
      "约瑟夫·乌尔班（Josef Urban）的 MPTP 把 Mizar 数学库翻译为 TPTP 问题，并配以机器学习的前提选择，使自动定理证明器能在庞大而嘈杂的理论中推理；2004 年《自动推理杂志》的论文报告了设计与首批实验。",
    significance: "它把真实形式库变成 ATP 基准，并确立前提选择为大理论证明的核心问题。",
    problem: "当可用公理达到数万条时，ATP 无法扩展到真实的数学库。",
    keyContributions: [
      "把 Mizar 翻译为 TPTP 格式以供 ATP 使用",
      "面向大理论的机器学习前提选择",
      "基于 Mizar 的大理论证明首批实验",
    ],
  },
  "malarea-learning-reasoning-loop": {
    title: "MaLARea：面向大理论的学习–推理循环",
    summary:
      "MaLARea（2008）把机器学习的前提选择与 ATP 搜索结合，并把新找到的证明反馈到训练中，在 Mizar 的大理论问题上反复迭代。",
    significance: "它表明学习与演绎可以在循环中相互促进，这一思想后来成为 hammer 系统与神经证明器的核心。",
    problem: "前提选择模型只在静态数据上训练一次；后来发现的证明没有被复用。",
    keyContributions: [
      "从 Mizar 证明中学习前提选择",
      "迭代进行 ATP 证明与再训练",
      "在 Mizar 大理论问题上评估该循环",
    ],
  },
  "sledgehammer-isabelle-automation": {
    title: "Sledgehammer 把强自动化带入日常 Isabelle 证明",
    summary:
      "伯梅与尼普科夫 2010 年 ITP 论文评估了 Sledgehammer——Isabelle 从交互目标通往外部 ATP 的桥梁——表明相关性过滤与并行调用多个证明器能让“一键”自动化在 Isabelle 证明义务上有效工作。",
    significance: "它把大理论 ATP 带入日常交互式证明，并使 hammer 成为证明助手的标准组件。",
    problem: "交互式证明中存在繁琐但 ATP 可处理的目标，而用完整理论手动调用 ATP 又无法扩展。",
    keyContributions: [
      "用相关性过滤为 ATP 选取事实",
      "并行调用多个 ATP",
      "在 Isabelle 证明义务上评估成功率",
    ],
  },
  "odd-order-theorem-coq-formalization": {
    title: "Coq 中机器检查的奇阶定理证明",
    summary:
      "贡蒂埃（Gonthier）及合作者在 ITP 2012 上展示了 Feit–Thompson 奇阶定理的完整 Coq 形式化，覆盖了这一群论里程碑的全部证明。",
    significance: "它表明大型、困难的研究级证明可以端到端形式化，并把 Coq 的形式库与工程实践推到研究规模。",
    problem: "Feit–Thompson 证明长达数百页，涉及许多相互作用的代数结构；此前没有机器检查版本。",
    keyContributions: [
      "Feit–Thompson 定理的端到端 Coq 形式化",
      "面向群论的大规模形式库工程",
      "展示了证明助手可承载研究级形式化",
    ],
  },
  "lean-theorem-prover-repository": {
    title: "Lean 定理证明器仓库公开",
    summary:
      "2013-07-17，leanprover/lean3 仓库创建，莱昂纳多·德莫拉（Leonardo de Moura）的 Lean 定理证明器以开放项目形式公开；CADE 2015 的系统描述把 Lean 介绍为面向验证与数学的依赖类型证明器。",
    significance:
      "它引入了后来与 mathlib 及 AI 证明器一起成为机器检查数学与神经定理证明主要平台的证明器。",
    problem: "已有证明器要么提供强表达力的依赖类型，要么提供实用自动化与元编程；Lean 试图兼得。",
    keyContributions: [
      "2013-07-17 创建公开的 Lean 仓库",
      "带元编程的依赖类型证明器",
      "2015 年在 CADE 发表系统描述",
    ],
  },
  "holyhammer-hol-light-atp-service": {
    title: "HOL(y)Hammer 为 HOL Light 带来 ATP 自动化",
    summary:
      "HOL(y)Hammer 把前提选择与外部 ATP 结合来证明 HOL Light 目标，并部署为在线服务；2013 年论文报告了其架构与评估。",
    significance:
      "它把 hammer 方法扩展到 HOL Light，并表明学习式前提选择能让大理论自动化在 Isabelle 之外也切实可用。",
    problem: "HOL Light 的形式库不断增长，已超出不加选择地调用 ATP 所能处理的范围。",
    keyContributions: [
      "面向 HOL Light 目标的前提选择",
      "调用外部 ATP 并重建证明",
      "面向 HOL Light 用户的在线 hammer 服务",
    ],
  },
  "mizar-40-hammer": {
    title: "MizAR 40：Mizar 证明助手的 hammer",
    summary:
      "MizAR 40 通过前提选择与证明重建把 Mizar 连接到外部 ATP，使 Mizar 用户能够自动消解目标；2013 年论文报告了它在 Mizar 库上的表现。",
    significance: "它把 hammer 式自动化带入 Mizar，用 ATP 搜索补充其证明检查器。",
    problem: "Mizar 证明可被检查但不会被自动发现；用户需要与 Mizar 语义集成的 ATP 辅助。",
    keyContributions: [
      "面向 Mizar 目标的 ATP 集成",
      "在 Mizar 库上进行前提选择",
      "在 Mizar 内部重建证明",
    ],
  },
  "flyspeck-kepler-conjecture-formal-proof": {
    title: "开普勒猜想的机器检查证明完成 Flyspeck 项目",
    summary:
      "Hales 及合作者在 HOL Light 与 Isabelle 中发表了开普勒猜想的正式证明，完成了 Flyspeck 项目；2015 年论文描述了该形式化及其验证。",
    significance: "它是重大研究定理最大规模形式化之一，表明证明助手能够检查一个连原始审稿都充满争议的证明。",
    problem: "原始开普勒证明依赖大量计算机计算，审稿人难以检查；需要机器检查的证明。",
    keyContributions: [
      "开普勒猜想的完整形式证明",
      "形式化分置于 HOL Light 与 Isabelle",
      "对计算密集型证明的机器检查验证",
    ],
  },
  "deepmath-deep-sequence-models-premise-selection": {
    title: "DeepMath 把深度序列模型用于前提选择",
    summary:
      "Alemi、Chollet、Een、Irving、Szegedy 与 Urban 在 Mizar 库上训练深度序列模型来选择前提，优于此前基于特征的方法，并为 ATP 提供更小、更相关的一组公理。",
    significance: "它把现代深度学习带入形式前提选择，并为大型形式语料上的神经方法设定了强基线。",
    problem: "从数万条 Mizar 事实中选择前提，此前主要依赖手工设计的特征。",
    keyContributions: [
      "用于前提选择的深度序列模型",
      "在 Mizar 库上的评估",
      "神经大理论证明的强基线",
    ],
  },
  "holophrasm-neural-higher-order-prover": {
    title: "Holophrasm：面向高阶逻辑的神经自动定理证明器",
    summary:
      "Whalen 的 Holophrasm 用神经网络引导 HOL4 中的证明搜索，从 HOL4 库学习并在高阶逻辑中证明定理。",
    significance: "它是面向高阶证明助手的早期端到端神经证明器，把神经证明从一阶 ATP 扩展到更丰富的场景。",
    problem: "此前的神经证明器多针对一阶或 Metamath 场景；高阶交互式证明器带来更丰富的状态与动作空间。",
    keyContributions: [
      "用神经网络引导 HOL4 证明搜索",
      "从 HOL4 库中学习",
      "面向高阶逻辑的早期神经证明器",
    ],
  },
  "semantic-parsing-mathematics-aligned-corpora": {
    title: "学习把非形式数学翻译为形式陈述",
    summary:
      "Kaliszyk、Urban 与 Vyskočil 利用对齐语料学习把自然语言数学陈述翻译为形式陈述，并用定理证明改进翻译。",
    significance: "它是把对齐样本学习与证明器反馈结合的早期自动形式化流程，预示了后来的 LLM 自动形式化。",
    problem: "形式与非形式数学在规模上并未对齐，翻译只能从稀缺的配对数据中学习。",
    keyContributions: [
      "基于对齐的非形式–形式语料的上下文学习",
      "把定理证明作为翻译质量的信号",
      "早期可学习的自动形式化流程",
    ],
  },
  "deep-network-guided-proof-search": {
    title: "面向一阶 ATP 的深度网络引导证明搜索",
    summary:
      "Loos、Irving、Szegedy 与 Kaliszyk 用深度网络引导 ATP 的子句选择循环，从成功证明中学习，并优于证明器的默认启发式。",
    significance: "它表明学习式引导可以在不替换传统一阶 ATP 的情况下改进它，这一混合模式在后续系统中反复出现。",
    problem: "ATP 的启发式是固定的，无法适应问题分布。",
    keyContributions: [
      "用深度网络引导子句选择",
      "从成功的 ATP 证明中学习",
      "在传统证明器内部进行学习式混合搜索",
    ],
  },
  "holstep-hol-light-dataset": {
    title: "HolStep：面向 HOL Light 定理证明的机器学习数据集",
    summary:
      "Kaliszyk、Chollet 与 Szegedy 发布了 HolStep：一个标注了“有用/无用”的 HOL Light 证明步骤数据集，用于支持学习式引导的定理证明。",
    significance: "它提供了面向高阶证明助手内部学习的首批大型精选数据集之一。",
    problem: "HOL Light 中的神经证明缺少标准的中间证明状态与有用引理数据集。",
    keyContributions: [
      "带标注的 HOL Light 证明步骤数据集",
      "用于学习式前提选择的“有用/无用”标签",
      "面向高阶神经证明的共享基准",
    ],
  },
  "mathlib-lean-mathematics-library": {
    title: "mathlib：面向 Lean 的统一数学库",
    summary:
      "leanprover-community/mathlib 仓库于 2017-07-21 创建，为 Lean 3 提供了由社区维护的形式数学库，并成长为 Lean 证明与 AI4Math 的标准语料。",
    significance: "它成为 Lean 共享的形式数学语料，也是后来神经证明器训练与评估的基地。",
    problem: "Lean 的数学内容分散；社区需要一个约定一致的形式库。",
    keyContributions: [
      "社区维护的 Lean 3 数学库",
      "统一的形式数学约定",
      "后来 Lean 神经证明器的标准语料",
    ],
  },
  "tactictoe-learning-tactics-hol4": {
    title: "TacticToe 在 HOL4 中学习用策略证明定理",
    summary:
      "Gauthier、Kaliszyk、Urban、Kumar 与 Norrish 从 HOL4 证明中学习策略序列，并用其引导证明器，把学习到的策略选择与搜索结合起来。",
    significance: "它把基于学习的证明扩展到交互式证明器中的策略级动作，是策略式神经证明器的前身。",
    problem: "策略式证明提供了丰富的动作空间，而此前的神经证明器没有直接建模它。",
    keyContributions: [
      "从 HOL4 证明中学习策略序列",
      "面向证明搜索的策略级引导",
      "在交互式高阶证明器中评估",
    ],
  },
  "neural-translation-informal-formal-mathematics": {
    title: "从非形式数学到形式数学的首批神经翻译实验",
    summary:
      "Wang、Kaliszyk 与 Urban 训练神经序列模型，把非形式数学陈述翻译为形式陈述，并报告了在对齐语料上的首批实验。",
    significance: "它是自动形式化的早期神经路线，比 LLM 浪潮早数年。",
    problem: "基于规则与统计的数学翻译较为脆弱；神经序列模型提供了数据驱动的替代方案。",
    keyContributions: [
      "用于非形式到形式翻译的神经序列模型",
      "在对齐数学语料上的实验",
      "早期神经自动形式化基线",
    ],
  },
  "reinforcement-learning-theorem-proving": {
    title: "定理证明的强化学习",
    summary:
      "Kaliszyk、Urban、Michalewski 与 Olšák 把 ATP 证明搜索表述为强化学习问题，从证明器反馈中学习子句选择策略。",
    significance: "它把强化学习带入大理论 ATP，并表明学习到的策略可以胜过手工调优的选择。",
    problem: "饱和式证明器中的子句选择由固定启发式控制。",
    keyContributions: [
      "把证明搜索表述为强化学习问题",
      "学习子句选择策略",
      "与 ATP 启发式对比评估",
    ],
  },
  "gamepad-learning-environment-theorem-proving": {
    title: "GamePad：面向定理证明的学习环境",
    summary:
      "Huang、Dhariwal、Song 与 Sutskever 提出 GamePad：一个基于 Coq 的环境，把证明状态与策略暴露给强化学习智能体。",
    significance: "它为强化学习研究者提供了标准的交互式证明环境，类似控制任务中的 gym。",
    problem: "面向定理证明的强化学习缺少通向真实证明助手的通用、可脚本化接口。",
    keyContributions: [
      "基于 Coq 的交互式证明环境",
      "面向学习智能体的证明状态与策略接口",
      "强化学习证明器的标准测试平台",
    ],
  },
  "mathematics-dataset-neural-reasoning": {
    title: "程序生成数据集揭示神经数学推理的局限",
    summary:
      "Saxton、Grefenstette、Hill 与 Kohli 发布了一个大型程序生成的数学数据集，并表明序列模型难以泛化到训练分布之外。",
    significance: "它提供了受控的数学推理基准，并暴露了模式匹配与系统泛化之间的差距。",
    problem: "已有的数学应用题数据集把推理能力与语言变化、记忆混在一起。",
    keyContributions: [
      "大型程序生成的数学数据集",
      "对泛化能力的受控评估",
      "证据表明序列模型无法系统性外推",
    ],
  },
  "holist-higher-order-proving-environment": {
    title: "HOList：HOL Light 的学习环境与基准",
    summary:
      "Bansal、Loos、Rabe、Szegedy 与 Wilcox 发布了 HOList：一个用于学习式高阶定理证明的 HOL Light 环境与基准。",
    significance: "它把 HOL Light 变成标准的机器学习基准，并支持神经证明器之间可复现的比较。",
    problem: "高阶证明研究缺少共享环境与评估协议。",
    keyContributions: [
      "面向学习智能体的 HOL Light 环境",
      "共享基准与评估协议",
      "神经证明器的可复现比较",
    ],
  },
  "coqgym-coq-learning-environment": {
    title: "CoqGym：通过与 Coq 交互学习定理证明",
    summary:
      "Yang 与 Deng 提出 CoqGym：一个基于 Coq 的学习环境与包含 71 个项目证明的数据集，以及策略合成模型 ASTactic。",
    significance: "它提供了 Coq 中的大型交互式证明基准，并展示了学习合成策略。",
    problem: "Coq 的依赖类型论与大型形式库使基于学习的证明难以规模化。",
    keyContributions: [
      "覆盖 71 个项目的 Coq 环境与数据集",
      "策略合成模型 ASTactic",
      "面向学习式交互证明的基准",
    ],
  },
  "metagen-learning-to-generate-theorems": {
    title: "MetaGen 通过学习生成定理来学习证明",
    summary: "Wang 与 Deng 同时训练定理生成器与证明器，用生成的定理作为训练数据来改进 Metamath 证明。",
    significance: "它为形式证明引入数据生成循环，预示了后来的合成定理方法。",
    problem: "形式证明语料对数据饥渴的神经证明器来说太小。",
    keyContributions: [
      "联合训练定理生成器与证明器",
      "把合成定理作为额外证明数据",
      "改进 Metamath 证明",
    ],
  },
  "gpt-f-generative-language-modeling-theorem-proving": {
    title: "GPT-f：面向自动定理证明的生成式语言建模",
    summary:
      "Polu 与 Sutskever 在 Metamath 上训练 GPT-f，并用它搜索证明；它找到的证明被收入 Metamath 主库——作者称这是深度学习系统首次贡献被形式数学共同体采纳的证明。",
    significance:
      "它是 LLM 定理证明路线的起点：语言模型引导的搜索产出了被形式共同体接受的证明。",
    problem: "自动证明器无法生成创造性证明所需的原创数学项。",
    keyContributions: [
      "在 Metamath 中进行语言模型引导的证明搜索",
      "新的短证明被收入 Metamath 主库",
      "首个被形式共同体采纳证明的深度学习系统",
    ],
    aiRoleDescription:
      "GPT-f 用语言模型与证明搜索生成候选证明；Metamath 的检查器验证通过后，这些证明才进入主库。",
    humanContribution:
      "Polu 与 Sutskever 训练模型并构建证明搜索；Metamath 社区将其贡献的证明采纳进库。",
  },
};
