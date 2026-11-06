import Link from "next/link";
import { fill, type PagesDict } from "@/lib/i18n/dict.pages";

/**
 * Shared list pager. Server-rendered so long lists (feed, topic archive) can be
 * split without shipping the whole set in one navigation payload.
 */
export function Pager({
  page,
  totalPages,
  hrefFor,
  labels,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  labels: PagesDict["pager"];
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="mt-8 flex items-center justify-between gap-3 border-t border-ink-100 pt-5"
      aria-label={labels.pagination}
    >
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className="btn-ghost">
          ← {labels.prev}
        </Link>
      ) : (
        <span aria-disabled="true" className="btn-ghost pointer-events-none opacity-40">
          ← {labels.prev}
        </span>
      )}
      <span className="font-mono text-xs text-ink-500">
        {fill(labels.pageOf, { page, total: totalPages })}
      </span>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className="btn-ghost">
          {labels.next} →
        </Link>
      ) : (
        <span aria-disabled="true" className="btn-ghost pointer-events-none opacity-40">
          {labels.next} →
        </span>
      )}
    </nav>
  );
}
