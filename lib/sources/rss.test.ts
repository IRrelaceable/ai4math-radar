import { describe, expect, it } from "vitest";
import { createRssSource, parseFeedBlock } from "./rss";

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>OpenAI News</title>
<item>
  <title><![CDATA[Working with academic communities]]></title>
  <description><![CDATA[Model results on the Kakeya conjecture &amp; more.]]></description>
  <link>https://openai.com/index/academic-communities</link>
  <pubDate>Mon, 26 Oct 2026 14:30:00 GMT</pubDate>
</item>
<item>
  <title>Plain title</title>
  <link>https://example.com/plain</link>
  <pubDate>Sun, 25 Oct 2026 00:00:00 GMT</pubDate>
</item>
</channel></rss>`;

describe("RSS adapter", () => {
  it("unwraps CDATA fields instead of stripping them as HTML", () => {
    const block = feed.match(/<item>[\s\S]*?<\/item>/)?.[0] ?? "";
    const parsed = parseFeedBlock(block);
    expect(parsed.title).toBe("Working with academic communities");
    expect(parsed.summary).toBe("Model results on the Kakeya conjecture & more.");
    expect(parsed.publishedAt).toBe("2026-10-26");
    expect(parsed.url).toBe("https://openai.com/index/academic-communities");
  });

  it("keeps items from CDATA feeds", async () => {
    const source = createRssSource({
      id: "openai-news",
      label: "OpenAI News",
      feedUrl: "https://example.com/rss.xml",
      fetchFn: (async () =>
        ({ ok: true, status: 200, text: async () => feed }) as unknown as Response),
    });

    const items = await source.fetchRecent({});
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe("Working with academic communities");
  });

  it("keeps only items matching includeKeywords", async () => {
    const source = createRssSource({
      id: "broad-feed",
      label: "Broad feed",
      feedUrl: "https://example.com/rss.xml",
      includeKeywords: ["Kakeya", "AI"],
      fetchFn: (async () =>
        ({ ok: true, status: 200, text: async () => feed }) as unknown as Response),
    });

    const items = await source.fetchRecent({});
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("Working with academic communities");
  });

  it("matches short keywords on word boundaries", async () => {
    const source = createRssSource({
      id: "boundary-feed",
      label: "Boundary feed",
      feedUrl: "https://example.com/rss.xml",
      includeKeywords: ["AI"],
      fetchFn: (async () =>
        ({
          ok: true,
          status: 200,
          text: async () =>
            `<rss><channel>
              <item><title>AI in mathematics</title><link>https://x.test/a</link></item>
              <item><title>Aims and scope</title><link>https://x.test/b</link></item>
              <item><title>Chairs and tables</title><link>https://x.test/c</link></item>
            </channel></rss>`,
        }) as unknown as Response),
    });

    const items = await source.fetchRecent({});
    expect(items.map((item) => item.title)).toEqual(["AI in mathematics"]);
  });

  it("strips entity-encoded HTML in descriptions", () => {
    const parsed = parseFeedBlock(
      `<item><title>Brain mapping &amp; AI</title>` +
        `<description>&lt;img src="x.png"&gt;A lesson on neuroscience.</description>` +
        `<link>https://example.com/post</link></item>`
    );
    expect(parsed.title).toBe("Brain mapping & AI");
    expect(parsed.summary).toBe("A lesson on neuroscience.");
  });

  it("fails loudly when a feed URL serves an HTML page", async () => {
    const source = createRssSource({
      id: "dead-feed",
      label: "Dead feed",
      feedUrl: "https://example.com/news/rss",
      fetchFn: (async () =>
        ({
          ok: true,
          status: 200,
          headers: { get: () => "text/html; charset=utf-8" },
          text: async () => "<!DOCTYPE html><html><body>News</body></html>",
        }) as unknown as Response),
    });

    await expect(source.fetchRecent({})).rejects.toThrow(/HTML page, not a feed/);
  });

  it("follows the feed link advertised on the site when a feed path moved", async () => {
    const requested: string[] = [];
    const source = createRssSource({
      id: "moved-feed",
      label: "Moved feed",
      feedUrl: "https://example.com/feed/",
      fetchFn: (async (url: string) => {
        requested.push(url);
        if (url === "https://example.com/") {
          return {
            ok: true,
            status: 200,
            headers: { get: () => "text/html; charset=utf-8" },
            text: async () =>
              `<html><head><link rel="alternate" type="application/rss+xml" href="/feeds"></head></html>`,
          } as unknown as Response;
        }
        if (url === "https://example.com/feeds") {
          return { ok: true, status: 200, text: async () => feed } as unknown as Response;
        }
        return { ok: false, status: 404, text: async () => "" } as unknown as Response;
      }) as unknown as typeof fetch,
    });

    const items = await source.fetchRecent({});
    expect(items).toHaveLength(2);
    expect(requested).toEqual([
      "https://example.com/feed/",
      "https://example.com/",
      "https://example.com/feeds",
    ]);
  });

  it("does not treat an auth wall as a moved feed", async () => {
    let calls = 0;
    const source = createRssSource({
      id: "auth-feed",
      label: "Auth feed",
      feedUrl: "https://example.com/private.xml",
      fetchFn: (async () => {
        calls += 1;
        return { ok: false, status: 401, text: async () => "" } as unknown as Response;
      }) as unknown as typeof fetch,
    });

    await expect(source.fetchRecent({})).rejects.toThrow(/HTTP 401/);
    expect(calls).toBe(1);
  });
});

describe("RSS bylines", () => {
  const bylined = `<?xml version="1.0"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel>
<item>
  <title>Person with desk</title>
  <link>https://example.com/a</link>
  <dc:creator><![CDATA[Adam Zewe | MIT News]]></dc:creator>
</item>
<item>
  <title>Desk only</title>
  <link>https://example.com/b</link>
  <dc:creator><![CDATA[School of Science]]></dc:creator>
</item>
<item>
  <title>Atom author</title>
  <link>https://example.com/c</link>
  <author><name>Terence Tao</name></author>
</item>
<item>
  <title>RSS 2 author</title>
  <link>https://example.com/d</link>
  <author>jdoe@example.com (Jane Doe)</author>
</item>
</channel></rss>`;

  const source = createRssSource({
    id: "bylined",
    label: "Bylined feed",
    feedUrl: "https://example.com/rss.xml",
    fetchFn: (async () =>
      ({ ok: true, status: 200, text: async () => bylined }) as unknown as Response),
  });

  it("keeps the person's name from dc:creator and the author block", async () => {
    const items = await source.fetchRecent({});
    expect(items.map((item) => item.authors)).toEqual([
      ["Adam Zewe"],
      [],
      ["Terence Tao"],
      ["Jane Doe"],
    ]);
  });

  it("drops a desk label instead of storing it as an author", async () => {
    const block = bylined.match(/<item>[\s\S]*?<\/item>/g)?.[1] ?? "";
    expect(parseFeedBlock(block).authors).toEqual([]);
  });
});
