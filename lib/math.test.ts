import { describe, expect, it } from "vitest";
import { renderMath } from "./math";

// Segments below are real strings lifted from the dataset (English ingested
// sources and their zh translations) so the mapping is pinned to actual data.
describe("renderMath", () => {
  it("leaves plain prose (no $) untouched", () => {
    const s = "Lean 4 是一个定理证明器，支持 tactics。";
    expect(renderMath(s)).toBe(s);
    expect(renderMath("no math here at all")).toBe("no math here at all");
  });

  it("converts the real math segments from the dataset", () => {
    expect(renderMath("for every open $ U \\subseteq \\mathbb R^n $")).toBe(
      "for every open U ⊆ ℝⁿ"
    );
    expect(renderMath("gradient of $C^1$ potentials")).toBe("gradient of C¹ potentials");
    expect(renderMath("trajectory $\\theta(t)$ ($t \\geq 0$)")).toBe(
      "trajectory θ(t) (t ≥ 0)"
    );
    expect(renderMath("$F \\colon U \\to \\mathbb R$")).toBe("F : U → ℝ");
    expect(renderMath("cost $\\varepsilon^{-2}$")).toBe("cost ε⁻²");
    expect(renderMath("complexity $O\\big(P(\\log t)^{L-1}/t\\big)$")).toBe(
      "complexity O(P(log t)^(L-1)/t)"
    );
    expect(renderMath("$K \\in \\{1,3,5,8\\}$")).toBe("K ∈ {1,3,5,8}");
    expect(renderMath("$\\mathrm{BB}(6)$")).toBe("BB(6)");
    expect(renderMath("$2\\times2$")).toBe("2×2");
    expect(renderMath("$84\\text{--}96\\%$")).toBe("84–96%");
    expect(renderMath("$1{,}990$")).toBe("1,990");
    expect(renderMath("$-\\infty$")).toBe("-∞");
    expect(renderMath("$\\varepsilon$")).toBe("ε");
    expect(renderMath("$H^\\ast(f)$")).toBe("H∗(f)");
    expect(renderMath("$t^{-α}$")).toBe("t⁻ᵅ");
  });

  it("keeps already-unicode math (zh data) intact", () => {
    expect(renderMath("对 $θ(t)$ 的球面投影")).toBe("对 θ(t) 的球面投影");
    expect(renderMath("$α\\approx0.55$")).toBe("α≈0.55");
  });

  it("preserves literal money, never mangling it into math", () => {
    const money =
      "mini-Lean-agent solves 12/12 problems at an average cost of \\$2 per problem";
    expect(renderMath(money)).toBe(
      "mini-Lean-agent solves 12/12 problems at an average cost of $2 per problem"
    );
  });

  it("renders display math $$…$$ too", () => {
    expect(renderMath("so $$x \\to \\infty$$ hence")).toBe("so x → ∞ hence");
  });

  it("is idempotent for already-clean segments", () => {
    const once = renderMath("bound $\\varepsilon^{-2}$ here");
    expect(renderMath(once)).toBe(once);
  });
});
