"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ScatterData, ScatterNode } from "@/lib/graph";
import { clusterIds, clusterOf, selectScatterNodes, type ScatterAxis } from "@/lib/scatterSelection";

export interface ScatterLabels {
  cap: Record<string, string>;
  math: Record<string, string>;
  type: Record<string, string>;
  direction: Record<string, string>;
}

export interface ScatterCopy {
  colorBy: string;
  axisCap: string;
  axisMath: string;
  axisDirection: string;
  axisType: string;
  gravity: string;
  spread: string;
  dotSize: string;
  labels: string;
  halo: string;
  search: string;
  reset: string;
  relayout: string;
  exportSvg: string;
  exportPng: string;
  zoomIn: string;
  zoomOut: string;
  fit: string;
  legend: string;
  all: string;
  hint: string;
  progress: string;
  statusDots: string;
  layoutGroup: string;
  displayGroup: string;
  findGroup: string;
  actionGroup: string;
  searchMatches: string;
  searchNone: string;
  advanced: string;
}

/** Categorical hues, one per cluster. */
const COLORS: Record<ScatterAxis, Record<string, string>> = {
  cap: {
    "reasoning-llms": "#4f5bd5",
    agents: "#14807f",
    "neuro-symbolic-proving": "#7556b8",
    "foundations-of-ai": "#c0496f",
    "discovery-symbolic": "#b26a12",
    "benchmarks-datasets": "#4c8f3f",
  },
  math: {
    algebra: "#b26a12",
    geometry: "#4f5bd5",
    analysis: "#2f7fb8",
    combinatorics: "#4c8f3f",
    "probability-statistics": "#7556b8",
    optimization: "#c0496f",
    "mathematical-physics": "#14807f",
  },
  direction: { ai4math: "#3b5bdb", math4ai: "#7c5cc4", both: "#c07a1a" },
  type: {
    Research: "#4f5bd5",
    People: "#c0496f",
    Institutions: "#14807f",
    Funding: "#b26a12",
    PolicyCommunity: "#7556b8",
  },
};

const W = 1000;
const H = 720;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Dot radius from tracked weight. One formula shared by the rendered circle
 *  and the collision solver, so spacing always matches what is on screen. */
function dotRadius(weight: number, dotSize: number): number {
  return (2.3 + Math.min(4.2, Math.sqrt(Math.max(1, weight)) * 1.35)) * dotSize;
}

function labelOf(id: string, axis: ScatterAxis, labels: ScatterLabels): string {
  return labels[axis][id] ?? id;
}

interface Sim {
  x: Float64Array;
  y: Float64Array;
  vx: Float64Array;
  vy: Float64Array;
  /** Per-node seeded offset inside its cluster: gravity aims at anchor+offset
   *  so clusters stay loose organic clouds instead of packing into a ball. */
  ox: Float64Array;
  oy: Float64Array;
  cluster: string[];
  anchors: Map<string, { x: number; y: number; r: number }>;
  alpha: number;
}

/** The dot layer is memoized so tooltip mouse-moves never re-render 715
 *  circles; positions are written straight to the DOM by the sim loop. */
const Dots = memo(function Dots({
  nodes,
  sim,
  axis,
  category,
  dotSize,
  dimOf,
  dotRefs,
  onEnter,
  onMove,
  onLeave,
  onOpen,
}: {
  nodes: ScatterNode[];
  sim: Sim;
  axis: ScatterAxis;
  category: string | null;
  dotSize: number;
  dimOf: (n: ScatterNode) => number;
  dotRefs: React.MutableRefObject<(SVGCircleElement | null)[]>;
  onEnter: (n: ScatterNode, e: React.PointerEvent) => void;
  onMove: (n: ScatterNode, e: React.PointerEvent) => void;
  onLeave: () => void;
  onOpen: (slug: string) => void;
}) {
  return (
    <g>
      {nodes.map((n, i) => (
        <circle
          key={n.slug}
          ref={(el) => {
            dotRefs.current[i] = el;
          }}
          cx={Number(sim.x[i].toFixed(1))}
          cy={Number(sim.y[i].toFixed(1))}
          r={dotRadius(n.weight, dotSize)}
          fill={COLORS[axis][clusterOf(n, axis, category)]}
          fillOpacity={dimOf(n)}
          stroke="#ffffff"
          strokeOpacity={0.5}
          strokeWidth={0.5}
          className="cursor-pointer transition-[fill-opacity] duration-200"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onOpen(n.slug)}
          onPointerEnter={(e) => onEnter(n, e)}
          onPointerMove={(e) => onMove(n, e)}
          onPointerLeave={onLeave}
        />
      ))}
    </g>
  );
});

export function ScatterMap({
  data,
  copy,
  labels,
}: {
  data: ScatterData;
  copy: ScatterCopy;
  labels: ScatterLabels;
}) {
  const router = useRouter();
  const [axis, setAxis] = useState<ScatterAxis>("cap");
  const [gravity, setGravity] = useState(0.6);
  const [spread, setSpread] = useState(1);
  const [dotSize, setDotSize] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [showHalo, setShowHalo] = useState(false);
  const [query, setQuery] = useState("");
  const [isolated, setIsolated] = useState<string | null>(null);
  const [seed, setSeed] = useState(7);
  const [view, setView] = useState({ k: 1, x: 0, y: 0 });
  const [tip, setTip] = useState<{ node: ScatterNode; px: number; py: number } | null>(null);
  const [cool, setCool] = useState(false);
  const [panning, setPanning] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const haloRefs = useRef<(SVGCircleElement | null)[]>([]);
  const labelRefs = useRef<(SVGTextElement | null)[]>([]);
  const simRef = useRef<Sim | null>(null);
  const rafRef = useRef(0);
  const tickRef = useRef<() => void>(() => {});
  // Live slider values read by the sim without rebuilding the layout.
  const paramsRef = useRef({ gravity, dotSize });
  paramsRef.current = { gravity, dotSize };

  const ids = useMemo(() => clusterIds(axis), [axis]);
  const eligibleNodes = useMemo(() => selectScatterNodes(data.nodes, axis), [data.nodes, axis]);
  const visibleNodes = useMemo(
    () => selectScatterNodes(eligibleNodes, axis, isolated),
    [eligibleNodes, axis, isolated]
  );
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const n of eligibleNodes) {
      const categories = axis === "math" ? n.math : [clusterOf(n, axis)];
      for (const c of categories) m.set(c, (m.get(c) ?? 0) + 1);
    }
    return m;
  }, [eligibleNodes, axis]);
  const availableIds = useMemo(() => ids.filter((id) => (counts.get(id) ?? 0) > 0), [ids, counts]);
  const presentIds = useMemo(
    () => availableIds.filter((id) => !isolated || id === isolated),
    [availableIds, isolated]
  );

  // Tracked relations are not drawn, but same-cluster pairs still act as weak
  // springs so a cluster's dots settle as a loose cloud rather than a ring.
  // Only the node indices are needed for that; `kind` is dropped.
  const springPairs = useMemo(() => {
    const bySlug = new Map(visibleNodes.map((n, i) => [n.slug, i]));
    return data.links
      .map((l) => [bySlug.get(l.a), bySlug.get(l.b)] as const)
      .filter((p): p is readonly [number, number] => p[0] !== undefined && p[1] !== undefined);
  }, [data.links, visibleNodes]);

  // Deterministic initial layout: cluster anchors on a seeded ring, dots
  // jittered inside their cluster. Rebuilt only when the clustering changes.
  const sim = useMemo<Sim>(() => {
    const rand = mulberry32(seed * 7919 + axis.length * 131);
    const anchors = new Map<string, { x: number; y: number; r: number }>();
    presentIds.forEach((id, i) => {
      const angle = (i / presentIds.length) * Math.PI * 2 + rand() * 0.7;
      const dist = presentIds.length === 1
        ? 0
        : Math.min(205, 130 + presentIds.length * 13) + rand() * 15;
      const count = counts.get(id) ?? 1;
      anchors.set(id, {
        x: W / 2 + Math.cos(angle) * dist * 1.12,
        y: H / 2 + Math.sin(angle) * dist * 0.82,
        r: (36 + Math.sqrt(count) * 5.3) * spread,
      });
    });
    const n = visibleNodes.length;
    const s: Sim = {
      x: new Float64Array(n),
      y: new Float64Array(n),
      vx: new Float64Array(n),
      vy: new Float64Array(n),
      ox: new Float64Array(n),
      oy: new Float64Array(n),
      cluster: visibleNodes.map((node) => clusterOf(node, axis, isolated)),
      anchors,
      alpha: 1,
    };
    for (let i = 0; i < n; i++) {
      const a = anchors.get(s.cluster[i])!;
      const t = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * a.r * 0.56;
      s.ox[i] = Math.cos(t) * d;
      s.oy[i] = Math.sin(t) * d * 0.86;
      s.x[i] = a.x + s.ox[i] + (rand() - 0.5) * 10;
      s.y[i] = a.y + s.oy[i] + (rand() - 0.5) * 10;
    }
    return s;
  }, [axis, seed, spread, visibleNodes, presentIds, counts, isolated]);

  useEffect(() => {
    simRef.current = sim;
    setCool(false);
    const n = visibleNodes.length;

    const tick = () => {
      const s = simRef.current;
      if (!s) return;
      const { gravity: grav, dotSize: size } = paramsRef.current;
      const { x, y, vx, vy, ox, oy, cluster, anchors } = s;
      const g = grav * 0.045 * s.alpha;
      for (let i = 0; i < n; i++) {
        const a = anchors.get(cluster[i])!;
        vx[i] += (a.x + ox[i] - x[i]) * g;
        vy[i] += (a.y + oy[i] - y[i]) * g;
      }
      // Weak springs, but only inside a cluster: cross-cluster relation lines
      // are drawn yet exert no pull, so hubs stay with their own cluster.
      for (const [a, b] of springPairs) {
        if (cluster[a] !== cluster[b]) continue;
        const dx = x[b] - x[a];
        const dy = y[b] - y[a];
        const dist = Math.hypot(dx, dy) || 1;
        const f = ((dist - 60) / dist) * 0.0015 * s.alpha;
        vx[a] += dx * f;
        vy[a] += dy * f;
        vx[b] -= dx * f;
        vy[b] -= dy * f;
      }
      // Grid-hash collision so dots never pile into one blob.
      const cell = 14 * size;
      const grid = new Map<string, number[]>();
      for (let i = 0; i < n; i++) {
        const key = `${Math.floor(x[i] / cell)},${Math.floor(y[i] / cell)}`;
        const bucket = grid.get(key);
        if (bucket) bucket.push(i);
        else grid.set(key, [i]);
      }
      for (let i = 0; i < n; i++) {
        const cx = Math.floor(x[i] / cell);
        const cy = Math.floor(y[i] / cell);
        const ri = dotRadius(visibleNodes[i].weight, size);
        for (let gx = cx - 1; gx <= cx + 1; gx++) {
          for (let gy = cy - 1; gy <= cy + 1; gy++) {
            const bucket = grid.get(`${gx},${gy}`);
            if (!bucket) continue;
            for (const j of bucket) {
              if (j <= i) continue;
              const rj = dotRadius(visibleNodes[j].weight, size);
              const min = ri + rj + 1.2;
              let dx = x[j] - x[i];
              let dy = y[j] - y[i];
              let d = Math.hypot(dx, dy);
              if (d >= min) continue;
              if (d < 0.01) {
                dx = 0.5;
                dy = 0;
                d = 0.5;
              }
              const push = ((min - d) / d) * 0.22;
              vx[i] -= dx * push;
              vy[i] -= dy * push;
              vx[j] += dx * push;
              vy[j] += dy * push;
            }
          }
        }
      }
      for (let i = 0; i < n; i++) {
        vx[i] *= 0.6;
        vy[i] *= 0.6;
        x[i] = Math.min(W - 16, Math.max(16, x[i] + vx[i]));
        y[i] = Math.min(H - 16, Math.max(16, y[i] + vy[i]));
      }
      s.alpha *= 0.982;

      // Write straight to the DOM: no React re-render per frame.
      for (let i = 0; i < n; i++) {
        const el = dotRefs.current[i];
        if (el) {
          el.setAttribute("cx", x[i].toFixed(1));
          el.setAttribute("cy", y[i].toFixed(1));
        }
      }
      // Halos + labels follow each cluster's live centroid.
      presentIds.forEach((id, ci) => {
        let sx = 0;
        let sy = 0;
        let c = 0;
        for (let i = 0; i < n; i++) {
          if (cluster[i] !== id) continue;
          sx += x[i];
          sy += y[i];
          c++;
        }
        if (!c) return;
        const mx = sx / c;
        const my = sy / c;
        const halo = haloRefs.current[ci];
        if (halo) {
          halo.setAttribute("cx", mx.toFixed(1));
          halo.setAttribute("cy", my.toFixed(1));
          halo.setAttribute("r", (anchors.get(id)!.r * 0.95).toFixed(1));
        }
        const label = labelRefs.current[ci];
        if (label) {
          const ox = mx - W / 2;
          const oy = my - H / 2;
          const len = Math.hypot(ox, oy) || 1;
          label.setAttribute("x", (mx + (ox / len) * (anchors.get(id)!.r * 1.02)).toFixed(1));
          label.setAttribute("y", (my + (oy / len) * (anchors.get(id)!.r * 1.02)).toFixed(1));
        }
      });

      if (s.alpha > 0.02) rafRef.current = requestAnimationFrame(tick);
      else setCool(true);
    };
    tickRef.current = tick;
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [sim, visibleNodes, springPairs, presentIds]);

  const reheat = useCallback(() => {
    const s = simRef.current;
    if (!s) return;
    s.alpha = Math.max(s.alpha, 0.5);
    setCool(false);
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tickRef.current);
  }, []);

  // Wheel zoom needs a non-passive native listener (React's is passive).
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * W;
      const my = ((e.clientY - rect.top) / rect.height) * H;
      setView((v) => {
        const k = Math.min(4, Math.max(0.4, v.k * Math.exp(-e.deltaY * 0.0012)));
        return { k, x: mx - ((mx - v.x) * k) / v.k, y: my - ((my - v.y) * k) / v.k };
      });
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  const panRef = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    panRef.current = { px: e.clientX, py: e.clientY, x: view.x, y: view.y };
    setPanning(true);
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  }, [view]);
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!panRef.current) return;
    const rect = svgRef.current!.getBoundingClientRect();
    const sx = W / rect.width;
    const sy = H / rect.height;
    const start = panRef.current;
    setView((v) => ({
      ...v,
      x: start.x + (e.clientX - start.px) * sx,
      y: start.y + (e.clientY - start.py) * sy,
    }));
  }, []);
  const onPointerUp = useCallback(() => {
    panRef.current = null;
    setPanning(false);
  }, []);

  const q = query.trim().toLowerCase();
  const matches = useMemo(
    () => (q ? visibleNodes.filter((n) => n.title.toLowerCase().includes(q)).length : visibleNodes.length),
    [q, visibleNodes]
  );
  const dimOf = useCallback(
    (n: ScatterNode) => {
      if (q) return n.title.toLowerCase().includes(q) ? 0.92 : 0.12;
      return 0.92;
    },
    [q]
  );

  const tipAt = useCallback((n: ScatterNode, e: React.PointerEvent) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    setTip({ node: n, px: e.clientX - rect.left, py: e.clientY - rect.top });
  }, []);
  const tipOff = useCallback(() => setTip(null), []);
  const openEvent = useCallback((slug: string) => router.push(`/research/${slug}`), [router]);

  const download = useCallback((blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }, []);
  const serialized = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return null;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(W));
    clone.setAttribute("height", String(H));
    clone.setAttribute("font-family", "'Noto Sans SC', system-ui, sans-serif");
    clone.removeAttribute("class");
    clone.style.background = "#ffffff";
    return new XMLSerializer().serializeToString(clone);
  }, []);
  const exportSvg = useCallback(() => {
    const text = serialized();
    if (text) download(new Blob([text], { type: "image/svg+xml" }), "research-graph.svg");
  }, [serialized, download]);
  const exportPng = useCallback(() => {
    const text = serialized();
    if (!text) return;
    const url = URL.createObjectURL(new Blob([text], { type: "image/svg+xml" }));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => b && download(b, "research-graph.png"), "image/png");
    };
    img.src = url;
  }, [serialized, download]);

  const reset = useCallback(() => {
    setAxis("cap");
    setGravity(0.6);
    setSpread(1);
    setDotSize(1);
    setShowLabels(true);
    setShowHalo(false);
    setQuery("");
    setIsolated(null);
    setView({ k: 1, x: 0, y: 0 });
    setSeed(7);
  }, []);

  const toggle = (on: boolean, set: (v: boolean) => void, label: string) => (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => {
        set(!on);
        reheat();
      }}
      className={`chip ${on ? "chip-active" : ""}`}
    >
      {label}
    </button>
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_16rem]">
      <div ref={wrapRef} className="relative min-w-0 overflow-hidden rounded-md border border-ink-200 bg-white">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full touch-none select-none"
          style={{ cursor: panning ? "grabbing" : "grab" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          role="img"
          aria-label={copy.hint}
        >
          <defs>
            <pattern id="scatter-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#eef0f4" strokeWidth="1" />
            </pattern>
            {presentIds.map((id, ci) => (
              <radialGradient key={id} id={`halo-${ci}`}>
                <stop offset="0%" stopColor={COLORS[axis][id]} stopOpacity={0.16} />
                <stop offset="70%" stopColor={COLORS[axis][id]} stopOpacity={0.07} />
                <stop offset="100%" stopColor={COLORS[axis][id]} stopOpacity={0} />
              </radialGradient>
            ))}
          </defs>
          <rect width={W} height={H} fill="url(#scatter-grid)" />
          <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
            {showHalo &&
              presentIds.map((id, ci) => (
                <circle
                  key={id}
                  ref={(el) => {
                    haloRefs.current[ci] = el;
                  }}
                  fill={`url(#halo-${ci})`}
                  cx={W / 2}
                  cy={H / 2}
                  r={120}
                  style={{ pointerEvents: "none" }}
                />
              ))}
            <Dots
              nodes={visibleNodes}
              sim={sim}
              axis={axis}
              category={isolated}
              dotSize={dotSize}
              dimOf={dimOf}
              dotRefs={dotRefs}
              onEnter={tipAt}
              onMove={tipAt}
              onLeave={tipOff}
              onOpen={openEvent}
            />
            {showLabels &&
              presentIds.map((id, ci) => (
                <text
                  key={id}
                  ref={(el) => {
                    labelRefs.current[ci] = el;
                  }}
                  x={W / 2}
                  y={H / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={15}
                  fontWeight={600}
                  fill="#2c3341"
                  stroke="#ffffff"
                  strokeWidth={4}
                  paintOrder="stroke"
                  style={{ pointerEvents: "none" }}
                >
                  {labelOf(id, axis, labels)}
                </text>
              ))}
          </g>
        </svg>

        {tip && (
          <div
            className="pointer-events-none absolute z-20 w-[15rem] rounded-md border border-ink-200 bg-white/95 px-3 py-2 shadow-lg"
            style={{
              left: Math.max(
                6,
                Math.min(tip.px + 12, (wrapRef.current?.clientWidth ?? 400) - 252)
              ),
              top: Math.max(6, tip.py + 12),
            }}
          >
            <div className="flex items-start gap-2">
              <span
                className="mt-1 h-2 w-2 shrink-0 rounded-full"
                style={{ background: COLORS[axis][clusterOf(tip.node, axis, isolated)] }}
                aria-hidden="true"
              />
              <span className="text-[12px] font-medium leading-normal text-ink-900">
                {tip.node.title}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1 font-mono text-[10px] text-ink-500">
              <span>{tip.node.date}</span>
              <span aria-hidden="true">·</span>
              <span>{labels.type[tip.node.type] ?? tip.node.type}</span>
              {tip.node.direction !== "none" && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{labels.direction[tip.node.direction] ?? tip.node.direction}</span>
                </>
              )}
            </div>
            <div className="mt-1 font-mono text-[11px] text-ink-600">
              {labelOf(clusterOf(tip.node, axis, isolated), axis, labels)} · {tip.node.weight} {copy.progress}
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute bottom-2 left-3 font-mono text-[11px] tracking-[0.08em] text-ink-500">
          {copy.hint}
        </div>
        <div className="absolute right-2 top-2 flex flex-col gap-1">
          <button type="button" aria-label={copy.zoomIn} className="btn-ghost !px-2 !py-1 text-xs" onClick={() => setView((v) => ({ ...v, k: Math.min(4, v.k * 1.25) }))}>+</button>
          <button type="button" aria-label={copy.zoomOut} className="btn-ghost !px-2 !py-1 text-xs" onClick={() => setView((v) => ({ ...v, k: Math.max(0.4, v.k / 1.25) }))}>−</button>
          <button type="button" aria-label={copy.fit} className="btn-ghost !px-2 !py-1 text-xs" onClick={() => setView({ k: 1, x: 0, y: 0 })}>⤢</button>
        </div>
      </div>

      {/* Put interpretation controls first; geometry tuning stays optional. */}
      <aside className="flex flex-col gap-5 rounded-md border border-ink-200 bg-ink-50 p-4">
        <label className="block">
          <span className="mono-label mb-1 block">{copy.colorBy}</span>
          <select
            className="select-control w-full bg-white"
            value={axis}
            onChange={(e) => {
              setAxis(e.target.value as ScatterAxis);
              setIsolated(null);
              setTip(null);
              setView({ k: 1, x: 0, y: 0 });
            }}
          >
            <option value="cap">{copy.axisCap}</option>
            <option value="math">{copy.axisMath}</option>
            <option value="direction">{copy.axisDirection}</option>
            <option value="type">{copy.axisType}</option>
          </select>
        </label>

        <div>
          <div className="mono-label mb-2">{copy.findGroup}</div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.search}
            aria-label={copy.search}
            className="w-full rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-xs text-ink-700 focus:border-accent-500 focus:outline-none"
          />
          <p className="mt-1 font-mono text-[10px] text-ink-500" role="status" aria-live="polite">
            {!q ? "" : matches === 0 ? copy.searchNone : copy.searchMatches.replace("{n}", String(matches))}
          </p>
        </div>

        <div>
          <div className="mono-label mb-1.5">{copy.legend}</div>
          <div className="viz-scroll flex max-h-64 flex-col gap-1 overflow-y-auto pr-1">
            <button type="button" className={`chip justify-start ${isolated === null ? "chip-active" : ""}`} onClick={() => { setIsolated(null); setTip(null); setView({ k: 1, x: 0, y: 0 }); }}>
              {copy.all} · {eligibleNodes.length}
            </button>
            {availableIds.map((id) => (
              <button
                key={id}
                type="button"
                title={labelOf(id, axis, labels)}
                className={`chip justify-start ${isolated === id ? "chip-active" : ""}`}
                onClick={() => { setIsolated(isolated === id ? null : id); setTip(null); setView({ k: 1, x: 0, y: 0 }); }}
              >
                <span className="mr-1.5 inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: COLORS[axis][id] }} />
                <span className="truncate">{labelOf(id, axis, labels)}</span>
                <span className="ml-auto pl-1 font-mono text-[11px] text-ink-500">{counts.get(id)}</span>
              </button>
            ))}
          </div>
        </div>

        <details className="disclosure border-t border-ink-200 pt-3">
          <summary className="flex cursor-pointer items-center justify-between text-[12px] font-medium text-ink-700 hover:text-accent-700">
            {copy.advanced}<span className="disclosure-sign font-mono text-sm" aria-hidden="true" />
          </summary>
          <div className="mt-4 space-y-5">
            <div>
              <div className="mono-label mb-2">{copy.layoutGroup}</div>
              <div className="flex flex-col gap-2.5">
                {(
                  [
                    [copy.gravity, gravity, setGravity, 0.1, 1.5, 0.05],
                    [copy.spread, spread, setSpread, 0.5, 2, 0.05],
                    [copy.dotSize, dotSize, setDotSize, 0.5, 2.2, 0.05],
                  ] as const
                ).map(([label, value, set, min, max, step]) => (
                  <label key={label} className="block">
                    <span className="mono-label mb-1 flex justify-between"><span>{label}</span><span>{value.toFixed(2)}</span></span>
                    <input
                      type="range"
                      className="viz-range w-full"
                      min={min}
                      max={max}
                      step={step}
                      value={value}
                      onChange={(e) => { set(Number(e.target.value)); reheat(); }}
                    />
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div className="mono-label mb-2">{copy.displayGroup}</div>
              <div className="flex flex-wrap gap-1.5">
                {toggle(showLabels, setShowLabels, copy.labels)}
                {toggle(showHalo, setShowHalo, copy.halo)}
              </div>
            </div>
            <div>
              <div className="mono-label mb-2">{copy.actionGroup}</div>
              <div className="grid grid-cols-2 gap-1.5">
                <button type="button" className="btn-ghost !px-2 !py-1.5 text-xs" onClick={reset}>{copy.reset}</button>
                <button type="button" className="btn-ghost !px-2 !py-1.5 text-xs" onClick={() => setSeed((s) => s + 1)}>{copy.relayout}</button>
                <button type="button" className="btn-ghost !px-2 !py-1.5 text-xs" onClick={exportSvg}>{copy.exportSvg}</button>
                <button type="button" className="btn-ghost !px-2 !py-1.5 text-xs" onClick={exportPng}>{copy.exportPng}</button>
              </div>
            </div>
          </div>
        </details>
        <div className="border-t border-ink-100 pt-2 font-mono text-[11px] text-ink-500">
          {cool ? "●" : "◌"} {visibleNodes.length} {copy.statusDots}
        </div>
      </aside>
    </div>
  );
}
