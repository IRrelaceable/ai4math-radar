"use client";

import Link from "next/link";
import type { ResearchArea, TopicStat } from "@/types";
import { formatDate } from "@/lib/utils";
import { useLang } from "@/lib/i18n/context";
import { componentsDict } from "@/lib/i18n/dict.components";
import { displayArea } from "@/lib/i18n/localize";

/** Horizontal activity bar for one topic (value computed from the data). */
export function TopicBar({
  stat,
  max,
  showMeta = true,
}: {
  stat: TopicStat;
  max: number;
  showMeta?: boolean;
}) {
  const { lang } = useLang();
  const c = componentsDict[lang];
  const pct = Math.max(4, Math.round((stat.count / Math.max(1, max)) * 100));

  return (
    <Link href={`/topics/${stat.slug}`} className="block group">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink-900 group-hover:text-accent-700">
          {displayArea(stat.topic as ResearchArea, lang)}
        </span>
        <span className="font-mono text-xs text-ink-500">
          {stat.count}{" "}
          {stat.count === 1 ? c.topic.researchEvent : c.topic.researchEvents}
        </span>
      </div>
      <div className="mt-1.5 h-2.5 w-full rounded-sm bg-ink-100" aria-hidden="true">
        <div
          className="h-2.5 rounded-sm bg-accent-600 transition-[width] group-hover:bg-accent-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showMeta && (
        <div className="mono-label mt-1 normal-case tracking-normal">
          {c.topic.latestPrefix}
          {formatDate(stat.latestDate, lang)}
        </div>
      )}
    </Link>
  );
}
