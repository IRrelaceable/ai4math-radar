"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useT } from "@/lib/i18n/context";
import { sitePathOf } from "@/lib/site";

type NavItem = { href: string; label: string };

/**
 * Slide-in navigation drawer for small screens.
 *
 * Replaces the old inline <details> dropdown, which had no backdrop and could
 * be dismissed only by tapping the summary again. This version locks body
 * scroll, closes on backdrop tap, Escape, or any navigation, and is reachable
 * (role="dialog" + aria-modal) for keyboard and screen-reader users.
 */
export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = sitePathOf(usePathname()).replace(/\/+$/, "") || "/";
  const { t } = useT();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Close whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <button
        type="button"
        aria-label={t.nav.menu}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-200 text-ink-600 hover:bg-ink-50 hover:text-ink-900 lg:hidden"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {open &&
        createPortal(
          // The drawer lives at body level: the header's backdrop-filter makes
          // it a containing block for fixed children, which would clip a
          // drawer rendered inside the header down to the 64px bar.
          <div
            className="fixed inset-0 z-50 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.menu}
          >
          <div
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <nav className="absolute right-0 top-0 h-full w-72 max-w-[80vw] overflow-y-auto bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink-900">{t.nav.menu}</span>
              <button
                type="button"
                aria-label={t.nav.close}
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-ink-500 hover:bg-ink-100"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>

            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch
                    onClick={() => setOpen(false)}
                    className={`block rounded-md px-3 py-2.5 text-[15px] ${
                      isActive(item.href)
                        ? "bg-ink-100 font-medium text-ink-900"
                        : "text-ink-700 hover:bg-ink-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          </div>,
          document.body
        )}
    </>
  );
}
