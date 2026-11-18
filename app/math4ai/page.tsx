import { Suspense } from "react";
import { LatestFeed } from "@/components/feed/LatestFeed";
import { PageHeader } from "@/components/ui/PageHeader";
import { Math4AIOverview } from "@/components/math4ai/Math4AIOverview";
import { getStore } from "@/lib/db";
import { getLang } from "@/lib/i18n/server";
import { pagesDict } from "@/lib/i18n/dict.pages";

/**
 * Math4AI — the direction-axis entry. Same feed as /latest, pinned to events
 * whose research object is the AI system itself (co-primary "both" included);
 * every other filter stays available inside the view. The server-rendered
 * overview uses the identical direction filter so its counts match the feed.
 */
export async function generateMetadata() {
  const m = pagesDict[getLang()].meta.math4ai;
  return { title: m.title, description: m.desc };
}

export default async function Math4AiPage() {
  const lang = getLang();
  const p = pagesDict[lang];
  const all = await getStore().listEvents();
  const math4aiEvents = all.filter((e) => e.direction === "math4ai" || e.direction === "both");

  return (
    <div className="container-page py-10 sm:py-12">
      <PageHeader label={p.math4ai.label} title={p.math4ai.title} description={p.math4ai.sub} />

      <Math4AIOverview events={math4aiEvents} lang={lang} labels={p.math4ai.overview} />

      <section id="math4ai-events" className="scroll-mt-24 border-t border-ink-200 pt-8">
        <div className="mb-6 max-w-3xl">
          <div className="mono-label mb-2">{p.math4ai.feedEyebrow}</div>
          <h2 className="h-section">{p.math4ai.feedTitle}</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-600">{p.math4ai.feedIntro}</p>
        </div>
        <Suspense fallback={<div className="h-24" />}>
          <LatestFeed presetDirection="math4ai" />
        </Suspense>
      </section>
    </div>
  );
}
