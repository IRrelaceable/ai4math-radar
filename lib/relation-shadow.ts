import { classifyRelation } from "@/lib/relation-classifier";
import { eventIdOf, eventLinkOf, findCandidates } from "@/lib/tracking";
import type { LLMProvider } from "@/lib/llm/provider";
import type { ResearchEvent } from "@/types";

// The first live observation samples the rules alone. It uses no additional
// model quota and remains comparable when the configured provider is down.
const ruleOnlyProvider: LLMProvider = {
  id: "mock",
  async complete() {
    throw new Error("Rule-only shadow evaluation cannot call a model");
  },
};

export async function observeTrackingRelations(
  incoming: ResearchEvent[],
  currentAssignments: ResearchEvent[],
  existing: ResearchEvent[],
) {
  const assignmentsBySlug = new Map(currentAssignments.map((record) => [record.slug, record]));
  const context = new Map(existing.map((record) => [record.slug, record]));
  const rows = [];
  for (const record of incoming) {
    const assigned = assignmentsBySlug.get(record.slug);
    const current = assigned ? eventLinkOf(assigned) : undefined;
    const candidates = findCandidates(record, [...context.values()]);
    const proposed = await classifyRelation(record, candidates, { provider: ruleOnlyProvider });
    const currentTarget = current?.relation === "related-event"
      ? current.relatedTo?.eventId
      : current?.relation === "same-event" ? current.eventId : undefined;
    rows.push({
      slug: record.slug,
      title: record.title,
      date: record.date,
      sourceUrl: record.sourceUrl,
      candidates: candidates.map((candidate) => ({
        eventId: eventIdOf(candidate.event),
        slug: candidate.event.slug,
        title: candidate.event.title,
        score: candidate.score,
        signals: candidate.signals ?? [],
        entityOverlap: candidate.entityOverlap,
        keywordOverlap: candidate.keywordOverlap,
      })),
      current: current && {
        relation: current.relation,
        kind: current.kind,
        targetEventId: currentTarget,
        matchedBy: current.matchedBy,
        reason: current.reason,
      },
      proposed,
      evidenceOrigin: proposed.evidenceQuote ? "event summary or significance" : undefined,
      agrees: Boolean(current && current.relation === proposed.relation &&
        current.kind === proposed.updateKind && currentTarget === proposed.targetEventId),
    });
    // Later items may see earlier records as they were actually assigned.
    // Proposed links never enter this context or the archive.
    context.set(record.slug, assigned ?? record);
  }
  return rows;
}
