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
    math4ai: { title: "Math4AI 方向", desc: "研究对象是 AI 系统本身的科研事件——改进训练方法、用数学理论改进算法、解释模型的数学性质——按「研究对象 → 核心目标 → 实际贡献」三步判定，含双向兼有的事件。" },
    timeline: { title: "时间线", desc: "按年份回看已记录的 AI4Math 事件，含逐年记录量与事件类别构成。" },
    topics: { title: "研究方向", desc: "六个研究方向的索引：方向轴构成、近 12 个月走势、子方向与最近记录。" },
    labs: { title: "实验室进展", desc: "OpenAI 与 Anthropic 在 AI4Math 上公开发布的成果与已解决的问题，按时间排列，每条记录保留原始来源。" },
    search: { title: "搜索", desc: "全站搜索：研究事件、论文、方向、模型与 Benchmark。" },
    about: { title: "关于", desc: "AI4Math 生态雷达：追踪研究进展、人物、机构、资助与政策事件，每条记录都保留原始来源链接。" },
    methodology: { title: "标签释义——如何阅读这些标签", desc: "证据等级、来源层级、事件类型、核验状态、AI 参与程度与方向轴的标签释义。" },
    sources: { title: "数据来源", desc: "本站条目所依据的公开渠道清单，按事件类别分组。" },
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
    sub: "每条记录都是一个生态事件——发生了什么、谁在推动、为什么重要、去哪里读原始来源。可按五类事件与研究方向筛选。",
  },

  /** app/math4ai/page.tsx */
  math4ai: {
    label: "方向轴",
    title: "Math4AI：数学服务 AI 的进展",
    sub: "数学作为方法、理论或测试场，研究对象是 AI 系统本身的事件——训练方法、算法改进与模型性质解释。判定按“研究对象 → 核心目标 → 实际贡献”三步进行；双向兼有的也在此列出，可继续按事件类别、研究方向与时间筛选。",
  },

  /** app/timeline/page.tsx */
  timeline: {
    label: "编年档案",
    sub: "按年份回看已记录的事件。上方密度条显示每年的记录量，可点击跳转；年份下的色条是这一年的事件类别构成。展开月份可看到按日分组、信任标记与原始链接。",
    feedLink: "在信息流中按研究方向筛选",
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

  /** app/topics/page.tsx */
  topics: {
    label: "方向索引",
    sub: "科研进展按六个研究方向汇总；每张方向卡给出方向轴构成、近 12 个月走势与最近记录。人物、机构、资助与政策事件不归入方向，仍保留在信息流与时间线中。",
    areaCount: "{n} 个方向",
    unassigned: "另有 {n} 条生态事件不归入方向",
    overviewClass: "全站事件 · 按类别",
    overviewAxis: "科研事件 · 按方向轴",
    axisMix: "方向轴构成：该方向以哪一类问题为主",
    unassignedAxis: "未标注",
    recent12: "近 12 个月",
    recentRecords: "最近记录",
    share: "占研究进展 {n}%",
    subAreasMore: "另有 {n} 个子方向",
    updatedLabel: "更新于",
    allProgress: "查看全部研究进展",
    modelsLabel: "模型",
    benchmarksLabel: "Benchmark",
    openTopic: "打开方向",
    subAreasLabel: "子方向",
    subAreaTitle: "{count} 条事件 · {name}",
    areaDesc: {
      "theorem-proving-and-formal-mathematics": "把数学命题写成可机器检验的形式语言，让证明器与大模型协作补全、搜索并验证证明。",
      "mathematical-reasoning-and-llms": "用数学题训练与评测通用大模型的推理能力，关注提示、解码与过程监督等方法。",
      "mathematical-discovery-and-symbolic-computation": "借助符号计算与搜索发现新公式、新猜想与新算法，并给出可检验的数学结果。",
      geometry: "几何问题求解与图形推理，常以竞赛级题目和可视化推理作为能力测试场。",
      "mathematical-agents": "把证明器、计算器与代码执行封装成工具链，让智能体自主规划并完成多步数学任务。",
      "benchmarks-and-datasets": "为上述能力建立可复现的题库、评测集与数据资源，定义「做得好不好」的标尺。",
    },
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
    demoEntry: "示例 / 演示条目",
    venueMissing: "未记录发表信息",
    howToReadLabels: "如何阅读这些标签",
  },

  /** app/labs/page.tsx */
  labs: {
    label: "实验室进展",
    title: "两家前沿实验室在 AI4Math 上的进展",
    sub: "OpenAI 与 Anthropic 公开发布、且与数学直接相关的成果：解决了什么问题、给出了什么产物、留下了什么可核对的链接。按时间由新到旧排列，每条记录下方都保留讨论位。",
    openai: "OpenAI",
    anthropic: "Anthropic",
    count: { one: "{n} 条记录", many: "{n} 条记录" },
    sectionEmpty: "这一分类的记录正在整理，补齐后会出现在这里。",
    pageEmpty: "实验室进展正在整理中：两家的成果会按年份逐条录入，并保留原始公告与论文链接。",
    howToRead: "这批条目与信息流共用同一套字段：方向轴、证据等级、来源层级与 AI 参与程度，规则见标签释义。",
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
      "每条事件带两个独立标记：证据等级 E0–E4 表示主张被佐证到什么程度，来源层级 S0–S4 表示证据来自哪里。两者都由条目自带的链接派生，不打分。",
    trustLink: "查看全部标签释义 →",
    linkLatest: "最新事件",
    linkTopics: "研究方向",
    linkMethodology: "标签释义",
  },

  /** app/methodology/page.tsx — full-page copy plus per-code label tables. */
  methodology: {
    title: "标签释义",
    label: "术语表",
    intro: "每条事件旁的短标记都有明确含义。下面按组列出，读信息流或事件详情时可以随时回来对照。",
    note: "卡片上的颜色只区分事件类型，不表示可信度或重要程度；方向点的蓝、紫、橙分别对应 AI 用于数学、数学用于 AI、双向兼有。证据等级说的是一条主张被佐证到什么程度，来源层级说的是证据来自哪里，两者始终用灰阶并彼此独立，都可以回到事件附带的原始链接核对。",
    legendEvidence: "证据等级",
    legendTier: "来源层级",
    legendType: "事件类型",
    evidenceDesc: {
      E0: "独立复核——已记录独立检查",
      E1: "可检验产物——代码、证明或数据可被检验",
      E2: "研究记录——存在论文或正式研究记录",
      E3: "单方声明——只有发起方自己的公开声明，还没有研究记录或产物可查",
      E4: "无佐证——未记录任何公开证据",
    },
    tierDesc: {
      S0: "原始研究记录（论文、产物、官方仓库）",
      S1: "官方公告（实验室、高校、会议记录）",
      S2: "独立学术佐证",
      S3: "可信的科技媒体报道",
      S4: "社区发现线索",
    },
    typeDesc: {
      Research: "研究——技术与数学知识的进展",
      People: "人物——公开表态、演讲与研究者流动",
      Institutions: "机构与教育——计划、合作、课程与培训",
      Funding: "资助——经费、奖项与已披露的资源投入",
      PolicyCommunity: "政策与社区——政策、宣言与社区行动",
    },
    legendVerification: "核验状态",
    verificationDesc: {
      claimed: "已公开提出——可靠来源确认主张已被公开提出，尚无独立佐证",
      paper_released: "论文已发布——存在公开研究记录；论文发布本身不等于独立佐证",
      under_verification: "核验中——事件真实，但主张、范围或归属仍在外部审查",
      partially_verified: "部分佐证——重要部分已有独立佐证，仍有实质内容未确认",
      independently_verified:
        "已独立佐证——独立于发布方的来源实质性佐证了事件描述；不表示数学正确性已有最终裁决",
      disputed: "存在争议——可靠来源对事实、归属或范围提出实质争议",
      corrected: "已更正——记录因后续纠错发生实质更新",
      retracted: "已撤回——原始主张或研究记录已被撤回",
    },
    legendAiRole: "AI 参与程度",
    aiRoleDesc: {
      autonomous: "AI 自主完成——来源称 AI 系统在极少人工引导下产出结果",
      assisted: "AI 辅助完成——人类设计、引导或形式化，AI 承担部分数学工作",
      unclear: "分工不明——来源提到 AI 参与，但未说明分工",
      not_applicable: "不适用——工具、基准、数据集或机构事件，不是 AI 产出的数学结果",
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
    seeAlso: "另见",
    linkSources: "数据来源",
    linkLatest: "最新事件",
  },

  /** About page: public source registry (plus the /sources redirect copy). */
  sources: {
    title: "数据来源",
    subtitle:
      "本站条目来自可核查的公开渠道：arXiv、GitHub、实验室与高校公告、学会与资助机构发布。每条事件都保留原始来源链接，摘要之外的判断可以回到原文核对。",
    totalSources: "公开来源",
    classCount: "事件类别",
    tierAxis: "来源层级",
    registryToggle: "查看全部来源",
    registryHint: "按事件类别分组，右侧的 S0–S4 是来源层级标记；完整定义见标签释义。",
    focusSources: "个来源",
    empty: "该类别暂无已登记的来源。",
    movedTitle: "此页已合并",
    movedBody: "来源信息已并入「关于」页的「数据来源」章节。",
    movedLink: "前往关于页 →",
    categories: {
      Research: "研究",
      People: "人物",
      Institutions: "机构与教育",
      Funding: "资助",
      PolicyCommunity: "政策与社区",
    },
    tiers: {
      S0: { name: "原始研究记录", blurb: "论文、产物与官方仓库：arXiv、GitHub 等可直接检验的原始来源。" },
      S1: { name: "官方公告", blurb: "实验室、高校、会议与资助方的官方新闻与公告。" },
      S2: { name: "独立评论", blurb: "研究者的独立博客与评论，代表个人而非机构立场。" },
      S3: { name: "媒体报道", blurb: "可信的科技媒体，提供第三方报道与背景。" },
      S4: { name: "社区线索", blurb: "社区声明、倡议与发现线索，需谨慎对待。" },
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
    math4ai: { title: "Math4AI direction", desc: "Research events whose object is the AI system itself — training methods, mathematically grounded algorithms, analyses of model properties — judged by research object → core goal → actual contribution, co-primary events included." },
    timeline: { title: "Timeline", desc: "Browse recorded AI4Math events year by year, with a density overview and class mix." },
    topics: { title: "Topics", desc: "Index of six research directions: direction-axis mix, 12-month trend, sub areas and latest records." },
    labs: { title: "Lab track", desc: "Public OpenAI and Anthropic AI4Math results and solved problems, in chronological order, each with its original source." },
    search: { title: "Search", desc: "Full-site search across research events, papers, topics, models and benchmarks." },
    about: { title: "About", desc: "The AI4Math Ecosystem Radar: research, people, institutions, funding and policy events, each with a link back to its original source." },
    methodology: { title: "Glossary — how to read the labels", desc: "Definitions of evidence levels, source tiers, event classes, verification states, AI involvement and the direction axis." },
    sources: { title: "Data sources", desc: "The public channels behind the records on this site, grouped by event class." },
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
    sub: "Every entry is an ecosystem event — what happened, who is moving the field, why it matters, and where to read the source. Filter by class and area, and search titles, summaries, models and benchmarks.",
  },

  math4ai: {
    label: "Direction axis",
    title: "Math4AI: mathematics in service of AI",
    sub: "Events where mathematics is the method, theory or testbed and the object is the AI system — training methods, algorithm improvements and analyses of model properties. Judged by research object → core goal → actual contribution; co-primary events appear here too, and the usual class, research-area and time filters still apply.",
  },

  timeline: {
    label: "Archive",
    sub: "Look back at recorded events year by year. The density strip above shows how many records each year holds and links to it; the colour bar under a year is its class mix. Open a month for day groups, trust marks and original links.",
    feedLink: "Filter the feed by research area",
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

  topics: {
    label: "Area index",
    sub: "Research progress grouped into six directions. Each card shows its direction-axis mix, last 12 months and latest records. People, institutions, funding and policy events are not assigned to a direction; they stay in the feed and timeline.",
    areaCount: "{n} areas",
    unassigned: "Plus {n} ecosystem events with no direction",
    overviewClass: "All events · by class",
    overviewAxis: "Research events · by direction axis",
    axisMix: "Direction-axis mix: which kind of problem this area works on",
    unassignedAxis: "Unassigned",
    recent12: "Last 12 months",
    recentRecords: "Latest records",
    share: "{n}% of research events",
    subAreasMore: "+{n} more sub areas",
    updatedLabel: "Updated",
    allProgress: "All research progress",
    modelsLabel: "Models",
    benchmarksLabel: "Benchmarks",
    openTopic: "Open topic",
    subAreasLabel: "Sub areas",
    subAreaTitle: "{count} events · {name}",
    areaDesc: {
      "theorem-proving-and-formal-mathematics": "Writing mathematics in machine-checkable formal languages, with provers and models searching and verifying proofs together.",
      "mathematical-reasoning-and-llms": "Training and evaluating general reasoning on mathematical problems: prompting, decoding and process supervision.",
      "mathematical-discovery-and-symbolic-computation": "Using symbolic computation and search to find new formulas, conjectures and algorithms with checkable results.",
      geometry: "Geometry problem solving and diagram reasoning, often using competition-level problems as a capability testbed.",
      "mathematical-agents": "Wrapping provers, calculators and code execution into toolchains so agents can plan and carry out multi-step mathematical work.",
      "benchmarks-and-datasets": "Reproducible problem sets, evaluation suites and data resources that define what counts as progress.",
    },
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
    demoEntry: "demo / example entry",
    venueMissing: "Publication details not recorded",
    howToReadLabels: "How to read these labels",
  },

  labs: {
    label: "Lab track",
    title: "Frontier-lab progress on AI4Math",
    sub: "Public OpenAI and Anthropic work that speaks directly to mathematics: what was solved, what artifact was released, and where to check it. Newest first; every record keeps a discussion slot.",
    openai: "OpenAI",
    anthropic: "Anthropic",
    count: { one: "{n} record", many: "{n} records" },
    sectionEmpty: "Records for this lab are being compiled and will appear here.",
    pageEmpty: "The lab track is being compiled: each lab's work will be entered year by year, with its original announcement and paper links preserved.",
    howToRead: "These records use the same fields as the feed: direction axis, evidence level, source tier and AI role; see the label guide for the rules.",
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
      "Every event carries two independent markers: evidence level E0–E4 describes how well a claim is supported, and source tier S0–S4 describes where the evidence comes from. Both are derived from the links a record carries; they are not scores.",
    trustLink: "All label definitions →",
    linkLatest: "Latest events",
    linkTopics: "Research areas",
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
      E0: "Independent check — independent checking is recorded",
      E1: "Inspectable artifact — code, proofs or data can be inspected",
      E2: "Research record — a paper or formal research record exists",
      E3: "Originator claim — only the originating party's own public statement; no research record or artifact yet",
      E4: "No public evidence — no evidence recorded",
    },
    tierDesc: {
      S0: "Primary research record (paper, artifact, official repository)",
      S1: "Official announcement (lab, university, venue record)",
      S2: "Independent source",
      S3: "Reputable science/tech media",
      S4: "Community discovery signal",
    },
    typeDesc: {
      Research: "Research — technical and mathematical progress",
      People: "People — statements, talks and researcher movements",
      Institutions: "Institutions & Education — initiatives, collaborations, courses and training",
      Funding: "Funding — grants, awards and disclosed resource commitments",
      PolicyCommunity: "Policy & Community — policies, declarations and community action",
    },
    legendVerification: "Verification state",
    verificationDesc: {
      claimed: "Claimed — a reliable source confirms the claim was made publicly; no independent corroboration yet",
      paper_released: "Paper released — a public research record exists; release is not independent corroboration",
      under_verification: "Under verification — the event is real, but its claim, scope or attribution is under external review",
      partially_verified: "Partially verified — important parts are independently corroborated; material parts are still open",
      independently_verified:
        "Independently verified — a source independent of the originator substantively corroborates the event; not a final ruling on mathematical correctness",
      disputed: "Disputed — reliable sources materially contest the facts, attribution or scope",
      corrected: "Corrected — the record was materially updated after a correction",
      retracted: "Retracted — the original claim or research record was withdrawn",
    },
    legendAiRole: "AI involvement",
    aiRoleDesc: {
      autonomous: "AI-led — the source says an AI system produced the result with little human direction",
      assisted: "AI-assisted — humans designed, steered or formalized the work; an AI system did part of the mathematics",
      unclear: "Division unclear — the source mentions AI involvement without describing the division of labour",
      not_applicable: "Not applicable — tooling, benchmark, dataset or institutional event, not an AI-produced result",
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
    movedTitle: "This page has moved",
    movedBody: "Source information is now in the Data sources section of the About page.",
    movedLink: "Go to About →",
    categories: {
      Research: "Research",
      People: "People",
      Institutions: "Institutions & Education",
      Funding: "Funding",
      PolicyCommunity: "Policy & Community",
    },
    tiers: {
      S0: { name: "Primary research record", blurb: "Papers, artifacts and official repositories: directly inspectable original sources such as arXiv and GitHub." },
      S1: { name: "Official announcements", blurb: "Official news and announcements from labs, universities, venues and funders." },
      S2: { name: "Independent source", blurb: "Independent researchers, scholarly commentary or third-party research sources; not necessarily an official channel and not the same as independent verification." },
      S3: { name: "Media coverage", blurb: "Reputable science/tech media providing third-party reporting and context." },
      S4: { name: "Community signals", blurb: "Community declarations, initiatives and discovery signals — treat with caution." },
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

