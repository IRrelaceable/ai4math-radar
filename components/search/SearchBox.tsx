"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n/context";
import { componentsDict } from "@/lib/i18n/dict.components";

interface Props {
  variant?: "header" | "hero";
  autoFocus?: boolean;
  initialQuery?: string;
}

/**
 * Site-wide search entry point. Submits to /search?q=..., which queries the
 * static dataset across events, papers, topics, models and benchmarks.
 */
export function SearchBox({ variant = "header", autoFocus, initialQuery = "" }: Props) {
  const router = useRouter();
  const { lang } = useLang();
  const c = componentsDict[lang];
  const [q, setQ] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const isHero = variant === "hero";

  // Pressing "/" anywhere focuses the header search, the convention most
  // documentation sites use. Skip when the user is already typing somewhere.
  useEffect(() => {
    if (isHero) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isHero]);

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
        ref={inputRef}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={c.search.headerPlaceholder}
        aria-label={c.search.headerAria}
        className="w-32 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none lg:w-40"
      />
      <kbd
        title={c.search.kbdHint}
        className="hidden xl:block rounded border border-ink-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-ink-500"
      >
        /
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
