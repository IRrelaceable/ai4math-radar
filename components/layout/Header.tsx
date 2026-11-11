"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchBox } from "@/components/search/SearchBox";
import { LangToggle } from "@/components/layout/LangToggle";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { useT } from "@/lib/i18n/context";
import { sitePathOf } from "@/lib/site";

export function Header() {
  // With `trailingSlash` every route ends in "/", and in the English build the
  // pathname may also carry the base path; both are normalized away so the
  // active item is the same page in either build.
  const pathname = sitePathOf(usePathname()).replace(/\/+$/, "") || "/";
  const { t } = useT();

  // Methodology and data sources stay reachable from the footer; the bar
  // itself carries only the section-level routes.
  const NAV = [
    { href: "/latest", label: t.nav.latest },
    { href: "/timeline", label: t.nav.timeline },
    { href: "/topics", label: t.nav.topics },
    { href: "/labs", label: t.nav.labs },
    { href: "/math4ai", label: t.nav.math4ai },
    { href: "/about", label: t.nav.about },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4 sm:gap-6">
        <Link
          href="/"
          prefetch
          aria-label={t.nav.brand}
          className="flex min-w-0 shrink-0 items-center gap-2.5"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink-900 font-mono text-sm text-white">
            ∑
          </span>
          {/* Phones show only the wordmark; the descriptive half of the name
              would push the search/lang/menu cluster past a 360px viewport. */}
          <span className="truncate text-[15px] font-semibold tracking-tight text-ink-900 sm:hidden">
            {t.nav.brandShort}
          </span>
          <span className="hidden max-w-[11rem] truncate text-[15px] font-semibold tracking-tight text-ink-900 sm:inline sm:max-w-none">
            {t.nav.brand}
          </span>
        </Link>

        {/* Active state is an underline anchored to the header rule, not a
            filled chip — one less rounded box competing with the content. */}
        <nav className="hidden min-w-0 flex-1 self-stretch items-center lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={`flex h-full items-center border-b-2 px-2 text-[13px] transition-colors ${
                isActive(item.href)
                  ? "border-accent-600 font-medium text-ink-900"
                  : "border-transparent text-ink-500 hover:text-ink-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
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
          <MobileMenu items={NAV} />
        </div>
      </div>
    </header>
  );
}
