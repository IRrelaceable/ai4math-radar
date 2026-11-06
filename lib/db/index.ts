import { events } from "@/data/seed/events";
import { ingestedFileMtimeMs } from "./ingested";
import { SeedStore } from "./seedStore";
import type { ResearchStore } from "./store";

export type { ListEventsOptions, ResearchStore, TopicDetail } from "./store";
export { SeedStore } from "./seedStore";
export { PrismaStore } from "./prismaStore";
export { buildTopicStats, searchEvents } from "./shared";

const globalStore = globalThis as unknown as {
  __ai4mathPrismaStore?: ResearchStore;
  __ai4mathSeedStore?: { seed: unknown; mtime: number; store: ResearchStore };
};

/**
 * Single entry point used by pages and API routes.
 *
 * Data source selection (the "front-end -> API -> data layer -> ResearchEvent"
 * main line of the project):
 *
 *   DATABASE_URL set   -> PrismaStore   (PostgreSQL, requires `prisma db push` + `db:seed`)
 *   DATABASE_URL unset -> SeedStore     (bundled dataset + ingested cache, zero configuration)
 *
 * Both stores are cached on globalThis: rebuilding the seed store re-merges and
 * re-validates hundreds of events on every call, which showed up as jank when
 * switching pages. The cache is keyed by the ingested file's mtime and the seed
 * array identity, so a sync (`npm run sync`) or an HMR edit still takes effect.
 */
export function getStore(): ResearchStore {
  if (process.env.DATABASE_URL) return getPrismaStore();
  return getSeedStore();
}

function getSeedStore(): ResearchStore {
  const mtime = ingestedFileMtimeMs();
  const cached = globalStore.__ai4mathSeedStore;
  if (cached && cached.seed === events && cached.mtime === mtime) return cached.store;
  const store = new SeedStore(events);
  globalStore.__ai4mathSeedStore = { seed: events, mtime, store };
  return store;
}

function getPrismaStore(): ResearchStore {
  if (globalStore.__ai4mathPrismaStore) return globalStore.__ai4mathPrismaStore;
  try {
    // Lazy require: keeps the build working before `prisma generate` has run.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient } = require("@prisma/client") as { PrismaClient: new () => unknown };
    const { PrismaStore } = require("./prismaStore") as {
      PrismaStore: new (c: unknown) => ResearchStore;
    };
    const store = new PrismaStore(new (PrismaClient as new () => unknown)());
    globalStore.__ai4mathPrismaStore = store;
    return store;
  } catch (error) {
    console.warn(
      "[ai4math] DATABASE_URL is set but the Prisma client could not be loaded; " +
        "falling back to the bundled demo store. Run `npx prisma generate`.",
      error
    );
    return new SeedStore();
  }
}
