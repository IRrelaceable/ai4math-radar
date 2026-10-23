import Link from "next/link";
import type { ResearchArea } from "@/types";
import { slugify } from "@/lib/utils";

const TONE: Record<ResearchArea, string> = {
  "Mathematical Reasoning": "border-ink-200 bg-ink-50 text-ink-700",
  "Theorem Proving": "border-accent-200 bg-accent-50 text-accent-700",
  "Formal Mathematics": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Mathematical Discovery": "border-violet-200 bg-violet-50 text-violet-700",
  Geometry: "border-amber-200 bg-amber-50 text-amber-700",
  "Symbolic Mathematics": "border-cyan-200 bg-cyan-50 text-cyan-700",
  "Mathematical Agents": "border-rose-200 bg-rose-50 text-rose-700",
  "LLM for Mathematics": "border-sky-200 bg-sky-50 text-sky-700",
  "Benchmarks & Datasets": "border-slate-200 bg-slate-50 text-slate-700",
  "AI-assisted Research": "border-teal-200 bg-teal-50 text-teal-700",
};

export function AreaBadge({
  area,
  subArea,
  link = true,
}: {
  area: ResearchArea;
  subArea?: string;
  link?: boolean;
}) {
  const tone = TONE[area] ?? "border-ink-200 bg-ink-50 text-ink-700";
  const label = subArea ? `${area} → ${subArea}` : area;
  const className = `chip ${tone} font-medium`;

  if (!link) return <span className={className}>{label}</span>;

  return (
    <Link href={`/topics/${slugify(area)}`} className={`${className} hover:border-ink-300`}>
      {label}
    </Link>
  );
}
