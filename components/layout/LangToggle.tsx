"use client";

import { usePathname } from "next/navigation";
import { useLang, useT } from "@/lib/i18n/context";
import { SITE_BASE, sitePathOf } from "@/lib/site";

/**
 * 中文 / EN switch.
 *
 * Each language is its own static export (Chinese at the site root, English
 * under /en), so switching is a plain link to the same page in the other
 * build rather than a cookie change.
 */
export function LangToggle() {
  const { lang } = useLang();
  const label = useT().t.common.language;
  const path = sitePathOf(usePathname()) || "/";
  // `npm run dev` and `npm run dev:en` are two servers, so in development the
  // other language lives on its own origin; production serves both from one.
  const dev = process.env.NODE_ENV === "development";
  const zhHref = dev ? `http://localhost:3000${path}` : `${SITE_BASE}${path}`;
  const enHref = dev ? `http://localhost:3001/en${path}` : `${SITE_BASE}/en${path}`;

  return (
    <div
      className="inline-flex items-center rounded-md border border-ink-200 p-0.5"
      role="group"
      aria-label={label}
    >
      {(["zh", "en"] as const).map((value) =>
        lang === value ? (
          <span
            key={value}
            aria-current="true"
            className="rounded bg-ink-900 px-2 py-1 text-xs font-medium text-white"
          >
            {value === "zh" ? "中文" : "EN"}
          </span>
        ) : (
          <a
            key={value}
            href={value === "zh" ? zhHref : enHref}
            hrefLang={value === "zh" ? "zh-CN" : "en"}
            className="rounded px-2 py-1 text-xs font-medium text-ink-600 transition-colors hover:text-ink-900"
          >
            {value === "zh" ? "中文" : "EN"}
          </a>
        )
      )}
    </div>
  );
}
