import Link from "next/link";
import { fill, type PagesDict } from "@/lib/i18n/dict.pages";
import type { Lang } from "@/lib/i18n/dict";
import { FOREIGN_TASK_CASES } from "@/data/model-benchmark/sourceTasks";
import { SourceTaskEntry } from "./SourceTaskEntry";
import { TaskExplorer, type TaskExplorerItem } from "./TaskExplorer";
import {
  BENCHMARK_ORDER,
  type AttemptStatus,
  type ModelAttempt,
} from "@/data/model-benchmark/challenges";

type Labels = PagesDict["tasks"]["benchmark"];

/** Attribution colour only; pending is a neutral tint, never a reliability rank. */
const ORIGIN_CLASS: Record<ModelAttempt["origin"], string> = {
  frontier: "border-[#cdd3fb] bg-[#eef0ff] text-[#33409e]",
  domestic: "border-[#b7e4d4] bg-[#eaf7f1] text-[#0f6b52]",
};

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function statusChip(status: AttemptStatus, labels: Labels): { text: string; cls: string } {
  return status === "reported"
    ? { text: labels.statusReported, cls: "border-ink-300 bg-white text-ink-700" }
    : { text: labels.statusPending, cls: "border-dashed border-ink-300 bg-ink-50 text-ink-500" };
}

function AttemptRow({
  attempt,
  lang,
  labels,
}: {
  attempt: ModelAttempt;
  lang: Lang;
  labels: Labels;
}) {
  const zh = lang === "zh";
  const pick = (v: { zh: string; en: string }) => (zh ? v.zh : v.en);
  const status = statusChip(attempt.status, labels);
  const pending = attempt.status === "pending";

  return (
    <tr className="border-t border-ink-100 align-top">
      <td className="px-3 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`w-fit rounded border px-1.5 py-0.5 font-mono text-[10px] leading-none ${ORIGIN_CLASS[attempt.origin]}`}
          >
            {attempt.origin === "frontier" ? labels.originFrontier : labels.originDomestic}
          </span>
          <span className="text-[13px] font-medium text-ink-800">{pick(attempt.model)}</span>
        </div>
        <div className="mt-1 text-[11px] text-ink-500">{pick(attempt.vendor)}</div>
      </td>
      <td className="px-3 py-3">
        <span
          className={`inline-block rounded border px-1.5 py-0.5 font-mono text-[10px] leading-none ${status.cls}`}
        >
          {status.text}
        </span>
        <p className={`mt-2 text-[13px] leading-relaxed ${pending ? "text-ink-400" : "text-ink-700"}`}>
          {pick(attempt.result)}
        </p>
        {attempt.sourceUrl && (
          <a
            href={attempt.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="link-quiet mt-1 inline-block font-mono text-[10px]"
          >
            {hostOf(attempt.sourceUrl)} ↗
          </a>
        )}
      </td>
      <td className="px-3 py-3">
        {attempt.resources.length === 0 ? (
          <span className="text-[12px] text-ink-400">—</span>
        ) : (
          <dl className="space-y-2">
            {attempt.resources.map((r, i) => (
              <div key={i}>
                <dt className="mono-label">{pick(r.label)}</dt>
                <dd className="mt-0.5 text-[12px] text-ink-700">{pick(r.value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </td>
    </tr>
  );
}

function ChallengeEntry({
  challenge,
  index,
  lang,
  labels,
}: {
  challenge: (typeof BENCHMARK_ORDER)[number];
  index: number;
  lang: Lang;
  labels: Labels;
}) {
  const zh = lang === "zh";
  const pick = (v: { zh: string; en: string }) => (zh ? v.zh : v.en);

  return (
    <details
      id={challenge.id}
      className="disclosure labs-case labs-case--prepared scroll-mt-24"
    >
      <summary className="labs-case-summary">
        <span className="labs-case-index">{String(index + 1).padStart(2, "0")}</span>
        <span className="labs-case-main">
          <span className="labs-case-meta"><span className={`labs-lab labs-lab--${challenge.sourceCase.lab}`}>{challenge.sourceCase.lab}</span><time>{challenge.sourceCase.date}</time></span>
          <span className="labs-case-title">{pick(challenge.title)}</span>
        </span>
        <span className="labs-case-kind">
          {challenge.unit === "problem" ? labels.unitProblem : labels.unitBenchmark}
        </span>
        <span className="labs-case-arrow" aria-hidden="true">↗</span>
      </summary>

      <div className="labs-case-content">
        <dl className="labs-task-facts">
          <div className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-4">
            <dt className="labs-fact-label">{labels.fieldBenchmark}</dt>
            <dd className="text-[13px] leading-relaxed text-ink-700">
              {pick(challenge.benchmark)}
            </dd>
          </div>
          <div className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-4">
            <dt className="labs-fact-label">{labels.fieldTask}</dt>
            <dd className="text-[13px] leading-relaxed text-ink-700">{pick(challenge.task)}</dd>
          </div>
          <div className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-4">
            <dt className="labs-fact-label">{labels.fieldMetric}</dt>
            <dd className="text-[13px] leading-relaxed text-ink-700">{pick(challenge.metric)}</dd>
          </div>
        </dl>

        <div className="labs-result-panel">
          <div className="labs-panel-label">{labels.compareTitle}</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left">
              <thead>
                <tr className="labs-table-head">
                  <th className="px-3 py-2 mono-label">{labels.colModel}</th>
                  <th className="px-3 py-2 mono-label">{labels.colResult}</th>
                  <th className="px-3 py-2 mono-label">{labels.colResources}</th>
                </tr>
              </thead>
              <tbody>
                {challenge.attempts.map((attempt) => (
                  <AttemptRow key={attempt.id} attempt={attempt} lang={lang} labels={labels} />
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-500">{labels.compareNote}</p>
        </div>

        <div className="labs-source-foot">
          <div className="labs-panel-label">{labels.fieldSourceCase}</div>
          <a
            href={challenge.sourceCase.url}
            target="_blank"
            rel="noreferrer noopener"
            className="link-quiet text-[13px]"
          >
            {pick(challenge.sourceCase.caption)}
            <span className="ml-1 font-mono text-[10px] text-ink-400">
              {hostOf(challenge.sourceCase.url)}
            </span>
          </a>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
          <Link className="link-quiet text-[12px]" href="/methodology">
            {labels.methodLink} →
          </Link>
        </div>
      </div>
    </details>
  );
}

const CHALLENGE_BY_ARCHIVE_ID = new Map(
  BENCHMARK_ORDER.map((challenge) => [challenge.sourceCase.archiveId, challenge])
);

/** One chronological list; depth of research is shown within each entry. */
export function ChallengeBoard({ lang, labels }: { lang: Lang; labels: Labels }) {
  const items: TaskExplorerItem[] = FOREIGN_TASK_CASES.map((record, index) => {
    const challenge = CHALLENGE_BY_ARCHIVE_ID.get(record.id);
    return {
      id: record.id,
      track: record.track,
      search: [record.title.zh, record.title.en, record.problem, record.result.zh, record.result.en, record.model, challenge?.task.zh, challenge?.task.en].filter(Boolean).join(" "),
      content: challenge
        ? <ChallengeEntry challenge={challenge} index={index} lang={lang} labels={labels} />
        : <SourceTaskEntry record={record} index={index} lang={lang} />,
    };
  });
  return (
    <section aria-labelledby="benchmark-title" className="labs-section">
      <div className="labs-section-heading">
        <div>
          <div className="labs-section-kicker">01 / {labels.label}</div>
          <h2 id="benchmark-title" className="labs-section-title">
            {labels.title}
          </h2>
        </div>
        <span className="labs-section-count">
          {fill(labels.challengeCount, { n: FOREIGN_TASK_CASES.length })}
        </span>
      </div>
      <p className="labs-section-intro">{labels.intro}</p>
      <TaskExplorer items={items} lang={lang} />
      <p className="labs-source-note">{labels.sourceNote}</p>
    </section>
  );
}
