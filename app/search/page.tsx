import { SearchBox } from "@/components/search/SearchBox";
import { SearchResults } from "@/components/search/SearchResults";
import { getLang } from "@/lib/i18n/server";
import { pagesDict } from "@/lib/i18n/dict.pages";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const m = pagesDict[getLang()].meta.search;
  return { title: m.title, description: m.desc };
}

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q?.trim() ?? "";
  const p = pagesDict[getLang()];

  return (
    <div className="container-page py-10">
      <div className="mb-6 max-w-2xl">
        <div className="mono-label mb-2">{p.search.label}</div>
        <h1 className="text-2xl font-semibold tracking-tight">{p.search.title}</h1>
        <p className="mt-2 text-sm text-ink-600">
          {p.search.subA}{" "}
          <span className="font-mono text-xs text-ink-800">GET /api/search</span>
          {p.search.subB}
        </p>
      </div>

      <div className="max-w-2xl">
        <SearchBox variant="hero" />
      </div>

      <div className="mt-8 max-w-3xl">
        <SearchResults query={query} />
      </div>
    </div>
  );
}
