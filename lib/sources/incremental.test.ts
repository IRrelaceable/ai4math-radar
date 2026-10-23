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

  it("GitHub honors the since lower bound", async () => {
    const source = createGitHubSource({
      fetchFn: (async () =>
        ({
          ok: true,
          status: 200,
          json: async () => ({
            full_name: "example/repo",
            html_url: "https://github.com/example/repo",
            description: "A theorem proving project",
            pushed_at: "2026-10-20T12:00:00Z",
            stargazers_count: 1,
            language: "TypeScript",
          }),
        }) as unknown as Response),
      repos: ["example/repo"],
    });

    const fresh = await source.fetchRecent({ since: "2026-10-15" });
    const stale = await source.fetchRecent({ since: "2026-10-21" });
    expect(fresh).toHaveLength(1);
    expect(stale).toHaveLength(0);
  });
});

