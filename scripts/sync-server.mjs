#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { pathToFileURL } from "node:url";

/**
 * Loopback endpoint behind the "sync now" control on /sources.
 *
 * The published site is a static export with no server process, so a manual
 * sync can only run on a dev machine. `npm run dev` starts this listener next
 * to Next; the page posts here and polls the status. It shells out to the same
 * pipeline the scheduled job runs, so a button sync and a cron sync cannot
 * drift apart.
 */
const PORT = 3100;
const ORIGINS = new Set([
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
]);
const MAX_LINES = 40;
const DONE = /^Done: \+(\d+) new, ~(\d+) updated, (\d+) source\(s\) failed\./;

let state = idle();

function idle() {
  return {
    running: false,
    phase: "idle",
    startedAt: null,
    finishedAt: null,
    lines: [],
    result: null,
  };
}

function push(chunk) {
  for (const raw of String(chunk).split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    state.lines.push(line.slice(0, 240));
    const summary = DONE.exec(line);
    if (summary) {
      state.result = {
        ...(state.result ?? {}),
        added: Number(summary[1]),
        updated: Number(summary[2]),
        failedSources: Number(summary[3]),
      };
    }
  }
  if (state.lines.length > MAX_LINES) state.lines = state.lines.slice(-MAX_LINES);
}

function ingestCommand({ dry, limit, sources }) {
  const parts = ["npx tsx scripts/ingest.ts"];
  if (sources.length > 0) parts.push(...sources.map((id) => `--source=${id}`));
  else parts.push("--all");
  if (limit) parts.push(`--limit=${limit}`);
  if (dry) parts.push("--dry");
  return parts.join(" ");
}

function run(command) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, { cwd: process.cwd(), shell: true, env: process.env });
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", push);
    child.stderr.on("data", push);
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
  });
}

async function sync(options) {
  state = { ...idle(), running: true, phase: "ingest", startedAt: new Date().toISOString() };
  try {
    const command = ingestCommand(options);
    push(`$ ${command}`);
    await run(command);
    if (!options.dry) {
      state.phase = "build";
      push("$ npx tsx scripts/build-data.ts");
      await run("npx tsx scripts/build-data.ts");
    }
    state.phase = "done";
    state.result = { ok: true, ...(state.result ?? {}) };
  } catch (error) {
    state.phase = "error";
    state.result = { ok: false, error: String(error).slice(0, 200) };
    push(String(error));
  } finally {
    state.running = false;
    state.finishedAt = new Date().toISOString();
  }
}

function send(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(body));
}

const server = createServer((req, res) => {
  const origin = req.headers.origin;
  if (origin && ORIGINS.has(origin)) {
    res.setHeader("access-control-allow-origin", origin);
    res.setHeader("vary", "origin");
  }
  if (req.method === "OPTIONS") {
    res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
    res.setHeader("access-control-allow-headers", "content-type, x-ai4math-sync");
    res.writeHead(204);
    res.end();
    return;
  }
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  if (req.method === "GET" && url.pathname === "/status") return send(res, 200, state);
  if (req.method === "POST" && url.pathname === "/sync") {
    // A custom header forces a preflight, so a random page cannot fire this.
    if (req.headers["x-ai4math-sync"] !== "1") {
      return send(res, 400, { error: "missing x-ai4math-sync header" });
    }
    if (state.running) return send(res, 409, state);
    const options = {
      dry: url.searchParams.get("dry") === "1",
      limit: Number(url.searchParams.get("limit")) || undefined,
      sources: (url.searchParams.get("sources") ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    };
    void sync(options);
    return send(res, 202, state);
  }
  send(res, 404, { error: "not found" });
});

/** Start on the loopback interface; a second dev server reuses the listener. */
export function startSyncServer(port = PORT) {
  return new Promise((resolve) => {
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.log(`[sync] port ${port} is already served by another dev server`);
      } else {
        console.warn("[sync] local sync endpoint failed to start:", error);
      }
      resolve(null);
    });
    server.listen(port, "127.0.0.1", () => {
      console.log(`[sync] local sync endpoint on http://127.0.0.1:${port}`);
      resolve(server);
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await startSyncServer();
}
