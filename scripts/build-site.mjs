#!/usr/bin/env node
/**
 * Build the bilingual static site.
 *
 * The app is exported twice because language is fixed per build (there is no
 * server to read a cookie or a request header):
 *
 *   zh  → dist/            (SITE_BASE)
 *   en  → dist/en/         (SITE_BASE + "/en")
 *
 * Next writes a flat `out/` even when `basePath` is set, so the English export
 * is simply copied under `dist/en`. Each build ships only the dataset it needs.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const out = path.join(root, "out");
// Next 14 with a custom distDir writes the static export INTO that distDir
// (no out/ is produced), and its build intermediates still go to .next — so
// a live dev server must be stopped before publishing, not merely isolated.
const nextBuild = path.join(root, ".next-build");
const siteBase = (process.env.SITE_BASE ?? "").replace(/\/+$/, "");

function run(cmd, args, env) {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) {
    console.error(`[build] failed: ${cmd} ${args.join(" ")}`);
    process.exit(result.status ?? 1);
  }
}

function build(lang) {
  clearDirectory(out);
  // Each language is a separate static export. Clearing Next's transient
  // build tree avoids Windows retaining a chunk directory between exports.
  clearDirectory(nextBuild);
  run("npx", ["next", "build"], {
    SITE_LANG: lang,
    SITE_BASE: siteBase,
    NEXT_DIST_DIR: ".next-build",
    MSYS_NO_PATHCONV: "1",
  });
  // With a custom distDir Next 14 exports straight into it; normalise to out/.
  if (!fs.existsSync(nextBuild)) {
    console.error(`[build] next build produced no export for ${lang}`);
    process.exit(1);
  }
  fs.renameSync(nextBuild, out);
}

/**
 * Windows can hold a just-produced static directory briefly while an indexer
 * or preview process releases it. Retry the generated-output cleanup and
 * fail explicitly if a stale directory still remains before a rename.
 */
function clearDirectory(dir) {
  fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  if (fs.existsSync(dir)) {
    throw new Error(`[build] could not clear generated directory: ${dir}`);
  }
}

function keepOnly(lang, dir) {
  const other = lang === "zh" ? "en" : "zh";
  fs.rmSync(path.join(dir, "data", `${other}.json`), { force: true });
}

console.log(`[build] SITE_BASE=${siteBase || "(root)"}`);
run("npx", ["tsx", "scripts/build-data.ts"]);

clearDirectory(dist);

build("zh");
// A just-finished prior local build may recreate dist through a preview or
// file indexer between the initial cleanup and this atomic replacement.
clearDirectory(dist);
fs.renameSync(out, dist);
keepOnly("zh", dist);

build("en");
fs.mkdirSync(path.join(dist, "en"), { recursive: true });
fs.cpSync(out, path.join(dist, "en"), { recursive: true });
clearDirectory(out);
keepOnly("en", path.join(dist, "en"));

// GitHub Pages otherwise hands the tree to Jekyll, which drops `_next/`.
fs.writeFileSync(path.join(dist, ".nojekyll"), "");

console.log(`[build] done → dist/ (zh) + dist/en/ (en)`);
