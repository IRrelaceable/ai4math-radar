import { SeedStore } from "./seedStore";
import type { ResearchStore } from "./store";

export type { ListEventsOptions, ResearchStore, TopicDetail } from "./store";
export { SeedStore } from "./seedStore";
export { PrismaStore } from "./prismaStore";
export { buildTopicStats, searchEvents } from "./shared";

const globalStore = globalThis as unknown as { __ai4mathPrismaStore?: ResearchStore };

/**
 * Single entry point used by pages and API routes.
 *
 * Data source selection (the "front-end -> API -> data layer -> ResearchEvent"
 * main line of the project):
 *
 *   DATABASE_URL set   -> PrismaStore   (PostgreSQL, requires `prisma db push` + `db:seed`)
 *   DATABASE_URL unset -> SeedStore     (bundled demo dataset, zero configuration)
 *
 * The Prisma client is cached (it owns connections); the seed store is created
 * per request so edits to data/seed/events.ts show up immediately in dev.
 */
export function getStore(): ResearchStore {
  if (process.env.DATABASE_URL) return getPrismaStore();
  return new SeedStore();
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
