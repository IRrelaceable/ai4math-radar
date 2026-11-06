import { describe, expect, it } from "vitest";
import { EVENT_TYPES, SOURCE_TIERS } from "@/types";
import { OFFICIAL_SOURCE_DEFINITIONS, SOURCE_TIER_TABLE, createOfficialSource, resolveSourceTier } from "./catalog";
import { getLiveResearchSources } from "./index";
import { parseFeedBlock } from "./rss";

describe("official source catalog", () => {
  it("covers every primary ecosystem class", () => {
    const categories = new Set(
      OFFICIAL_SOURCE_DEFINITIONS.map((source) => source.defaultEventType ?? "Research")
    );
    for (const type of EVENT_TYPES) expect(categories.has(type)).toBe(true);
  });

  it("creates one source adapter per catalog entry", () => {
    const sources = OFFICIAL_SOURCE_DEFINITIONS.map(createOfficialSource);
    expect(sources).toHaveLength(OFFICIAL_SOURCE_DEFINITIONS.length);
    expect(new Set(sources.map((source) => source.id)).size).toBe(sources.length);
  });

  it("assigns a valid S0-S4 tier to every catalog source", () => {
    for (const source of OFFICIAL_SOURCE_DEFINITIONS) {
      expect(
        SOURCE_TIERS as readonly string[],
        `${source.id} tier`
      ).toContain(source.sourceTier);
    }
  });

  it("groups every registered live source onto exactly one tier board", () => {
    const sources = Object.values(getLiveResearchSources());
    expect(sources.length).toBeGreaterThan(0);
    for (const source of sources) {
      expect(SOURCE_TIERS as readonly string[], `${source.id} tier`).toContain(
        source.sourceTier
      );
    }
    // arxiv + github are the S0 primary-research anchors.
    expect(getLiveResearchSources().arxiv.sourceTier).toBe("S0");
    expect(getLiveResearchSources().github.sourceTier).toBe("S0");
  });

  it("spans all five tiers across the full registry (boards are never empty)", () => {
    const tiers = new Set(
      Object.values(getLiveResearchSources()).map((source) => source.sourceTier)
    );
    for (const tier of SOURCE_TIERS) expect(tiers.has(tier)).toBe(true);
  });

  it("keeps built-in and catalog sources in one tier table", () => {
    expect(SOURCE_TIER_TABLE.arxiv).toBe("S0");
    expect(SOURCE_TIER_TABLE.github).toBe("S0");
    expect(SOURCE_TIER_TABLE["openai-news"]).toBe("S1");
    expect(SOURCE_TIER_TABLE["terence-tao-blog"]).toBe("S2");
    expect(SOURCE_TIER_TABLE["quanta-mathematics"]).toBe("S3");
    expect(SOURCE_TIER_TABLE["math-and-ai"]).toBe("S4");
  });

  it("resolves tiers by source URL host", () => {
    expect(resolveSourceTier({ sourceUrl: "https://arxiv.org/abs/1" })).toBe("S0");
    expect(resolveSourceTier({ sourceUrl: "https://github.com/org/repo" })).toBe("S0");
    expect(resolveSourceTier({ sourceUrl: "https://terrytao.wordpress.com/post" })).toBe("S2");
    expect(resolveSourceTier({ sourceUrl: "https://www.quantamagazine.org/story" })).toBe("S3");
    expect(resolveSourceTier({ sourceUrl: "https://mathandai.org/declaration" })).toBe("S4");
    expect(resolveSourceTier({ sourceUrl: "https://unknown.example/post" })).toBeUndefined();
  });

  it("normalizes RSS and Atom metadata", () => {
    const parsed = parseFeedBlock(`
      <entry>
        <id>https://example.org/post</id>
        <title>AI &amp; theorem proving</title>
        <link href="https://example.org/post"/>
        <published>2026-10-20T00:00:00Z</published>
        <summary>A new &lt;b&gt;formal proof&lt;/b&gt; result.</summary>
      </entry>
    `);
    expect(parsed.title).toBe("AI & theorem proving");
    expect(parsed.url).toBe("https://example.org/post");
    expect(parsed.publishedAt).toBe("2026-10-20");
    expect(parsed.summary).toContain("formal proof");
  });
});
