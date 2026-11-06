import { loadSourceOverview } from "@/lib/db/sourceStatus";
import { SourceBoards } from "@/components/sources/SourceBoards";
import { BackToTop } from "@/components/ui/BackToTop";
import { getLang, t } from "@/lib/i18n/server";
import { pagesDict } from "@/lib/i18n/dict.pages";

export async function generateMetadata() {
  const m = pagesDict[getLang()].meta.sources;
  return { title: m.title, description: m.desc };
}

export default function SourcesPage() {
  const { boards } = loadSourceOverview();
  const lang = getLang();

  return (
    <div className="container-page py-10">
      <SourceBoards boards={boards} labels={pagesDict[lang].sources} />
      <BackToTop label={t(lang).common.backToTop} />
    </div>
  );
}
