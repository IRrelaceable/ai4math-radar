import { Suspense } from "react";
import { TimelineFeed } from "@/components/feed/TimelineFeed";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLang, t } from "@/lib/i18n/server";
import { pagesDict } from "@/lib/i18n/dict.pages";

export async function generateMetadata() {
  const m = pagesDict[getLang()].meta.timeline;
  return { title: m.title, description: m.desc };
}

export default function TimelinePage() {
  const p = pagesDict[getLang()];

  return (
    <div className="container-page py-10">
      <PageHeader title={t().nav.timeline} description={p.timeline.sub} />

      <div className="mt-2">
        <Suspense fallback={<div className="h-24" />}>
          <TimelineFeed />
        </Suspense>
      </div>
    </div>
  );
}
