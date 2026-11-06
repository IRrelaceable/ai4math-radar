"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useT } from "@/lib/i18n/context";

/**
 * The research map merged into /topics. A static export cannot answer a
 * redirect, so old links land here and are forwarded client-side.
 */
export default function ResearchMapPage() {
  const router = useRouter();
  const { t } = useT();

  useEffect(() => {
    router.replace("/topics");
  }, [router]);

  return (
    <div className="container-page py-16 text-sm text-ink-500">
      <Link href="/topics" className="link-quiet">
        {t.nav.topics} →
      </Link>
    </div>
  );
}
