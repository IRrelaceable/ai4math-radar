import type { EventZh } from "./types";

/** zh translations for .i18n-src/batch-5.json */
export const eventsPart5: Record<string, EventZh> = {
  "llm-sr-scientific-equation-discovery": {
    title: "LLM-SR: Scientific Equation Discovery via Programming with Large Language Models",
    summary:
      "LLM-SR 把候选方程视为包含数学运算符的程序，将大语言模型的科学先验与进化搜索结合起来：模型提出新的方程骨架假设，再用数据拟合；在物理与生物学领域的四个刻意防止背诵的基准测试上，它优于最先进的符号回归基线，在分布外场景尤其突出。",
    significance:
      "研究表明，当符号方程发现的搜索由大语言模型的科学知识、而不再只是数据来引导时效果更好，同时也表明表达式树表示是经典符号回归的一个关键瓶颈。",
    problem:
      "符号回归方法仅从数据中提取方程，舍弃科学家的领域先验，并受限于表达式树这类低表达力的表示，这既限制了搜索效率，也限制了它所能表达的方程。",
    keyContributions: [
      "“方程即程序”表示：由大语言模型提出骨架并配合进化搜索",
      "为模拟发现过程、防止大语言模型背诵已知方程而设计的基准测试",
      "相对符号回归基线的显著提升，在域外测试中尤其明显",
      "开源的代码与数据",
    ],
  },
  "lean-copilot-llm-copilots-for-lean": {
    title: "Lean Copilot: Large Language Models as Copilots for Theorem Proving in Lean",
    summary:
      "Lean Copilot 是在 Lean 中原生运行大语言模型推理的通用框架，让用户构建证明自动化工具：借助本地或云端运行的预训练或用户自带模型，建议证明步骤、补全证明目标并选择相关前提（premise）。",
    significance:
      "在 Mathematics in Lean 教材上，配合 Lean Copilot 的人机协同证明平均只需手动输入 2.08 个证明步骤（基于规则的 aesop 自动化需 3.86 个），并自动化了 74.2% 的证明步骤，aesop 仅为 40.1%——这为“大语言模型副驾加速的是真实的形式化工作，而不只是自主基准测试”提供了具体证据。",
    problem:
      "现有神经定理证明器在固定语料库上预训练，在完全自主模式下难以证明新颖定理——这类定理往往离不开人类洞察；同时，大语言模型此前难以融入 Lean 的交互式工作流。",
    keyContributions: [
      "在 Lean 内部原生运行大语言模型推理的通用框架",
      "基于大语言模型的步骤建议、目标补全与前提选择工具，支持本地（CPU/GPU）或云端模型",
      "辅助人类时平均只需 2.08 个手动步骤，aesop 为 3.86 个；自动化 74.2% 的证明步骤，aesop 为 40.1%",
    ],
  },
  "researchagent-iterative-idea-generation": {
    title: "ResearchAgent: Iterative Research Idea Generation over Scientific Literature with Large Language Models",
    summary:
      "ResearchAgent 以一篇核心科学论文为起点，在学术图谱和跨论文挖掘的概念知识库上扩展，提出问题、方法与实验方案，再由多个由大语言模型驱动的 ReviewingAgent 进行细化，其评测标准从真实的人类判断中提炼；该系统在多个学科的论文上通过人工评测与模型评测得到验证。",
    significance:
      "这是最早的经过验证的、立足文献并模拟同行讨论的科研构思系统之一，确立了“构思生成 + 审稿智能体”的模式，该模式如今在 AI-assisted Research 工具中很常见。",
    keyContributions: [
      "以学术图谱与概念库增强基于文献的构思",
      "多个以人类偏好对齐标准运作的审稿智能体驱动迭代修改",
      "在多个科学学科上进行人工评测与模型评测",
      "被 NAACL 2025 接收",
    ],
  },
  "sciaagent-tool-augmented-scientific-reasoning": {
    title: "SciAgent: Tool-augmented Language Models for Scientific Reasoning",
    summary:
      "该工作提出工具增强的科学推理：MathFunc 训练语料库（超过 30,000 个样本、约 6,000 个工具）训练 SciAgent 模型检索、理解并使用工具；在覆盖五个科学领域的新增基准测试 SciToolBench 上，SciAgent-Mistral-7B 的绝对准确率比同规模大语言模型高出 13% 以上，SciAgent-DeepMath-7B 则明显优于 ChatGPT。",
    significance:
      "把科学推理智能体从闭卷生成转向工具使用，并发布了 MathFunc——一个用于训练会使用工具的推理器的大型数学函数工具语料库。",
    problem:
      "即使对先进的大语言模型而言，当必须在内部完成计算时，科学推理也很困难；让模型熟练使用工具可使这类任务更切实际、更可解。",
    keyContributions: [
      "定义了工具增强科学推理这一任务设定",
      "MathFunc 语料库：30,000+ 个样本、约 6,000 个工具",
      "覆盖五个科学领域的 SciToolBench 基准测试",
      "SciAgent-Mistral-7B 相比同规模大语言模型绝对准确率提升 13% 以上",
    ],
  },
  "deepseekmath-grpo-open-math-reasoning": {
    title: "DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models",
    summary:
      "本文提出 DeepSeekMath 7B，它在来自 Common Crawl 的 120B 数学相关 token 以及自然语言和代码数据上继续预训练，在竞赛级 MATH 基准测试上不借助外部工具箱或投票即达到 51.7%（在 64 个样本上使用 self-consistency 时为 60.9%）；文中还提出分组相对策略优化（Group Relative Policy Optimization, GRPO），一种面向基于强化学习的数学推理、节省显存的 PPO 变体。",
    significance:
      "DeepSeekMath 表明，精心筛选的公开网络数据配合 GRPO 能让一个 7B 开放模型在 MATH 上接近前沿闭源模型；GRPO 随后成为 2024-2025 年推理模型浪潮背后的主导强化学习算法。",
    problem:
      "开放模型在竞赛级数学上远落后于前沿模型，而 PPO 式强化学习用于数学时显存开销很大。",
    keyContributions: [
      "工程化的数据筛选流水线，从 Common Crawl 中获取 120B 数学 token",
      "MATH 上不使用工具箱或投票达到 51.7%；在 64 个样本上使用 self-consistency 达到 60.9%",
      "分组相对策略优化（GRPO）：面向显存与数学推理优化的 PPO 变体",
    ],
  },
  "alphageometry-olympiad-geometry-without-demonstrations": {
    title: "Solving olympiad geometry without human demonstrations",
    summary:
      "AlphaGeometry 是一个把语言模型与符号演绎引擎结合起来的神经符号系统，它解决了 1979–2022 年 30 道历届 IMO 几何题中的 25 道——大致相当于一位 IMO 金牌选手的平均水平。",
    significance:
      "竞赛几何长期难以自动化，很大程度上是因为解题需要发明辅助构造；神经引导的符号搜索在没有人类演示的情况下弥合了这一差距的大部分。",
    problem:
      "符号证明器无法发明辅助构造，而从人类解法中学习又需要稀缺的演示数据。",
    keyContributions: [
      "由语言模型为符号引擎建议辅助构造",
      "在没有人类演示的情况下解决 30 道历届 IMO 几何题中的 25 道",
      "面向几何证明的合成训练数据生成",
    ],
  },
  "funsearch-mathematical-discoveries-program-search": {
    title: "Mathematical discoveries from program search with large language models",
    summary:
      "FunSearch 把 GPT-4 与自动评估器和进化式程序搜索配对，发现了此前未知的构造——新的已知最优 cap-set 构造，以及改进的在线装箱启发式算法。",
    significance:
      "表明大语言模型驱动的程序搜索能够产出真正新颖的数学，而非复现训练数据：cap set 的结果改进了一个已知界，使其成为 AI 贡献新数学知识的最早明确案例之一。",
    problem:
      "在程序空间中搜索极值数学构造，空间大到无法暴力穷举，又新颖到无法由纯大语言模型生成。",
    keyContributions: [
      "对大语言模型生成的程序进行进化搜索，并在环中设有评估器",
      "当时的已知最优 cap-set 构造",
      "改进的在线装箱启发式算法",
    ],
  },
  "math-shepherd-automatic-process-reward-models": {
    title: "Math-Shepherd: Verify and Reinforce LLMs Step-by-step without Human Annotations",
    summary:
      "本文提出 Math-Shepherd，一个过程导向的数学过程奖励模型，为解题的每一步打分，其训练使用自动构建的过程级监督数据，而非人工标注。配合逐步 PPO，Mistral-7B 在 GSM8K 上从 77.9% 提升到 84.1%，在 MATH 上从 28.6% 提升到 33.0%；使用 Math-Shepherd 验证后分别达到 89.1% 和 43.5%。",
    significance:
      "通过自动化步级监督，Math-Shepherd 解决了过程奖励模型的人工标注瓶颈，并成为此后数学强化学习浪潮中自动 PRM 的参照点。",
    problem: "现有的过程监督依赖对每一个推理步进行大量人工标注。",
    keyContributions: [
      "在自动构建的步级监督数据上训练的过程奖励模型（无需人工标注）",
      "逐步 PPO 将 Mistral-7B 提升至 GSM8K 84.1%、MATH 33.0%",
      "配合 PRM 验证进一步提升至 GSM8K 89.1%、MATH 43.5%",
    ],
  },
  "copra-in-context-learning-agent-formal-theorem-proving": {
    title: "An In-Context Learning Agent for Formal Theorem-Proving",
    summary:
      "COPRA 反复让 GPT-4 在 Lean 与 Coq 的有状态回溯搜索中提出策略（tactic）应用，并把执行反馈、搜索历史信息和检索到的引理反馈回提示词中——全程不做任何微调。",
    significance:
      "表明仅靠提示的上下文学习智能体可以与微调证明器竞争（并在 pass@1 上胜出）：在 Lean 的 miniF2F 上它优于经过微调的 ReProver，还能处理来自 CompCert 的 Coq 任务，显示出跨证明助手的通用性。",
    problem:
      "最先进的定理证明模型都在特定环境的证明数据上微调，这类数据制作成本高昂，且让每个模型绑定于单一证明助手。",
    keyContributions: [
      "由通用大语言模型（GPT-4）驱动、无需微调的上下文学习证明器",
      "有状态回溯搜索，把执行反馈、搜索历史与检索到的引理输入每次提示",
      "在 miniF2F 的 pass@1 上优于经过微调的 ReProver；在 Lean 与 Coq 上均做了评测",
    ],
  },
  "mathvista-visual-mathematical-reasoning-benchmark": {
    title: "MathVista: Evaluating Mathematical Reasoning of Foundation Models in Visual Contexts",
    summary:
      "本文提出 MathVista，一个汇聚多类数学与视觉任务挑战的基准测试：6,141 个样本，来自 28 个已有多模态数据集和 3 个新构建的数据集（IQTest、FunctionQA、PaperQA）。在对 12 个知名基础模型的评测中，GPT-4V 以 49.9% 的总体准确率居首，领先 Bard 15.1%，但仍比人类表现低 10.4%。",
    significance:
      "MathVista 成为视觉数学推理的标准基准测试，揭示即使最强的多模态模型也在复杂图形与组合推理上遇到困难——这一差距界定了后续许多多模态数学智能体研究的问题空间。",
    problem: "基础模型在视觉情境下的数学推理能力此前未得到系统研究。",
    keyContributions: [
      "融合数学与视觉任务、包含 6,141 个样本的基准测试",
      "对 12 个基础模型的全面评测与细粒度错误分析",
      "GPT-4V 达到 49.9%，仍比人类表现低 10.4%——量化了视觉数学差距",
    ],
  },
  "llm-feedback-research-papers-empirical-analysis": {
    title: "Can large language models provide useful feedback on research papers? A large-scale empirical analysis",
    summary:
      "一项让 GPT-4 对完整论文 PDF 生成评论的流水线与人类审稿人做了比较：在来自 15 本 Nature 系期刊的 3,096 篇论文和 1,709 篇 ICLR 论文上，GPT-4 与人类审稿意见的点重合度（Nature 30.85%、ICLR 39.23%）与人类之间的重合度（分别为 28.58% 和 35.25%）相当；在一项对来自 110 所美国机构的 308 名研究者的前瞻研究中，57.4% 的人认为反馈有帮助或非常有帮助，82.4% 的人认为它比至少一部分人类审稿人的反馈更有益。",
    significance:
      "这是大语言模型生成的反馈在某些方面可与人类同行评审媲美的首批大规模定量证据，使关于 AI 辅助审稿的争论建立在实测数据而非轶事之上。",
    problem:
      "随着学术产出不断增长，高质量同行评审越来越难以获得，而大语言模型生成的科学反馈有何用处此前并未得到系统研究。",
    keyContributions: [
      "对完整论文 PDF 生成评论的 GPT-4 流水线",
      "在 Nature 期刊与 ICLR 上，GPT-4 与人类反馈的重合度同人类之间的重合度相当",
      "对 308 名研究者的用户研究，量化了主观感受到的帮助程度",
      "记录了大语言模型生成评审的局限",
    ],
  },
  "llemma-open-language-model-for-mathematics": {
    title: "Llemma: An Open Language Model For Mathematics",
    summary:
      "在 Proof-Pile-2 上对 Code Llama 继续预训练得到的 7B 与 34B 数学语言模型，与该语料库和复现代码一同发布。",
    significance:
      "证明了公开发布的数学专用模型在同等参数量下可以在 MATH 上媲美 Minerva 这类未发布的系统，且数学预训练无需额外微调即可迁移到工具使用与形式定理证明。",
    problem: "强大的数学语言模型都是专有系统，结果因此无法复现或扩展。",
    keyContributions: [
      "经 Code Llama 继续预训练得到的开源数学大语言模型（7B/34B）",
      "发布 Proof-Pile-2 语料库与完整复现代码",
      "在同等参数量下于 MATH 上媲美 Minerva",
    ],
  },
  "mathcoder-code-integration-for-mathematical-reasoning": {
    title: "MathCoder: Seamless Code Integration in LLMs for Enhanced Mathematical Reasoning",
    summary:
      "一套方法与数据集，用于微调开源模型，使其通过在推理链中嵌入可执行代码来解决数学问题，与 MathCoder-7B 模型一同发布。",
    significance:
      "表明此前只在闭源系统中展示过的工具集成数学推理，可以通过带代码标注的训练数据和代码交错的思维链引入开放模型。",
    problem:
      "代码执行有助于解决困难的数学问题，但此前只有闭源专有模型具备这一能力。",
    keyContributions: [
      "面向数学推理的带代码标注的训练数据",
      "代码交错的思维链生成",
      "具备工具集成推理能力的开放 7B 模型",
    ],
  },
  "lego-prover-growing-skill-library": {
    title: "LEGO-Prover: Neural Theorem Proving with Growing Libraries",
    summary:
      "LEGO-Prover 用一个由已验证引理构成、不断增长的技能库来增强大语言模型定理证明：它检索已有技能，在证明过程中创建新技能并加以演化，使证明能够由可复用组件以模块化方式构建。",
    significance:
      "当时推进了 miniF2F 的最先进水平（valid 48.0% → 57.0%，test 45.5% → 47.1%），并生成了 20,000 多个技能，表明证明器可以自行扩充可复用的引理库，而不必假设定理库固定不变。",
    problem:
      "此前的大语言模型证明器在整个证明过程中都假设定理库固定不变，甚至难以处理初中水平的定理，而创建新的有用引理对推进数学至关重要。",
    keyContributions: [
      "从不断增长的技能库中检索并组合已验证技能的模块化证明构建",
      "通过提示大语言模型在另一规模上充实技能库，对技能做进一步演化",
      "当时最先进的 miniF2F 通过率；消融实验显示新增技能把成功率从 47.1% 提升到 50.4%",
    ],
  },
  "tora-tool-integrated-reasoning-agents": {
    title: "ToRA: A Tool-Integrated Reasoning Agent for Mathematical Problem Solving",
    summary:
      "本文提出 ToRA，一系列工具集成推理智能体，把自然语言推理与计算库、符号求解器等外部工具结合起来，使用精选的工具使用轨迹，通过模仿学习和输出空间塑造进行训练。ToRA 模型在 10 个数学推理数据集上优于开源模型，平均绝对提升 13%-19%；ToRA-7B 在 MATH 上达到 44.6%（比 WizardMath-70B 高 22%），ToRA-Code-34B 是首个在 MATH 上超过 50% 的开源模型，胜过 GPT-4 的思维链结果。",
    significance:
      "ToRA 为开放数学模型定义了工具集成范式——语言推理与符号计算交错进行——并创下当时 MATH 上的开源最先进水平，直接把 PAL 一脉延伸到经过训练的智能体。",
    problem:
      "语言模型擅长分析但不擅长繁重计算，而工具擅长计算却需要模型提供的推理支架。",
    keyContributions: [
      "在精选工具使用轨迹上训练、采用输出空间塑造的工具集成推理智能体",
      "在 10 个数学推理数据集上平均绝对提升 13%-19%",
      "首个在 MATH 上超过 50% 的开源模型，与用程序解题的 GPT-4 相当",
    ],
  },
  "leandojo-retrieval-augmented-theorem-proving": {
    title: "LeanDojo: Theorem Proving with Retrieval-Augmented Language Models",
    summary:
      "一个开源的 Lean 工作台——工具箱、抽取的数据、预训练模型，以及一个包含 98,734 条 mathlib 定理的基准测试——外加 ReProver：一个只需单个 GPU 一周即可训练的检索增强证明器。",
    significance:
      "使机器学习定理证明变得可复现（无私有代码、无私有数据、无需庞大算力），并以细粒度前提标注直接攻克前提选择问题；ReProver 在未见前提划分上击败了非检索基线和 GPT-4。",
    problem: "Lean 中的前提选择是一个黑箱，且大多数证明实验无法复现。",
    keyContributions: [
      "从 Lean 4 mathlib 中抽取证明与前提的开放工具链",
      "ReProver：只需单个 GPU 一周即可训练的检索增强证明器",
      "带有未见前提划分、可暴露记忆问题的新基准测试",
    ],
  },
  "theoremqa-theorem-driven-question-answering": {
    title: "TheoremQA: A Theorem-driven Question Answering dataset",
    summary:
      "本文提出 TheoremQA，首个定理驱动的问答数据集：由专家精选的 800 个问题，覆盖 350 个定理（从 Taylor 定理到 Huffman 编码、量子与弹性定理），横跨 Math、Physics、EE&CS 与 Finance 四个领域。在受评测的 16 个大语言模型与代码模型中，GPT-4 使用 Program-of-Thoughts 提示达到 51%，而所有开源模型都在 15% 以下。",
    significance:
      "TheoremQA 把评测从 GSM8K 式的算术推进到将有名有姓的定理用于困难的科学问题，量化了专有模型与开源模型之间的巨大差距，至今仍是一个标准的、更难的数学/科学问答基准测试。",
    problem:
      "大语言模型在 GSM8K 等基础基准测试上超过 90%，但它们把特定领域定理用于有挑战性的科学问题的能力此前未经检验。",
    keyContributions: [
      "首个定理驱动的问答数据集：800 个问题覆盖四个领域的 350 个定理",
      "使用 Chain-of-Thoughts 与 Program-of-Thoughts 对 16 个语言与代码模型的系统评测",
      "GPT-4 达到 51% 而开源模型低于 15%，暴露出巨大的能力差距",
    ],
  },
  "lets-verify-step-by-step-process-supervision": {
    title: "Let's Verify Step by Step",
    summary:
      "OpenAI 证明过程监督——对每个推理步骤提供的人类反馈——在 MATH 上优于结果监督，并发布了 PRM800K，即用于训练奖励模型的 800,000 条步级人类标注。",
    significance:
      "有缺陷的多步推理往往仍会得到看似合理的答案；步级监督使过程奖励模型足够可靠、能够选出正确的推理轨迹，这一技术被后续推理模型的 best-of-N 选择所采用。",
    problem: "结果监督只奖励正确的最终答案，而不检查推理本身是否有效。",
    keyContributions: [
      "面向推理轨迹的人类步级标注（PRM800K）",
      "在 MATH 上，过程监督优于结果监督",
      "使用过程监督在一个有代表性的 MATH 测试子集上解出 78%",
    ],
  },
  "machine-learned-premise-selection-for-lean": {
    title: "Machine-Learned Premise Selection for Lean",
    summary:
      "Piotrowski、Fernández Mir 和 Ayers 提出了一个轻量的随机森林前提选择器，利用 Lean 4 的元编程特性直接在 Lean 4 中实现，在从 mathlib 抽取的数据上在线训练，并以 suggest_premises 策略的形式提供给用户。",
    significance:
      "把机器学习的前提选择带进了证明助手内部：由于模型在 Lean 中原生实现和训练，用户在构造证明时可以交互式地获得快速、免安装的前提建议，而不必依赖重量级的外部服务。",
    problem:
      "在大型库中证明定理需要筛选数千个候选前提，而现有机器学习方法与交互式证明工作流的整合很差。",
    keyContributions: [
      "借助 Lean 4 丰富的元编程特性直接实现的自定义随机森林",
      "在从 Lean 的数学库 mathlib 抽取的数据上在线训练",
      "交互式构造证明时可从编辑器调用的 suggest_premises 策略",
    ],
  },
  "baldur-whole-proof-generation-repair-llms": {
    title: "Baldur: Whole-Proof Generation and Repair with Large Language Models",
    summary:
      "Baldur 使用在证明上微调过的大语言模型一次性生成完整的 Isabelle/HOL 证明，而不是逐步生成，并将生成模型与一个修复模型配对，后者以上一次失败的尝试及其错误信息为条件。",
    significance:
      "首次证明整证生成是可行的，且无需昂贵搜索即可与基于搜索的技术同样有效：Baldur 比最先进工具 Thor 多证明了 8.7% 的定理，两者结合在一个包含 6,336 条定理的 Isabelle/HOL 基准测试上完全自动地证明了 65.7%。",
    problem:
      "逐步神经证明器依赖昂贵的证明搜索，而整证生成此前尚未被证明在形式验证上具有竞争力。",
    keyContributions: [
      "首次证明基于 transformer 的整证生成可行，且与基于搜索的技术同样有效",
      "以上一次失败的证明尝试及其随后的错误信息为条件的证明修复",
      "全自动证明合成的新最先进水平：比 Thor 高 8.7%；与 Thor 结合达到 65.7%",
    ],
  },
  "magnushammer-transformer-premise-selection": {
    title: "Magnushammer: A Transformer-Based Approach to Premise Selection",
    summary:
      "Magnushammer 用对比训练的 transformer 替代 Sledgehammer 手工设计的前提选择，在 PISA 上取得 59.5%，对比 Sledgehammer 的 38.3%；在 miniF2F 上为 34.0%，对比 20.9%；并仅用 1/4 的参数量把一个语言模型组合证明器在 PISA 上从 57.0% 提升到 71.0%。",
    significance:
      "表明学习式前提选择优于交互式定理证明中使用最广泛的自动化工具之一，并发布了当时可用的最大前提选择数据集——也是面向 Isabelle 证明助手的第一个数据集。",
    problem:
      "交互式定理证明中的前提选择长期依赖需要大量领域知识和工程投入的符号方法。",
    keyContributions: [
      "对比训练的 transformer 前提选择，在 PISA（59.5% 对 38.3%）与 miniF2F（34.0% 对 20.9%）上优于 Sledgehammer",
      "与基于语言模型的证明器结合，在参数量仅为 1/4 的情况下把 PISA 最先进水平从 57.0% 提升到 71.0%",
      "开源了当时可用的最大前提选择数据集，也是面向 Isabelle 的第一个数据集",
    ],
  },
  "proofnet-autoformalizing-undergraduate-mathematics": {
    title: "ProofNet: Autoformalizing and Formally Proving Undergraduate-Level Mathematics",
    summary:
      "一个包含 371 个本科纯数学示例（分析、线性代数、抽象代数、拓扑）的基准测试，每个示例都有自然语言陈述、自然语言证明和 Lean 形式化版本，并附有自动形式化基线。",
    significance:
      "量化了模型在教材材料上距离人类水平的自动形式化还有多远，并成为大语言模型定理证明器在 miniF2F 之外的标准第二评测。",
    problem: "自动形式化此前没有具有挑战性的标准化基准测试，进展难以衡量。",
    keyContributions: [
      "本科水平的形式化基准测试，非形式化与形式化文本成对配对",
      "自动形式化基线：提示检索与蒸馏回译",
      "度量了自动形式化中的人类与模型差距",
    ],
  },
  "pal-program-aided-language-models": {
    title: "PAL: Program-aided Language Models",
    summary:
      "本文提出程序辅助语言模型（Program-Aided Language models, PAL）：大语言模型读取自然语言问题，把程序作为中间推理步骤输出，再由 Python 解释器执行。在来自 BIG-Bench Hard 等基准测试的 13 个数学、符号与算法推理任务上，结合 Codex 的 PAL 在 GSM8K 上达到最先进的少样本准确率，top-1 绝对值上超过思维链 PaLM-540B 15%。",
    significance:
      "PAL 开创了数学推理的“神经大语言模型 + 符号解释器”一脉：把计算交给程序运行时可消除算术失误，这一方法直接汇入了后来 ToRA 等工具集成推理智能体。",
    problem:
      "大语言模型用自然语言逐步解题时常犯逻辑和算术错误，即使问题分解本身是正确的。",
    keyContributions: [
      "大语言模型负责分解，把推理步骤的执行交给 Python 解释器",
      "最先进的少样本 GSM8K 准确率，比思维链 PaLM-540B 绝对高 15%",
      "在 13 个数学、符号与算法推理任务上得到验证",
    ],
  },
};
