import { ChallengeBoard } from "@/components/benchmark/ChallengeBoard";
import { FOREIGN_TASK_CASES } from "@/data/model-benchmark/sourceTasks";
import { getLang } from "@/lib/i18n/server";
import { pagesDict } from "@/lib/i18n/dict.pages";

/** Public mathematical archive and source results for the future comparison. */
export function generateMetadata() {
  const m = pagesDict[getLang()].meta.tasks;
  return { title: m.title, description: m.desc };
}

export default function MathArchivePage() {
  const lang = getLang();
  const p = pagesDict[lang];

  return (
    <div className="labs-page">
      <header className="labs-hero">
        <div className="container-page labs-hero-inner">
          <div className="labs-hero-copy">
            <div className="labs-hero-kicker"><span className="labs-signal" /> AI4M / {lang === "zh" ? "数学档案" : "MATH ARCHIVE"}</div>
            <h1>{p.tasks.title}</h1>
            <p>{p.tasks.sub}</p>
            <div className="labs-hero-foot">
              <span>OPENAI · ANTHROPIC</span>
              <span>{lang === "zh" ? "问题 · 结果 · 原始来源" : "PROBLEM · RESULT · SOURCE"}</span>
            </div>
          </div>
          <div className="labs-hero-figure" aria-label={lang === "zh" ? `共 ${FOREIGN_TASK_CASES.length} 条来源案例` : `${FOREIGN_TASK_CASES.length} source cases`}>
            <span className="labs-figure-coordinate" aria-hidden="true">MATH / 01</span>
            <span className="labs-figure-number">{FOREIGN_TASK_CASES.length}</span>
            <span className="labs-figure-caption">{lang === "zh" ? "条来源案例" : "SOURCE CASES"}</span>
          </div>
        </div>
      </header>
      <div className="container-page labs-content">
        <ChallengeBoard lang={lang} labels={p.tasks.benchmark} />
      </div>
    </div>
  );
}
