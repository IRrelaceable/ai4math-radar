import { describe, expect, it } from "vitest";
import { DIRECTION_FIXTURES, DIRECTION_SYSTEM, parseDirection, isDirectionEligible } from "./direction";
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
    expect(parseDirection("This event is ai4math because it proves theorems.")).toBeUndefined();
    expect(parseDirection('{"area":"ai4math"}')).toBeUndefined();
    expect(parseDirection("gibberish")).toBeUndefined();
  });

  it("keeps every boundary fixture in the system prompt", () => {
    for (const fixture of DIRECTION_FIXTURES) {
      expect(DIRECTION_SYSTEM, `fixture dropped from rubric: ${fixture.slug}`).toContain(
        `"${fixture.title}"`
      );
    }
    expect(DIRECTION_SYSTEM).toContain('"math4ai", "both"');
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
