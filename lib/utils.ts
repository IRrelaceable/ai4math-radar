import type { ResearchEvent } from "@/types";

/** Lowercase, ascii-safe, hyphenated identifier used in URLs. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "2024-07-01" -> "Jul 2024" (demo data uses month precision). */
export function formatDate(iso: string): string {
  const [y, m] = iso.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const idx = Number(m) - 1;
  if (Number.isNaN(idx) || idx < 0 || idx > 11) return iso;
  return `${months[idx]} ${y}`;
}

/** Full date for detail pages. */
export function formatDateLong(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function yearOf(iso: string): string {
  return iso.slice(0, 4);
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/** Simple case-insensitive match used by search / filters. */
export function matchesQuery(haystack: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return haystack.toLowerCase().includes(q);
}

/** Build a flat, searchable text blob for one event. */
export function eventSearchText(e: ResearchEvent): string {
  return [
    e.title,
    e.summary,
    e.significance,
    e.eventType ?? "",
    e.researchEventType ?? "",
    e.researchArea,
    e.subArea ?? "",
    e.institution ?? "",
    ...(e.authors ?? []),
    ...(e.model ?? []),
    ...(e.benchmark ?? []),
    ...(e.dataset ?? []),
    ...(e.papers ?? []).map((p) => p.title),
    ...(e.relatedWorks ?? []).map((w) => w.title),
    e.importanceNote ?? "",
    JSON.stringify(e.metadata ?? {}),
  ].join(" ");
}

/** Default ordering: newest first. */
export function sortEvents(events: ResearchEvent[]): ResearchEvent[] {
  return [...events].sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Explicitly assessed events first, highest score first. Unassessed events
 * follow newest-first so the optional ranking never invents a score.
 */
export function sortEventsByImportance(events: ResearchEvent[]): ResearchEvent[] {
  return [...events].sort((a, b) => {
    const aScore = a.importanceScore;
    const bScore = b.importanceScore;
    if (aScore !== undefined && bScore !== undefined) {
      return bScore - aScore || b.date.localeCompare(a.date);
    }
    if (aScore !== undefined) return -1;
    if (bScore !== undefined) return 1;
    return b.date.localeCompare(a.date);
  });
}

