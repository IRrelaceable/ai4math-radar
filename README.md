# AI4Math Ecosystem Radar · AI4Math 生态雷达

[English](README.en.md) · **中文**

一个面向 **AI for Mathematics (AI4Math)** 的生态情报平台。它不只罗列论文,而是追踪五类生态
事件——**研究 · 人物 · 机构与教育 · 资金 · 政策与社区**——回答发生了什么、谁在推动这个领域、
为何重要、以及它如何与既往工作相连。

技术栈为 **Next.js(App Router)+ React + TypeScript + Tailwind CSS**,以**纯静态站点**发布:
数据在构建时写入 JSON,页面导出为 HTML,GitHub Actions 定时抓取新事件并重新发布。没有服务端
进程,也不需要数据库即可运行。

## 快速开始

```bash
npm install
npm run dev
```

打开 <http://localhost:3000>。`predev` 会先根据 `data/seed` 与 `data/ingested` 生成
`public/data/{zh,en}.json`,再启动开发服务器。

语言在编译期固定,所以开发服务器一次只编译一种语言;要同时看英文版,另开一个终端:

```bash
npm run dev:en   # http://localhost:3001/en/
```

两个服务各用各的构建目录(`.next`、`.next-en`),互不干扰;页头的语言开关会自动跳到对应端口。

## 构建与部署

站点是中英两份独立导出(语言在构建时固定,靠路径区分):

| 语言 | 路径 | 构建方式 |
| --- | --- | --- |
| 中文 | `/` | `SITE_LANG=zh next build` |
| English | `/en/` | `SITE_LANG=en next build` |

一条命令完成两次构建与合并:

```bash
SITE_BASE=/ai4math-radar npm run build:site
```

产物在 `dist/`(中文)与 `dist/en/`(English)。`SITE_BASE` 是站点所在的子路径:GitHub
项目页为 `/<仓库名>`,用户页或自定义域留空。

GitHub Pages 部署由 [`.github/workflows/publish.yml`](.github/workflows/publish.yml) 完成:

1. 每次 push 到 `main`、每 6 小时定时、或手动触发时运行;
2. 定时/手动运行时先执行 `npm run sync:all` 抓取新事件,把
   `data/ingested/*.json` 提交回仓库(这是跨次运行唯一需要持久化的状态);
3. 双语言构建后通过 GitHub Pages 发布。

启用步骤:

- 仓库 **Settings → Pages → Source** 选择 **GitHub Actions**;
- 在 **Settings → Secrets and variables → Actions** 添加 `LLM_PROVIDER`、`LLM_API_URL`、
  `LLM_API_KEY`、`LLM_MODEL`(不配置时采集使用 mock 摘要,只验证管线);
- 若子路径不是仓库名,添加仓库变量 `SITE_BASE` 覆盖。

## 核心特性

- **五类事件模型** —— 研究只是五类之一。论文、模型、基金、课程、政策文件都挂在事件之下,
  绝不作为一级分类;教育作为机构类下的分支,不单列。
- **信任模型** —— 每个事件有两个彼此独立、绝不混同的标签:`evidenceLevel`(E0–E4)、
  `sourceTier`(S0–S4),外加一份只增不改的 `verificationHistory` 证据记录。术语表见
  `/methodology`。
- **精选 + 自动采集** —— 内置事件加自动采集结果,按 slug 与来源 URL 去重合并;自动条目标记为
  `automated`,精选中文文案优先。
- **话题 / 时间线 / 趋势** —— 话题页包含事件间的血缘关系与按话题统计,另有活跃度面板。
- **数学公式渲染** —— 正文中的行内 LaTeX 在构建时渲染为 Unicode,客户端不打包数学库。
- **中英双版** —— 中文在根路径,English 在 `/en/`,共用同一份数据与信任模型。

## 路由

| 路由 | 用途 |
| --- | --- |
| `/` | 仪表盘:五类概览、最新事件、活跃度 |
| `/latest` | 事件流,支持分类 / 领域 / 证据等级 / 来源档位 / 时间筛选与搜索 |
| `/timeline` | 按年分组的时间线视图 |
| `/topics` · `/topics/[topic]` | 话题列表与详情(进展、趋势、论文、血缘关系) |
| `/research/[slug]` | 事件详情:发生了什么、为何重要、来源、验证历史 |
| `/sources` | 各来源最近一次同步的状态与游标(只读,同步见下) |
| `/search` · `/methodology` · `/about` | 全站搜索、信任标签术语表、数据政策 |

> `/research-map` 保留为兼容入口,跳转到 `/topics`。

## 采集

采集是命令行脚本(发布站点是纯静态导出,没有服务端,所以页面上没有常驻按钮):

```bash
npm run sync                 # 按配置增量抓取全部来源
npm run sync -- --source=arxiv
npm run sync -- --all --since=2026-01-01
```

`npm run dev` / `npm run dev:en` 会在 `127.0.0.1:3100` 顺带启动一个仅限本机的同步端点,
因此本地开发时 `/sources` 的「本地同步」卡片会出现「立即同步」按钮,点击即执行与上面相同的
管线(抓取 + 重建数据),完成后刷新页面生效。发布构建中这个按钮不存在。

脚本读取 `.env`(或环境变量)中的 `LLM_PROVIDER` / `LLM_API_URL` / `LLM_API_KEY` /
`LLM_MODEL` 生成结构化摘要,把结果写入 `data/ingested/`:

| 文件 | 内容 |
| --- | --- |
| `events.json` | 已接受的自动采集事件 |
| `fingerprints.json` | 已处理条目指纹,避免重复摘要 |
| `source-status.json` | 每个来源的最近成功 / 失败 / 游标 |
| `custom-sources.json` | 额外登记的 RSS / 页面来源 |

这些文件需要提交到仓库,GitHub Actions 才能接着上次的游标继续抓取。同步结束时会顺带刷新
`public/data/`,本地刷新页面即可看到新事件。

详情页的「事件脉络」按事件里出现的人名、机构、项目与模型名串起时间线。新事件在同步时自动
抽取这些名字;存量事件用 `npm run backfill:entities` 补一次(`--force` 全部重跑,
`--limit=N` 先抽样)。历史空档用 `npm run backfill:history` 按年回补 arXiv 论文
(默认 2018–2025、每年 14 条,`--from` / `--to` / `--per-year` 可调,`--dry` 只看选中结果)。
会议来源用 `npm run backfill:history:conf` 回补 NeurIPS、ICML(PMLR)与 ACL/EMNLP/NAACL/COLING
2018–2022 的论文集(同样支持 `--dry`),避免早年事件只剩 arXiv 一种出处。

## 项目结构

```text
app/                  # 路由(构建时渲染)
components/           # 布局、研究、话题、搜索、信息流、UI 组件
lib/
  db/                 # ResearchStore 契约 · SeedStore · 采集结果合并
  i18n/               # 中英文词典 + localize()
  staticData.ts       # ListEvent 投影与客户端搜索
  useDataset.ts       # 读取 public/data/<lang>.json
  math.ts             # LaTeX → Unicode
  verification.ts     # 信任模型(证据等级 / 来源档位)
  sources/            # ResearchSource:arXiv · GitHub · RSS / 页面 · 自定义来源
agents/researchTracker/   # tracker · classifier · summarizer
scripts/              # build-data · ingest · build-site
data/seed/            # 内置事件
data/ingested/        # 自动采集的持久状态(需提交)
types/                # 领域类型
```

数据流分两段:

```text
构建时   data/seed + data/ingested → public/data/{zh,en}.json → 静态 HTML
运行时   页面读取对应语言的 JSON → 客户端筛选 / 搜索 / 分页
```

详情页、首页、方法论、关于页在构建时即为完整 HTML;事件流、时间线、搜索与话题归档由客户端
读取数据集后筛选,因此不需要任何 API。

## 已登记的官方来源

来源目录见 `lib/sources/catalog.ts`:

- 官方实验室 / 公司 News RSS:OpenAI、Google DeepMind、Google AI、Microsoft Research、
  NVIDIA、Amazon Science
- 大学与研究机构 News:MIT News(Mathematics)、Isaac Newton Institute、IPAM、
  Simons Foundation News、Clay Mathematics Institute、MATRIX Institute
- 数学系 News:哥伦比亚大学、UCLA、威斯康星大学、UBC
- 学会 News:Australian Mathematical Society
- 教育与训练:AIMO、Mathematics in Lean、Lean Community
- 人物与公开观点:Terence Tao's blog、Timothy Gowers' blog、Scott Aaronson's blog、
  Quanta Mathematics
- 政策与共同体:Math & AI declarations、Association for Human Mathematics statements、IMO

## 来源档位规则

事件档位按以下优先级确定:

```text
1. 事件显式 sourceTier(人工覆盖)
2. catalog.ts 的 SOURCE_TIER_TABLE
3. sourceType 兜底
```

`arxiv` 与 `github` 均为 `S0`。

## 数据政策

- 不编造结果、arXiv ID 或 URL——无法核实的字段留空;来源 URL 无法确认的条目直接丢弃。
- 发布方自报的结果始终标注为"声称",并保留分母(样本量)。
- 自动采集直接进入事件流,不设人工审核队列;纠错以追加验证记录的方式留痕。

## 扩展

实现一个接口即可接入新的实时数据源:

```ts
export interface ResearchSource {
  id: string;
  label: string;
  fetchRecent(options?: { limit?: number; since?: string }): Promise<RawResearchItem[]>;
}
```

在 `getLiveResearchSources`(`lib/sources/index.ts`)中注册后,`npm run sync` 就会运行管线
`Source → RawResearchItem → Normalizer → Classifier → ResearchEvent`。

也可以把自定义 RSS / 页面来源写入 `data/ingested/custom-sources.json`,下一次同步即生效。
分类器目前基于关键词;可通过 `getLLMProvider()` 在同一契约背后换成大模型调用。
