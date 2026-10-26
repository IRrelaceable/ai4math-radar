"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/context";

export function Footer() {
  const { t } = useT();

  return (
    <footer className="mt-16 border-t border-ink-200 bg-ink-50">
      <div className="container-page grid gap-6 py-8 text-sm text-ink-600 sm:grid-cols-3">
        <div>
          <div className="mb-2 text-[13px] font-semibold text-ink-900">{t.nav.brand}</div>
          <p className="leading-relaxed">{t.footer.tagline}</p>
        </div>
        <div>
          <div className="mono-label mb-2">{t.footer.navigate}</div>
          <ul className="space-y-1.5">
            <li><Link className="link-quiet" href="/latest">{t.footer.latest}</Link></li>
            <li><Link className="link-quiet" href="/timeline">{t.footer.timeline}</Link></li>
            <li><Link className="link-quiet" href="/topics">{t.footer.topics}</Link></li>
            <li><Link className="link-quiet" href="/sources">{t.footer.sources}</Link></li>
            <li><Link className="link-quiet" href="/methodology">{t.footer.methodology}</Link></li>
            <li><Link className="link-quiet" href="/about">{t.footer.about}</Link></li>
          </ul>
        </div>
        <div>
          <div className="mono-label mb-2">{t.footer.dataNoteTitle}</div>
          <p className="leading-relaxed">{t.footer.dataNote}</p>
        </div>
      </div>
      <div className="border-t border-ink-200 py-4">
        <div className="container-page text-xs text-ink-500">{t.footer.disclaimer}</div>
      </div>
    </footer>
  );
}

