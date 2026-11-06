<div align="center">

# ∑ AI4Math 生态雷达

**AI for Mathematics 的生态情报平台 —— 追踪事件，而不只是论文。**

把散落在 arXiv、会议论文集、实验室博客、大学新闻与基金会公告里的进展，
整理成一条可筛选、可追溯、可定位的生态时间线。

[中文](README.md) · [English](README.en.md) · [功能更新](project_management.md)

[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Static Export](https://img.shields.io/badge/deploy-static_export-2F855A)](#数据如何更新)
[![Tests](https://img.shields.io/badge/tests-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

<img src="docs/screenshots/home.png" alt="AI4Math 生态雷达首页" width="880">

</div>

---

## 这是什么

AI4Math 的进展不只发生在论文里。新方法出现、研究者流动、机构成立联合实验室、基金会开放资助、
社区发布政策声明——这些事件共同决定了一个方向的走向，却分散在几十个来源里，格式各异、更新节奏
不同。

**AI4Math 生态雷达**把六类研究方向和五类生态事件收进同一份数据集，为每条事件保留原始来源链接、
证据等级与核验记录。你可以按方向、类型、时间、证据等级筛选，也可以在时间线上看一个领域如何
一步步走到今天。

当前数据集：**约 650 条事件**，最早可追溯到 **1956 年**，覆盖 **6 个研究方向**。

## 核心设计

<table>
<tr><td width="33%" valign="top">

### 以事件为单位

论文、模型、基准、数据集是**事件的属性**，不作为一级分类。五类生态事件并列：研究、人物、
机构与教育、资金、政策与社区。

</td><td width="33%" valign="top">

### 证据与重要性分开

`evidenceLevel`（E0–E4）说明证据成熟到什么程度，`sourceTier`（S0–S4）说明证据来自哪里。
两者独立标注，不合成分数。

</td><td width="33%" valign="top">

### 自动采集，来源可追溯

自动采集直接进入事件流，不设人工审核队列；无法核实的字段留空，来源无法确认的条目直接丢弃。

</td></tr>
</table>

## 功能

| 模块 | 路由 | 说明 |
| --- | --- | --- |
| 首页 | `/` | 事件总量、方向分布、最新事件与近期活跃度 |
| 事件流 | `/latest` | 按类型 / 方向 / 时间 / 证据 / 来源筛选，支持搜索、卡片与紧凑两种视图 |
| 时间线 | `/timeline` | 2020 年起逐年、更早按十年；月份可折叠、支持深链与全年展开 |
| 研究方向 | `/topics` · `/topics/[topic]` | 六个方向的趋势、代表论文、模型、基准与事件列表 |
| 事件详情 | `/research/[slug]` | 发生了什么、关键事实、证据与状态、同类事件，以及**事件脉络** |
| 全站搜索 | `/search` | 按事件、论文、方向、模型与基准分组返回结果 |
| 来源同步 | `/sources` | 每个来源的最近同步状态与游标 |
| 术语表 | `/methodology` | 证据等级与来源层级的完整定义 |

**事件脉络**：详情页会按事件中出现的人物、机构、项目、模型与基准，把它放回一条共现时间线上，
标出起点、最新进展与当前事件的位置。共现加时序表达的是关联，不是因果。

**信任模型**：证据等级 E0–E4（独立复核 / 可检验产物 / 研究记录 / 单方声明 / 无证据）与来源
层级 S0–S4 分开标注；核验历史只增不改。规则见 [`/methodology`](app/methodology/page.tsx)。

<table>
<tr>
<td width="50%"><img src="docs/screenshots/timeline.png" alt="时间线页面"><br><sub>时间线：按年分组，月份可折叠</sub></td>
<td width="50%"><img src="docs/screenshots/detail.png" alt="事件详情页面"><br><sub>事件详情：事实、证据与原始来源</sub></td>
</tr>
</table>

## 数据与信任模型

每条事件的证据等级由可核验的链接推导，不靠主观打分：

```text
E0 独立复核    多个独立来源交叉验证
E1 可检验产物  公开代码 / 数据 / 形式化证明
E2 研究记录    论文、论文集或技术报告
E3 单方声明    只有发起方自己的公开声明
E4 无证据      暂无公开材料
```

来源层级 `S0`–`S4` 独立标注，按以下优先级解析：事件显式覆盖 → 来源目录表 → 来源类型兜底。
arXiv 与 GitHub 均为 `S0`。

数据政策：

- 不编造结果、arXiv ID 或 URL；无法核实的字段留空，来源 URL 无法确认的条目直接丢弃。
- 发布方自报的结果按「单方声明」记录，并保留分母（例如按已发布语料计数，而不是按已证明定理数）。
- 自动采集不设人工审核队列；更正与撤回以追加核验记录的方式留痕。
- 事件标题保持来源原文，不自动改写。

## 数据如何更新

站点是纯静态导出：数据在构建时写入 JSON，页面导出为 HTML，没有服务端进程，也不需要数据库。
来源清单登记在 `lib/sources/catalog.ts`，每次同步把新事件写入 `data/ingested/`；构建时与内置
事件合并、去重，再生成中英两份数据集。

发布由 [`.github/workflows/publish.yml`](.github/workflows/publish.yml) 完成：push 到 `main`、
每 6 小时定时或手动触发；定时与手动运行会先抓取新事件，再重建并发布双语言站点。

## 本地运行

需要 Node.js 20 及以上：

```bash
npm install
npm run dev
```

中文站运行在 <http://localhost:3000>，English 在 <http://localhost:3001/en/>。

## Roadmap

- [x] 五类生态事件模型与信任标签
- [x] 纯静态导出，中英双语独立构建
- [x] 时间线（按年 / 十年分组、月份折叠、深链）
- [x] 事件脉络（人物、机构、项目、模型、基准共现）
- [x] 定时采集与自动发布
- [ ] 事件之间的引用图，替代纯共现脉络
- [ ] 方向内的逐题评测结果追踪
- [ ] Math4AI 作为独立一级入口

## 参与贡献

发现错误或希望补充来源，请在仓库提交 Issue，并附上可核验的原始链接；无法确认来源的条目不合并。
功能更新按周记录在 [project_management.md](project_management.md)。

## 许可证

本项目暂未选择开源许可证。在添加 `LICENSE` 文件之前，默认保留所有权利；如需复用，请先联系作者。
