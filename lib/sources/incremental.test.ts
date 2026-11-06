import { describe, expect, it } from "vitest";
import { createArxivSource } from "./arxiv";
import { createGitHubSource } from "./github";

const atom = (id: string, date: string, title: string) => `
<entry>
  <id>http://arxiv.org/abs/${id}</id>
  <title>${title}</title>
  <published>${date}T00:00:00Z</published>
  <summary>theorem proving and artificial intelligence</summary>
  <author><name>Test Author</name></author>
</entry>`;

describe("incremental source adapters", () => {
  it("arXiv honors the since lower bound", async () => {
    const source = createArxivSource({
      fetchFn: (async () =>
        ({
          ok: true,
          status: 200,
          text: async () =>
            atom("2610.00001", "2026-10-01", "Old theorem") +
            atom("2610.00002", "2026-10-20", "New theorem"),
        }) as unknown as Response),
    });

    const items = await source.fetchRecent({ since: "2026-10-15" });
    expect(items).toHaveLength(1);
    expect(items[0].publishedAt).toBe("2026-10-20");
  });

  it("arXiv pages through a backlog instead of truncating at the limit", async () => {
    const pageHtml = (prefix: string, count: number) =>
      Array.from({ length: count }, (_, i) =>
        atom(
          `${prefix}${String(i).padStart(5, "0")}`,
          i < 200 ? "2026-11-03" : "2026-11-02",
          `Paper ${prefix}${i}`
        )
      ).join("");
    const pages = [pageHtml("2611.1", 200), pageHtml("2611.2", 60)];
    const starts: number[] = [];
    const source = createArxivSource({
      fetchFn: (async (url: RequestInfo | URL) => {
        const start = Number(new URL(String(url)).searchParams.get("start"));
        starts.push(start);
        return {
          ok: true,
          status: 200,
          text: async () => pages[starts.length - 1] ?? "",
        } as unknown as Response;
      }) as typeof fetch,
      sleepFn: async () => {},
    });

    const items = await source.fetchRecent({ since: "2026-11-01", limit: 250 });
    expect(starts).toEqual([0, 200]);
    expect(items).toHaveLength(250);
    expect(items.at(-1)?.title).toBe("Paper 2611.249");
  });

  it("arXiv honors Retry-After on a 429", async () => {
    const sleeps: number[] = [];
    let calls = 0;
    const source = createArxivSource({
      fetchFn: (async () => {
        calls += 1;
        if (calls === 1) {
          return {
            ok: false,
            status: 429,
            headers: { get: (name: string) => (name === "retry-after" ? "2" : null) },
            text: async () => "",
          } as unknown as Response;
        }
        return {
          ok: true,
          status: 200,
          text: async () => atom("2611.00001", "2026-11-03", "After throttle"),
        } as unknown as Response;
      }) as typeof fetch,
      sleepFn: async (ms) => {
        sleeps.push(ms);
      },
    });

    const items = await source.fetchRecent({});
    expect(sleeps).toEqual([2000]);
    expect(items).toHaveLength(1);
  });

  it("arXiv retries a network failure instead of aborting the sync", async () => {
    let calls = 0;
    const source = createArxivSource({
      fetchFn: (async () => {
        calls += 1;
        if (calls === 1) throw new Error("socket hang up");
        return {
          ok: true,
          status: 200,
          text: async () => atom("2611.00001", "2026-11-03", "Recovered"),
        } as unknown as Response;
      }) as typeof fetch,
      sleepFn: async () => {},
    });

    const items = await source.fetchRecent({});
    expect(calls).toBe(2);
    expect(items).toHaveLength(1);
  });

  it("GitHub honors the since lower bound", async () => {
    const source = createGitHubSource({
      fetchFn: (async (url: RequestInfo | URL) =>
        ({
          ok: true,
          status: 200,
          json: async () =>
            String(url).endsWith("/releases/latest")
              ? { tag_name: "v1.0.0", published_at: "2026-10-20T12:00:00Z" }
              : {
                  full_name: "example/repo",
                  html_url: "https://github.com/example/repo",
                  description: "A theorem proving project",
                  created_at: "2024-01-01T00:00:00Z",
                  language: "TypeScript",
                },
        }) as unknown as Response),
      repos: ["example/repo"],
    });

    const fresh = await source.fetchRecent({ since: "2026-10-15" });
    const stale = await source.fetchRecent({ since: "2026-10-21" });
    expect(fresh).toHaveLength(1);
    expect(fresh[0].publishedAt).toBe("2026-10-20");
    expect(stale).toHaveLength(0);
  });

  it("GitHub dates a repository by its latest release, not by pushes", async () => {
    const source = createGitHubSource({
      fetchFn: (async (url: RequestInfo | URL) =>
        ({
          ok: true,
          status: 200,
          json: async () =>
            String(url).endsWith("/releases/latest")
              ? { tag_name: "v4.19.0", published_at: "2026-09-30T00:00:00Z" }
              : {
                  full_name: "example/prover",
                  html_url: "https://github.com/example/prover",
                  description: "An interactive theorem prover",
                  created_at: "2021-01-01T00:00:00Z",
                  language: "Lean",
                },
        }) as unknown as Response),
      repos: ["example/prover"],
    });

    const items = await source.fetchRecent({});
    expect(items[0].publishedAt).toBe("2026-09-30");
    expect(items[0].abstract).toContain("latest release v4.19.0");
  });
});

