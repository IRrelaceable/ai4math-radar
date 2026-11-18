import { describe, expect, it } from "vitest";
import { ADDITIONAL_TASK_CASES, FOREIGN_TASK_CASES } from "./sourceTasks";

describe("published mathematical task source cases", () => {
  it("includes the timeline cases involving OpenAI or Anthropic without duplicate detailed cards", () => {
    expect(FOREIGN_TASK_CASES).toHaveLength(43);
    expect(ADDITIONAL_TASK_CASES).toHaveLength(38);
    expect(new Set(FOREIGN_TASK_CASES.map((record) => record.id)).size).toBe(43);
    expect(FOREIGN_TASK_CASES.filter((record) => record.track === "independent").map((record) => record.n)).toEqual([51, 28]);
    for (const n of [1, 2, 3, 26, 38]) {
      expect(FOREIGN_TASK_CASES.some((record) => record.n === n)).toBe(true);
      expect(ADDITIONAL_TASK_CASES.some((record) => record.n === n)).toBe(false);
    }
    for (const n of [8, 32, 42, 44, 50, 52]) {
      expect(FOREIGN_TASK_CASES.some((record) => record.n === n)).toBe(false);
    }
  });

  it("preserves the original problem, result and source for each case", () => {
    for (const record of FOREIGN_TASK_CASES) {
      expect(record.problem.trim(), record.id).not.toBe("");
      expect(record.result.zh.trim(), record.id).not.toBe("");
      expect(record.sources.length, record.id).toBeGreaterThan(0);
      expect(record.sources.every((source) => source.url.startsWith("https://")), record.id).toBe(true);
    }
  });
});
