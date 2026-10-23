import type { EventZh } from "./types";

/** zh translations for .i18n-src/batch-2.json */
export const eventsPart2: Record<string, EventZh> = {
  "ineqagent-agentic-inequality-proving-in-lean-with-symbolic-computation": {
    title: "IneqAgent：结合符号计算的 Lean 智能体不等式证明",
    summary: "形式化（formalization）的不等式证明既需要数学推理，也需要精确计算，二者常通过中间引理与目标重述相连接。我们提出 IneqAgent，一个将大语言模型推理与符号计算结合、用于 Lean4 中不等式证明的智能体框架。引理层面的蒙特卡洛树搜索协调引理构造、目标重述与符号后端的选择。互补的平方和（sum-of-squares）、Bernstein 与逐步差分代换后端为局部 Lean 证明生成产出精确证书。该智能体把这些证明与大语言模型生成的步骤整合，并利用 Lean 的反馈构造完整证明，对照原定理陈述进行检查。在四个基准测试上，配备 DeepSeek-V4-Flash 的 IneqAgent 解决了 186 个问题中的 175 个（94.09%），在所评测方法中取得最高的总体成功率。在四种基座模型上，与使用相同基座的 Direct Agent 相比，它在更低的大语言模型推理成本阈值下取得更高的成功率，并且在各方法各自的成功运行上平均推理成本更低。我们还获得了经 Lean 验证的四维与五维 Dittert 猜想的加强形式，并证明了 Holens--Djokovic $(4,4)$ 不等式，从而蕴含四维的 Merris 猜想。",
    significance: "归入 Mathematical Agents → multi-step tools。自动抓取——引用前请核对所链接的原始来源。",
  },
  "euler-towards-human-centered-multi-agent-mathematical-discovery": {
    title: "Euler：以人为中心的多智能体数学发现",
    summary: "数学研究推动科学发现，近期 AI for mathematics（人工智能与数学）的进展表明，语言模型智能体能够解决有挑战的问题并给出实质性的数学证明。然而，当今许多人工智能与数学工作都以获得最终答案为中心。这种侧重使结果背后的探索难以被研究者理解，而长时间的研究又面临上下文碎片化，以及无根据的论断在推理步骤间传播的风险。我们提出 Euler，一个以人为中心的数学研究系统，围绕研究过程的共享结构化表示构建。Euler 把数学陈述、假设、证明依赖、替代路径、失败尝试与验证证据组织成相互连接的研究图。这一表示让研究者能够追踪结果是如何产生的，并为智能体提供跨会话持久、与任务相关的知识，用于规划、协作与验证。研究者还可以选择一个与已保存团队状态相连的图节点，回顾智能体此前的推理，并通过持续交互探索其他方向。我们通过三个数学研究案例展示 Euler 的能力，并描述已实现的系统及其软件验证。",
    significance: "归入 Mathematical Discovery → conjecture。自动抓取——引用前请核对所链接的原始来源。",
  },
  "verifying-deployed-bytecode-against-executable-evm-semantics-with-exact-gas-and-no-added-axioms": {
    title: "对照可执行 EVM 语义验证已部署字节码：精确 gas 且不添加公理",
    summary: "以太坊许多最关键的代码是不可变的字节码：未经验证的编译器的陈旧产物，以及作为合约代码运行的协议逻辑。我们表明，这类字节码可以按原样被验证：无需信任其生成者，无需简化它所运行的机器，也不使用 Lean 自身公理之外的任何公理。Blanc 是一个 Lean 4 验证栈，它通过内核检查的证书读取固定的运行时字节，并针对 Jaune 陈述每一条定理；Jaune 是 EVM 与区块处理的可执行语义，通过了 Ethereum fixture 发布版 v20.0.2 中全部 34,205 个区块链测试用例——这些用例只涉及自 2025 年 5 月以来主导主网的分叉。八个工件部署于 2017 至 2026 年，出自七个编译器版本和一个汇编器。对于 EIP-7002 合约，我们证明：对它的区块末调用（一旦失败将使区块失效）无论其存储内容为何都会成功，并且每个区块的提款请求恰好是最早的待处理提交；Prague 启动之时，主网满足这些定理的起始前提。对于一个 Uniswap V2 交易对，我们证明：在哈希槽位彼此分离的任何有效历史之后，从代表其 Solidity 模型状态的任一检查点出发，存储所表示的正是该模型在恰好这些已提交调用上的重放；平衡的流动性账本保持平衡；并且在关于代币应答的前提下，每份份额的几何平均储备只会经由协议费用下降。精确 gas 使活性可被证明：一个被追踪到的、自身无代码的 WETH9 持有者可以凭一笔 gas 具有闭式的交易提款，该闭式与 30,000 个区块内同形状的全部 3,748 笔可比主网回执相符。对于用 2023 年被利用的 lock bug 编译的 Curve 池字节码，Jaune 从部署起就能执行这样的重入；对于来自固定编译器的字节码，我们证明该锁排除了重入。在一位作者的指导下，AI 智能体在一套现有栈之上用 15 天写出了这些证明。",
    significance: "归入 Theorem Proving → Lean。自动抓取——引用前请核对所链接的原始来源。",
  },
  "falsification-proof-non-market-allocation-mechanisms": {
    title: "抗虚假申报的非市场配置机制",
    summary: "依赖可操纵的特征来有针对性地配置资源充满困难。朴素的最优规则会导致虚假申报与配置低效。在顾及虚假申报的同时为配置效率而优化规则，通常又会诱发虚假申报，对参与者代价高昂。此外，虚假申报还会产生负外部性。我们在广泛的虚假申报技术下刻画了最优的抗虚假申报规则。我们还给出一个诚实条件，在此条件下这些规则解决规划者的无约束问题，即最大化配置剩余与参与者福利的加权和。",
    significance: "归入 Mathematical Agents → multi-step tools。自动抓取——引用前请核对所链接的原始来源。",
  },
  "reset-early-reset-often-eliminate-models": {
    title: "尽早重置、频繁重置、消去模型",
    summary: "连接式 tableau 证明器通常通过回溯搜索构造封闭 tableau。这给出了轻量的证明过程，但其低内存的搜索状态在一次失败尝试之后几乎不留可复用的派生信息。SATCoP 通过在增量 SAT 求解器中保留 tableau 的 ground 子句来解决这一点，使证明器能在累积的 ground 子句变为命题不可满足时反驳该问题。我们提出 SATResetCoP，它更直接地依赖这一持久 SAT 状态：不在没有产出的 tableau 上回溯，而是启动新的 tableau，为 SAT 求解器生成更多 ground 子句。在 TPTP 上，SATResetCoP 相比我们的 leanCoP 风格基线提升 54%，相比 SATCoP 风格基线提升 18%。在茂密的 MPTP2078 基准测试上，它解决 616 个问题，比我们的 leanCoP 风格基线提升 49%，比 SATCoP 风格基线提升 12%。这些结果表明，改变 tableau 的引导方式以更快积累有用的 ground 子句，能够提升证明器的性能。",
    significance: "归入 Theorem Proving → Lean。自动抓取——引用前请核对所链接的原始来源。",
  },
  "leanprm-lean-grounded-process-supervision-for-natural-language-proof-verification": {
    title: "LeanPRM：基于 Lean 的自然语言证明验证过程监督",
    summary: "AI 系统如今能写出冗长而困难的数学证明，而逐步检查其有效性正成为瓶颈。一个学习得到的验证器可以低成本地检查证明，但训练它需要为每一步给出正确性标签，而对开放式证明而言这类标签很难获得。现有方法要么从人工标注者那里获取标签（代价高昂），要么从最终答案推导标签（而证明并没有最终答案），而把每份证明形式化为 Lean 又需要专家投入。我们提出 LeanPRM，一个利用 Lean 证明助手为自然语言证明生成步骤级标签的框架。一个模型在没有 Lean 反馈的情况下写出自然语言证明及与之配对的形式证明。随后 Lean 为每一步打标签，第二个模型剔除那些仅由形式语法造成的失败，从而使负标签指向数学上的错误。LeanPRM 包含 10,634 份证明、152K 个带标签步骤，且没有任何人工标注。在 LeanPRM 上训练的 Qwen3-4B 验证器把 200 份留出证明（LeanPRM-Bench）上的精确步骤标签准确率从 48.2 提升到 74.7，而同一基座模型在 PRM800K 上训练时仅为 60.3。在 IMO 级别问题的 best-of-N 选择中，它也能选出更好的证明，并在四个外部验证基准测试中的三个上优于 PRM800K 训练的验证器。在 LeanPRM 上训练能在 0.6B 到 8B 的各种规模上改进验证器在 LeanPRM-Bench、Hard2Verify 和 IMO-GradingBench 上的表现。由于这些标签无需人工标注，LeanPRM 可以随形式陈述供给的增长而扩大，为那些人类难以检查的 AI 生成证明提供获得步骤级反馈的途径。",
    significance: "归入 Theorem Proving → Lean。自动抓取——引用前请核对所链接的原始来源。",
  },
  "veripie-checkable-query-plans-and-evidence-guided-selection-for-text-to-sql": {
    title: "VeriPIE：可检查的查询计划与证据引导的 Text-to-SQL 选择",
    summary: "金融人工智能（AI）治理与模型风险管理（MRM）强调对 AI 生成计算的独立验证、透明性以及有效质疑。Text-to-SQL 把自然语言问题翻译成 Structured Query Language（SQL），但在一个数据库上取值一致的查询仍可能表达不同的计算。我们提出 VeriPIE，一个把语言模型生成与符号检查结合起来的神经符号框架。它将直接 SQL 生成与 QuerySketch 集成：QuerySketch 是一种结构化计划语言，由用 Lean（一个定理证明器兼编程语言）实现的后端检查。计划诊断在 SQL 生成之前引导修复，而执行一致性与针对区分性数据库的有界搜索为候选选择提供依据。这些检查能够暴露畸形计划与隐藏的分歧，但并不证明其与用户意图一致。在完整 Spider 开发集上的单次运行实验中，VeriPIE 取得 72.05% 的测试套件准确率（745/1,034），DeepEye 为 65.67%（679/1,034）。其两查询候选清单覆盖 78.43%（811 个问题），DIN-SQL 为 74.66%（772），DeepEye 为 69.05%（714）。在 BIRD 上，VeriPIE 达到 68.90% 的执行准确率和 73.73% 的两查询覆盖率。其核心收益是关于所生成计算的可复核证据：显式的计划检查、修复诊断以及具体的分歧，这些都支撑更安全的金融分析。",
    significance: "归入 Theorem Proving → Lean。自动抓取——引用前请核对所链接的原始来源。",
  },
  "do-theorem-provers-need-theorem-proving-agents-mini-lean-agent-a-coding-agent-baseline-for-lean": {
    title: "定理证明器需要定理证明智能体吗？mini-Lean-agent：一个 Lean 的编码智能体基线",
    summary: "通用编码智能体使用标准的 shell 与文件交互，而形式定理证明智能体往往依赖专门的、临时性的工具。这使人难以判断定理证明智能体的哪些组件带来了基准测试收益：改进的基座模型、专门的运行框架、某个具体工具，还是它们的某种组合。我们提出 mini-Lean-agent，一个刻意极简的 Lean 任务智能体，其唯一对模型可见的工具是 bash。模型必须用 bash 检查和编辑代码仓库、搜索本地库、调用 Lean 并管理自己的中间工作，而由一个独立的可信评测器验证最终产物。我们在 Putnam 2025 基准测试上将 mini-Lean-agent 与 AxProverBase 和 Numina-Lean-Agent 作比较。以 Gemini 3.8 Flash 为基座模型的实验显示，在每题 \\$2 的限额下 mini-Lean-agent 解决 7/12 个问题，而 AxProverBase 为 4/12。以 Astra 为基座模型时，mini-Lean-agent 解决 12/12 个问题，平均每题成本 \\$1.28。这表明，配备极简运行框架的通用编码智能体在 Lean 基准测试上已能达到很强的性能。我们的结果支持在评测定理证明基础设施时把 mini-Lean-agent 用作标准基线。",
    significance: "归入 Theorem Proving → Lean。自动抓取——引用前请核对所链接的原始来源。",
  },
  "masked-attention-pooling-is-invariant-to-padding-and-permutation-a-formal-proof-in-lean": {
    title: "掩码注意力池化对填充与置换不变：Lean 中的一个形式证明",
    summary: "基于注意力的多示例学习（MIL）把大小可变的示例嵌入袋汇聚成一个向量。在批量训练中，各袋被填充到共同长度，而汇聚输出被期望既不依赖填充了多少，也不依赖示例的存储顺序。只有当填充行同时从分子和 softmax 归一化器中移除时，这一期望才成立。常见的实现写法只在附加条件下满足它。仅把填充特征置零并不奏效。用 $-\\infty$ 掩码 logits 在空袋和非有限填充上会失效。用一个大的负常数掩码只有在浮点下溢之后才是精确的。我们定义了带守卫归一化器的掩码注意力池化，并在配有 mathlib 的 Lean 4 中证明：它在行的任意双射重编号下不变，在追加任意有限条具有任意实特征与 logits 的被掩码行之后也不变。我们还证明，被掩码位置上的取值无关紧要，且全掩码的袋映射为零。这些定理对任意有限索引类型与特征维度成立。借助 jax-lean 证书流水线，我们把这些定理与从 JAX 内核本身追踪得到的 Jaxpr 联系起来。Lean 为两个具体形状检查翻译证书，把生成的函数与通用规范等同起来，并把两种不变性转移到所导入 Jaxpr 的实数算术语义上。所有被审计的定理只依赖 Lean 的三条标准公理。结果针对理想实数算术。浮点执行、XLA 以及 JAX 的追踪器与导入器仍在证明之外。",
    significance: "归入 Theorem Proving → Lean。自动抓取——引用前请核对所链接的原始来源。",
  },
  "constant-depth-rational-weight-gnns-and-their-connection-to-schanuel-s-conjecture": {
    title: "常数深度有理权重 GNN 及其与 Schanuel 猜想的联系",
    summary: "一个标志性结果表明，图神经网络（GNN）的表达能力以一维 Weisfeiler-Leman（1-WL）测试为上界。我们追问：常数深度的 GNN 能否仅用有理权重就匹配 1-WL 的表达能力？我们证明：当超越数论中著名的未决问题 Schanuel 猜想被假定为真时，答案是肯定的。我们的 GNN 构造即使使用权重为整数也成立，更一般地对广泛的有理权重也成立。作为激活函数，它可以使用 logistic sigmoid、双曲正切或相关函数。它对所有图规模是统一的。我们还证明一个部分逆命题：如果一个以指数函数、双曲正弦或双曲余弦为激活的 GNN，在图可含某些辅助顶点、表达能力略强的设定下匹配 1-WL 测试的表达能力，那么这蕴含限制在 GNN 计算中出现的那些数上的 Schanuel 猜想。我们还进行了实验，表明所构造的 GNN 确实匹配 1-WL 测试。",
    significance: "归入 Mathematical Discovery → conjecture。自动抓取——引用前请核对所链接的原始来源。",
  },
  "attention-graph-curvature-for-the-verification-of-mathematical-reasoning": {
    title: "用于数学推理验证的注意力图曲率",
    summary: "语言模型最近解决了公开的 Erdős 问题，并在 International Mathematical Olympiad 问题上达到金牌水平。但它们以自然语言写成的解答目前还无法由证明助手验证。一个错误的推理步骤会使之后的所有步骤失效，因此尽早发现错误是有利的。已有若干方法基于执行推理的语言模型的前向传播特征来快速检测错误推理。在这项工作中，我们研究该模型注意力图的有向 Forman 曲率——一个在一条边上、由其周围注意力权重计算出的局部量——是否携带关于某一步正确性的信息。为此，我们在 ProcessBench 上评测四个逐步验证器，分别在输入中加入与不加入该曲率。追加曲率值提升了全部四个验证器的整体平均表现。以一步中每个 token 为输入的验证器 ReProbe 提升最大。加入曲率使语言模型的前向传播时间平均增加 18%。",
    significance: "归入 Formal Mathematics → formalization。自动抓取——引用前请核对所链接的原始来源。",
  },
  "ai-discovery-in-combinatorics-from-problems-to-solutions-and-back-to-bigger-problems": {
    title: "组合数学中的 AI 发现：从问题到解答，再回到更大的问题",
    summary: "我们提出 $qt$Bench，一个包含 29 个代数组合数学公开问题的基准测试。这些问题要求给出一个简单的组合算法，用以解释给定的多项式系数或恒等式。为帮助 AI 智能体搜索此类算法，我们提供了一套脚手架，用于操作组合对象、抵御作弊尝试以及测试候选解答。为探索前沿 AI 系统在这些问题上能走多远，我们与 OpenAI 合作，其研究人员为其中若干问题给出了解答方案。这凸显出更大的元问题：大规模的 AI 发现是否合乎伦理？这些结果应如何发布？证明的消化整理应如何组织？我们讨论这些问题并给出我们的看法。",
    significance: "归入 Mathematical Discovery → conjecture。自动抓取——引用前请核对所链接的原始来源。",
  },
  "learning-graded-sparse-mechanisms-a-representation-theorem-and-certified-generalization": {
    title: "学习分级稀疏机制：一个表示定理与经认证的泛化",
    summary: "在各种多智能体与物理环境中，一个元素的更新强烈依赖少数其他元素、微弱依赖多数其他元素，而且重要的元素其身份与数量都会随系统状态而变化。这类分级稀疏机制很常见，例如鸟群、人群、习得的粒子模拟器以及图网络的邻域聚合；但作为一类带有给定分级的函数，它们得到的系统研究很少。本文研究分级由环境提供（作为每个元素上的权重）时该机制的监督学习。首先，我们用公理定义该类：每个元素的影响以其权重为上界，对权重的依赖是正则的，且不特殊对待任何元素；并证明一个表示定理：该类恰是加权多重集上一个传输度量的 Lipschitz 球，而该度量由公理唯一确定。其次，表示的几何给出以两种方式依赖数据的泛化界。其一是通过数据的稀疏剖面——即重要元素有多少、重要程度多大的规律——它对所有具有该剖面的设计界定速率，其指数来自剖面本身，且不依赖元素个数。在若干自然情形下，我们还给出匹配的下界（指数中相差常数因子）。其二是经验性的：由于表示结果，经典的经验偏差界可原样适用于该类，所得界是样本两半在该类自身度量下的传输距离（由一个匹配精确算出），外加一个集中项。最后，我们在两种噪声水平下的四种交互规则上研究一个模拟的 Vicsek 鸟群，并表明该证书是非空洞的：在每条规则上都只是平凡值的一小部分。",
    significance: "归入 Geometry → olympiad geometry。自动抓取——引用前请核对所链接的原始来源。",
  },
  "a-lean-formalisation-of-the-disproof-of-ramaekers-s-conjecture": {
    title: "Ramaekers 猜想之反驳的 Lean 形式化",
    summary: "我们介绍 Redhill，即对 Hölzl、Kleine 和 Stephan 的 “Improved Lower Bounds for Strong $n$-Conjectures”（arXiv:2409.13439）主要结果的 Lean 形式化。关于类型与数据结构的设计决策被论证为使论文论断的规范版本成为可能，并由此得到这些论断最直接的证明。形式化过程还揭示了非形式证明中的许多错误、遗漏与优化机会，全部在最终库中得到处理。尽管 Redhill 旨在独立成立，仍有若干引理被上游合并到 Lean 的主数学库 mathlib。我们讨论了上游合并与把引理留在独立库之间的张力。与许多同期形式化项目不同，Redhill 在没有任何大语言模型（LLM）协助的情况下完成。我们把自己的工作与 LLM 辅助项目相比较，尤其是把 arXiv:2409.13439 扩展到 $n=4$ 的工作，旨在确立界定良好 Lean 形式化的设计与风格准则。",
    significance: "归入 LLM for Mathematics → math-specialized models。自动抓取——引用前请核对所链接的原始来源。",
  },
  "tao-math-2-0-caltech-lecture": {
    title: "Terence Tao 的 Math 2.0 讲座：一个维系数学共同体的 AI 工具愿景",
    summary: "2026-10-09 晚，Terence Tao 在 Caltech（AIM Public Lecture Series；原题 “Machine Assisted Proof”，一年多前即已筹划，原定 5 月举行，后推迟并大幅改写）发表公开讲座 “Math 2.0”。他提出三个阶段：“Math 1.0”，即数学按其历史路径的发展；当前因过度强调由 AI 自动解决公开问题而形成的状态；以及未来的 “Math 2.0”，其中 AI 工具既用于维系数学共同体本身，也用于维系数学理解在推动并使数学应用于现实世界保持协调方面所扮演的角色。幻灯片于 2026-10-10 发布，内容并入他关于 AI 观点的持续更新综述。",
    significance: "AI 时代一位顶尖数学家给出的最清晰的建设性纲领：9 月的宣言指出了什么问题，Math 2.0 则指明要建设什么——维系共同体与理解、而非取代它们的 AI 时代基础设施与工作流。这次讲座成为后续共同体基础设施的参照点：SAIR 的 Open Math OS 在数天后以 “Infrastructure for Math 2.0” 为口号推出。",
    problem: "仅仅反对基准测试竞赛什么也建设不起来；共同体需要一个关于 AI 时代数学应当是什么样子的正面愿景。",
    keyContributions: [
      "三阶段框架：Math 1.0、当前被 AI 扰动的状态，以及维系共同体的 Math 2.0",
      "把目标从自动解题转向维系数学家与理解的工具",
      "幻灯片已发布，内容并入 Tao 关于 AI 观点的持续更新综述",
    ],
  },
  "bsd-local-factors-axiomprover-autoformalized": {
    title: "BSD Tamagawa 数统计论文由 AxiomProver 自动形式化为 Lean",
    summary: "一篇人工撰写的数论预印本（arXiv:2610.10243，2026-10-07）推导出一个多元 Euler 积，编码短 Weierstrass 椭圆曲线的 Tamagawa 乘积，并计算极限分布——超过一半的曲线其 Tamagawa 乘积平凡，约 42.2% 恰有一个素数具有非平凡的局部 Tamagawa 数，约 6.8% 有两个。论文称其结果已由 AxiomProver 自动形式化为 Lean。",
    significance: "清晰的分工：人工的猜想与证明，加上对研究论文结果的自动形式验证——这一模式值得持续观察，看 AI 证明检查将如何应用于 2026 年 10 月的手稿潮。这不是 BSD 的 AI 解答。",
    problem: "自动形式化此前主要展示于习题与竞赛问题，而不是研究论文的数论结果。",
    keyContributions: [
      "用于 Tamagawa 乘积的多元 Euler 积",
      "Tamagawa 数的分布统计",
      "结果由 AxiomProver 自动形式化为 Lean",
    ],
  },
  "ahm-statement-openai-math-release": {
    title: "Association for Human Mathematics 呼吁数学家终止与 OpenAI 的合作",
    summary: "2026-10-07，Association for Human Mathematics（Communications Working Group）针对 OpenAI 于 2026-10-06 发布的数学手稿代码仓库发表声明，并于同日由 Terence Tao 的博客转载。声明认为数学家并没有要求这项工作，OpenAI 忽视了 Advisory Group on Mathematics and Artificial Intelligence 的核心前提（前沿 AI 公司不应在其内部模型上测试高难度数学问题），并称 “一次发布 700 多个文件不是学术的展示，而是权力的展示”。声明呼吁数学家与公众以应有的审慎看待这种发布模式，并终止他们与 OpenAI 的合作。",
    significance: "对 10 月 6 日发布最尖锐的有组织共同体回应：在发布次日即明确呼吁停止与一家前沿实验室合作，并由一个知名的独立平台（Tao 的博客）转载。它标志着该实验室以基准测试驱动的发布模式与共同体规范——署名、成文阐述、人类理解——之间的显性分裂，并把 9 月的 Fields Medal 得主宣言落到实处。",
    problem: "一家前沿实验室大规模发布 AI 生成的数学成果，却绕过了共同体的评审、署名与成文阐述规范。",
    keyContributions: [
      "否定“10 月 6 日的发布推进了数学”这一前提，称其为权力的展示而非学术的展示",
      "指出 OpenAI 无视 Advisory Group on Mathematics and AI 的核心前提",
      "呼吁数学家终止与 OpenAI 的合作——这是首个来自有组织数学机构的明确抵制号召",
    ],
  },
  "openai-math-manuscript-collection-release": {
    title: "OpenAI 在公开 Lean 代码仓库中发布 700+ 份数学手稿",
    summary: "OpenAI 发布了 github.com/openai/math，一个收录 722 份数学手稿、涵盖 372 个结果族的 Lean 代码仓库（2026-10-06）。其自身的 history.md 随后记录了三次撤回（一份手稿中的符号错误使两篇依赖它的论文失效）、14 份修订手稿和 13 处引用更新，余下 719 份手稿；仓库报告 719 份中有 300 份（约 42%）的头条结果完成了 Lean 形式化。",
    significance: "首次有实验室把大批 AI 数学产出以可检查、可更正的公开形式呈现：撤回、补丁与形式化覆盖率都记录在仓库本身。它立即为该领域的核心方法论问题定下议程——手稿数量不等于已确立定理的数量，而一个通过 Lean 检查的工件并不等同于对自然语言论证的验证。",
    problem: "关于 AI 生成数学的主张此前没有共享的公开记录；研究者无法检查、计数、比较或质疑这些工作。",
    keyContributions: [
      "722 份手稿、372 个结果族，附带可检查的 Lean 材料一同发布",
      "公开的更正日志：3 次撤回、14 份打过补丁的手稿、13 处引用更新",
      "发布方报告的形式化覆盖率为 300/719 ≈ 42% 的头条结果",
    ],
  },
  "navier-stokes-lost-in-translation-lean-mismatch": {
    title: "Bastounis、Circelli 和 Hansen 论证对 AI 自动形式化的 Lean 检查可能偏离自然语言证明",
    summary: "一篇 math.AP 预印本（arXiv:2610.08144，2026-10-06）论证，消解数学自然语言的歧义在 Solvability Complexity Index 层级中是任意高的（SCI = ∞），因此语义忠实的 AI 自动形式化（autoformalization）比任何可计算问题都困难，并给出了误译的具体例子——其中包括一个案例：OpenAI 宣布的 Navier–Stokes 爆破证明的 Lean 形式化与该自然语言证明并不对应。",
    significance: "把该领域核心的信任问题置于形式化的基础之上：一个机器检查的 Lean 工件证明的是它所编码的形式陈述，而非人们阅读的非形式主张。这是对 2026 年 10 月各项发布所依赖的 “先形式化、再信任” 工作流迄今最尖锐的检验。",
    problem: "自动形式化正被当作验证原始数学论证的替代品。",
    keyContributions: [
      "基于 SCI 层级的论证：忠实的自动形式化在不可计算意义上是困难的",
      "AI 把自然语言陈述误译为 Lean 的具体实例",
      "记录了所宣称的 Navier–Stokes 证明与其 Lean 编码之间的不一致",
    ],
  },
  "alman-williams-subquadratic-3sum-apsp": {
    title: "3SUM 与 APSP 的首个多项式改进推翻两个长期假设",
    summary: "Josh Alman 和 Virginia Vassilevska Williams 的一篇预印本（arXiv:2610.06783，2026-10-05）给出了多项式有界整数实例上的确定性 O(n^1.9992) 3SUM 和 O(n^2.9995) APSP 算法——这是对教科书算法的首个多项式改进——从而推翻了 3SUM 和 APSP 假设，并经由已知归约推翻 Exact Triangle、zero-weight k-Clique 及相关猜想。公开报道把底层想法的部分内容与 Claude 生成的算法组件联系起来，人类研究者随后理解、改进并扩展了这些组件；本记录以 arXiv 预印本作为主要来源。",
    significance: "复杂性理论在这些假设上受阻数十年；一个新的薄矩阵乘算法一举解开了一大批条件性下界。",
    problem: "3SUM 与 APSP 在约 50 年间始终未能在教科书算法的基础上获得多项式改进。",
    keyContributions: [
      "确定性 O(n^1.9992) 3SUM 与 O(n^2.9995) APSP",
      "稀疏偏斜图上的新薄矩阵乘算法",
      "经由已知归约推翻 3SUM/APSP 及相关猜想",
    ],
  },
  "fields-medallists-misalignment-declaration": {
    title: "28 位 Fields Medal 得主发布宣言 “A Severe Misalignment of AI in Mathematics”",
    summary: "2026-09-11，28 位 Fields Medal 得主——其中包括 Terence Tao、Artur Avila、Peter Scholze、Maryna Viazovska 和 June Huh——发布了一份公开宣言（mathandai.org，存档于 Zenodo DOI 10.5281/zenodo.22737750，提供九种语言版本），主张 AI 公司把解决数学问题当作基准测试的做法对数学这门科学和数学共同体是有害的。签署者表示，解决问题是实现概念理解这一首要目标的工具与代理指标，并警告仓促给出的 AI 解答没有时间做恰当的成文阐述、方法隔离或引用，从而引发署名与剽窃问题。",
    significance: "迄今在职数学家在 AI4Math 上最突出的集体立场：它把争论从个人博客文章移到一份署名、带 DOI 存档的文件上，并把冲突定性为实验室激励与数学价值观之间的严重错位问题。它为 2026 年 10 月随后出现的共同体回应——AHM 声明与 Simons Foundation 的资助计划——定了议程，并与 Tao 建设性的 Math 2.0 反提案相呼应。",
    problem: "AI 实验室把解决公开问题当作基准测试，而数学共同体把问题视为通向理解的载体；这两个目标已经背离。",
    keyContributions: [
      "把 AI 公司以基准测试驱动的问题求解定性为与数学价值观的严重错位，而非数学的进步",
      "解决问题是概念理解的工具与代理指标；真/假陈述的大规模生产可能毁掉学术的沃土",
      "警示仓促的宣布：没有时间做成文阐述、方法隔离或引用——署名与剽窃隐忧",
      "把学生与思想称为这一职业最珍贵的资源，它们依赖人类的传承链条",
    ],
  },
  "claude-fermats-last-theorem-lean-formalization": {
    title: "Claude 产出 Fermat 最后定理的首个端到端计算机检查的 Lean 证明",
    summary: "Anthropic 报告称，Claude 在 Prove2Me 协作平台上基本自主地工作 11 天，写出了 Fermat 最后定理的端到端 Lean 证明：1300 万行 Lean，最终证明用到 29,500 个中间定理，仅依赖 Lean 的三条标准公理，并由一个比对器确认该陈述与 Mathlib 的 FLT 相符。该证明遵循 Darmon–Diamond–Taylor 中简化的 Wiles 论证。",
    significance: "这是一个形式化里程碑，而不是 FLT 的新证明：该定理已于 1995 年获证。新的是这一工作流——数十个协作智能体、一个子定理 DAG，以及一个足够大的机器检查工件，使现代文献的自动形式化显得可行。",
    problem: "FLT 的形式化原本预计需要数年；仅共同体的蓝图就有 86 页。",
    keyContributions: [
      "首个端到端机器检查的 FLT Lean 证明",
      "在 Prove2Me 上带定理 DAG 的多智能体工作流",
      "经比对器验证与 Mathlib 的 FLT 陈述相符",
    ],
  },
  "claude-riemann-zeta-zero-lower-bound-67-percent": {
    title: "Claude 把 Riemann zeta 零点下界从 41.6% 提高到 67.2%",
    summary: "Claude 的一个未发布研究版本在 Claude Code 中经两个会话（3100 万输出 token、约 60 个子智能体、2,400 条 shell 命令）工作，把满足 Riemann 假设的 Riemann zeta 零点所占比例的已知下界从 41.6% 提高到 67.2%，其基础是 Aryan、Baluyot–Goldston–Suriajaya–Turnage-Butterbaugh 与 Bombieri 的工作。Anthropic 的数学家审阅了该论文，外部专家 Conrey 与 Goldston 也看过，并且一项 Lean 形式化通过了标准比对工具。",
    significance: "这是一个真实数论界上的、已发表并经检查的具体进展——也是对 AI 辅助研究的一次压力测试：该结果是尝试 Riemann 假设本身时的意外副产品，而它并没有解决该假设。",
    problem: "提高可证明满足 RH 的零点比例，需要在 Montgomery 式技巧上经历数十年的渐进积累。",
    keyContributions: [
      "新的 67.2% 下界，从长期停滞的 41.6% 提高",
      "通过 leanprover 比对器的 Lean 形式化",
      "明确不是 Riemann 假设的证明",
    ],
  },
};
