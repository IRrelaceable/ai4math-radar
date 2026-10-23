import type { EventZh } from "./types";
import { eventsPart1 } from "./events.part1";
import { eventsPart2 } from "./events.part2";
import { eventsPart3 } from "./events.part3";
import { eventsPart4 } from "./events.part4";
import { eventsPart5 } from "./events.part5";
import { eventsPart6 } from "./events.part6";

/**
 * Merged slug-keyed Chinese prose overlay for research events.
 *
 * English is the source of truth; these translations are a display layer.
 * A slug missing here (e.g. a freshly ingested event) simply renders English.
 */
export const EVENT_ZH: Record<string, EventZh> = {
  ...eventsPart1,
  ...eventsPart2,
  ...eventsPart3,
  ...eventsPart4,
  ...eventsPart5,
  ...eventsPart6,
};
