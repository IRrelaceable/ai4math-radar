import type { Lang } from "./dict";

/**
 * Component-level UI dictionary, mirroring `dict.ts` (zh default, en mirror).
 *
 * Only strings that the core dictionary does not already cover live here;
 * always prefer `t.common.*`, `t.trust.*`, `t.home.*`, `t.detail.*` first.
 * Research content (event titles, papers, area/model/benchmark names) is data
 * and is never translated.
 *
 * Interpolated values use `{name}` placeholders; substitute with
 * `value.replace("{name}", String(x))`.
 */
const zh = {
  // components/research/FeedControls.tsx
  feed: {
    searchAria: "搜索生态事件",
    areaLabel: "研究方向",
    areaAll: "全部方向",
    byImportance: "重要度（主观评估）",
    timeLabel: "时间范围",
    timeAll: "全部时间",
    windows: {
      "30d": "最近 30 天",
      "90d": "最近 90 天",
      "180d": "最近 180 天",
      "365d": "最近一年",
    },
    statusLabel: "核验状态",
    statusAll: "全部状态",
    evidenceLabel: "证据等级",
    evidenceAll: "全部证据",
    tierLabel: "来源层级",
    tierAll: "全部来源",
  },

  // components/research/LineageTimeline.tsx
  lineage: {
    previousWork: "前作",
    thisWork: "本事件",
    followupWork: "后续工作",
    notRecorded: "尚未记录",
  },

  // components/research/PipelineStrip.tsx
  pipeline: {
    researchSource: "研究来源",
    researchSourceHint: "arXiv · GitHub · 会议 · 博客（v1 为模拟数据）",
    rawInputHint: "未处理的原始输入",
    normalizer: "规范化器",
    normalizerHint: "统一字段",
    classifier: "分类器",
    classifierHint: "是否 AI4Math？方向？",
    eventHint: "发生了什么 + 为什么重要",
  },

  // components/topics/TopicBar.tsx
  topic: {
    researchEvent: "条研究事件",
    researchEvents: "条研究事件",
    latestPrefix: "最近：",
  },

  // components/topics/TrendChart.tsx
  trendChart: {
    empty: "暂无可绘制的事件。",
    monthTitle: "{month}：{count} 条事件",
    activeMonths: "{n} 个活跃月份",
    peakMonth: "单月峰值 {max} 条",
    latestPrefix: "最近：",
  },

  // components/topics/TrendPanel.tsx
  trendPanel: {
    emptyWindow: "最近 {days} 天内没有追踪到的事件。",
    eventsInWindow: "最近 {days} 天内的事件",
    vsPrevious: "较上一窗口",
    legendNote:
      "灰色 = 前 {days} 天，彩色 = 当前窗口。统计的是追踪到的事件数量。",
    howToRead: "如何解读",
  },

  // components/research-map/ResearchMapTree.tsx
  map: {
    eventsMapped: "条事件已映射",
    subAreas: "子方向",
    subAreaTitle: "{count} 条事件 · {name}",
  },

  // components/search/SearchBox.tsx
  search: {
    heroPlaceholder: "搜索 AI4Math 研究…",
    headerPlaceholder: "搜索…",
    submit: "搜索",
    heroAria: "搜索 AI4Math 研究",
    headerAria: "搜索研究内容",
    kbdHint: "按 Enter 搜索",
  },

  // components/search/SearchResults.tsx
  results: {
    groupEvents: "研究事件",
    typeQueryBefore: "输入查询词，例如 ",
    typeQueryMiddle: " 或 ",
    typeQueryAfter: "。",
    searchingPrefix: "正在搜索",
    searchErrorPrefix: "搜索出错：",
    noResultsBefore: "没有找到与",
    noResultsAfter:
      "相关的结果。试试方向名（Geometry）、系统名（Lean），或模型 / Benchmark 名称。",
    countPrefix: "条与",
    countSuffix: "相关的结果",
  },
};

export type ComponentsDict = typeof zh;

/**
 * The English side is typed as `ComponentsDict`, so a missing (or renamed)
 * key fails `tsc` at this assignment — no key may drift out of sync.
 */
const en: ComponentsDict = {
  // components/research/FeedControls.tsx
  feed: {
    searchAria: "Search ecosystem events",
    areaLabel: "Research area",
    areaAll: "All areas",
    byImportance: "Importance (subjective)",
    timeLabel: "Time range",
    timeAll: "All time",
    windows: {
      "30d": "Last 30 days",
      "90d": "Last 90 days",
      "180d": "Last 180 days",
      "365d": "Last 12 months",
    },
    statusLabel: "Verification status",
    statusAll: "Any status",
    evidenceLabel: "Evidence level",
    evidenceAll: "Any evidence",
    tierLabel: "Source tier",
    tierAll: "Any source",
  },

  // components/research/LineageTimeline.tsx
  lineage: {
    previousWork: "Previous work",
    thisWork: "This event",
    followupWork: "Follow-up work",
    notRecorded: "Not yet recorded",
  },

  // components/research/PipelineStrip.tsx
  pipeline: {
    researchSource: "Research source",
    researchSourceHint: "arXiv · GitHub · Conference · Blog (mock in v1)",
    rawInputHint: "unprocessed input",
    normalizer: "Normalizer",
    normalizerHint: "uniform fields",
    classifier: "Classifier",
    classifierHint: "AI4Math? area?",
    eventHint: "what happened + why it matters",
  },

  // components/topics/TopicBar.tsx
  topic: {
    researchEvent: "research event",
    researchEvents: "research events",
    latestPrefix: "latest: ",
  },

  // components/topics/TrendChart.tsx
  trendChart: {
    empty: "No events to chart.",
    monthTitle: "{month}: {count} events",
    activeMonths: "{n} active months",
    peakMonth: "peak {max} events in a month",
    latestPrefix: "latest: ",
  },

  // components/topics/TrendPanel.tsx
  trendPanel: {
    emptyWindow: "No tracked events in the last {days} days.",
    eventsInWindow: "events in the last {days} days",
    vsPrevious: "vs previous window",
    legendNote:
      "Grey = previous {days} days, colored = current window. Counts of tracked events.",
    howToRead: "How to read this",
  },

  // components/research-map/ResearchMapTree.tsx
  map: {
    eventsMapped: "events mapped",
    subAreas: "sub areas",
    subAreaTitle: "{count} events in {name}",
  },

  // components/search/SearchBox.tsx
  search: {
    heroPlaceholder: "Search AI4Math research…",
    headerPlaceholder: "Search...",
    submit: "Search",
    heroAria: "Search AI4Math research",
    headerAria: "Search research",
    kbdHint: "Press Enter to search",
  },

  // components/search/SearchResults.tsx
  results: {
    groupEvents: "Research Events",
    typeQueryBefore: "Type a query such as ",
    typeQueryMiddle: " or ",
    typeQueryAfter: ".",
    searchingPrefix: "Searching ",
    searchErrorPrefix: "Search error: ",
    noResultsBefore: "No results for ",
    noResultsAfter:
      ". Try an area name (Geometry), a system (Lean), or a model/benchmark name.",
    countPrefix: "results for ",
    countSuffix: "",
  },
};

export const componentsDict: Record<Lang, ComponentsDict> = { zh, en };

