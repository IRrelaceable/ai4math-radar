import { Suspense } from "react";
import { LatestFeed } from "@/components/feed/LatestFeed";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLang } from "@/lib/i18n/server";
import { pagesDict } from "@/lib/i18n/dict.pages";

export async function generateMetadata() {
  const m = pagesDict[getLang()].meta.latest;
  return { title: m.title, description: m.desc };
}

export default function LatestPage() {
  const p = pagesDict[getLang()];

  return (
    <div className="container-page py-10 sm:py-12">
      <PageHeader
        label={p.latest.label}
        title={p.latest.title}
        description={p.latest.sub}
      />

      <Suspense fallback={<div className="h-24" />}>
        <LatestFeed />
      </Suspense>
    </div>
  );
}
