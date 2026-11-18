"use client";

import { useState, type ReactNode } from "react";
import type { LabTrack } from "@/data/lab-archive/records";
import type { Lang } from "@/lib/i18n/dict";

export interface TaskExplorerItem {
  id: string;
  track: LabTrack;
  search: string;
  content: ReactNode;
}

type Filter = "all" | "openai" | "anthropic" | "independent";

export function TaskExplorer({ items, lang }: { items: TaskExplorerItem[]; lang: Lang }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const zh = lang === "zh";
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visible = items.filter((item) =>
    (filter === "all" || item.track === filter) &&
    (!normalizedQuery || item.search.toLocaleLowerCase().includes(normalizedQuery))
  );
  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: zh ? "全部" : "All" },
    { id: "openai", label: "OpenAI" },
    { id: "anthropic", label: "Anthropic" },
    { id: "independent", label: zh ? "独立评测" : "Independent" },
  ];

  return (
    <div className="labs-explorer">
      <div className="labs-toolbar">
        <div className="labs-filters" role="group" aria-label={zh ? "按来源筛选" : "Filter by source"}>
          {filters.map(({ id, label }) => {
            const count = id === "all" ? items.length : items.filter((item) => item.track === id).length;
            return (
              <button
                key={id}
                type="button"
                className={`labs-filter ${filter === id ? "labs-filter-active" : ""}`}
                onClick={() => setFilter(id)}
                aria-pressed={filter === id}
              >
                {label}<span>{count}</span>
              </button>
            );
          })}
        </div>
        <label className="labs-search">
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8.6" cy="8.6" r="5.6" /><path d="m13 13 4.3 4.3" />
          </svg>
          <span className="sr-only">{zh ? "搜索任务" : "Search tasks"}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={zh ? "搜索题目、模型或结果" : "Search tasks, models or results"}
          />
        </label>
      </div>
      <div className="labs-list-head" role="status" aria-live="polite">
        <span>{zh ? "案例索引" : "CASE INDEX"}</span>
        <span>{zh ? `显示 ${visible.length} / ${items.length} 条` : `Showing ${visible.length} / ${items.length}`}</span>
      </div>
      {visible.length > 0 ? (
        <div className="labs-ledger">{visible.map((item) => <div key={item.id}>{item.content}</div>)}</div>
      ) : (
        <div className="labs-empty">
          <span className="labs-empty-mark">∅</span>
          <p>{zh ? "没有符合条件的案例" : "No matching cases"}</p>
          <button type="button" onClick={() => { setFilter("all"); setQuery(""); }}>
            {zh ? "清除筛选" : "Clear filters"} ↗
          </button>
        </div>
      )}
    </div>
  );
}
