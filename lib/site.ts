import type { Lang } from "@/lib/i18n/dict";

/**
 * This build's language and deployment root.
 *
 * A static export cannot read cookies, so the language is fixed per build:
 * Chinese at the site root, English under `/en`. `next.config.mjs` derives
 * `basePath` from the same two variables and inlines all three for the client.
 */
export const SITE_LANG: Lang = process.env.NEXT_PUBLIC_SITE_LANG === "en" ? "en" : "zh";

/** Deployment root: "/repo-name" on a GitHub Pages project site, "" at a domain root. */
export const SITE_BASE = process.env.NEXT_PUBLIC_SITE_BASE ?? "";

/** basePath of this build: the site root for zh, the site root plus "/en" for en. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** URL of a file in /public, for builds deployed under a sub-path. */
export function assetUrl(pathname: string): string {
  return `${BASE_PATH}${pathname}`;
}

/**
 * Path of the current page relative to the site root, without the `/en`
 * prefix. `usePathname` may or may not include the base path depending on the
 * Next version, so both shapes are accepted.
 */
export function sitePathOf(pathname: string): string {
  let path = pathname || "/";
  if (SITE_BASE && (path === SITE_BASE || path.startsWith(`${SITE_BASE}/`))) {
    path = path.slice(SITE_BASE.length) || "/";
  }
  if (BASE_PATH !== SITE_BASE && path.startsWith("/en")) {
    const rest = path.slice(3);
    if (rest === "") path = "/";
    else if (rest.startsWith("/")) path = rest;
  }
  return path;
}
