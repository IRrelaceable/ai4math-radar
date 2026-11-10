import { Suspense } from "react";
import { LatestFeed } from "@/components/feed/LatestFeed";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLang } from "@/lib/i18n/server";
import { pagesDict } from "@/lib/i18n/dict.pages";

/**
 * Math4AI — the direction-axis entry. Same feed as /latest, pinned to events
 * whose research object is the AI system itself (co-primary "both" included);
 * every other filter stays available inside the view.
 */
export async function generateMetadata() {
  const m = pagesDict[getLang()].meta.math4ai;
  return { title: m.title, description: m.desc };
}

export default function Math4AiPage() {
  const p = pagesDict[getLang()];

  return (
    <div className="container-page py-10">
      <PageHeader label={p.math4ai.label} title={p.math4ai.title} description={p.math4ai.sub} />

      <Suspense fallback={<div className="h-24" />}>
        <LatestFeed presetDirection="math4ai" />
      </Suspense>
    </div>
  );
}
