import fs from "node:fs";
import path from "node:path";
import { SeedStore } from "@/lib/db/seedStore";
import { buildTopicStats } from "@/lib/db/shared";
import { localizeEvents } from "@/lib/i18n/localize";
import { facetsOf } from "@/lib/dimensions";
import { toListEvent } from "@/lib/staticData";
import { publishedEventIdBySlug, trackingSummaryBySlug } from "@/lib/tracking";
import { computeSourceStats } from "@/lib/sourceStats";
import type { Lang } from "@/lib/i18n/dict";
import type { StaticDataset } from "@/types";

/**
 * Write the client dataset for both languages.
 *
 * A static export cannot answer a query, so every list surface (feed,
 * timeline, topic archive, search) filters this one file in the browser.
 */
const OUT_DIR = path.join(process.cwd(), "public", "data");

export interface DatasetSummary {
  lang: Lang;
  events: number;
  topics: number;
  kb: number;
}

export async function writeStaticData(): Promise<DatasetSummary[]> {
  const events = await new SeedStore().listEvents();
  if (events.length === 0) {
    console.warn("[data] no events found — public/data will be empty");
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const eventIds = publishedEventIdBySlug(events);
  const summaries = trackingSummaryBySlug(events);
  return (["zh", "en"] as const satisfies readonly Lang[]).map((lang) => {
    const localized = localizeEvents(events, lang);
    const dataset: StaticDataset = {
      generatedAt: new Date().toISOString(),
      events: localized.map((event, i) =>
        toListEvent(
          event,
          eventIds.get(event.slug),
          facetsOf(events[i]),
          summaries.get(event.slug)!
        )
      ),
      topics: buildTopicStats(localized),
      sourceStats: computeSourceStats(events),
    };
    const file = path.join(OUT_DIR, `${lang}.json`);
    fs.writeFileSync(file, JSON.stringify(dataset), "utf8");
    return {
      lang,
      events: dataset.events.length,
      topics: dataset.topics.length,
      kb: Math.round(fs.statSync(file).size / 1024),
    };
  });
}
