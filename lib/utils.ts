import type { ResearchEvent } from "@/types";
import type { Lang } from "@/lib/i18n/dict";

/** Lowercase, ascii-safe, hyphenated identifier used in URLs. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Parse "YYYY-MM-DD" straight from the string. Deliberately avoids
 * `new Date(iso)`, which parses as UTC midnight and rolls the day back in
 * negative-offset timezones (e.g. "2024-07-25" → July 24 in UTC-5).
 */
function parseYmd(iso: string): { y: string; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { y: match[1], m, d };
}

/** "2024-07-25" -> "Jul 25, 2024" (en) / "2024年7月25日" (zh). Day precision. */
export function formatDate(iso: string, lang: Lang = "zh"): string {
  const p = parseYmd(iso);
  if (!p) return iso;
  if (lang === "zh") return `${p.y}年${p.m}月${p.d}日`;
  return `${MONTHS_SHORT[p.m - 1]} ${p.d}, ${p.y}`;
}

/** Full date for detail pages: "July 25, 2024" (en) / "2024年7月25日" (zh). */
export function formatDateLong(iso: string, lang: Lang = "zh"): string {
  const p = parseYmd(iso);
  if (!p) return iso;
  if (lang === "zh") return `${p.y}年${p.m}月${p.d}日`;
  return `${MONTHS_LONG[p.m - 1]} ${p.d}, ${p.y}`;
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

