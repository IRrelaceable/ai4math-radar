/**
 * Same-batch comparison of the legacy 4-call extraction path and the merged
 * 1-call path (agents/researchTracker/enrich.ts).
 *
 * This is a measurement tool, NOT part of the site build or the pipeline. It
 * uses the real LLM provider from .env and records ACTUAL input/output tokens
 * via the onUsage callback in lib/llm/provider.ts. No token figure is guessed.
 *
 *   npx tsx scripts/compare-enrichment.ts --limit 8 --out reports/enrichment-comparison.json
 *
 * `--limit` defaults to 8. If the endpoint does not return usage, the report
 * flags `usageReported: false` and the token figures must not be trusted.
 */
import fs from "node:fs";
import path from "node:path";
import { loadEnv } from "./env";
import {
  getLLMProvider,
  type LLMCompleteOptions,
  type LLMProvider,
  type LLMUsage,
} from "@/lib/llm/provider";
import type { EventEntities, RawResearchItem } from "@/types";
import { readIngestedEvents } from "@/lib/db/ingested";
import { classifyItem } from "@/agents/researchTracker/classifier";
import { summarize } from "@/agents/researchTracker/summarizer";
import { extractContribution } from "@/agents/researchTracker/contribution";
import { extractNamedEntities } from "@/agents/researchTracker/entities";
import { classifyDirection } from "@/agents/researchTracker/direction";
import { enrichResearchItem } from "@/agents/researchTracker/enrich";

interface PathUsage {
  calls: number;
  inputTokens: number;
  outputTokens: number;
  usageReported: boolean;
  /** Deterministic: exact characters sent, even when the API has no quota. */
  systemChars: number;
  userChars: number;
  apiErrors: number;
  quotaBlocked: boolean;
  error?: string;
}

interface FieldMatch {
  summary: boolean;
  chinese: boolean;
  aiRoleLevel: boolean | null;
  direction: boolean;
  entities: boolean;
}

interface ItemReport {
  slug: string;
  title: string;
  legacy: PathUsage;
  merged: PathUsage & { fallback: boolean };
  /** Calls actually spent by the merged path including legacy fallback. */
  mergedWorstCaseCalls: number;
  match: FieldMatch | null;
  legacyFields: {
    hasSummary: boolean;
    hasChinese: boolean;
    aiRoleLevel: string | null;
    direction: string | null;
    entities: string[];
  };
  mergedFields: {
    hasSummary: boolean;
    hasChinese: boolean;
    aiRoleLevel: string | null;
    direction: string | null;
    entities: string[];
  } | null;
}

class RecordingProvider implements LLMProvider {
  readonly id: string;
  calls = 0;
  inputTokens = 0;
  outputTokens = 0;
  usageReported = false;
  systemChars = 0;
  userChars = 0;
  apiErrors = 0;
  quotaBlocked = false;

  constructor(private readonly inner: LLMProvider) {
    // Keep the real provider id so the merged path does not take its mock shortcut.
    this.id = inner.id;
  }

  async complete(prompt: string, options?: LLMCompleteOptions): Promise<string> {
    this.calls += 1;
    this.systemChars += (options?.system ?? "").length;
    this.userChars += prompt.length;
    try {
      return await this.inner.complete(prompt, {
        ...options,
        onUsage: (usage: LLMUsage) => {
          this.inputTokens += usage.inputTokens;
          this.outputTokens += usage.outputTokens;
          if (usage.inputTokens > 0 || usage.outputTokens > 0) this.usageReported = true;
          options?.onUsage?.(usage);
        },
      });
    } catch (error) {
      this.apiErrors += 1;
      if (/429|quota/i.test(String(error))) this.quotaBlocked = true;
      throw error;
    }
  }

  snapshot(): PathUsage {
    return {
      calls: this.calls,
      inputTokens: this.inputTokens,
      outputTokens: this.outputTokens,
      usageReported: this.usageReported,
      systemChars: this.systemChars,
      userChars: this.userChars,
      apiErrors: this.apiErrors,
      quotaBlocked: this.quotaBlocked,
    };
  }
}

function flattenEntities(entities: EventEntities | undefined): string[] {
  if (!entities) return [];
  return [entities.people, entities.institutions, entities.projects, entities.systems]
    .flat()
    .filter((name): name is string => Boolean(name))
    .map((name) => name.trim().toLowerCase())
    .sort();
}

function sameSet(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function parseArgs() {
  const args = process.argv.slice(2);
  let limit = 8;
  let out = path.join(process.cwd(), "reports", "enrichment-comparison.json");
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--limit" && args[i + 1]) limit = Number(args[++i]);
    if (args[i] === "--out" && args[i + 1]) out = path.resolve(args[++i]);
  }
  return { limit: Math.max(1, Math.min(50, limit || 8)), out };
}

async function main() {
  loadEnv();
  const { limit, out } = parseArgs();
  const inner = getLLMProvider();
  if (inner.id === "mock") {
    throw new Error(
      "LLM_PROVIDER=mock cannot measure real tokens. Set a real openai-compatible provider in .env."
    );
  }

  // Deterministic sample: stable slug order, real-length abstracts, Research only.
  const items: RawResearchItem[] = readIngestedEvents()
    .filter((event) => event.eventType === "Research")
    .filter((event) => {
      const text = event.summary ?? "";
      return text.length >= 200 && text.length <= 2500;
    })
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .slice(0, limit)
    .map((event, index) => ({
      id: `compare-${index}-${event.slug}`,
      title: event.title,
      abstract: event.summary,
      source: event.sourceType ?? "unknown",
      url: event.sourceUrl,
      publishedAt: event.date,
      sourceType: event.sourceType,
    }));

  console.log(`[compare] ${items.length} items, provider=${inner.id}, model=${process.env.LLM_MODEL ?? "?"}`);
  console.warn("[compare] Each item makes up to 5 REAL LLM calls. This spends tokens.");

  const reports: ItemReport[] = [];
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const classification = classifyItem(item);
    console.log(`[compare] ${index + 1}/${items.length}: ${item.title.slice(0, 70)}`);

    // ---- Legacy path: four separate calls ----
    const legacyProvider = new RecordingProvider(inner);
    let legacyFields: ItemReport["legacyFields"] = {
      hasSummary: false,
      hasChinese: false,
      aiRoleLevel: null,
      direction: null,
      entities: [],
    };
    let legacyUsage: PathUsage;
    try {
      const text = await summarize(item, classification, legacyProvider);
      const contribution = await extractContribution(item, legacyProvider);
      const entities = await extractNamedEntities(item, legacyProvider);
      const direction = classification.researchArea
        ? await classifyDirection(
            {
              title: item.title,
              summary: text.summary,
              researchArea: classification.researchArea,
              subArea: classification.subArea,
            },
            legacyProvider
          )
        : undefined;
      legacyFields = {
        hasSummary: Boolean(text.summary),
        hasChinese: Boolean(text.titleZh && text.summaryZh),
        aiRoleLevel: contribution?.en.level ?? null,
        direction: direction ?? null,
        entities: flattenEntities(entities),
      };
      legacyUsage = legacyProvider.snapshot();
    } catch (error) {
      legacyUsage = { ...legacyProvider.snapshot(), error: String(error).slice(0, 160) };
    }

    // ---- Merged path: one call ----
    const mergedProvider = new RecordingProvider(inner);
    let merged: Awaited<ReturnType<typeof enrichResearchItem>>;
    let mergedUsage: PathUsage;
    try {
      merged = await enrichResearchItem(item, classification, mergedProvider);
      mergedUsage = mergedProvider.snapshot();
    } catch (error) {
      merged = undefined;
      mergedUsage = { ...mergedProvider.snapshot(), error: String(error).slice(0, 160) };
    }

    // ---- Worst case: merged call fails, then the legacy path runs anyway ----
    // This is the "one extra wasted call" risk the review called out. Measured
    // here rather than asserted from code, so the fallback cost is visible.
    let mergedWorstCaseCalls = mergedUsage.calls;
    if (!merged) {
      const fallbackProvider = new RecordingProvider(inner);
      try {
        const fallbackText = await summarize(item, classification, fallbackProvider);
        await extractContribution(item, fallbackProvider);
        await extractNamedEntities(item, fallbackProvider);
        if (classification.researchArea) {
          await classifyDirection(
            {
              title: item.title,
              summary: fallbackText.summary,
              researchArea: classification.researchArea,
              subArea: classification.subArea,
            },
            fallbackProvider
          );
        }
      } catch {
        // quota / provider error; snapshot still records attempted calls.
      }
      mergedWorstCaseCalls += fallbackProvider.snapshot().calls;
      mergedUsage.quotaBlocked =
        mergedUsage.quotaBlocked || fallbackProvider.snapshot().quotaBlocked;
      mergedUsage.apiErrors += fallbackProvider.snapshot().apiErrors;
    }

    const mergedFields: ItemReport["mergedFields"] = merged
      ? {
          hasSummary: Boolean(merged.summary),
          hasChinese: Boolean(merged.titleZh && merged.summaryZh),
          aiRoleLevel: merged.aiRole.level,
          direction: merged.direction ?? null,
          entities: flattenEntities(merged.entities),
        }
      : null;

    const match: FieldMatch | null = mergedFields
      ? {
          summary: mergedFields.hasSummary && legacyFields.hasSummary,
          chinese: mergedFields.hasChinese && legacyFields.hasChinese,
          // Both null = explicit "no role" on both paths, which is agreement.
          aiRoleLevel: mergedFields.aiRoleLevel === null || legacyFields.aiRoleLevel === null
            ? null
            : mergedFields.aiRoleLevel === legacyFields.aiRoleLevel,
          direction: (mergedFields.direction ?? null) === (legacyFields.direction ?? null),
          entities: sameSet(mergedFields.entities, legacyFields.entities),
        }
      : null;

    reports.push({
      slug: eventSlugOf(item.id),
      title: item.title,
      legacy: legacyUsage,
      merged: { ...mergedUsage, fallback: !merged },
      mergedWorstCaseCalls,
      match,
      legacyFields,
      mergedFields,
    });
  }

  const sum = (pick: (r: ItemReport) => number) => reports.reduce((total, r) => total + pick(r), 0);
  const legacyCalls = sum((r) => r.legacy.calls);
  const mergedCalls = sum((r) => r.merged.calls);
  const mergedWorstCaseCalls = sum((r) => r.mergedWorstCaseCalls);
  const legacyIn = sum((r) => r.legacy.inputTokens);
  const legacyOut = sum((r) => r.legacy.outputTokens);
  const mergedIn = sum((r) => r.merged.inputTokens);
  const mergedOut = sum((r) => r.merged.outputTokens);
  const fallbacks = reports.filter((r) => r.merged.fallback).length;
  const usageReported = reports.every((r) => r.legacy.usageReported && r.merged.usageReported);
  const quotaBlocked = reports.some((r) => r.legacy.quotaBlocked || r.merged.quotaBlocked);
  // A run where the API refused every call measures nothing about quality.
  const qualityMeasurable = reports.some((r) => !r.merged.fallback && !r.legacy.error && !r.merged.error);
  const legacySystemChars = sum((r) => r.legacy.systemChars);
  const mergedSystemChars = sum((r) => r.merged.systemChars);
  const legacyUserChars = sum((r) => r.legacy.userChars);
  const mergedUserChars = sum((r) => r.merged.userChars);

  const report = {
    generatedAt: new Date().toISOString(),
    provider: inner.id,
    model: process.env.LLM_MODEL ?? "unknown",
    usageReported,
    quotaBlocked,
    items: reports.length,
    totals: {
      legacy: { calls: legacyCalls, inputTokens: legacyIn, outputTokens: legacyOut },
      merged: { calls: mergedCalls, inputTokens: mergedIn, outputTokens: mergedOut },
      mergedWorstCaseCalls,
      callReduction: legacyCalls - mergedCalls,
      worstCaseCallReduction: legacyCalls - mergedWorstCaseCalls,
      tokenDelta: mergedIn + mergedOut - legacyIn - legacyOut,
      tokenDeltaPct:
        legacyIn + legacyOut > 0
          ? Math.round(((mergedIn + mergedOut - legacyIn - legacyOut) / (legacyIn + legacyOut)) * 1000) / 10
          : null,
      // Deterministic prompt bytes — evidence that does not need API quota.
      promptChars: {
        legacy: { system: legacySystemChars, user: legacyUserChars },
        merged: { system: mergedSystemChars, user: mergedUserChars },
        systemDelta: mergedSystemChars - legacySystemChars,
        userDelta: mergedUserChars - legacyUserChars,
      },
    },
    quality: {
      qualityMeasurable,
      fallbacks,
      mergedSuccess: reports.length - fallbacks,
      fieldsPresent: {
        summary: reports.filter((r) => r.match?.summary).length,
        chinese: reports.filter((r) => r.match?.chinese).length,
      },
      agreement: {
        direction: reports.filter((r) => r.match?.direction).length,
        aiRoleLevel: reports.filter((r) => r.match?.aiRoleLevel === true).length,
        aiRoleComparable: reports.filter((r) => r.match?.aiRoleLevel !== null).length,
        entities: reports.filter((r) => r.match?.entities).length,
      },
    },
    items_detail: reports,
  };

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log("\n===== RESULT =====");
  console.log(`items=${reports.length}  usageReported=${usageReported}  quotaBlocked=${quotaBlocked}`);
  console.log(`calls: legacy=${legacyCalls} merged=${mergedCalls} saved=${legacyCalls - mergedCalls} (worst case with fallback: ${mergedWorstCaseCalls}, saved ${legacyCalls - mergedWorstCaseCalls})`);
  console.log(`tokens: legacy=${legacyIn}+${legacyOut}=${legacyIn + legacyOut}  merged=${mergedIn}+${mergedOut}=${mergedIn + mergedOut}`);
  console.log(`token delta: ${report.totals.tokenDelta} (${report.totals.tokenDeltaPct}%)`);
  console.log(`prompt chars: system legacy=${legacySystemChars} merged=${mergedSystemChars} (delta ${mergedSystemChars - legacySystemChars}); user legacy=${legacyUserChars} merged=${mergedUserChars} (delta ${mergedUserChars - legacyUserChars})`);
  console.log(`fallbacks: ${fallbacks}/${reports.length}`);
  if (qualityMeasurable) {
    console.log(`agreement: direction=${report.quality.agreement.direction} aiRole=${report.quality.agreement.aiRoleLevel}/${report.quality.agreement.aiRoleComparable} entities=${report.quality.agreement.entities}`);
  } else {
    console.log("agreement: NOT MEASURABLE (no successful API calls)");
  }
  console.log(`report: ${out}`);
  if (!usageReported) {
    console.warn("[compare] WARNING: endpoint returned no usage (or quota exhausted); token figures are zero and NOT usable as evidence.");
  }
  if (quotaBlocked) {
    console.warn("[compare] QUOTA BLOCKED: top up the API account / switch endpoint, then rerun this script for real token numbers.");
  }
}

function eventSlugOf(id: string): string {
  return id.replace(/^compare-\d+-/, "");
}

main().catch((error) => {
  console.error("[compare] fatal:", error);
  process.exitCode = 1;
});
