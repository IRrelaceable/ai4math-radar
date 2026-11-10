import { describe, expect, it } from "vitest";
import { createSitemapSource, parseSitemapXml } from "./sitemap";

const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/news/2026-11-09-fable</loc><lastmod>2026-11-09T19:40:53.000Z</lastmod></url>
  <url><loc>https://example.com/news/2026-10-01-older</loc><lastmod>2026-10-01T10:00:00.000Z</lastmod></url>
  <url><loc>https://example.com/careers</loc><lastmod>2026-11-08T10:00:00.000Z</lastmod></url>
</urlset>`;

function page(title: string, description: string, body: string, date: string): string {
  return `<!doctype html><html><head>
    <meta property="og:title" content="${title}"/>
    <meta property="og:description" content="${description}"/>
  </head><body><article><time datetime="${date}"></time><p>${body}</p></article></body></html>`;
}

const PAGES: Record<string, string> = {
  "https://example.com/news/2026-11-09-fable": page(
    "Introducing Fable 5.2",
    "Our most capable model for technical work.",
    "During testing it formalized the proof of Fermat's Last Theorem in 30 hours with about a thousand agents.",
    "2026-11-09"
  ),
  "https://example.com/news/2026-10-01-older": page(
    "Older post",
    "A theorem was proved.",
    "Body.",
    "2026-10-01"
  ),
};

function respond(url: string): Response {
  if (url.endsWith("sitemap.xml")) return new Response(SITEMAP, { status: 200 });
  const html = PAGES[url];
  return new Response(html ?? "missing", { status: html ? 200 : 404 });
}

const fetchFn = (async (input: RequestInfo | URL) => respond(String(input))) as typeof fetch;

describe("parseSitemapXml", () => {
  it("reads urlset entries and sitemapindex children", () => {
    const urlset = parseSitemapXml(SITEMAP);
    expect(urlset.children).toEqual([]);
    expect(urlset.entries).toHaveLength(3);
    expect(urlset.entries[0]).toEqual({
      loc: "https://example.com/news/2026-11-09-fable",
      lastmod: "2026-11-09T19:40:53.000Z",
    });

    const index = parseSitemapXml(
      `<sitemapindex><sitemap><loc>https://example.com/sitemap-1.xml</loc></sitemap></sitemapindex>`
    );
    expect(index.children).toEqual(["https://example.com/sitemap-1.xml"]);
    expect(index.entries).toEqual([]);
  });
});

describe("createSitemapSource", () => {
  const source = () =>
    createSitemapSource({
      id: "example",
      label: "Example",
      sitemapUrl: "https://example.com/sitemap.xml",
      pathPattern: /^\/news\//,
      defaultEventType: "Research",
      sourceTier: "S1",
      maxPages: 5,
      fetchFn,
    });

  it("keeps article paths, reads the article excerpt and its date", async () => {
    const items = await source().fetchRecent();
    expect(items).toHaveLength(2);
    const [first] = items;
    expect(first.title).toBe("Introducing Fable 5.2");
    expect(first.url).toBe("https://example.com/news/2026-11-09-fable");
    expect(first.publishedAt).toBe("2026-11-09");
    // The meta description alone never mentions the maths; the opening
    // paragraph does, so the excerpt must carry it.
    expect(first.abstract).toContain("Fermat's Last Theorem");
    expect(items.map((item) => item.url)).not.toContain("https://example.com/careers");
  });

  it("skips sitemap entries older than the cursor", async () => {
    const items = await source().fetchRecent({ since: "2026-11-01" });
    expect(items.map((item) => item.url)).toEqual([
      "https://example.com/news/2026-11-09-fable",
    ]);
  });

  it("follows a sitemap index", async () => {
    const indexFetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("sitemap.xml")) {
        return new Response(
          `<sitemapindex><sitemap><loc>https://example.com/child.xml</loc></sitemap></sitemapindex>`,
          { status: 200 }
        );
      }
      if (url.endsWith("child.xml")) return new Response(SITEMAP, { status: 200 });
      return respond(url);
    }) as typeof fetch;
    const withIndex = createSitemapSource({
      id: "example",
      label: "Example",
      sitemapUrl: "https://example.com/sitemap.xml",
      pathPattern: /^\/news\//,
      fetchFn: indexFetch,
    });
    const items = await withIndex.fetchRecent();
    expect(items).toHaveLength(2);
  });

  it("skips a page that 404s but keeps the rest", async () => {
    const items = await source().fetchRecent();
    const failing = createSitemapSource({
      id: "example",
      label: "Example",
      sitemapUrl: "https://example.com/sitemap.xml",
      pathPattern: /^\/news\//,
      fetchFn: (async (input: RequestInfo | URL) =>
        String(input).endsWith("sitemap.xml")
          ? new Response(SITEMAP, { status: 200 })
          : new Response("nope", { status: 404 })) as typeof fetch,
    });
    expect(items).toHaveLength(2);
    await expect(failing.fetchRecent()).rejects.toThrow(/could not read any/);
  });

  it("throws when the sitemap itself is unavailable", async () => {
    const dead = createSitemapSource({
      id: "example",
      label: "Example",
      sitemapUrl: "https://example.com/sitemap.xml",
      fetchFn: (async () => new Response("", { status: 503 })) as typeof fetch,
    });
    await expect(dead.fetchRecent()).rejects.toThrow(/HTTP 503/);
  });
});
