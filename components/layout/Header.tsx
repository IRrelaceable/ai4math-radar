"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchBox } from "@/components/search/SearchBox";
import { LangToggle } from "@/components/layout/LangToggle";
import { useT } from "@/lib/i18n/context";

export function Header() {
  const pathname = usePathname();
  const { t } = useT();

  const NAV = [
    { href: "/latest", label: t.nav.latest },
    { href: "/timeline", label: t.nav.timeline },
    { href: "/topics", label: t.nav.topics },
    { href: "/research-map", label: t.nav.map },
    { href: "/about", label: t.nav.about },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-14 items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-ink-900 font-mono text-sm text-white">
            ∑
          </span>
          <span className="text-[15px] font-semibold tracking-tight">{t.nav.brand}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-ink-100 font-medium text-ink-900"
                    : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <SearchBox variant="header" />
          <LangToggle />
          <details className="md:hidden relative">
            <summary className="list-none cursor-pointer rounded-md border border-ink-200 px-2.5 py-1.5 text-sm text-ink-700">
              {t.nav.menu}
            </summary>
            <div className="absolute right-0 top-10 w-44 rounded-lg border border-ink-200 bg-white p-1.5 shadow-lg">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
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
