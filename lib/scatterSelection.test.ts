import { describe, expect, it } from "vitest";
import type { ScatterNode } from "@/lib/graph";
import { clusterOf, selectScatterNodes } from "@/lib/scatterSelection";

function node(slug: string, overrides: Partial<ScatterNode> = {}): ScatterNode {
  return {
    slug,
    title: slug,
    date: "2026-01-01",
    math: [],
    direction: "none",
    type: "Research",
    weight: 1,
    ...overrides,
  };
}

const nodes = [
  node("algebra", { cap: "reasoning-llms", math: ["algebra"], direction: "ai4math" }),
  node("mixed", { cap: "agents", math: ["algebra", "geometry"], direction: "both" }),
  node("general", { cap: "agents", direction: "math4ai" }),
  node("ecosystem", { type: "People" }),
];

describe("scatter category selection", () => {
  it("omits records without a research theme from the theme view", () => {
    expect(selectScatterNodes(nodes, "cap").map((n) => n.slug)).toEqual(["algebra", "mixed", "general"]);
    expect(selectScatterNodes(nodes, "cap", "agents").map((n) => n.slug)).toEqual(["mixed", "general"]);
  });

  it("includes only labelled math events and respects every label on a multi-domain event", () => {
    expect(selectScatterNodes(nodes, "math").map((n) => n.slug)).toEqual(["algebra", "mixed"]);
    expect(selectScatterNodes(nodes, "math", "geometry").map((n) => n.slug)).toEqual(["mixed"]);
    expect(clusterOf(nodes[1], "math", "geometry")).toBe("geometry");
  });

  it("omits unclassified directions but keeps all valid event types", () => {
    expect(selectScatterNodes(nodes, "direction").map((n) => n.slug)).toEqual(["algebra", "mixed", "general"]);
    expect(selectScatterNodes(nodes, "type").map((n) => n.slug)).toEqual(["algebra", "mixed", "general", "ecosystem"]);
    expect(selectScatterNodes(nodes, "type", "People").map((n) => n.slug)).toEqual(["ecosystem"]);
  });
});
