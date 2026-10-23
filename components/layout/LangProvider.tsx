"use client";

import { useMemo, useState } from "react";
import { LangContext } from "@/lib/i18n/context";
import type { Lang } from "@/lib/i18n/dict";

/** Client boundary for the language context; `initialLang` comes from the cookie. */
export function LangProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: React.ReactNode;
}) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const value = useMemo(() => ({ lang, setLang }), [lang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
