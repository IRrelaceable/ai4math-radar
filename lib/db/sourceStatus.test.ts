import { describe, expect, it } from "vitest";
import {
  BACKOFF_BASE_MS,
  BACKOFF_MAX_MS,
  backoffMs,
  nextFailureCount,
} from "./sourceStatus";

describe("source failure backoff", () => {
  it("does not delay a healthy source", () => {
    expect(backoffMs(0)).toBe(0);
    expect(backoffMs(-1)).toBe(0);
  });

  it("doubles the cooldown for each consecutive failure", () => {
    expect(backoffMs(1)).toBe(BACKOFF_BASE_MS);
    expect(backoffMs(2)).toBe(BACKOFF_BASE_MS * 2);
    expect(backoffMs(3)).toBe(BACKOFF_BASE_MS * 4);
  });

  it("caps the cooldown so a broken source is still retried", () => {
    expect(backoffMs(4)).toBe(BACKOFF_MAX_MS);
    expect(backoffMs(20)).toBe(BACKOFF_MAX_MS);
  });
});

describe("consecutive failure bookkeeping", () => {
  it("increments on error, clears on success and preserves on idle", () => {
    expect(nextFailureCount("error", undefined)).toBe(1);
    expect(nextFailureCount("error", 2)).toBe(3);
    expect(nextFailureCount("success", 3)).toBe(0);
    expect(nextFailureCount("idle", 2)).toBe(2);
  });
});
