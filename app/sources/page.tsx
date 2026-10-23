import { loadSourceOverview } from "@/lib/db/sourceStatus";
import { SourceSyncPanel } from "@/components/sources/SourceSyncPanel";
import { getLang } from "@/lib/i18n/server";
import { pagesDict } from "@/lib/i18n/dict.pages";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const m = pagesDict[getLang()].meta.sources;
  return { title: m.title, description: m.desc };
}

export default async function SourcesPage() {
  const { sources, pending } = await loadSourceOverview();

  return (
    <div className="container-page py-10">
      <SourceSyncPanel
        initialSources={sources}
        pending={pending}
        labels={pagesDict[getLang()].sources}
      />
    </div>
  );
}
