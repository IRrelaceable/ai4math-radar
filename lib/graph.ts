import type { ResearchEvent } from "@/types";
import { CAPABILITIES, MATH_TOPICS, facetsOf, type FacetValue } from "@/lib/dimensions";
import { buildTrackedEvents, updatesOf } from "@/lib/tracking";
import { localizeEvents } from "@/lib/i18n/localize";

/**
 * Research-graph matrix: research theme (cap) × math domain (math). Both axes
 * are the build-time facets derived from the raw record, so the graph is a
 * read-time view of the same caliber the feed filters on — never a stored
 * annotation. A research event may touch several math domains (multi-label),
 * so it lands in every matching cell; cell sums can therefore exceed the
 * distinct-event row/column totals. Ecosystem events carry no cap and no math
 * domain and are reported separately, not drawn.
 */
export interface GraphMatrix {
  rows: FacetValue[];
  cols: FacetValue[];
  /** cells[rowId][colId] = number of events with that theme AND domain. */
  cells: Record<string, Record<string, number>>;
  /** Distinct events per theme (row total). */
  rowTotals: Record<string, number>;
  /** Distinct capped events per domain (column total). */
  colTotals: Record<string, number>;
  /** Largest single cell, for the colour scale. */
  max: number;
  /** Capped research events that matched no math domain. */
  noMath: number;
  /** Events with no theme (ecosystem classes). */
  noCap: number;
  /** Distinct capped events drawn in the grid. */
  capped: number;
  total: number;
}

export function buildGraphMatrix(events: readonly ResearchEvent[]): GraphMatrix {
  const cells: Record<string, Record<string, number>> = {};
  const rowTotals: Record<string, number> = {};
  const colTotals: Record<string, number> = {};
  for (const row of CAPABILITIES) {
    cells[row.id] = {};
    rowTotals[row.id] = 0;
    for (const col of MATH_TOPICS) cells[row.id][col.id] = 0;
  }
  for (const col of MATH_TOPICS) colTotals[col.id] = 0;

  let max = 0;
  let noMath = 0;
  let noCap = 0;
  let capped = 0;

  for (const event of events) {
    const { cap, math } = facetsOf(event);
    if (!cap || !(cap in cells)) {
      noCap += 1;
      continue;
    }
    capped += 1;
    rowTotals[cap] += 1;
    if (math.length === 0) {
      noMath += 1;
      continue;
    }
    for (const domain of math) {
      if (!(domain in cells[cap])) continue;
      cells[cap][domain] += 1;
      colTotals[domain] += 1;
      if (cells[cap][domain] > max) max = cells[cap][domain];
    }
  }

  return {
    rows: CAPABILITIES,
    cols: MATH_TOPICS,
    cells,
    rowTotals,
    colTotals,
    max,
    noMath,
    noCap,
    capped,
    total: events.length,
  };
}

/** One dot per source record in the scatter map. Facets come from the RAW
 *  record; only the display title is localized. `weight` drives dot size and
 *  is the tracked line's substantive progress + relation degree, so a dot
 *  grows with how much has actually happened around that result. */
export interface ScatterNode {
  slug: string;
  title: string;
  date: string;
  cap?: string;
  math: string[];
  direction: string;
  type: string;
  weight: number;
}

export interface ScatterLink {
  a: string;
  b: string;
  kind: "line" | "project" | "relation";
}

export interface ScatterData {
  nodes: ScatterNode[];
  links: ScatterLink[];
}

export function buildScatterData(events: readonly ResearchEvent[], lang: "zh" | "en"): ScatterData {
  const localized = localizeEvents(events as ResearchEvent[], lang);
  const tracked = buildTrackedEvents(events as ResearchEvent[]);
  const weightByEvent = new Map<string, number>();
  const headlineByEvent = new Map<string, string>();
  const membersByProject = new Map<string, string[]>();
  const slugsByEvent = new Map<string, string[]>();

  for (const t of tracked) {
    weightByEvent.set(t.id, updatesOf(t).length + t.relations.length);
    const headline = t.progress.find((s) => s.kind === "initial") ?? t.progress[0];
    headlineByEvent.set(t.id, headline.eventSlug);
    slugsByEvent.set(t.id, t.progress.map((s) => s.eventSlug));
    if (t.projectId) {
      const list = membersByProject.get(t.projectId) ?? [];
      list.push(headline.eventSlug);
      membersByProject.set(t.projectId, list);
    }
  }

  const nodes: ScatterNode[] = events.map((e, i) => {
    const { cap, math } = facetsOf(e);
    const eventId = e.tracking?.eventId ?? `event-${e.id}`;
    return {
      slug: e.slug,
      title: localized[i]?.title ?? e.title,
      date: e.date,
      cap,
      math,
      direction: e.direction ?? "none",
      type: e.eventType ?? "Research",
      weight: Math.max(1, weightByEvent.get(eventId) ?? 1),
    };
  });

  const seen = new Set<string>();
  const links: ScatterLink[] = [];
  const push = (a: string, b: string, kind: ScatterLink["kind"]) => {
    if (a === b) return;
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (seen.has(key)) return;
    seen.add(key);
    links.push({ a, b, kind });
  };

  // Same-event lines: chain the source records of one tracked Event.
  for (const slugs of slugsByEvent.values()) {
    for (let i = 1; i < slugs.length; i++) push(slugs[i - 1], slugs[i], "line");
  }
  // Same-project: star from the first member to the rest.
  for (const members of membersByProject.values()) {
    for (let i = 1; i < members.length; i++) push(members[0], members[i], "project");
  }
  // Explicit relations between Event headlines.
  for (const t of tracked) {
    for (const edge of t.relations) {
      if (edge.fromEventId !== t.id) continue;
      const from = headlineByEvent.get(edge.fromEventId);
      const to = headlineByEvent.get(edge.toEventId);
      if (from && to) push(from, to, "relation");
    }
  }

  return { nodes, links };
}