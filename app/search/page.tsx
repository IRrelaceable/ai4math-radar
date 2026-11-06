import { Suspense } from "react";
import { SearchPageBox } from "@/components/search/SearchPageBox";
import { SearchResults } from "@/components/search/SearchResults";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLang } from "@/lib/i18n/server";
import { pagesDict } from "@/lib/i18n/dict.pages";

export async function generateMetadata() {
  const m = pagesDict[getLang()].meta.search;
  return { title: m.title, description: m.desc };
}

export default function SearchPage() {
  const p = pagesDict[getLang()];

  return (
    <div className="container-page py-10">
      <PageHeader label={p.search.label} title={p.search.title} description={p.search.sub} />

      <div className="max-w-2xl">
        <Suspense fallback={<div className="h-[52px]" />}>
          <SearchPageBox />
        </Suspense>
      </div>

      <div className="mt-8 max-w-3xl">
        <Suspense fallback={<div className="h-24" />}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}
