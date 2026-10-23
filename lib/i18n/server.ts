import { cookies } from "next/headers";
import { dict, type Dict, type Lang } from "./dict";

/** Server-side language: the `lang` cookie, defaulting to Chinese. */
export function getLang(): Lang {
  return cookies().get("lang")?.value === "en" ? "en" : "zh";
}

/** Server-side dictionary access. */
export function t(lang: Lang = getLang()): Dict {
  return dict[lang] as Dict;
}
