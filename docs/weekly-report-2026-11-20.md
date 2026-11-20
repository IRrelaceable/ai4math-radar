# AI4Math 周报（2026 年 11 月 14 日—11 月 20 日)

项目地址：[Gitee](https://gitee.com/testimoa/ai4math-radar) · [GitHub](https://github.com/IRrelaceable/ai4math-radar)，分支 `main`；线上站点 <https://irrelaceable.github.io/ai4math-radar/>。

## 一、本周概况

### 提交

- 本周 `main` 分支共 9 笔提交，全部为雷（IRrelaceable），集中在 11 月 18—20 日
- 其中功能改动 3 笔（导航与图谱、事件追踪链、站点细节），文档与配置 6 笔
- 成家旭的 TAG 截断恢复与同题数学对照在本仓库之外，没有对应的仓库提交，成果见第四节

### 版本

- 两端 `main` 当前均为 [c10e298](https://github.com/IRrelaceable/ai4math-radar/commit/c10e298)（GitHub 与 Gitee 一致）
- 数据集截至 11 月 19 日构建：743 条事件、826 个来源

### 主要成果

- 一级导航定型为五个入口，站点信息改为信息中枢并补上功能模块说明
- 研究图谱合并为单页散点图 + 下方交叉矩阵
- 事件详情建立持续追踪链路，可在离线回放里核对后续、核验与更正
- 全站分类规则定稿，九个维度的存量标签逐条重筛
- 采集从四次模型调用合并为一次，实际效果待实测
- README 精简重排，三张截图随新界面重拍

## 二、按模块

### 浏览入口与导航

- 一级导航重建为五个入口：最新进展、时间线、研究图谱、公开数学任务、Math4AI 方向 [3085e9c](https://github.com/IRrelaceable/ai4math-radar/commit/3085e9c)
- 原「关于」页改为信息中枢，集中放记录说明、标签释义与数据来源 [3085e9c](https://github.com/IRrelaceable/ai4math-radar/commit/3085e9c)
- 事件卡片精简：删掉「事件线 · N 条记录」，数学分类移到卡片底部 [8a9e89d](https://github.com/IRrelaceable/ai4math-radar/commit/8a9e89d)
- 页脚精简：去掉标语、可核查右栏与免责声明 [8a9e89d](https://github.com/IRrelaceable/ai4math-radar/commit/8a9e89d)
- 导航字体改为衬线体并加粗加深；修复在 Math4AI 页展开站点信息时两条下划线连成一条线 [f3bebf8](https://github.com/IRrelaceable/ai4math-radar/commit/f3bebf8)

### 研究图谱

- 新增按数学领域与研究主题划分图形的规则，用散点图与交叉矩阵展示，点选可回到对应记录 [3085e9c](https://github.com/IRrelaceable/ai4math-radar/commit/3085e9c)
- 图谱与交叉矩阵由两页合并到一页，去掉散点间的可见连线 [8a9e89d](https://github.com/IRrelaceable/ai4math-radar/commit/8a9e89d)

### 事件详情与持续追踪

- 建立「监测对象 → 变化资料 → 是否属于原事件」链路：第一层跨来源候选检索，第二层五分类关系判定（followup / verification / report / related / independent） [8a9e89d](https://github.com/IRrelaceable/ai4math-radar/commit/8a9e89d)
- 事件身份匹配加固：URL 归一化、主体绑定、正文证据句与否定核验识别，避免误并到别的事件线 [519950d](https://github.com/IRrelaceable/ai4math-radar/commit/519950d)
- 详情页把引用关系与相关事件分开成章；引用附原始论文链接，相关事件按人物、机构、项目、模型分组 [519950d](https://github.com/IRrelaceable/ai4math-radar/commit/519950d)
- 目前只在离线回放里核对（样本 17 条 + 4 条反例），未接入自动入库 [519950d](https://github.com/IRrelaceable/ai4math-radar/commit/519950d)

### 数学档案与 Benchmark

- 新增数学档案入口，展示公开数学题与评测案例，可对比模型作答、状态与资源消耗 [3085e9c](https://github.com/IRrelaceable/ai4math-radar/commit/3085e9c)
- 修正两处显示问题：来源链接按基线对齐，封面大数字调整行高不再压住说明文字 [519950d](https://github.com/IRrelaceable/ai4math-radar/commit/519950d)

### 全站分类与标签

- 分类规则定稿：删去研究子类型、研究方法、核验状态三个维度，写明证据等级、来源类型、AI 参与程度、发表状态的判定规则 [3085e9c](https://github.com/IRrelaceable/ai4math-radar/commit/3085e9c)
- 九个维度的存量标签全部重筛修正，让筛选和统计口径一致 [3085e9c](https://github.com/IRrelaceable/ai4math-radar/commit/3085e9c)

### 采集与部署

- 采集流程从四次模型调用合并为一次，补齐缺字段判失败、输出格式与 token 记录；实际效果待实测 [3085e9c](https://github.com/IRrelaceable/ai4math-radar/commit/3085e9c)
- 停掉定时自动抓取，保留推送与手动触发部署；API key 为临时问题，功能表述在 README 中保留 [ba04695](https://github.com/IRrelaceable/ai4math-radar/commit/ba04695)
- GitHub Pages 构建成功，Gitee 同步；类型检查、lint 与测试通过 [519950d](https://github.com/IRrelaceable/ai4math-radar/commit/519950d)

### 站点信息与文档

- 站点信息下拉新增「功能模块说明」，指向 `/about#modules`；中英字典同步七模块说明 [f3bebf8](https://github.com/IRrelaceable/ai4math-radar/commit/f3bebf8)
- 功能更新文档按读者视角重写，241 行精简到 85 行，保留全部日期与主题 [80d19ac](https://github.com/IRrelaceable/ai4math-radar/commit/80d19ac)
- 修复 Gitee README 图片：先改 Markdown 语法，再试 Gitee raw，最终用 GitHub raw 绝对地址 [489aec8](https://github.com/IRrelaceable/ai4math-radar/commit/489aec8) · [e5b23f9](https://github.com/IRrelaceable/ai4math-radar/commit/e5b23f9)
- README 核心设计从两点扩为四点，整体排版重排，中英同步；三张截图随新界面重拍 [c10e298](https://github.com/IRrelaceable/ai4math-radar/commit/c10e298)

## 三、按成员

- **雷（IRrelaceable）**：9 笔提交，完成五个一级入口与导航重构、研究图谱单页合并、事件持续追踪链路、分类规则定稿、采集四次合一，以及站点信息、README 与截图等文档工作。
- **成家旭**：本周做 TAG 截断恢复与同题数学对照，成果见第四节；这部分在本仓库之外，无仓库提交记录。

## 四、TAG 截断恢复与同题数学对照（成家旭）

本周继续围绕"两个高斯混沌之和的定量四阶矩界"做单题测试，整理 TAG 子任务产物，并扩充裸 API 的答卷样本。

| 任务 | 负责人 | 结果 |
| --- | --- | --- |
| TAG 截断恢复 | 成家旭 | 部分完成。GLM-5.3 的恢复方案通过离线重放，续跑推进到混合协方差子任务 T11；整理并独立核验了六个子任务的八份候选，部分引理可用。T11 在 8192 正文 tokens 处截断，原题任务 T17 尚未启动。另用 DeepSeek V4.1 Flash 做了三次续跑，都停在截断或目标预审退回，未提交答卷。 |
| 同题数学结果对照 | 成家旭 | 完成。本周新增 DeepSeek V4.1 Flash、Hy4 Preview、DeepSeek V4 Pro、Kimi K3.1 Pro 四份裸 API 答卷，连同上周 GLM-5.3 续接稿共五份，独立核验都发现让证明失效的错误，集中在混合项公式、收缩项符号和定理适用范围；同模型对照中 TAG 只有子任务材料，还判不出两组谁更好。 |
| 单题报告 | 成家旭 | 初稿完成，汇总了五份答卷、TAG 中间产物和 token、耗时、费用，整理出关键错误、反例和审查侧补证，形成案例研究稿。 |

## 五、待验证与后续

| 任务 | 负责人 | 预期结果 |
| --- | --- | --- |
| 补齐事件检索与挂接 | 雷（IRrelaceable） | 继续补召回缺口，解决类别判对但挂到另一篇文章的情况。 |
| 关系判定器是否接入 | 雷（IRrelaceable） | 等召回和目标事件稳定后再定，此前仍保持离线试跑。 |
| 采集优化实测 | 雷（IRrelaceable） | 拿到真实 token 和输出质量再判断，不拿估算当结论。 |
| 整理前期结果和材料 | 成家旭 | 归并上下文压缩、裸 API、TAG 续跑和核验记录，统一状态、判定、token、耗时和费用口径，补齐结论到原始证据的索引。 |
| 交叉复查答卷与中间结果 | 成家旭 | 用 Claude 逐份复查五份裸 API 答卷，用 GPT 和 Claude 核验 TAG 子任务候选与 T11 片段，记录分歧。 |
| 完成报告与汇报 PPT | 成家旭 | 整合前期工作和两项复核，形成文章式研究报告，并制作配套 PPT；数字和结论与报告逐项核对。 |

## 附：本周提交清单

| 日期 | 成员 | 提交 | 说明 |
| --- | --- | --- | --- |
| 11-20 | 雷（IRrelaceable） | [c10e298](https://github.com/IRrelaceable/ai4math-radar/commit/c10e298) | docs: expand core design and refine README layout |
| 11-20 | 雷（IRrelaceable） | [e5b23f9](https://github.com/IRrelaceable/ai4math-radar/commit/e5b23f9) | docs: host README screenshots on GitHub raw |
| 11-20 | 雷（IRrelaceable） | [489aec8](https://github.com/IRrelaceable/ai4math-radar/commit/489aec8) | docs: use absolute image URLs for Gitee README |
| 11-20 | 雷（IRrelaceable） | [80d19ac](https://github.com/IRrelaceable/ai4math-radar/commit/80d19ac) | docs: streamline changelog and fix README images on Gitee |
| 11-20 | 雷（IRrelaceable） | [f3bebf8](https://github.com/IRrelaceable/ai4math-radar/commit/f3bebf8) | docs: add site modules guide and polish header typography |
| 11-20 | 雷（IRrelaceable） | [519950d](https://github.com/IRrelaceable/ai4math-radar/commit/519950d) | docs: add weekly report 2026-11-20 and refine site details |
| 11-19 | 雷（IRrelaceable） | [8a9e89d](https://github.com/IRrelaceable/ai4math-radar/commit/8a9e89d) | feat: add event tracking chain and polish user-facing UI |
| 11-18 | 雷（IRrelaceable） | [ba04695](https://github.com/IRrelaceable/ai4math-radar/commit/ba04695) | ci: disable scheduled auto-ingest, keep push/dispatch deploy |
| 11-18 | 雷（IRrelaceable） | [3085e9c](https://github.com/IRrelaceable/ai4math-radar/commit/3085e9c) | feat: rebuild navigation, research graph and user-facing content |
