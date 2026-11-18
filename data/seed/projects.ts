import type { Project, ResearchEvent } from "@/types";

/**
 * Curated projects only. A Project exists when a named release series or
 * research programme has one; ordinary records are never force-grouped.
 */
export const curatedProjects: Project[] = [
  {
    id: "proj-deepseek-prover",
    name: "DeepSeek-Prover",
    aliases: ["deepseek-prover", "deepseek prover"],
    desc: {
      zh: "DeepSeek 的形式化定理证明系列：从大规模合成数据到 RL+MCTS 的版本迭代。",
      en: "DeepSeek's formal theorem-proving series: from large-scale synthetic data to RL+MCTS releases.",
    },
  },
  {
    id: "proj-ai-scientist",
    name: "The AI Scientist",
    aliases: ["ai scientist", "ai-scientist"],
    desc: {
      zh: "Sakana AI 的自动化科研系列：从开放式发现到 V2 的 agentic tree search。",
      en: "Sakana AI's automated scientific discovery series: from open-ended discovery to V2's agentic tree search.",
    },
  },
];

export function projectById(id: string): Project | undefined {
  return curatedProjects.find((project) => project.id === id);
}

/** A project explicitly named by the source, via title or entities. Summaries
    often mention a project merely as a tool or baseline — that is not membership. */
export function mentionedProject(
  event: Pick<ResearchEvent, "title" | "entities">
): Project | undefined {
  const text = `${event.title} ${(event.entities?.projects ?? []).join(" ")}`.toLowerCase();
  return curatedProjects.find((project) =>
    [project.name.toLowerCase(), ...(project.aliases ?? [])].some((name) => text.includes(name))
  );
}