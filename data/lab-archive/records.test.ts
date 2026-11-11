import { describe, expect, it } from "vitest";
import { fill, pagesDict } from "@/lib/i18n/dict.pages";
import {
  LAB_ARCHIVE,
  LAB_BASELINES,
  LAB_TRACKS,
  archiveByYear,
  archiveYears,
  type LabArchiveRecord,
} from "./records";

const hasChinese = (text: string) => /[\u4e00-\u9fff]/.test(text);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Nested string leaves, so a missing or untranslated label cannot hide. */
function leaves(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") return [prefix];
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => leaves(child, `${prefix}${prefix ? "." : ""}${key}`));
  }
  return [];
}

describe("frontier-lab archive", () => {
  it("contains all 52 records with stable, sequential ids", () => {
    expect(LAB_ARCHIVE).toHaveLength(52);
    LAB_ARCHIVE.forEach((record, index) => {
      expect(record.id).toBe(`lab-${String(index + 1).padStart(2, "0")}`);
      expect(record.n).toBe(index + 1);
    });
    expect(new Set(LAB_ARCHIVE.map((r) => r.id)).size).toBe(52);
  });

  it("uses sortable ISO dates within the documented 2020–2026 range", () => {
    for (const record of LAB_ARCHIVE) {
      expect(record.date).toMatch(ISO_DATE);
      expect(Number.isNaN(Date.parse(record.date))).toBe(false);
      expect(record.date.slice(0, 4)).toMatch(/^202[0-6]$/);
      expect(record.dateLabel.length).toBeGreaterThan(0);
    }
    expect(archiveYears()).toEqual(["2026", "2025", "2024", "2023", "2022", "2021", "2020"]);
    expect(archiveByYear().flatMap((g) => g.records)).toHaveLength(52);
    // Newest first inside every year, original sequence as a tie-breaker.
    for (const group of archiveByYear()) {
      for (let i = 1; i < group.records.length; i++) {
        expect(group.records[i - 1].date >= group.records[i].date).toBe(true);
      }
    }
  });

  it("keeps every verbatim Chinese field and both translated headline fields", () => {
    // Narrative fields are verbatim Chinese; model/people are proper nouns
    // (researcher names, model ids) and may contain no Chinese at all.
    const narrative: (keyof LabArchiveRecord)[] = [
      "problem",
      "division",
      "verification",
      "scope",
    ];
    const properNouns: (keyof LabArchiveRecord)[] = ["model", "people"];
    for (const record of LAB_ARCHIVE) {
      for (const key of narrative) {
        expect(record[key], `${record.id}.${key}`).toBeTruthy();
        expect(hasChinese(String(record[key])), `${record.id}.${key}`).toBe(true);
      }
      for (const key of properNouns) {
        expect(record[key], `${record.id}.${key}`).toBeTruthy();
      }
      expect(record.title.zh).toBeTruthy();
      expect(record.title.en).toBeTruthy();
      expect(hasChinese(record.title.en), `${record.id}.title.en`).toBe(false);
      expect(record.result.zh).toBeTruthy();
      expect(record.result.en).toBeTruthy();
      expect(hasChinese(record.result.en), `${record.id}.result.en`).toBe(false);
      expect(record.attribution.en).toBeTruthy();
      expect(record.nature.en).toBeTruthy();
      expect(record.dateNoteEn).toBeTruthy();
      expect(hasChinese(record.dateNoteEn), `${record.id}.dateNoteEn`).toBe(false);
    }
  });

  it("translates attribution, nature and source labels into English", () => {
    for (const record of LAB_ARCHIVE) {
      expect(hasChinese(record.attribution.en), `${record.id}.attribution.en`).toBe(false);
      expect(hasChinese(record.nature.en), `${record.id}.nature.en`).toBe(false);
      for (const source of record.sources) {
        expect(hasChinese(source.label.en), `${record.id}: ${source.label.zh}`).toBe(false);
      }
    }
  });

  it("preserves one or more verifiable https source links per record", () => {
    expect(LAB_ARCHIVE.reduce((n, r) => n + r.sources.length, 0)).toBe(116);
    for (const record of LAB_ARCHIVE) {
      expect(record.sources.length, record.id).toBeGreaterThan(0);
      for (const source of record.sources) {
        expect(source.url, record.id).toMatch(/^https:\/\//);
        expect(() => new URL(source.url)).not.toThrow();
        expect(source.label.zh).toBeTruthy();
        expect(source.label.en).toBeTruthy();
      }
    }
  });

  it("keeps the ten-item expansion of entry 32 and the batch-3 detail", () => {
    const extras = new Map(LAB_ARCHIVE.filter((r) => r.extras.length).map((r) => [r.id, r.extras]));
    expect([...extras.keys()]).toEqual(["lab-32", "lab-51"]);
    expect(extras.get("lab-32")).toHaveLength(10);
    expect(extras.get("lab-51")).toHaveLength(1);
  });

  it("assigns every record to a known track", () => {
    const counts: Record<string, number> = {};
    for (const record of LAB_ARCHIVE) {
      expect(LAB_TRACKS, record.id).toContain(record.track);
      counts[record.track] = (counts[record.track] ?? 0) + 1;
    }
    expect(counts.joint).toBe(1);
    expect(counts.independent).toBe(5);
    // Joint work and independent reviews must not collapse into one bucket.
    expect(counts.joint).toBeLessThan(counts.openai);
  });

  it("marks the four 722-collection samples without counting them as extra results", () => {
    const samples = LAB_ARCHIVE.filter((r) => r.sample);
    expect(samples.map((r) => r.id)).toEqual(["lab-45", "lab-46", "lab-47", "lab-48"]);
    for (const record of samples) {
      expect(record.dateLabel).toContain("同批次样例");
      expect(record.scope).toContain("722");
      expect(record.track).toBe("openai");
    }
    // Every other record is a standalone entry.
    expect(LAB_ARCHIVE.filter((r) => !r.sample)).toHaveLength(48);
  });

  it("keeps the two background baselines separate from the 52 records", () => {
    expect(LAB_BASELINES).toHaveLength(2);
    for (const baseline of LAB_BASELINES) {
      expect(baseline.date).toMatch(ISO_DATE);
      expect(hasChinese(baseline.zh)).toBe(true);
      expect(hasChinese(baseline.en)).toBe(false);
    }
  });
});

/**
 * The English export is built separately, so verify its archive chrome here
 * instead of relying on a second full static build. Every zh label must have
 * an English counterpart and no English label may leak untranslated Chinese.
 */
describe("archive page copy", () => {
  it("mirrors every zh archive label in en", () => {
    const zh = leaves(pagesDict.zh.labs.archive).sort();
    const en = leaves(pagesDict.en.labs.archive).sort();
    expect(en).toEqual(zh);
    expect(zh.length).toBeGreaterThan(20);
    const zhAutomated = leaves(pagesDict.zh.labs.automated).sort();
    expect(leaves(pagesDict.en.labs.automated).sort()).toEqual(zhAutomated);
  });

  it("translates every English archive label", () => {
    const enArchive = pagesDict.en.labs.archive;
    const strings = leaves(enArchive).map((path) =>
      path.split(".").reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], enArchive)
    );
    for (const value of strings) {
      expect(typeof value).toBe("string");
      expect(hasChinese(value as string)).toBe(false);
    }
    expect(hasChinese(pagesDict.en.labs.automated.title)).toBe(false);
    expect(hasChinese(pagesDict.en.labs.automated.hint)).toBe(false);
  });

  it("updates the labs page subtitle and metadata in both languages", () => {
    for (const lang of ["zh", "en"] as const) {
      const p = pagesDict[lang];
      expect(p.labs.sub.length).toBeGreaterThan(40);
      expect(p.meta.labs.desc).toContain("{n}");
      expect(p.meta.labs.desc).toContain("{range}");
      expect(fill(p.meta.labs.desc, { n: LAB_ARCHIVE.length, range: "2020—2026" })).toContain(
        String(LAB_ARCHIVE.length)
      );
      expect(p.labs.archive.title).toContain("{range}");
      expect(p.labs.archive.intro).toContain("{n}");
    }
  });
});
