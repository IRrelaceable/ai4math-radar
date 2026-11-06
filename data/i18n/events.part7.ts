import type { EventZh } from "./types";

/** zh translations for the 1956-1997 historical backfill. */
export const eventsPart7: Record<string, EventZh> = {
  "logic-theorist-first-theorem-prover": {
    title: "逻辑理论家：第一个证明《数学原理》定理的程序",
    summary:
      "纽厄尔、肖与西蒙的“逻辑理论家”（Logic Theorist）记载于兰德公司 1956 年 12 月的 P-868 报告：它在怀特海与罗素的《数学原理》中搜索证明，并为定理 2.85 找到了一个更短的新证明。",
    significance:
      "它被广泛视为第一个 AI 程序，也是机器首次证明数学定理；它把定理证明表述为启发式搜索，这一范式为后来的自动演绎所继承。",
    problem: "在形式系统中做通用搜索无法导出证明；程序需要领域启发式来在证明步骤之间做选择。",
    keyContributions: [
      "把定理证明视为证明步骤上的启发式搜索",
      "从《数学原理》中导出定理，包括定理 2.85 的一个新证明",
      "把逻辑理论机作为人类问题求解的模型提出",
    ],
    aiRoleDescription:
      "逻辑理论家搜索证明空间并自行构造推导，其中包括《数学原理》定理 2.85 的一个新证明。",
    humanContribution:
      "纽厄尔、肖与西蒙设计了启发式，并把《数学原理》的公理与推理规则编码进程序；随后由程序给出证明。",
  },
  "geometry-theorem-machine-ibm-704": {
    title: "几何定理机器：IBM 704 上证明欧氏平面几何定理",
    summary:
      "1959 年初春，一台 IBM 704 运行盖伦特（Gelernter）的几何定理机器，证明了初等欧氏平面几何中的第一个定理；盖伦特、汉森与洛夫兰于 1960 年报告了该系统的实验结果。",
    significance: "它是最早证明非平凡数学定理的程序之一，也早期展示了领域相关的几何知识可以引导搜索。",
    problem: "几何中的盲目搜索难以奏效；程序需要利用图形与辅助线来引导搜索。",
    keyContributions: [
      "在 IBM 704 上证明了初等欧氏几何定理",
      "把图形信息与辅助构造用作搜索启发式",
      "给出了几何证明器的早期实验评估",
    ],
    aiRoleDescription: "程序自行在初等欧氏几何中寻找证明，并用基于图形的启发式引导搜索。",
    humanContribution: "盖伦特设计了该几何机器及其启发式；汉森与洛夫兰参与了实现与实验评估。",
  },
  "saint-symbolic-integration-heuristic-program": {
    title: "SAINT：求解符号积分问题的启发式程序",
    summary:
      "詹姆斯·斯莱格尔（James Slagle）的 SAINT 于 1963 年发表于《ACM 杂志》（Journal of the ACM），它把目标归约与变换选择启发式结合起来，求解大一微积分中的符号积分问题。",
    significance: "它是最早完成实质性数学任务的 AI 程序之一，也是计算机代数系统的前身。",
    problem: "符号积分需要在多种变换之间选择；没有统一算法能覆盖大一微积分的全部问题。",
    keyContributions: [
      "面向符号积分的启发式目标归约搜索",
      "求解了一组大一微积分积分题",
      "早期展示了符号计算作为 AI 任务的可能性",
    ],
  },
  "resolution-principle-first-order-logic": {
    title: "罗宾逊归结原理为自动定理证明提供单一推理规则",
    summary:
      "J. A. 罗宾逊 1965 年发表于《ACM 杂志》的论文提出归结（resolution）：一种基于合一与反证的一阶逻辑单一推理规则，后来成为大多数自动定理证明器的基础。",
    significance: "它使一阶定理证明成为统一的搜索问题，并支撑了饱和式证明器、逻辑编程与许多验证工具。",
    problem: "早期证明器使用许多专用推理规则；需要一条完备且适合机器执行的单一规则。",
    keyContributions: [
      "一阶逻辑中单一且完备的推理规则",
      "基于合一的归结",
      "反证式证明搜索",
    ],
  },
  "automath-language-for-mathematics": {
    title: "德布鲁因的 Automath 语言把机器证明检查作为设计目标",
    summary:
      "N. G. 德布鲁因（N. G. de Bruijn）的 Automath（1968）引入一种形式语言：数学陈述与证明按此书写后可由机器检查，这为基于类型论的证明助手奠定了早期基础。",
    significance:
      "它提出了“用小型可信检查器检查完整数学文本”的思想（后来称为 de Bruijn 判据），并影响了基于类型论的证明助手。",
    problem: "没有精确的形式语言与检查器，数学论证无法被机器检查。",
    keyContributions: [
      "面向完整数学文本的形式语言",
      "可机器检查的证明项",
      "证明检查的类型论基础",
    ],
  },
  "macsyma-interactive-symbolic-algebra": {
    title: "MACSYMA 把大规模符号代数带入交互式计算",
    summary:
      "马丁与法特曼在 1971 年 SYMSAC 上报告的 MACSYMA，把符号代数、化简、微积分与线性代数集成到一个交互式系统中，该系统在 MIT 的 Project MAC 开发。",
    significance: "它是标志性的通用计算机代数系统，塑造了后来的 CAS，并使符号数学成为实用的交互工具。",
    problem: "符号算法彼此孤立；用户需要一个集成的交互式系统。",
    keyContributions: [
      "集成的符号代数与微积分",
      "交互式符号计算环境",
      "后来计算机代数系统的基础",
    ],
  },
  "lcf-tactics-ml-metalanguage": {
    title: "LCF 以策略与 ML 元语言引入机器检查的证明",
    summary:
      "罗宾·米尔纳 1972 年的 LCF 系统实现了 Scott 的可计算函数逻辑，并引入交互式证明的策略（tactic）风格：证明由 ML 程序构造，程序把推理规则应用于目标。",
    significance:
      "LCF 方法——小型可信内核、策略与函数式元语言——塑造了 HOL、Isabelle、Coq 以及几乎所有现代证明助手。",
    problem:
      "交互式定理证明需要一种原则性的方式，在程序控制下构造证明，同时不信任未经验证的自动化。",
    keyContributions: [
      "基于策略的交互式证明",
      "以 ML 作为证明元语言",
      "把证明构造与检查分离的小型可信内核",
    ],
  },
  "pltp-boyer-moore-lisp-theorem-prover": {
    title: "博耶–摩尔定理证明器证明 Lisp 函数的性质",
    summary:
      "博耶与摩尔 1973 年的爱丁堡纯 Lisp 定理证明器（PLTP）在 IJCAI-73 的论文《Proving Theorems about LISP Functions》中描述：它自动证明递归 Lisp 函数的性质，并成为 Nqthm/ACL2 一脉的基础。",
    significance: "它开创了博耶–摩尔一脉基于归纳的证明器，并使自动归纳证明成为切实目标。",
    problem: "递归程序的性质需要归纳，而通用一阶证明器处理得并不好。",
    keyContributions: [
      "针对 Lisp 函数的自动归纳证明",
      "启发式化简与重写",
      "Nqthm 与 ACL2 证明器的前身",
    ],
  },
  "wu-method-mechanical-geometry": {
    title: "吴方法把初等几何转化为多项式代数",
    summary:
      "吴文俊的代数方法（1977）把初等几何定理转化为多项式方程，并用特征列方法判定，从而给出可机械执行、能证明大量几何定理的流程。",
    significance: "它开创了机器证明几何定理的代数路线，并把经典数学与自动演绎连接起来。",
    problem: "基于搜索的几何定理证明效率低下；需要统一的代数判定方法。",
    keyContributions: [
      "初等几何定理的代数表述",
      "机器证明的特征列方法",
      "对大量几何定理的机械证明",
    ],
  },
  "am-automated-mathematician-concept-discovery": {
    title: "莱纳特的自动数学家发现概念与猜想",
    summary:
      "道格拉斯·莱纳特（Douglas Lenat）的 AM（自动数学家）在 IJCAI 1977 上提出：它用启发式搜索遍历数学任务，发现初等集合论概念与猜想。",
    significance: "它是自主数学发现的早期且影响深远的尝试；其成败塑造了后来关于机器生成猜想的研究。",
    problem: "人们假设新数学概念需要人类洞察；AM 检验启发式搜索能否生成概念。",
    keyContributions: [
      "面向数学任务的启发式搜索",
      "发现初等概念与猜想",
      "机器发现的早期试验平台",
    ],
    aiRoleDescription: "AM 搜索数学任务空间，并依据启发式生成新概念与猜想。",
    humanContribution: "莱纳特设计了启发式搜索与初始集合论知识库，并对发现结果做了评估。",
  },
  "edinburgh-lcf-proof-assistant": {
    title: "爱丁堡 LCF 把 LCF 思想变成可用的证明助手",
    summary:
      "1979 年的爱丁堡 LCF 系统由戈登、米尔纳与沃兹沃思记录：它实现了可编程的证明助手，用于可计算函数逻辑，具备小型内核、策略与 ML 元语言。",
    significance:
      "它使 LCF 架构成为可运行、被广泛效仿的证明助手，并确立了 ML 与抽象类型作为可信证明工程工具的地位。",
    problem: "最初的 LCF 实验需要稳健实现，并要在可信内核与不可信策略之间划清界限。",
    keyContributions: [
      "可运行的 LCF 证明助手",
      "内核与策略分离",
      "用于构造证明的 ML 元语言",
    ],
  },
  "maple-symbolic-computation-system": {
    title: "Maple 提供可移植的交互式符号计算",
    summary:
      "1983 年由查尔、格迪斯与戈内描述的 Maple 符号计算系统，提供交互式符号代数与微积分，强调效率与可移植性。",
    significance: "它成为 1980 年代占主导地位的通用计算机代数系统之一，也是符号数学的长期工具。",
    problem: "计算机代数开销大且依赖大型机器；Maple 追求可移植、高效的系统。",
    keyContributions: [
      "可移植的符号计算系统",
      "高效的多项式与微积分算法",
      "交互式用户语言",
    ],
  },
  "coq-proof-assistant-started": {
    title: "Coq 在 Inria 启动：构造演算的实现",
    summary:
      "Coq 证明助手由热拉尔·于埃与蒂埃里·科康于 1984 年启动；版本 1 于 1985 年出现，后续版本加入了宇宙、自动化、抽取与归纳类型——以上见 Rocq 参考手册的历史记录。",
    significance: "它创造了运行时间最长、使用最广的证明助手之一，也是形式化数学与验证的核心平台。",
    problem: "构造演算需要一个可用于书写与检查证明的实际实现。",
    keyContributions: [
      "构造演算的实现",
      "带内核与策略的证明助手",
      "经 Coq 与 Rocq 版本延续至今的谱系",
    ],
  },
  "nuprl-number-theory-constructive-type-theory": {
    title: "Nuprl 在构造类型论中实现数论",
    summary:
      "豪（Howe）1986 年的论文报告了在 Nuprl 中实现数论的实验；Nuprl 是康奈尔大学康斯特布尔（Constable）及其同事开发的构造类型论证明系统。",
    significance: "它表明依赖构造类型论可以承载真正的数学，是 Nuprl 后来形式库的一步。",
    problem: "构造数学需要一个具备丰富依赖类型论的机器检查实现。",
    keyContributions: [
      "构造类型论证明助手",
      "数论形式化实验",
      "有影响力的依赖类型论设计",
    ],
  },
  "hol-proof-generating-system-higher-order-logic": {
    title: "HOL：面向高阶逻辑的证明生成系统",
    summary:
      "迈克·戈登 1987 年的技术报告描述了 HOL：一个按 LCF 风格构建、面向硬件验证的高阶逻辑证明生成系统。",
    significance: "它确立了 HOL 作为实用的高阶证明助手，并成为 HOL 家族（HOL88、HOL4、HOL Light）的基础。",
    problem: "硬件与软件验证需要带可信内核的机器检查高阶逻辑。",
    keyContributions: [
      "LCF 风格的高阶逻辑实例",
      "带小型内核的证明生成",
      "HOL 证明器家族的基础",
    ],
  },
  "hol88-hol-system-release": {
    title: "HOL88 把 HOL 系统带给更广泛的用户",
    summary:
      "由戈登与梅勒姆在剑桥开发的 HOL88 是广泛分发的 HOL 证明助手版本，使 HOL 方法走出最初的实现、面向更多用户。",
    significance: "它是第一个被广泛使用的 HOL 版本，也是 HOL4 与 HOL Light 的直接前身；后者承载了多项大型形式化。",
    problem: "最初的 HOL 系统需要一个稳定、可分发的实现供外部用户使用。",
    keyContributions: [
      "分发的 HOL 系统版本",
      "高阶逻辑验证环境",
      "HOL4 与 HOL Light 的前身",
    ],
  },
  "graffiti-graph-theory-conjecture-program": {
    title: "Graffiti：生成图论猜想的计算机程序",
    summary:
      "西苗·法伊特沃维奇（Siemion Fajtlowicz）的 Graffiti 程序通过组合图不变量生成图论猜想；1988 年的《On conjectures of Graffiti》报告了随后被数学家研究的猜想。",
    significance: "它是最多产的猜想生成程序之一，也是机器辅助数学发现的里程碑。",
    problem: "人们认为猜想生成需要人类直觉；Graffiti 检验了在图不变量上自动寻找模式是否可行。",
    keyContributions: [
      "自动生成图论猜想",
      "激发了已发表数学工作的猜想",
      "人机数学协作的早期例子",
    ],
    aiRoleDescription: "Graffiti 通过搜索图不变量的组合来生成图论猜想。",
    humanContribution:
      "法伊特沃维奇设计了 Graffiti 并选择其不变量；数学家评估、证明或反驳它生成的猜想。",
  },
  "coq-calculus-of-inductive-constructions": {
    title: "Coq 采用归纳构造演算",
    summary:
      "据 Rocq 参考手册的历史记录，Coq 第 5 版（1989）转向归纳构造演算（Calculus of Inductive Constructions），加入归纳类型与更强的依赖类型论，影响了此后所有 Coq 版本。",
    significance: "它赋予 Coq 沿用至今的类型论，使数学结构与归纳证明可以直接形式化。",
    problem: "最初的构造演算缺少归纳类型，而归纳类型是形式数学的核心。",
    keyContributions: [
      "以归纳构造演算作为 Coq 的基础",
      "归纳类型与依赖消去",
      "后来 Coq 与 Rocq 形式库的基础",
    ],
  },
  "isabelle-generic-theorem-prover": {
    title: "Isabelle：LCF 传统中的通用定理证明器",
    summary:
      "保罗森 1989 年发表于《自动推理杂志》的论文描述了 Isabelle：一个通用证明助手，对象逻辑以理论形式嵌入，证明由策略构造。",
    significance: "它引入通用的 LCF 风格框架，后来成为形式数学与验证的主要平台之一。",
    problem: "为每种逻辑单独构建证明助手会重复基础设施；通用框架可以承载多种对象逻辑。",
    keyContributions: [
      "通用的 LCF 风格框架",
      "以 Isabelle 理论嵌入对象逻辑",
      "Isabelle/HOL 及其形式库的基础",
    ],
  },
  "qed-manifesto-formal-mathematics-corpus": {
    title: "QED 宣言呼吁建立可机器检查的数学全集",
    summary:
      "1994 年的 QED 宣言主张开展长期计划，把数学形式化为可机器检查的形式，并建立共享的已检查证明库。",
    significance: "它阐明大规模形式化背后的抱负，推动了致力于形式数学库的项目与共同体。",
    problem: "形式证明分散在互不兼容的系统中，没有共享的已检查数学语料。",
    keyContributions: [
      "公开呼吁建立通用的形式数学语料库",
      "提出共享形式库与互操作议程",
      "后来形式化项目的参照点",
    ],
  },
  "casc-cade-atp-system-competition": {
    title: "CASC：CADE 自动定理证明系统竞赛",
    summary:
      "第一届 CADE 自动定理证明系统竞赛（CASC）于 1996 年在 CADE-13 举行，在统一硬件与时限下用 TPTP 问题评估自动定理证明器。",
    significance: "它成为一阶 ATP 的标准竞赛基准，并推动了证明器性能的持续工程进步。",
    problem: "ATP 系统在不同问题集与硬件上评估，使主张难以比较。",
    keyContributions: [
      "统一的 TPTP 问题集与评估协议",
      "ATP 系统之间的正面对比",
      "持续衡量 ATP 进展的基准",
    ],
  },
  "eqp-robbins-conjecture-proof": {
    title: "EQP 证明罗宾斯猜想",
    summary:
      "麦丘恩（McCune）的 EQP 等式证明器于 1996 年找到罗宾斯猜想的证明；1997 年《自动推理杂志》的论文《Solution of the Robbins Problem》报告了这一结果，回答了布尔代数中悬置数十年的公开问题。",
    significance: "它是最早由自动证明器解决长期公开数学猜想的清晰案例之一。",
    problem: "罗宾斯猜想——罗宾斯代数是否都是布尔代数——自 1930 年代以来一直悬而未决。",
    keyContributions: [
      "罗宾斯猜想的全自动证明",
      "展示了 ATP 可处理公开研究问题",
      "由 EQP 等式证明器找到证明",
    ],
    aiRoleDescription: "EQP 在没有逐步人工指导的情况下搜索并找到了罗宾斯猜想的等式证明。",
    humanContribution: "麦丘恩设计并实现了 EQP，并设置了证明搜索；证明由程序给出。",
  },
};
