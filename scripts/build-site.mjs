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
  fs.rmSync(out, { recursive: true, force: true });
  run("npx", ["next", "build"], {
    SITE_LANG: lang,
    SITE_BASE: siteBase,
    MSYS_NO_PATHCONV: "1",
  });
  if (!fs.existsSync(out)) {
    console.error(`[build] next build produced no out/ for ${lang}`);
    process.exit(1);
  }
}

function keepOnly(lang, dir) {
  const other = lang === "zh" ? "en" : "zh";
  fs.rmSync(path.join(dir, "data", `${other}.json`), { force: true });
}

console.log(`[build] SITE_BASE=${siteBase || "(root)"}`);
run("npx", ["tsx", "scripts/build-data.ts"]);

fs.rmSync(dist, { recursive: true, force: true });

build("zh");
fs.renameSync(out, dist);
keepOnly("zh", dist);

build("en");
fs.mkdirSync(path.join(dist, "en"), { recursive: true });
fs.cpSync(out, path.join(dist, "en"), { recursive: true });
fs.rmSync(out, { recursive: true, force: true });
keepOnly("en", path.join(dist, "en"));

// GitHub Pages otherwise hands the tree to Jekyll, which drops `_next/`.
fs.writeFileSync(path.join(dist, ".nojekyll"), "");

console.log(`[build] done → dist/ (zh) + dist/en/ (en)`);
