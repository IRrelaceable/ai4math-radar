"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLang } from "@/lib/i18n/context";
import { pagesDict } from "@/lib/i18n/dict.pages";

/**
 * Compatibility entry for the old /sources route. The standalone page was
 * folded into About as its "Data sources" section; keeping a
 * client-side redirect avoids dead inbound links from the published build and
 * from search results. The static fallback below works without JavaScript.
 */
export default function SourcesRedirectPage() {
  const router = useRouter();
  const { lang } = useLang();
  const s = pagesDict[lang].sources;

  useEffect(() => {
    router.replace("/about#sources");
  }, [router]);

  return (
    <div className="container-page py-20">
      <div className="mono-label">/sources</div>
      <h1 className="h-section mt-2">{s.movedTitle}</h1>
      <p className="lede mt-3 max-w-xl">{s.movedBody}</p>
      <Link href="/about#sources" className="link-quiet mt-4 inline-block text-sm">
        {s.movedLink}
      </Link>
    </div>
  );
}
