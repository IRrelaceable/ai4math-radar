import { describe, expect, it } from "vitest";
import {
  BENCHMARK_CHALLENGES,
  BENCHMARK_ORDER,
  type BenchmarkChallenge,
  type ModelAttempt,
} from "./challenges";
import { LAB_ARCHIVE } from "@/data/lab-archive/records";

const hasChinese = (text: string) => /[\u4e00-\u9fff]/.test(text);

describe("model-benchmark challenges", () => {
  it("has stable unique ids and reproduces real, public tasks", () => {
    expect(BENCHMARK_CHALLENGES.length).toBeGreaterThanOrEqual(4);
    const ids = BENCHMARK_CHALLENGES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("ch-gsm8k");
    expect(ids).toContain("ch-minif2f");
    expect(ids).toContain("ch-metamath");
    expect(ids).toContain("ch-flt-formalization");
  });

  it("every task carries a frontier source case with a primary https link", () => {
    for (const c of BENCHMARK_CHALLENGES) {
      expect(c.title.zh, c.id).toBeTruthy();
      expect(c.title.en, c.id).toBeTruthy();
      expect(hasChinese(c.title.en), `${c.id}.title.en`).toBe(false);
      expect(c.task.zh, c.id).toBeTruthy();
      expect(c.task.en, c.id).toBeTruthy();
      expect(hasChinese(c.task.en), `${c.id}.task.en`).toBe(false);
      expect(["openai", "anthropic"], c.id).toContain(c.sourceCase.lab);
      expect(c.sourceCase.date, c.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(c.sourceCase.url, c.id).toMatch(/^https:\/\//);
      expect(() => new URL(c.sourceCase.url)).not.toThrow();
      expect(c.metric.zh && c.metric.en, c.id).toBeTruthy();
      expect(["benchmark", "problem"], c.id).toContain(c.unit);
    }
    expect(new Set(BENCHMARK_CHALLENGES.map((c) => c.sourceCase.lab))).toEqual(
      new Set(["openai", "anthropic"])
    );
  });

  it("traces each selected task to the supplied timeline source record", () => {
    for (const challenge of BENCHMARK_CHALLENGES) {
      const record = LAB_ARCHIVE.find((r) => r.id === challenge.sourceCase.archiveId);
      expect(record, `${challenge.id} archive record`).toBeDefined();
      expect(record?.track, `${challenge.id} lab`).toBe(challenge.sourceCase.lab);
      expect(record?.sources.map((s) => s.url), `${challenge.id} source`).toContain(
        challenge.sourceCase.url
      );
    }
  });

  it("publishes only measured or sourced results in the first stage", () => {
    for (const c of BENCHMARK_CHALLENGES) {
      const domestic = c.attempts.filter((a) => a.origin === "domestic");
      expect(domestic, c.id).toEqual([]);
      expect(c.attempts.every((a) => a.status === "reported"), c.id).toBe(true);
    }
  });

  it("every reported frontier attempt cites its own primary source", () => {
    for (const c of BENCHMARK_CHALLENGES) {
      const frontier = c.attempts.filter((a) => a.status === "reported");
      expect(frontier.length, `${c.id} needs a reported frontier result`).toBeGreaterThan(0);
      for (const a of frontier) {
        expect(a.origin, `${c.id}.${a.id}`).toBe("frontier");
        expect(a.sourceUrl, `${c.id}.${a.id}`).toMatch(/^https:\/\//);
        expect(a.result.zh, `${c.id}.${a.id}`).toBeTruthy();
        expect(a.result.en, `${c.id}.${a.id}`).toBeTruthy();
        expect(hasChinese(a.result.en), `${c.id}.${a.id}.result.en`).toBe(false);
        for (const r of a.resources) {
          expect(r.label.zh && r.label.en, `${c.id}.${a.id}`).toBeTruthy();
          expect(r.value.zh && r.value.en, `${c.id}.${a.id}`).toBeTruthy();
        }
      }
    }
  });

  it("orders the board by newest source case first", () => {
    const dates = BENCHMARK_ORDER.map((c) => c.sourceCase.date);
    expect([...dates].sort().reverse()).toEqual(dates);
    expect(BENCHMARK_ORDER.map((c) => c.id)).toEqual(
      [...BENCHMARK_CHALLENGES]
        .sort((a: BenchmarkChallenge, b: BenchmarkChallenge) =>
          b.sourceCase.date.localeCompare(a.sourceCase.date)
        )
        .map((c) => c.id)
    );
  });
});
