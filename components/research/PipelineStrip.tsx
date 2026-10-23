"use client";

import { useLang } from "@/lib/i18n/context";
import { componentsDict } from "@/lib/i18n/dict.components";

/**
 * Compact visualization of the agent data path.
 *
 * `RawResearchItem` and `ResearchEvent` are code-level type names and stay in
 * English; the human-facing stage names and hints are localized.
 */
export function PipelineStrip() {
  const { lang } = useLang();
  const c = componentsDict[lang];

  const steps: { label: string; hint: string }[] = [
    { label: c.pipeline.researchSource, hint: c.pipeline.researchSourceHint },
    { label: "RawResearchItem", hint: c.pipeline.rawInputHint },
    { label: c.pipeline.normalizer, hint: c.pipeline.normalizerHint },
    { label: c.pipeline.classifier, hint: c.pipeline.classifierHint },
    { label: "ResearchEvent", hint: c.pipeline.eventHint },
  ];

  return (
    <ol className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
      {steps.map((step, i) => (
        <li key={step.label} className="flex flex-1 items-center gap-2">
          <div className="w-full rounded-md border border-ink-200 bg-ink-50 px-3 py-2.5">
            <div className="text-[13px] font-medium text-ink-900">{step.label}</div>
            <div className="mt-0.5 font-mono text-[10px] leading-snug text-ink-500">
              {step.hint}
            </div>
          </div>
          {i < steps.length - 1 && (
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-ink-400 max-lg:rotate-90 max-lg:self-center"
            >
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
