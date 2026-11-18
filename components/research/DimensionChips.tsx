import type { EventType } from "@/types";
import {
  MATH_TOPICS,
  facetsOf,
  facetLabel,
  type EventFacets,
  type FacetSource,
} from "@/lib/dimensions";

const DIM_NAME = {
  math: { zh: "数学领域", en: "Math topic" },
};

/**
 * The derived descriptive facet as chips (math topic). Only
 * hits render — absence is information. The capability axis is the stored
 * direction subdivision, so it lives in filters and groupings, not in
 * per-event chips. List surfaces pass the build-time facets of the RAW
 * record; detail pages pass the raw record itself and derive here. Never feed
 * localized display text into the patterns.
 */
export function DimensionChips({
  event,
  lang,
  variant = "detail",
}: {
  event: FacetSource & { eventType?: EventType; facets?: EventFacets };
  lang: "zh" | "en";
  variant?: "detail" | "card";
}) {
  if ((event.eventType ?? "Research") !== "Research") return null;
  const { math } = event.facets ?? facetsOf(event);
  if (math.length === 0) return null;

  const chip =
    variant === "detail" ? "chip" : "chip px-1.5 py-0 text-[10px] leading-4";
  const wrap =
    variant === "detail"
      ? "mt-4 flex flex-wrap items-center gap-2"
      : "flex min-w-0 flex-wrap items-center gap-1";

  return (
    <div className={wrap}>
      {math.map((id) => (
        <span key={id} title={DIM_NAME.math[lang]} className={chip}>
          {facetLabel(MATH_TOPICS, id, lang)}
        </span>
      ))}
    </div>
  );
}
