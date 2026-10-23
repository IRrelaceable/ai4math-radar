"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { dict, type Dict, type Lang } from "./dict";

interface LangContextValue {
  lang: Lang;
  setLang: (next: Lang) => void;
}

/** Default to Chinese: the primary audience reads Chinese UI text. */
export const LangContext = createContext<LangContextValue>({
  lang: "zh",
  setLang: () => {},
});

export function useLang(): LangContextValue {
  return useContext(LangContext);
}

/** Client-side dictionary access. */
export function useT(): { lang: Lang; t: Dict } {
  const { lang } = useLang();
  return { lang, t: dict[lang] as Dict };
}

/** Sets the `lang` cookie and re-renders the current route server-side. */
export function useSetLang() {
  const router = useRouter();
  const { setLang } = useLang();
  return (next: Lang) => {
    setLang(next);
    document.cookie = `lang=${next}; path=/; max-age=31536000`;
    router.refresh();
  };
}
