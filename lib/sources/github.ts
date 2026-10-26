import type { RawResearchItem } from "@/types";
import type { ResearchSource } from "./index";

/**
 * GitHub source (V2): watches a small curated repository list and returns one
 * raw item per repository whose activity can be inspected publicly. Uses the
 * unauthenticated REST API (60 requests/hour), so the default list is short.
 */
export const WATCHED_REPOS = [
  "openai/math",
  "anthropics/fermats-last-theorem",
  "google-deepmind/superhuman",
  "leanprover/lean4",
  "leanprover-community/mathlib4",
  "deepseek-ai/DeepSeek-Prover",
  "InternLM/InternLM-Math",
  "QwenLM/Qwen2.5-Math",
  "goedel-prover/goedel-prover",
  "kimi-prover/Kimina-Prover",
];

export interface GitHubSourceOptions {
  repos?: string[];
  fetchFn?: typeof fetch;
}

interface RepoPayload {
  full_name: string;
  html_url: string;
  description: string | null;
  pushed_at: string;
  stargazers_count: number;
  language: string | null;
}

export function createGitHubSource(options: GitHubSourceOptions = {}): ResearchSource {
  const { repos = WATCHED_REPOS, fetchFn = fetch } = options;
  return {
    id: "github",
    label: "GitHub (watched repositories)",
    sourceTier: "S1",
    async fetchRecent(fetchOptions = {}) {
      const limit = fetchOptions.limit ?? repos.length;
      const since = fetchOptions.since;
      const items: RawResearchItem[] = [];

      for (const repo of repos.slice(0, limit)) {
        try {
          const response = await fetchFn(`https://api.github.com/repos/${repo}`, {
            headers: {
              Accept: "application/vnd.github+json",
              "User-Agent": "AI4Math-Research-Tracker/0.1",
            },
          });
          if (!response.ok) continue;
          const data = (await response.json()) as RepoPayload;

          items.push({
            id: `github-${repo.replace("/", "-")}`,
            title: data.description?.trim() || `${data.full_name} repository update`,
            abstract:
              `Public repository ${data.full_name}` +
              (data.language ? ` (${data.language})` : "") +
              `, ${data.stargazers_count} stars. ` +
              "Recorded as an inspectable artifact for AI4Math work; " +
              `latest push ${data.pushed_at.slice(0, 10)}.`,
            url: data.html_url,
            githubUrl: data.html_url,
            source: "GitHub",
            publishedAt: data.pushed_at.slice(0, 10),
            authors: [data.full_name.split("/")[0]],
          });
        } catch {
          // A single repository failure must not abort the whole source run.
        }
      }

      return since
        ? items.filter((item) => !item.publishedAt || item.publishedAt >= since)
        : items;
    },
  };
}

export const githubSource = createGitHubSource();

