import { describe, expect, it } from "vitest";
import { eventSlug, paperUrlFor } from "./tracker";

describe("paperUrlFor", () => {
  it("keeps the link for paper venues", () => {
    expect(paperUrlFor({ url: "https://arxiv.org/abs/2410.00001", sourceType: "arxiv", source: "arXiv" }))
      .toBe("https://arxiv.org/abs/2410.00001");
    expect(paperUrlFor({ url: "https://openreview.net/forum?id=x", sourceType: "conference", source: "NeurIPS" }))
      .toBe("https://openreview.net/forum?id=x");
  });

  it("drops links that are not papers", () => {
    expect(paperUrlFor({ url: "https://news.mit.edu/2026/story", sourceType: "news", source: "MIT News" }))
      .toBeUndefined();
    expect(paperUrlFor({ url: "https://openai.com/index/post", sourceType: "blog", source: "OpenAI" }))
      .toBeUndefined();
    expect(paperUrlFor({ url: "https://github.com/x/y", sourceType: "github", source: "GitHub" }))
      .toBeUndefined();
  });

  it("falls back to the source label when sourceType is absent", () => {
    expect(paperUrlFor({ url: "https://arxiv.org/abs/2410.00002", source: "arXiv cs.AI" }))
      .toBe("https://arxiv.org/abs/2410.00002");
  });

  it("returns undefined without a URL", () => {
    expect(paperUrlFor({ sourceType: "arxiv", source: "arXiv" })).toBeUndefined();
  });
});

describe("eventSlug", () => {
  it("slugifies the title", () => {
    expect(eventSlug({ title: "A New Proof!", url: "https://example.com/a" })).toBe("a-new-proof");
  });

  it("falls back to a hash when the title has no ASCII slug", () => {
    const slug = eventSlug({ title: "定理证明", url: "https://example.com/zh" });
    expect(slug).toMatch(/^event-[a-z0-9]{6}$/);
    expect(eventSlug({ title: "定理证明", url: "https://example.com/zh" })).toBe(slug);
  });

  it("disambiguates the same headline from a different URL", () => {
    const taken = new Map([["same-headline", "https://a.example/x"]]);
    const slug = eventSlug({ title: "Same Headline", url: "https://b.example/y" }, taken);
    expect(slug).toMatch(/^same-headline-[a-z0-9]{6}$/);
    expect(taken.get(slug)).toBe("https://b.example/y");
  });

  it("reuses the slug for the same URL", () => {
    const taken = new Map([["same-headline", "https://a.example/x"]]);
    expect(eventSlug({ title: "Same Headline", url: "https://a.example/x" }, taken)).toBe("same-headline");
  });
});
