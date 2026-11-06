import fs from "node:fs";
import path from "node:path";
import type { ResearchSource } from "./index";
import { EVENT_TYPES, RESEARCH_AREAS, SOURCE_TIERS } from "@/types";
import type { SourceType } from "@/types";
import type { SourceDefinition } from "./catalog";
import { createRssSource } from "./rss";
import { createPageSource } from "./page";

export const CUSTOM_SOURCE_FILE = path.join(
  process.cwd(),
  "data",
  "ingested",
  "custom-sources.json"
);

const SOURCE_TYPES: readonly SourceType[] = [
  "arxiv",
  "blog",
  "conference",
  "github",
  "demo",
  "news",
  "funding",
  "education",
  "policy",
];

function assertOneOf<T extends string>(
  field: string,
  value: unknown,
  allowed: readonly T[]
): asserts value is T {
  if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) {
    throw new Error(`${field} must be one of: ${allowed.join(", ")}`);
  }
}
export type CustomSourceInput = Pick<
  SourceDefinition,
  "id" | "label" | "mode" | "url" | "sourceType" | "sourceTier"
> &
  Partial<Pick<SourceDefinition, "defaultEventType" | "defaultResearchArea" | "allowNonAI4Math">>;

export function readCustomSources(): SourceDefinition[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(CUSTOM_SOURCE_FILE, "utf8")) as unknown;
    return Array.isArray(parsed) ? (parsed as SourceDefinition[]) : [];
  } catch {
    return [];
  }
}

export function registerCustomSource(input: CustomSourceInput): SourceDefinition {
  if (typeof input.id !== "string" || !/^[a-z0-9][a-z0-9-]{1,63}$/.test(input.id)) {
    throw new Error("source id must be a lowercase slug");
  }
  if (typeof input.label !== "string" || !input.label.trim()) {
    throw new Error("source label is required");
  }
  assertOneOf("sourceType", input.sourceType, SOURCE_TYPES);
  assertOneOf("sourceTier", input.sourceTier, SOURCE_TIERS);
  if (input.defaultEventType !== undefined) {
    assertOneOf("defaultEventType", input.defaultEventType, EVENT_TYPES);
  }
  if (input.defaultResearchArea !== undefined) {
    assertOneOf("defaultResearchArea", input.defaultResearchArea, RESEARCH_AREAS);
  }
  if (input.allowNonAI4Math !== undefined && typeof input.allowNonAI4Math !== "boolean") {
    throw new Error("allowNonAI4Math must be a boolean");
  }
  let url: URL;
  try {
    url = new URL(input.url);
  } catch {
    throw new Error("source url must be a valid http(s) URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("source url must be http(s)");
  }
  assertOneOf("mode", input.mode, ["rss", "page"] as const);

  const existing = readCustomSources();
  const next: SourceDefinition = { ...input, url: url.toString() };
  const index = existing.findIndex((source) => source.id === input.id);
  if (index >= 0) existing[index] = next;
  else existing.push(next);

  fs.mkdirSync(path.dirname(CUSTOM_SOURCE_FILE), { recursive: true });
  fs.writeFileSync(CUSTOM_SOURCE_FILE, JSON.stringify(existing, null, 2), "utf8");
  return next;
}

export function createCustomSources(): ResearchSource[] {
  return readCustomSources().map((definition) =>
    definition.mode === "rss"
      ? createRssSource({
          id: definition.id,
          label: definition.label,
          feedUrl: definition.url,
          sourceType: definition.sourceType,
          defaultEventType: definition.defaultEventType,
          defaultResearchArea: definition.defaultResearchArea,
          sourceTier: definition.sourceTier,
          allowNonAI4Math: definition.allowNonAI4Math,
        })
      : createPageSource({
          id: definition.id,
          label: definition.label,
          url: definition.url,
          sourceType: definition.sourceType,
          defaultEventType: definition.defaultEventType,
          defaultResearchArea: definition.defaultResearchArea,
          sourceTier: definition.sourceTier,
          allowNonAI4Math: definition.allowNonAI4Math,
        })
  );
}

