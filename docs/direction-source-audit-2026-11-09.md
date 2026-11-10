# 方向轴源数据复核（2026-11-09）

把每条科研事件回源到原始摘要后重判，与库内文本（种子策展概要 / 采集摘要）的判定做对照。本次按优先级选出 **150** 条事件，其中 **43** 条已有源摘要判定可对照，**105** 条尚未完成。

> 两轮不一致的 6 条已由人工定判，不再使用合并重判；判定依据与应用结果见 `direction-gold-review-2026-11-09.md`。

## 方法

- **库内文本判定**：读取 `direction-audit-2026-11-09.json`，输入为标题、研究领域、problem、keyContributions、summary、significance。
- **源数据判定**：只输入标题、研究领域与原始摘要（arXiv 摘要优先；非 arXiv 用标题精确匹配 arXiv，再回退 OpenAlex）。
- 两次判定使用同一套三步法提示词。首轮为 rubric v1（未版本化），边界修订后的新判定为 v2（`2026-11-09b`）；本次已判定条目中 v2 为 **0** 条，其余沿用 v1 结果，未重判。
- 对不一致或源摘要置信度 < 0.7 的条目，再用「库内文本 + 原始摘要」合并重判，作为建议判定。

## 源摘要覆盖

| 来源 | 数量 |
| --- | ---: |
| arXiv 链接 | 137 |
| arXiv 标题匹配 | 7 |
| OpenAlex | 4 |
| 未取得 | 2 |
| **合计** | **150** |

覆盖率 **99%**；未取得摘要的条目多为新闻、博客、机构页面或数据库未收录的论文。

## 未完成的源数据重判

还有 **105** 条已取得摘要但尚未完成重判（LLM 额度耗尽，调用返回 429）。合并重判同样未执行。恢复额度后重跑 `npm run audit:direction:source -- --priority` 会从缓存续跑，不会重复已完成的条目。

| slug | 标题 |
| --- | --- |
| `depthevidence-unifying-metric-depth-prediction-and-geometric-reasoning-in-multimodal-language-models` | DepthEvidence: Unifying Metric Depth Prediction and Geometr… |
| `human-llm-deliberation-as-interactive-proof-conditions-for-verifiability-without-transparency` | Human-LLM Deliberation as Interactive Proof: Conditions for… |
| `learning-what-to-investigate-next-meta-reasoning-for-long-horizon-research-agents` | Learning What to Investigate Next: Meta-Reasoning for Long-… |
| `mathematical-word-problem-generation-from-commonsense-knowledge-graph-and-equations` | Mathematical Word Problem Generation from Commonsense Knowl… |
| `mechbench-can-ai-scientific-agents-discover-mechanisms-beyond-phenomenal-laws` | MechBench: Can AI Scientific Agents Discover Mechanisms Bey… |
| `predicting-algorithm-classes-for-programming-word-problems` | Predicting Algorithm Classes for Programming Word Problems |
| `swe-proof-can-language-models-resolve-real-world-issues-with-machine-checked-proofs` | SWE-Proof: Can Language Models Resolve Real-World Issues wi… |
| `a-lean-and-spec-driven-ai-assisted-software-development-lifecycle-for-applied-ai-education-the-ai-sdlc-approach` | A Lean and Spec-Driven AI-Assisted Software Development Lif… |
| `a-lean-dataset-for-international-math-olympiad-small-steps-towards-writing-math-proofs-for-hard-problems` | A Lean Dataset for International Math Olympiad: Small Steps… |
| `a-neural-network-solves-explains-and-generates-university-math-problems-by-program-synthesis-and-few-shot-learning-at-human-level` | A Neural Network Solves, Explains, and Generates University… |
| `a-survey-of-deep-learning-for-mathematical-reasoning` | A Survey of Deep Learning for Mathematical Reasoning |
| `algorag-retrieval-augmented-generation-for-theoretical-computer-science-education-a-comprehensive-evaluation-framework-for-algorithm-analysis-and-complexity-theory` | AlgoRAG: Retrieval-Augmented Generation for Theoretical Com… |
| `an-edge-enhanced-hierarchical-graph-to-tree-network-for-math-word-problem-solving` | An Edge-Enhanced Hierarchical Graph-to-Tree Network for Mat… |
| `apriori-knowledge-in-an-era-of-computational-opacity-the-role-of-ai-in-mathematical-discovery` | Apriori Knowledge in an Era of Computational Opacity: The R… |
| `auditable-algebraic-counting-field-for-cryptic-pocket-detection-from-apo-structures` | Auditable Algebraic Counting Field for Cryptic-Pocket Detec… |
| `benchmarking-arabic-dialects-for-math-problems` | Benchmarking Arabic Dialects for Math Problems |
| `benchmarking-vision-language-models-on-synapse-and-neuron-proofreading-in-connectomics` | Benchmarking Vision-Language Models on Synapse and Neuron P… |
| `beyond-compression-diagnosing-how-post-training-changes-mathematical-reasoning` | Beyond Compression: Diagnosing How Post-Training Changes Ma… |
| `beyond-equation-search-conjecture-guided-discovery-with-scope-and-closurebench` | Beyond Equation Search: Conjecture-Guided Discovery with SC… |
| `beyond-generation-and-accuracy-diagnosing-and-enhancing-visual-chain-of-thought-for-geometry-problem-solving` | Beyond Generation and Accuracy: Diagnosing and Enhancing Vi… |
| `cadforge-agentic-single-view-cad-reconstruction-with-explicit-geometry-reasoning` | CADForge: Agentic Single-View CAD Reconstruction with Expli… |
| `claimscope-label-blind-witness-verification-for-mathematical-claim-auditing` | ClaimScope: Label-Blind Witness Verification for Mathematic… |
| `correct-diagnosis-better-feedback-a-symbolic-verifier-for-faithful-llm-tutoring-feedback-in-logic-proofs` | Correct Diagnosis, Better Feedback: A Symbolic-Verifier for… |
| `counterexample-generation-via-per-theorem-symbolic-verifiers-when-imitation-hurts-and-reinforcement-repairs` | Counterexample Generation via Per-Theorem Symbolic Verifier… |
| `diagnosing-sampled-llm-reasoning-in-formal-geometry-coverage-realization-and-validity-evidence` | Diagnosing Sampled LLM Reasoning in Formal Geometry: Covera… |
| … | 其余 80 条见同名 JSON |

## 总体一致性

在同时具备两种判定的 **43** 条中，源数据判定与库内判定一致 **41** 条（95%），不一致 **2** 条。

| 库内 → 源数据 | 数量 |
| --- | ---: |
| ai4math → ai4math | 22 |
| none → none | 19 |
| none → ai4math | 1 |
| none → math4ai | 1 |

按库内判定的置信度拆开看：

| 库内置信度 | 条数 | 与源数据不一致 |
| --- | ---: | ---: |
| ≥ 0.8 | 37 | 1（3%） |
| < 0.8 | 6 | 1（17%） |

不一致集中在库内判定自身置信度较低的条目：高置信度条目与源数据几乎一致，说明原复核在其有把握的范围内是可靠的。

## 不一致明细

下表给出库内判定、源摘要判定与合并建议。源摘要列引用原文关键句，便于人工判断是哪一侧错了。已由人工金标准复核定判的条目以 `direction-gold-review-2026-11-09.md` 为准；下表保留自动判定原文，便于追溯。

| slug | 标题 | 库内 | 源数据 | 合并建议 | 源摘要依据 |
| --- | --- | --- | --- | --- | --- |
| `countable-nondeterminism-in-weighted-programming-with-an-application-to-mechanized-foundations-for-probabilistic-program-verification` | Countable Nondeterminism in Weighted Programming with an Ap… | none 0.72 | ai4math 0.90 | — | 交付物是Lean形式化语料与机械化数学定理证明，属于定理证明/形式化数学工具链，而非改进AI训练方法。 |
| `gtformer-a-syntax-free-graph-network-alternative-to-transformers-for-8192-times-length-extrapolation-in-linear-time` | GTFormer: A Syntax-Free Graph Network Alternative to Transf… | none 0.85 | math4ai 0.85 | — | 标题与摘要明确以图论结构替代注意力、改进AI架构效率，属“用数学理论改进AI算法”，虽在定理证明领域但未交付证明器或形式化数学制品 |

## 需优先人工核验

共 **3** 条，条件：两侧不一致、源摘要置信度 < 0.7，或合并重判置信度 < 0.7。

| slug | 库内 | 源数据 | 合并建议 | 源数据理由 |
| --- | --- | --- | --- | --- |
| `countable-nondeterminism-in-weighted-programming-with-an-application-to-mechanized-foundations-for-probabilistic-program-verification` | none | ai4math 0.90 | — | 交付物是Lean形式化语料与机械化数学定理证明，属于定理证明/形式化数学工具链，而非改进AI训练方法。 |
| `gtformer-a-syntax-free-graph-network-alternative-to-transformers-for-8192-times-length-extrapolation-in-linear-time` | none | math4ai 0.85 | — | 标题与摘要明确以图论结构替代注意力、改进AI架构效率，属“用数学理论改进AI算法”，虽在定理证明领域但未交付证明器或形式化数学制品 |
| `modern-software-engineering-with-verification-agents-a-spec-first-architecture-for-autonomous-synthesis-verification-irs-and-organizational-scale` | none | none 0.65 | — | 研究对象是软件工程验证流程而非数学定理或数学问题求解系统；也未用数学理论改进AI算法，故归none |

## 未取得源摘要

| slug | 标题 | 错误 |
| --- | --- | --- |
| `maple-symbolic-computation-system` | Maple offers portable interactive symbolic computation | no exact arXiv title match |
| `numinamath-aimo-progress-prize-1` | NuminaMath wins the first AIMO Progress Prize | no exact arXiv title match |

## 存储摘要与源摘要的可见偏差

以下条目的库内判定与源数据判定不同；把两者并排放在一起，可直接看出库内摘要是漏掉了实际交付物、还是强调了作者动机。

### `countable-nondeterminism-in-weighted-programming-with-an-application-to-mechanized-foundations-for-probabilistic-program-verification`

**Countable Nondeterminism in Weighted Programming with an Application to Mechanized Foundations for Probabilistic Program Verification**

- 库内：none（0.72）——该工作研究对象是程序语义与概率程序验证的形式化数学/形式化方法成果，既不改进 AI 的数学推理或自动定理证明能力，也不用数学理论解释或改进 AI 模型；其 Lean 机械化是程序验证的语义定理而非形式化数学语料或 prover 工具，按边界规则归为 none。
- 源数据：ai4math（0.90）——交付物是Lean形式化语料与机械化数学定理证明，属于定理证明/形式化数学工具链，而非改进AI训练方法。
- 源摘要：Weighted programming is a framework by Batz et al. for describing mathematical models or optimization problems as imperative programs parametrized over semirings and then analyzing them with program verification techniques like weakest precondition calculi. Applications include reasoning about expected outcomes of probabilistic programs and competitive analysis of online algorithms. We extend weighted programming wi…

### `gtformer-a-syntax-free-graph-network-alternative-to-transformers-for-8192-times-length-extrapolation-in-linear-time`

**GTFormer: A Syntax-Free Graph Network Alternative to Transformers for 8192$\times$ Length Extrapolation in Linear Time**

- 库内：none（0.85）——交付物是通用AI架构，评估对象为代码、日志、检索基准，无视具体数学成果或用于改进AI的数学理论，属通用AI研究。
- 源数据：math4ai（0.85）——标题与摘要明确以图论结构替代注意力、改进AI架构效率，属“用数学理论改进AI算法”，虽在定理证明领域但未交付证明器或形式化数学制品
- 源摘要：Self-attention mechanisms have established the Transformer as the dominant backbone across natural language processing, source code intelligence, and automated theorem proving. However, all-to-all pairwise token comparison enforces a quadratic $\mathcal{O}(N^2)$ compute and memory barrier alongside severe softmax attention dilution as sequence length $N$ scales beyond the training horizon. Inspired by recent advance…

## 说明

- 本报告只做对照，**没有修改任何事件数据**；原始摘要缓存在 `.cache/source-abstracts.json`，源数据判定在 `.cache/source-judge.json`。
- 源摘要判定以 arXiv/OpenAlex 摘要为准；会议论文的正式版可能与预印本有差异。
- 未取得摘要的条目不能据此证明库内判定错误，仍需人工核验。
