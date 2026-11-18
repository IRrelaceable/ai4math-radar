import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { promisify } from "node:util";
import { expect, it } from "vitest";
import type { StaticDataset } from "@/types";
import type { WatchState, WatchTarget } from "@/lib/watch";

const run = promisify(execFile);
const repo = process.cwd();
const previousLog = "# History\n\n## October 26, 2026\n\nTwo new manuscripts were added.";
const correction = [
  "## October 29, 2026",
  "",
  "**Formalization Fix**",
  "",
  "- The rational Hodge conjecture for CM abelian varieties. Diverging namespaces in the Comparator challenge and solution were adjusted.",
].join("\n");

it("saves a baseline, retries a provider failure and publishes the dated revision exactly once", async () => {
  const cache = path.join(repo, ".cache");
  await fs.mkdir(cache, { recursive: true });
  const dir = await fs.mkdtemp(path.join(cache, "watch-integration-"));
  let requests = 0;
  const prompts: string[] = [];
  const server = createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    const messages = JSON.parse(body).messages as { content: string }[];
    prompts.push(messages.at(-1)!.content);
    if (++requests === 1) {
      res.writeHead(429).end("rate limited");
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({
        belongs: true,
        kind: "correction",
        title: "Hodge formalization configuration corrected",
        titleZh: "修正霍奇猜想形式化的配置",
        summary: "OpenAI aligned the Comparator namespaces for the challenge and solution.",
        summaryZh: "OpenAI 统一了 Comparator 挑战与解答的命名空间。",
        date: "2026-11-18",
      }) } }],
    }));
  });

  try {
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    const { port } = server.address() as AddressInfo;
    const env = {
      ...process.env,
      LLM_PROVIDER: "openai-compatible",
      LLM_API_URL: `http://127.0.0.1:${port}`,
      LLM_API_KEY: "test-only",
      LLM_MODEL: "test",
    };
    const sync = (...args: string[]) => run(process.execPath, [
      path.join(repo, "node_modules", "tsx", "dist", "cli.mjs"),
      "--tsconfig",
      path.join(repo, "tsconfig.json"),
      path.join(repo, "scripts", "sync-watch.ts"),
      ...args,
    ], { cwd: dir, env, timeout: 20_000 });
    const { targets: [target] } = JSON.parse(
      await fs.readFile(path.join(repo, "data/watch/targets.json"), "utf8")
    ) as { targets: WatchTarget[] };
    const configDir = path.join(dir, "data/watch");
    await fs.mkdir(configDir, { recursive: true });
    const setSource = (markdown: string) => fs.writeFile(
      path.join(configDir, "targets.json"),
      JSON.stringify({ targets: [{ ...target, fetchUrl: `data:text/plain,${encodeURIComponent(markdown)}` }] })
    );
    const stateFile = path.join(dir, "data/ingested/watch-state.json");
    const readState = async () => JSON.parse(await fs.readFile(stateFile, "utf8")) as WatchState;
    const readDataset = async (lang: string) => JSON.parse(
      await fs.readFile(path.join(dir, "public/data", `${lang}.json`), "utf8")
    ) as StaticDataset;

    await setSource(previousLog);
    await sync("--dry");
    await expect(fs.stat(stateFile)).rejects.toMatchObject({ code: "ENOENT" });
    await sync();
    expect((await readState())[target.id].sections?.["2026-10-26"]).toBeDefined();
    expect(requests).toBe(0);

    await setSource(`${previousLog}\n\n${correction}`);
    const failed = await sync();
    expect(failed.stderr).toContain("pending retry");
    const [pending] = (await readState())[target.id].pending!;
    expect(pending.date).toBe("2026-10-29");
    await expect(fs.stat(path.join(dir, "data/ingested/events.json"))).rejects.toMatchObject({ code: "ENOENT" });

    await sync();
    const slug = `watch-${pending.id}`;
    for (const lang of ["zh", "en"]) {
      const { events } = await readDataset(lang);
      expect(events.filter((event) => event.slug === slug)).toHaveLength(1);
      expect(events.find((event) => event.slug === slug)).toMatchObject({
        date: "2026-10-29",
        sourceUrl: `${target.sourceUrl}#october-29-2026`,
        tracking: { eventId: target.eventId, kind: "correction" },
      });
      expect(events.some((event) => event.slug === "openai-math-first-corrections-722-to-719")).toBe(true);
    }
    expect(prompts).toHaveLength(2);
    expect(prompts[0]).toContain("EVENT TITLE: OpenAI publishes 700+ mathematical manuscripts");
    expect(prompts[0]).toContain("CURRENT SOURCE SECTION (dated 2026-10-29)");
    expect((await readState())[target.id].pending).toEqual([]);

    await sync();
    expect(requests).toBe(2);
    expect((await readDataset("zh")).events.filter((event) => event.slug === slug)).toHaveLength(1);
  } finally {
    if (server.listening) await new Promise<void>((resolve) => { server.close(() => resolve()); });
    await fs.rm(dir, { recursive: true, force: true });
  }
}, 30_000);
