import Link from "next/link";
import type { ResearchArea } from "@/types";
import type { Lang } from "@/lib/i18n/dict";
import { slugify } from "@/lib/utils";
import { displayArea, displaySubArea } from "@/lib/i18n/localize";

const TONE: Record<ResearchArea, string> = {
  "Theorem Proving & Formal Mathematics": "border-accent-200 bg-accent-50 text-accent-700",
  "Mathematical Reasoning & LLMs": "border-sky-200 bg-sky-50 text-sky-700",
  "Mathematical Agents": "border-rose-200 bg-rose-50 text-rose-700",
  "Mathematical Discovery & Symbolic Computation": "border-violet-200 bg-violet-50 text-violet-700",
  Geometry: "border-amber-200 bg-amber-50 text-amber-700",
  "Benchmarks & Datasets": "border-slate-200 bg-slate-50 text-slate-700",
};

export function AreaBadge({
  area,
  subArea,
  lang,
  link = true,
}: {
  area?: ResearchArea;
  subArea?: string;
  lang: Lang;
  link?: boolean;
}) {
  // Ecosystem events (People / Institutions / Funding / PolicyCommunity) carry
  // no research direction, so there is nothing to badge here.
  if (!area) return null;
  const tone = TONE[area] ?? "border-ink-200 bg-ink-50 text-ink-700";
  const areaLabel = displayArea(area, lang);
  const subLabel = displaySubArea(subArea, lang);
  const label = subLabel ? `${areaLabel} → ${subLabel}` : areaLabel;
  const className = `chip ${tone} font-medium`;

  if (!link) return <span className={className}>{label}</span>;

  return (
    <Link href={`/topics/${slugify(area)}`} className={`${className} hover:border-ink-300`}>
      {label}
    </Link>
  );
}
