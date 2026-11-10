import { describe, expect, it } from "vitest";
import {
  DIRECTION_EXAMPLES,
  DIRECTION_FIXTURES,
  DIRECTION_SYSTEM,
  isDirectionEligible,
  parseDirection,
  parseDirectionAnalysis,
} from "./direction";
import { DIRECTIONS } from "@/data/seed/directions";
import { readIngestedEvents } from "@/lib/db/ingested";

/**
 * The rubric lives in the prompt, so the only durable way to lock the
 * standard is: (1) every fixture stays in the prompt, and (2) the stored
 * classification of every fixture event matches the agreed ruling. A prompt
 * edit that changes the boundary fails here before it changes the site.
 */

describe("direction axis", () => {
  it("accepts clean JSON and bare tokens, rejects prose", () => {
    expect(parseDirection('{"direction":"ai4math"}')).toBe("ai4math");
    expect(parseDirection('```json\n{"direction":"math4ai"}\n```')).toBe("math4ai");
    expect(parseDirection("  BOTH \n")).toBe("both");
    expect(parseDirection('{"direction":"none"}')).toBeUndefined();
    expect(parseDirection("This event is ai4math because it proves theorems.")).toBeUndefined();
    expect(parseDirection('{"area":"ai4math"}')).toBeUndefined();
    expect(parseDirection("gibberish")).toBeUndefined();
  });

  it("parses the three-step analysis and clamps confidence", () => {
    const analysis = parseDirectionAnalysis(
      JSON.stringify({
        researchObject: "数学猜想",
        coreGoal: "自动发现数学规律",
        actualContribution: "提出并验证了新的猜想",
        direction: "ai4math",
        confidence: 1.7,
        reason: "摘要明确报告了新猜想。",
      })
    );
    expect(analysis?.verdict).toBe("ai4math");
    expect(analysis?.confidence).toBe(1);
    expect(analysis?.actualContribution).toContain("猜想");
    expect(parseDirectionAnalysis('{"direction":"none","confidence":0.4}')?.verdict).toBe("none");
    expect(parseDirectionAnalysis("not json")).toBeUndefined();
  });

  it("keeps every boundary fixture and migration example in the system prompt", () => {
    for (const fixture of DIRECTION_FIXTURES) {
      expect(DIRECTION_SYSTEM, `fixture dropped from rubric: ${fixture.slug}`).toContain(
        `"${fixture.title}"`
      );
    }
    for (const example of DIRECTION_EXAMPLES) {
      expect(DIRECTION_SYSTEM, `example dropped from rubric: ${example.title}`).toContain(
        `"${example.title}"`
      );
    }
    expect(DIRECTION_SYSTEM).toContain('"ai4math|math4ai|both|none"');
  });

  it("skips ecosystem events — no researchArea, no direction", () => {
    expect(isDirectionEligible({ researchArea: "Geometry" })).toBe(true);
    expect(isDirectionEligible({})).toBe(false);
  });

  it("stores every fixture event exactly as ruled", () => {
    const ingested = new Map(readIngestedEvents().map((event) => [event.slug, event]));
    for (const fixture of DIRECTION_FIXTURES) {
      const stored =
        fixture.source === "seed"
          ? DIRECTIONS[fixture.slug]
          : ingested.get(fixture.slug)?.direction;
      expect(stored, `missing direction for ${fixture.slug}`).toBe(fixture.expected);
    }
  });
});
