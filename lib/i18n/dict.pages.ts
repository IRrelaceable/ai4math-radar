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
    math4ai: { title: "Math4AI 方向", desc: "以数学为工具或测试场、直接服务通用 AI 能力的事件——模型训练、提示方法与能力评测——按方向轴自动归类，含兼有事件。" },
    timeline: { title: "时间线", desc: "已记录的 AI4Math 研究事件按时间顺序排列，逐年分组。" },
    topics: { title: "研究方向", desc: "按研究方向汇总的科研进展事件，含子方向、模型与 Benchmark 覆盖。" },
    search: { title: "搜索", desc: "全站搜索：研究事件、论文、方向、模型与 Benchmark。" },
    about: { title: "关于", desc: "AI4Math 生态雷达记录什么、数据从哪来，以及如何判断可信度。" },
    methodology: { title: "方法论——如何阅读这些标签", desc: "本平台如何把证据等级与来源层级彼此分开。" },
    sources: { title: "来源与同步", desc: "按事件类别查看来源状态、最近一次自动同步的结果与增量游标。" },
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
    sub: "受益方是通用 AI 能力的事件——训练方法、提示策略、能力评测与以数学为工具的工作。每条由管线按方向轴自动归类，两侧兼有的事件也在此列出，可继续按事件类别、方向与时间筛选。",
  },

  /** app/timeline/page.tsx */
  timeline: {
    sub: "全部已记录的生态事件按时间顺序排列，并按年份分组。用五类一级事件筛选；打开任一条目可查看完整证据记录。",
    feedLink: "带方向筛选的信息流视图",
    empty: "没有事件符合该筛选。",
    decadeNav: "按时间跳转",
  },

  /** app/topics/page.tsx */
  topics: {
    sub: "科研进展按研究方向汇总；人物、机构、资助与政策事件不归入方向，仍保留在信息流与时间线中。",
    areaCount: "{n} 个方向",
    updatedLabel: "更新于",
    allProgress: "查看全部研究进展",
    modelsLabel: "模型",
    benchmarksLabel: "Benchmark",
    openTopic: "打开方向",
    subAreasLabel: "子方向",
    subAreaTitle: "{count} 条事件 · {name}",
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

  /** app/search/page.tsx */
  search: {
    label: "全站搜索",
    title: "搜索",
    sub: "检索研究事件、论文、方向、模型与 Benchmark；中文与英文关键词均可。",
  },

  /** app/about/page.tsx — full-page copy, both languages side by side. */
  about: {
    label: "关于",
    title: "AI4Math 研究情报平台",
    introA: "本站不做“AI 摘要论文的工具”。它的信息单元是",
    introStrong: "研究事件",
    introB:
      "——一条值得追踪的 AI for Mathematics 进展。每条记录都回答同样的问题：发生了什么、谁在推动、为什么重要、去哪里读原文。",
    tocLabel: "本页目录",
    recordTitle: "记录什么",
    recordBody:
      "五类一级事件构成生态雷达。只有科研进展带研究方向标签；人物、机构、资助与政策事件只记录事件本身，不强行归入研究领域。",
    classes: [
      { name: "科研进展", desc: "论文、模型、算法、Benchmark 与数学发现" },
      { name: "人物", desc: "奖项、当选、任命与研究者公开表态" },
      { name: "机构与教育", desc: "实验室、研究中心、跨机构行动、课程与培养计划" },
      { name: "资助", desc: "资助、奖励、Fellowship 与资源承诺" },
      { name: "政策与共同体", desc: "政策、声明、组织倡议与社区争论" },
    ],
    pipelineTitle: "数据从哪来",
    pipelineBody:
      "来源是可核查的公开 RSS 与页面：实验室博客、数学系与研究所新闻、学会公告，以及 arXiv 与 GitHub。抓取后统一规范化、判定是否属于 AI4Math、映射研究方向，再由 LLM 写成事件摘要；标题保持原文，不改写。同步在“来源同步”页手动触发。",
    trustTitle: "怎么判断可信",
    trustBody:
      "证据等级回答“主张被佐证到什么程度”，从单方宣称到可检验产物与独立复核；来源层级回答“证据来自哪里”，从一手研究记录到更弱的渠道。两者都由条目自带的链接自动派生，不打分，也不代替你对重要性的判断。",
    trustLink: "查看完整评级规则 →",
    dataPolicyTitle: "数据政策",
    policy: [
      "每条事件保留原始来源链接，摘要之外的判断都能回到原文核对。",
      "无法核验的字段留空，不推测、不补写。",
      "不收录无法追溯到公开来源的条目。",
    ],
    linkLatest: "最新事件",
    linkTopics: "研究方向",
    linkSources: "来源同步",
    linkMethodology: "方法论",
  },

  /** app/methodology/page.tsx — full-page copy plus per-code label tables. */
  methodology: {
    title: "方法论",
    introA: "本站是一个",
    introStrong: "追踪工具",
    introB:
      "，不是档案库，也不是期刊。它记录研究事件——值得跟进的 AI4Math 进展——并把两类判断彼此分开，供你形成自己的判断：",
    dimensions: [
      {
        n: "01",
        title: "证据等级",
        body: "公开证据的成熟度：发起方的单方声明、一份研究记录、一个可检验的产物，还是一次独立复核。",
      },
      {
        n: "02",
        title: "来源层级",
        body: "证据来自哪里：一手研究、官方公告，或更弱的渠道。",
      },
    ],
    sigStrong: "重要 ≠ 证据成熟。",
    sigA: "历史上影响重大的主张仍可能只有",
    sigEm: "争议",
    sigB:
      "；经 Lean 检验的产物只为它所编码的形式化陈述背书，而非通常表述下的非形式化主张。本站在 2026 年 Navier–Stokes 争议中要区分的正是这一点。",
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
    derivationTitle: "评级是怎么来的",
    derivationIntro:
      "上面的图例说明每个标签的含义，但没说系统如何给一条事件定级。下面是自动派生的完整规则——每条记录先按可核查的事实套用这些规则得出默认评级；人工整理的字段永远优先，规则会误导之处再用手工覆写修正。",
    deriveEvidenceTitle: "证据等级的判定",
    deriveTierTitle: "来源层级的判定",
    condLabel: "触发条件",
    resultLabel: "评级",
    deriveEvidence: [
      { cond: "带有 GitHub 仓库链接——代码、证明或数据可被检验", code: "E1" },
      { cond: "带有论文链接或关联论文列表——存在公开研究记录", code: "E2" },
      { cond: "仅有来源链接——只有发起方自己的公开声明", code: "E3" },
      { cond: "以上都没有", code: "E4" },
    ],
    deriveTier: [
      { cond: "来源为 arXiv、会议论文或 GitHub 仓库", code: "S0" },
      { cond: "来源为博客、演示或其他渠道", code: "S1" },
    ],
    deriveNotesTitle: "两条例外",
    deriveNote1A: "优先级：",
    deriveNote1B:
      "手工覆写 ＞ 人工整理字段 ＞ 自动派生。一条事件若已显式标注了等级，派生规则不会覆盖它。",
    deriveNote2A: "规则会误导处使用手工覆写：",
    deriveNote2B: "例如竞赛成绩由主办方口径给出、并非论文证据，因而保持",
    deriveNote2C:
      "（只有来源方自己的声明）。这类覆写记录在代码的 OVERRIDES 表中，只在必要时使用。",
    dataPolicyTitle: "数据政策",
    policy1:
      "每条条目都保留其原始来源 URL。候选条目的来源若无法确认，宁可剔除，也不发布没有链接的记录。",
    policy2:
      "发布方口径的结果按“单方声明”记录，并保留分母（例如已发布的语料按稿件数计，而不是按已证明的定理数计）。",
    policy3A: "由抓取管线生成的条目",
    policy3B: "直接进入事件流。",
    policy4: "更正与撤回会追加到事件的核验历史中，而不是悄悄改动记录。",
    seeAlsoA: "另见：",
    seeAlsoB: "（数据模型与管线），或",
    seeAlsoC: "（按时间顺序的视图）。",
  },

  /** app/sources/page.tsx */
  sources: {
    title: "来源与同步",
    subtitle:
      "来源按事件类别归档，状态来自最近一次自动同步。站点由 GitHub Actions 定时抓取新事件、重新构建并发布中英文两个版本，因此这里显示的是本次构建时的快照。",
    autoTitle: "自动同步",
    autoBody:
      "工作流每 6 小时运行一次：拉取各来源的增量内容、写入事件库、重新构建并发布。失败会记录在下方对应来源上，并在下一次运行重试。",
    localTitle: "本地同步",
    localBody:
      "在项目根目录运行 npm run sync（或 npm run sync -- --source=arxiv），随后刷新页面。开发模式下也可以直接点下面的按钮，等同执行这条命令。",
    syncAction: "立即同步",
    syncRunningIngest: "正在抓取…",
    syncRunningBuild: "正在重建数据…",
    syncDone: "同步完成",
    syncFailed: "同步失败，详见下方输出",
    syncReload: "刷新查看",
    syncOffline: "本地同步服务未运行；请用 npm run dev 启动，或改用 npm run sync",
    never: "从未记录",
    lastSuccess: "最近成功",
    lastAttempt: "最近尝试",
    cursor: "增量游标",
    result: "最近结果",
    added: "新增",
    updated: "更新",
    rejected: "拒绝",
    error: "错误",
    success: "成功",
    idle: "未同步",
    empty: "该类别暂无已登记的来源。",
    totalSources: "来源总数",
    healthySources: "正常来源",
    failedSources: "失败来源",
    upToDate: "已是最新",
    upToDateHint: "成功但无新增内容",
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
    math4ai: { title: "Math4AI direction", desc: "Events where mathematics is the tool or testbed serving general AI capability — training, prompting and evaluation — classified on the direction axis, co-primary events included." },
    timeline: { title: "Timeline", desc: "Chronological view of recorded AI4Math research events, year by year." },
    topics: { title: "Topics", desc: "Research events grouped by direction, with sub areas and model/benchmark coverage." },
    search: { title: "Search", desc: "Full-site search across research events, papers, topics, models and benchmarks." },
    about: { title: "About", desc: "What the AI4Math Ecosystem Radar records, where its data comes from, and how to read its trust signals." },
    methodology: { title: "Methodology — how to read the labels", desc: "How this tracker keeps evidence level and source tier separate." },
    sources: { title: "Sources & synchronization", desc: "Source state by event class: last automatic sync, ingest result and incremental cursor." },
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
    sub: "Events whose beneficiary is general AI capability — training methods, prompting strategies, capability benchmarks and mathematical tooling. Each is classified automatically on the direction axis; co-primary events appear here too, and the usual class, area and time filters still apply.",
  },

  timeline: {
    sub: "Every recorded ecosystem event in chronological order, grouped by year. Use the five-class filter to narrow to research, people, institutions & education, funding or policy; open an entry for its full evidence record.",
    feedLink: "Feed view with area filters",
    empty: "No events match this filter.",
    decadeNav: "Jump by period",
  },

  topics: {
    sub: "Research progress grouped by direction. People, institutions, funding and policy events are not assigned to a direction; they stay in the feed and timeline.",
    areaCount: "{n} areas",
    updatedLabel: "Updated",
    allProgress: "All research progress",
    modelsLabel: "Models",
    benchmarksLabel: "Benchmarks",
    openTopic: "Open topic",
    subAreasLabel: "Sub areas",
    subAreaTitle: "{count} events · {name}",
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

  search: {
    label: "Full-site search",
    title: "Search",
    sub: "Find research events, papers, topics, models and benchmarks; English and Chinese queries both work.",
  },

  about: {
    label: "About",
    title: "A Research Intelligence Platform for AI4Math",
    introA: "This site is not “an AI that summarizes papers”. Its unit of information is the ",
    introStrong: "Research Event",
    introB:
      " — a piece of AI for Mathematics progress worth tracking. Every record answers the same questions: what happened, who is moving it, why it matters, and where to read the original.",
    tocLabel: "On this page",
    recordTitle: "What it records",
    recordBody:
      "Five primary event classes form the radar. Only research events carry a research-area tag; people, institutions, funding and policy events are recorded as events in their own right, without being forced into a field.",
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
    pipelineTitle: "Where the data comes from",
    pipelineBody:
      "Sources are verifiable public feeds and pages: lab blogs, mathematics department and institute news, society announcements, arXiv and GitHub. Ingested items are normalized, checked for AI4Math relevance, mapped to a research area and summarized into an event by an LLM; titles stay as published. Sync is triggered manually from the Sources page.",
    trustTitle: "How to read the trust signals",
    trustBody:
      "Evidence level answers how well a claim is supported — from a one-sided announcement to an inspectable artifact or an independent check. Source tier answers where the evidence comes from — a primary research record, an official announcement, or a weaker channel. Both are derived automatically from the links a record carries; they are not scores, and they do not replace your own judgement of importance.",
    trustLink: "Full rating rules →",
    dataPolicyTitle: "Data policy",
    policy: [
      "Every event keeps its original source link, so anything beyond the summary can be checked against the original.",
      "Fields that cannot be verified are left empty rather than guessed.",
      "Entries that cannot be traced to a public source are not included.",
    ],
    linkLatest: "Latest events",
    linkTopics: "Research areas",
    linkSources: "Sources",
    linkMethodology: "Methodology",
  },

  methodology: {
    title: "Methodology",
    introA: "This site is a ",
    introStrong: "tracker",
    introB:
      ", not an archive and not a journal. It records Research Events — pieces of AI4Math progress worth following — and it keeps two judgements separate so you can form your own:",
    dimensions: [
      {
        n: "01",
        title: "Evidence level",
        body: "How mature the public evidence is: an independent check, an inspectable artifact, a research record, the originator's own claim, or no evidence.",
      },
      {
        n: "02",
        title: "Source tier",
        body: "Where the evidence comes from: primary research, an official announcement, or weaker channels.",
      },
    ],
    sigStrong: "Significance ≠ evidence maturity.",
    sigA: " A historically big claim can still have only ",
    sigEm: "disputed",
    sigB:
      "; a Lean-checked artifact certifies the formal statement it encodes, not the informal claim as usually stated. That distinction is exactly what the 2026 Navier–Stokes dispute on this site is about.",
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
    derivationTitle: "How the ratings are assigned",
    derivationIntro:
      "The legends above say what each label means, but not how a rating is decided. Below is the full derivation: every record is first scored against these rules from its verifiable facts; curated fields always win, and manual overrides correct the cases where the rules would mislead.",
    deriveEvidenceTitle: "Evidence level",
    deriveTierTitle: "Source tier",
    condLabel: "Trigger",
    resultLabel: "Rating",
    deriveEvidence: [
      { cond: "Has a GitHub repository link — code, proofs or data can be inspected", code: "E1" },
      { cond: "Has a paper link or a list of associated papers — a research record exists", code: "E2" },
      { cond: "Has only a source link — the originating party's own public statement", code: "E3" },
      { cond: "None of the above", code: "E4" },
    ],
    deriveTier: [
      { cond: "Source is arXiv, a conference paper or a GitHub repository", code: "S0" },
      { cond: "Source is a blog, a demo or any other channel", code: "S1" },
    ],
    deriveNotesTitle: "Two exceptions",
    deriveNote1A: "Precedence: ",
    deriveNote1B:
      "manual override > curated field > automatic derivation. If an event already states a level explicitly, the derivation rules never overwrite it.",
    deriveNote2A: "Manual overrides cover the cases where the rules mislead: ",
    deriveNote2B:
      "a competition result, for example, is a grading claim from the contest side rather than evidence in a paper, so it stays ",
    deriveNote2C:
      " (only the originator's own statement). Such overrides live in the code's OVERRIDES table and are used only where needed.",
    dataPolicyTitle: "Data policy",
    policy1:
      "Every entry keeps its original source URL. If a candidate's source could not be confirmed, it was dropped rather than shipped without a link.",
    policy2:
      "Publisher-reported results are recorded as originator claims, with denominators preserved (e.g. a released corpus is counted as manuscripts, not as proven theorems).",
    policy3A: "Entries produced by the ingest pipeline enter ",
    policy3B: "the feed immediately.",
    policy4:
      "Corrections and withdrawals are appended to an event's verification history instead of silently editing the record.",
    seeAlsoA: "See also ",
    seeAlsoB: " for the data model and pipeline, or ",
    seeAlsoC: " for the chronological view.",
  },

  sources: {
    title: "Sources & synchronization",
    subtitle:
      "Sources are grouped by event class, and each state comes from the last automatic sync. GitHub Actions pulls new events, rebuilds both language builds and publishes them, so what you see here is the snapshot taken at build time.",
    autoTitle: "Automatic sync",
    autoBody:
      "The workflow runs every six hours: it pulls incremental items from every source, stores accepted events, rebuilds and publishes. A failure is recorded on that source and retried on the next run.",
    localTitle: "Local sync",
    localBody:
      "Run npm run sync (or npm run sync -- --source=arxiv) from the project root, then refresh this page. In development the button below runs the same command.",
    syncAction: "Sync now",
    syncRunningIngest: "Pulling sources…",
    syncRunningBuild: "Rebuilding data…",
    syncDone: "Sync finished",
    syncFailed: "Sync failed; see the output below",
    syncReload: "Refresh",
    syncOffline: "Local sync is not running; start it with npm run dev, or use npm run sync",
    never: "Never recorded",
    lastSuccess: "Last success",
    lastAttempt: "Last attempt",
    cursor: "Incremental cursor",
    result: "Last result",
    added: "added",
    updated: "updated",
    rejected: "rejected",
    error: "Error",
    success: "Success",
    idle: "Never synced",
    empty: "No sources registered in this category yet.",
    totalSources: "Total sources",
    healthySources: "Healthy",
    failedSources: "Failed",
    upToDate: "Already up to date",
    upToDateHint: "Succeeded with no new content",
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

