import { dict, type Dict, type Lang } from "./dict";
import { SITE_LANG } from "@/lib/site";

/**
 * Language of this build. A static export has no request to read a cookie
 * from, so the choice is made at build time (see lib/site.ts) — the Chinese
 * build and the English build are two exports of the same app.
 */
export function getLang(): Lang {
  return SITE_LANG;
}

/** Server-side dictionary access. */
export function t(lang: Lang = getLang()): Dict {
  return dict[lang] as Dict;
}
