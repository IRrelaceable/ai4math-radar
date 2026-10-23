"use client";

import { useLang, useSetLang } from "@/lib/i18n/context";

/** 中文 / EN switch. Sets the `lang` cookie and refreshes server-rendered text. */
export function LangToggle() {
  const { lang } = useLang();
  const setLang = useSetLang();

  return (
    <div
      className="inline-flex items-center rounded-md border border-ink-200 p-0.5"
      role="group"
      aria-label="Language"
    >
      {(["zh", "en"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setLang(value)}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            lang === value ? "bg-ink-900 text-white" : "text-ink-600 hover:text-ink-900"
          }`}
        >
          {value === "zh" ? "中文" : "EN"}
        </button>
      ))}
    </div>
  );
}
