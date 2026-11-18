"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/context";

export function Footer() {
  const { t } = useT();

  const groups = [
    {
      title: t.footer.explore,
      links: [
        { href: "/latest", label: t.footer.latest },
        { href: "/timeline", label: t.footer.timeline },
        { href: "/graph", label: t.nav.graph },
      ],
    },
    {
      title: t.footer.topics,
      links: [
        { href: "/math-archive", label: t.nav.tasks },
        { href: "/math4ai", label: t.nav.math4ai },
      ],
    },
    {
      title: t.footer.site,
      links: [
        { href: "/about", label: t.footer.about },
        { href: "/methodology", label: t.footer.methodology },
        { href: "/about#sources", label: t.footer.sources },
      ],
    },
  ];

  return (
    <footer className="mt-16 border-t border-ink-200 bg-white">
      <div className="container-page py-10 text-sm text-ink-600">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-[13px] font-semibold text-ink-900">{t.nav.brand}</div>
            <p className="max-w-prose text-[13px] leading-relaxed">{t.footer.tagline}</p>
          </div>
          <div>
            <div className="mono-label mb-3">{t.footer.dataNoteTitle}</div>
            <p className="max-w-prose text-[13px] leading-relaxed">{t.footer.dataNote}</p>
          </div>
        </div>
        <div className="mt-8 grid gap-8 border-t border-ink-100 pt-8 sm:grid-cols-3">
          {groups.map((group) => (
            <div key={group.title}>
              <div className="mono-label mb-3">{group.title}</div>
              <ul className="space-y-2 text-[13px]">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link className="link-quiet" href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-ink-100 py-4">
        <div className="container-page text-xs text-ink-400">{t.footer.disclaimer}</div>
      </div>
    </footer>
  );
}
