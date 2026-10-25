/**
 * Page-level UI dictionary for the App Router pages.
 *
 * Scope: page copy only — headings, blurbs, empty states, legend explanations,
 * long-form policy text. `dict.ts` is the core dictionary: reuse its keys first
 * (`nav`, `common`, `home`, `detail`, `trust`, `footer`, `notFound`); this file
 * carries only what has no core equivalent. Research content (event titles,
 * summaries, paper/author/model/benchmark/dataset names, URLs) is never
 * translated — only the chrome around it.
 *
 * `en` is checked against `zh` with `satisfies`, so a missing or misspelled key
 * on the English side fails `npx tsc --noEmit`.
 */

/** Replaces `{name}` placeholders in a dictionary template. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match));
}

const zh = {
  /** Browser tab metadata (used by each page's `generateMetadata`). */
  meta: {
    latest: { title: "最新 AI4Math 生态事件", desc: "AI for Mathematics 的研究、人物、机构、资助、教育与政策共同体事件，可按六类筛选。" },
    timeline: { title: "时间线", desc: "已记录的 AI4Math 研究事件按时间顺序排列，逐年分组。" },
    topics: { title: "研究方向", desc: "AI4Math 的活跃研究方向，附事件计数与趋势。" },
    map: { title: "研究地图", desc: "AI4Math 研究版图的可视化：方向、子方向与血缘关系。" },
    search: { title: "搜索", desc: "全站搜索：研究事件、论文、方向、模型与 Benchmark。" },
    about: { title: "关于", desc: "AI4Math 生态雷达的工作方式：六类数据模型、手动同步管线与限制。" },
    methodology: { title: "方法论——如何阅读这些标签", desc: "本平台如何把核验状态、证据等级与来源层级彼此分开。" },
    sources: { title: "来源同步", desc: "手动同步 arXiv 与 GitHub，查看来源状态、增量游标和待审核事件。" },
  },

  /** Shared count phrases; pair with `countText()` for singular/plural. */
  count: {
    event: { one: "{n} 条事件", many: "{n} 条事件" },
    researchEvent: { one: "{n} 条研究事件", many: "{n} 条研究事件" },
    link: { one: "{n} 条关联", many: "{n} 条关联" },
  },

  /** app/latest/page.tsx */
  latest: {
    label: "生态信息流",
    title: "最新 AI4Math 生态事件",
    sub: "每条记录都是一个生态事件——发生了什么、谁在推动、为什么重要、去哪里读原始来源。可按六类事件与研究方向筛选。",
  },

  /** app/timeline/page.tsx */
  timeline: {
    sub: "全部已记录的生态事件按时间顺序排列，并按年份分组。用六类一级事件筛选，Research 事件还可通过研究子类型识别；打开任一条目可查看完整证据记录。",
    feedLink: "带方向筛选的信息流视图",
    empty: "没有事件符合该筛选。",
  },

  /** app/topics/page.tsx */
  topics: {
    sub: "当前 AI4Math 研究方向，从研究事件库实时聚合——{events} 条事件，覆盖 {areas} 个方向。",
    modelsLabel: "模型",
    benchmarksLabel: "Benchmark",
    latestLabel: "最近",
    openTopic: "打开方向",
  },

  /** app/topics/[topic]/page.tsx */
  topic: {
    statSub: "{count} · 最近 {date} · {code} 条附公开代码",
    openFeed: "在信息流中打开",
    timeTrend: "时间趋势",
    overview: "概览",
    rowQuantity: "研究数量",
    rowModels: "模型",
    rowBenchmarks: "Benchmark",
    rowDatasets: "数据集",
    relatedPapers: "相关论文",
    relatedModels: "相关模型",
    relatedBenchmarks: "相关 Benchmark",
    datasetsLabel: "数据集",
    noneRecorded: "暂无记录。",
    latestProgress: "最新进展",
    progressPlain: "{count}，均属该方向",
    progressMatch: "{count} 匹配“{q}”，均属该方向",
    searchPlaceholder: "在本方向内搜索…",
    searchBtn: "搜索",
    slugA: "方向 slug：",
    slugB: " ——用于",
    slugC: " 和",
    slugD: "。",
  },

  /** app/research/[slug]/page.tsx — extras beyond the core `detail.*` keys. */
  detail: {
    crumbEvent: "生态事件",
    demoEntry: "示例 / 演示条目",
    venueMissing: "未记录发表信息",
    howToReadLabels: "如何阅读这些标签",
    noPaperSuffix: " 来源。",
  },

  /** app/research-map/page.tsx */
  map: {
    label: "全景",
    sub: "AI4Math 生态版图：六类一级事件 × 研究方向，同时保留各方向的子方向与前后工作关联。刻意保持简单——不用图数据库，不引入重型依赖。",
    eventClasses: "生态事件类别",
    areasGlance: "研究方向一览",
    recordedLineage: "已记录的血缘",
    lineageEmpty: "尚未记录血缘关联。血缘会显示在每个事件的详情页（前作 → 本作 → 后续）。",
  },

  /** app/search/page.tsx */
  search: {
    label: "全站搜索",
    title: "搜索",
    subA: "通过",
    subB: "检索研究事件、论文、方向、模型与 Benchmark。",
  },

  /** app/about/page.tsx — full-page copy, both languages side by side. */
  about: {
    label: "关于",
    title: "AI4Math 研究情报平台",
    introA: "本站有意不做“AI 摘要论文的工具”。它的信息单元是",
    introStrong: "研究事件",
    introB: "——一条值得追踪的 AI for Mathematics 进展——并且每个页面都围绕研究者真正在问的问题组织。",
    pillars: [
      { q: "发生了什么？", a: "每条记录直接陈述事件本身，而不只是论文标题。" },
      { q: "为什么重要？", a: "有独立的意义区块解释其影响。" },
      { q: "针对什么问题？", a: "记录在每个事件的详情页中。" },
      { q: "改进了什么？", a: "在既有工作的基础上推进了什么，以及关联的模型与 Benchmark。" },
      { q: "它之前是什么？", a: "血缘关系：事件时间线中的前作。" },
      { q: "它之后是什么？", a: "已记录的后续工作。" },
      { q: "在哪里读原始工作？", a: "每个事件都保留其来源与论文 URL。" },
    ],
    dataModelTitle: "数据模型",
    dataModelA:
      "论文挂载在事件上，而不是反过来：一个事件可以引用多篇论文，一篇论文也可以支撑多个事件。Prisma 数据模型（PostgreSQL）覆盖 ",
    dataModelMid: " 以及关联表 ",
    dataModelAnd: " 和 ",
    dataModelEnd: "。",
    pipelineTitle: "Agent 数据管线（扩展接口）",
    pipelineBody:
      "各来源先被规范化、判定是否属于 AI4Math、映射到研究方向，并汇总成一个 ResearchEvent。v1 运行在模拟来源与模拟 LLM Provider 之上，因此站点可以离线使用。试试：",
    inspectApi: "查看 /api 下的 GET 响应",
    openMap: "打开研究地图",
    importanceLabel: "如何阅读重要度分数",
    importanceA: "",
    importanceStrong: "重要度是明确标注的 AI 辅助主观评估，不是客观科学指标。",
    importanceB:
      "核验状态、证据等级与来源层级保持客观且彼此独立。可选的 0–100 分数只表示编辑性的重要度判断，必须结合旁边的主观说明阅读；未评估事件不会被虚构分数。默认按日期排序，也可显式切换为重要度排序。",
    dataPolicyTitle: "数据政策",
    policy1A: "默认构建内置一份",
    policy1Strong: "演示数据集",
    policy1B:
      "，由公开公告与论文汇编而来；来自网络的条目保留其原始来源 URL，管线生成的合成示例会在页面上标记为",
    policy1C: "。",
    policy2: "不编造任何真实研究结果：事实无法核验时，字段宁可留空，也不猜测。",
    policy3A: "v1 不做抓取——",
    policy3B: " 是唯一的输入接口，未来的 arXiv / GitHub / 会议来源都将从这里接入。",
    notInV1Title: "v1 刻意不含的功能",
    notInV1: [
      "用户账户",
      "评论 / 点赞",
      "推荐算法",
      "多 Agent 协作",
      "向量数据库",
      "RAG",
      "邮件",
      "权限 / 付费",
      "移动应用",
    ],
    roadmapTitle: "路线图",
    roadmap: [
      { v: "V1", label: "研究信息流（当前 MVP）" },
      { v: "V2", label: "自动抓取 arXiv / GitHub" },
      { v: "V3", label: "AI4Math 研究 Agent" },
      { v: "V4", label: "自动生成研究事件" },
      { v: "V5", label: "研究时间线" },
      { v: "V6", label: "研究图谱" },
      { v: "V7", label: "研究趋势检测" },
      { v: "V8", label: "研究问题追踪" },
      { v: "V9", label: "完整的研究情报平台" },
    ],
    roadmapNoteA: "最可能让本平台区别于论文聚合器的两项能力是",
    roadmapNoteStrong1: "研究趋势检测",
    roadmapNoteB: "与",
    roadmapNoteStrong2: "研究血缘 / 研究图谱",
    roadmapNoteC: "。",
  },

  /** app/methodology/page.tsx — full-page copy plus per-code label tables. */
  methodology: {
    title: "方法论",
    introA: "本站是一个",
    introStrong: "追踪工具",
    introB:
      "，不是档案库，也不是期刊。它记录研究事件——值得跟进的 AI4Math 进展——并把三类判断彼此分开，供你形成自己的判断：",
    dimensions: [
      {
        n: "01",
        title: "核验状态",
        body: "核心主张此刻被佐证到什么程度——从单方宣称到独立核验，包含争议情形。",
      },
      {
        n: "02",
        title: "证据等级",
        body: "公开证据的成熟度：一句宣称、一份研究记录、一个可检验的产物，还是一次独立复核。",
      },
      {
        n: "03",
        title: "来源层级",
        body: "证据来自哪里：一手研究、官方公告，或更弱的渠道。",
      },
    ],
    sigStrong: "重要 ≠ 核验。",
    sigA: "历史上影响重大的主张仍可能处于",
    sigEm: "争议",
    sigB:
      "之中；经 Lean 检验的产物只为它所编码的形式化陈述背书，而非通常表述下的非形式化主张。本站在 2026 年 Navier–Stokes 争议中要区分的正是这一点。",
    legendStatus: "核验状态",
    legendEvidence: "证据等级",
    legendTier: "来源层级",
    legendType: "事件类型",
    statusDesc: {
      claimed: "单方宣称——仅由发起方宣布",
      paper_released: "论文已发布——存在公开的研究记录",
      under_verification: "核验中——关键方面仍在审查",
      partially_verified: "部分核验——已有重要佐证，仍有开放问题",
      independently_verified: "独立核验——可靠的独立来源已予佐证",
      disputed: "存在争议——已记录实质性争议",
      corrected: "已更正——已记录更正",
      retracted: "已撤回——该主张已被撤回",
    },
    evidenceDesc: {
      E0: "E0 · 无佐证——未记录任何公开证据",
      E1: "E1 · 单方主张——发起方作出了公开主张",
      E2: "E2 · 研究记录——存在论文或正式研究记录",
      E3: "E3 · 可检验产物——代码、证明或数据可被检验",
      E4: "E4 · 独立复核——已记录独立检查",
    },
    tierDesc: {
      S1: "S1 · 一手研究（论文、产物、官方仓库）",
      S2: "S2 · 官方公告（实验室、高校、会议记录）",
      S3: "S3 · 独立学术佐证",
      S4: "S4 · 可信的科技媒体报道",
      S5: "S5 · 社区发现线索",
    },
    typeDesc: {
      Research: "Research — technical and mathematical progress",
      People: "People — statements, talks and researcher movements",
      Institutions: "Institutions — initiatives, teams and collaborations",
      Funding: "Funding — grants, awards and disclosed resource commitments",
      Education: "Education — courses, training and teaching resources",
      PolicyCommunity: "Policy & Community — policies, declarations and community action",
    },
    derivationTitle: "评级是怎么来的",
    derivationIntro:
      "上面的图例说明每个标签的含义，但没说系统如何给一条事件定级。下面是自动派生的完整规则——每条记录先按可核查的事实套用这些规则得出默认评级；人工整理的字段永远优先，规则会误导之处再用手工覆写修正。",
    deriveEvidenceTitle: "证据等级的判定",
    deriveTierTitle: "来源层级的判定",
    deriveStatusTitle: "核验状态的判定",
    condLabel: "触发条件",
    resultLabel: "评级",
    deriveEvidence: [
      { cond: "带有 GitHub 仓库链接——代码、证明或数据可被检验", code: "E3" },
      { cond: "带有论文链接或关联论文列表——存在公开研究记录", code: "E2" },
      { cond: "仅有来源链接——发布方自己的公开主张", code: "E1" },
      { cond: "以上都没有", code: "E0" },
    ],
    deriveTier: [
      { cond: "来源为 arXiv、会议论文或 GitHub 仓库", code: "S1" },
      { cond: "来源为博客、演示或其他渠道", code: "S2" },
    ],
    deriveStatus: [
      { cond: "证据等级为 E2 或 E3——有研究记录或可检验产物", code: "paper_released" },
      { cond: "证据等级为 E0 或 E1——尚无公开研究记录", code: "claimed" },
    ],
    deriveNotesTitle: "两条例外",
    deriveNote1A: "优先级：",
    deriveNote1B:
      "手工覆写 ＞ 人工整理字段 ＞ 自动派生。一条事件若已显式标注了等级或状态，派生规则不会覆盖它。",
    deriveNote2A: "规则会误导处使用手工覆写：",
    deriveNote2B: "例如竞赛成绩由主办方口径给出、并非论文证据，因而保持",
    deriveNote2C:
      "（单方宣称、一级主张）。这类覆写记录在代码的 OVERRIDES 表中，只在必要时使用。",
    dataPolicyTitle: "数据政策",
    policy1:
      "每条人工整理的条目都保留其原始来源 URL。候选条目的来源若无法确认，宁可剔除，也不发布没有链接的记录。",
    policy2:
      "发布方口径的结果按“主张”记录，并保留分母（例如已发布的语料按稿件数计，而不是按已证明的定理数计）。",
    policy3A: "由抓取管线生成的条目会标记为",
    policy3B: "，直到经过人工复核。",
    policy4: "更正与撤回会追加到事件的核验历史中，而不是悄悄改动记录。",
    seeAlsoA: "另见：",
    seeAlsoB: "（数据模型与管线），或",
    seeAlsoC: "（按时间顺序的视图）。",
  },

  /** app/sources/page.tsx */
  sources: {
    title: "来源同步",
    subtitle: "不使用定时任务：点击同步按钮手动拉取增量内容，并查看每个来源的成功、失败和游标状态。",
    pending: "待审核事件",
    sync: "同步",
    syncing: "同步中…",
    never: "从未记录",
    lastSuccess: "最近成功",
    lastAttempt: "最近尝试",
    cursor: "增量游标",
    result: "最近结果",
    error: "错误",
    success: "成功",
    idle: "未同步",
  },

  /** app/not-found.tsx — title/body/backHome come from the core `notFound`. */
  notFound: {
    latestProgress: "最新进展",
  },
};

const en = {
  /** Browser tab metadata (used by each page's `generateMetadata`). */
  meta: {
    latest: { title: "Latest AI4Math Ecosystem Events", desc: "Research, people, institution, funding, education and policy events in AI for Mathematics, filterable by class." },
    timeline: { title: "Timeline", desc: "Chronological view of recorded AI4Math research events, year by year." },
    topics: { title: "Topics", desc: "Active research areas in AI4Math, with event counts and trends." },
    map: { title: "Research Map", desc: "A visual map of the AI4Math research landscape: areas, sub areas and lineage." },
    search: { title: "Search", desc: "Full-site search across research events, papers, topics, models and benchmarks." },
    about: { title: "About", desc: "How the AI4Math Ecosystem Radar works: six-class data model, pipeline and limitations." },
    methodology: { title: "Methodology — how to read the labels", desc: "How this tracker keeps verification status, evidence level and source tier separate." },
    sources: { title: "Source synchronization", desc: "Manually sync arXiv and GitHub, inspect source freshness, incremental cursors and pending events." },
  },

  count: {
    event: { one: "{n} event", many: "{n} events" },
    researchEvent: { one: "{n} research event", many: "{n} research events" },
    link: { one: "{n} link", many: "{n} links" },
  },

  latest: {
    label: "Ecosystem feed",
    title: "Latest AI4Math Ecosystem Events",
    sub: "Every entry is an ecosystem event — what happened, who is moving the field, why it matters, and where to read the source. Filter by class and area, and search titles, summaries, models and benchmarks.",
  },

  timeline: {
    sub: "Every recorded ecosystem event in chronological order, grouped by year. Use the six-class filter to narrow to research, people, institutions, funding, education or policy; open an entry for its full evidence record.",
    feedLink: "Feed view with area filters",
    empty: "No events match this filter.",
  },

  topics: {
    sub: "Current AI4Math research directions, aggregated live from the Research Event store — {events} events across {areas} areas.",
    modelsLabel: "Models",
    benchmarksLabel: "Benchmarks",
    latestLabel: "latest",
    openTopic: "Open topic",
  },

  topic: {
    statSub: "{count} · latest {date} · {code} with public code",
    openFeed: "Open in feed",
    timeTrend: "Time trend",
    overview: "Overview",
    rowQuantity: "Research quantity",
    rowModels: "Models",
    rowBenchmarks: "Benchmarks",
    rowDatasets: "Datasets",
    relatedPapers: "Related papers",
    relatedModels: "Related models",
    relatedBenchmarks: "Related benchmarks",
    datasetsLabel: "Datasets",
    noneRecorded: "None recorded yet.",
    latestProgress: "Latest progress",
    progressPlain: "{count} in this area",
    progressMatch: "{count} matching “{q}” in this area",
    searchPlaceholder: "Search within topic...",
    searchBtn: "Search",
    slugA: "Topic slug:",
    slugB: " — used by",
    slugC: " and the ",
    slugD: ".",
  },

  detail: {
    crumbEvent: "Ecosystem event",
    demoEntry: "demo / example entry",
    venueMissing: "Publication details not recorded",
    howToReadLabels: "How to read these labels",
    noPaperSuffix: " source.",
  },

  map: {
    label: "Landscape",
    sub: "A first-pass visualization of the AI4Math landscape: research areas, their sub areas and how events link to earlier and later work. Deliberately simple — no graph database, no heavy dependencies (see README for the V6 Research Graph roadmap).",
    eventClasses: "Ecosystem event classes",
    areasGlance: "Research areas at a glance",
    recordedLineage: "Recorded lineage",
    lineageEmpty:
      "No lineage links recorded yet. They appear on each event's detail page (Previous → This → Follow-up).",
  },

  search: {
    label: "Full-site search",
    title: "Search",
    subA: "Searches Research Events, Papers, Topics, Models and Benchmarks through",
    subB: ".",
  },

  about: {
    label: "About",
    title: "A Research Intelligence Platform for AI4Math",
    introA: "This site is deliberately not “an AI that summarizes papers”. Its unit of information is the ",
    introStrong: "Research Event",
    introB:
      " — a piece of progress in AI for Mathematics worth tracking — and every page is organized around the questions researchers actually ask.",
    pillars: [
      { q: "What happened?", a: "Every entry states the event itself, not just a paper title." },
      { q: "Why does it matter?", a: "A separate significance block explains the impact." },
      { q: "What problem does it address?", a: "Recorded on the detail page for each event." },
      {
        q: "What did it improve?",
        a: "Importance assessment plus linked models/benchmarks.",
      },
      { q: "What came before it?", a: "Lineage: previous work in the event timeline." },
      { q: "What came after it?", a: "Follow-up work when it has been recorded." },
      {
        q: "Where can I read the original work?",
        a: "Every event keeps its source and paper URLs.",
      },
    ],
    dataModelTitle: "Data model",
    dataModelA:
      "Papers are attached to events, never the other way around: one event can reference several papers, and one paper can support several events. The Prisma schema (PostgreSQL) models ",
    dataModelMid: " and the join tables ",
    dataModelAnd: " and ",
    dataModelEnd: ".",
    pipelineTitle: "Agent data pipeline (extension interface)",
    pipelineBody:
      "Sources are normalized, classified as AI4Math or not, mapped to a research area, and summarized into a ResearchEvent. In v1 this runs on a mock source and a mock LLM provider so the site works offline. Try it:",
    inspectApi: "Inspect GET responses under /api",
    openMap: "Open the Research Map",
    importanceLabel: "How to read importance scores",
    importanceA: "",
    importanceStrong: "Importance is an explicitly labelled AI-assisted subjective assessment, not an objective scientific metric.",
    importanceB:
      "Verification status, evidence level and source tier remain objective and separate. Any optional 0–100 score records an editorial judgement and must be read with its subjective note; unassessed events are never given invented scores. Date is the default order, with importance available only as an explicit choice.",
    dataPolicyTitle: "Data policy",
    policy1A: "The default build ships a ",
    policy1Strong: "demo dataset",
    policy1B:
      " compiled from public announcements and papers; entries sourced from the web keep their original source URL, and synthetic pipeline examples are flagged as ",
    policy1C: " on the page.",
    policy2:
      "No real research result is fabricated: when a fact could not be verified, the field is left empty instead of guessed.",
    policy3A: "No crawling in v1 — ",
    policy3B: " is the single input interface where arXiv/GitHub/Conference sources will plug in.",
    notInV1Title: "Not in v1 (on purpose)",
    notInV1: [
      "user accounts",
      "comments / likes",
      "recommendation algorithms",
      "multi-agent collaboration",
      "vector database",
      "RAG",
      "email",
      "permissions / payments",
      "mobile app",
    ],
    roadmapTitle: "Roadmap",
    roadmap: [
      { v: "V1", label: "Research Feed (this MVP)" },
      { v: "V2", label: "Automatic arXiv / GitHub ingestion" },
      { v: "V3", label: "AI4Math Research Agent" },
      { v: "V4", label: "Automatic Research Event generation" },
      { v: "V5", label: "Research Timeline" },
      { v: "V6", label: "Research Graph" },
      { v: "V7", label: "Research Trend Detection" },
      { v: "V8", label: "Research Question Tracking" },
      { v: "V9", label: "Full Research Intelligence Platform" },
    ],
    roadmapNoteA:
      "The two capabilities most likely to distinguish this platform from a paper aggregator are ",
    roadmapNoteStrong1: "Research Trend Detection",
    roadmapNoteB: " and ",
    roadmapNoteStrong2: "Research Lineage / Research Graph",
    roadmapNoteC: ".",
  },

  methodology: {
    title: "Methodology",
    introA: "This site is a ",
    introStrong: "tracker",
    introB:
      ", not an archive and not a journal. It records Research Events — pieces of AI4Math progress worth following — and it keeps three judgements separate so you can form your own:",
    dimensions: [
      {
        n: "01",
        title: "Verification status",
        body: "How far the core claim is corroborated right now — from a bare claim to independent verification, including disputes.",
      },
      {
        n: "02",
        title: "Evidence level",
        body: "How mature the public evidence is: a claim, a research record, an inspectable artifact, or an independent check.",
      },
      {
        n: "03",
        title: "Source tier",
        body: "Where the evidence comes from: primary research, an official announcement, or weaker channels.",
      },
    ],
    sigStrong: "Significance ≠ verification.",
    sigA: " A historically big claim can still be ",
    sigEm: "disputed",
    sigB:
      "; a Lean-checked artifact certifies the formal statement it encodes, not the informal claim as usually stated. That distinction is exactly what the 2026 Navier–Stokes dispute on this site is about.",
    legendStatus: "Verification status",
    legendEvidence: "Evidence level",
    legendTier: "Source tier",
    legendType: "Event type",
    statusDesc: {
      claimed: "Claimed — announced by the originating party only",
      paper_released: "Paper released — a public research record exists",
      under_verification: "Under verification — material aspects still under scrutiny",
      partially_verified: "Partially verified — important corroboration, open questions remain",
      independently_verified:
        "Independently verified — reliable independent sources corroborate it",
      disputed: "Disputed — material contestation recorded",
      corrected: "Corrected — a correction has been recorded",
      retracted: "Retracted — the claim was withdrawn",
    },
    evidenceDesc: {
      E0: "E0 · Unsubstantiated — no public evidence recorded",
      E1: "E1 · Primary claim — the originating party made a public claim",
      E2: "E2 · Research record — a paper or formal research record exists",
      E3: "E3 · Inspectable artifact — code, proofs or data can be inspected",
      E4: "E4 · Independent check — independent checking is recorded",
    },
    tierDesc: {
      S1: "S1 · Primary research (paper, artifact, official repository)",
      S2: "S2 · Official announcement (lab, university, venue record)",
      S3: "S3 · Independent scholarly corroboration",
      S4: "S4 · Reputable science/tech media",
      S5: "S5 · Community discovery signal",
    },
    typeDesc: {
      Research: "Research — technical and mathematical progress",
      People: "People — statements, talks and researcher movements",
      Institutions: "Institutions — initiatives, teams and collaborations",
      Funding: "Funding — grants, awards and disclosed resource commitments",
      Education: "Education — courses, training and teaching resources",
      PolicyCommunity: "Policy & Community — policies, declarations and community action",
    },
    derivationTitle: "How the ratings are assigned",
    derivationIntro:
      "The legends above say what each label means, but not how a rating is decided. Below is the full derivation: every record is first scored against these rules from its verifiable facts; curated fields always win, and manual overrides correct the cases where the rules would mislead.",
    deriveEvidenceTitle: "Evidence level",
    deriveTierTitle: "Source tier",
    deriveStatusTitle: "Verification status",
    condLabel: "Trigger",
    resultLabel: "Rating",
    deriveEvidence: [
      { cond: "Has a GitHub repository link — code, proofs or data can be inspected", code: "E3" },
      { cond: "Has a paper link or a list of associated papers — a research record exists", code: "E2" },
      { cond: "Has only a source link — the originating party's own public claim", code: "E1" },
      { cond: "None of the above", code: "E0" },
    ],
    deriveTier: [
      { cond: "Source is arXiv, a conference paper or a GitHub repository", code: "S1" },
      { cond: "Source is a blog, a demo or any other channel", code: "S2" },
    ],
    deriveStatus: [
      { cond: "Evidence level is E2 or E3 — a research record or inspectable artifact", code: "paper_released" },
      { cond: "Evidence level is E0 or E1 — no public research record yet", code: "claimed" },
    ],
    deriveNotesTitle: "Two exceptions",
    deriveNote1A: "Precedence: ",
    deriveNote1B:
      "manual override > curated field > automatic derivation. If an event already states a level or status explicitly, the derivation rules never overwrite it.",
    deriveNote2A: "Manual overrides cover the cases where the rules mislead: ",
    deriveNote2B:
      "a competition result, for example, is a grading claim from the contest side rather than evidence in a paper, so it stays ",
    deriveNote2C:
      " (claimed, primary claim). Such overrides live in the code's OVERRIDES table and are used only where needed.",
    dataPolicyTitle: "Data policy",
    policy1:
      "Every curated entry keeps its original source URL. If a candidate's source could not be confirmed, it was dropped rather than shipped without a link.",
    policy2:
      "Publisher-reported results are recorded as claims, with denominators preserved (e.g. a released corpus is counted as manuscripts, not as proven theorems).",
    policy3A: "Automated entries produced by the ingest pipeline are labelled ",
    policy3B: " until a human reviews them.",
    policy4:
      "Corrections and withdrawals are appended to an event's verification history instead of silently editing the record.",
    seeAlsoA: "See also ",
    seeAlsoB: " for the data model and pipeline, or ",
    seeAlsoC: " for the chronological view.",
  },

  sources: {
    title: "Source synchronization",
    subtitle:
      "No scheduler: trigger incremental pulls manually and inspect success, failure and cursor state for each source.",
    pending: "Pending events",
    sync: "Sync",
    syncing: "Syncing…",
    never: "Never recorded",
    lastSuccess: "Last success",
    lastAttempt: "Last attempt",
    cursor: "Incremental cursor",
    result: "Last result",
    error: "Error",
    success: "Success",
    idle: "Never synced",
  },

  notFound: {
    latestProgress: "Latest progress",
  },
};

// Compile-time guard: `en` must carry every key of `zh` (and vice versa as far
// as structural assignability goes), so a missing translation fails `tsc`.
const _keyCheck: typeof zh = en;

export const pagesDict = { zh, en };

export type PagesDict = (typeof pagesDict)["zh"];

/** "{n} 条事件" / "{n} events" — picks singular/plural by count. */
export function countText(p: PagesDict, n: number, kind: keyof PagesDict["count"]): string {
  return fill(n === 1 ? p.count[kind].one : p.count[kind].many, { n });
}






