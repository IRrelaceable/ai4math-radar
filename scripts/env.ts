import fs from "node:fs";
import path from "node:path";

/**
 * Load `.env` for CLI scripts. `next dev` does this itself, but a script run
 * through tsx does not, and the LLM credentials live there.
 *
 * Existing environment variables win, so CI secrets are never overridden by a
 * stale local file.
 */
export function loadEnv(): void {
  const file = path.join(process.cwd(), ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    const value = match[2].replace(/^["']|["']$/g, "");
    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
}
