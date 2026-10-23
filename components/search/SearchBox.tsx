"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLang } from "@/lib/i18n/context";
import { componentsDict } from "@/lib/i18n/dict.components";

interface Props {
  variant?: "header" | "hero";
  autoFocus?: boolean;
}

/**
 * Site-wide search entry point. Submits to /search?q=..., which queries the
 * API data layer across events, papers, topics, models and benchmarks.
 */
export function SearchBox({ variant = "header", autoFocus }: Props) {
  const router = useRouter();
  const { lang } = useLang();
  const c = componentsDict[lang];
  const [q, setQ] = useState("");
  const isHero = variant === "hero";

  function submit(value?: string) {
    const query = (value ?? q).trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  if (isHero) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="w-full"
      >
        <div className="flex items-center gap-2 rounded-lg border border-ink-300 bg-white px-3 py-2.5 shadow-sm focus-within:border-accent-500 focus-within:ring-2 focus-within:ring-accent-100">
          <SearchIcon />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={c.search.heroPlaceholder}
            aria-label={c.search.heroAria}
            className="w-full bg-transparent text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none"
            autoFocus={autoFocus}
          />
          <button type="submit" className="btn-primary shrink-0">
            {c.search.submit}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="hidden sm:flex items-center gap-1.5 rounded-md border border-ink-200 bg-ink-50 px-2.5 py-1.5 focus-within:border-accent-400 focus-within:bg-white"
      role="search"
    >
      <SearchIcon />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={c.search.headerPlaceholder}
        aria-label={c.search.headerAria}
        className="w-32 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none lg:w-44"
      />
      <kbd
        title={c.search.kbdHint}
        className="hidden lg:block rounded border border-ink-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-ink-500"
      >
        ⏎
      </kbd>
    </form>
  );
}

function SearchIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-ink-400"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
