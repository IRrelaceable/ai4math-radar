import type { RawResearchItem } from "@/types";
import type { ResearchSource } from "./index";
import { sourceFetch } from "./http";

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
  "Goedel-LM/Goedel-Prover",
  "MoonshotAI/Kimina-Prover-Preview",
];

export interface GitHubSourceOptions {
  repos?: string[];
  fetchFn?: typeof fetch;
}

interface RepoPayload {
  full_name: string;
  html_url: string;
  description: string | null;
  created_at: string;
  language: string | null;
}

interface ReleasePayload {
  tag_name: string;
  published_at: string | null;
}

async function fetchLatestRelease(
  repo: string,
  fetchFn: (input: string, init?: RequestInit) => Promise<Response>
): Promise<ReleasePayload | undefined> {
  try {
    const response = await fetchFn(`https://api.github.com/repos/${repo}/releases/latest`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "AI4Math-Research-Tracker/0.1",
      },
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) return undefined;
    return (await response.json()) as ReleasePayload;
  } catch {
    return undefined;
  }
}

export function createGitHubSource(options: GitHubSourceOptions = {}): ResearchSource {
  const { repos = WATCHED_REPOS, fetchFn = sourceFetch } = options;
  return {
    id: "github",
    label: "GitHub (watched repositories)",
    sourceTier: "S0",
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
            signal: AbortSignal.timeout(20_000),
          });
          if (!response.ok) continue;
          const data = (await response.json()) as RepoPayload;
          const release = await fetchLatestRelease(repo, fetchFn);

          // A daily push is not an event in its own right: keying the date on
          // `pushed_at` re-dated every actively developed repository to "today"
          // on each sync. The latest release (or the repo creation date when
          // there is none) is the stable, inspectable state. Stars and push
          // times are volatile too, so they stay out of the fingerprint.
          const publishedAt = (release?.published_at ?? data.created_at).slice(0, 10);

          items.push({
            id: `github-${repo.replace("/", "-")}`,
            title: data.description?.trim() || `${data.full_name} repository update`,
            abstract:
              `Public repository ${data.full_name}` +
              (data.language ? ` (${data.language})` : "") +
              (release
                ? `, latest release ${release.tag_name} on ${publishedAt}`
                : ", no published releases") +
              ". Recorded as an inspectable artifact for AI4Math work.",
            url: data.html_url,
            githubUrl: data.html_url,
            source: "GitHub",
            sourceTier: "S0",
            publishedAt,
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
