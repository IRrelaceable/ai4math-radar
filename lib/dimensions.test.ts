import { describe, expect, it } from "vitest";
import { CAPABILITIES, MATH_TOPICS, FACET_VALUES, capabilityOf, mathTopicsOf } from "@/lib/dimensions";
import type { ResearchEvent } from "@/types";

function event(overrides: Partial<ResearchEvent>): ResearchEvent {
  return {
    id: "evt_x",
    slug: "x",
    title: "x",
    summary: "",
    significance: "",
    date: "2026-01-01",
    sourceType: "arxiv",
    sourceUrl: "https://arxiv.org/abs/x",
    authors: [],
    relatedWorks: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("capability facet", () => {
  it("moves math4ai geometry to foundations, not a geometry capability", () => {
    expect(capabilityOf(event({ researchArea: "Geometry", direction: "math4ai" }))).toBe("foundations-of-ai");
  });
  it("keeps ai4math geometry solving as reasoning", () => {
    expect(capabilityOf(event({ researchArea: "Geometry", direction: "ai4math" }))).toBe("reasoning-llms");
  });
  it("keeps the AI side of proving as a capability", () => {
    expect(capabilityOf(event({ researchArea: "Theorem Proving & Formal Mathematics", subArea: "Proof search" }))).toBe("neuro-symbolic-proving");
  });
  it("moves pure math logic out of the proving capability", () => {
    expect(
      capabilityOf(event({ researchArea: "Theorem Proving & Formal Mathematics", subArea: "Prover tooling & interaction", title: "Gödel's Incompleteness Theorems in Grounded Arithmetic" }))
    ).toBe("foundations-of-ai");
  });
  it("leaves ecosystem events without a capability", () => {
    expect(capabilityOf(event({ eventType: "People" }))).toBeUndefined();
  });
});

describe("math topic facet", () => {
  it("reads a named PDE from the title into the merged analysis bucket", () => {
    expect(mathTopicsOf(event({ title: "Navier-Stokes blow-up and Lean verification" }))).toContain("analysis");
  });
  it("folds number theory into algebra", () => {
    expect(mathTopicsOf(event({ title: "A Diophantine approach to prime gaps" }))).toContain("algebra");
  });
  it("recognizes specific named number-theory problems from the title", () => {
    expect(mathTopicsOf(event({ title: "A Lean proof of Fermat's Last Theorem" }))).toContain("algebra");
    expect(mathTopicsOf(event({ title: "A new bound for Riemann zeta zeros" }))).toContain("algebra");
    expect(mathTopicsOf(event({ title: "General proving tools", summary: "Fermat's Last Theorem is one possible application" }))).toEqual([]);
  });
  it("is multi-label when several branches appear", () => {
    const topics = mathTopicsOf(event({ title: "A Diophantine approach to Navier-Stokes", summary: "" }));
    expect(topics).toContain("analysis");
    expect(topics).toContain("algebra");
  });
  it("stays empty for general AI-method work", () => {
    expect(mathTopicsOf(event({ title: "Reinforcement Learning for Native-Language Math Reasoning" }))).toEqual([]);
  });
  it("gives ecosystem events no math topic even when the title names a branch", () => {
    expect(mathTopicsOf(event({ eventType: "People", title: "2026 Fields Medals", summary: "Prize in analysis and geometry" }))).toEqual([]);
  });
  it("drops geometry for AI-context loanwords", () => {
    expect(mathTopicsOf(event({ title: "Pole geometry bias in recurrent language models" }))).not.toContain("geometry");
  });
  it("keeps geometry when a real geometry signal is present", () => {
    expect(mathTopicsOf(event({ title: "The geometry of limits in ReLU function spaces", summary: "convex regions and polyhedral complexity" }))).toContain("geometry");
  });
});

describe("consolidated facet vocabularies", () => {
  it("keeps the reduced axis sizes", () => {
    expect(CAPABILITIES).toHaveLength(6);
    expect(MATH_TOPICS).toHaveLength(7);
    expect(Object.keys(FACET_VALUES)).toEqual(["cap", "math"]);
  });
});
