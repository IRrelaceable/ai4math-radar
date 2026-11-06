#!/usr/bin/env node
/**
 * English dev server, side by side with the Chinese one.
 *
 * The language is compiled into the bundle, so a single `next dev` can only
 * serve one language and `/en` does not exist there. `npm run dev` already
 * starts this English server next to the Chinese one; use this script only to
 * run English alone on port 3001 with its own build directory:
 *
 *   npm run dev      → http://localhost:3000/ 中文 + http://localhost:3001/en/
 *   npm run dev:en   → http://localhost:3001/en/                  (English)
 */
import { spawn, spawnSync } from "node:child_process";
import { startSyncServer } from "./sync-server.mjs";

const data = spawnSync("npx tsx scripts/build-data.ts", {
  stdio: "inherit",
  shell: true,
});
if (data.status !== 0) process.exit(data.status ?? 1);

// Reuses the listener if the Chinese dev server already owns the port.
await startSyncServer();

const child = spawn("npx next dev -p 3001", {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, SITE_LANG: "en", NEXT_DIST_DIR: ".next-en" },
});
child.on("exit", (code) => process.exit(code ?? 0));
