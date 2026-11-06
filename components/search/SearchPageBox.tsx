"use client";

import { useSearchParams } from "next/navigation";
import { SearchBox } from "./SearchBox";

/** Hero search on /search, seeded from ?q= so the query survives a reload. */
export function SearchPageBox() {
  const q = useSearchParams().get("q") ?? "";
  return <SearchBox variant="hero" initialQuery={q} key={q} />;
}
