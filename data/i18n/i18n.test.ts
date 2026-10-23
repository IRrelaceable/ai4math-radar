import { describe, expect, it } from "vitest";
import { events as seedEvents } from "@/data/seed/events";
import { EVENT_ZH } from "@/data/i18n/events";
import { PHRASE_ZH } from "@/data/i18n/phrases";
import { localizeEvent, localizeEvents } from "@/lib/i18n/localize";

/**
 * The Chinese overlay must stay complete and structurally aligned with the
 * English source: any drift (missing slug, dropped contribution item, empty
 * translation) shows up here rather than as a half-Chinese detail page.
 */

describe("Chinese event overlay (EVENT_ZH)", () => {
  it("covers every seed event with non-empty prose", () => {
    for (const e of seedEvents) {
      const zh = EVENT_ZH[e.slug];
      expect(zh, `missing zh entry for "${e.slug}"`).toBeDefined();
      expect(zh!.title?.trim(), `empty zh title for "${e.slug}"`).toBeTruthy();
      expect(zh!.summary?.trim(), `empty zh summary for "${e.slug}"`).toBeTruthy();
      expect(zh!.significance?.trim(), `empty zh significance for "${e.slug}"`).toBeTruthy();
    }
  });

  it("mirrors optional fields: problem and keyContributions stay aligned", () => {
    for (const e of seedEvents) {
      const zh = EVENT_ZH[e.slug]!;
      if (e.problem) {
        expect(Boolean(zh.problem), `zh problem missing for "${e.slug}"`).toBe(true);
      }
      if (e.keyContributions?.length) {
        expect(zh.keyContributions?.length, `zh contributions mismatch for "${e.slug}"`).toBe(
          e.keyContributions.length
        );
      }
    }
  });

  it("translates only via the overlay — en rendering never changes", () => {
    const event = seedEvents[0];
    const en = localizeEvent(event, "en");
    expect(en.title).toBe(event.title);
    expect(en.summary).toBe(event.summary);
    expect(en).toBe(event); // no copy, no work done for English
  });

  it("overlays Chinese on top without mutating the source event", () => {
    const event = seedEvents.find((e) => EVENT_ZH[e.slug]?.summary)!;
    const before = event.summary;
    const zh = localizeEvent(event, "zh");
    expect(zh.summary).not.toBe(before);
    expect(event.summary).toBe(before); // source untouched
    expect(localizeEvents([event], "zh")[0].summary).not.toBe(before);
    expect(localizeEvents([event], "en")[0]).toBe(event);
  });
});

describe("Chinese boilerplate map (PHRASE_ZH)", () => {
  it("includes the verification notes generated at runtime", () => {
    expect(PHRASE_ZH["Recorded when the event entered the tracker."]).toBeTruthy();
    expect(
      PHRASE_ZH["Inspectable artifact (code, proofs or data) is publicly available."]
    ).toBeTruthy();
  });

  it("translates every prose string stored on seed events", () => {
    for (const e of seedEvents) {
      if (e.importanceNote) {
        expect(PHRASE_ZH[e.importanceNote], `importanceNote not translated for "${e.slug}"`).toBeTruthy();
      }
      for (const w of e.relatedWorks ?? []) {
        if (w.note) expect(PHRASE_ZH[w.note], `relatedWorks note not translated for "${e.slug}"`).toBeTruthy();
      }
      for (const h of e.verificationHistory ?? []) {
        if (h.note) expect(PHRASE_ZH[h.note], `history note not translated for "${e.slug}"`).toBeTruthy();
      }
    }
  });

  it("has no empty translations", () => {
    for (const [en, zh] of Object.entries(PHRASE_ZH)) {
      expect(zh.trim(), `empty zh value for "${en}"`).toBeTruthy();
    }
  });
});
