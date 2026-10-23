import path from "node:path";
import { defineConfig } from "vitest/config";

/** Unit tests for pure logic: lib utilities, trust model and seed-data invariants. */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "data/**/*.test.ts"],
  },
});
