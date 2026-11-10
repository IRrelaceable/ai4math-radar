"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchBox } from "@/components/search/SearchBox";
import { LangToggle } from "@/components/layout/LangToggle";
import { useT } from "@/lib/i18n/context";
import { sitePathOf } from "@/lib/site";

export function Header() {
  // With `trailingSlash` every route ends in "/", and in the English build the
  // pathname may also carry the base path; both are normalized away so the
  // active item is the same page in either build.
  const pathname = sitePathOf(usePathname()).replace(/\/+$/, "") || "/";
  const { t } = useT();

  const NAV = [
    { href: "/latest", label: t.nav.latest },
    { href: "/timeline", label: t.nav.timeline },
    { href: "/topics", label: t.nav.topics },
    { href: "/math4ai", label: t.nav.math4ai },
    { href: "/about", label: t.nav.about },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4 sm:gap-6">
        <Link href="/" prefetch className="flex min-w-0 items-center gap-2.5 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink-900 font-mono text-sm text-white">
            ∑
          </span>
          <span className="max-w-[11rem] truncate text-[15px] font-semibold tracking-tight text-ink-900 sm:max-w-none">
            {t.nav.brand}
          </span>
        </Link>

        {/* Active state is an underline anchored to the header rule, not a
            filled chip — one less rounded box competing with the content. */}
        <nav className="hidden lg:flex min-w-0 flex-1 self-stretch items-center gap-1 overflow-hidden">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={`flex h-full items-center border-b-2 px-3 text-[13px] transition-colors ${
                  active
                    ? "border-accent-600 font-medium text-ink-900"
                    : "border-transparent text-ink-500 hover:text-ink-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <Link
            href="/search"
            aria-label={t.nav.search}
            title={t.nav.search}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-200 text-ink-600 hover:bg-ink-50 hover:text-ink-900 sm:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>
          <SearchBox variant="header" />
          <LangToggle />
          <details className="lg:hidden relative">
            <summary className="list-none cursor-pointer rounded-md border border-ink-200 px-2.5 py-1.5 text-sm text-ink-700">
              {t.nav.menu}
            </summary>
            <div className="absolute right-0 top-10 w-44 rounded-md border border-ink-200 bg-white p-1.5 shadow-lg">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  className="block rounded px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
