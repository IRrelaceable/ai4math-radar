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
    latest: { title: "最新 AI4Math 生态事件", desc: "AI for Mathematics 的研究、人物、机构与教育、资助与政策共同体事件，可按五类筛选。" },
    math4ai: { title: "Math4AI 方向", desc: "研究对象是 AI 系统本身的科研事件——改进训练方法、用数学理论改进算法、解释模型的数学性质——按研究对象、核心目标与实际贡献区分，含双向兼有的事件。" },
    timeline: { title: "时间线", desc: "按年份回看已记录的 AI4Math 事件，含逐年记录量与事件类别构成。" },
    tasks: { title: "数学档案", desc: "收录 OpenAI、Anthropic 已公开的数学问题、评测案例、结果与一手来源。" },
    search: { title: "搜索", desc: "全站搜索：研究事件、论文、方向、模型与 Benchmark。" },
    about: { title: "关于", desc: "AI4Math 生态雷达：追踪研究进展、人物、机构、资助与政策事件，每条记录都保留原始来源链接。" },
    methodology: { title: "标签释义——如何阅读这些标签", desc: "证据等级、来源类型、事件类型、发表状态、AI 参与程度、方向轴与分类维度的标签释义。" },
    graph: { title: "研究图谱", desc: "用可交互散点图探索事件聚集，并通过研究主题与数学领域的交叉矩阵进入具体事件列表。" },
  },

  /** Shared count phrases; pair with `countText()` for singular/plural. */
  count: {
    event: { one: "{n} 条事件", many: "{n} 条事件" },
    researchEvent: { one: "{n} 条研究事件", many: "{n} 条研究事件" },
    link: { one: "{n} 条关联", many: "{n} 条关联" },
  },

  /** Shared list pager (components/ui/Pager.tsx). */
  pager: {
    prev: "上一页",
    next: "下一页",
    pageOf: "第 {page} / {total} 页",
    pagination: "分页",
  },

  /** app/latest/page.tsx */
  latest: {
    label: "生态信息流",
    title: "最新 AI4Math 生态事件",
    sub: "追踪研究进展及其生态动态；按事件类别、研究主题和数学领域找到你关心的记录。",
    listEyebrow: "当前收录",
    listTitle: "事件列表",
  },

  /** Tracking section on research detail pages; the /events route was retired. */
  events: {
    label: "持续追踪",
    projectTitle: "所属项目",
    initialUnit: "条首次记录",
    changesUnit: "条后续变化",
    verificationUnit: "条核验记录",
    sourcesUnit: "个补充来源",
    relationsUnit: "个关联事件",
    relationsTitle: "关联事件（不计入事件线）",
    relationKinds: { reproduction: "独立复现", overturn: "推翻 / 质疑", related: "研究关联" },
    kinds: { initial: "首次记录", followup: "后续进展", verification: "核验", correction: "更正", retraction: "撤回", report: "再报道" },
    sourcesTitle: "其他来源",
    sourcesHint: "对同一事项的再次陈述只计入来源，不计入后续变化。",
  },

  /** app/math4ai/page.tsx */
  math4ai: {
    label: "方向轴",
    title: "Math4AI：数学服务 AI 的进展",
    sub: "数学作为方法、理论或测试场，研究对象是 AI 系统本身：从训练方法、算法改进到模型性质解释。",
    feedEyebrow: "事件目录",
    feedTitle: "逐条查看 Math4AI 进展",
    feedIntro: "包含 Math4AI 与双向兼有的事件；可按类别、研究主题、数学领域和时间继续筛选。",
    overview: {
      eyebrow: "结构概览",
      title: "这批进展分布在哪些方向",
      note: "下列统计与本页信息流同一口径：包含 math4ai 及双向兼有的事件；研究主题按单一主类、数学领域按多标签计数，因此领域合计可能多于总数。点击年份、主题或领域可筛选下方事件。",
      total: "事件总数",
      pure: "纯 Math4AI",
      both: "双向兼有",
      byTheme: "按研究主题",
      byField: "按数学领域",
      byYear: "按年份",
      unassigned: "暂无可归类记录。",
      yearUnit: "条",
    },
  },

  /** app/graph/page.tsx */
  graph: {
    label: "分类视图",
    title: "研究图谱",
    sub: "散点图用于探索事件在不同分类下的聚集，矩阵用于查看研究主题与数学领域交叉处的准确数量。两种视图都能进入具体事件。",
    viewScatter: "事件散点图",
    scatterSub: "每个点是一条事件记录；切换分类维度时，只显示属于该维度的事件，点击图例可进一步筛选。数学领域视图只显示有具体领域标签的研究，多领域事件可进入多个领域筛选。点大小反映事件线中的进展；点间距离不代表可量化的研究关联。",
    viewMatrix: "研究分布矩阵",
    matrixSub: "横向是数学领域，纵向是研究主题。颜色越深，落在该组合的事件越多；点击有数字的格子查看具体记录。",
    activePairs: "个有记录的主题 × 领域组合",
    scatter: {
      colorBy: "色彩轴",
      axisCap: "研究主题",
      axisMath: "数学领域",
      axisDirection: "研究方向",
      axisType: "事件类别",
      gravity: "簇引力",
      spread: "簇扩散",
      dotSize: "点大小",
      labels: "区域标签",
      halo: "簇晕",
      search: "搜索标题高亮…",
      reset: "重置",
      relayout: "重新布局",
      exportSvg: "导出 SVG",
      exportPng: "导出 PNG",
      zoomIn: "放大",
      zoomOut: "缩小",
      fit: "适配视图",
      legend: "图例 · 点击筛选",
      all: "本维度全部",
      hint: "滚轮缩放 · 拖拽平移 · 悬停看详情 · 点击圆点进入事件",
      progress: "项进展",
      statusDots: "个点",
      layoutGroup: "布局",
      displayGroup: "显示",
      findGroup: "查找",
      actionGroup: "操作",
      searchMatches: "命中 {n} 条",
      searchNone: "无匹配，换个关键词试试",
      advanced: "布局与导出设置",
    },
    themeAxis: "研究主题",
    domainAxis: "数学领域",
    total: "合计",
    legend: "事件数",
    legendLow: "少",
    legendHigh: "多",
    cellHint: "{cap} × {math}：{n} 条",
    drill: "点击格子钻取到信息流",
    empty: "·",
    multiLabel: "一条研究可触及多个数学领域，会进入每个匹配的格子，因此格子之和可能大于合计。",
    noMath: "{n} 条研究事件未指向七个具体数学领域，因此不进入数学领域散点图或矩阵；仍可在研究主题等视图中查看。",
    noCap: "{n} 条生态事件（人物、机构、资助、政策共同体）不进入研究主题、数学领域散点图或矩阵；可在事件类型视图中查看。",
    metaEvents: "{n} 条事件",
    metaCapped: "{n} 条有研究主题",
  },

  /** app/timeline/page.tsx */
  timeline: {
    label: "编年档案",
    sub: "从早期探索到最近进展，按年份回看已收录的事件。",
    archiveEyebrow: "按时间浏览",
    archiveTitle: "逐年记录",
    archiveIntro: "选择事件类别或搜索关键词，再按年份、月份定位；每条记录都可进入详情或查看原始来源。",
    empty: "没有事件符合该筛选。",
    decadeNav: "按时间跳转",
    overview: {
      total: "已记录事件",
      span: "时间跨度",
      years: "有记录的年份",
      updated: "最近更新",
      density: "逐年记录量 · 点击跳转",
      composition: "年度类别构成 · 点击筛选",
      peak: "峰值 {year} · {n} 条",
      scale: "柱高按平方根缩放",
      hint: "每格一年，按十年分组；颜色越深记录越多，点击柱子跳到该年。",
    },
    monthInFeed: "在信息流中查看这个月",
    denseMonth: "本月 {n} 条，按日期分组",
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
    paperSort: "排序",
    paperSortRecent: "最近",
    paperSortTitle: "标题",
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
    slugC: " 页面。",
  },

  /** app/research/[slug]/page.tsx — extras beyond the core `detail.*` keys. */
  detail: {
    crumbEvent: "生态事件",
    crumbResearch: "研究进展",
    demoEntry: "示例 / 演示条目",
    venueMissing: "未记录发表信息",
    howToReadLabels: "如何阅读这些标签",
  },

  /** app/math-archive/page.tsx */
  tasks: {
    label: "数学档案",
    title: "数学档案",
    sub: "收录 OpenAI 与 Anthropic 公开的数学问题、评测案例、结果和来源。具体题目与整套题集分别标明；国内模型的实测结果将在完成后加入。",
    openai: "OpenAI",
    anthropic: "Anthropic",
    deepmind: "Google DeepMind",
    count: { one: "{n} 条记录", many: "{n} 条记录" },
    sectionEmpty: "这一分类暂无记录。",
    pageEmpty: "暂无档案记录。",
    howToRead: "信息流中的条目带有证据等级与来源类型标记，含义见标签释义。",

    /** Primary structure: one reproducible task, frontier vs domestic models. */
    benchmark: {
      label: "任务与来源",
      title: "公开问题与评测案例",
      intro: "按时间排列涉及两家模型的任务来源案例。已明确评测单位的条目会标出「整套题集」或「具体数学问题」，展开后可看评测口径；其余条目保留原问题、结果和出处，尚未逐项提取为可执行实验。同一题的后续进展仍按原记录展示，因此案例数不等于互不重复的题目数。",
      pendingNote: "国内模型结果将在完成实测与核验后加入。",
      challengeCount: "共 {n} 条来源案例",
      unitBenchmark: "整套题集",
      unitProblem: "具体数学问题",
      pendingCount: "{n} 待填",
      fieldBenchmark: "题目来源",
      fieldTask: "可复现任务",
      fieldMetric: "评测口径",
      fieldSourceCase: "来源案例",
      compareTitle: "公开结果与资源",
      colModel: "模型",
      colResult: "解题结果",
      colResources: "所需资源",
      originFrontier: "前沿实验室",
      originDomestic: "国内模型",
      statusReported: "来源已公开",
      statusPending: "待填",
      compareNote: "同一题集上的成绩也可能使用不同模型、搜索预算或评分协议；原方未披露的条件不推定相同。",
      methodLink: "标签与口径释义",
      sourceNote: "每项结果附其原始来源；公开目标不等于原实验全部条件可复现。",
    },

    archiveLibraryTitle: "案例来源库",
    archiveLibraryHint: "以下是提取可复现题目的原始公开案例，按年份编排，供回到出处核对；题目对比请见上方。",

    /** Editorial research archive imported from the source timeline document. */
    archive: {
      label: "研究档案",
      title: "AI4Math 进展时间线 · {range}",
      intro: "按年份整理 OpenAI、Anthropic、Google DeepMind、联合支持及独立研究者的数学成果，共 {n} 条。展开任意一条可查看研究问题、结果、参与人与原始来源。",
      caveat: "日期为成果公开日，不一定是研究完成日；只能精确到月的记录保留到月。竞赛题、已知定理的形式化与重现，与首次解决开放问题不同；预印本与候选证明尚未经过独立验证。DeepMind 条目依据 Nature 论文与官方公告编辑核实，非原始时间线文档逐字记录。",
      readingTitle: "如何阅读这份时间线",
      filterAll: "全部",
      filterOpenai: "OpenAI 相关",
      filterAnthropic: "Anthropic 相关",
      filterDeepmind: "DeepMind 相关",
      filterJoint: "联合",
      filterIndependent: "独立",
      badge: { openai: "OpenAI", anthropic: "Anthropic", deepmind: "DeepMind", joint: "联合", independent: "独立" },
      sampleTag: "样例",
      sampleNote: "标为「样例」的条目摘自同一批 722 篇手稿，只作抽样展示，不另计为独立成果。",
      recordCount: "{n} 条",
      recordCountOne: "{n} 条",
      yearCount: "{n} 条",
      yearCountOne: "{n} 条",
      yearOnly: "{y} 年",
      dateConvention: "公开日期",
      fields: {
        attribution: "归属",
        problem: "研究问题",
        result: "结果",
        model: "模型",
        people: "参与人",
        division: "人与模型分工",
        verification: "验证情况",
        scope: "适用范围",
        extras: "补充说明",
        sources: "来源",
        related: "相关条目",
      },
      expand: "查看完整核查记录",
      collapse: "收起核查记录",
      baselinesTitle: "相关模型能力背景",
      baselinesHint: "以下两个发布提供当时的能力参照。评测条件不同，分数不宜直接比较。",
      sourceNote: "资料核对截至 2026-10-16。时间线持续更新，未列出的成果不代表未发生。",
    },

    /** Recent lab items picked up by the automated ingest pipeline. */
    automated: {
      title: "近期动态",
      hint: "来自两家实验室及官方渠道的近期条目，按实验室分组。",
    },
  },

  /** app/search/page.tsx */
  search: {
    label: "全站搜索",
    title: "搜索",
    sub: "检索研究事件、论文、方向、模型与 Benchmark；中文与英文关键词均可。",
  },

  /** app/about/page.tsx — reader-facing copy, both languages side by side. */
  about: {
    label: "关于",
    title: "AI4Math 研究情报平台",
    introA: "本站追踪 ",
    introStrong: "AI for Mathematics",
    introB:
      " 领域的研究事件——从论文与模型，到人物、机构、资助与政策。每条记录都回答同样的问题：发生了什么、谁在推动、为什么重要、去哪里读原文。",
    hubIntroTitle: "项目简介",
    hubIntro: "追踪研究进展与整个生态的动态，每条记录都保留可回原文核对的来源链接。",
    hubSources: "来自 arXiv、GitHub、实验室公告与资助机构发布的公开渠道，逐条链接到原文。",
    hubLabels: "证据等级与来源类型彼此独立、不打分，每个短标记都有明确释义。",
    hubJump: "查看",
    tocLabel: "本页目录",
    recordTitle: "能读到什么",
    recordBody: "内容按五类一级事件组织，覆盖研究进展与整个生态的动态。",
    classes: [
      { name: "科研进展", desc: "论文、模型、算法、Benchmark 与数学发现" },
      { name: "人物", desc: "奖项、当选、任命与研究者公开表态" },
      { name: "机构与教育", desc: "实验室、研究中心、跨机构行动、课程与培养计划" },
      { name: "资助", desc: "资助、奖励、Fellowship 与资源承诺" },
      { name: "政策与共同体", desc: "政策、声明、组织倡议与社区争论" },
    ],
    trustTitle: "怎么读标签",
    trustBody:
      "每条事件带两个独立标记：证据等级 E0–E3 表示主张被佐证到什么程度，来源类型 S0–S4 表示证据来自哪里。两者都由条目自带的链接派生，不打分。",
    trustLink: "查看全部标签释义 →",
    linkLatest: "最新事件",
    linkMethodology: "标签释义",
  },

  /** app/methodology/page.tsx — full-page copy plus per-code label tables. */
  methodology: {
    title: "标签释义",
    label: "术语表",
    intro: "每条事件旁的短标记都有明确含义。下面按组列出，读信息流或事件详情时可以随时回来对照。",
    note: "卡片上的颜色只区分事件类型，不表示可信度或重要程度；方向点的蓝、紫、橙分别对应 AI 用于数学、数学用于 AI、双向兼有。证据等级说的是一条主张被佐证到什么程度，来源类型说的是证据来自哪里，两者始终用灰阶并彼此独立，都可以回到事件附带的原始链接核对。",
    legendEvidence: "证据等级",
    legendTier: "来源类型",
    legendType: "事件类型",
    evidenceDesc: {
      E0: "独立复核——有独立于发布方的第三方复现或验证记录；人工标注，不自动派生；代码通过 Lean kernel 检查不算",
      E1: "可检验产物——代码、证明或数据可被检验",
      E2: "研究记录——存在论文或正式研究记录",
      E3: "单方声明——只有发起方自己的公开声明，还没有研究记录或产物可查",
    },
    tierDesc: {
      S0: "原始研究记录——论文、预印本、正式研究记录、原始代码等",
      S1: "官方公告——研究机构、实验室、企业和作者的官方公告",
      S2: "独立学术佐证——独立学术复核、独立研究报告、独立复现实验",
      S3: "科技媒体报道——科技媒体、新闻报道",
      S4: "社区线索——社区讨论、社交媒体线索等",
    },
    typeDesc: {
      Research: "研究——技术与数学知识的进展",
      People: "人物——公开表态、演讲与研究者流动",
      Institutions: "机构与教育——计划、合作、课程与培训",
      Funding: "资助——经费、奖项与已披露的资源投入",
      PolicyCommunity: "政策与社区——政策、宣言与社区行动",
    },
    legendPublication: "发表状态",
    publicationDesc: {
      preprint: "预印本——公开研究记录（如 arXiv），未经同行评审；不等于正式发表",
      published: "正式发表——由会议论文集或出版商 DOI 链接自动判定，非人工核对",
    },
    legendAiRole: "AI 参与程度",
    aiRoleDesc: {
      autonomous: "AI 自主完成——来源明确称 AI 在极少人工引导下完成核心研究任务；用了 Agent 不等于自主",
      assisted: "AI 辅助完成——AI 参与生成代码、证明、形式化或假设等部分工作，人类设计、引导或核验",
      unclear: "分工不明——来源提到 AI 参与，但未说明分工",
      not_applicable: "不适用——事件不涉及 AI 执行研究，如奖项、资助、机构、政策或纯人类成果",
    },
    legendDirection: "方向轴",
    directionDesc: {
      ai4math: "研究对象或交付物是数学本身——自动证明、猜想发现、形式化、数学推理模型、数据集与基准，以及服务这些工作的工具链。",
      math4ai: "数学作为方法、理论或测试场，研究对象是 AI 系统本身——改进训练方法、用数学理论改进算法、解释模型的数学性质。",
      both: "同一工作同时给出双向的共同核心交付；罕见，不是“顺带评测了数学”。",
    },
    directionHint: "当一项工作同时涉及两侧时，按它的主要交付物归类；不属于任一侧的科研事件不带方向标记。",
    directionLabels: {
      ai4math: "AI4Math",
      math4ai: "Math4AI",
      both: "双向兼有",
    },
    legendDimensions: "分类维度",
    dimensionLabels: {
      cap: "研究主题",
      math: "数学领域",
    },
    dimensionDesc: {
      cap: "这项工作的研究主题：推理大模型、智能体、神经符号证明与自动形式化、AI 的数学基础理论、数学发现、评测、基准与数学数据资源。",
      math: "工作触及的数学分支：代数与数论、几何、分析与微分方程、组合、概率统计、优化、数学物理。",
    },
    dimensionHint: "两个维度彼此正交、均可缺省：科研卡片只展示命中的维度，缺省本身是信息；生态事件不带维度徽章。维度在构建期由标题、摘要与子方向确定性派生，不写入存储。",
    seeAlso: "另见",
    linkSources: "数据来源",
    linkLatest: "最新事件",
  },

  /** About page: public source registry. */
  sources: {
    title: "数据来源",
    subtitle:
      "本站条目来自可核查的公开渠道：arXiv、GitHub、实验室与高校公告、学会与资助机构发布。每条事件都保留原始来源链接，摘要之外的判断可以回到原文核对。",
    totalSources: "公开来源",
    classCount: "事件类别",
    tierAxis: "来源类型",
    registryToggle: "查看全部来源",
    registryHint: "按事件类别分组，右侧的 S0–S4 是来源类型标记；完整定义见标签释义。",
    focusSources: "个来源",
    empty: "该类别暂无已登记的来源。",
    categories: {
      Research: "研究",
      People: "人物",
      Institutions: "机构与教育",
      Funding: "资助",
      PolicyCommunity: "政策与社区",
    },
    tiers: {
      S0: { name: "原始研究记录", blurb: "论文、预印本、正式研究记录、原始代码等可直接检验的原始来源。" },
      S1: { name: "官方公告", blurb: "研究机构、实验室、企业和作者的官方公告。" },
      S2: { name: "独立学术佐证", blurb: "独立学术复核、独立研究报告、独立复现实验。" },
      S3: { name: "科技媒体报道", blurb: "科技媒体、新闻报道，提供第三方报道与背景。" },
      S4: { name: "社区线索", blurb: "社区讨论、社交媒体线索等，需谨慎对待。" },
    },
  },

  /** app/not-found.tsx — title/body/backHome come from the core `notFound`. */
  notFound: {
    latestProgress: "最新进展",
  },
};

const en = {
  /** Browser tab metadata (used by each page's `generateMetadata`). */
  meta: {
    latest: { title: "Latest AI4Math Ecosystem Events", desc: "Research, people, institutions & education, funding and policy events in AI for Mathematics, filterable by class." },
    math4ai: { title: "Math4AI direction", desc: "Research events whose object is the AI system itself — training methods, mathematically grounded algorithms, analyses of model properties — grouped by research object, core goal and actual contribution, co-primary events included." },
    timeline: { title: "Timeline", desc: "Browse recorded AI4Math events year by year, with a density overview and class mix." },
    tasks: { title: "Math Archive", desc: "Published OpenAI and Anthropic mathematical problems, evaluations, results and primary sources." },
    search: { title: "Search", desc: "Full-site search across research events, papers, topics, models and benchmarks." },
    about: { title: "About", desc: "The AI4Math Ecosystem Radar: research, people, institutions, funding and policy events, each with a link back to its original source." },
    methodology: { title: "Glossary — how to read the labels", desc: "Definitions of evidence levels, source tiers, event classes and publication states, AI involvement, the direction axis and the classification dimensions." },
    graph: { title: "Research Graph", desc: "Explore event clusters in an interactive scatter view and open precise theme × mathematical-domain counts in the event feed." },
  },

  count: {
    event: { one: "{n} event", many: "{n} events" },
    researchEvent: { one: "{n} research event", many: "{n} research events" },
    link: { one: "{n} link", many: "{n} links" },
  },

  pager: {
    prev: "Previous",
    next: "Next",
    pageOf: "Page {page} of {total}",
    pagination: "Pagination",
  },

  latest: {
    label: "Ecosystem feed",
    title: "Latest AI4Math Ecosystem Events",
    sub: "Follow research progress and the wider ecosystem. Find records by event class, research theme and math domain.",
    listEyebrow: "Current collection",
    listTitle: "Event archive",
  },

  /** Only the tracking section label remains; the /events page was retired. */
  events: {
    label: "Continuous tracking",
    projectTitle: "Project",
    initialUnit: "first records",
    changesUnit: "subsequent changes",
    verificationUnit: "verification records",
    sourcesUnit: "additional sources",
    relationsUnit: "related events",
    relationsTitle: "Related events (outside this event line)",
    relationKinds: { reproduction: "Independent reproduction", overturn: "Overturn / critique", related: "Research relation" },
    kinds: { initial: "First record", followup: "Follow-up", verification: "Verification", correction: "Correction", retraction: "Retraction", report: "Re-report" },
    sourcesTitle: "Other sources",
    sourcesHint: "Restatements of the same development add a source, not a subsequent change.",
  },

  math4ai: {
    label: "Direction axis",
    title: "Math4AI: mathematics in service of AI",
    sub: "Mathematics as method, theory or testbed, with the AI system itself as the research object: training methods, algorithms and model properties.",
    feedEyebrow: "Event archive",
    feedTitle: "Explore Math4AI progress",
    feedIntro: "Includes Math4AI and co-primary events. Filter further by event class, research theme, math domain and time.",
    overview: {
      eyebrow: "Structural overview",
      title: "Where these advances concentrate",
      note: "These figures use the same set as the feed below: Math4AI plus co-primary events. Research themes use one primary class and math fields use multiple tags, so field totals may exceed the overall count. Click a year, theme or field to filter the events below.",
      total: "Total events",
      pure: "Pure Math4AI",
      both: "Co-primary",
      byTheme: "By research theme",
      byField: "By math field",
      byYear: "By year",
      unassigned: "Nothing classifiable yet.",
      yearUnit: "events",
    },
  },

  graph: {
    label: "Classification view",
    title: "Research Graph",
    sub: "Explore event groupings in the scatter view, then use the matrix for exact counts at each research-theme × mathematical-domain intersection. Both views lead to individual events.",
    viewScatter: "Event scatter view",
    scatterSub: "Each dot is one event record. Switching axes shows only events that belong to that axis; click a legend item to filter further. The math-domain view includes only research tagged with a specific domain, and events with several domains can appear in several filters. Dot size reflects progress in its event line; layout distance is not a quantitative research relationship.",
    viewMatrix: "Research distribution matrix",
    matrixSub: "Mathematical domains run across the columns; research themes run down the rows. Darker cells contain more events. Open a numbered cell to see its records.",
    activePairs: "theme × domain intersections with records",
    scatter: {
      colorBy: "Colour axis",
      axisCap: "Research themes",
      axisMath: "Math domains",
      axisDirection: "Direction",
      axisType: "Event class",
      gravity: "Cluster gravity",
      spread: "Cluster spread",
      dotSize: "Dot size",
      labels: "Region labels",
      halo: "Cluster halos",
      search: "Search titles to highlight…",
      reset: "Reset",
      relayout: "Re-layout",
      exportSvg: "Export SVG",
      exportPng: "Export PNG",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      fit: "Fit view",
      legend: "Legend · click to filter",
      all: "All in this view",
      hint: "Wheel to zoom · drag to pan · hover for details · click a dot to open the event",
      progress: "progress items",
      statusDots: "dots",
      layoutGroup: "Layout",
      displayGroup: "Display",
      findGroup: "Find",
      actionGroup: "Actions",
      searchMatches: "{n} matched",
      searchNone: "No matches, try another keyword",
      advanced: "Layout and export settings",
    },
    themeAxis: "Research theme",
    domainAxis: "Math domain",
    total: "Total",
    legend: "Events",
    legendLow: "few",
    legendHigh: "many",
    cellHint: "{cap} × {math}: {n}",
    drill: "Click a cell to drill into the feed",
    empty: "·",
    multiLabel: "One study can touch several math domains and lands in every matching cell, so cell sums may exceed the totals.",
    noMath: "{n} research events have no specific math-domain label, so they are excluded from the math-domain scatter view and matrix; they remain available in the research-theme view.",
    noCap: "{n} ecosystem events (people, institutions, funding and policy community) are excluded from the research-theme and math-domain scatter views and matrix; they remain available in the event-type view.",
    metaEvents: "{n} events",
    metaCapped: "{n} with a research theme",
  },

  timeline: {
    label: "Archive",
    sub: "Browse recorded events by year, from early explorations to recent progress.",
    archiveEyebrow: "Browse by time",
    archiveTitle: "Year by year",
    archiveIntro: "Choose an event class or search by keyword, then jump to a year and month. Each record links to its details and original source.",
    empty: "No events match this filter.",
    decadeNav: "Jump by period",
    overview: {
      total: "Events recorded",
      span: "Time span",
      years: "Years with records",
      updated: "Last updated",
      density: "Records per year · click to jump",
      composition: "Class mix · click to filter",
      peak: "Peak {year} · {n} records",
      scale: "sqrt-scaled bar height",
      hint: "One column per year, grouped by decade. Darker means more records; click a bar to jump to that year.",
    },
    monthInFeed: "View this month in the feed",
    denseMonth: "{n} events this month, grouped by day",
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
    paperSort: "Sort",
    paperSortRecent: "Recent",
    paperSortTitle: "Title",
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
    slugC: " page.",
  },

  detail: {
    crumbEvent: "Ecosystem event",
    crumbResearch: "Research progress",
    demoEntry: "demo / example entry",
    venueMissing: "Publication details not recorded",
    howToReadLabels: "How to read these labels",
  },

  tasks: {
    label: "Math Archive",
    title: "Math Archive",
    sub: "Published mathematical problems, evaluations, results and sources from OpenAI and Anthropic. Specific problems and full problem sets are labelled separately; domestic runs will follow after measurement.",
    openai: "OpenAI",
    anthropic: "Anthropic",
    deepmind: "Google DeepMind",
    count: { one: "{n} record", many: "{n} records" },
    sectionEmpty: "No records in this category yet.",
    pageEmpty: "No archive records yet.",
    howToRead: "Feed entries carry evidence-level and source-tier marks; see the label guide for what they mean.",

    /** Primary structure: one reproducible task, frontier vs domestic models. */
    benchmark: {
      label: "Tasks and sources",
      title: "Published mathematical tasks and evaluations",
      intro: "One chronological list of task source cases involving these labs. Entries with a clear evaluation unit are labelled as a full problem set or a specific mathematical problem; open them to see the evaluation basis. Other entries retain the original problem, result and sources but have not yet been prepared as executable experiments. Follow-ups remain separate source records, so this is not a count of distinct problems.",
      pendingNote: "Domestic model results will be added after runs and verification are complete.",
      challengeCount: "{n} source cases",
      unitBenchmark: "Full problem set",
      unitProblem: "Specific math problem",
      pendingCount: "{n} to fill",
      fieldBenchmark: "Task source",
      fieldTask: "Reproducible task",
      fieldMetric: "Evaluation basis",
      fieldSourceCase: "Source case",
      compareTitle: "Published results and resources",
      colModel: "Model",
      colResult: "Result",
      colResources: "Resources",
      originFrontier: "Frontier lab",
      originDomestic: "Domestic model",
      statusReported: "Source published",
      statusPending: "To be filled",
      compareNote: "Even scores on the same dataset may use different models, search budgets or grading protocols; undisclosed conditions are not assumed to match.",
      methodLink: "Labels and basis",
      sourceNote: "Each result cites its original source; a public target does not imply the original experimental setup can be reproduced exactly.",
    },

    archiveLibraryTitle: "Source case library",
    archiveLibraryHint: "The original public cases from which reproducible tasks are extracted, arranged by year for source-checking; see the comparison board above for the tasks.",

    /** Editorial research archive imported from the source timeline document. */
    archive: {
      label: "Research archive",
      title: "AI4Math progress timeline · {range}",
      intro: "Public mathematical results from OpenAI, Anthropic, Google DeepMind, jointly supported efforts and independent researchers, arranged by year ({n} records in total). Each entry shows its date, attribution, result and links to the original sources.",
      caveat: "A date is when a result became public, not necessarily when the work was done; month-level records stay at month precision. Contest problems, formalizations and rediscoveries differ from solving an open problem for the first time, and preprints and candidate proofs have not been independently verified. DeepMind entries were compiled and verified from Nature papers and official announcements, not transcribed from the original timeline document.",
      readingTitle: "How to read this timeline",
      filterAll: "All",
      filterOpenai: "OpenAI-related",
      filterAnthropic: "Anthropic-related",
      filterDeepmind: "DeepMind-related",
      filterJoint: "Joint",
      filterIndependent: "Independent",
      badge: { openai: "OpenAI", anthropic: "Anthropic", deepmind: "DeepMind", joint: "Joint", independent: "Independent" },
      sampleTag: "sample",
      sampleNote: "Entries marked “sample” are drawn from one batch of 722 manuscripts; they illustrate the batch and are not counted as separate results.",
      recordCount: "{n} records",
      recordCountOne: "{n} record",
      yearCount: "{n} records",
      yearCountOne: "{n} record",
      yearOnly: "{y}",
      dateConvention: "Date published",
      fields: {
        attribution: "Attribution",
        problem: "Research problem",
        result: "Result",
        model: "Model",
        people: "People",
        division: "Human / model split",
        verification: "Verification",
        scope: "Scope",
        extras: "Additional detail",
        sources: "Sources",
        related: "Related entries",
      },
      expand: "Full verification record",
      collapse: "Hide verification record",
      baselinesTitle: "Related model capabilities",
      baselinesHint: "These two releases give context for the period. Evaluation conditions differ, so the scores are not directly comparable.",
      sourceNote: "Sources checked through 2026-10-16. The timeline keeps growing; a result missing here does not mean it did not happen.",
    },

    /** Recent lab items picked up by the automated ingest pipeline. */
    automated: {
      title: "Recent updates",
      hint: "Recent entries from the two labs and their official channels, grouped by lab.",
    },
  },

  search: {
    label: "Full-site search",
    title: "Search",
    sub: "Find research events, papers, topics, models and benchmarks; English and Chinese queries both work.",
  },

  about: {
    label: "About",
    title: "A Research Intelligence Platform for AI4Math",
    introA: "This site tracks ",
    introStrong: "AI for Mathematics",
    introB:
      " research events — papers and models, but also people, institutions, funding and policy. Every record answers the same questions: what happened, who is behind it, why it matters, and where to read the original.",
    hubIntroTitle: "About this site",
    hubIntro: "Research progress and the wider ecosystem, with every record keeping a source link back to the original.",
    hubSources: "Public channels such as arXiv, GitHub, lab announcements and funding releases, each linked back to the original.",
    hubLabels: "Evidence level and source tier are independent, never scores, and every short mark has a defined meaning.",
    hubJump: "Explore",
    tocLabel: "On this page",
    recordTitle: "What you will find",
    recordBody: "Content is organized into five top-level event classes, spanning research progress and the wider ecosystem.",
    classes: [
      { name: "Research", desc: "Papers, models, algorithms, benchmarks and mathematical discovery" },
      { name: "People", desc: "Awards, elections, appointments and public statements by researchers" },
      {
        name: "Institutions & Education",
        desc: "Labs, centers, cross-institution action, courses and training programmes",
      },
      { name: "Funding", desc: "Grants, awards, fellowships and resource commitments" },
      { name: "Policy & Community", desc: "Policies, declarations, community initiatives and debate" },
    ],
    trustTitle: "How to read the labels",
    trustBody:
      "Every event carries two independent markers: evidence level E0–E3 describes how well a claim is supported, and source tier S0–S4 describes where the evidence comes from. Both are derived from the links a record carries; they are not scores.",
    trustLink: "All label definitions →",
    linkLatest: "Latest events",
    linkMethodology: "Glossary",
  },

  methodology: {
    title: "Glossary",
    label: "Reference",
    intro: "Every short mark next to an event has a defined meaning. They are listed by group below, so you can check one while reading the feed or an event page.",
    note: "Colour on a card only separates event classes — it never signals reliability or importance. On the direction dot, blue, violet and amber mean AI for mathematics, mathematics for AI, and both. Evidence level describes how well a claim is supported; source tier describes where the evidence comes from. Those two stay graphite, are independent of each other, and can be checked against the original link on each event.",
    legendEvidence: "Evidence level",
    legendTier: "Source tier",
    legendType: "Event type",
    evidenceDesc: {
      E0: "Independent check — a third party independent of the originator reproduced or verified the result; manual only, never auto-derived; passing a Lean kernel check does not qualify",
      E1: "Inspectable artifact — code, proofs or data can be inspected",
      E2: "Research record — a paper or formal research record exists",
      E3: "Originator claim — only the originating party's own public statement; no research record or artifact yet",
    },
    tierDesc: {
      S0: "Primary research record — papers, preprints, formal research records, original code",
      S1: "Official announcement — from institutions, labs, companies and authors",
      S2: "Independent academic corroboration — independent review, reports and replication studies",
      S3: "Technology media report — technology press and news reporting",
      S4: "Community lead — community discussion and social-media leads",
    },
    typeDesc: {
      Research: "Research — technical and mathematical progress",
      People: "People — statements, talks and researcher movements",
      Institutions: "Institutions & Education — initiatives, collaborations, courses and training",
      Funding: "Funding — grants, awards and disclosed resource commitments",
      PolicyCommunity: "Policy & Community — policies, declarations and community action",
    },
    legendPublication: "Publication status",
    publicationDesc: {
      preprint: "Preprint — a public research record (e.g. arXiv), not peer reviewed; not a formal publication",
      published: "Published — derived automatically from a proceedings or publisher DOI link, not a manual check",
    },
    legendAiRole: "AI involvement",
    aiRoleDesc: {
      autonomous: "AI-led — the source explicitly says the AI system carried out core research tasks with little human direction; using an agent alone does not qualify",
      assisted: "AI-assisted — the AI did part of the work (code, proofs, formalization, hypotheses); humans designed, steered or checked it",
      unclear: "Division unclear — the source mentions AI involvement without describing the division of labour",
      not_applicable: "Not applicable — the event reports no research work performed by an AI system, such as awards, funding, institutions or policy",
    },
    legendDirection: "Direction axis",
    directionDesc: {
      ai4math: "The research object or deliverable is mathematics itself — automated proving, conjecture discovery, formalization, math-reasoning models, datasets and benchmarks, and the toolchain that serves them.",
      math4ai: "Mathematics is the method, theory or testbed and the object is the AI system — training methods, mathematically grounded algorithms, and analyses of model properties.",
      both: "One work makes co-primary contributions to both sides; rare, and not the same as evaluating models on math as a side effect.",
    },
    directionHint: "When one work touches both sides, it is grouped by its main deliverable; research events on neither side carry no direction mark.",
    directionLabels: {
      ai4math: "AI4Math",
      math4ai: "Math4AI",
      both: "Both",
    },
    legendDimensions: "Classification dimensions",
    dimensionLabels: {
      cap: "Research theme",
      math: "Math topic",
    },
    dimensionDesc: {
      cap: "The research theme of the work: reasoning LLMs, agents, neuro-symbolic proving & autoformalization, mathematical foundations of AI, mathematical discovery, benchmarks & datasets.",
      math: "The branch of mathematics the work touches: algebra & number theory, geometry, analysis & differential equations, combinatorics, probability & statistics, optimization, mathematical physics.",
    },
    dimensionHint: "The two dimensions are orthogonal and optional: a research card shows only the facets that hit, and absence is itself information; ecosystem events carry no dimension chips. Facets are derived deterministically at build time from title, summary and sub-area, never stored.",
    seeAlso: "See also",
    linkSources: "Data sources",
    linkLatest: "Latest events",
  },

  sources: {
    title: "Data sources",
    subtitle:
      "Records come from verifiable public channels: arXiv, GitHub, lab and university announcements, and releases from scholarly societies and funding bodies. Every event keeps its original source link, so anything beyond the summary can be checked against the original.",
    totalSources: "Public sources",
    classCount: "Event classes",
    tierAxis: "Source tiers",
    registryToggle: "Browse all sources",
    registryHint:
      "Grouped by event class; the S0–S4 code on the right is the source tier. Full definitions are in the glossary.",
    focusSources: "sources",
    empty: "No sources registered in this category yet.",
    categories: {
      Research: "Research",
      People: "People",
      Institutions: "Institutions & Education",
      Funding: "Funding",
      PolicyCommunity: "Policy & Community",
    },
    tiers: {
      S0: { name: "Primary research record", blurb: "Papers, preprints, formal research records and original code — directly inspectable original sources." },
      S1: { name: "Official announcement", blurb: "Official announcements from institutions, labs, companies and authors." },
      S2: { name: "Independent academic corroboration", blurb: "Independent academic review, research reports and replication studies." },
      S3: { name: "Technology media report", blurb: "Technology press and news reporting, providing third-party coverage and context." },
      S4: { name: "Community lead", blurb: "Community discussion and social-media leads — treat with caution." },
    },
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

