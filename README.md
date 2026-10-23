# AI4Math Ecosystem Radar · AI4Math 生态雷达

[English](README.en.md) · **中文**

一个面向 **AI for Mathematics(AI4Math)** 的生态情报平台。它不只是罗列论文,而是追踪六类
生态事件——**研究 · 人物 · 机构 · 资金 · 教育 · 政策与社区**——回答发生了什么、谁在推动这个
领域、为何重要、以及它如何与既往工作相连。

技术栈为 **Next.js(App Router)+ React + TypeScript + Tailwind CSS**;内置一份数据集,可
**零配置**直接运行;生产环境的数据层则选用 Prisma + PostgreSQL。

## 快速开始

```bash
npm install
npm run dev
```

打开 <http://localhost:3000>。没有数据库时,应用通过与 API 相同的 store 接口提供内置演示数据。

如需连接 PostgreSQL:

```bash
cp .env.example .env     # 设置 DATABASE_URL
npm run db:push          # 建表
npm run db:seed          # 从 data/seed/events.ts 导入数据
npm run dev
```

> 界面默认为**简体中文**,右上角有 `中文 / EN` 切换开关。

## 核心特性

- **六类事件模型** —— 研究只是六类之一,而非全部。论文、模型、基金、课程、政策文件都挂在事件
  之下,绝不作为一级分类。
- **信任模型** —— 每个事件有三个彼此独立、绝不混同的标签:`verificationStatus`
  (声称 → 独立验证 / 存疑 / 撤回)、`evidenceLevel`(E0–E4)、`sourceTier`(S1–S5),外加一份
  只增不改的 `verificationHistory` 溯源记录。术语表见 `/methodology`。
- **精选 + 自动采集** —— 内置 98 个事件(87 个有来源 + 11 个标注为 demo),并有一条实时采集
  管线(`arXiv` / `GitHub`),其产出标记为 `automated`,按 slug 去重合并。
- **研究地图 / 话题 / 时间线 / 趋势** —— 事件间的血缘关系、按话题统计,以及一个 90 天活跃度面板。
- **数学公式渲染** —— 正文中的行内 LaTeX 在服务端渲染为 Unicode,因此无需向客户端打包任何
  数学库。

## 路由

| 路由 | 用途 |
| --- | --- |
| `/` | 仪表盘:六类概览、最新事件、活跃度、采集管线 |
| `/latest` | 事件流,支持分类 / 领域 / 状态筛选、搜索、排序 |
| `/timeline` | 按年分组的时间线视图 |
| `/topics` · `/topics/[topic]` | 话题列表与详情(进展、趋势、论文) |
| `/research/[slug]` | 事件详情:发生了什么、为何重要、来源、验证历史 |
| `/research-map` | 六类 × 研究领域地图,含已记录的血缘关系 |
| `/sources` | 手动数据源同步状态、游标、待审核数 |
| `/search` · `/methodology` · `/about` | 全站搜索、信任标签术语表、数据政策 |

## API

| 接口 | 用途 |
| --- | --- |
| `GET /api/events?type=&area=&sort=&q=&limit=` | 事件列表 |
| `GET /api/events/[slug]` | 单个事件 |
| `GET /api/topics` · `GET /api/topics/[slug]` | 话题统计 |
| `GET /api/search?q=` | 全站搜索 |
| `GET /api/research-map` | 地图节点 / 边 |
| `GET /api/trends?windowDays=90` | 各领域近期与上一周期的活跃对比 |
| `GET /api/sources` | 数据源注册表 + 最近同步 + 待审数 |
| `POST /api/agents/ingest` | 运行采集管线(`source: "arxiv" \| "github" \| mock`) |

```bash
curl "http://localhost:3000/api/events?area=Theorem%20Proving&limit=5"
curl -X POST http://localhost:3000/api/agents/ingest \
     -H "content-type: application/json" -d '{ "source": "arxiv", "limit": 20 }'
```

## 项目结构

```text
app/                  # 路由 + API 路由处理器
components/           # 布局、研究、话题、搜索、UI 组件
lib/
  db/                 # ResearchStore 契约 · SeedStore · PrismaStore
  i18n/               # 中英文词典 + localize()
  math.ts             # 服务端 LaTeX → Unicode
  verification.ts     # 信任模型(状态 / 证据 / 层级)
  sources/            # ResearchSource:mock · arXiv · GitHub
agents/researchTracker/   # tracker · classifier · summarizer
data/seed/            # 内置事件 + 生态场景
prisma/               # schema + 种子脚本
types/                # 领域类型
```

数据流是:

```text
前端 → API(路由处理器)→ ResearchStore → 生态 ResearchEvent
```

`lib/db/index.ts` 负责选择 store:设置了 `DATABASE_URL` → `PrismaStore`,未设置 →
`SeedStore`。两者实现同一个 `ResearchStore` 接口,因此页面和路由无需关心当前用的是哪个。

## 数据政策

- 不编造结果、arXiv ID 或 URL——无法核实的字段留空;来源 URL 无法确认的条目直接丢弃,绝不带
  着坏链接上线。
- 发布方自报的结果始终标注为"声称",并保留分母(样本量)。
- `importanceScore` 是可选的、明确主观的 0–100 AI 辅助评估,展示时始终附带说明,且绝不与信任
  标签混为一谈。默认按时间排序。
- 合成的演示场景标记为 `isDemo`,渲染时带 `demo` 徽标。

## 扩展

实现一个接口即可接入新的实时数据源:

```ts
export interface ResearchSource {
  id: string;
  label: string;
  fetchRecent(options?: { limit?: number }): Promise<RawResearchItem[]>;
}
```

在 `liveResearchSources`(`lib/sources/index.ts`)中注册后,
`POST /api/agents/ingest` 就会运行管线
`Source → RawResearchItem → Normalizer → Classifier → ResearchEvent`。

分类器目前基于关键词;可通过 `getLLMProvider()` 在同一契约背后换成大模型调用。
