"use client";

import { createContext, useContext } from "react";
import { dict, type Dict, type Lang } from "./dict";
import { SITE_LANG } from "@/lib/site";

interface LangContextValue {
  lang: Lang;
}

/** Fixed per build: the language is chosen when the static site is exported. */
export const LangContext = createContext<LangContextValue>({ lang: SITE_LANG });

export function useLang(): LangContextValue {
  return useContext(LangContext);
}

/** Client-side dictionary access. */
export function useT(): { lang: Lang; t: Dict } {
  const { lang } = useLang();
  return { lang, t: dict[lang] as Dict };
}
