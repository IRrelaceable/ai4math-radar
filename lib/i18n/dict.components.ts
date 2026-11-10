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
    timeLabel: "时间",
    timeAll: "全部时间",
    windows: {
      "30d": "最近 30 天",
      "90d": "最近 90 天",
      "180d": "最近 180 天",
      "365d": "最近一年",
    },
    clearFilters: "清除筛选",
    noResultsTitle: "没有匹配的事件",
    noResultsHint: "试试放宽筛选条件，或清除全部筛选。",
    resultsCount: "{n} 条结果",
    evidenceLabel: "证据等级",
    evidenceAll: "任意证据等级",
    tierLabel: "来源层级",
    expandYearMonths: "展开全年",
    collapseYearMonths: "收起全年",
    tierAll: "任意来源层级",
    viewLabel: "视图",
    loading: "正在载入事件…",
    loadError: "事件数据载入失败，请刷新页面重试。",
  },

  // components/research/LineageTimeline.tsx
  lineage: {
    previousWork: "前作",
    thisWork: "本事件",
    followupWork: "后续工作",
    referenceNote: "本事件参考文献列出",
    citationNote: "引用了本事件",
    original: "原文",
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

  // components/search/SearchBox.tsx
  search: {
    heroPlaceholder: "搜索 AI4Math 研究…",
    headerPlaceholder: "搜索…",
    submit: "搜索",
    heroAria: "搜索 AI4Math 研究",
    headerAria: "搜索研究内容",
    kbdHint: "按 / 聚焦搜索，回车提交",
  },

  // components/search/SearchResults.tsx
  results: {
    groupEvents: "研究事件",
    typeQueryBefore: "输入查询词，例如 ",
    typeQueryExampleA: "定理证明",
    typeQueryMiddle: " 或 ",
    typeQueryExampleB: "智能体",
    typeQueryAfter: "。",
    searchingPrefix: "正在搜索",
    searchErrorPrefix: "搜索出错：",
    noResultsBefore: "没有找到与",
    noResultsAfter:
      "相关的结果。试试方向名（几何）、系统名（Lean），或模型 / Benchmark 名称。",
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
    timeLabel: "Time",
    timeAll: "All time",
    windows: {
      "30d": "Last 30 days",
      "90d": "Last 90 days",
      "180d": "Last 180 days",
      "365d": "Last 12 months",
    },
    clearFilters: "Clear filters",
    noResultsTitle: "No events match",
    noResultsHint: "Try loosening the filters, or clear them all.",
    resultsCount: "{n} results",
    evidenceLabel: "Evidence level",
    evidenceAll: "Any evidence level",
    tierLabel: "Source tier",
    expandYearMonths: "Expand all months",
    collapseYearMonths: "Collapse all months",
    tierAll: "Any source tier",
    viewLabel: "View",
    loading: "Loading events…",
    loadError: "Could not load the event data. Reload the page to try again.",
  },

  // components/research/LineageTimeline.tsx
  lineage: {
    previousWork: "Previous work",
    thisWork: "This event",
    followupWork: "Follow-up work",
    referenceNote: "In this event's references",
    citationNote: "Cites this event",
    original: "Original",
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

  // components/search/SearchBox.tsx
  search: {
    heroPlaceholder: "Search AI4Math research…",
    headerPlaceholder: "Search...",
    submit: "Search",
    heroAria: "Search AI4Math research",
    headerAria: "Search research",
    kbdHint: "Press / to focus, Enter to search",
  },

  // components/search/SearchResults.tsx
  results: {
    groupEvents: "Research Events",
    typeQueryBefore: "Type a query such as ",
    typeQueryExampleA: "Lean theorem proving",
    typeQueryMiddle: " or ",
    typeQueryExampleB: "mathematical agents",
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
