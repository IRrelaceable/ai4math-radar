import { describe, expect, it } from "vitest";
import { classifyItem } from "./classifier";
import type { RawResearchItem } from "@/types";

const item = (title: string, abstract = "A language model proposes tactics."): RawResearchItem => ({
  id: "raw-test",
  title,
  abstract,
  url: "",
  source: "arXiv",
});

describe("classifyItem", () => {
  it("accepts the Lean proof assistant", () => {
    for (const title of [
      "LeanDojo: Retrieval-Augmented Proving",
      "Lean4 Automation for Competition Problems",
      "Persistent Proof-Space Exploration in Lean 4",
    ]) {
      expect(classifyItem(item(title)).isAI4Math).toBe(true);
    }
  });

  it("rejects papers that only contain the English word lean", () => {
    for (const title of [
      "Leaner Transformers Can Easily Learn to Cluster",
      "LEAN: Loss-Engineered Modulation of Weight Sensitivity",
      "Detecting Anomalies with Machine Leaning Ensembles",
    ]) {
      expect(classifyItem(item(title, "neural networks")).isAI4Math).toBe(false);
    }
  });

  it("accepts autoformalization papers that name the task in the title", () => {
    expect(
      classifyItem(
        item(
          "An AI-Assisted Formalization of the Poincaré Conjecture",
          "We use a language model to formalize the proof."
        )
      ).isAI4Math
    ).toBe(true);
  });
});
