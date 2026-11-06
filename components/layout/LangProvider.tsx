"use client";

import { useEffect } from "react";
import { LangContext } from "@/lib/i18n/context";
import { SITE_LANG } from "@/lib/site";
import { prefetchDataset } from "@/lib/useDataset";

/** Client boundary for the language context; the value is fixed per build. */
export function LangProvider({ children }: { children: React.ReactNode }) {
  // Every route mounts this provider, so one idle prefetch here means the first
  // navigation into a data-backed page finds the dataset already parsed.
  useEffect(() => {
    prefetchDataset();
  }, []);

  return <LangContext.Provider value={{ lang: SITE_LANG }}>{children}</LangContext.Provider>;
}
