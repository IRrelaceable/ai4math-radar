# 方向轴复核报告（2026-11-09）

本次复核覆盖 **552** 条科研事件：判定完成 **552** 条，失败 **0** 条。

## 判定口径

每条事件按三步判断：

1. **研究对象**：这篇工作在研究什么？
2. **核心目标**：最终想解决什么问题？
3. **实际贡献**：实际交付了什么？作者目标与实际贡献不一致时，以实际贡献为准。

| 核心目标 | 方向 |
| --- | --- |
| 提升 AI 的数学推理能力 | AI4Math |
| 自动发现数学规律或猜想 | AI4Math |
| 自动证明数学定理 | AI4Math |
| 改进 AI 模型的训练方法 | Math4AI |
| 解释 AI 模型的数学性质 | Math4AI |
| 用数学理论改进 AI 算法 | Math4AI |
| 同时实现上述两类核心目标 | Both |
| 均不符合 | 不纳入方向轴 |

混合目标时以**头条交付物**为准：数学专项产物（证明、证明器、形式化语料、数学专项模型/数据集/基准）判 AI4Math；可复用的 AI 方法、理论或算法判 Math4AI。

## 总体变化

- 维持原判定：**399** 条（72%）
- 判定变化：**153** 条（28%）
- 判为不纳入方向轴（none）：**66** 条
- 低置信度（< 0.7）：**11** 条

| 旧 → 新 | 数量 |
| --- | ---: |
| ai4math → ai4math | 323 |
| math4ai → ai4math | 79 |
| math4ai → math4ai | 75 |
| math4ai → none | 56 |
| ai4math → none | 10 |
| both → ai4math | 5 |
| ai4math → math4ai | 3 |
| both → both | 1 |

## 判定变化明细

### math4ai → ai4math（79）

| slug | 标题 | 置信度 | 理由 |
| --- | --- | ---: | --- |
| `a-neural-network-solves-explains-and-generates-university-math-problems-by-program-synthesis-and-few-shot-learning-at-human-level` | A Neural Network Solves, Explains, and Generates University Math Problems by Pr… | 0.95 | 标题明确说“solves, explains, and generates university math problems”，摘要交付的是数学解题系统与课程数学题目集，程序合成是手段，最终产物是数… |
| `a-survey-of-deep-learning-for-mathematical-reasoning` | A Survey of Deep Learning for Mathematical Reasoning | 0.85 | 摘要明确指出其内容覆盖“building AI systems that solve mathematical problems and prove theorems”，核心目标属于提升AI数学推理… |
| `algorag-retrieval-augmented-generation-for-theoretical-computer-science-education-a-comprehensive-evaluation-framework-for-algorithm-analysis-and-complexity-theory` | AlgoRAG: Retrieval-Augmented Generation for Theoretical Computer Science Educat… | 0.72 | 对象是算法分析、递推、NP 完全性等数学化题目及其证明模板，交付物是面向数学问题求解与形式证明的 RAG 系统与评测基准，按边界规则属于面向数学的系统/数据集而非通用 AI 方法，故归 ai4mat… |
| `an-edge-enhanced-hierarchical-graph-to-tree-network-for-math-word-problem-solving` | An Edge-Enhanced Hierarchical Graph-to-Tree Network for Math Word Problem Solvi… | 0.90 | 工作对象是数学应用题求解系统，核心目标与交付物都是“自动解数学题”这一数学侧产物；按边界示例“Solving olympiad geometry without human demonstratio… |
| `asdiv-diverse-math-word-problem-corpus` | A Diverse Corpus for Evaluating and Developing English Math Word Problem Solver… | 0.95 | 边界示例中明确将 ASDiv 归为 ai4math；其核心交付物是面向数学应用题求解器评测的数学数据集，属于数学专用成果，而非面向 AI 模型的通用方法。 |
| `asmob-algebraic-symbolic-mathematical-operations-benchmark` | ASyMOB: Algebraic Symbolic Mathematical Operations Benchmark | 0.95 | 按边界规则，仅衡量模型性能的数学基准属于数学工具链、归ai4math；文本明确说明其为35,368道验证问题的符号数学基准，用于评估模型推理而非改进AI训练方法，故不是both。 |
| `benchmarking-arabic-dialects-for-math-problems` | Benchmarking Arabic Dialects for Math Problems | 0.90 | 边界规则明确'一个仅衡量模型性能的数学基准'归ai4math；文中核心交付物是数学数据集/基准DAR-MGSM，评测与可解释性均为服务于基准的附属分析。 |
| `beyond-compression-diagnosing-how-post-training-changes-mathematical-reasoning` | Beyond Compression: Diagnosing How Post-Training Changes Mathematical Reasoning | 0.85 | 工作对象是评估数学专用模型推理能力的诊断评测工具与发现，属于面向数学推理的评测/基准类成果；按边界例（FrontierMath、MathVista 等数学推理评测基准归 ai4math），故归 ai… |
| `beyond-equation-search-conjecture-guided-discovery-with-scope-and-closurebench` | Beyond Equation Search: Conjecture-Guided Discovery with SCOPE and ClosureBench | 0.75 | 研究对象是未知代数关系与科学猜想的自动发现（数学对象），核心目标属于'自动发现数学模式或猜想'；但任务设定在PDE系统与OpenFOAM科学场景而非纯数学，故置信度中等。 |
| `beyond-generation-and-accuracy-diagnosing-and-enhancing-visual-chain-of-thought-for-geometry-problem-solving` | Beyond Generation and Accuracy: Diagnosing and Enhancing Visual Chain-of-Though… | 0.90 | 研究对象是几何问题求解系统与数学基准/模型，摘要明确其目标为“diagnosing and enhancing visual chain-of-thought for geometry proble… |
| `beyond-selected-breakthroughs-evaluating-language-models-on-randomly-sampled-mathematical-conjectures` | Beyond Selected Breakthroughs: Evaluating Language Models on Randomly Sampled M… | 0.90 | 研究对象是数学猜想数据集与数学推理评测基准，核心是测量语言模型解决开放数学问题的能力；按边界规则'仅测量模型性能的基准'归入ai4math，与FrontierMath、MathVista同类。 |
| `can-llms-reliably-grade-olympiad-proofs-a-study-of-mathematical-verification-with-llms` | Can LLMs Reliably Grade Olympiad Proofs? A Study of Mathematical Verification w… | 0.90 | 核心对象是数学证明的验证与评分，交付的是数学专用工件（证明评分系统、对抗性数学数据集与基准）；文中明确"verifying natural-language Olympiad proofs with… |
| `claimscope-label-blind-witness-verification-for-mathematical-claim-auditing` | ClaimScope: Label-Blind Witness Verification for Mathematical Claim Auditing | 0.85 | 工作交付的是面向数学声明审计的基准与见证检查工具（数学工具链/数学数据集），核心是衡量与推进AI的数学推理与证明审计能力，属ai4math；其中的分析结论服务于对该基准测量结果的解读，不构成独立的A… |
| `correct-diagnosis-better-feedback-a-symbolic-verifier-for-faithful-llm-tutoring-feedback-in-logic-proofs` | Correct Diagnosis, Better Feedback: A Symbolic-Verifier for Faithful LLM Tutori… | 0.80 | 研究对象是逻辑证明辅导这一数学专用系统及其符号验证器工具链，交付物为数学辅导/证明场景的诊断架构与评测，按边界规则属于数学工具链即ai4math；无面向AI的数学方法或理论贡献。 |
| `counterexample-generation-via-per-theorem-symbolic-verifiers-when-imitation-hurts-and-reinforcement-repairs` | Counterexample Generation via Per-Theorem Symbolic Verifiers: When Imitation Hu… | 0.90 | 核心交付物是数学专用的假猜想/反例数据集与数学问题求解模型，边界规则明确"math dataset或benchmark→ai4math"；SFT/RLVR分析是服务于数学反例生成这一数学任务，而非通… |
| `deepseekmath-grpo-open-math-reasoning` | DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Mod… | 0.90 | 标题与摘要均以“Pushing the Limits of Mathematical Reasoning in Open Language Models”为目标，交付的是数学专用模型这一数学制品，G… |
| `diagnosing-sampled-llm-reasoning-in-formal-geometry-coverage-realization-and-validity-evidence` | Diagnosing Sampled LLM Reasoning in Formal Geometry: Coverage, Realization, and… | 0.85 | 研究对象是评估LLM数学（形式几何）推理的协议与基准数据集，属于数学专用评测工具链；按MathVista、FrontierMath等先例，仅测量模型数学推理表现的基准归为ai4math，且该工作并未… |
| `diagram-formalization-enhanced-multi-modal-geometry-problem-solver` | Diagram Formalization Enhanced Multi-Modal Geometry Problem Solver | 0.90 | 工作对象是数学问题求解系统与数学数据集，目标是“提升AI对几何图形的解题能力”，按边界规则属于数学专用产物（几何求解器、数学数据集）→ ai4math。 |
| `do-multi-agents-solve-better-than-single-evaluating-agentic-frameworks-for-diagram-grounded-geometry-problem-solving-and-reasoning` | Do Multi-Agents Solve Better Than Single? Evaluating Agentic Frameworks for Dia… | 0.85 | 研究对象是数学问题求解系统（几何解题智能体框架），核心目标是改进AI的数学推理（图形几何解题），边界规则中求解奥数几何类工作归ai4math；其贡献是对该求解系统的实证评测而非通用AI方法，故不属m… |
| `don-t-trust-verify-grounding-llm-quantitative-reasoning-with-autoformalization` | Don't Trust: Verify -- Grounding LLM Quantitative Reasoning with Autoformalizat… | 0.90 | 研究对象是数学题解的验证与形式化方法（数学专用工具），核心目标是提升LLM数学推理的可靠性，摘要明确该方法“consistently beats vanilla majority voting”作为… |
| `edisco-equivariant-discrete-diffusion-for-euclidean-combinatorial-optimization` | EDISCO: Equivariant DIScrete Diffusion for Euclidean Combinatorial Optimization | 0.80 | 核心交付物是求解数学组合优化问题的系统；边界规则中“求解奥赛几何”等数学问题求解系统归入ai4math。 |
| `end-to-end-bangla-ai-for-solving-math-olympiad-problem-benchmark-leveraging-large-language-model-using-integrated-approach` | End-to-End Bangla AI for Solving Math Olympiad Problem Benchmark: Leveraging La… | 0.85 | 工作以数学奥林匹克题目与数学基准为中心对象，核心目标明确是“improve AI's mathematical reasoning”，且交付物是数学专用数据集/评测与解题性能提升，按决策表归入 ai… |
| `euston-training-away-mathematical-sycophancy-without-losing-the-mathematics` | Euston: Training Away Mathematical Sycophancy Without Losing the Mathematics | 0.85 | 研究对象与交付物都是面向数学的专用模型（math model），核心目标是改进 AI 对数学命题的判定与推理，按边界规则'数学专用模型/工具链 → ai4math'（类比 Llemma）。 |
| `exhaustive-canonical-skeletons-generation-a-formal-dataset-for-decomposable-symbolic-regression` | Exhaustive Canonical Skeletons Generation: A Formal Dataset for Decomposable Sy… | 0.85 | 核心交付物是面向符号回归（自动发现数学表达式/模式）的数学数据集与基准，按边界规则属于数学专用制品（math dataset or benchmark）归入 ai4math；虽服务于神经符号回归的训… |
| `from-symbolic-perception-to-logical-deduction-a-framework-for-guiding-language-models-in-geometric-reasoning` | From Symbolic Perception to Logical Deduction: A Framework for Guiding Language… | 0.92 | 工作以数学问题求解系统和数学基准为交付物，明确旨在“guiding language models in geometric reasoning”并匹配SOTA几何推理能力，属于“improve A… |
| `frontiermath-benchmark-advanced-mathematical-reasoning` | FrontierMath: A Benchmark for Evaluating Advanced Mathematical Reasoning in AI | 0.95 | 这是面向高等数学推理的数学基准数据集，属数学工具链；按边界示例“FrontierMath: A Benchmark for Evaluating Advanced Mathematical Reas… |
| `func-r1-incentivizing-mathematical-function-reasoning-in-multimodal-large-language-models` | Func-R1: Incentivizing Mathematical Function Reasoning in Multimodal Large Lang… | 0.90 | 工作对象是数学函数推理任务与数学专用多模态模型，交付物是提升AI数学推理的框架与训练策略，符合“improve AI's mathematical reasoning”归入ai4math的规则。 |
| `generate-and-rank-a-multi-task-framework-for-math-word-problems` | Generate & Rank: A Multi-task Framework for Math Word Problems | 0.85 | 研究对象是数学应用题求解系统，核心目标是改进 AI 的数学推理与自动解题能力，交付物是面向数学问题的求解方法并以数学基准成绩为主要证据，按 Minerva/ASDiv 等边界示例归为 ai4math。 |
| `georeform-reflective-formalization-evolution-for-multimodal-geometry-problem-solving` | GeoReform: Reflective Formalization Evolution for Multimodal Geometry Problem S… | 0.85 | 研究对象是几何问题求解系统及其形式化表示，核心交付是提升几何问题求解准确率的专用方法（如“Solving olympiad geometry”同类判定为ai4math），虽含可复用策略优化思想但评估… |
| `geox-formalized-vision-language-geometry` | GeoX: Geometric Problem Solving Through Unified Formalized Vision-Language Pre-… | 0.90 | 工作研究对象是几何问题求解系统，明确“emit verifiable solutions”并在四个 GPS 基准上交付数学专用模型与可验证解答，按边界规则属 ai4math。 |
| `gsm8k-training-verifiers-math-word-problems` | Training Verifiers to Solve Math Word Problems | 0.90 | 摘要明确其交付物为数学应用题数据集与改进数学解题能力的方法，属数学专用产物（math dataset/benchmark），边界规则中ASDiv、MathVista同类工作均归ai4math，虽含验… |
| `improving-math-word-problems-with-pre-trained-knowledge-and-hierarchical-reasoning` | Improving Math Word Problems with Pre-trained Knowledge and Hierarchical Reason… | 0.90 | 研究对象是数学应用题求解系统，交付物为提升AI数学推理的模型与基准上的精度改进，属于典型的ai4math方向。 |
| `improving-mathematical-reasoning-capabilities-in-large-language-models-via-reasoning-process-error-classification` | Improving Mathematical Reasoning Capabilities in Large Language Models via Reas… | 0.75 | 核心目标是“improve AI's mathematical reasoning”，且最终交付物（数学错误分类法+提升数学推理的提示法）是面向数学推理的专门成果而非通用AI训练方法；因交付物混合了… |
| `leanplan-optimal-planning-with-llm-generated-heuristics-and-admissibility-proofs` | LeanPlan: Optimal Planning with LLM-Generated Heuristics and Admissibility Proo… | 0.75 | 标题和摘要明确其核心交付物是“LLM生成的启发式函数及其被机器校验的可采纳性证明”——即LLM在Lean 4中自动证明定理，属于自动定理证明/ai4math；但应用对象是自动规划而非纯数学，故置信度… |
| `leanprm-lean-grounded-process-supervision-for-natural-language-proof-verification` | LeanPRM: Lean-Grounded Process Supervision for Natural Language Proof Verificat… | 0.85 | 工作对象是数学证明验证，交付物是数学专用数据集、基准和验证器模型，属于数学工具链；摘要明确其用于"natural language proof verification"并在IMO级问题上筛选更优证… |
| `llemma-open-language-model-for-mathematics` | Llemma: An Open Language Model For Mathematics | 0.95 | 交付物是数学专用的语言模型与配套语料（math model），其目标是提升 AI 数学推理能力，符合边界示例 'Llemma: An Open Language Model For Mathemat… |
| `mamath-bench-process-aware-and-robust-evaluation-of-multimodal-multi-agent-mathematical-reasoning` | MAMath-Bench: Process-Aware and Robust Evaluation of Multimodal Multi-Agent Mat… | 0.90 | 工作对象是数学评测基准，核心交付是衡量AI数学推理能力的数据集与评测结论；按边界规则，评测数学推理的基准属于数学工具链侧（类似MathVista、FrontierMath），且仅衡量模型性能，非同时… |
| `masked-attention-pooling-is-invariant-to-padding-and-permutation-a-formal-proof-in-lean` | Masked Attention Pooling Is Invariant to Padding and Permutation: A Formal Proo… | 0.85 | 标题与摘要明确其交付物是“在 Lean 4 中的形式化证明”及面向形式证明器的证书流水线，按边界规则“面向形式证明器的工具与形式化定理语料属于数学工具链/数学专门产物”应归 ai4math；尽管证明… |
| `math-dataset-measuring-mathematical-problem-solving` | Measuring Mathematical Problem Solving With the MATH Dataset | 0.95 | 研究对象与交付物都是面向AI数学推理的数学数据集/评测基准，按边界规则（如FrontierMath、MathVista、ASDiv）属于数学工具链，判定为ai4math。 |
| `math2visual-x-a-modular-framework-for-pedagogically-aligned-lower-primary-math-visuals-generation` | Math2Visual-X: A Modular Framework for Pedagogically Aligned Lower-Primary Math… | 0.70 | 研究对象是数学应用题及其可视化表示这一数学专属产物，交付的是数学教学工具链中的专用生成框架而非通用AI方法，按边界规则数学专属产物归入ai4math；但其核心目标并非直接提升AI数学推理或证明能力，… |
| `mathcoder-code-integration-for-mathematical-reasoning` | MathCoder: Seamless Code Integration in LLMs for Enhanced Mathematical Reasoning | 0.90 | 核心目标与交付物均为提升AI数学推理的专用数学模型与数学数据集，摘要明确为“solving math problems by embedding executable code inside the… |
| `mathematical-reasoning-in-latent-space` | Mathematical Reasoning in Latent Space | 0.90 | 核心目标是改进AI的数学演绎推理能力，交付的是面向数学推理的模型与实验验证，属ai4math |
| `mathematical-reasoning-via-self-supervised-skip-tree-training` | Mathematical Reasoning via Self-supervised Skip-tree Training | 0.75 | 核心目标与交付物均是面向形式数学的数学专用模型与数学推理基准（‘a math-specialized artifact … math model, math dataset or benchmark… |
| `mathematical-word-problem-generation-from-commonsense-knowledge-graph-and-equations` | Mathematical Word Problem Generation from Commonsense Knowledge Graph and Equat… | 0.65 | 核心交付物是数学应用题（含方程运算的数学内容）生成模型与公开的数学应用题数据集，属数学专属工件（math dataset），与ASDiv类语料同归ai4math；但其目的是教育测评题目生成而非提升A… |
| `mathematics-dataset-neural-reasoning` | A procedurally generated dataset exposes limits of neural mathematical reasoning | 0.90 | 边界规则明确把数学数据集/基准类工作归为 ai4math（如 ASDiv、MathVista、FrontierMath），本工作交付的是面向数学推理评测的数据集与基准，其‘暴露模型局限’属于评测结果… |
| `mathvis-can-ai-reason-through-drawing-a-benchmark-for-mathematical-figure-generation` | MathVis: Can AI Reason through Drawing? A Benchmark for Mathematical Figure Gen… | 0.90 | 文本明确指出研究对象是数学图形生成与数学可视化推理基准，属于数学专用数据集/评测工具，按边界规则此类仅衡量模型能力的数学基准归入ai4math；无对AI训练方法或数学解释AI模型的贡献。 |
| `mathvista-visual-mathematical-reasoning-benchmark` | MathVista: Evaluating Mathematical Reasoning of Foundation Models in Visual Con… | 0.95 | 边界规则明确将MathVista列为ai4math范例；其核心交付物是面向数学推理评测的数学基准/数据集，属于数学专门化产物，且仅衡量模型性能而非共同交付数学内容，故不归为both。 |
| `minerva-quantitative-reasoning-with-language-models` | Solving Quantitative Reasoning Problems with Language Models | 0.95 | 边界示例明确将 Minerva 判为 ai4math；其核心交付是数学专用模型与数学问题求解能力的提升，属于"提升 AI 数学推理"。 |
| `modeling-intra-relation-in-math-word-problems-with-different-functional-multi-head-attentions` | Modeling Intra-Relation in Math Word Problems with Different Functional Multi-H… | 0.90 | 工作对象是数学应用题求解系统，交付的是数学问题求解方法与基准提升，属于自动求解数学问题，归入ai4math。 |
| `naturalproofs-mathematical-theorem-proving-in-natural-language` | NaturalProofs: Mathematical Theorem Proving in Natural Language | 0.90 | 研究对象是数学定理证明语料库与基准，按边界规则‘数学数据集或基准’属数学专用产物；其基准未包含形式化验证内容，故不构成both。 |
| `neural-math-word-problem-solver-with-reinforcement-learning` | Neural Math Word Problem Solver with Reinforcement Learning | 0.85 | 研究对象与交付物均为数学应用题求解系统这一数学专用工具；RL训练只是手段，按边界规则归入ai4math。 |
| `neural-symbolic-solver-for-math-word-problems-with-auxiliary-tasks` | Neural-Symbolic Solver for Math Word Problems with Auxiliary Tasks | 0.90 | 工作对象是数学应用题求解系统和数学基准数据集，边界规则明确指出数学专门产物（数学模型、数学数据集）归 ai4math，类似于 Minerva 与 ASDiv；其目标是提升 AI 的数学推理而非改进通… |
| `numinamath-aimo-progress-prize-1` | NuminaMath wins the first AIMO Progress Prize | 0.95 | 标题与摘要明确交付数学专用制品："Open olympiad-level problem/solution corpus" 与数学模型 NuminaMath-7B，其目标是提升 AI 的奥数推理并赢… |
| `omni-math-olympiad-benchmark-llm` | Omni-MATH: A Universal Olympiad Level Mathematic Benchmark For Large Language M… | 0.95 | 研究对象是数学题目数据集与基准，核心交付是衡量和挑战 AI 数学推理能力的数学基准工具，按边界规则（如 FrontierMath、MathVista 同类判定）属于 ai4math。 |
| `pal-program-aided-language-models` | PAL: Program-aided Language Models | 0.75 | 核心交付物是一个面向数学推理的问题求解系统（LLM 分解 + 程序运行时执行），而非通用 AI 训练或理论方法；其定位是“针对数学推理的工具集成方法”，类似 Minerva/工具型解题系统归入 ai… |
| `permuformer-multi-task-pretraining-for-permutation-representation-in-algebraic-combinatorics` | PermuFormer: Multi-Task Pretraining for Permutation Representation in Algebraic… | 0.90 | 按边界规则，数学专用模型（如 Llemma）归入 ai4math；其核心交付是面向组合学数学对象的专用模型与表示，供下游数学任务使用，机制分析仅为次要贡献，故不构成 both。 |
| `practice-makes-a-solver-perfect-data-augmentation-for-math-word-problem-solvers` | Practice Makes a Solver Perfect: Data Augmentation for Math Word Problem Solvers | 0.78 | 核心交付物是面向数学应用题的增强数据集与更强的MWP求解器，属数学专用产物；数据增强在此服务于数学问题求解这一目标，而非通用AI训练方法，故按标题交付归入ai4math。 |
| `pretrained-lms-symbolic-mathematics-solvers` | Pretrained Language Models are Symbolic Mathematics Solvers too! | 0.85 | 标题与交付物明确是“语言模型作为符号数学求解器”这一数学问题求解系统，样本效率与迁移是达成数学求解性能的手段，按边界规则数学专用求解器归入ai4math。 |
| `proiqa-a-process-based-framework-for-fine-grained-math-item-quality-assessment` | ProIQA: A Process-Based Framework for Fine-Grained Math Item Quality Assessment | 0.70 | 标题明确为“math item quality assessment”，且交付物是数学专用数据集与数学题目质量评估工具，属于数学工具链/数学数据资产；边界规则指出数学专用产物（如math datas… |
| `qwen25-math-self-improvement-math-expert-model` | Qwen2.5-Math Technical Report: Toward Mathematical Expert Model via Self-Improv… | 0.90 | 核心交付物是面向数学问题求解的专用模型与奖励模型（如 Llemma、Minerva 类），属于数学专用制品，且摘要明确其目标为“数学专家模型”并以数学推理基准为衡量标准。 |
| `risr-residual-informed-scientific-equation-discovery-with-large-language-models` | RISR: Residual-Informed Scientific Equation Discovery with Large Language Models | 0.85 | 工作对象是符号回归式方程发现方法，核心目标是自动发现数学/科学公式模式，属“automatically discover mathematical patterns”一类，且交付物是方程发现系统而非… |
| `scaling-mathematical-proof-supervision-from-structured-textbooks` | Scaling Mathematical Proof Supervision from Structured Textbooks | 0.92 | 核心交付物是数学专用训练语料这一数学工件，按边界规则'math dataset or benchmark -> ai4math'，其微调实验是为该语料价值服务的验证。 |
| `sciaagent-tool-augmented-scientific-reasoning` | SciAgent: Tool-augmented Language Models for Scientific Reasoning | 0.80 | 核心交付物是数学函数工具语料库与评测基准等数学专用制品，目标是提升AI的数学/科学推理，按边界规则归入ai4math；因涵盖五个科学领域略偏泛，故置信度0.8。 |
| `semantically-aligned-equation-generation-for-solving-and-reasoning-math-word-problems` | Semantically-Aligned Equation Generation for Solving and Reasoning Math Word Pr… | 0.95 | 研究对象是数学应用题求解系统，核心交付是提升AI数学推理，明确属于ai4math |
| `sequence-to-general-tree-knowledge-guided-geometry-word-problem-solving` | Sequence to General Tree: Knowledge-Guided Geometry Word Problem Solving | 0.90 | 工作对象是数学问题求解系统，核心交付是改进AI对几何应用题的数学推理，属于ai4math方向 |
| `solving-every-step-is-not-enough-milestone-oracles-reveal-a-composition-gap-in-llm-math-reasoning` | Solving Every Step Is Not Enough: Milestone Oracles Reveal a Composition Gap in… | 0.88 | 工作对象是面向 LLM 数学推理的诊断评测基准（数学专用工具/数据集），交付物是数学推理评测与失败定位方法，按边界规则"仅衡量模型性能的基准"归入 ai4math，而非改进训练或解释模型数学性质的方… |
| `solving-math-word-problems-by-combining-language-models-with-symbolic-solvers` | Solving Math Word Problems by Combining Language Models With Symbolic Solvers | 0.92 | 研究对象是数学问题求解系统与数学数据集，摘要明确其目标是“Solving Math Word Problems”且交付物为数学专用系统与数据集，按边界规则归入ai4math。 |
| `srharness-a-harness-for-agentic-symbolic-regression` | SRHarness: A Harness for Agentic Symbolic Regression | 0.90 | 符号回归属于'自动发现数学模式'，且交付物是数学专用的问题求解/发现系统（harness），按边界规则归入 ai4math；文中明确给出 LLM-SRBench 上符号恢复与泛化的提升证据。 |
| `studybench-can-self-evolution-squeeze-textbooks-for-olympiad-capability` | StudyBench: Can Self-Evolution Squeeze Textbooks for Olympiad Capability? | 0.75 | 核心交付物是衡量模型数学/科学解题能力的基准，按边界规则“仅测量模型性能的基准”归 ai4math（同 FrontierMath、MathVista）；摘要称其为物理基准而研究领域为几何，对象表述不… |
| `svamp-robustness-challenge-math-word-problems` | SVAMP: Are NLP Models really able to Solve Simple Math Word Problems? | 0.90 | 边界示例ASDiv（数学应用题数据集）判为ai4math；SVAMP的核心交付物是数学应用题评测数据集，属于数学工具链，虽然它同时诊断了模型启发式，但并非可复用的AI方法或理论，故归ai4math。 |
| `the-missing-primitive-diagnosing-and-repairing-mathematical-reasoning-in-large-language-models` | The Missing Primitive: Diagnosing and Repairing Mathematical Reasoning in Large… | 0.90 | 工作对象是数学推理评测基准与数学特化模型，核心目标与交付物均为改进 AI 的数学推理能力，属于 ai4math 边界内的数学专用工件与推理改进方法 |
| `theoremqa-theorem-driven-question-answering` | TheoremQA: A Theorem-driven Question Answering dataset | 0.95 | 按边界规则，只衡量模型性能的数学/科学QA基准归入ai4math；文中明确其对象为定理驱动的数学/科学评测数据集，贡献为基准与评测结果，如"first theorem-driven QA datas… |
| `tora-tool-integrated-reasoning-agents` | ToRA: A Tool-Integrated Reasoning Agent for Mathematical Problem Solving | 0.95 | 工作研究对象是数学问题求解系统，实际交付的是面向数学推理的开源模型并刷新MATH开源最好成绩，属于数学专用成果（数学模型/求解智能体），按边界规则归入ai4math。 |
| `trigeobench-a-multimodal-mathematical-geometry-benchmark-with-figures-and-tikz` | TriGeoBench: A Multimodal Mathematical Geometry Benchmark with Figures and TikZ | 0.90 | 研究对象是数学几何评测基准与数据集，摘要明确其为"a geometry-centric multimodal benchmark"并用于评测模型几何推理能力，按边界规则此类仅衡量模型性能的数学基准归… |
| `unigeo-unifying-geometry-logical-reasoning-via-reformulating-mathematical-expression` | UniGeo: Unifying Geometry Logical Reasoning via Reformulating Mathematical Expr… | 0.92 | 工作核心是几何数学问题求解的数据集与专用模型，属于数学专用产物（math dataset/benchmark 与 math model），摘要明确指出Geoformer在UniGeo上解决几何计算与… |
| `verification-and-refinement-of-natural-language-explanations-through-llm-symbolic-theorem-proving` | Verification and Refinement of Natural Language Explanations through LLM-Symbol… | 0.75 | 工作核心是把 LLM 生成的推理解释锚定到定理证明器的形式化验证上，交付的是面向形式证明工具链的验证/自动形式化/精炼方法，与 Autoformalization、LeanDojo 一类归入 ai4… |
| `voice-of-reason-reinforcement-learning-for-spoken-math` | Voice of Reason: Reinforcement Learning for Spoken Math | 0.88 | 核心交付物是面向数学解题的语音数学模型及其成绩提升（“close the gap between text and speech on mathematical problem solving”“n… |
| `when-tools-lie-reliability-of-mathematical-agents-under-corrupted-tool-feedback` | When Tools Lie: Reliability of Mathematical Agents Under Corrupted Tool Feedback | 0.85 | 研究对象是数学问题求解智能体及其在被污染工具反馈下的鲁棒性，交付物是面向数学智能体的评测/腐败框架，属于数学问题求解系统的评测工具链，按边界规则归入ai4math |
| `zgcm-1-a-fully-open-and-extremely-efficient-foundation-model-for-math-and-agentic-search` | ZGCM-1: A Fully Open and Extremely Efficient Foundation Model for Math and Agen… | 0.85 | 标题交付物是数学专用模型(Llemma类边界情形归ai4math);训练效率与优化器改进是达成该模型的手段而非独立可复用的AI方法理论,故不判为both或math4ai。 |

### math4ai → none（56）

| slug | 标题 | 置信度 | 理由 |
| --- | --- | ---: | --- |
| `a-lean-and-spec-driven-ai-assisted-software-development-lifecycle-for-applied-ai-education-the-ai-sdlc-approach` | A Lean and Spec-Driven AI-Assisted Software Development Lifecycle for Applied A… | 0.90 | 研究对象是软件工程生命周期与教学实践，摘要与重要性均围绕‘govern agentic software engineering’和大学课程部署，既无数学对象也无面向 AI 的数学方法，按边界规则归… |
| `action-verification-through-conjecture-and-refutation-for-language-model-agents` | Action Verification through Conjecture and Refutation for Language Model Agents | 0.90 | 尽管研究领域标签指向数学发现，摘要与贡献均只涉及通用语言模型智能体的动作验证与基准环境评测，既无数学研究对象，也无用于改进 AI 的数学方法，按边界规则归为 none。 |
| `agent-laboratory-llm-agents-research-assistants` | Agent Laboratory: Using LLM Agents as Research Assistants | 0.90 | 摘要与意义均表明其对象是通用科研工作流而非数学结果、形式化语料或面向AI的数学方法，符合‘The AI Scientist’式一般研究自动化的none裁定。 |
| `ai-co-scientist-multi-agent-hypothesis-generation` | Accelerating scientific discovery with Co-Scientist | 0.90 | 该工作属于通用AI科研自动化/科学发现，验证领域为生物医学（AML药物重定位、体外实验），既无数学研究对象也无用数学理论改进AI的方法，按边界规则归为none。 |
| `ai-scientist-automated-open-ended-discovery` | The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery | 0.95 | 边界示例明确将该工作归为none：其为通用AI科研自动化，既无数学研究对象（定理、猜想、形式化语料），也无用于改进AI的数学方法。 |
| `ai-scientist-v2-workshop-level-agentic-tree-search` | The AI Scientist-v2: Workshop-Level Automated Scientific Discovery via Agentic … | 0.95 | 工作对象是通用科学发现代理而非任何数学定理、证明或面向 AI 的数学方法，边界规则明确指出无数学对象也无面向 AI 数学方法的 AI-for-science 工作归为 none，虽在数学代理研究区展… |
| `aide-ai-driven-exploration-space-of-code` | AIDE: AI-Driven Exploration in the Space of Code | 0.95 | 文本明确对象是代码空间树搜索的ML工程智能体，基准均为ML工程评测（RE-Bench边界示例即判none），不研究数学对象，也不用数学理论改进AI算法。 |
| `auditable-algebraic-counting-field-for-cryptic-pocket-detection-from-apo-structures` | Auditable Algebraic Counting Field for Cryptic-Pocket Detection from Apo Struct… | 0.90 | 研究对象是蛋白质结构预测的生物信息学模型，既无数学结果或形式化语料，也无面向 AI 的数学方法，按边界规则属于 AI-for-science，归为 none。 |
| `benchmarking-vision-language-models-on-synapse-and-neuron-proofreading-in-connectomics` | Benchmarking Vision-Language Models on Synapse and Neuron Proofreading in Conne… | 0.95 | 研究对象是神经科学（connectomics）标注基准，既无数学对象也无面向AI的数学方法，按规则属于通用AI-for-science工作，归为none。 |
| `cadforge-agentic-single-view-cad-reconstruction-with-explicit-geometry-reasoning` | CADForge: Agentic Single-View CAD Reconstruction with Explicit Geometry Reasoni… | 0.80 | 其研究对象与交付物是 CAD 工程建模工具（CadQuery 程序生成），虽含'显式几何推理'与'数学代码'，但属于 AI-for-engineering 自动化，既无数学成果（定理/证明/猜想/数… |
| `cyc-researcher-automated-research-review` | CycleResearcher: Improving Automated Research via Automated Review | 0.85 | 对象是通用ML科研自动化与自动评审（数据集为真实ML论文与评审），不含数学定理、猜想、形式化语料等数学对象，也未提出面向AI的数学方法，按边界规则归为none。 |
| `depthevidence-unifying-metric-depth-prediction-and-geometric-reasoning-in-multimodal-language-models` | DepthEvidence: Unifying Metric Depth Prediction and Geometric Reasoning in Mult… | 0.65 | 该工作研究的是计算机视觉中的米制深度预测与视觉空间/物体测量推理，Depth-VQA 是空间推理基准而非数学内容或形式化数学基准；其目标是提升视觉-语言模型的空间理解，而非数学定理、证明、数学问题求… |
| `electronic-density-versus-geometry-for-machine-learned-molecular-absorption-spectra` | Electronic Density versus Geometry for Machine-Learned Molecular Absorption Spe… | 0.80 | 研究对象是分子光谱的机器学习代理模型与输入表示，核心是提升科学性质预测而非数学推理或证明，也不涉及用数学理论解释或改进AI，因此不归入ai4math或math4ai。 |
| `equivsva-a-formally-verified-dataset-of-behavioral-assertions-across-equivalent-rtl-implementations` | EquivSVA: A Formally Verified Dataset of Behavioral Assertions Across Equivalen… | 0.70 | 研究对象是RTL/SystemVerilog断言生成这一硬件验证任务，其验证对象是电路行为等价与断言可区分性，既无数学结果、猜想或数学形式语料，也不含面向AI的数学方法或理论，按边界规则属于无数学对… |
| `evigraph-proof-carrying-selective-recommendation-over-temporal-public-service-knowledge-graphs` | EviGraph: Proof-Carrying Selective Recommendation over Temporal Public-Service … | 0.85 | 研究对象是公共服务推荐系统与应用基准，不含数学结果、定理证明或面向 AI 的数学方法，属于一般应用 AI 工作，故为 none。 |
| `explaining-textual-entailment-with-lexical-entailments-using-llms-to-supply-lexical-relations-for-formal-proofs` | Explaining Textual Entailment with Lexical Entailments: Using LLMs to Supply Le… | 0.85 | 虽然文中出现定理证明器与形式证明，但对象是自然语言推理的蕴含判定而非数学定理或形式数学语料，既不改进AI数学推理（ai4math），也不以数学理论改进AI方法（math4ai），故归为none。 |
| `from-verification-failures-to-reusable-guidance-for-coding-agents` | From Verification Failures to Reusable Guidance for Coding Agents | 0.70 | 研究对象是程序正确性验证（K 语义下的 Python 程序证明与规约审计），交付物是面向编程智能体的验证工作流，既无数学定理/猜想/形式化数学语料这类数学对象，也未用数学理论改进或解释 AI 模型，… |
| `gala-geometry-aware-language-model-for-controllable-object-arrangement` | GALA: Geometry-Aware Language Model for Controllable Object Arrangement | 0.90 | 研究对象是3D物体摆放AI模型与场景数据集，核心目标是让文本驱动的3D场景创建更符合几何约束，不属于提升AI数学推理（ai4math），也不属于用数学理论改进或解释AI（math4ai），因此归为n… |
| `geometric-signatures-of-conceptual-reorganization-a-counterfactual-embedding-framework-for-detecting-scientific-revolutions` | Geometric Signatures of Conceptual Reorganization: A Counterfactual Embedding F… | 0.90 | 该工作属于通用科学研究自动化/科学计量分析，既不产出数学专用工件（证明、证明器、形式语料、数学模型），也没有用数学理论改进AI算法，因此归为none。 |
| `geopar-large-scale-multi-agent-combinatorial-optimization-with-geometry-guided-parallel-autoregressive-learning` | GeoPAR: Large-Scale Multi-Agent Combinatorial Optimization with Geometry-Guided… | 0.70 | 工作对象是组合优化（VRP、取送货）神经求解算法，几何仅作为建模启发式注入神经网络；其核心目标与交付物属于 AI for Operations Research，既不自动发现/证明数学命题，也非用数… |
| `gtformer-a-syntax-free-graph-network-alternative-to-transformers-for-8192-times-length-extrapolation-in-linear-time` | GTFormer: A Syntax-Free Graph Network Alternative to Transformers for 8192$\tim… | 0.85 | 交付物是通用AI架构，评估对象为代码、日志、检索基准，无视具体数学成果或用于改进AI的数学理论，属通用AI研究。 |
| `leangrpo-eliminating-redundant-recomputation-in-diffusion-rl` | LeanGRPO: Eliminating Redundant Recomputation in Diffusion RL | 0.85 | 尽管标注在定理证明领域下，工作实际交付的是扩散图像/视频生成模型RL训练的通用工程加速方法，既不研究数学结果或形式化语料，也不涉及用于AI的数学理论或数学推理能力，属于无数学对象的通用AI训练优化，… |
| `leanguard-lean-verified-guardrails-for-tool-using-agents` | LEANGUARD: Lean-Verified Guardrails for Tool-Using Agents | 0.72 | 核心交付物是 agent 安全/行为约束的形式化运行时工具，数学（Lean、时序逻辑）只是实现手段；评测对象是 Tau-Bench/DTap 上的 agent 安全与任务表现，既非数学成果或形式化证… |
| `leanstream-a-speculate-and-refine-streaming-framework-for-efficient-on-device-llm-inference` | LeanStream: A Speculate-and-Refine Streaming Framework for Efficient on-Device … | 0.90 | 尽管研究领域标注为定理证明，摘要与显著性均表明这是LLM推理的系统/部署优化工作（内存占用、权重卸载、GPU与I/O重叠），既不研究数学结果或证明，也不以数学理论改进AI训练或解释模型，故不属于ai… |
| `learning-what-to-investigate-next-meta-reasoning-for-long-horizon-research-agents` | Learning What to Investigate Next: Meta-Reasoning for Long-Horizon Research Age… | 0.68 | 核心交付物是通用科研自动化智能体方法（元推理策略、生成式 critic 信用分配、跨环境预训练），数学定理证明仅作为若干评测环境之一，属于无明确数学对象的通用 AI 研究自动化工作。 |
| `llm-feedback-research-papers-empirical-analysis` | Can large language models provide useful feedback on research papers? A large-s… | 0.90 | 研究对象是通用科研同行评审反馈系统，证据为“对3,096篇Nature系列期刊和ICLR论文的PDF生成评审意见”及用户研究，既不研究数学命题、证明或数学问题求解系统，也未提出用于AI的数学方法，按… |
| `mags-multi-agent-auto-formalization-guarantees-safety-for-agentic-outputs` | MAGS: Multi-agent Auto-formalization Guarantees Safety for Agentic Outputs | 0.72 | 决定性证据是摘要中“produces executable programs carrying machine-checked formal safety guarantees”“Evaluated… |
| `map-users-and-mapmakers-the-scope-of-cognitive-attribution-from-acquired-representations` | Map Users and Mapmakers: The Scope of Cognitive Attribution from Acquired Repre… | 0.75 | 该工作的核心交付是认知归属的概念/哲学框架，用于解释Othello-GPT等模型的认知功劳归属，属于AI表征解释与心智哲学问题，既未自动证明定理或发现数学猜想，也未用数学理论改进或解释AI模型，附录… |
| `mechbench-can-ai-scientific-agents-discover-mechanisms-beyond-phenomenal-laws` | MechBench: Can AI Scientific Agents Discover Mechanisms Beyond Phenomenal Laws? | 0.65 | 摘要通篇对象是科学机制与现象律（scientific agents、mechanistic model、phenomenal law），没有数学定理、证明、猜想或面向形式证明器的工具链，也不提供用于… |
| `mlr-bench-evaluating-ai-agents-open-ended-research` | MLR-Bench: Evaluating AI Agents on Open-Ended Machine Learning Research | 0.90 | 研究对象是机器学习研究任务与评审流程，无数学对象、也未提供用于改进AI的数学方法；边界规则明确『通用AI科研自动化且无数学对象或数学方法→none』。 |
| `multi-aspect-runtime-verification-for-simulation-based-v-and-v-of-llm-enabled-autonomous-agents` | Multi-Aspect Runtime Verification for Simulation-Based V&V of LLM-Enabled Auton… | 0.85 | 研究对象是AI智能体的策略合规运行时验证与安全护栏，既不研究数学结果或数学问题求解系统，也不以数学方法改进AI；其时序逻辑不可子sume性只是支撑性论断，故归为none。 |
| `multimodal-ai-detection-for-math-heavy-scientific-text` | Multimodal AI Detection for Math-Heavy Scientific Text | 0.85 | 该工作的核心目标是 AI 生成内容检测（AI detection），属于科学写作透明性与内容鉴别问题，既不改进 AI 的数学推理、也不自动发现或证明数学结论，且其数学文本仅是检测域；边界规则中“通用… |
| `neusoga3d-a-neuro-symbolic-framework-for-explainable-3d-geometric-reconstruction` | NeuSOGA3D: A Neuro-Symbolic Framework for Explainable 3D Geometric Reconstructi… | 0.70 | 文中对象是点云到符号几何的重建系统（三维视觉/几何建模），既非改进 AI 数学推理或自动证明/发现，也非用数学理论改进 AI 算法本身，按边界规则属于无明确数学对象的 AI 应用工作。 |
| `pcm-a-proof-carrying-message-protocol-for-verifiable-multi-agent-communication` | PCM: A Proof-Carrying Message Protocol for Verifiable Multi-Agent Communication | 0.85 | 研究对象是多智能体可信通信协议而非数学结果或数学问题求解系统，核心目标是防范智能体间欺骗与伪造授权，虽有形式化规范与安全性质证明，但不属于数学化AI推理（ai4math）或用数学方法改进AI模型（m… |
| `predicting-algorithm-classes-for-programming-word-problems` | Predicting Algorithm Classes for Programming Word Problems | 0.60 | 对象是编程竞赛题与算法类别分类，属编程/代码推理而非数学定理或数学方法，不落入ai4math或math4ai。 |
| `proof-carrying-contracts-commitments-ai-agents-cannot-break` | Proof-Carrying Contracts: Commitments AI Agents Cannot Break | 0.70 | 该工作研究对象是智能体合规/安全的形式化验证工程系统，证明只是强制执行合约的手段；既不提升AI数学推理，也不以数学理论改进AI算法，按边界规则属于无数学对象的AI安全与智能体治理工作。 |
| `proof-gated-signing-solver-checked-transaction-guards-that-hold-under-state-drift-for-onchain-ai-agents` | Proof-Gated Signing: Solver-Checked Transaction Guards that Hold Under State Dr… | 0.70 | 该工作对象是链上交易签名安全防护系统，既不研究数学结果/证明，也不改进 AI 的数学推理或用数学理论改进 AI 算法；SMT 求解器只是形式化校验交易策略的工具，属于区块链/智能体安全工程，故归为 … |
| `proof-grounded-patient-specific-clinical-explanations-from-knowledge-graph-reasoning` | Proof-Grounded Patient-Specific Clinical Explanations from Knowledge-Graph Reas… | 0.85 | 尽管归入“Mathematical Reasoning & LLMs”领域，但研究对象与交付物都是临床知识图谱推理与解释系统，既无数学对象（定理、证明、猜想），也无用于AI的数学方法，属于面向临床的… |
| `proof-of-agentness-towards-verifying-agents-on-the-web` | Proof-of-Agentness: Towards Verifying Agents on the Web | 0.95 | 尽管标注的研究领域为 Mathematical Reasoning & LLMs，全文对象是 Web 端智能体识别与反滥用机制，摘要与意义均围绕验证与分类准确率，无任何数学对象、形式化证明或用于 A… |
| `re-bench-frontier-ai-rd-vs-human-experts` | RE-Bench: Evaluating frontier AI R&D capabilities of language model agents agai… | 0.95 | 工作对象是通用AI研发自动化评测，无数学对象、也无面向AI的数学方法，边界规则明确将RE-Bench归为none。 |
| `reality-is-the-final-verifier-on-two-key-gaps-in-agentic-software-engineering` | Reality Is the Final Verifier: On Two Key Gaps in Agentic Software Engineering | 0.92 | 全文以软件工程中的需求规格、部署环境建模与保障循环为对象，明确指出“实际部署行为是最终验证者”，未涉及数学定理、猜想、形式化语料，也未提出用于改进AI的数学理论，按边界规则属于通用AI科研自动化工作 |
| `reasoning-with-evidence-not-merely-rationales-verifiable-preference-proofs-for-llm-based-recommendation` | Reasoning with Evidence, Not Merely Rationales: Verifiable Preference Proofs fo… | 0.90 | 研究对象是推荐系统的理由生成与排序预测，交付物为推荐框架与验证目标，虽标注于数学推理领域，但摘要与贡献中无数学对象、定理、形式化语料，也没有为AI算法提供数学方法或理论，属于一般AI/推荐可靠性工作。 |
| `researchagent-iterative-idea-generation` | ResearchAgent: Iterative Research Idea Generation over Scientific Literature wi… | 0.90 | 边界规则明确：'The AI Scientist' 类通用 AI 研究自动化工作若无数学研究对象也无面向 AI 的数学方法即为 none；本工作对象是通用科研想法生成系统，评估横跨多学科而非数学成果。 |
| `resolve-language-agnostic-validation-of-gpu-kernels-through-testing-reduction-and-proof` | RESOLVE: Language-Agnostic Validation of GPU Kernels Through Testing, Reduction… | 0.80 | 工作对象是GPU内核代码而非数学定理、数学问题求解系统或AI模型的数学性质，其形式证明只是验证硬件代码等价性的手段，属于工程/工具自动化，既不提升AI数学推理（ai4math）也不用数学理论改进AI… |
| `saltbench-a-referee-gated-protocol-for-measuring-method-effects-in-machine-checked-software-work` | SaltBench: A Referee-Gated Protocol for Measuring Method Effects in Machine-Che… | 0.75 | 核心对象是Verus上的软件组件与编码智能体，裁判含留出测试集，属于软件工程评测；摘要与显著性强调的是'分离智能体工具链与计分的协议'与成本溢价量化，未提供数学定理、形式化数学语料或面向AI的数学方… |
| `sciagents-multi-agent-graph-reasoning-discovery` | SciAgents: Automating scientific discovery through multi-agent intelligent grap… | 0.90 | 工作对象是通用科学发现自动化（生物启发材料），既无数学成果或数学语料，也无面向AI的数学方法，按边界规则归为none，与“The AI Scientist”同类。 |
| `semiotic-relations-and-proof-methods-a-cross-genre-study-of-argument-structure-with-large-language-models` | Semiotic Relations and Proof Methods: A Cross-Genre Study of Argument Structure… | 0.70 | 文中明确研究对象是论证结构与证明方法的符号学分类，大语言模型仅充当标注工具；既未提升AI数学推理，也未用数学理论改进AI算法或解释AI模型，故落在none。 |
| `sequence-informed-geometric-evaluation-of-rna-3d-structures` | Sequence-Informed Geometric Evaluation of RNA 3D Structures | 0.90 | 该工作的研究对象是生物大分子结构评估 AI 模型，核心目标是改进 RNA 构象候选的排序选择，既非自动发现/证明数学结果，也未提出用于 AI 的数学方法或理论，属于 AI-for-science 范… |
| `specguard-proving-a-task-is-broken-before-the-agent-cheats` | SpecGuard: Proving a Task Is Broken Before the Agent Cheats | 0.75 | 虽然使用 Lean 4 自动形式化与内核检查，但研究对象和交付物是软件工程任务规范一致性证书与防作弊工具，既不证明数学定理或做数学推理（非 ai4math），也不用数学理论改进 AI 模型训练或解释… |
| `spera-spherical-prior-eeg-foundation-model-with-geometry-and-frequency-aware-latent-prediction` | SPERA: Spherical Prior EEG Foundation Model with Geometry- and Frequency-Aware … | 0.90 | 该工作研究对象是面向 EEG 的 AI 模型，目标与交付物均为提升神经信号建模与下游任务性能，不涉及数学推理、定理自动证明或用数学理论解释/改进 AI，故归为 none |
| `swe-proof-can-language-models-resolve-real-world-issues-with-machine-checked-proofs` | SWE-Proof: Can Language Models Resolve Real-World Issues with Machine-Checked P… | 0.60 | 研究对象是软件补丁正确性与编码智能体基准而非数学定理、猜想或数学语料；形式化证明在此服务于程序验证，属于 AI-for-software-engineering/研究自动化，按“无论文数学对象也无面… |
| `the-ar-fairness-metamodel-a-structured-framework-for-fairness-measures` | The AR Fairness Metamodel: A Structured Framework for Fairness Measures | 0.80 | 工作核心对象是公平性度量的形式化建模与比较（含 Gini、Theil、Jain 指数及儿童保育补贴示例），虽含形式证明与开源工具，但既不以数学推理/定理自动证明为目标，也不提供面向 AI 模型的数学… |
| `trustedcode-evaluating-large-language-models-for-developing-trusted-code-through-automated-program-verification` | TrustedCode: Evaluating Large Language Models for Developing Trusted Code throu… | 0.72 | 研究对象是 AI 生成软件代码的正确性验证，目标是可信代码而非数学推理、数学定理自动证明或用数学理论改进 AI；虽用到 Why3/定理证明后端，但那是验证代码的手段，属通用软件验证，按边界规则归 n… |
| `two-uncertainties-are-not-one-disagreement-versus-decision-risk-in-cheap-structured-content-moderation` | Two Uncertainties Are Not One: Disagreement versus Decision-Risk in Cheap Struc… | 0.80 | 研究对象是内容审核AI模型的评测与不确定性信号，不含任何数学对象；其核心目标是模型替代性与决策风险的工程评测，既非改进AI数学推理（ai4math），也非用数学理论改进或解释AI模型（math4ai… |
| `veripie-checkable-query-plans-and-evidence-guided-selection-for-text-to-sql` | VeriPIE: Checkable Query Plans and Evidence-Guided Selection for Text-to-SQL | 0.78 | 该工作的核心对象与交付物是数据库查询生成系统及其评测结果，Lean 仅被用作查询计划检查的实现工具，并非数学定理、证明、形式化数学语料或面向 AI 的数学方法，因此不落在 ai4math 或 mat… |
| `what-masking-geometry-works-best-for-eeg-foundation-models` | What masking geometry works best for EEG foundation models? | 0.72 | 工作对象是EEG神经科学基础模型的预训练掩码消融，既无数学结果、证明或形式化语料等数学对象，也没有用数学理论改进AI算法，仅是面向AI-for-science的实证训练方法研究，按边界规则归为non… |

### ai4math → none（10）

| slug | 标题 | 置信度 | 理由 |
| --- | --- | ---: | --- |
| `apriori-knowledge-in-an-era-of-computational-opacity-the-role-of-ai-in-mathematical-discovery` | Apriori Knowledge in an Era of Computational Opacity: The Role of AI in Mathema… | 0.80 | 边界规则规定general AI research-automation或无数学对象/无面向AI的数学方法的work为none；本文是关于知识论（apriori knowledge）的哲学论文，仅论… |
| `countable-nondeterminism-in-weighted-programming-with-an-application-to-mechanized-foundations-for-probabilistic-program-verification` | Countable Nondeterminism in Weighted Programming with an Application to Mechani… | 0.72 | 该工作研究对象是程序语义与概率程序验证的形式化数学/形式化方法成果，既不改进 AI 的数学推理或自动定理证明能力，也不用数学理论解释或改进 AI 模型；其 Lean 机械化是程序验证的语义定理而非形… |
| `counterexample-driven-autonomous-research-with-application-to-excess-radiated-energy-in-a-z-pinch` | Counterexample-driven autonomous research with application to excess radiated e… | 0.75 | 按边界规则，本文属通用 AI-for-science/科研自动化工作：其猜想对象是物理经验命题，检验手段是数值模拟而非数学证明，摘要与意义段均强调'物理猜想'与'等离子体物理能量收支'，无数学对象也… |
| `dynamic-proof-theory-for-dynamic-epistemic-logic` | Dynamic Proof Theory for Dynamic Epistemic Logic | 0.75 | 研究对象是数理逻辑中的形式演算与其元定理，核心目标是构造并证明该演算的证明论性质，属于纯数学逻辑成果；虽提及可支持自动推理，但交付物不含AI系统、模型或面向AI的数学方法，故不属于ai4math或m… |
| `falsification-proof-non-market-allocation-mechanisms` | Falsification-proof non-market allocation mechanisms | 0.90 | 研究对象是资源配置机制的数学/经济学刻画，交付物为分配规则的最优性定理与福利分析，文本中未涉及数学问题求解系统、数学数据集或AI模型与训练方法，因此不属于ai4math或math4ai。 |
| `maple-symbolic-computation-system` | Maple offers portable interactive symbolic computation | 0.75 | 研究对象是确定性的计算机代数系统与符号算法，交付物是数学软件工具而非 AI 数学推理、自动猜想/证明或面向 AI 的数学方法；摘要与意义均强调“interactive symbolic algebr… |
| `mathematical-proof-assistants-for-teaching-logic-the-logikey-methodology` | Mathematical Proof Assistants for Teaching Logic: The LogiKEy Methodology | 0.85 | 工作对象是逻辑教学法与证明助手在课堂中的使用，核心目标是逻辑教育而非改进 AI 的数学推理或用数学改进 AI；按决策表属于“以上皆非”，且交付物是教学经验而非数学专门产物或可复用 AI 方法。 |
| `modern-software-engineering-with-verification-agents-a-spec-first-architecture-for-autonomous-synthesis-verification-irs-and-organizational-scale` | Modern Software Engineering with Verification Agents: A Spec-First Architecture… | 0.75 | 研究对象是软件工程的形式化验证架构而非数学结果、证明或数学问题求解系统，摘要与意义均强调“agent-authored, formally verified software engineering… |
| `proofpaths-an-ai-agent-framework-for-assessing-student-reasoning` | ProofPaths: An AI Agent Framework for Assessing Student Reasoning | 0.78 | 该工作既不改进AI自身的数学推理、也不做定理自动证明或猜想发现，更未用数学理论改进AI算法，其交付物是面向教学评估的AI智能体工具，属于AI-for-education而非ai4math或math4… |
| `representation-theorems-for-actual-powers-over-two-agent-general-concurrent-game-frames` | Representation Theorems for Actual Powers over Two-Agent General Concurrent Gam… | 0.92 | 该工作是模态逻辑/联盟博弈语义中的纯数学表示定理证明，研究对象为博弈框架与邻域框架的对应关系，其核心目标是刻画战略能力的逻辑语义，并不涉及改进 AI 数学推理、自动发现/证明数学结论，也不涉及用数学… |

### both → ai4math（5）

| slug | 标题 | 置信度 | 理由 |
| --- | --- | ---: | --- |
| `a-lean-dataset-for-international-math-olympiad-small-steps-towards-writing-math-proofs-for-hard-problems` | A Lean Dataset for International Math Olympiad: Small Steps towards Writing Mat… | 0.95 | 核心交付物是数学专门制品——Lean 形式化证明语料与面向证明写作的评测基准，属于“自动证明数学定理/数学数据集”范畴；按边界规则，形式化证明基准归入数学工具链即 ai4math，且无面向 AI 训… |
| `mlfmf-data-sets-for-machine-learning-for-mathematical-formalization` | MLFMF: Data Sets for Machine Learning for Mathematical Formalization | 0.90 | 标题与摘要明确其为面向证明助手形式化的数学数据集与基准，属于数学工具链的专用产物；其基线实验只是评测手段而非通用 AI 训练方法贡献，故按交付物归入 ai4math。 |
| `openfrontiers-a-collection-of-open-research-problems-and-a-benchmark-for-scientific-rediscovery` | OpenFrontiers: A Collection of Open Research Problems and a Benchmark for Scien… | 0.90 | 核心交付物是数学问题语料与带Lean 4验证陈述的基准，属于数学数据集/基准（数学工具链），按边界规则“形式化证明器相关的基准属于数学工具链→ai4math”，且未提供面向AI的训练方法或理论。 |
| `ramanujan-challenge-results-ai-assisted-evaluation-pipeline-for-multi-format-proofs` | Ramanujan Challenge Results: AI-Assisted Evaluation Pipeline for Multi-Format P… | 0.92 | 该工作的对象是数学问题基准与证明评测工具链，按边界规则“面向形式化证明器的基准或工具属于数学工具链”，其交付物是数学特化制品（数学基准与证明判定流水线），核心目标是自动证明与评估AI数学推理能力，故… |
| `squeezebench-saturation-resilient-evaluation-of-mathematical-capability` | SqueezeBench: Saturation-Resilient Evaluation of Mathematical Capability | 0.90 | 工作对象是数学问题与经 Lean 双内核校验的证明记录，交付物是评测数学推理/证明能力的基准（属于数学工具链），其中虽含已验证数学内容，但并无改进 AI 训练或解释 AI 模型的 math4ai 共… |

### ai4math → math4ai（3）

| slug | 标题 | 置信度 | 理由 |
| --- | --- | ---: | --- |
| `human-llm-deliberation-as-interactive-proof-conditions-for-verifiability-without-transparency` | Human-LLM Deliberation as Interactive Proof: Conditions for Verifiability Witho… | 0.65 | 交付物是用交互式证明与统计判决理论为人类-LLM验证协议建立的数学保证（可靠性/完备性界与审查设计准则），属于用数学理论改进AI验证算法与协议，而非数学专用的证明器、形式语料或数学问题求解系统；虽在… |
| `learning-to-plan-by-looking-back-hindsight-hierarchies-for-training-reasoning-models` | Learning to Plan by Looking Back: Hindsight Hierarchies for Training Reasoning … | 0.75 | 标题交付物是可复用的训练算法/自我改进循环，属于改进 AI 模型训练方法（类比 Math-Shepherd、MGE-PO 的定级），Lean 定理证明只是其数学场景的实例化而非证明器或形式化数学制品… |
| `navier-stokes-lost-in-translation-why-lean-verification-of-ai-autoformalisation-does-not-guarantee-correct-natural-language-proofs` | Navier-Stokes lost in translation: Why Lean verification of AI autoformalisatio… | 0.72 | 交付物是对自动形式化这一AI过程的数学分析与不可能性结论（SCI=∞），而非数学成果、prover或数学语料；按边界规则“用数学理论解释AI模型性质→math4ai”，尽管例子涉及Lean验证工具链… |

## 优先人工核验

筛选条件：判为 none、置信度 < 0.7，或判定变化且置信度 < 0.8。以下保留三步判断的原始字段，便于逐条核对。

### `a-lean-and-spec-driven-ai-assisted-software-development-lifecycle-for-applied-ai-education-the-ai-sdlc-approach`

**A Lean and Spec-Driven AI-Assisted Software Development Lifecycle for Applied AI Education: The AI-SDLC Approach**

`math4ai → none` · 置信度 0.90 · 来源 ingested

- 研究对象：面向 AI 编码智能体的规范驱动软件开发生命周期（AI-SDLC）框架及其在大学课程中的教学应用。
- 核心目标：为 AI 编码智能体的软件开发流程提供可审查、可测试的治理方法与教学实践，而非改进数学推理或用数学理论改进 AI。
- 实际贡献：交付了一个流程导向的软件工程框架（规范、AGENTS.md、阶段技能文件）以及在 FHNW 课程中的学生调查评估，未涉及数学成果或面向 AI 的数学方法。
- 理由：研究对象是软件工程生命周期与教学实践，摘要与重要性均围绕‘govern agentic software engineering’和大学课程部署，既无数学对象也无面向 AI 的数学方法，按边界规则归为 none。

### `action-verification-through-conjecture-and-refutation-for-language-model-agents`

**Action Verification through Conjecture and Refutation for Language Model Agents**

`math4ai → none` · 置信度 0.90 · 来源 ingested

- 研究对象：面向语言模型智能体的动作验证过程（BlackSwan 的“expect-suspect-test”反驳式流程），在 AppWorld/WebShop 环境中验证状态变更动作
- 核心目标：通过构造并检验可证伪假设来在执行前拦截错误动作，从而提升语言模型智能体的任务成功率与安全性
- 实际贡献：提出反驳导向的动作验证程序并在 AppWorld、WebShop 上实证提升成功率（较最强基线提升 14.9/25.2/12.7 个百分点），未交付任何数学结果、证明、形式语料或面向 AI 的数学方法
- 理由：尽管研究领域标签指向数学发现，摘要与贡献均只涉及通用语言模型智能体的动作验证与基准环境评测，既无数学研究对象，也无用于改进 AI 的数学方法，按边界规则归为 none。

### `agent-laboratory-llm-agents-research-assistants`

**Agent Laboratory: Using LLM Agents as Research Assistants**

`math4ai → none` · 置信度 0.90 · 来源 seed

- 研究对象：一个由多阶段LLM智能体（文献综述→实验→论文写作）组成的通用科研自动化流水线
- 核心目标：降低自主科研系统的成本与延迟并支持人类反馈介入，即通用科研流程自动化
- 实际贡献：交付了带人类反馈注入点的分阶段智能体研究框架，成本较既有自主科研方法降低84%
- 理由：摘要与意义均表明其对象是通用科研工作流而非数学结果、形式化语料或面向AI的数学方法，符合‘The AI Scientist’式一般研究自动化的none裁定。

### `ai-co-scientist-multi-agent-hypothesis-generation`

**Accelerating scientific discovery with Co-Scientist**

`math4ai → none` · 置信度 0.90 · 来源 seed

- 研究对象：一个多智能体科学发现系统（基于Gemini的Co-Scientist），用于生成、批判和精炼生物医学研究假设，而非数学定理或形式化语料。
- 核心目标：解决科学发现中假设生成瓶颈，让AI生成新颖且可实验检验的假设（如急性髓系白血病药物重定位）。
- 实际贡献：交付一个异步多智能体+锦标赛进化架构的通用科研自动化系统，其假设经湿实验验证，但未产出任何数学成果或面向AI的数学方法。
- 理由：该工作属于通用AI科研自动化/科学发现，验证领域为生物医学（AML药物重定位、体外实验），既无数学研究对象也无用数学理论改进AI的方法，按边界规则归为none。

### `ai-scientist-automated-open-ended-discovery`

**The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery**

`math4ai → none` · 置信度 0.95 · 来源 seed

- 研究对象：通用科学研究自动化框架（LLM智能体自主完成构思、实验、撰写的完整科研循环）
- 核心目标：实现端到端的开放式自主科学发现，降低论文产出成本
- 实际贡献：交付了一个通用的自主论文生成与自动评审框架（约每篇15美元），并未针对任何数学对象或为AI提供数学方法
- 理由：边界示例明确将该工作归为none：其为通用AI科研自动化，既无数学研究对象（定理、猜想、形式化语料），也无用于改进AI的数学方法。

### `ai-scientist-v2-workshop-level-agentic-tree-search`

**The AI Scientist-v2: Workshop-Level Automated Scientific Discovery via Agentic Tree Search**

`math4ai → none` · 置信度 0.95 · 来源 seed

- 研究对象：通用科研自动化系统：一个摆脱人工代码模板、用渐进式代理树搜索推进完整科研流程的自动科学家代理
- 核心目标：让自动科研管线跨领域泛化并把单个想法一路推进到通过同行评审，属于通用 AI for Science 研究自动化
- 实际贡献：交付了模板无关的 agentic tree search 与实验管理代理、VLM 图表反馈闭环及开源实现，并产出首篇通过 ICLR workshop 同行评审的全 AI 生成论文
- 理由：工作对象是通用科学发现代理而非任何数学定理、证明或面向 AI 的数学方法，边界规则明确指出无数学对象也无面向 AI 数学方法的 AI-for-science 工作归为 none，虽在数学代理研究区展示但交付物不含数学专项成果。

### `aide-ai-driven-exploration-space-of-code`

**AIDE: AI-Driven Exploration in the Space of Code**

`math4ai → none` · 置信度 0.95 · 来源 seed

- 研究对象：一个面向机器学习工程的AI智能体系统（AIDE），将ML工程建模为对代码空间的树搜索
- 核心目标：用LLM驱动的搜索智能体自动接管ML模型开发中的试错式实验流程，以换算力换取Kaggle、MLE-Bench、RE-Bench上的性能
- 实际贡献：交付的是一个通用ML工程/科研实验自动化智能体，在Kaggle评测、OpenAI的MLE-Bench与METR的RE-Bench上取得SOTA，而非任何数学专用的证明、猜想或数学方法
- 理由：文本明确对象是代码空间树搜索的ML工程智能体，基准均为ML工程评测（RE-Bench边界示例即判none），不研究数学对象，也不用数学理论改进AI算法。

### `algorag-retrieval-augmented-generation-for-theoretical-computer-science-education-a-comprehensive-evaluation-framework-for-algorithm-analysis-and-complexity-theory`

**AlgoRAG: Retrieval-Augmented Generation for Theoretical Computer Science Education -- A Comprehensive Evaluation Framework for Algorithm Analysis and Complexity Theory**

`math4ai → ai4math` · 置信度 0.72 · 来源 ingested

- 研究对象：一个将 LLM 与理论计算机科学（算法分析与复杂度理论）知识库结合的 RAG 系统及其在 179 道考试题上的评测框架。
- 核心目标：让 AI 能正确解答并讲解需要形式证明与渐近分析的算法/复杂度问题，即提升 AI 的数学推理与解题能力。
- 实际贡献：交付了一个带数学实体识别、记号感知检索与教学式重排的领域化 RAG 系统和配套试题评测，报告 100% 成功率及教学质量指标（如 pedagogical quality 0.7620）。
- 理由：对象是算法分析、递推、NP 完全性等数学化题目及其证明模板，交付物是面向数学问题求解与形式证明的 RAG 系统与评测基准，按边界规则属于面向数学的系统/数据集而非通用 AI 方法，故归 ai4math；但其教育导向使置信度中等。

### `apriori-knowledge-in-an-era-of-computational-opacity-the-role-of-ai-in-mathematical-discovery`

**Apriori Knowledge in an Era of Computational Opacity: The Role of AI in Mathematical Discovery**

`ai4math → none` · 置信度 0.80 · 来源 ingested

- 研究对象：关于计算机辅助证明之先验知识地位的数学哲学论证，以四色定理与现代LLM/DNN的计算不透明性为案例
- 核心目标：阐明AI辅助证明在何种条件下能为人类提供真正的先验数学知识而非仅仅证言，而非改进AI推理或训练方法
- 实际贡献：提出哲学论断：证明检查器（proof-checker）自动化人类形式的验证活动，从而在底层机器不透明时恢复对AI生成证明的先验知识通达；未交付任何证明器、形式语料库、数学模型或AI算法
- 理由：边界规则规定general AI research-automation或无数学对象/无面向AI的数学方法的work为none；本文是关于知识论（apriori knowledge）的哲学论文，仅论证形式验证使不透明系统在认识论上可用，未自动证明定理、未发现猜想，也未用数学理论改进AI算法，故不属ai4math或math4ai。

### `auditable-algebraic-counting-field-for-cryptic-pocket-detection-from-apo-structures`

**Auditable Algebraic Counting Field for Cryptic-Pocket Detection from Apo Structures**

`math4ai → none` · 置信度 0.90 · 来源 ingested

- 研究对象：一种名为代数计数场（ACF）的可审计监督式模型，用于从 apo 蛋白结构预测隐性口袋残基。
- 核心目标：用可完全回溯的紧凑特征查表模型改进蛋白质隐性口袋残基预测，而非推进数学定理/猜想或 AI 的数学推理能力。
- 实际贡献：交付的是一个面向结构生物学的可解释预测器，在 CryptoBench 及外部集合上以 ROC-AUC 对比 P2Rank 作评估，且优势依赖数据集。
- 理由：研究对象是蛋白质结构预测的生物信息学模型，既无数学结果或形式化语料，也无面向 AI 的数学方法，按边界规则属于 AI-for-science，归为 none。

### `benchmarking-vision-language-models-on-synapse-and-neuron-proofreading-in-connectomics`

**Benchmarking Vision-Language Models on Synapse and Neuron Proofreading in Connectomics**

`math4ai → none` · 置信度 0.95 · 来源 ingested

- 研究对象：一个用于评估视觉语言模型在连接组学电子显微镜标注决策（突触存在性与极性、神经元拆分/合并错误）中表现的基准与数据集
- 核心目标：衡量视觉语言模型在连接组学proofreading任务上与专用模型相比的能力，以及少样本与LoRA微调的效果
- 实际贡献：构建并公开突触与神经元proofreading基准，评测21个与5个模型并证明LoRA微调可让开源模型达到专用模型水平、跨物种迁移时在合并错误检测上超越专用模型
- 理由：研究对象是神经科学（connectomics）标注基准，既无数学对象也无面向AI的数学方法，按规则属于通用AI-for-science工作，归为none。

### `beyond-equation-search-conjecture-guided-discovery-with-scope-and-closurebench`

**Beyond Equation Search: Conjecture-Guided Discovery with SCOPE and ClosureBench**

`math4ai → ai4math` · 置信度 0.75 · 来源 ingested

- 研究对象：SCOPE框架（多科学家智能体协作的猜想引导发现系统）与ClosureBench基准（60个在已知PDE系统中嵌入未知代数关系的闭包发现任务）
- 核心目标：自动发现并检验科学猜想：让智能体通过方程建模、提问与主动实验来发现、修订或拒绝关于未知代数关系的猜想，而非仅拟合方程
- 实际贡献：交付了一个猜想引导的自动发现框架SCOPE和一个交互式发现基准ClosureBench，并报告SCOPE在方程准确率、证据忠实性与机制洞见上优于基线
- 理由：研究对象是未知代数关系与科学猜想的自动发现（数学对象），核心目标属于'自动发现数学模式或猜想'；但任务设定在PDE系统与OpenFOAM科学场景而非纯数学，故置信度中等。

### `beyond-the-ergodic-wall-a-discrete-geometric-physics-sandbox-for-analysing-ai-scaling-limits-and-complexity-collapse`

**Beyond the Ergodic Wall: A Discrete Geometric Physics Sandbox for Analysing AI Scaling Limits and Complexity Collapse**

`math4ai → math4ai` · 置信度 0.60 · 来源 ingested

- 研究对象：一个基于E8根系切割投影、准晶格与全息边界的离散几何物理沙盒框架，用于解释深度学习的遍历性、尺度极限与复杂度塌缩问题。
- 核心目标：用离散几何与信息论物理模型解释AI的尺度极限并论证人机共生与复杂度归约，属于用数学/物理理论分析AI模型性质的目标。
- 实际贡献：仅提出机制设想与猜想性论断（如Data LifeCone、将NP塌缩为P的守恒因果轨迹约束），未给出已确立的数学结果或可复用的AI方法。
- 理由：标题与摘要明确以"analysing AI scaling limits"为核心，交付物是用几何/物理数学理论分析AI模型性质的框架，符合math4ai中"用数学理论解释AI模型"一类；但如Significance所述全部为"proposed mechanisms and conjectural claims rather than established results"，边界情形导致置信度仅0.6。

### `cadforge-agentic-single-view-cad-reconstruction-with-explicit-geometry-reasoning`

**CADForge: Agentic Single-View CAD Reconstruction with Explicit Geometry Reasoning**

`math4ai → none` · 置信度 0.80 · 来源 ingested

- 研究对象：一个从单张图像生成可编辑参数化 CAD 模型（CadQuery 可执行程序）的智能体框架 CADForge。
- 核心目标：解决单视图不完整观测下几何重建的困难，为制造业产出更准确、可编辑的 CAD 模型，而非解决数学问题或改进 AI 的数学推理。
- 实际贡献：交付了一个包含显式几何推理、评审智能体迭代反馈、失败引导工具构建与参数化 CAD 记忆的工程 CAD 重建系统，并在单/多部件数据上超越基线。
- 理由：其研究对象与交付物是 CAD 工程建模工具（CadQuery 程序生成），虽含'显式几何推理'与'数学代码'，但属于 AI-for-engineering 自动化，既无数学成果（定理/证明/猜想/数学数据集或基准），也非用于 AI 的数学方法或理论，按边界规则归为 none。

### `countable-nondeterminism-in-weighted-programming-with-an-application-to-mechanized-foundations-for-probabilistic-program-verification`

**Countable Nondeterminism in Weighted Programming with an Application to Mechanized Foundations for Probabilistic Program Verification**

`ai4math → none` · 置信度 0.72 · 来源 ingested

- 研究对象：带可数非确定性和用户自定义奖励的加权编程语义框架，以及基于加权决策过程（WDP）的最弱前置条件（wp）演算可靠性定理及其 Lean 机械化形式化。
- 核心目标：为具有无界选择与奖励的程序补上 wp 演算的可靠性缺口，给出可检验的语义条件并在 Lean 中机器验证这些语义论证。
- 实际贡献：提出以模块参数化的扩展加权编程框架与 WDP 操作语义基准，给出 wp 变换器可靠的充分条件并以概率程序期望资源消耗和组合博弈最优得分为案例，同时把框架与主要可靠性定理在 Lean 中机械化。
- 理由：该工作研究对象是程序语义与概率程序验证的形式化数学/形式化方法成果，既不改进 AI 的数学推理或自动定理证明能力，也不用数学理论解释或改进 AI 模型；其 Lean 机械化是程序验证的语义定理而非形式化数学语料或 prover 工具，按边界规则归为 none。

### `counterexample-driven-autonomous-research-with-application-to-excess-radiated-energy-in-a-z-pinch`

**Counterexample-driven autonomous research with application to excess radiated energy in a Z-pinch**

`ai4math → none` · 置信度 0.75 · 来源 ingested

- 研究对象：研究对象是 Simjecture 这一让语言模型智能体通过反例驱动证伪与假设修复来探索人类定义的物理猜想的开放式研究自动化框架，并以 Z-pinch 等离子体辐射能量收支作为计算物理测试bed。
- 核心目标：核心目标是重构开放式的 AI 实证科学研究流程，让智能体在计算可执行的检验下提出、证伪并修正假设，而非解决某个数学定理或数学猜想。
- 实际贡献：实际交付的是一个可审计的科研自动化范式（Simjecture 框架）以及高能量密度等离子体物理中能量转换、保持与释放时序的具体物理洞见，未给出任何数学证明、数学猜想或形式化数学语料。
- 理由：按边界规则，本文属通用 AI-for-science/科研自动化工作：其猜想对象是物理经验命题，检验手段是数值模拟而非数学证明，摘要与意义段均强调'物理猜想'与'等离子体物理能量收支'，无数学对象也无面向 AI 的数学方法。

### `cpunesy-controlling-model-writes-for-reliable-neuro-symbolic-reasoning`

**CPUNeSy: Controlling Model Writes for Reliable Neuro-Symbolic Reasoning**

`math4ai → math4ai` · 置信度 0.65 · 来源 ingested

- 研究对象：一种约束LLM向符号状态写入的神经符号服务架构及其可靠性机制
- 核心目标：用谓词接口与证书门控提升LLM神经符号推理的可靠性与选择性弃答能力
- 实际贡献：提出CPUNeSy架构并证明确定性执行驱动精度、受控写入提升选择性可靠性
- 理由：核心交付是可复用的AI服务与写入控制方法，法律与医疗任务同为评测，形式数学仅是应用之一，故归math4ai

### `cyc-researcher-automated-research-review`

**CycleResearcher: Improving Automated Research via Automated Review**

`math4ai → none` · 置信度 0.85 · 来源 seed

- 研究对象：一个以开放权重LLM为核心的全流程自动化科研与评审系统CycleResearcher/CycleReviewer及其同行评审与论文数据集Review-5k、Research-14k
- 核心目标：自动化从文献综述到撰稿再到模拟同行评审的整个ML科研流程，并让开源模型在评审打分预测上接近人类审稿人
- 实际贡献：交付了基于偏好训练的自动化科研+自动评审框架与两个ML科研/评审数据集，CycleReviewer把论文分数预测MAE较人类审稿人降低26.89%、CycleResearcher稿件模拟得分5.36略超人类预印本5.24
- 理由：对象是通用ML科研自动化与自动评审（数据集为真实ML论文与评审），不含数学定理、猜想、形式化语料等数学对象，也未提出面向AI的数学方法，按边界规则归为none。

### `depthevidence-unifying-metric-depth-prediction-and-geometric-reasoning-in-multimodal-language-models`

**DepthEvidence: Unifying Metric Depth Prediction and Geometric Reasoning in Multimodal Language Models**

`math4ai → none` · 置信度 0.65 · 来源 ingested

- 研究对象：一个多模态语言模型（DepthEvidence）及其配套的 Depth-VQA 基准，研究对象是图像中的稠密米制深度预测与基于物体的几何/空间推理。
- 核心目标：统一稠密深度估计与语言式几何推理，使模型能做物体测量、相对比较和空间-数值约束下的判断，并评测其空间与数值推理能力。
- 实际贡献：交付了一个带相机条件解码器与稠密到语言接口的 4B 多模态模型，以及覆盖物体深度查询、相对比较与约束决策的 Depth-VQA 基准，在九个数据集上取得最优稠密 δ₁ 与实例级深度及推理成绩。
- 理由：该工作研究的是计算机视觉中的米制深度预测与视觉空间/物体测量推理，Depth-VQA 是空间推理基准而非数学内容或形式化数学基准；其目标是提升视觉-语言模型的空间理解，而非数学定理、证明、数学问题求解或用数学理论改进 AI，故按“无数学对象、无数学方法”归为 none。

### `dynamic-proof-theory-for-dynamic-epistemic-logic`

**Dynamic Proof Theory for Dynamic Epistemic Logic**

`ai4math → none` · 置信度 0.75 · 来源 ingested

- 研究对象：动态认知逻辑（DEL）的证明演算系统——基于动态超序列（dynamic hypersequents）的形式化演算及其元理论
- 核心目标：为DEL建立一个兼具经典S5基础与内蕴动态性的结构化证明演算，并证明其逻辑规则可逆、结构规则（含收缩与切割）可容许
- 实际贡献：论文交付的是一个DEL的证明演算及其元理论证明（可逆性、可容许性），而非自动定理证明系统或AI推理方法；文中仅将系统化证明搜索、自动化认知推理称为潜在应用
- 理由：研究对象是数理逻辑中的形式演算与其元定理，核心目标是构造并证明该演算的证明论性质，属于纯数学逻辑成果；虽提及可支持自动推理，但交付物不含AI系统、模型或面向AI的数学方法，故不属于ai4math或math4ai。

### `electronic-density-versus-geometry-for-machine-learned-molecular-absorption-spectra`

**Electronic Density versus Geometry for Machine-Learned Molecular Absorption Spectra**

`math4ai → none` · 置信度 0.80 · 来源 ingested

- 研究对象：用于分子光学吸收光谱预测的机器学习代理模型，比较基态电子密度与分子几何两种输入表示
- 核心目标：通过表示选择提升分子吸收光谱的低成本机器学习预测精度，属于分子性质预测的AI for Science问题
- 实际贡献：实验表明电子密度输入的CNN在QM7的6874个分子上验证相关性0.9926、优于最佳几何图模型0.9795，为光谱预测提供表示选择指导
- 理由：研究对象是分子光谱的机器学习代理模型与输入表示，核心是提升科学性质预测而非数学推理或证明，也不涉及用数学理论解释或改进AI，因此不归入ai4math或math4ai。

### `equivsva-a-formally-verified-dataset-of-behavioral-assertions-across-equivalent-rtl-implementations`

**EquivSVA: A Formally Verified Dataset of Behavioral Assertions Across Equivalent RTL Implementations**

`math4ai → none` · 置信度 0.70 · 来源 ingested

- 研究对象：一个用于测试生成的SystemVerilog断言是否捕获外部可观察行为的硬件验证形式化数据集，包含120个行为族、480个参考RTL实现、914条黄金属性与360个变异体及形式化验证证据。
- 核心目标：衡量并研究断言生成在行为等价的不同RTL实现之间的稳健性，为该任务提供可核查的基准。
- 实际贡献：公开发布了一个经过17项固定任务形式化验证的断言生成基准、生成器与验证脚本，并用Qwen2.5-Coder-7B做了跨等价实现稳健性的案例研究。
- 理由：研究对象是RTL/SystemVerilog断言生成这一硬件验证任务，其验证对象是电路行为等价与断言可区分性，既无数学结果、猜想或数学形式语料，也不含面向AI的数学方法或理论，按边界规则属于无数学对象的领域专用基准。

### `evigraph-proof-carrying-selective-recommendation-over-temporal-public-service-knowledge-graphs`

**EviGraph: Proof-Carrying Selective Recommendation over Temporal Public-Service Knowledge Graphs**

`math4ai → none` · 置信度 0.85 · 来源 ingested

- 研究对象：面向公共服务推荐的框架与双语香港公共服务基准，核心对象是时序知识图谱上的证据支撑推荐系统及确定性校验器
- 核心目标：解决公共服务推荐中证据处理过严导致过度弃答的问题，通过区分决定性需求与可悬置细节来提升推荐可靠性
- 实际贡献：提出 EviGraph 框架并在带可执行政策引用的公共服务基准上验证：显式识别决定性需求能减少不必要弃答，且额外校验并不提升决策质量
- 理由：研究对象是公共服务推荐系统与应用基准，不含数学结果、定理证明或面向 AI 的数学方法，属于一般应用 AI 工作，故为 none。

### `explaining-textual-entailment-with-lexical-entailments-using-llms-to-supply-lexical-relations-for-formal-proofs`

**Explaining Textual Entailment with Lexical Entailments: Using LLMs to Supply Lexical Relations for Formal Proofs**

`math4ai → none` · 置信度 0.85 · 来源 ingested

- 研究对象：该工作研究的是自然语言推理（NLI）中的词汇蕴含知识：LLM能否生成用于句级蕴含判定的词汇关系，以及这些关系对逻辑型NLI定理证明器LangPro的证明搜索有何帮助。
- 核心目标：核心目标是提升自然语言推理的神经-符号证明能力，而非解决数学问题或改进AI模型训练方法。
- 实际贡献：实际交付了一个新任务的数据集（以词汇蕴含集合解释蕴含标签）及其LLM生成的结构化词汇解释，并在LangPro中做外在评测，结论是生成的词汇关系仅部分可靠、对证明搜索贡献有限。
- 理由：虽然文中出现定理证明器与形式证明，但对象是自然语言推理的蕴含判定而非数学定理或形式数学语料，既不改进AI数学推理（ai4math），也不以数学理论改进AI方法（math4ai），故归为none。

### `falsification-proof-non-market-allocation-mechanisms`

**Falsification-proof non-market allocation mechanisms**

`ai4math → none` · 置信度 0.90 · 来源 ingested

- 研究对象：非市场资源配置机制中的抗伪造（falsification-proof）分配规则的数学刻画与最优性理论
- 核心目标：刻画在可操纵特征下最优的抗伪造分配规则，并给出实现诚实、最优配置的条件，属于机制设计/经济学理论问题，与AI推理或AI理论均无关
- 实际贡献：在广泛伪造技术下刻画最优抗伪造规则，并给出一个诚实性条件使规则能求解规划者最大化配置剩余与代理人福利加权和的无约束问题
- 理由：研究对象是资源配置机制的数学/经济学刻画，交付物为分配规则的最优性定理与福利分析，文本中未涉及数学问题求解系统、数学数据集或AI模型与训练方法，因此不属于ai4math或math4ai。

### `from-verification-failures-to-reusable-guidance-for-coding-agents`

**From Verification Failures to Reusable Guidance for Coding Agents**

`math4ai → none` · 置信度 0.70 · 来源 ingested

- 研究对象：该工作研究的是面向编程智能体的程序验证流程：如何把专家对验证失败的诊断转化为可复用的指导，用 K 框架的可执行语言定义验证 Python 程序并审计规约充分性。
- 核心目标：核心目标是改进 AI 编程智能体在规约构建、证明修复与规约充分性审计上的能力，而非求解数学定理或用数学理论改进 AI。
- 实际贡献：实际交付的是一个把专家验证失败分析转化为智能体可复用指导的工作流，在 HumanEval 164 题上经 K 证明与审计达到 164/164，构造 12 对缺陷/干净包证明审计能捕获全部注入缺陷，并在 KleverBench 上得到混合结果。
- 理由：研究对象是程序正确性验证（K 语义下的 Python 程序证明与规约审计），交付物是面向编程智能体的验证工作流，既无数学定理/猜想/形式化数学语料这类数学对象，也未用数学理论改进或解释 AI 模型，按边界规则属于工程与工具智能体范畴，故归为 none。

### `gala-geometry-aware-language-model-for-controllable-object-arrangement`

**GALA: Geometry-Aware Language Model for Controllable Object Arrangement**

`math4ai → none` · 置信度 0.90 · 来源 ingested

- 研究对象：一个具备显式点云感知的语言模型（GALA），用于根据文本指令在3D场景中摆放物体并预测6D位姿。
- 核心目标：解决文本驱动3D场景生成中细粒度放置约束（支撑、包含）被OBB等表示丢失几何细节的问题，属于3D场景生成/机器人摆放而非数学推理或AI的数学分析。
- 实际贡献：交付了一个几何感知的自回归放置模型、多来源场景数据集以及plan-place-verify智能体流水线，在新基准上超过无显式几何推理的基线。
- 理由：研究对象是3D物体摆放AI模型与场景数据集，核心目标是让文本驱动的3D场景创建更符合几何约束，不属于提升AI数学推理（ai4math），也不属于用数学理论改进或解释AI（math4ai），因此归为none。

### `geometric-signatures-of-conceptual-reorganization-a-counterfactual-embedding-framework-for-detecting-scientific-revolutions`

**Geometric Signatures of Conceptual Reorganization: A Counterfactual Embedding Framework for Detecting Scientific Revolutions**

`math4ai → none` · 置信度 0.90 · 来源 ingested

- 研究对象：研究对象是科学知识的文档嵌入几何，通过反事实消融框架量化科学革命中的概念重组现象。
- 核心目标：目标是为科学史上的概念重组提供可复现的几何测量方法，而非解决数学问题或改进AI数学能力。
- 实际贡献：实际交付的是一个基于嵌入扰动的科学革命检测框架，并在物理、数学、机器学习五个历史案例上验证其几何签名与边界条件。
- 理由：该工作属于通用科学研究自动化/科学计量分析，既不产出数学专用工件（证明、证明器、形式语料、数学模型），也没有用数学理论改进AI算法，因此归为none。

### `geopar-large-scale-multi-agent-combinatorial-optimization-with-geometry-guided-parallel-autoregressive-learning`

**GeoPAR: Large-Scale Multi-Agent Combinatorial Optimization with Geometry-Guided Parallel Autoregressive Learning**

`math4ai → none` · 置信度 0.70 · 来源 ingested

- 研究对象：一个面向大规模多智能体组合优化问题（异构车辆路径、开放式多车场取送货）的几何引导并行自回归神经求解器
- 核心目标：通过投影窗口稀疏几何机制、稀疏边偏置注意力与缓存引导冲突感知分配，提升神经组合优化求解器在大规模实例上的零样本泛化与推理效率
- 实际贡献：提出 GeoPAR 框架并在车辆路径类组合优化基准上实现更好的大规模零样本泛化、更少 rollout 步数与更高推理效率，交付物是运筹优化的神经求解算法而非数学定理、证明、猜想或数学基准
- 理由：工作对象是组合优化（VRP、取送货）神经求解算法，几何仅作为建模启发式注入神经网络；其核心目标与交付物属于 AI for Operations Research，既不自动发现/证明数学命题，也非用数学理论改进或解释 AI 模型，故归为 none。

### `gtformer-a-syntax-free-graph-network-alternative-to-transformers-for-8192-times-length-extrapolation-in-linear-time`

**GTFormer: A Syntax-Free Graph Network Alternative to Transformers for 8192$\times$ Length Extrapolation in Linear Time**

`math4ai → none` · 置信度 0.85 · 来源 ingested

- 研究对象：一种替代Transformer的层级图神经网络架构GTFormer，用于长序列建模
- 核心目标：提升AI长上下文架构的线性时间外推能力，与数学推理或数学方法无关
- 实际贡献：在代码、日志、检索等通用基准上验证线性时间长序列外推，未交付数学对象或面向AI的数学方法
- 理由：交付物是通用AI架构，评估对象为代码、日志、检索基准，无视具体数学成果或用于改进AI的数学理论，属通用AI研究。

### `human-llm-deliberation-as-interactive-proof-conditions-for-verifiability-without-transparency`

**Human-LLM Deliberation as Interactive Proof: Conditions for Verifiability Without Transparency**

`ai4math → math4ai` · 置信度 0.65 · 来源 ingested

- 研究对象：把人-LLM审议过程建模为交互式证明（LLM为证明者、人为验证者）的形式化框架及其可靠性/完备性定理
- 核心目标：用交互式证明理论为无法独立复现的LLM论证给出形式化的验收保证，并指导审查长度等验证协议设计
- 实际贡献：证明了针对自适应证明者的任意时刻有效性可靠性界（接受错误命题的概率至多为指定误差水平）与真命题接受概率下界，并给出局部检查审查优于一次性检查的条件；实验仅为GPQA Diamond与Humanity's Last Exam上的LLM模拟
- 理由：交付物是用交互式证明与统计判决理论为人类-LLM验证协议建立的数学保证（可靠性/完备性界与审查设计准则），属于用数学理论改进AI验证算法与协议，而非数学专用的证明器、形式语料或数学问题求解系统；虽在定理证明工具链方向发表，但评测对象是通用任务（GPQA、HLE）而非数学形式化内容。

### `improving-mathematical-reasoning-capabilities-in-large-language-models-via-reasoning-process-error-classification`

**Improving Mathematical Reasoning Capabilities in Large Language Models via Reasoning Process Error Classification**

`math4ai → ai4math` · 置信度 0.75 · 来源 ingested

- 研究对象：大语言模型在数学数据集上的推理错误——作者人工分析错误案例并定义21类错误分类法
- 核心目标：诊断并改进大语言模型的数学推理能力，即提升AI的数学推理（improve AI's mathematical reasoning）
- 实际贡献：交付了21类数学推理错误的结构化分类法，以及针对其中八类高频错误设计、可提升数学推理表现的提示方法，并发现相似规模模型间共享常见错误模式
- 理由：核心目标是“improve AI's mathematical reasoning”，且最终交付物（数学错误分类法+提升数学推理的提示法）是面向数学推理的专门成果而非通用AI训练方法；因交付物混合了诊断性分析与提示方法，置信度取中高区间。

### `leangrpo-eliminating-redundant-recomputation-in-diffusion-rl`

**LeanGRPO: Eliminating Redundant Recomputation in Diffusion RL**

`math4ai → none` · 置信度 0.85 · 来源 ingested

- 研究对象：扩散模型强化学习（FlowGRPO/DanceGRPO）训练过程中的冗余重计算问题及其消除的数据并行调度方案
- 核心目标：通过重构数据并行布局并提出两种免重算调度来降低扩散RL训练成本，同时保持原优化目标不变
- 实际贡献：提出LeanGRPO-Retain与LeanGRPO-Rewweight两种免重算调度，在FLUX.1-dev和Wan上实现最高1.83倍端到端训练加速且不改变优化目标
- 理由：尽管标注在定理证明领域下，工作实际交付的是扩散图像/视频生成模型RL训练的通用工程加速方法，既不研究数学结果或形式化语料，也不涉及用于AI的数学理论或数学推理能力，属于无数学对象的通用AI训练优化，按边界规则归为none。

### `leanguard-lean-verified-guardrails-for-tool-using-agents`

**LEANGUARD: Lean-Verified Guardrails for Tool-Using Agents**

`math4ai → none` · 置信度 0.72 · 来源 ingested

- 研究对象：一个名为 LeanGuard 的运行时系统，用 Lean4 形式化策略与过去时态时序算子在执行前检查工具调用 agent 的每次动作，并给出决策过程与 LeanLTL 语义等价的证明。
- 核心目标：为工具使用型 AI agent 建立可机器校验的运行时安全护栏、阻止策略违规与提示注入，而非提升数学推理或用数学理论改进 AI 算法。
- 实际贡献：交付了带 LeanLTL 等价性证明的 fail-closed 策略检查器与证明引导修复机制，并在 Tau-Bench 与 DTap 上实证零违规调用、注入成功率由 57.9% 降至 5.9% 且任务成功率不受损。
- 理由：核心交付物是 agent 安全/行为约束的形式化运行时工具，数学（Lean、时序逻辑）只是实现手段；评测对象是 Tau-Bench/DTap 上的 agent 安全与任务表现，既非数学成果或形式化证明工具链，也非面向 AI 模型的数学理论分析，故归为 none。

### `leanplan-optimal-planning-with-llm-generated-heuristics-and-admissibility-proofs`

**LeanPlan: Optimal Planning with LLM-Generated Heuristics and Admissibility Proofs**

`math4ai → ai4math` · 置信度 0.75 · 来源 ingested

- 研究对象：LeanPlan：一个用LLM生成启发式函数并在Lean 4中机器校验其可采纳性证明的最优规划系统及其形式化库
- 核心目标：让AI自动构造并形式化证明搜索启发式的可采纳性定理，从而在自动规划中获得可保证最优的启发式
- 实际贡献：交付了在Lean 4中实现的启发式、可采纳性证明与含机器校验grounding和搜索的高效规划器，并在13个规划域上生成了全部可采纳性证明且优于Scorpion规划器
- 理由：标题和摘要明确其核心交付物是“LLM生成的启发式函数及其被机器校验的可采纳性证明”——即LLM在Lean 4中自动证明定理，属于自动定理证明/ai4math；但应用对象是自动规划而非纯数学，故置信度未到0.9以上。

### `leanstream-a-speculate-and-refine-streaming-framework-for-efficient-on-device-llm-inference`

**LeanStream: A Speculate-and-Refine Streaming Framework for Efficient on-Device LLM Inference**

`math4ai → none` · 置信度 0.90 · 来源 ingested

- 研究对象：面向移动与嵌入式设备的大语言模型推理系统（推测-精化流式执行框架）及其内存/存储I/O调度策略。
- 核心目标：在模型权重超出DRAM的资源受限设备上，通过细粒度重叠GPU执行与权重加载来降低内存占用并提升token生成吞吐。
- 实际贡献：实现了移动与嵌入式平台上的LeanStream原型，在同等最佳吞吐下将内存占用降低4.8–7.5倍，token生成吞吐提升1.6–2.1倍。
- 理由：尽管研究领域标注为定理证明，摘要与显著性均表明这是LLM推理的系统/部署优化工作（内存占用、权重卸载、GPU与I/O重叠），既不研究数学结果或证明，也不以数学理论改进AI训练或解释模型，故不属于ai4math或math4ai。

### `learning-to-plan-by-looking-back-hindsight-hierarchies-for-training-reasoning-models`

**Learning to Plan by Looking Back: Hindsight Hierarchies for Training Reasoning Models**

`ai4math → math4ai` · 置信度 0.75 · 来源 ingested

- 研究对象：面向推理模型的训练方法（ hindsight 想法抽取的自我改进循环），并在 Lean 交互式定理证明中给出具体实例化
- 核心目标：通过从已知解答中反向抽取解题想法并作为额外监督来改进推理模型的训练流程
- 实际贡献：提出一个联合训练三能力（预测想法、由问题+解答反推想法、用给定想法解题）的形式化训练算法及 Lean 实例化，但实证评估留待未来工作
- 理由：标题交付物是可复用的训练算法/自我改进循环，属于改进 AI 模型训练方法（类比 Math-Shepherd、MGE-PO 的定级），Lean 定理证明只是其数学场景的实例化而非证明器或形式化数学制品，故归为 math4ai。

### `learning-what-to-investigate-next-meta-reasoning-for-long-horizon-research-agents`

**Learning What to Investigate Next: Meta-Reasoning for Long-Horizon Research Agents**

`math4ai → none` · 置信度 0.68 · 来源 ingested

- 研究对象：一个名为 MIRA 的分层元推理框架及其 actor-critic 扩展 MIRA-AC，研究长时程研究型智能体的下一步调查决策与训练方法。
- 核心目标：把"接下来研究什么"变成显式策略并解决长时程稀疏延迟奖励下的信用分配与强化学习训练问题，而非解决某个数学猜想或定理。
- 实际贡献：交付了一个可复用的研究智能体元推理框架与生成式 actor-critic 训练方法，在定理证明、神经架构搜索等四个自动科研环境中提升性能，定理证明只是其中一个评测环境。
- 理由：核心交付物是通用科研自动化智能体方法（元推理策略、生成式 critic 信用分配、跨环境预训练），数学定理证明仅作为若干评测环境之一，属于无明确数学对象的通用 AI 研究自动化工作。

### `llm-feedback-research-papers-empirical-analysis`

**Can large language models provide useful feedback on research papers? A large-scale empirical analysis**

`math4ai → none` · 置信度 0.90 · 来源 seed

- 研究对象：一个对整篇论文PDF生成评审意见的GPT-4同行评审反馈流程及其大规模实证评估
- 核心目标：系统量化LLM生成的科研论文反馈是否能媲美人类同行评审，解决学术评审供给不足的问题
- 实际贡献：在3,096篇Nature系列论文和1,709篇ICLR论文上证明GPT-4与人类意见重合度（30.85%/39.23%）与人类间重合度（28.58%/35.25%）相当，并以308名研究者的用户研究量化其有用性
- 理由：研究对象是通用科研同行评审反馈系统，证据为“对3,096篇Nature系列期刊和ICLR论文的PDF生成评审意见”及用户研究，既不研究数学命题、证明或数学问题求解系统，也未提出用于AI的数学方法，按边界规则属一般科研自动化，归为none。

### `mags-multi-agent-auto-formalization-guarantees-safety-for-agentic-outputs`

**MAGS: Multi-agent Auto-formalization Guarantees Safety for Agentic Outputs**

`math4ai → none` · 置信度 0.72 · 来源 ingested

- 研究对象：一个多智能体编程框架MAGS，研究对象是让LLM生成的程序（CUDA内核、终端脚本、机械臂任务）通过自动形式化为Dafny并借助验证器反馈获得机器可检的安全保证。
- 核心目标：解决LLM编码智能体产出的代码难以人工审查、测试易漏边界情况的问题，端到端自动为agent生成的程序提供形式化安全保证，而非提升AI数学推理或证明数学定理。
- 实际贡献：交付了一个把生成代码形式化为Dafny验证感知中间表示、按验证器反馈修复并编译回可执行代码的系统，在220个示例上100%产出带安全保证的程序，并指出保证强度受限于形式化规范的完整性。
- 理由：决定性证据是摘要中“produces executable programs carrying machine-checked formal safety guarantees”“Evaluated on 100 CUDA kernels, 100 terminal scripts, and 20 robotic-arm tasks”，研究对象是软件程序而非数学结果或形式化数学语料，核心目标是agent生成代码的安全性验证，属于AI for软件安全/科研自动化而非ai4math或math4ai。

### `map-users-and-mapmakers-the-scope-of-cognitive-attribution-from-acquired-representations`

**Map Users and Mapmakers: The Scope of Cognitive Attribution from Acquired Representations**

`math4ai → none` · 置信度 0.75 · 来源 ingested

- 研究对象：关于认知能力归属的哲学/概念框架，研究对象是使用其自身未产生的表征的AI系统的认知能力归属问题（以地图与范畴示例及Othello-GPT为案例）
- 核心目标：区分系统使用表征所能证实的能力与未经证实的断言，为解释者给模型分配认知功劳提供一套分类框架，而非改进AI的数学推理或用数学理论解释AI模型
- 实际贡献：提出五项归属表（有效追踪、应用已获结构、从显式规范习得、从识别性观察习得、保留与复用），并将其应用于Othello-GPT的世界模型解读，附录仅有简短形式证明作为示例
- 理由：该工作的核心交付是认知归属的概念/哲学框架，用于解释Othello-GPT等模型的认知功劳归属，属于AI表征解释与心智哲学问题，既未自动证明定理或发现数学猜想，也未用数学理论改进或解释AI模型，附录的短证明仅为示例而非贡献主体，故归为none。

### `maple-symbolic-computation-system`

**Maple offers portable interactive symbolic computation**

`ai4math → none` · 置信度 0.75 · 来源 seed

- 研究对象：Maple 交互式符号计算系统（计算机代数系统）及其多项式与微积分算法
- 核心目标：打造便携高效的通用符号计算工具，使符号代数与微积分交互计算不再依赖大型昂贵机器
- 实际贡献：交付了可移植的符号计算系统、高效多项式与微积分算法以及交互式用户语言，成为1980年代主流通用计算机代数系统之一
- 理由：研究对象是确定性的计算机代数系统与符号算法，交付物是数学软件工具而非 AI 数学推理、自动猜想/证明或面向 AI 的数学方法；摘要与意义均强调“interactive symbolic algebra and calculus”“tool for symbolic mathematics”，不含 AI 成分，故归 none。

### `math2visual-x-a-modular-framework-for-pedagogically-aligned-lower-primary-math-visuals-generation`

**Math2Visual-X: A Modular Framework for Pedagogically Aligned Lower-Primary Math Visuals Generation**

`math4ai → ai4math` · 置信度 0.70 · 来源 ingested

- 研究对象：Math2Visual-X：一个面向小学低年级数学应用题的符号化教学可视化生成框架，包含LLM路由层、三个制图模块与两个SVG素材获取回退机制。
- 核心目标：解决端到端文生图系统无法满足精确数学约束、纯符号系统覆盖问题过少的问题，自动大规模生成符合数学约束与教学规范的示意图。
- 实际贡献：交付了一个可扩展、可控、覆盖更广的数学图形自动生成框架，并在人工评测中优于Stable Diffusion XL、Nano Banana与GPT Image等文生图系统。
- 理由：研究对象是数学应用题及其可视化表示这一数学专属产物，交付的是数学教学工具链中的专用生成框架而非通用AI方法，按边界规则数学专属产物归入ai4math；但其核心目标并非直接提升AI数学推理或证明能力，故置信度中等。

### `mathematical-proof-assistants-for-teaching-logic-the-logikey-methodology`

**Mathematical Proof Assistants for Teaching Logic: The LogiKEy Methodology**

`ai4math → none` · 置信度 0.85 · 来源 ingested

- 研究对象：以经典高阶逻辑为通用元逻辑、用 Isabelle/HOL 等证明助手统一编码并比较多种对象逻辑的 LogiKEy 逻辑教学方法论
- 核心目标：为计算机科学、数学与哲学混合背景学生提供一套经过十余年验证的逻辑教学法，用形式语义与证明助手工具讲解并比较不同逻辑
- 实际贡献：交付了一套分层示例序列（说谎者谜题到模态逻辑、智者谜题到动态认知逻辑、Boolos 推理、Chisholm 悖论到道义逻辑、哥德尔本体论论证）的教学方法与课程经验，而非 AI 推理系统或面向 AI 的数学方法
- 理由：工作对象是逻辑教学法与证明助手在课堂中的使用，核心目标是逻辑教育而非改进 AI 的数学推理或用数学改进 AI；按决策表属于“以上皆非”，且交付物是教学经验而非数学专门产物或可复用 AI 方法。

### `mathematical-reasoning-via-self-supervised-skip-tree-training`

**Mathematical Reasoning via Self-supervised Skip-tree Training**

`math4ai → ai4math` · 置信度 0.75 · 来源 ingested

- 研究对象：在形式化数学公式上训练的语言模型及其自监督训练目标（skip-tree）与若干数学推理评测任务
- 核心目标：研究自监督语言建模能否提升模型在形式数学上的逻辑推理能力，即改进AI的数学推理
- 实际贡献：提出了新的skip-tree自监督训练任务与类型推断、补全假设、等式补全、猜想生成等推理评测基准，表明该训练目标使模型数学推理显著优于标准skip-sequence训练，并以可证明性与证明可用性评估机器生成猜想
- 理由：核心目标与交付物均是面向形式数学的数学专用模型与数学推理基准（‘a math-specialized artifact … math model, math dataset or benchmark -> ai4math’），skip-tree训练目标是提升数学推理的手段而非通用AI训练方法，故归入ai4math；因交付物混合故置信度0.75。

### `mathematical-word-problem-generation-from-commonsense-knowledge-graph-and-equations`

**Mathematical Word Problem Generation from Commonsense Knowledge Graph and Equations**

`math4ai → ai4math` · 置信度 0.65 · 来源 ingested

- 研究对象：一个从常识知识图谱与符号方程生成数学应用题的神经生成模型及其发布的MWP数据集
- 核心目标：自动生成保持方程运算且贴合主题的多样数学应用题，以规模化产出情境化的测评题目
- 实际贡献：交付了融合Levi图表示与自规划模块的端到端应用题生成模型，并公开发布代码与MWP数据集，在BLEU-4、ROUGE-L、Self-BLEU及人工评测上超越SOTA
- 理由：核心交付物是数学应用题（含方程运算的数学内容）生成模型与公开的数学应用题数据集，属数学专属工件（math dataset），与ASDiv类语料同归ai4math；但其目的是教育测评题目生成而非提升AI数学推理，故置信度中等。

### `mechbench-can-ai-scientific-agents-discover-mechanisms-beyond-phenomenal-laws`

**MechBench: Can AI Scientific Agents Discover Mechanisms Beyond Phenomenal Laws?**

`math4ai → none` · 置信度 0.65 · 来源 ingested

- 研究对象：一个面向科学智能体的基准 MechBench，研究对象是科学机制发现（从观测数据与现象律中恢复生成机制）而非数学定理、证明或形式语料。
- 核心目标：衡量智能体能否超越拟合现象律、真正发现科学机制，属于通用 AI-for-science 的科学发现能力评估，而非证明数学结果或改进 AI 的数学推理。
- 实际贡献：交付了一个通过受控变异构造、以内部后果探针测量机制恢复的科学机制发现基准，并用实验证明现象律准确率与机制准确率之间存在显著泛化缺口。
- 理由：摘要通篇对象是科学机制与现象律（scientific agents、mechanistic model、phenomenal law），没有数学定理、证明、猜想或面向形式证明器的工具链，也不提供用于 AI 的数学方法；按边界规则“无数学对象且无面向 AI 的数学方法的 AI-for-science 工作”归为 none。

### `mlr-bench-evaluating-ai-agents-open-ended-research`

**MLR-Bench: Evaluating AI Agents on Open-Ended Machine Learning Research**

`math4ai → none` · 置信度 0.90 · 来源 seed

- 研究对象：一个面向开放式机器学习研究任务的基准（MLR-Bench：201道取自NeurIPS/ICLR/ICML workshop的研究任务）、自动审稿人MLR-Judge与模块化agent scaffold（MLR-Agent）
- 核心目标：衡量AI研究代理产出的机器学习实验结果是否可靠、可复现，而非改进数学推理或用数学方法改进AI
- 实际贡献：交付了一个ML研究基准与经专家校验的评审器，并量化出编码代理约80%的实验结果是捏造或不成立的
- 理由：研究对象是机器学习研究任务与评审流程，无数学对象、也未提供用于改进AI的数学方法；边界规则明确『通用AI科研自动化且无数学对象或数学方法→none』。

### `modern-software-engineering-with-verification-agents-a-spec-first-architecture-for-autonomous-synthesis-verification-irs-and-organizational-scale`

**Modern Software Engineering with Verification Agents: A Spec-First Architecture for Autonomous Synthesis, Verification IRs, and Organizational Scale**

`ai4math → none` · 置信度 0.75 · 来源 ingested

- 研究对象：一种面向软件工程的规范优先架构，由自主代理同时生成实现代码、形式规范与机械证明，并引入验证中间表示（VIR）与外延计算类型论规范层
- 核心目标：解决自主编码代理在大规模软件系统中的形式化验证与组织集成成本问题，而非解决数学定理证明或AI模型的数学性质问题
- 实际贡献：交付了一套面向软件工程的端到端架构（规范优先栈反转、CI门控流程、VIR与验证翻译器、Personal Spec-Copilots与共享合成舰队），并以零拷贝认证消息系统为例说明
- 理由：研究对象是软件工程的形式化验证架构而非数学结果、证明或数学问题求解系统，摘要与意义均强调“agent-authored, formally verified software engineering”与“cutting verification and integration costs”，属于面向软件的形式化工具链而非数学工具链，也不含面向AI的数学方法。

### `multi-aspect-runtime-verification-for-simulation-based-v-and-v-of-llm-enabled-autonomous-agents`

**Multi-Aspect Runtime Verification for Simulation-Based V&V of LLM-Enabled Autonomous Agents**

`math4ai → none` · 置信度 0.85 · 来源 ingested

- 研究对象：面向LLM自主智能体的多方面运行时验证框架及其策略合规监测实验
- 核心目标：在无法重训模型的条件下为国防场景中的LLM智能体强制执行自然语言策略义务、阻断多步工具攻击
- 实际贡献：交付了一个把策略条款分解为类型化空间/时间/语义三元组并通过四值代数融合判定的运行时监控框架（含MonPoly一致性实验与零攻击成功率的实验结果），其中“空间义务不被一阶时序逻辑子sume”的定理只是辅助论证
- 理由：研究对象是AI智能体的策略合规运行时验证与安全护栏，既不研究数学结果或数学问题求解系统，也不以数学方法改进AI；其时序逻辑不可子sume性只是支撑性论断，故归为none。

### `multimodal-ai-detection-for-math-heavy-scientific-text`

**Multimodal AI Detection for Math-Heavy Scientific Text**

`math4ai → none` · 置信度 0.85 · 来源 ingested

- 研究对象：面向数学密集型科学文本的 AI 生成内容检测数据集与检测模型（含 LaTeX、PDF 渲染图与抽取文本三种表示的配对语料，以及图像检测器 SnapJudge）。
- 核心目标：解决数学材料上 AI 生成文本检测性能下降的问题，通过领域微调和基于页面图像的检测恢复可靠的 AI 内容识别。
- 实际贡献：构建了人写/LLM 生成的配对数学文本语料并训练 SnapJudge 图像检测器，在 0.1% 误报率下检出 92% 的证明与 93% 的散文 AI 生成内容，显著优于 Pangram 4 与文本检测器。
- 理由：该工作的核心目标是 AI 生成内容检测（AI detection），属于科学写作透明性与内容鉴别问题，既不改进 AI 的数学推理、也不自动发现或证明数学结论，且其数学文本仅是检测域；边界规则中“通用 AI 研究自动化或无数学对象的 AI-for-science 工作”归为 none。

### `navier-stokes-lost-in-translation-why-lean-verification-of-ai-autoformalisation-does-not-guarantee-correct-natural-language-proofs`

**Navier-Stokes lost in translation: Why Lean verification of AI autoformalisation does not guarantee correct natural language proofs**

`ai4math → math4ai` · 置信度 0.72 · 来源 ingested

- 研究对象：AI自动形式化管线（自然语言数学到Lean的翻译）及其语义忠实性问题
- 核心目标：用数学理论（Solvability Complexity Index层级）解释AI自动形式化翻译为何无法保证正确性，即解释AI模型/管线的数学性质与根本局限
- 实际贡献：证明将自然语言数学翻译为Lean须消解歧义、该问题在SCI层级中处于任意高阶（SCI=∞，难于停机问题），并以OpenAI的Navier-Stokes爆破解为例展示Lean验证通过的证明与自然语言论证并不对应
- 理由：交付物是对自动形式化这一AI过程的数学分析与不可能性结论（SCI=∞），而非数学成果、prover或数学语料；按边界规则“用数学理论解释AI模型性质→math4ai”，尽管例子涉及Lean验证工具链，核心仍是揭示AI翻译的语义忠实性障碍。

### `neusoga3d-a-neuro-symbolic-framework-for-explainable-3d-geometric-reconstruction`

**NeuSOGA3D: A Neuro-Symbolic Framework for Explainable 3D Geometric Reconstruction**

`math4ai → none` · 置信度 0.70 · 来源 ingested

- 研究对象：研究对象是一个名为 NeuSOGA3D 的神经符号三维几何重建系统，它把无组织点云转成显式符号几何表示（隐式样条场、控制多边形、截面与体 loft）。
- 核心目标：核心目标是从点云重建出可解释、可被 CAD/工程复用的显式符号三维形状表示，以克服神经隐式表示可解释性与复用性的局限。
- 实际贡献：实际交付的是一个三维几何重建框架及在 ModelNet40 全部 40 类上的实验结果，产出 CAD 兼容的符号几何表示，而非数学定理证明、猜想发现或面向 AI 的数学方法。
- 理由：文中对象是点云到符号几何的重建系统（三维视觉/几何建模），既非改进 AI 数学推理或自动证明/发现，也非用数学理论改进 AI 算法本身，按边界规则属于无明确数学对象的 AI 应用工作。

### `pal-program-aided-language-models`

**PAL: Program-aided Language Models**

`math4ai → ai4math` · 置信度 0.75 · 来源 seed

- 研究对象：PAL：一种让大模型输出程序、由 Python 解释器执行的数学推理系统
- 核心目标：改进大模型的数学推理能力，解决自然语言分步推理中出现的算术与逻辑错误
- 实际贡献：提出 Program-Aided Language 方法，把计算步骤交给 Python 解释器执行，在 GSM8K 上以少样本准确率超过 CoT PaLM-540B 达 15% 绝对值，并在 13 个数学、符号与算法推理任务上验证
- 理由：核心交付物是一个面向数学推理的问题求解系统（LLM 分解 + 程序运行时执行），而非通用 AI 训练或理论方法；其定位是“针对数学推理的工具集成方法”，类似 Minerva/工具型解题系统归入 ai4math，但因同时覆盖符号与算法任务、方法具有一定通用性，故置信度取中高。

### `pcm-a-proof-carrying-message-protocol-for-verifiable-multi-agent-communication`

**PCM: A Proof-Carrying Message Protocol for Verifiable Multi-Agent Communication**

`math4ai → none` · 置信度 0.85 · 来源 ingested

- 研究对象：多智能体通信协议PCM的规范与安全属性，包括证据锚定消息、三值判定、授权链及抗欺骗评测
- 核心目标：解决AI智能体通信中被入侵或提示注入的发送方伪造事实与授权的问题，而非提升AI数学推理或用数学改进AI
- 实际贡献：交付了一个形式化规范的智能体间通信协议及其安全性质证明，并在926条真实消息基准上验证抗欺骗性能（仅接受10条谎言），属于智能体安全/协议工程成果
- 理由：研究对象是多智能体可信通信协议而非数学结果或数学问题求解系统，核心目标是防范智能体间欺骗与伪造授权，虽有形式化规范与安全性质证明，但不属于数学化AI推理（ai4math）或用数学方法改进AI模型（math4ai）。

### `permit-securing-persistent-memory-for-llm-agents-via-machine-checked-integrity-theorems-and-scalable-community-trust`

**PerMIT: Securing Persistent Memory for LLM Agents via Machine-Checked Integrity Theorems and Scalable Community Trust**

`math4ai → math4ai` · 置信度 0.65 · 来源 ingested

- 研究对象：面向LLM智能体持久记忆的安全架构PerMIT，其核心是记忆接口上两条经Lean 4机器核验的完整性定理
- 核心目标：用形式化定理与可审计门控设计来防止记忆投毒与注入、提升LLM智能体系统的安全与可扩展协作
- 实际贡献：交付了带机器核验完整性定理的智能体记忆架构及其在Trojan Hippo与τ²-bench上的安全与社区共扩展结果，形式证明是保障AI系统的手段而非数学成果本身
- 理由：工作对象是LLM智能体记忆系统而非数学定理或数学推理，Lean机器核验的完整性定理作为数学/形式化方法被用于改进AI算法与系统，故归入math4ai；因交付物偏工程系统而置信度中等。

### `practice-makes-a-solver-perfect-data-augmentation-for-math-word-problem-solvers`

**Practice Makes a Solver Perfect: Data Augmentation for Math Word Problem Solvers**

`math4ai → ai4math` · 置信度 0.78 · 来源 ingested

- 研究对象：数学应用题（MWP）求解器及其训练数据集，具体为面向MWP的数据增强方法
- 核心目标：通过系统性数据增强扩大数据规模与多样性，提升MWP求解器的泛化与鲁棒性，即改进AI的数学解题能力
- 实际贡献：提出替换类与改写类两类数据增强技术将数据集扩充五倍，在两个基准与三个SOTA求解器上带来平均5个百分点以上的泛化与鲁棒性增益，并辅以消融与人工评估
- 理由：核心交付物是面向数学应用题的增强数据集与更强的MWP求解器，属数学专用产物；数据增强在此服务于数学问题求解这一目标，而非通用AI训练方法，故按标题交付归入ai4math。

### `predicting-algorithm-classes-for-programming-word-problems`

**Predicting Algorithm Classes for Programming Word Problems**

`math4ai → none` · 置信度 0.60 · 来源 ingested

- 研究对象：编程应用题的算法类别预测任务及其四个分类数据集
- 核心目标：构建文本分类基准以衡量模型从自然语言题目推断所需算法类别的能力
- 实际贡献：发布四套算法类别分类数据集与代码，并给出最高62.7%准确率的分类结果
- 理由：对象是编程竞赛题与算法类别分类，属编程/代码推理而非数学定理或数学方法，不落入ai4math或math4ai。

### `proiqa-a-process-based-framework-for-fine-grained-math-item-quality-assessment`

**ProIQA: A Process-Based Framework for Fine-Grained Math Item Quality Assessment**

`math4ai → ai4math` · 置信度 0.70 · 来源 ingested

- 研究对象：一个面向自动数学题目生成（AIG）输出质量的评估框架与过程增强数据集，包含基于LLM构建的推理树、GNN编码及双视图Stem+Solving模型
- 核心目标：为自动生成的数学题目提供细粒度、过程感知的质量评估（知识点、难度、学科素养三维），以替代人工审核或浅层题干指标
- 实际贡献：交付了过程增强的数学题目数据集与ProIQA评估方法（LLM推理树+GNN+双视图融合），在K12数学数据上验证其能捕捉过程性特征并为AIG输出提供可扩展的评估信号
- 理由：标题明确为“math item quality assessment”，且交付物是数学专用数据集与数学题目质量评估工具，属于数学工具链/数学数据资产；边界规则指出数学专用产物（如math dataset或benchmark）归ai4math（类似ASDiv判例），但因其更偏教育数据质量控制而非直接提升AI数学推理，置信度取0.7

### `proof-carrying-contracts-commitments-ai-agents-cannot-break`

**Proof-Carrying Contracts: Commitments AI Agents Cannot Break**

`math4ai → none` · 置信度 0.70 · 来源 ingested

- 研究对象：一个名为Proof-Carrying Contracts（PC2）的AI智能体安全验证框架及其执行系统Airlock，要求智能体为每次操作提交可机器检查的约束保持证明。
- 核心目标：通过形式化证明义务而非权限策略，保证AI智能体在执行全程（包括对抗性智能体）不违反各方约定的约束。
- 实际贡献：交付了PC2框架、Airlock验证执行系统、约束始终成立的证明以及可复用能力模块，用于智能体间无需互信的合约执行与合规保障，而非数学定理、证明器或数学推理能力。
- 理由：该工作研究对象是智能体合规/安全的形式化验证工程系统，证明只是强制执行合约的手段；既不提升AI数学推理，也不以数学理论改进AI算法，按边界规则属于无数学对象的AI安全与智能体治理工作。

### `proof-gated-signing-solver-checked-transaction-guards-that-hold-under-state-drift-for-onchain-ai-agents`

**Proof-Gated Signing: Solver-Checked Transaction Guards that Hold Under State Drift for Onchain AI Agents**

`math4ai → none` · 置信度 0.70 · 来源 ingested

- 研究对象：面向控制钱包的链上 AI 智能体的交易签名前防御机制 Proof-Gated Signing（用 SMT 求解器校验策略并编译链上后置条件）
- 核心目标：防止交易在检查时与执行之间的状态漂移被对手利用、从而避免 AI 智能体被攻击者套利或抽干，属于智能体安全与鲁棒性问题
- 实际贡献：交付了一个在 260 个场景（14 个攻击族）上评测的防御系统，阻止 93.6% 有害场景、97.5% 通过良性场景，且全部 50 个漂移场景零攻击者收益
- 理由：该工作对象是链上交易签名安全防护系统，既不研究数学结果/证明，也不改进 AI 的数学推理或用数学理论改进 AI 算法；SMT 求解器只是形式化校验交易策略的工具，属于区块链/智能体安全工程，故归为 none。

### `proof-grounded-patient-specific-clinical-explanations-from-knowledge-graph-reasoning`

**Proof-Grounded Patient-Specific Clinical Explanations from Knowledge-Graph Reasoning**

`math4ai → none` · 置信度 0.85 · 来源 ingested

- 研究对象：研究对象是一个临床知识图谱推理的下游解释引擎，把患者推理状态和疾病知识转化为带类型的事实、规则应用追踪与溯源结论。
- 核心目标：目标是为临床决策支持生成可审计、可验证的患者特异性解释与建议，而非证明数学定理、发现数学规律或改进AI模型训练/解释。
- 实际贡献：交付物是CKG临床解释引擎及大规模评测结果（100%溯源、100%数值保真、99.7%表示一致性），是临床知识图谱推理工具而非数学成果或数学方法。
- 理由：尽管归入“Mathematical Reasoning & LLMs”领域，但研究对象与交付物都是临床知识图谱推理与解释系统，既无数学对象（定理、证明、猜想），也无用于AI的数学方法，属于面向临床的AI/科学自动化工作。

### `proof-of-agentness-towards-verifying-agents-on-the-web`

**Proof-of-Agentness: Towards Verifying Agents on the Web**

`math4ai → none` · 置信度 0.95 · 来源 ingested

- 研究对象：Web 服务端用于判定客户端是 LLM 智能体而非普通脚本/机器人的验证机制（Proof-of-Agentness）及其主动与被动评估
- 核心目标：解决 Web 服务区分智能体与恶意自动化的资源分配与反滥用问题，而非改进 AI 数学推理或用数学解释 AI 模型
- 实际贡献：提出主动挑战-响应与被动信号分析两种 PoA 方案，并给出八个语言模型 96.5% 准确率、1647 token 开销以及 12 名被试、四分类器 95.8% 准确率的经验性小规模评估结果，未交付任何数学成果或面向 AI 的数学方法
- 理由：尽管标注的研究领域为 Mathematical Reasoning & LLMs，全文对象是 Web 端智能体识别与反滥用机制，摘要与意义均围绕验证与分类准确率，无任何数学对象、形式化证明或用于 AI 的数学理论，故归为 none。

### `proofpaths-an-ai-agent-framework-for-assessing-student-reasoning`

**ProofPaths: An AI Agent Framework for Assessing Student Reasoning**

`ai4math → none` · 置信度 0.78 · 来源 ingested

- 研究对象：一个由多个评分智能体与访谈智能体组成的数学推理作业自动评估框架，研究对象是学生数学解答的评分与理解验证流程而非数学定理或AI推理机制本身
- 核心目标：通过多智能体批判修订式评分与证据关联的交互访谈，自动评估学生是否真正理解其解题推理，从而减轻教师逐个访谈的工作量
- 实际贡献：交付了一个面向数学教育评估的智能体系统，包含评分评审、访谈记录、可审计的过程跟踪与教师覆盖评分功能，并配有评估控制器的确定性测试
- 理由：该工作既不改进AI自身的数学推理、也不做定理自动证明或猜想发现，更未用数学理论改进AI算法，其交付物是面向教学评估的AI智能体工具，属于AI-for-education而非ai4math或math4ai。

### `re-bench-frontier-ai-rd-vs-human-experts`

**RE-Bench: Evaluating frontier AI R&D capabilities of language model agents against human experts**

`math4ai → none` · 置信度 0.95 · 来源 seed

- 研究对象：七个开放式机器学习研究工程环境构成的AI研发能力评测基准
- 核心目标：评估语言模型智能体自动化AI研发的能力并与人类专家直接对比，以支撑AI安全政策制定
- 实际贡献：交付七个ML研究工程环境、71次人类专家基线数据及智能体轨迹的开源评测集，量化智能体在短时间预算下超越人类、长时间预算下人类占优
- 理由：工作对象是通用AI研发自动化评测，无数学对象、也无面向AI的数学方法，边界规则明确将RE-Bench归为none。

### `reality-is-the-final-verifier-on-two-key-gaps-in-agentic-software-engineering`

**Reality Is the Final Verifier: On Two Key Gaps in Agentic Software Engineering**

`math4ai → none` · 置信度 0.92 · 来源 ingested

- 研究对象：该立场论文研究的是智能体软件工程中的实现-验证循环，提出需求鸿沟与模型鸿沟的两鸿沟框架
- 核心目标：目标是解释奖励黑客与幻觉的共同结构成因，并提出以部署证据修订需求、模型与评估器的保障-修订循环
- 实际贡献：实际交付的是一个关于智能体软件工程的概念框架与研究议程，而非任何数学成果或面向AI的数学方法
- 理由：全文以软件工程中的需求规格、部署环境建模与保障循环为对象，明确指出“实际部署行为是最终验证者”，未涉及数学定理、猜想、形式化语料，也未提出用于改进AI的数学理论，按边界规则属于通用AI科研自动化工作

### `reasoning-with-evidence-not-merely-rationales-verifiable-preference-proofs-for-llm-based-recommendation`

**Reasoning with Evidence, Not Merely Rationales: Verifiable Preference Proofs for LLM-Based Recommendation**

`math4ai → none` · 置信度 0.90 · 来源 ingested

- 研究对象：LLM推荐系统中的理由（rationale）生成与验证机制，即偏好证明（preference proof）与其对排序影响的可验证性。
- 核心目标：解决LLM推荐中理由与证据脱节、理由对最终排序无因果影响的可靠性问题，使推荐理由成为可验证组件，而非提升AI数学推理或用数学理论改进AI。
- 实际贡献：提出PRO-REC两阶段框架及基于掩码与主张移除的grounding与influence验证目标，并在真实推荐数据集上相对顺序式、生成式与LLM增强基线取得最高7.45%的提升。
- 理由：研究对象是推荐系统的理由生成与排序预测，交付物为推荐框架与验证目标，虽标注于数学推理领域，但摘要与贡献中无数学对象、定理、形式化语料，也没有为AI算法提供数学方法或理论，属于一般AI/推荐可靠性工作。

### `representation-theorems-for-actual-powers-over-two-agent-general-concurrent-game-frames`

**Representation Theorems for Actual Powers over Two-Agent General Concurrent Game Frames**

`ai4math → none` · 置信度 0.92 · 来源 ingested

- 研究对象：数学结果：两智能体一般并发博弈框架中实际能力（actual power）相对于邻域框架的表示定理
- 核心目标：将 van Benthem、Bezhanishvili 与 Enqvist (2019) 的表示定理推广到放宽串行性、独立性与确定性的八类博弈框架，证明其在实际能力语义下的对应刻画
- 实际贡献：论文在两智能体假设下证明八类一般并发博弈框架分别被八类邻域框架以实际能力表示，保留了 alpha 效力性抹掉的动作级信息
- 理由：该工作是模态逻辑/联盟博弈语义中的纯数学表示定理证明，研究对象为博弈框架与邻域框架的对应关系，其核心目标是刻画战略能力的逻辑语义，并不涉及改进 AI 数学推理、自动发现/证明数学结论，也不涉及用数学理论改进 AI 算法或解释 AI 模型，故归为 none。

### `researchagent-iterative-idea-generation`

**ResearchAgent: Iterative Research Idea Generation over Scientific Literature with Large Language Models**

`math4ai → none` · 置信度 0.90 · 来源 seed

- 研究对象：一个基于学术图谱与概念库的科研想法生成与迭代评审多智能体系统（ResearchAgent）
- 核心目标：自动化地从科学文献中生成并迭代改进研究问题、方法与实验设计的想法
- 实际贡献：交付了一个通用的文献驱动科研构想生成与多评审智能体修订系统，并在多个学科上做人类与模型评估，未针对数学对象或数学方法
- 理由：边界规则明确：'The AI Scientist' 类通用 AI 研究自动化工作若无数学研究对象也无面向 AI 的数学方法即为 none；本工作对象是通用科研想法生成系统，评估横跨多学科而非数学成果。

### `resolve-language-agnostic-validation-of-gpu-kernels-through-testing-reduction-and-proof`

**RESOLVE: Language-Agnostic Validation of GPU Kernels Through Testing, Reduction, and Proof**

`math4ai → none` · 置信度 0.80 · 来源 ingested

- 研究对象：GPU内核功能等价性验证流水线（含二进制插桩测试、并发归约改写与F*/Pulse形式化证明）
- 核心目标：消除数值容差、跨语言地严格验证AI生成/优化的GPU内核是否与参考实现计算同一函数并定位修复bug
- 实际贡献：在KernelBench上证明了CUTLASS、Triton、Gluon融合GEMM的等价性并发现并修复了四个此前未报告的问题，交付的是面向GPU代码的工程化验证工具而非数学成果或改进AI的数学方法
- 理由：工作对象是GPU内核代码而非数学定理、数学问题求解系统或AI模型的数学性质，其形式证明只是验证硬件代码等价性的手段，属于工程/工具自动化，既不提升AI数学推理（ai4math）也不用数学理论改进AI（math4ai）。

### `saltbench-a-referee-gated-protocol-for-measuring-method-effects-in-machine-checked-software-work`

**SaltBench: A Referee-Gated Protocol for Measuring Method Effects in Machine-Checked Software Work**

`math4ai → none` · 置信度 0.75 · 来源 ingested

- 研究对象：一个评估协议与基准（SaltBench），研究对象是被机器裁判（证明内核、程序验证器或留出测试集）约束的编码智能体在软件验证任务中的行为。
- 核心目标：测量'指定并验证代码'这类方法对编码智能体行为与成本的影响，而非推进数学定理证明或为AI提供数学方法。
- 实际贡献：交付了一个带隔离墙、注册预测冻结和预算停机的评测协议，并在5个Rust/Verus系统组件上给出成本溢价与后验通过率的统计读数；其对象是机器检查的软件工作而非数学结果。
- 理由：核心对象是Verus上的软件组件与编码智能体，裁判含留出测试集，属于软件工程评测；摘要与显著性强调的是'分离智能体工具链与计分的协议'与成本溢价量化，未提供数学定理、形式化数学语料或面向AI的数学方法，故归为none。

### `sciagents-multi-agent-graph-reasoning-discovery`

**SciAgents: Automating scientific discovery through multi-agent intelligent graph reasoning**

`math4ai → none` · 置信度 0.90 · 来源 seed

- 研究对象：面向生物启发材料科学发现的多智能体LLM系统与本体知识图谱推理框架
- 核心目标：通过多智能体结合本体知识图谱自动提出并迭代科学假设，实现通用科研发现自动化
- 实际贡献：在生物启发材料领域自动生成并提炼机制级研究假设与设计原则，揭示此前被认为无关的跨学科关联
- 理由：工作对象是通用科学发现自动化（生物启发材料），既无数学成果或数学语料，也无面向AI的数学方法，按边界规则归为none，与“The AI Scientist”同类。

### `semiotic-relations-and-proof-methods-a-cross-genre-study-of-argument-structure-with-large-language-models`

**Semiotic Relations and Proof Methods: A Cross-Genre Study of Argument Structure with Large Language Models**

`math4ai → none` · 置信度 0.70 · 来源 ingested

- 研究对象：研究对象是间接证明的符号学框架，将四种符号关系（句段、范式、对立、转喻）对应到推理、类比、反证、分情况四类证明方法，并用大语言模型作为标注工具对数学、法律与日常论证语料进行标注分析。
- 核心目标：核心目标是建立证明方法的符号学类型学并实证考察不同体裁论证中这些关系的分布，而非改进AI的数学推理能力或用数学改进AI方法。
- 实际贡献：实际交付的是一套符号学-证明方法对应框架、四类关系的可操作定义，以及一个由LLM标注的跨体裁论证语料库，发现数学证明使用全部四类关系而其他体裁几乎只用推理。
- 理由：文中明确研究对象是论证结构与证明方法的符号学分类，大语言模型仅充当标注工具；既未提升AI数学推理，也未用数学理论改进AI算法或解释AI模型，故落在none。

### `sequence-informed-geometric-evaluation-of-rna-3d-structures`

**Sequence-Informed Geometric Evaluation of RNA 3D Structures**

`math4ai → none` · 置信度 0.90 · 来源 ingested

- 研究对象：一个用于 RNA 3D 结构候选评分的序列条件几何评估模型（SIRGE）
- 核心目标：提升 RNA 结构候选构象的排序与筛选可靠性，使评估同时考虑序列相容性与几何特征
- 实际贡献：交付了一个用预训练 RNA 语言模型核苷酸嵌入条件化的几何评估器，并在 Kendall-τ 对齐、Top-1 选择和 Top-3 排序上超过既有评估器
- 理由：该工作的研究对象是生物大分子结构评估 AI 模型，核心目标是改进 RNA 构象候选的排序选择，既非自动发现/证明数学结果，也未提出用于 AI 的数学方法或理论，属于 AI-for-science 范畴，故归为 none。

### `specguard-proving-a-task-is-broken-before-the-agent-cheats`

**SpecGuard: Proving a Task Is Broken Before the Agent Cheats**

`math4ai → none` · 置信度 0.75 · 来源 ingested

- 研究对象：一个面向软件工程任务的形式化验证工具：把任务意图与测试分别自动形式化为 Lean 4 规范，并用 Lean 内核检查二者是否存在任何实现可同时满足。
- 核心目标：在编码智能体行动之前检测并形式化认证任务意图与测试之间的冲突，从而封堵 reward-hacking 漏洞，属于智能体评测/工具链而非数学推理或数学理论问题。
- 实际贡献：在 SWE-bench 冲突任务上检测最多 72.8% 的冲突并给出 51.1% 的内核认证不一致证书，验证对象是软件任务规范而非数学定理或数学语料。
- 理由：虽然使用 Lean 4 自动形式化与内核检查，但研究对象和交付物是软件工程任务规范一致性证书与防作弊工具，既不证明数学定理或做数学推理（非 ai4math），也不用数学理论改进 AI 模型训练或解释模型性质（非 math4ai），故归为 none。

### `spera-spherical-prior-eeg-foundation-model-with-geometry-and-frequency-aware-latent-prediction`

**SPERA: Spherical Prior EEG Foundation Model with Geometry- and Frequency-Aware Latent Prediction**

`math4ai → none` · 置信度 0.90 · 来源 ingested

- 研究对象：SPERA：一种基于球面先验的 EEG 基础模型（JEPA 潜空间预测架构）
- 核心目标：提升 EEG 信号在临床、认知和 BCI 等下游任务上的表示与预测性能，而非研究数学定理、证明或数学理论
- 实际贡献：交付的是一个参数高效、跨设备稳健的 EEG 基础模型，在九项下游任务上取得最高平均平衡准确率，Legendre 多项式空间先验只是其注意力机制中的技术手段
- 理由：该工作研究对象是面向 EEG 的 AI 模型，目标与交付物均为提升神经信号建模与下游任务性能，不涉及数学推理、定理自动证明或用数学理论解释/改进 AI，故归为 none

### `studybench-can-self-evolution-squeeze-textbooks-for-olympiad-capability`

**StudyBench: Can Self-Evolution Squeeze Textbooks for Olympiad Capability?**

`math4ai → ai4math` · 置信度 0.75 · 来源 ingested

- 研究对象：StudyBench：一个用于衡量自演化方法把教材材料转化为可迁移解题能力效率的基准（含 Application Set 教材难题与 Transfer Set 竞赛级难题）。
- 核心目标：构建并测量一个用于评估 AI 数学/科学解题能力的基准，量化自演化训练方法的学习效率与迁移差距。
- 实际贡献：交付了 StudyBench 基准数据集（Application/Transfer 两套题目）及跨三个基座模型的评测结论：Application 增益很少迁移到 Transfer，且相对上下文指引存在 Guidance Gap、所有方法早早触及 Compute Plateau。
- 理由：核心交付物是衡量模型数学/科学解题能力的基准，按边界规则“仅测量模型性能的基准”归 ai4math（同 FrontierMath、MathVista）；摘要称其为物理基准而研究领域为几何，对象表述不完全一致，故置信度取 0.75。

### `swe-proof-can-language-models-resolve-real-world-issues-with-machine-checked-proofs`

**SWE-Proof: Can Language Models Resolve Real-World Issues with Machine-Checked Proofs?**

`math4ai → none` · 置信度 0.60 · 来源 ingested

- 研究对象：该工作研究的是真实软件仓库问题（SWE-bench Verified/Pro）的修复任务，交付物是把带已知正确补丁的编码任务转化为具有机器校验证明的基准 SWE-Proof 及其构建流水线 Benchproofer。
- 核心目标：核心目标是检验语言模型能否用机器校验证明解决真实世界 issue，并以形式化验证弥补测试套件正确性的不足、定位规格合成这一瓶颈。
- 实际贡献：实际交付的是一个软件工程领域的形式化验证基准与结论：约四分之一通过测试的补丁存在反例、正确形式规格可将解决率从 85% 提到 95%，并指出忠实规格合成是 AI 编码智能体的开放问题。
- 理由：研究对象是软件补丁正确性与编码智能体基准而非数学定理、猜想或数学语料；形式化证明在此服务于程序验证，属于 AI-for-software-engineering/研究自动化，按“无论文数学对象也无面向 AI 的数学方法则为 none”归类。

### `the-ar-fairness-metamodel-a-structured-framework-for-fairness-measures`

**The AR Fairness Metamodel: A Structured Framework for Fairness Measures**

`math4ai → none` · 置信度 0.80 · 来源 ingested

- 研究对象：一个由代理、资源及其属性构成的公平性度量元建模框架（AR fairness metamodel/Tiles），以及若干公平性度量的定义与形式化关系证明。
- 核心目标：为各类公平性度量提供统一的结构化词汇以系统地定义、比较和评估它们，而非改进AI数学推理或用数学方法改进AI。
- 实际贡献：交付了公平性场景的建模框架与开源 Tiles 实现，并以形式化证明确立群体公平、个体公平与无嫉妒性之间的关系。
- 理由：工作核心对象是公平性度量的形式化建模与比较（含 Gini、Theil、Jain 指数及儿童保育补贴示例），虽含形式证明与开源工具，但既不以数学推理/定理自动证明为目标，也不提供面向 AI 模型的数学方法或理论，故不属于 ai4math 或 math4ai。

### `trustedcode-evaluating-large-language-models-for-developing-trusted-code-through-automated-program-verification`

**TrustedCode: Evaluating Large Language Models for Developing Trusted Code through Automated Program Verification**

`math4ai → none` · 置信度 0.72 · 来源 ingested

- 研究对象：一个由 LLM 驱动的自动化程序验证框架（TrustedCode），用于对 AI 生成的 Python 代码做类型检查、经 Why3 翻译为 WhyML 并用后端定理证明器对照形式化规范做验证。
- 核心目标：为约三成由 AI 生成的 Python 代码建立可信性与正确性保证，即解决软件工程中的代码信任问题，而非推进数学推理或数学定理证明。
- 实际贡献：交付了开源的端到端 LLM 形式化验证流水线，并在十个 Python 程序上给出错误归因统计（50% 领域知识缺口、30% 语法错误、20% 语义与类型问题），未交付数学结果或面向数学的证明系统。
- 理由：研究对象是 AI 生成软件代码的正确性验证，目标是可信代码而非数学推理、数学定理自动证明或用数学理论改进 AI；虽用到 Why3/定理证明后端，但那是验证代码的手段，属通用软件验证，按边界规则归 none。

### `two-uncertainties-are-not-one-disagreement-versus-decision-risk-in-cheap-structured-content-moderation`

**Two Uncertainties Are Not One: Disagreement versus Decision-Risk in Cheap Structured Content Moderation**

`math4ai → none` · 置信度 0.80 · 来源 ingested

- 研究对象：针对内容审核场景中廉价冻结模型与前沿推理模型的不确定性与校准的独立审计评测研究
- 核心目标：通过配对bootstrap、校准评估与不确定性分解，设计一种成本敏感的评测方案以判断廉价结构化模型能否替代前沿大模型做高量二分类决策
- 实际贡献：交付的是内容审核模型的成本感知评测设计（配对bootstrap比较、校准评估、把‘置信度’分解为人标注分歧与决策风险两类不确定性），而非数学定理、形式化语料或面向AI的数学方法
- 理由：研究对象是内容审核AI模型的评测与不确定性信号，不含任何数学对象；其核心目标是模型替代性与决策风险的工程评测，既非改进AI数学推理（ai4math），也非用数学理论改进或解释AI模型（math4ai），尽管摘要提到数学推理研究领域标签，但交付内容与数学无关

### `verification-and-refinement-of-natural-language-explanations-through-llm-symbolic-theorem-proving`

**Verification and Refinement of Natural Language Explanations through LLM-Symbolic Theorem Proving**

`math4ai → ai4math` · 置信度 0.75 · 来源 ingested

- 研究对象：一个名为 Explanation-Refiner 的神经符号框架，用定理证明器对自然语言推理（NLI）中的解释性句子进行形式化验证与迭代改进。
- 核心目标：借助定理证明器检查 LLM 生成解释的逻辑有效性并自动纠正、改进解释与推理质量，属于用形式化证明/验证来改进 AI 推理能力的方向。
- 实际贡献：交付了结合 LLM 与定理证明器的解释生成、自动形式化、错误修正与反馈精炼流水线，并以此自动评估和提升 LLM 的解释推理质量。
- 理由：工作核心是把 LLM 生成的推理解释锚定到定理证明器的形式化验证上，交付的是面向形式证明工具链的验证/自动形式化/精炼方法，与 Autoformalization、LeanDojo 一类归入 ai4math；但其评测对象是 NLI 而非纯数学命题，故置信度取中高而非 0.9 以上。

### `veripie-checkable-query-plans-and-evidence-guided-selection-for-text-to-sql`

**VeriPIE: Checkable Query Plans and Evidence-Guided Selection for Text-to-SQL**

`math4ai → none` · 置信度 0.78 · 来源 ingested

- 研究对象：VeriPIE 是一个 Text-to-SQL 神经符号框架，研究对象是自然语言到 SQL 查询的生成、检查与候选选择流程，其中 QuerySketch 计划语言的检查用 Lean 实现。
- 核心目标：最终要解决的是提升 Text-to-SQL 系统的执行/测试套件准确率与候选覆盖率，同时暴露畸形计划与候选间的隐藏分歧。
- 实际贡献：交付了带 Lean 实现的计划检查与修复诊断、执行一致性与区分数据库有界搜索的候选选择方法，并在 Spider 上取得 72.05% 测试套件准确率、在 BIRD 上取得 68.90% 执行准确率，超过 DeepEye、DIN-SQL 等基线，但明确不证明与用户意图一致。
- 理由：该工作的核心对象与交付物是数据库查询生成系统及其评测结果，Lean 仅被用作查询计划检查的实现工具，并非数学定理、证明、形式化数学语料或面向 AI 的数学方法，因此不落在 ai4math 或 math4ai 的任一方向。

### `what-masking-geometry-works-best-for-eeg-foundation-models`

**What masking geometry works best for EEG foundation models?**

`math4ai → none` · 置信度 0.72 · 来源 ingested

- 研究对象：研究对象是EEG基础模型自监督预训练中的时空掩码（masking）策略及其对下游线性探测性能的影响。
- 核心目标：核心目标是隔离掩码几何这一变量、厘清其对预训练的影响并给出实践指导，属于改进AI模型训练方法而非数学推理。
- 实际贡献：实际交付的是在单一管线、两种自监督框架（MAE与JEPA）下58个模型的系统消融结论、最优掩码配置、JEPA特有的bias-inflation坍缩失效模式以及更省算力达到REVE级下游性能的预训练配方。
- 理由：工作对象是EEG神经科学基础模型的预训练掩码消融，既无数学结果、证明或形式化语料等数学对象，也没有用数学理论改进AI算法，仅是面向AI-for-science的实证训练方法研究，按边界规则归为none。

### `what-the-machine-invented-mining-new-mathematical-instruments-from-openai-s-october-2026-release-of-ai-generated-mathematics`

**What the Machine Invented: Mining New Mathematical Instruments from OpenAI's October 2026 Release of AI-Generated Mathematics**

`ai4math → ai4math` · 置信度 0.65 · 来源 ingested

- 研究对象：OpenAI 2026年10月发布的722篇AI撰写数学手稿语料（372个问题族）中被抽取的新引理、构造、不等式与证明机制（作者称为mathematical instruments）
- 核心目标：从AI生成的数学文本中挖掘并系统清点可独立检验、形式化和复用的新数学思想工具，而非改进或验证AI本身
- 实际贡献：跨9个数学分支调查38个问题族、逐条记录所抽取的instrument及其前驱与注意事项，给出11条跨领域模式、形式化状态与依赖记分板，并示范将第112族的signed restriction引理用于固定深度的电路下界
- 理由：研究对象与交付物是AI生成数学语料中提炼出的数学结果（引理、构造、证明机制）及一个可复用的数学工具清单，属于AI生成数学发现的范畴；但抽取与新颖性判断由作者人工完成且明确不作证明验证，故非自动发现、置信度取中等。

## 未完成

无。

## 说明

- 本报告只做复核，**没有修改任何事件数据**。
- 下一步只更新确认有问题的 slug，不批量覆盖全部记录。
- 复核用的完整字段保存在 `.cache/direction-audit.json`，确认后可直接按 slug 应用。
