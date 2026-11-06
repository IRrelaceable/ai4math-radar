import type { EventZh } from "./types";
import { eventsPart1 } from "./events.part1";
import { eventsPart2 } from "./events.part2";
import { eventsPart3 } from "./events.part3";
import { eventsPart4 } from "./events.part4";
import { eventsPart5 } from "./events.part5";
import { eventsPart6 } from "./events.part6";
import { eventsPart7 } from "./events.part7";
import { eventsPart8 } from "./events.part8";
import { CURATED_AI_ROLES } from "../seed/ai-roles";

/**
 * Chinese prose for AI attribution extracted into the generated overlay
 * (data/seed/ai-roles.ts). Only the two role keys live there, so each entry
 * falls back to the translated parts above for every other field.
 */
const AI_ROLE_ZH: Record<string, EventZh> = Object.fromEntries(
  Object.entries(CURATED_AI_ROLES)
    .filter(([, role]) => role.zh?.description || role.zh?.humanContribution)
    .map(([slug, role]) => [
      slug,
      {
        aiRoleDescription: role.zh?.description,
        humanContribution: role.zh?.humanContribution,
      },
    ])
);

/**
 * Merged slug-keyed Chinese prose overlay for research events.
 *
 * English is the source of truth; these translations are a display layer.
 * A slug missing here (e.g. a freshly ingested event) simply renders English.
 */
const PROSE_ZH: Record<string, EventZh> = {
  ...eventsPart1,
  ...eventsPart2,
  ...eventsPart3,
  ...eventsPart4,
  ...eventsPart5,
  ...eventsPart6,
  ...eventsPart7,
  ...eventsPart8,
};

// Merge per slug: a role-only entry must not replace that slug's prose.
export const EVENT_ZH: Record<string, EventZh> = {
  ...PROSE_ZH,
  ...Object.fromEntries(
    Object.entries(AI_ROLE_ZH).map(([slug, role]) => [
      slug,
      { ...PROSE_ZH[slug], ...role },
    ])
  ),
};
