"use client";

import { useEffect, useState } from "react";
import type { StaticDataset } from "@/types";
import { SITE_LANG, assetUrl } from "@/lib/site";

/**
 * One fetch per browser session for the build-time dataset. The promise is
 * shared so /latest, /timeline and /search do not each download it again.
 */
let cached: StaticDataset | null = null;
let pending: Promise<StaticDataset> | null = null;

function load(): Promise<StaticDataset> {
  if (cached) return Promise.resolve(cached);
  pending ??= fetch(assetUrl(`/data/${SITE_LANG}.json`))
    .then(async (response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as StaticDataset;
      cached = data;
      return data;
    })
    .catch((error: unknown) => {
      pending = null;
      throw error;
    });
  return pending;
}

/**
 * Warm the dataset while the browser is idle so the first visit to a data-backed
 * route (/latest, /timeline, /search, a topic archive) renders immediately
 * instead of mounting a spinner first. Failures are ignored here: the hook
 * reports them on the page that actually needs the data.
 */
export function prefetchDataset(): void {
  if (cached || pending) return;
  const start = () => void load().catch(() => undefined);
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(start, { timeout: 2500 });
  } else {
    setTimeout(start, 1200);
  }
}

export function useDataset(): { data: StaticDataset | null; error: string | null } {
  const [data, setData] = useState<StaticDataset | null>(cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) return;
    let cancelled = false;
    load()
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [data]);

  return { data, error };
}
