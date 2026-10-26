import { createRssSource } from "./rss";
import { createPageSource } from "./page";
import type { EventType, ResearchArea, SourceType, SourceTier } from "@/types";
import type { ResearchSource } from "./index";

export interface SourceDefinition {
  id: string;
  label: string;
  mode: "rss" | "page";
  url: string;
  sourceType: SourceType;
  defaultEventType?: EventType;
  defaultResearchArea?: ResearchArea;
  /** Editorial evidence tier; the sync UI groups sources into S1-S5 boards. */
  sourceTier: SourceTier;
  allowNonAI4Math?: boolean;
}

/**
 * Curated official source catalog. All entries are opt-in through the manual
 * sync UI; no scheduler is implied. URLs are kept here so coverage is visible
 * and a failed feed can be replaced without touching the pipeline.
 */
export const OFFICIAL_SOURCE_DEFINITIONS: SourceDefinition[] = [
  // Official lab / company blogs and news RSS.
  { id: "openai-news", label: "OpenAI News", mode: "rss", url: "https://openai.com/news/rss.xml", sourceType: "news", defaultEventType: "Research", sourceTier: "S2" },
  { id: "anthropic-news", label: "Anthropic News", mode: "rss", url: "https://www.anthropic.com/rss.xml", sourceType: "news", defaultEventType: "Research", sourceTier: "S2" },
  { id: "deepmind-blog", label: "Google DeepMind Blog", mode: "rss", url: "https://deepmind.google/blog/rss.xml", sourceType: "news", defaultEventType: "Research", sourceTier: "S2" },
  { id: "google-ai-blog", label: "Google AI Blog", mode: "rss", url: "https://blog.google/technology/ai/rss/", sourceType: "news", defaultEventType: "Research", sourceTier: "S2" },

  // University and research-institution news.
  { id: "mit-news-ai", label: "MIT News — Artificial Intelligence", mode: "rss", url: "https://news.mit.edu/rss/topic/artificial-intelligence2", sourceType: "news", defaultEventType: "Institutions", sourceTier: "S2" },
  { id: "stanford-hai-news", label: "Stanford HAI News", mode: "rss", url: "https://hai.stanford.edu/news/rss", sourceType: "news", defaultEventType: "Institutions", sourceTier: "S2" },

  // Funding and foundation announcements.
  { id: "simons-foundation-news", label: "Simons Foundation News", mode: "rss", url: "https://www.simonsfoundation.org/feed/", sourceType: "funding", defaultEventType: "Funding", sourceTier: "S2" },
  { id: "nsf-news", label: "US National Science Foundation News", mode: "rss", url: "https://www.nsf.gov/news/rss.jsp", sourceType: "funding", defaultEventType: "Funding", sourceTier: "S2" },

  { id: "simons-ai-math-funding", label: "Simons Foundation AI-era mathematics effort", mode: "page", url: "https://www.simonsfoundation.org/news/simons-foundation-launches-15m-effort-to-help-mathematicians-navigate-ai-era/", sourceType: "funding", defaultEventType: "Funding", allowNonAI4Math: true, sourceTier: "S2" },

  // Education, training and summer-school entry points (folded into the
  // Institutions & Education class).
  { id: "aimo-education", label: "AIMO Education & Progress Prize", mode: "page", url: "https://www.aimoprize.com/", sourceType: "education", defaultEventType: "Institutions", allowNonAI4Math: true, sourceTier: "S2" },
  { id: "mathematics-in-lean", label: "Mathematics in Lean", mode: "page", url: "https://leanprover-community.github.io/mathematics_in_lean/", sourceType: "education", defaultEventType: "Institutions", allowNonAI4Math: true, sourceTier: "S2" },

  // Public researcher viewpoints, talks and personal research blogs.
  { id: "terence-tao-blog", label: "Terence Tao's blog", mode: "rss", url: "https://terrytao.wordpress.com/feed/", sourceType: "blog", defaultEventType: "People", sourceTier: "S3" },
  { id: "timothy-gowers-blog", label: "Timothy Gowers' blog", mode: "rss", url: "https://gowers.wordpress.com/feed/", sourceType: "blog", defaultEventType: "People", sourceTier: "S3" },
  { id: "scott-aaronson-blog", label: "Scott Aaronson's blog", mode: "rss", url: "https://scottaaronson.blog/feed/", sourceType: "blog", defaultEventType: "People", sourceTier: "S3" },
  { id: "quanta-mathematics", label: "Quanta Magazine — Mathematics", mode: "rss", url: "https://www.quantamagazine.org/feed/", sourceType: "blog", defaultEventType: "People", sourceTier: "S4" },

  // Policy, declarations and community sources.
  { id: "math-and-ai", label: "Math & AI declarations", mode: "page", url: "https://mathandai.org/", sourceType: "policy", defaultEventType: "PolicyCommunity", allowNonAI4Math: true, sourceTier: "S5" },
  { id: "ahm-statements", label: "Association for Human Mathematics statements", mode: "page", url: "https://www.ahmath.org/statements", sourceType: "policy", defaultEventType: "PolicyCommunity", allowNonAI4Math: true, sourceTier: "S5" },
  { id: "imo-official", label: "International Mathematical Olympiad", mode: "page", url: "https://www.imo-official.org/", sourceType: "conference", defaultEventType: "PolicyCommunity", allowNonAI4Math: true, sourceTier: "S2" },
];

export function createOfficialSource(definition: SourceDefinition): ResearchSource {
  if (definition.mode === "rss") {
    return createRssSource({
      id: definition.id,
      label: definition.label,
      feedUrl: definition.url,
      sourceType: definition.sourceType,
      defaultEventType: definition.defaultEventType,
      defaultResearchArea: definition.defaultResearchArea,
      sourceTier: definition.sourceTier,
      allowNonAI4Math: definition.allowNonAI4Math,
    });
  }
  return createPageSource({
    id: definition.id,
    label: definition.label,
    url: definition.url,
    sourceType: definition.sourceType,
    defaultEventType: definition.defaultEventType,
    defaultResearchArea: definition.defaultResearchArea,
    sourceTier: definition.sourceTier,
    allowNonAI4Math: definition.allowNonAI4Math,
  });
}




