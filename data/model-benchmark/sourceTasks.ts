import { LAB_ARCHIVE, type LabArchiveRecord } from "@/data/lab-archive/records";

/**
 * Mathematical task source cases involving OpenAI or Anthropic in the
 * supplied 52-entry timeline, including two independent evaluations.
 * These are source records, not distinct tasks or completed experiments.
 * The exclusions are method-only releases, collection-level umbrellas,
 * corrections, funding and independent commentary rather than a task result.
 */
const EXCLUDED = new Set([8, 32, 42, 44, 50]);
const DETAILED = new Set([1, 2, 3, 26, 38]);
const INDEPENDENT_EVALUATIONS = new Set([28, 51]);

export const FOREIGN_TASK_CASES: LabArchiveRecord[] = LAB_ARCHIVE
  .filter((record) => record.n <= 52)
  .filter((record) =>
    record.track === "openai" ||
    record.track === "anthropic" ||
    INDEPENDENT_EVALUATIONS.has(record.n)
  )
  .filter((record) => !EXCLUDED.has(record.n))
  .sort((a, b) => b.date.localeCompare(a.date) || a.n - b.n);

/** The five detailed task cards cover these source cases in the unified list. */
export const ADDITIONAL_TASK_CASES = FOREIGN_TASK_CASES.filter(
  (record) => !DETAILED.has(record.n)
);
