# 方向轴边界复核与同类存量清理（2026-11-09）

第二轮回源复核留下 6 条两轮不一致的事件。本报告先逐条人工定判这 6 条，再把同一口径推到全库同类行。所有判定不调用 LLM，直接读原始摘要。

**结论**：6 条中 **4 条改判、2 条维持**；同类排查另发现 **14 条改判**（13 条 → none，1 条 → math4ai）。原待定的 3 条已按同一口径定判为 **math4ai**。合计写入 **21 条**，另有 9 条同类行维持原判。

## 判定原则

依据站内 `/methodology` 的权威定义：

- **AI4Math**：研究对象或交付物是数学本身——自动证明、猜想发现、形式化、数学推理模型、数据集与基准，以及服务这些工作的工具链。
- **Math4AI**：数学作为方法、理论或测试场，研究对象是 AI 系统本身——改进训练方法、用数学理论改进算法、解释模型的数学性质。
- 两者都不满足 → **none**。

两条派生规则用于本轮裁决：

1. **被形式化的内容是数学理论 → AI4Math；是具体软件/硬件的行为 → none。** 证明写在 Lean/Isabelle 里不改变主题。GPU kernel、SQL 引擎、操作系统、字节码、Python 组件、实时调度、RTL 电路的正确性证明属于软件/硬件验证；ODE 理论、Lyapunov 稳定性、图算法正确性、程序语义的元定理属于数学/逻辑理论的形式化。
2. **AI 论文不自动等于 Math4AI。** 只有数学充当方法、理论或测试场时才归 Math4AI；通用的 SFT/GRPO 配方、纯经验性架构改进，数学缺席，归 none。

第 1 条是本轮相对上一版报告的**修正**：上一版按"标题主线"判 Countable 为 none，但"头条交付物"规则是用来在数学产物与 AI 方法之间取舍的，不适用于数学与 none 之间；看被形式化的内容，Countable 机械化的是 wp 可靠性定理与 MDP 最小期望奖励不动点刻画，属于数学理论，应维持 ai4math，才与 tilt、Tarjan 一致。

## 一、两轮分歧的 6 条

| # | 事件 | 库内 | 第一轮 | 第二轮 | **金标准** |
| --- | --- | --- | --- | --- | --- |
| 1 | GenDB-V：AI 生成并形式验证数据库引擎 | ai4math | ai4math 0.75 | none 0.80 | **none** (0.85) |
| 2 | LARK：Lean 辅助证明 LLM 生成的 GPU kernel | ai4math | ai4math 0.72 | none 0.72 | **none** (0.80) |
| 3 | Countable Nondeterminism in Weighted Programming | ai4math | none 0.72 | ai4math 0.90 | **ai4math** (0.75) |
| 4 | GTFormer：替代 Transformer 的图网络架构 | math4ai | none 0.85 | math4ai 0.85 | **none** (0.75) |
| 5 | The Geometry of Limits in ReLU Function Spaces | math4ai | math4ai 0.85 | ai4math 0.75 | **math4ai** (0.90) |
| 6 | Trainable Boundary-Keeping：奖励训练的边界保持 | math4ai | math4ai 0.75 | none 0.65 | **none** (0.75) |

### 1. GenDB-V → none

对象是数据库引擎，交付物是更快的、经过形式验证的数据库引擎。`SQLSpec` 是 SQL 语义的形式化，服务数据库正确性；机器检查的证明主题是程序行为。头条交付物是一个数据库系统（TPC-H 提速 22.0–61.3×），不是"数学本身"。

### 2. LARK → none

对象是 LLM 生成的 GPU kernel，目标是证明 kernel 与 PyTorch 参考实现等价。Lean 形式化的是 GPU 机器模型与算子语义，交付物是可验证的代码生成，服务软件/硬件验证。Lean 库不服务数学证明、猜想或数学推理。

### 3. Countable Nondeterminism → ai4math（维持）

纯形式方法论文，没有 AI 参与，但交付物是可复用的数学理论：扩展加权编程框架、wp 演算的可靠性条件，以及在 Lean 中机械化的 MDP 最小期望奖励不动点刻画。它回答的是"这类语义模型在什么条件下成立"，属于形式化的数学/逻辑理论，不是某个具体软件系统的正确性证明。与 tilt（ODE/Lyapunov 形式化）、Tarjan（图算法正确性形式化）同类，维持 ai4math。

### 4. GTFormer → none

对象是长上下文 AI 架构，交付物是 GNN 骨干，评估基准是代码、日志、多跳检索。摘要只说"Inspired by recent advances in algebraic graph learning (WPNet)"——数学是灵感来源，正文没有交付图论定理、理论保证或数学分析。按"实际贡献为准"，这是架构工程，不是"用数学理论改进 AI 算法"。

### 5. The Geometry of Limits in ReLU Function Spaces → math4ai（维持）

对象是固定架构 ReLU 网络实现的函数空间，交付物是逼近论定理与反例（推翻 Petersen–Raslan–Voigtlaender 的一个猜想）。这是"数学作为方法、研究对象是 AI 系统本身、解释模型的数学性质"，命中 Math4AI 的明确条目。第二轮判 ai4math 是被该事件的研究领域标签"AI-proved results & conjectures"带偏——摘要通篇是人工数学论证，没有任何 AI 产出定理。**该事件的 researchArea 标签本身是错的**，属于独立的数据质量问题。

### 6. Trainable Boundary-Keeping → none

对象是 SFT-then-GRPO 的奖励训练配方，交付物是一份预注册对照实验。数学既不是方法也不是测试场——任务是"证据是否足以支持因果主张"，不是数学推理；配方本身是通用训练方法。判定表里"改进 AI 训练方法 → Math4AI"不能脱离方法论页"数学作为方法、理论或测试场"的前提单独使用。

## 二、同类存量排查

入库事件中标为 ai4math 且涉及形式化/验证的共 149 条。逐条读标题与摘要后，**14 条改判**：

| slug | 旧 → 新 | 依据 |
| --- | --- | --- |
| `formalizing-ptx-in-lean-to-prove-gpu-kernel-correctness` | ai4math → none | 形式化 PTX/GPU ISA，证明 GEMM、FlashAttention、MoE kernel 的正确性 |
| `tlaps-bench-formally-proving-correctness-of-real-world-system-specifications-with-tla-proof-system` | ai4math → none | TLA+ 系统规格（缓存一致性、拜占庭共识、WAL）的证明基准 |
| `how-stable-are-llm-generated-proofs-under-program-refactoring-a-stress-test-for-verifiable-code-generation` | ai4math → none | Rust 程序重构后的证明稳定性，VERINA 代码验证任务 |
| `rain-agentic-proof-generation-for-rocq-based-software-verification` | ai4math → none | Rocq 软件验证的证明生成代理 |
| `verifying-deployed-bytecode-against-executable-evm-semantics-with-exact-gas-and-no-added-axioms` | ai4math → none | 链上 EVM 字节码的验证 |
| `cost-efficient-theorem-proving-via-agent-orchestration-in-program-verification` | ai4math → none | 程序验证义务的证明编排 |
| `beyond-type-checking-towards-holistic-evaluation-of-formal-specification-generation` | ai4math → none | 代码形式规格（SpecGen）的评估 |
| `solving-vericontest-with-a-lean-backed-rust-verifier` | ai4math → none | Rust/Verus 竞赛程序验证 |
| `veripy-source-preserving-verification-and-compatibility-checking-for-python-components` | ai4math → none | Python 组件的契约与兼容性验证 |
| `prosabuddy-assisting-mechanized-real-time-schedulability-analysis-with-llm-based-agents` | ai4math → none | 实时系统可调度性证明 |
| `sled-ifv-solver-validated-llm-guided-decomposition-for-scalable-hardware-information-flow-verification` | ai4math → none | RTL 硬件信息流验证 |
| `extending-concurrent-separation-logic-to-the-hardware-level-to-verify-the-xv6-os-kernel-on-risc-v-with-ai-agents` | ai4math → none | xv6 操作系统内核验证 |
| `agentic-verified-optimization-of-real-world-software` | ai4math → none | 真实软件的性能重写与等价性证明 |
| `formally-verified-autoresearch-for-analyzing-the-expressivity-of-multi-head-attention` | ai4math → **math4ai** | 证明注意力头复杂度与阈值下界，研究对象是 AI 模型的表达能力 |

### 维持原判的同类行

这些行同样出现证明器或形式化，但被形式化的内容是数学理论或数学对象，维持 ai4math：

- `countable-nondeterminism-...`：wp 可靠性定理与 MDP 不动点刻画。
- `connecting-quantum-proof-systems-and-hoare-logic`：Qafny 到 Hoare 逻辑的嵌入定理与 Rocq 机械化完备性证明。
- `domain-theory-meets-interaction-trees-in-rocq`：域论框架下的程序等价元定理。
- `formal-verification-of-tilt-estimation-using-the-rocq-prover`：ODE 存在唯一性、Lyapunov 稳定性理论的形式化。
- `formal-proofs-of-tarjan-s-algorithm-in-why3-coq-and-isabelle`：图算法正确性定理的形式化。
- `scaling-lean-theorem-proving-for-real-world-code-verification`：同时证明 PutnamBench 669/672 与 IMO 2026 形式化，数学能力是共同交付物。
- `llm2cert-llm-synthesis-of-certificates-with-smt-lean-verification`：Lyapunov 函数与 barrier certificate 是数学对象。
- `towards-autoformalization-of-mathematics-and-code-correctness-experiments-with-elementary-proofs`：数学证明自动形式化是共同主线。
- `agentic-algorithm-design-llms-that-propose-formalise-and-prove-runtime-bounds-for-evolutionary-algorithms-in-lean`：交付算法的期望运行时间证明。

### 原待定 3 条的定判

| slug | 库内 | **定判** | 依据 |
| --- | --- | --- | --- |
| `zero-storage-procedural-neural-synthesis-via-boundary-dynamics-formal-verification-in-lean-4-and-bare-metal-gauntlet-validation` | ai4math | **math4ai** | 对象是 AI 推理范式本身；Lean 定理刻画其动力学性质（理想闭包、有界停机、边界敏感度），属于"用数学解释/保证 AI 系统的性质"，不是数学理论的形式化 |
| `second-order-problem-solving-for-recursive-self-improvement-in-formal-verification` | ai4math | **math4ai** | 对象是 AI 代理的自改进工作流；Lean 4 证明生成与 Verus 代码生成是两个测试场，数学充当测试场，命中 Math4AI 定义 |
| `provably-complete-generalized-planning-with-llms` | ai4math | **math4ai** | 对象是 LLM 广义规划器（AI 系统），Lean 用于证明其输出的完整性；被验证的虽是可执行规划，但研究对象与贡献都落在 AI 规划能力上，数学是方法 |

定判口径：先看研究对象是不是 AI 系统；是，再看数学是否充当方法、理论或测试场。三者都满足，故都归 math4ai。与被判 none 的 LARK/GenDB 的区别在于：后两者的对象是 GPU kernel、数据库引擎，AI 只是生成工具；这里被验证的是 AI 系统自身的性质或输出。

## 三、应用清单

21 条写入清单在 `docs/direction-gold-review-2026-11-09.json`（18 条已应用，3 条原待定项在定判后补入），先用 `--labels` 做 dry-run：

```bash
npm run apply:direction -- --labels=docs/direction-gold-review-2026-11-09.json --dry
```

确认 diff 后执行：

```bash
npm run apply:direction -- --labels=docs/direction-gold-review-2026-11-09.json
```

`scripts/apply-direction-audit.ts` 新增 `--labels=<json>` 入口：JSON 为 `slug -> direction`，脚本从当前事件读取旧方向，只写有变化的行，`none` 删除方向字段。

## 四、根因

1. **提示词缺负例。** 现有边界只有正向的"数学专项产物 → ai4math"，没有"软件/硬件验证的证明 → none"。模型看到 Lean 证明就倾向归入数学工具链。应在 `DIRECTION_SYSTEM` 补两条负例，并把"a benchmark or tool for formal provers"收紧为"for proving mathematical theorems"。
2. **researchArea 会误导。** Geometry of Limits 被规则分类器标成 "AI-proved results & conjectures"，GTFormer 被标成 "Prover tooling & interaction"，两次误判都跟着领域标签走。提示词里应明确：领域标签是机器生成、可能错误，与摘要冲突时忽略。
3. 这两项只修未来新事件，不回改已判缓存，避免审计标准混用。
