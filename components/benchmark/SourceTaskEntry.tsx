import type { LabArchiveRecord } from "@/data/lab-archive/records";
import type { Lang } from "@/lib/i18n/dict";

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** A source case in the shared chronological list. */
export function SourceTaskEntry({ record, index, lang }: { record: LabArchiveRecord; index: number; lang: Lang }) {
  const zh = lang === "zh";
  return (
    <details id={`task-${record.id}`} className="disclosure labs-case scroll-mt-24">
      <summary className="labs-case-summary">
        <span className="labs-case-index">{String(index + 1).padStart(2, "0")}</span>
        <span className="labs-case-main">
          <span className="labs-case-meta"><span className={`labs-lab labs-lab--${record.track}`}>{record.track === "openai" ? "OpenAI" : record.track === "anthropic" ? "Anthropic" : zh ? "独立评测" : "Independent"}</span><time>{record.date}</time></span>
          <span className="labs-case-title">{zh ? record.title.zh : record.title.en}</span>
        </span>
        <span className="labs-case-kind">{zh ? record.nature.zh : record.nature.en}</span>
        <span className="labs-case-arrow" aria-hidden="true">↗</span>
      </summary>
      <div className="labs-case-content">
        <div className="labs-source-grid">
          <div>
            <div className="labs-panel-label">{zh ? "研究问题" : "Research question"}</div>
            <p className="labs-source-problem">{zh ? record.problem : record.title.en}</p>
          </div>
          <div>
            <div className="labs-panel-label">{zh ? "公开结果" : "Reported result"}</div>
            <p className="labs-source-result">{zh ? record.result.zh : record.result.en}</p>
          </div>
        </div>
        <div className="labs-source-foot">
          <p className="labs-attribution">{zh ? record.attribution.zh : record.attribution.en}</p>
          {zh && <p className="labs-scope">{record.scope}</p>}
          <div className="labs-source-links">
            {record.sources.map((source) => (
              <a key={source.url} href={source.url} target="_blank" rel="noreferrer noopener">
                {zh ? source.label.zh : source.label.en}<span>{hostOf(source.url)} ↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}
