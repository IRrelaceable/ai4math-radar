import type { ScatterNode } from "@/lib/graph";
import { CAPABILITIES, MATH_TOPICS } from "@/lib/dimensions";
import { EVENT_TYPES } from "@/types";

export type ScatterAxis = "cap" | "math" | "direction" | "type";

export function clusterOf(node: ScatterNode, axis: ScatterAxis, category: string | null = null): string {
  switch (axis) {
    case "cap": return node.cap ?? "eco";
    case "math": return category && node.math.includes(category)
      ? category
      : node.math.find((id) => clusterIds("math").includes(id)) ?? "noneMath";
    case "direction": return node.direction;
    case "type": return node.type;
  }
}

export function clusterIds(axis: ScatterAxis): string[] {
  switch (axis) {
    case "cap": return CAPABILITIES.map((value) => value.id);
    case "math": return MATH_TOPICS.map((value) => value.id);
    case "direction": return ["ai4math", "math4ai", "both"];
    case "type": return [...EVENT_TYPES];
  }
}

/** Only records belonging to the chosen axis (and optional category) enter the layout. */
export function selectScatterNodes(
  nodes: readonly ScatterNode[],
  axis: ScatterAxis,
  category: string | null = null
): ScatterNode[] {
  const allowed = new Set(clusterIds(axis));
  return nodes.filter((node) => {
    if (axis === "math") {
      return node.math.some((id) => allowed.has(id)) && (!category || node.math.includes(category));
    }
    const cluster = clusterOf(node, axis);
    return allowed.has(cluster) && (!category || cluster === category);
  });
}
