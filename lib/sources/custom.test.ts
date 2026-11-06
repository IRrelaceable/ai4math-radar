import { describe, expect, it } from "vitest";
import { registerCustomSource } from "./custom";

describe("custom source validation", () => {
  it("rejects an invalid source type", () => {
    expect(() =>
      registerCustomSource({
        id: "bad-source",
        label: "Bad source",
        mode: "rss",
        url: "https://example.org/feed.xml",
        sourceType: "not-a-source-type" as never,
        sourceTier: "S1",
      })
    ).toThrow(/sourceType must be one of/);
  });

  it("rejects an invalid source tier", () => {
    expect(() =>
      registerCustomSource({
        id: "bad-source",
        label: "Bad source",
        mode: "rss",
        url: "https://example.org/feed.xml",
        sourceType: "news",
        sourceTier: "S9" as never,
      })
    ).toThrow(/sourceTier must be one of/);
  });

  it("rejects an invalid default event type", () => {
    expect(() =>
      registerCustomSource({
        id: "bad-source",
        label: "Bad source",
        mode: "page",
        url: "https://example.org/",
        sourceType: "news",
        sourceTier: "S1",
        defaultEventType: "Education" as never,
      })
    ).toThrow(/defaultEventType must be one of/);
  });
});
