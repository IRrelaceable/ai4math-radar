#!/usr/bin/env node
/**
 * Both dev servers plus the loopback endpoint behind "sync now".
 *
 * The language is compiled into the bundle, so one `next dev` can only serve
 * one language and `/en` does not exist in the Chinese dev build. The header's
 * EN toggle links to :3001, so both servers start together with separate build
 * directories. A second sync listener on :3100 would collide, so
 * `startSyncServer()` is called once here and shared.
 */
import { spawn } from "node:child_process";
import { startSyncServer } from "./sync-server.mjs";

await startSyncServer();

const servers = [
  spawn("npx next dev -p 3000", { stdio: "inherit", shell: true, env: process.env }),
  spawn("npx next dev -p 3001", {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, SITE_LANG: "en", NEXT_DIST_DIR: ".next-en" },
  }),
];

let stopping = false;

function stop(code) {
  if (stopping) return;
  stopping = true;
  for (const child of servers) {
    if (child.exitCode !== null || child.signalCode !== null) continue;
    // `shell: true` means killing the shell can orphan `next dev` on Windows.
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore", shell: true });
    } else {
      child.kill();
    }
  }
  process.exit(code);
}

for (const child of servers) child.on("exit", (code) => stop(code ?? 0));
process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
