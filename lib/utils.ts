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

const ARXIV_RE =
  /(?:arxiv\.org\/(?:abs|pdf|format)\/|doi\.org\/10\.48550\/arXiv\.)(\d{4}\.\d{4,5})(?:v\d+)?/i;
const ARXIV_DOI_RE = /10\.48550\/arXiv\.(\d{4}\.\d{4,5})(?:v\d+)?/i;

/** arXiv identifier carried by an abs/pdf/DOI URL, when there is one. */
export function arxivIdOf(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return ARXIV_RE.exec(url)?.[1] ?? ARXIV_DOI_RE.exec(url)?.[1];
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
  // Pipeline timestamps carry a time ("2026-10-28T08:05:41.678Z"); only the
  // calendar-day part is displayed, so the suffix is ignored.
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ].*)?$/.exec(iso);
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

/** "2026-10" -> "10月" (zh) / "October" (en). */
export function formatMonth(iso: string, lang: Lang = "zh"): string {
  const match = /^(\d{4})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const m = Number(match[2]);
  if (m < 1 || m > 12) return iso;
  return lang === "zh" ? `${m}月` : MONTHS_LONG[m - 1];
}

/** "2026-10" -> "2026年10月" (zh) / "October 2026" (en). Year-qualified month. */
export function formatMonthYear(iso: string, lang: Lang = "zh"): string {
  const match = /^(\d{4})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const m = Number(match[2]);
  if (m < 1 || m > 12) return iso;
  return lang === "zh"
    ? `${match[1]}年${m}月`
    : `${MONTHS_LONG[m - 1]} ${match[1]}`;
}

/** Compact month label for jump chips: "10月" (zh) / "Oct" (en). */
export function formatMonthShort(iso: string, lang: Lang = "zh"): string {
  const match = /^(\d{4})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const m = Number(match[2]);
  if (m < 1 || m > 12) return iso;
  return lang === "zh" ? `${m}月` : MONTHS_SHORT[m - 1];
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

/** "2024-07-25" -> "07-25"; the year and month are group headings elsewhere. */
export function formatMonthDay(iso: string): string {
  const p = parseYmd(iso);
  if (!p) return iso;
  return `${String(p.m).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;
}

/**
 * Short preview for lists that visually clamp to a couple of lines. Keeps the
 * server payload proportional to what is read: a 1,900-character abstract
 * would otherwise ship in full just to be clipped by CSS.
 */
export function truncateText(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const boundary = cut.lastIndexOf(" ");
  const body = boundary > max * 0.6 ? cut.slice(0, boundary) : cut;
  return `${body.trimEnd()}…`;
}

/** Bare hostname for a source URL, with the "www." noise removed. */
export function sourceHost(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
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
  // The zh UI is searched with Chinese words, so the stored translation is
  // part of the blob; matching the English source alone returns nothing for a
  // query like 定理证明.
  const zh = e.translations?.zh;
  return [
    e.title,
    e.summary,
    e.significance,
    zh?.title ?? "",
    zh?.summary ?? "",
    zh?.significance ?? "",
    e.eventType ?? "",
    e.researchArea,
    e.subArea ?? "",
    e.institution ?? "",
    ...(e.authors ?? []),
    ...(e.model ?? []),
    ...(e.benchmark ?? []),
    ...(e.dataset ?? []),
    ...(e.papers ?? []).map((p) => p.title),
    ...(e.relatedWorks ?? []).map((w) => w.title),
    JSON.stringify(e.metadata ?? {}),
  ].join(" ");
}

/** Default ordering: newest first. */
export function sortEvents(events: ResearchEvent[]): ResearchEvent[] {
  return [...events].sort((a, b) => b.date.localeCompare(a.date));
}

