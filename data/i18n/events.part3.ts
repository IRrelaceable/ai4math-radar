import type { EventZh } from "./types";

/** zh translations for .i18n-src/batch-3.json */
export const eventsPart3: Record<string, EventZh> = {
  "demo-community-open-ai4math-reproducibility-initiative": {
    title: "演示场景：一个开放社区倡议协调 AI4Math 可复现性",
    summary: "一个 Policy & Community 类的示例事件，记录了该倡议、参与团体、议题、启动日期和公开的协调页面。",
    significance: "表明社区协作本身就是一类生态事件，独立于任何单篇论文或任何单一机构。",
  },
  "demo-policy-journal-ai-use-guidance": {
    title: "演示场景：一份数学期刊发布 AI 使用指引",
    summary: "一个 Policy 类的示例事件，记录了发布机构、政策类型、受影响的社群、生效日期和主要指引文件。",
    significance: "展示了围绕 AI 辅助证明与稿件的正式规则如何进入雷达，同时不会被误当作研究成果。",
  },
  "euclean-geometry-formalization-native-mathlib": {
    title: "Euclean：面向 Lean 的几何问题自动形式化与统一验证",
    summary: "一个四阶段框架（约束显式化、构型锚定、形式化映射、迭代修复），用于在 Mathlib 中原生地进行几何形式化，产出了 OMNI-Geometry（768 道竞赛题）和 Numina-Geometry（177,597 道题）——Lean 中规模最大的几何形式化数据集。",
    significance: "消除了专用几何语言带来的信任碎片化问题：几何证明如今位于标准 Mathlib 之中；在已发布的形式化数据上训练证明器，将证明成功率从 13.6% 提高到 15.1%，表明该数据可用于真实训练。",
    problem: "以往的 Lean 几何工作使用与 Mathlib 不兼容的自定义公理，且题目数量过少（<1,100），不足以用于训练。",
    keyContributions: [
      "带迭代修复的 Mathlib 原生几何形式化流水线",
      "177,597 道题的几何语料库——Lean 中规模最大的几何语料库",
      "实测的最终效用：训练后证明成功率从 13.6% 提升到 15.1%",
    ],
  },
  "demo-education-open-ai4math-teaching-resource": {
    title: "演示场景：一个社区发布开放的 AI4Math 教学资源",
    summary: "一个 Education 类的示例事件，记录一本开放教材或教学资源、其维护者、目标学习者、发布日期和规范 URL。",
    significance: "展示了如何将持久的教育基础设施与一次性的研究成果发布区分开来。",
  },
  "demo-agency-open-mathematical-reasoning-program": {
    title: "演示场景：一家公共机构资助一个开放的数学推理项目",
    summary: "一个 Funding 类的示例事件，记录了该机构、受资助方和项目，并明确报告资助金额未披露。",
    significance: "体现了这样一条规则：当官方来源没有公布资助金额时，绝不猜测金额。",
  },
  "formal-conjectures-verified-discovery-benchmark": {
    title: "Formal Conjectures：面向数学中经验证发现的开放、持续演进的基准测试",
    summary: "一个开放、持续演进的 Lean 4 基准测试，包含 2,615 条研究级问题陈述，其中有 1,029 个来自活跃研究的开放猜想和 836 个已解决问题，并在形式化问题的数学家与尝试求解的系统之间提供了结构化接口。",
    significance: "提供了一种零污染、经内核验证的研究级证明发现度量方式——基准测试作者报告称，它已被用于新的发现，包括对开放研究猜想的解决。",
    problem: "现有形式化基准测试停留在教材水平且存在污染；研究级陈述此前没有标准化、经过验证的评测。",
    keyContributions: [
      "2,615 条经验证的 Lean 4 陈述，取自活跃研究",
      "通过开放猜想实现零污染评测",
      "社区工作流：让 AI 证明反过来帮助审核形式化工作",
    ],
  },
  "deepmind-ai-co-mathematician-workbench": {
    title: "DeepMind 的 AI co-mathematician：面向开放式研究的智能体工作台",
    summary: "一篇 arXiv 论文（arXiv:2605.06651，2026-05-07，2026-05-13 修订）介绍了 AI co-mathematician：一个异步、有状态的工作区，数学家在其中指挥 AI 智能体完成构思、文献检索、计算探索、定理证明与理论构建——同时追踪失败的假设并不断细化用户意图。早期测试报告称其帮助研究者解决开放问题、发现被忽略的文献；该系统还在 FrontierMath Tier 4 上报告了 48% 的成绩，被称为已评测系统中的新高分。",
    significance: "这是完全自主化的替代方案：一个人类主导的研究环境，而不是自动生成论文的机器。阅读其案例研究时应记住论文自己的说明：研究者有时必须亲自填补空缺。",
    problem: "一次性提示并不符合数学家实际的工作方式——他们是迭代式地工作，周期长达数周，且失败的假设也值得保留。",
    keyContributions: [
      "有状态、异步的人–智能体研究工作区",
      "追踪失败假设并细化用户意图",
      "报告达到 FrontierMath Tier 4 的最先进水平",
    ],
  },
  "demo-foundation-multi-year-ai4math-grant": {
    title: "演示场景：一家基金会宣布一项多年期 AI4Math 研究资助",
    summary: "一个 Funding 类的示例事件，依据官方资助公告记录资助方、受资助方、披露的金额、币种、项目和研究领域。",
    significance: "展示了资金承诺如何与其最终产出的技术成果分开追踪。",
  },
  "demo-institution-math-department-ai-lab-program": {
    title: "演示场景：一个数学系与一家 AI 实验室组建联合项目",
    summary: "一个跨机构合作的示例事件，记录了参与机构、联合研究项目、参与研究者和公开公告。",
    significance: "展示了雷达如何揭示在只关注论文的信息流中不可见的机构间协作。",
  },
  "demo-people-mathematician-joins-ai4math-project": {
    title: "演示场景：一位顶尖数学家加入一个 AI4Math 研究项目",
    summary: "一个 People 类的示例事件，记录一位研究者加入某项目，包括其角色、所属机构、项目以及原始公告链接。",
    significance: "表明人事变动作为生态事件被追踪，而论文与模型仍作为附属实体。",
  },
  "deepmind-aletheia-towards-autonomous-mathematics-research": {
    title: "DeepMind 的 Aletheia：端到端攻克开放问题的智能体",
    summary: "一篇 arXiv 论文（arXiv:2602.10177，2026-02-10，2026-03-06 修订）介绍了 Aletheia：一个构建在高级 Gemini Deep Think 之上的研究智能体，以自然语言生成、验证并修订解答，并呈现出超出竞赛级问题范围的推理时扩展规律。报告的里程碑包括：无需人工干预、由 AI 生成的关于算术几何中结构常数的论文；一篇关于独立数上界的人–AI 合作论文；以及对 Bloom 的 Erdős Conjectures 数据库中 700 个开放问题的半自主评测，其中自主解决了四个开放问题。论文提出了自主性/新颖性等级和人–AI 交互卡片。",
    significance: "这是从奥林匹克金牌标准迈向专业研究实践的最清晰的公开尝试——同样重要的是，它还提出了如何如实报告 AI 贡献的建议。注意：对 700 个问题的扫描并不等于解决了 700 个问题。",
    problem: "竞赛级系统无法处理文献导航，也无法完成长周期的研究级证明。",
    keyContributions: [
      "端到端的研究智能体：以自然语言生成、验证、修订",
      "对 700 个开放问题的半自主扫描，其中自主解决了 4 个",
      "提出自主性/新颖性等级与人–AI 交互卡片",
    ],
  },
  "demo-people-researcher-ai-proof-viewpoint": {
    title: "演示场景：一位研究者公开表达对 AI 辅助证明的观点",
    summary: "一个 People 类的示例事件，记录具名研究者、该观点发表于哪场报告、日期、主题和原始来源，而不是把这个人简化为正面或负面的情绪。",
    significance: "展示了平台如何把 AI 撰写的摘要与发言者的原始表述区分开来，并让一手来源始终只差一次点击。",
  },
  "demo-institution-university-ai4math-center": {
    title: "演示场景：一所大学设立一个跨学科 AI4Math 中心",
    summary: "一个 Institutions 类的示例事件，记录了发起者、设立的内容、何时启动，以及哪些院系和项目参与其中。",
    significance: "展示了判断大学是否正在把孤立的 AI 数学项目转变为持久计划所需的机构级视角。",
  },
  "demo-education-ai4math-summer-school": {
    title: "演示场景：一个 AI4Math 暑期学校开放申请",
    summary: "一个 Education 类的示例事件，记录一个暑期培训项目的组织者、受众、课程安排、举办时段和申请来源。",
    significance: "展示了 Education 中的培训项目分支，而不将其与研究研讨班或社区政策事件混为一谈。",
  },
  "o-forge-llm-computer-algebra-asymptotic-analysis": {
    title: "O-Forge：一个用于渐近分析的 LLM + 计算代数框架",
    summary: "一个 In-Context Symbolic Feedback 循环：前沿大语言模型为渐近不等式提出区域分解，再由计算代数系统（如 Mathematica）逐段进行公理化验证。",
    significance: "这是大语言模型从竞赛数学走向研究级符号工作的一个具体且经过验证的例子：论文报告其回答了 Terence Tao 提出的问题——将大语言模型与验证器结合，能否证明复杂的渐近不等式。",
    problem: "研究级证明可能看起来似是而非，但没有严格检查就无法信任；而找到恰当的区域分解才是最困难的部分。",
    keyContributions: [
      "LLM 与 CAS 之间的 In-Context Symbolic Feedback",
      "研究级渐近不等式的经验证明",
      "把 LLM 辅助从竞赛问题推进到专业工具",
    ],
  },
  "demo-education-university-ai-for-mathematics-course": {
    title: "演示场景：一所大学新增一门 AI for Mathematics 课程",
    summary: "一个 Education 类的示例事件，依据公开课程目录记录学校、院系、课程名称、课程编号、授课教师、学期和学习成果。",
    significance: "展示了 AI4Math 是否正在从研究研讨班走向计学分的课程体系。",
  },
  "gemini-deep-think-imo-2025-gold-medal": {
    title: "Gemini 的 Deep Think 高级版本在 International Mathematical Olympiad 正式达到金牌水平",
    summary: "Google DeepMind 宣布，Gemini 的高级“Deep Think”版本在 IMO 2025 中由 IMO 官方协调员按照正式比赛条件评分，达到了金牌水平。",
    significance: "这是通用大语言模型首次在官方评分下于完整的 IMO 问题上达到金牌水平，距 AlphaProof 取得银牌水平的结果一年——衡量的是自然语言推理而非形式证明。",
    problem: "在官方评测下，通用模型在完整的奥林匹克问题上达到金牌水平仍不可及。",
    keyContributions: [
      "在 IMO 官方评分条件下达到金牌水平",
      "面向高难奥林匹克问题的扩展推理模式",
      "一年之内从银牌（2024）跨到金牌（2025）",
    ],
  },
  "asmob-algebraic-symbolic-mathematical-operations-benchmark": {
    title: "ASyMOB：代数符号数学运算基准测试",
    summary: "35,368 道经验证的符号数学问题（积分、极限、常微分方程、级数、超几何函数），每道题都经过符号、数值以及保持等价性的变换扰动，以区分记忆与真正的推理。",
    significance: "表明大多数模型在轻微扰动下就会崩溃，而代码工具能稳定较弱的模型，并且存在一批 CAS 失败而 LLM 成功的问题——这些是混合 LLM+CAS 系统与可信符号 AI 的证据基础。",
    problem: "现有评测把模式记忆与真正的符号推理混为一谈。",
    keyContributions: [
      "基于扰动的设计，将记忆与推理区分开",
      "覆盖五个符号领域的 35,368 道经验证问题",
      "记录了 CAS/LLM 的互补性，支撑混合方法",
    ],
  },
  "mlr-bench-evaluating-ai-agents-open-ended-research": {
    title: "MLR-Bench：在开放式机器学习研究上评测 AI 智能体",
    summary: "包含 201 个取自 NeurIPS/ICLR/ICML 研讨班的开放式研究任务、一个自动审稿人（MLR-Judge）和一个模块化智能体脚手架（MLR-Agent）；对六个前沿模型加一个编码智能体的评测发现，编码智能体在约 80% 的情况下产生了捏造或被推翻的实验结果。",
    significance: "为本平台在 V3/V4 所需的研究智能体设定了可靠性门槛：写出连贯的论文容易，做出可信的实验却不容易——该基准测试与审稿人都已开源，以便对智能体流水线逐步诊断。",
    problem: "研究智能体已经能产出看起来似是而非的论文，但此前没有人测量过它们的实验结果是否真的站得住脚。",
    keyContributions: [
      "覆盖想法、提案、实验与论文各阶段的端到端评测",
      "MLR-Judge：基于评分标准的审稿人，已对照专家审稿进行验证",
      "量化了当前编码智能体的结果捏造比例（约 80%）",
    ],
  },
  "alphaevolve-gemini-coding-agent-algorithms": {
    title: "AlphaEvolve：一个由 Gemini 驱动、用于设计先进算法的编码智能体",
    summary: "一个进化式编码智能体，使用 Gemini 模型对整个代码库进行变异并自动评估，宣布改进了矩阵乘法算法，并在数学与计算系统多个方向取得收益。",
    significance: "把 FunSearch 式的程序进化变成了能够改进真实算法与系统的实用智能体，使 AI 数学发现的范围从单个函数扩展到完整程序。",
    problem: "现有 LLM 搜索方法优化的是小代码片段，而不是真实且相互作用的代码。",
    keyContributions: [
      "在整代码库上进行进化并自动评估",
      "改进矩阵乘法算法并带来系统级收益",
      "把 FunSearch 循环泛化为可复用的智能体",
    ],
  },
  "ai-scientist-v2-workshop-level-agentic-tree-search": {
    title: "The AI Scientist-v2：通过 agentic tree search 实现研讨班级别的自动化科学发现",
    summary: "Sakana AI 在 The AI Scientist 之后推出的续作，不再依赖人类编写的代码模板，而是使用由专职实验管理智能体掌控的渐进式 agentic tree search；在三篇完全自主生成、投稿到同行评审 ICLR 研讨班的稿件中，有一篇得分高于人类录取的平均水平——这是首篇成功通过同行评审的完全 AI 生成论文。",
    significance: "这标志着完全 AI 生成的论文首次通过真正的同行评审，使自动化研究系统从草稿生产走向经外部验证的录用。",
    problem: "早期的自动化科学家流水线依赖人类编写的代码模板，无法跨研究领域泛化，也无法围绕单一想法推进迭代实验。",
    keyContributions: [
      "首篇在研讨班场合通过同行评审的完全 AI 生成论文",
      "由实验管理智能体驱动的无模板 agentic tree search",
      "用视觉语言模型反馈循环打磨图表与稿件美观度",
      "开源了端到端实现",
    ],
  },
  "kimina-prover-preview-large-formal-reasoning-rl": {
    title: "Kimina-Prover Preview：通过强化学习迈向大型形式推理模型",
    summary: "一个大型形式推理模型，以 Qwen2.5-72B 为起点、通过大规模强化学习流水线训练，借助推理驱动的探索生成 Lean 4 证明，并公开发布了更小的蒸馏模型。",
    significance: "确立了 72B 规模下用于形式证明的推理驱动 RL 范式：发布时在 miniF2F-test 上达到 80.7% pass@8192；蒸馏出的 1.5B/7B 开源模型让强证明能力走出前沿实验室。",
    problem: "大规模形式推理既需要规模也需要探索，而此前的开源证明器规模要小得多。",
    keyContributions: [
      "72B 规模下用于 Lean 4 证明生成的大规模 RL 流水线",
      "面向证明搜索的推理驱动探索模式",
      "开源了 1.5B 与 7B 蒸馏证明器",
    ],
  },
  "ai-co-scientist-multi-agent-hypothesis-generation": {
    title: "以 Co-Scientist 加速科学发现",
    summary: "Google 推出了 Co-Scientist：一个构建在 Gemini 之上的多智能体 AI 系统，它以科学家的目标和已有证据为条件，生成、批评并完善研究假设，采用异步多智能体架构和随测试时算力扩展的锦标赛式进化过程。在三个生物医学应用中，它给出了经实验验证的假设，包括新的药物重定位候选方案，以及经体外实验确认的急性髓系白血病协同联合疗法。",
    significance: "这是最早一批机器生成假设得到湿实验确认的 AI 共科学家系统之一——其 arXiv 记录现已附带 Nature（2026）的发表 DOI——为经证据验证的人–AI 研究合作确立了范本。",
    problem: "产生新颖且可实验检验的假设是科学发现的瓶颈，仅靠人力投入无法扩展。",
    keyContributions: [
      "支持异步任务执行的多智能体架构，实现灵活的算力扩展",
      "用于假设生成自我改进的锦标赛式进化过程",
      "测试时算力扩展能随时间可测量地提升假设质量",
      "针对急性髓系白血病药物重定位的假设经体外实验验证",
    ],
  },
};
