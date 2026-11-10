import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { loadEnv } from "./env";
import { events as seedEvents } from "@/data/seed/events";
import { readIngestedEvents } from "@/lib/db/ingested";
import {
  analyzeDirection,
  directionInput,
  isDirectionEligible,
  type DirectionAnalysis,
} from "@/agents/researchTracker/direction";
import { getLLMProvider, type LLMProvider } from "@/lib/llm/provider";
import type { EventDirection, ResearchEvent } from "@/types";

/**
 * Re-judge every research event under the three-step direction rubric and
 * compare the new verdict with the stored one. This script never writes event
 * data: it only produces a review report plus a resumable cache.
 *
 *   npm run audit:direction
 *   npm run audit:direction -- --limit=20
 *   npm run audit:direction -- --only=slug-a,slug-b
 *   npm run audit:direction -- --fresh
 *
 * Confirm the report first; a separate apply step updates only the confirmed
 * slugs, never the whole dataset.
 */

const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "direction-audit.json");
const REPORT_MD = path.join(process.cwd(), "docs", "direction-audit-2026-11-09.md");
const REPORT_JSON = path.join(process.cwd(), "docs", "direction-audit-2026-11-09.json");

interface AuditRow {
  slug: string;
  title: string;
  source: "seed" | "ingested";
  oldDirection?: EventDirection;
  analysis?: DirectionAnalysis;
  error?: string;
  inputHash: string;
  checkedAt: string;
}

type Candidate = {
  event: ResearchEvent;
  source: "seed" | "ingested";
};

function parseArgs() {
  const argv = process.argv.slice(2);
  const limitArg = argv.find((value) => value.startsWith("--limit="));
  const concurrencyArg = argv.find((value) => value.startsWith("--concurrency="));
  const onlyArg = argv.find((value) => value.startsWith("--only="));
  const limit = limitArg ? Number(limitArg.slice("--limit=".length)) : undefined;
  const concurrency = concurrencyArg
    ? Number(concurrencyArg.slice("--concurrency=".length))
    : 6;
  return {
    fresh: argv.includes("--fresh"),
    limit: Number.isInteger(limit) && (limit ?? 0) > 0 ? limit : undefined,
    concurrency: Number.isInteger(concurrency) && (concurrency ?? 0) > 0 ? concurrency : 6,
    only: onlyArg
      ? new Set(onlyArg.slice("--only=".length).split(",").filter(Boolean))
      : undefined,
  };
}

function readCache(): Record<string, AuditRow> {
  try {
    const parsed = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, AuditRow>)
      : {};
  } catch {
    return {};
  }
}

function writeCache(rows: Record<string, AuditRow>): void {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(rows, null, 2), "utf8");
}

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadCandidates(): Candidate[] {
  const bySlug = new Map<string, Candidate>();
  for (const event of seedEvents) {
    if (isDirectionEligible(event)) bySlug.set(event.slug, { event, source: "seed" });
  }
  for (const event of readIngestedEvents()) {
    if (isDirectionEligible(event) && !bySlug.has(event.slug)) {
      bySlug.set(event.slug, { event, source: "ingested" });
    }
  }
  return [...bySlug.values()];
}

async function classify(
  candidate: Candidate,
  provider: LLMProvider,
  cache: Record<string, AuditRow>,
  fresh: boolean
): Promise<AuditRow> {
  const input = directionInput(candidate.event);
  const inputHash = sha256(input);
  const cached = cache[candidate.event.slug];
  if (!fresh && cached?.analysis && cached.inputHash === inputHash) {
    return cached;
  }

  const attempts = 3;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const analysis = await analyzeDirection(candidate.event, provider);
    if (analysis) {
      return {
        slug: candidate.event.slug,
        title: candidate.event.title,
        source: candidate.source,
        oldDirection: candidate.event.direction,
        analysis,
        inputHash,
        checkedAt: new Date().toISOString(),
      };
    }
    if (attempt < attempts) await sleep(2_000 * attempt);
  }

  return {
    slug: candidate.event.slug,
    title: candidate.event.title,
    source: candidate.source,
    oldDirection: candidate.event.direction,
    error: `no answer after ${attempts} attempts`,
    inputHash,
    checkedAt: new Date().toISOString(),
  };
}

function cell(value: string | undefined, max = 110): string {
  if (!value) return "—";
  const flat = value.replace(/\s+/g, " ").replace(/\|/g, "\\|").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

function pct(part: number, total: number): string {
  return total === 0 ? "0%" : `${Math.round((part / total) * 100)}%`;
}

function buildReport(rows: AuditRow[]): string {
  const judged = rows.filter((row) => row.analysis);
  const failed = rows.filter((row) => !row.analysis);
  const flips = judged.filter((row) => row.analysis?.verdict !== row.oldDirection);
  const noneRows = judged.filter((row) => row.analysis?.verdict === "none");
  const lowConfidence = judged.filter((row) => (row.analysis?.confidence ?? 0) < 0.7);
  const review = judged.filter((row) => {
    const analysis = row.analysis!;
    return (
      analysis.verdict === "none" ||
      analysis.confidence < 0.7 ||
      (analysis.verdict !== row.oldDirection && analysis.confidence < 0.8)
    );
  });

  const pairs = new Map<string, number>();
  for (const row of judged) {
    const key = `${row.oldDirection ?? "(none)"} → ${row.analysis!.verdict}`;
    pairs.set(key, (pairs.get(key) ?? 0) + 1);
  }
  const pairRows = [...pairs.entries()].sort((a, b) => b[1] - a[1]);

  const byPair = new Map<string, AuditRow[]>();
  for (const row of flips) {
    const key = `${row.oldDirection ?? "(none)"} → ${row.analysis!.verdict}`;
    const list = byPair.get(key) ?? [];
    list.push(row);
    byPair.set(key, list);
  }

  const lines: string[] = [];
  lines.push("# 方向轴复核报告（2026-11-09）");
  lines.push("");
  lines.push(
    `本次复核覆盖 **${rows.length}** 条科研事件：判定完成 **${judged.length}** 条，失败 **${failed.length}** 条。`
  );
  lines.push("");
  lines.push("## 判定口径");
  lines.push("");
  lines.push("每条事件按三步判断：");
  lines.push("");
  lines.push("1. **研究对象**：这篇工作在研究什么？");
  lines.push("2. **核心目标**：最终想解决什么问题？");
  lines.push("3. **实际贡献**：实际交付了什么？作者目标与实际贡献不一致时，以实际贡献为准。");
  lines.push("");
  lines.push("| 核心目标 | 方向 |");
  lines.push("| --- | --- |");
  lines.push("| 提升 AI 的数学推理能力 | AI4Math |");
  lines.push("| 自动发现数学规律或猜想 | AI4Math |");
  lines.push("| 自动证明数学定理 | AI4Math |");
  lines.push("| 改进 AI 模型的训练方法 | Math4AI |");
  lines.push("| 解释 AI 模型的数学性质 | Math4AI |");
  lines.push("| 用数学理论改进 AI 算法 | Math4AI |");
  lines.push("| 同时实现上述两类核心目标 | Both |");
  lines.push("| 均不符合 | 不纳入方向轴 |");
  lines.push("");
  lines.push(
    "混合目标时以**头条交付物**为准：数学专项产物（证明、证明器、形式化语料、数学专项模型/数据集/基准）判 AI4Math；可复用的 AI 方法、理论或算法判 Math4AI。"
  );
  lines.push("");
  lines.push("## 总体变化");
  lines.push("");
  lines.push(`- 维持原判定：**${judged.length - flips.length}** 条（${pct(judged.length - flips.length, judged.length)}）`);
  lines.push(`- 判定变化：**${flips.length}** 条（${pct(flips.length, judged.length)}）`);
  lines.push(`- 判为不纳入方向轴（none）：**${noneRows.length}** 条`);
  lines.push(`- 低置信度（< 0.7）：**${lowConfidence.length}** 条`);
  lines.push("");
  lines.push("| 旧 → 新 | 数量 |");
  lines.push("| --- | ---: |");
  for (const [pair, count] of pairRows) lines.push(`| ${pair} | ${count} |`);
  lines.push("");
  lines.push("## 判定变化明细");
  lines.push("");
  if (flips.length === 0) {
    lines.push("无。");
    lines.push("");
  } else {
    const order = [...byPair.entries()].sort((a, b) => b[1].length - a[1].length);
    for (const [pair, list] of order) {
      lines.push(`### ${pair}（${list.length}）`);
      lines.push("");
      lines.push("| slug | 标题 | 置信度 | 理由 |");
      lines.push("| --- | --- | ---: | --- |");
      for (const row of list.sort((a, b) => a.slug.localeCompare(b.slug))) {
        lines.push(
          `| \`${row.slug}\` | ${cell(row.title, 80)} | ${row.analysis!.confidence.toFixed(2)} | ${cell(
            row.analysis!.reason,
            100
          )} |`
        );
      }
      lines.push("");
    }
  }
  lines.push("## 优先人工核验");
  lines.push("");
  lines.push(
    "筛选条件：判为 none、置信度 < 0.7，或判定变化且置信度 < 0.8。以下保留三步判断的原始字段，便于逐条核对。"
  );
  lines.push("");
  if (review.length === 0) {
    lines.push("无。");
    lines.push("");
  } else {
    for (const row of review.sort((a, b) => a.slug.localeCompare(b.slug))) {
      const analysis = row.analysis!;
      lines.push(`### \`${row.slug}\``);
      lines.push("");
      lines.push(`**${row.title}**`);
      lines.push("");
      lines.push(
        `\`${row.oldDirection ?? "(none)"} → ${analysis.verdict}\` · 置信度 ${analysis.confidence.toFixed(
          2
        )} · 来源 ${row.source}`
      );
      lines.push("");
      lines.push(`- 研究对象：${analysis.researchObject || "—"}`);
      lines.push(`- 核心目标：${analysis.coreGoal || "—"}`);
      lines.push(`- 实际贡献：${analysis.actualContribution || "—"}`);
      lines.push(`- 理由：${analysis.reason || "—"}`);
      lines.push("");
    }
  }
  lines.push("## 未完成");
  lines.push("");
  if (failed.length === 0) {
    lines.push("无。");
  } else {
    lines.push("| slug | 标题 | 错误 |");
    lines.push("| --- | --- | --- |");
    for (const row of failed.sort((a, b) => a.slug.localeCompare(b.slug))) {
      lines.push(`| \`${row.slug}\` | ${cell(row.title, 80)} | ${cell(row.error, 80)} |`);
    }
    lines.push("");
    lines.push("重跑同一命令即可只补未完成的条目（缓存会跳过已完成的）。");
  }
  lines.push("");
  lines.push("## 说明");
  lines.push("");
  lines.push("- 本报告只做复核，**没有修改任何事件数据**。");
  lines.push("- 下一步只更新确认有问题的 slug，不批量覆盖全部记录。");
  lines.push("- 复核用的完整字段保存在 `.cache/direction-audit.json`，确认后可直接按 slug 应用。");
  lines.push("");
  return lines.join("\n");
}

function writeReport(rows: AuditRow[]): void {
  fs.mkdirSync(path.dirname(REPORT_MD), { recursive: true });
  fs.writeFileSync(REPORT_MD, buildReport(rows), "utf8");
  const compact = rows
    .map((row) => ({
      slug: row.slug,
      title: row.title,
      source: row.source,
      oldDirection: row.oldDirection ?? null,
      newDirection: row.analysis?.verdict ?? null,
      confidence: row.analysis?.confidence ?? null,
      researchObject: row.analysis?.researchObject ?? null,
      coreGoal: row.analysis?.coreGoal ?? null,
      actualContribution: row.analysis?.actualContribution ?? null,
      reason: row.analysis?.reason ?? null,
      error: row.error ?? null,
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
  fs.writeFileSync(REPORT_JSON, JSON.stringify(compact, null, 2), "utf8");
}

async function main(): Promise<void> {
  loadEnv();
  const { fresh, limit, concurrency, only } = parseArgs();
  const provider = getLLMProvider();
  if (provider.id === "mock") {
    throw new Error("direction audit needs a live provider; set LLM_PROVIDER=openai-compatible in .env");
  }

  const cached = fresh ? {} : readCache();
  const all = loadCandidates();
  const selected = all
    .filter((candidate) => !only || only.has(candidate.event.slug))
    .slice(0, limit ?? Number.MAX_SAFE_INTEGER);

  const pending = selected.filter((candidate) => {
    const inputHash = sha256(directionInput(candidate.event));
    const entry = cached[candidate.event.slug];
    return fresh || !entry?.analysis || entry.inputHash !== inputHash;
  });

  console.log(
    `direction audit: ${selected.length} research events selected, ${pending.length} to judge, ` +
      `${selected.length - pending.length} cached. concurrency=${concurrency}`
  );
  console.log(`cache: ${CACHE_FILE}`);
  console.log(`report: ${REPORT_MD}`);

  let cursor = 0;
  let done = 0;
  const total = pending.length;
  const rows: Record<string, AuditRow> = { ...cached };

  async function worker(): Promise<void> {
    for (;;) {
      const index = cursor++;
      if (index >= pending.length) return;
      const candidate = pending[index];
      const row = await classify(candidate, provider, cached, fresh);
      rows[row.slug] = row;
      done += 1;
      const verdict = row.analysis?.verdict ?? "FAILED";
      const flip = row.analysis && row.analysis.verdict !== row.oldDirection ? " *" : "";
      const confidence = row.analysis ? ` ${row.analysis.confidence.toFixed(2)}` : "";
      console.log(
        `[${done}/${total}] ${row.slug} -> ${verdict}${confidence}` +
          ` (old ${row.oldDirection ?? "none"})${flip}`
      );
      if (done % 10 === 0) writeCache(rows);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  writeCache(rows);

  const finalRows = selected
    .map((candidate) => rows[candidate.event.slug])
    .filter((row): row is AuditRow => Boolean(row));
  writeReport(finalRows);

  const judged = finalRows.filter((row) => row.analysis);
  const flips = judged.filter((row) => row.analysis!.verdict !== row.oldDirection);
  const none = judged.filter((row) => row.analysis!.verdict === "none");
  console.log(
    `\nDone: ${judged.length}/${finalRows.length} judged, ${flips.length} changed, ` +
      `${none.length} none, ${finalRows.length - judged.length} failed.`
  );
  console.log(`report written to ${REPORT_MD}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
