import type { EcosystemMetadata, EventTranslation, ResearchArea, ResearchEvent } from "@/types";
import type { Lang } from "./dict";
import { EVENT_ZH } from "@/data/i18n/events";
import { PHRASE_ZH } from "@/data/i18n/phrases";
import { renderMath } from "@/lib/math";

/**
 * Content localization overlay.
 *
 * Seed and ingested research prose is stored in English only; `data/i18n/`
 * carries a slug-keyed Chinese overlay. When the UI language is `zh`, every
 * prose field is replaced by its translation when one exists and falls back to
 * the English source field-by-field — never mutating the stored event.
 *
 * Automated events are stricter: their English prose changes on re-sync, so an
 * overlay is only used when it translates the title, summary and significance
 * together; a partial snapshot would otherwise mix stale Chinese with fresh
 * English on the same card.
 *
 * Taxonomy names are localized for display only (`displayArea` /
 * `displaySubArea`); the stored English keys still drive slugs, filters and
 * trust metadata. Dates and proper names are never overlaid.
 *
 * Inline LaTeX (`$…$`) arriving from automated ingest is rendered to Unicode
 * for BOTH languages — the raw source is English too — so a detail page never
 * shows bare `$U \subseteq \mathbb R^n$`.
 */

const AREA_ZH: Record<ResearchArea, string> = {
  "Theorem Proving & Formal Mathematics": "定理证明与形式化数学",
  "Mathematical Reasoning & LLMs": "数学推理与大模型",
  "Mathematical Agents": "数学智能体",
  "Mathematical Discovery & Symbolic Computation": "数学发现与符号计算",
  Geometry: "几何",
  "Benchmarks & Datasets": "基准与数据集",
};

const SUBAREA_ZH: Record<string, string> = {
  "Prompting & decoding": "提示与解码",
  "Process supervision": "过程监督",
  "Competition-level reasoning": "竞赛级推理",
  "Tool & code integration": "工具与代码集成",
  "Proof search": "证明搜索",
  "Prover tooling & interaction": "证明器工具与交互",
  "Agent-based proving": "智能体证明",
  Autoformalization: "自动形式化",
  "Formal corpora & libraries": "形式语料与库",
  "Proof assistant tooling": "证明助手工具",
  "Algorithm & program search": "算法与程序搜索",
  "AI-proved results & conjectures": "AI 证明结果与猜想",
  "Verification & corpus scrutiny": "验证与语料审查",
  "Geometry formalization": "几何形式化",
  "Geometry problem solving": "几何问题求解",
  "Multimodal geometry": "多模态几何",
  "Equation solving & discovery": "方程求解与发现",
  "Symbolic benchmark": "符号基准",
  "Autonomous research agents": "自主研究智能体",
  "Engineering & tool agents": "工程与工具智能体",
  "Math-specialized models": "数学专用模型",
  "Reasoning & self-improvement": "推理与自我改进",
  "Formal proving benchmarks": "形式证明基准",
  "Competition & olympiad benchmarks": "竞赛与奥赛基准",
  "Math word problem datasets": "数学应用题数据集",
  "Theorem & multimodal benchmarks": "定理与多模态基准",
  "Multi-agent discovery": "多智能体发现",
  "Automated ideation & review": "自动构思与评审",
  "Agent evaluation & peer review": "智能体评测与同行评审",
  conjecture: "猜想",
  "multi-step tools": "多步工具",
};

/** Display-only taxonomy localization; stored slugs and filters stay unchanged. */
export function displayArea(area: ResearchArea | undefined, lang: Lang): string {
  if (!area) return "";
  return lang === "zh" ? AREA_ZH[area] ?? area : area;
}

export function displayResearchArea(
  event: { researchArea?: ResearchArea },
  lang: Lang
): string {
  return displayArea(event.researchArea, lang);
}

export function displaySubArea(subArea: string | undefined, lang: Lang): string | undefined {
  if (!subArea) return undefined;
  return lang === "zh" ? SUBAREA_ZH[subArea] ?? subArea : subArea;
}
/** Exact-match phrase lookup for boilerplate prose (notes, roles, labels). */
export function phrase(text?: string): string | undefined {
  if (!text) return text;
  return PHRASE_ZH[text] ?? text;
}

/**
 * Render inline math in the display-facing prose fields. Returns the same
 * object reference when no field changes, so math-free events cost nothing.
 */
function presentProse<T extends ResearchEvent>(event: T): T {
  const title = renderMath(event.title);
  const summary = renderMath(event.summary);
  const significance = renderMath(event.significance);
  const problem = event.problem === undefined ? undefined : renderMath(event.problem);
  const kc = event.keyContributions;
  const keyContributions = kc?.map((c) => renderMath(c));

  const unchanged =
    title === event.title &&
    summary === event.summary &&
    significance === event.significance &&
    problem === event.problem &&
    (keyContributions === kc ||
      (keyContributions !== undefined && kc !== undefined && keyContributions.every((c, i) => c === kc[i])));
  if (unchanged) return event;

  return { ...event, title, summary, significance, problem, keyContributions };
}

/** Localize one event for display: zh overlay (when lang is zh) + math rendering. */
export function localizeEvent<T extends ResearchEvent>(event: T, lang: Lang): T {
  if (lang !== "zh") return presentProse(event);
  // Ingest-time translations track the English text they were written from, so
  // they win over the static seed overlay. The overlay is the fallback for
  // curated events and for automated ones the pipeline could not translate.
  const stored = event.translations?.zh;
  const hasStored = Boolean(stored?.title && stored.summary);
  const zh = hasStored ? stored : EVENT_ZH[event.slug];
  // Ingested prose changes on every re-sync, so a static overlay becomes a
  // stale snapshot while the English source moves on. Only apply that overlay
  // to an automated event when it covers every prose field; otherwise the card
  // would mix a stale Chinese summary with a fresh English one. A stored
  // translation is exempt: it was written from the current English text.
  const overlay: (EventTranslation & { problem?: string; keyContributions?: string[] }) | undefined =
    zh &&
    (hasStored ||
      event.provenance !== "automated" ||
      Boolean(zh.title && zh.summary && zh.significance))
      ? zh
      : undefined;
  const kc = overlay?.keyContributions;
  const contributions = kc && event.keyContributions && kc.length === event.keyContributions.length
    ? kc
    : event.keyContributions;
  // Metadata follows the same rule as prose: an ingest-time translation wins,
  // the static overlay covers curated entries, and PHRASE_ZH handles leftover
  // boilerplate values inside either shape.
  const zhMetadata = stored?.metadata ?? overlay?.metadata;
  return presentProse({
    ...event,
    title: overlay?.title ?? event.title,
    summary: overlay?.summary ?? event.summary,
    significance: overlay?.significance ?? event.significance,
    problem: overlay?.problem ?? event.problem,
    keyContributions: contributions,
    aiRole: event.aiRole
      ? {
          ...event.aiRole,
          description: overlay?.aiRoleDescription ?? event.aiRole.description,
        }
      : undefined,
    humanContribution: overlay?.humanContribution ?? event.humanContribution,
    verificationHistory: event.verificationHistory?.map((r) => ({
      ...r,
      note: r.noteZh ?? phrase(r.note) ?? r.note,
      noteZh: undefined,
    })),
    relatedWorks: event.relatedWorks?.map((w) => ({ ...w, note: phrase(w.note) ?? w.note })),
    metadata: event.metadata
      ? localizeMetadata(event.metadata, zhMetadata)
      : zhMetadata ?? event.metadata,
  });
}

/** Localize the prose fields inside ecosystem metadata (roles, initiatives …). */
function localizeMetadata(
  m: EcosystemMetadata,
  overlay?: EcosystemMetadata
): EcosystemMetadata {
  const pick = (value: string, translated?: string): string =>
    translated ?? phrase(value) ?? value;
  const pickOptional = (value?: string, translated?: string): string | undefined =>
    value === undefined ? undefined : pick(value, translated);
  return {
    ...m,
    people: m.people?.map((person, index) => {
      const zh = overlay?.people?.[index];
      return {
        ...person,
        role: pickOptional(person.role, zh?.role),
        viewpoint: pickOptional(person.viewpoint, zh?.viewpoint),
      };
    }),
    initiatives: m.initiatives?.map((x, i) => pick(x, overlay?.initiatives?.[i])),
    projects: m.projects?.map((x, i) => pick(x, overlay?.projects?.[i])),
    funding: m.funding
      ? {
          ...m.funding,
          organization: pickOptional(m.funding.organization, overlay?.funding?.organization),
          recipient: pickOptional(m.funding.recipient, overlay?.funding?.recipient),
          amountDisclosure: pickOptional(
            m.funding.amountDisclosure,
            overlay?.funding?.amountDisclosure
          ),
        }
      : m.funding,
    education: m.education
      ? {
          ...m.education,
          institution: pickOptional(m.education.institution, overlay?.education?.institution),
          department: pickOptional(m.education.department, overlay?.education?.department),
          courseName: pickOptional(m.education.courseName, overlay?.education?.courseName),
          instructor: pickOptional(m.education.instructor, overlay?.education?.instructor),
          period: pickOptional(m.education.period, overlay?.education?.period),
          description: pickOptional(m.education.description, overlay?.education?.description),
        }
      : m.education,
    policy: m.policy
      ? {
          ...m.policy,
          kind: pickOptional(m.policy.kind, overlay?.policy?.kind),
          issue: pickOptional(m.policy.issue, overlay?.policy?.issue),
          community: pickOptional(m.policy.community, overlay?.policy?.community),
          participants: m.policy.participants?.map((x, i) =>
            pick(x, overlay?.policy?.participants?.[i])
          ),
        }
      : m.policy,
  };
}

/** Localize a list of events for display. */
export function localizeEvents<T extends ResearchEvent>(events: T[], lang: Lang): T[] {
  return events.map((e) => localizeEvent(e, lang));
}
