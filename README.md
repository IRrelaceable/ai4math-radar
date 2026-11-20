<div align="center">

# ∑ AI4Math 生态雷达

**AI for Mathematics 的生态情报平台 —— 追踪事件，而不只是论文。**

把散落在 arXiv、会议论文集、实验室博客、大学新闻与基金会公告里的进展，
整理成一条可筛选、可追溯、可定位的生态时间线。

[中文](README.md) · [English](README.en.md) · [功能更新](project_management.md) · [线上站点](https://irrelaceable.github.io/ai4math-radar/)

[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
![Static Export](https://img.shields.io/badge/deploy-static_export-2F855A)
[![Tests](https://img.shields.io/badge/tests-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

![AI4Math 生态雷达首页](https://gitee.com/testimoa/ai4math-radar/raw/main/docs/screenshots/home.png)

</div>

---

## 这是什么

AI4Math 的进展不只发生在论文里。新方法出现、研究者流动、机构成立联合实验室、基金会开放资助、
社区发布政策声明——这些事件共同决定了一个方向的走向，却分散在几十个来源里，格式各异、更新节奏
不同。

**AI4Math 生态雷达**把科研进展和五类生态事件收进同一份数据集，为每条事件保留原始来源链接、
证据等级与核验记录。你可以按类型、分类维度、时间、证据等级筛选，也可以在时间线上看一个领域如何
一步步走到今天。

## 核心设计

<table>
<tr><td width="50%" valign="top">

### 以事件为单位

论文、模型、基准、数据集是**事件的属性**，不作为一级分类。五类生态事件并列：研究、人物、
机构与教育、资金、政策与社区。

</td><td width="50%" valign="top">

### 自动采集，来源可追溯

自动采集直接进入事件流；无法核实的字段留空，来源无法确认的条目直接丢弃。

</td></tr>
</table>

## 功能

站点提供七个功能模块，各自回答一个不同的问题：

| 模块 | 可以做什么 |
| --- | --- |
| 最新进展 | 按时间浏览全部事件，可按类别、主题、数学领域、证据等级和时间筛选，支持关键词搜索 |
| 时间线 | 按年份和月份回看历史记录，查看每年的数量与类别构成，快速跳转到任意年份 |
| 研究图谱 | 用散点图查看事件分布，用交叉表查看数学领域与研究主题的组合数量，点进格子看具体记录 |
| 数学档案 | 查看公开的数学题与评测案例，对比国内外模型的作答结果、状态和资源消耗 |
| Math4AI 方向 | 查看"用数学改进 AI"这类研究的统计分布，点年份、主题或领域直接筛选记录 |
| 搜索 | 跨全部记录检索事件、论文、模型与 Benchmark，中英文关键词都支持 |
| 事件详情与持续追踪 | 查看单条事件的来龙去脉，以及它的后续进展、核验与更正，追溯相关报道 |

**引用关系与相关事件**：详情页把两类关系分开成章。「引用关系」列出本事件参考文献中的工作与
引用本事件的后续工作，每条边都附原始论文链接；引用只表示文献关联，不代表结论被继承。
「相关事件」按人物、机构、项目与模型分组，把本事件放回共现时间线上——共现只表示关联，
不是因果。短链收成一行，其余线索可展开，长链标出当前位置。

**信任模型**：证据等级 E0–E3（独立复核 / 可检验产物 / 研究记录 / 单方声明）与来源
类型 S0–S4 分开标注，每条事件可挂多个来源。发表状态全自动派生：arXiv 链接→预印本，会议论文集/出版商 DOI→正式发表，无人工标注环节；勘误另行留痕。标签定义见 [`/methodology`](app/methodology/page.tsx)。

| 时间线 | 事件详情 |
| --- | --- |
| ![时间线页面](https://gitee.com/testimoa/ai4math-radar/raw/main/docs/screenshots/timeline.png) | ![事件详情页面](https://gitee.com/testimoa/ai4math-radar/raw/main/docs/screenshots/detail.png) |
| 时间线：逐年密度、默认展开近 3 个月与按月折叠 | 事件详情：事实、证据与原始来源 |

## 本地运行

需要 Node.js 20 及以上：

```bash
npm install
npm run dev
```

中文站运行在 <http://localhost:3000>，English 在 <http://localhost:3001/en/>。

## 参与贡献

发现错误或希望补充来源，请在仓库提交 Issue，并附上可核验的原始链接；无法确认来源的条目不合并。
功能更新按周记录在 [project_management.md](project_management.md)。

## 许可证

本项目暂未选择开源许可证。在添加 `LICENSE` 文件之前，默认保留所有权利；如需复用，请先联系作者。
