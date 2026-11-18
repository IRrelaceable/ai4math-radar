"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SearchBox } from "@/components/search/SearchBox";
import { LangToggle } from "@/components/layout/LangToggle";
import { MobileMenu, type NavGroup, type NavItem } from "@/components/layout/MobileMenu";
import { useT } from "@/lib/i18n/context";
import { sitePathOf } from "@/lib/site";

export function Header() {
  // With `trailingSlash` every route ends in "/", and in the English build the
  // pathname may also carry the base path; both are normalized away so the
  // active item is the same page in either build.
  const pathname = sitePathOf(usePathname()).replace(/\/+$/, "") || "/";
  const { t } = useT();

  // Every content section — including the two curated topics — is a first-class
  // entry. Only site-information pages are grouped behind one dropdown.
  const primary: NavItem[] = [
    { href: "/latest", label: t.nav.latest },
    { href: "/timeline", label: t.nav.timeline },
    { href: "/graph", label: t.nav.graph },
    { href: "/math-archive", label: t.nav.tasks },
    { href: "/math4ai", label: t.nav.math4ai },
  ];
  const siteItems: NavItem[] = [
    { href: "/about", label: t.footer.about },
    { href: "/methodology", label: t.footer.methodology },
    { href: "/about#sources", label: t.footer.sources },
  ];
  const mobileGroups: NavGroup[] = [
    { items: primary },
    { label: t.footer.site, items: siteItems },
  ];

  const [siteOpen, setSiteOpen] = useState(false);
  const siteRef = useRef<HTMLDivElement>(null);

  // Close on navigation so the menu never lingers over the new page.
  useEffect(() => {
    setSiteOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!siteOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!siteRef.current?.contains(e.target as Node)) setSiteOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSiteOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [siteOpen]);

  const isActive = (href: string) => {
    const base = href.split("#")[0];
    return pathname === base || pathname.startsWith(`${base}/`);
  };
  const siteActive = siteItems.some((item) => isActive(item.href));

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
          {primary.map((item) => (
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

          <div ref={siteRef} className="relative flex h-full">
            <button
              type="button"
              aria-expanded={siteOpen}
              aria-controls="site-menu"
              onClick={() => setSiteOpen((open) => !open)}
              className={`flex h-full items-center gap-1 border-b-2 px-2 text-[13px] transition-colors ${
                siteOpen || siteActive
                  ? "border-accent-600 font-medium text-ink-900"
                  : "border-transparent text-ink-500 hover:text-ink-900"
              }`}
            >
              {t.footer.site}
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={`transition-transform ${siteOpen ? "rotate-180" : ""}`}
              >
                <path d="M2 4L5 7L8 4" />
              </svg>
            </button>

            {siteOpen && (
              <div
                id="site-menu"
                className="absolute left-0 top-full z-50 mt-1 w-52 rounded-lg border border-ink-200 bg-white p-1.5 shadow-lg"
              >
                {siteItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch
                    onClick={() => setSiteOpen(false)}
                    className={`block rounded-md px-3 py-2 text-[13px] transition-colors ${
                      isActive(item.href)
                        ? "bg-ink-100 font-medium text-ink-900"
                        : "text-ink-700 hover:bg-ink-50 hover:text-ink-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
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
          <MobileMenu groups={mobileGroups} />
        </div>
      </div>
    </header>
  );
}
