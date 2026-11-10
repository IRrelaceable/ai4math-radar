import { createRssSource } from "./rss";
import { createPageSource } from "./page";
import { createSitemapSource } from "./sitemap";
import { readCustomSources } from "./custom";
import type { EventType, ResearchArea, SourceType, SourceTier } from "@/types";
import type { ResearchSource } from "./index";

export interface SourceDefinition {
  id: string;
  label: string;
  mode: "rss" | "page" | "sitemap";
  url: string;
  /** Sitemap mode: keep only article paths, not site chrome. */
  pathPattern?: RegExp;
  /** Sitemap mode: pages read per run. */
  maxPages?: number;
  sourceType: SourceType;
  defaultEventType?: EventType;
  defaultResearchArea?: ResearchArea;
  /** Editorial evidence tier; the sync UI groups sources into S0-S4 boards. */
  sourceTier: SourceTier;
  allowNonAI4Math?: boolean;
  /** Narrow a broad feed to relevant items (see RssSourceOptions.includeKeywords). */
  includeKeywords?: string[];
  requireKeywords?: string[];
  excludeKeywords?: string[];
  matchTitleOnly?: boolean;
  eventTypeRules?: { keywords: string[]; eventType: EventType }[];
}

/**
 * Shared filters for maths department and society news feeds. Those feeds mix
 * awards and appointments with research press releases and seminar bulletins,
 * so only titles carrying ecosystem vocabulary survive. "chair" and "director"
 * cover appointments; "joins as" covers institutional membership announcements.
 */
const DEPARTMENT_NEWS_KEYWORDS = [
  "prize", "award", "medal", "elected", "named", "appointed", "honor",
  "honour", "congratulations", "director", "chair", "retire", "funding",
  "grant", "gift", "donat", "endow", "million", "scholarship", "fellowship",
  "invests", "call for", "nominations open", "applications open", "joins as",
  "launch", "memorial",
];

const DEPARTMENT_NEWS_EXCLUDES = [
  "obituary", "remembering", "passed away", "in memoriam", "lecturer",
  "postdoc", "faculty position", "job", "vacanc", "slides", "seminar",
];

/** Ordered: a call for nominations mentions the prize name, so it must win first. */
const DEPARTMENT_NEWS_RULES: { keywords: string[]; eventType: EventType }[] = [
  { keywords: ["call for", "nominations open", "applications open"], eventType: "PolicyCommunity" },
  { keywords: ["funding", "grant", "gift", "donat", "endow", "million", "scholarship", "fellowship", "invests"], eventType: "Funding" },
  { keywords: ["prize", "award", "medal", "elected", "named", "appointed", "honor", "honour", "congratulations", "director", "chair", "retire"], eventType: "People" },
];

/**
 * South-European institute feeds (ICMAT, CRM) mix Catalan, Spanish and English,
 * and carry courses, summer schools and outreach alongside awards and grants.
 * The shared department list covers the ecosystem vocabulary; the extra terms
 * keep training announcements, and the local-language forms are what those
 * feeds actually print. Postdoc and fellowship announcements stay in: training
 * and career funding is exactly what the education lane records.
 */
const INSTITUTE_ECOSYSTEM_KEYWORDS = [
  ...DEPARTMENT_NEWS_KEYWORDS,
  "course", "curs", "escuela", "escola", "summer school", "workshop", "jornada",
  "training", "outreach", "public talk", "charla", "conferencia",
  "artificial intelligence", "AI", "machine learning", "LLM",
  "mathemat", "matemát", "matemàt", "beca", "premi",
  "institute", "instituto", "centre", "center", "opens", "expands", "initiative",
];

const INSTITUTE_ECOSYSTEM_EXCLUDES = [
  "obituary", "remembering", "passed away", "in memoriam", "slides", "seminar recording",
];

/** Ordered: a call for nominations mentions the prize name, so it must win first. */
const INSTITUTE_EVENT_RULES: { keywords: string[]; eventType: EventType }[] = [
  { keywords: ["call for", "nominations open", "applications open"], eventType: "PolicyCommunity" },
  { keywords: ["funding", "grant", "gift", "donat", "endow", "million", "scholarship", "fellowship", "beca", "invests"], eventType: "Funding" },
  { keywords: ["prize", "award", "medal", "elected", "named", "appointed", "honor", "honour", "congratulations", "director", "chair", "retire", "premi", "talk", "lecture", "charla", "xerrada", "conferenc", "keynote", "interview"], eventType: "People" },
];

/**
 * Curated official source catalog. All entries are opt-in through the manual
 * sync UI; no scheduler is implied. URLs are kept here so coverage is visible
 * and a failed feed can be replaced without touching the pipeline.
 */
export const OFFICIAL_SOURCE_DEFINITIONS: SourceDefinition[] = [
  // Official lab / company blogs and news RSS.
  { id: "openai-news", label: "OpenAI News", mode: "rss", url: "https://openai.com/news/rss.xml", sourceType: "news", defaultEventType: "Research", sourceTier: "S1" },
  { id: "deepmind-blog", label: "Google DeepMind Blog", mode: "rss", url: "https://deepmind.google/blog/rss.xml", sourceType: "news", defaultEventType: "Research", sourceTier: "S1" },
  { id: "google-ai-blog", label: "Google AI Blog", mode: "rss", url: "https://blog.google/technology/ai/rss/", sourceType: "news", defaultEventType: "Research", sourceTier: "S1" },
  // Anthropic publishes no RSS at all, and model announcements land on
  // root-level slugs ("/claude-fable-and-mythos-5-2") rather than under /news,
  // so the sitemap is the only index. Announcements that carry maths work sit
  // in the opening paragraphs ("formalized … Fermat's Last Theorem"), which is
  // why the reader keeps the article excerpt and not just the meta description.
  { id: "anthropic-news", label: "Anthropic News & Research", mode: "sitemap", url: "https://www.anthropic.com/sitemap.xml", pathPattern: /\/(?:news|research)\/|^\/[a-z0-9]+(?:-[a-z0-9]+){3,}\/?$/, sourceType: "news", defaultEventType: "Research", sourceTier: "S1", maxPages: 10,
    // The site is mostly model and product news. A crypto post about zkSNARK
    // "proofs" cleared the generic classifier; this list keeps the source to
    // posts that actually talk about mathematics.
    includeKeywords: ["theorem", "formaliz", "lean", "math", "conjecture", "olympiad", "proof assistant", "prover", "autoformalization", "Fermat"] },

  // University and research-institution news. Ecosystem feeds are narrowed by
  // AI/maths keywords and then classified at source level, because institute
  // announcements rarely read like papers.
  // Department news carries the ecosystem's awards, appointments and funding.
  // A maths topic feed also carries unrelated science stories, so the keyword
  // list here is ecosystem vocabulary plus maths, not "any item".
  { id: "mit-news-math", label: "MIT News — Mathematics", mode: "rss", url: "https://news.mit.edu/rss/topic/mathematics", sourceType: "news", defaultEventType: "Institutions", allowNonAI4Math: true, includeKeywords: ["AI", "Fields Medal", "prize", "award", "elected", "named", "appointed", "funding", "grant", "fellowship", "scholars", "NSF", "Putnam", "institute", "launch"], excludeKeywords: ["Boston Public Radio", "QS ranks", "in the media", "Remembering", "obituary", "protein language models", "ethics of catastrophe", "American Physical Society", "welcomed new faculty"], eventTypeRules: [
    { keywords: ["Fields Medal", "prize", "award", "elected", "named", "appointed", "accept", "win", "scholarship"], eventType: "People" },
    { keywords: ["funding", "grant", "renewed", "invests", "supports"], eventType: "Funding" },
  ], sourceTier: "S1" },
  { id: "newton-institute", label: "Isaac Newton Institute for Mathematical Sciences", mode: "rss", url: "https://www.newton.ac.uk/feed/", sourceType: "news", defaultEventType: "Institutions", allowNonAI4Math: true, excludeKeywords: ["Remembering", "obituary", "passed away"], eventTypeRules: [
    { keywords: ["awarded funding", "funding"], eventType: "Funding" },
    { keywords: ["call for action", "applications open"], eventType: "PolicyCommunity" },
    { keywords: ["appointed", "elected", "prize", "award"], eventType: "People" },
  ], sourceTier: "S1" },
  { id: "ipam-ai-math", label: "IPAM — AI & mathematics", mode: "rss", url: "https://www.ipam.ucla.edu/feed/", sourceType: "news", defaultEventType: "Institutions", allowNonAI4Math: true, excludeKeywords: ["Remembering", "Obituary", "White Paper", "Annual Newsletter"], eventTypeRules: [
    // A call for nominations mentions the prize name, so it must be checked
    // before the award rule.
    { keywords: ["call for nominations", "applications open"], eventType: "PolicyCommunity" },
    { keywords: ["awarded", "prize", "elected", "named", "receives"], eventType: "People" },
    { keywords: ["renewed", "funding", "grant", "support"], eventType: "Funding" },
  ], sourceTier: "S1" },

  // Mathematics institutes and national societies. Their news feeds carry the
  // ecosystem's awards, appointments and funding, but also research press
  // releases and seminar bulletins; the shared filter keeps only the former.
  { id: "clay-math-news", label: "Clay Mathematics Institute", mode: "rss", url: "https://www.claymath.org/news/feed/", sourceType: "news", defaultEventType: "Institutions", allowNonAI4Math: true, excludeKeywords: ["obituary", "remembering", "passed away", "STEM for Britain"], matchTitleOnly: true, eventTypeRules: [
    { keywords: ["call for", "applications open"], eventType: "PolicyCommunity" },
    { keywords: ["prize", "award", "medal", "elected", "named"], eventType: "People" },
    { keywords: ["funding", "grant"], eventType: "Funding" },
  ], sourceTier: "S1" },
  { id: "austms-news", label: "Australian Mathematical Society", mode: "rss", url: "https://austms.org.au/feed/", sourceType: "news", defaultEventType: "Institutions", allowNonAI4Math: true, includeKeywords: DEPARTMENT_NEWS_KEYWORDS, excludeKeywords: DEPARTMENT_NEWS_EXCLUDES, matchTitleOnly: true, eventTypeRules: DEPARTMENT_NEWS_RULES, sourceTier: "S1" },
  { id: "matrix-institute", label: "MATRIX Institute", mode: "rss", url: "https://www.matrix-inst.org.au/feed/", sourceType: "news", defaultEventType: "Institutions", allowNonAI4Math: true, includeKeywords: DEPARTMENT_NEWS_KEYWORDS, excludeKeywords: DEPARTMENT_NEWS_EXCLUDES, matchTitleOnly: true, eventTypeRules: DEPARTMENT_NEWS_RULES, sourceTier: "S1" },

  // University department news. Same ecosystem vocabulary as the societies
  // above; the filters are what keep "new theorem proves..." stories out.
  { id: "columbia-math-news", label: "Columbia Mathematics", mode: "rss", url: "https://www.math.columbia.edu/feed/", sourceType: "news", defaultEventType: "Institutions", allowNonAI4Math: true, includeKeywords: DEPARTMENT_NEWS_KEYWORDS, excludeKeywords: DEPARTMENT_NEWS_EXCLUDES, matchTitleOnly: true, eventTypeRules: DEPARTMENT_NEWS_RULES, sourceTier: "S1" },
  { id: "ucla-math-news", label: "UCLA Mathematics", mode: "rss", url: "https://ww3.math.ucla.edu/feed/", sourceType: "news", defaultEventType: "Institutions", allowNonAI4Math: true, includeKeywords: DEPARTMENT_NEWS_KEYWORDS, excludeKeywords: DEPARTMENT_NEWS_EXCLUDES, matchTitleOnly: true, eventTypeRules: DEPARTMENT_NEWS_RULES, sourceTier: "S1" },
  { id: "wisc-math-news", label: "University of Wisconsin Mathematics", mode: "rss", url: "https://www.math.wisc.edu/feed/", sourceType: "news", defaultEventType: "Institutions", allowNonAI4Math: true, includeKeywords: DEPARTMENT_NEWS_KEYWORDS, excludeKeywords: DEPARTMENT_NEWS_EXCLUDES, matchTitleOnly: true, eventTypeRules: DEPARTMENT_NEWS_RULES, sourceTier: "S1" },
  { id: "ubc-math-news", label: "UBC Mathematics", mode: "rss", url: "https://www.math.ubc.ca/news/feed/", sourceType: "news", defaultEventType: "Institutions", allowNonAI4Math: true, includeKeywords: DEPARTMENT_NEWS_KEYWORDS, excludeKeywords: DEPARTMENT_NEWS_EXCLUDES, matchTitleOnly: true, eventTypeRules: DEPARTMENT_NEWS_RULES, sourceTier: "S1" },
  { id: "icmat-news", label: "ICMAT — Instituto de Ciencias Matemáticas", mode: "rss", url: "https://www.icmat.es/feed/", sourceType: "news", defaultEventType: "Institutions", allowNonAI4Math: true, includeKeywords: INSTITUTE_ECOSYSTEM_KEYWORDS, excludeKeywords: INSTITUTE_ECOSYSTEM_EXCLUDES, matchTitleOnly: true, eventTypeRules: INSTITUTE_EVENT_RULES, sourceTier: "S1" },
  { id: "crm-news", label: "CRM — Centre de Recerca Matemàtica", mode: "rss", url: "https://www.crm.cat/feed/", sourceType: "news", defaultEventType: "Institutions", allowNonAI4Math: true, includeKeywords: INSTITUTE_ECOSYSTEM_KEYWORDS, excludeKeywords: INSTITUTE_ECOSYSTEM_EXCLUDES, matchTitleOnly: true, eventTypeRules: INSTITUTE_EVENT_RULES, sourceTier: "S1" },

  // Funding and foundation announcements. These feeds are general science
  // news, so they stay narrowed to AI/mathematics wording; without the filters
  // they would drown the ecosystem classes in climate and biomedicine items.
  { id: "simons-foundation-news", label: "Simons Foundation News", mode: "rss", url: "https://www.simonsfoundation.org/feed/", sourceType: "news", defaultEventType: "Institutions", allowNonAI4Math: true, includeKeywords: ["mathemat", "artificial intelligence", "AI", "Fields Medal", "Fellows-to-Faculty"], excludeKeywords: ["Look Back", "Remembering", "Obituary"], matchTitleOnly: true, eventTypeRules: [
    { keywords: ["award", "fellowship", "grant", "funding"], eventType: "Funding" },
    { keywords: ["appointed", "named", "elected", "receives"], eventType: "People" },
  ], sourceTier: "S1" },
  { id: "simons-ai-math-funding", label: "Simons Foundation AI-era mathematics effort", mode: "page", url: "https://www.simonsfoundation.org/news/simons-foundation-launches-15m-effort-to-help-mathematicians-navigate-ai-era/", sourceType: "funding", defaultEventType: "Funding", allowNonAI4Math: true, sourceTier: "S1" },
  // Agency news is where "NSF invests/awards ..." announcements appear. The
  // feed is general science, so only math/AI titles survive; a title without a
  // funding verb stays an institutional announcement, never a grant.
  { id: "nsf-news", label: "U.S. National Science Foundation News", mode: "rss", url: "https://www.nsf.gov/rss/rss_www_news.xml", sourceType: "news", defaultEventType: "Institutions", allowNonAI4Math: true, includeKeywords: ["mathemat", "statistic", "artificial intelligence", "AI", "machine learning", "computing"], excludeKeywords: ["Podcast:", "laser", "dwarf planet", "DNA", "prosthetic", "holographic", "circuit boards", "semiconductor technologies"], matchTitleOnly: true, eventTypeRules: [
    { keywords: ["policy", "statement", "partnership", "memorandum"], eventType: "PolicyCommunity" },
    { keywords: ["prize", "award", "named", "appointed", "director", "fellowship"], eventType: "People" },
    { keywords: ["invests", "investment", "funding", "grant", "initiative", "launch", "supports", "million"], eventType: "Funding" },
  ], sourceTier: "S1" },

  // Education, training and summer-school entry points (folded into the
  // Institutions & Education class).
  { id: "aimo-education", label: "AIMO Education & Progress Prize", mode: "page", url: "https://www.aimoprize.com/", sourceType: "education", defaultEventType: "Institutions", allowNonAI4Math: true, sourceTier: "S1" },
  { id: "mathematics-in-lean", label: "Mathematics in Lean", mode: "page", url: "https://leanprover-community.github.io/mathematics_in_lean/", sourceType: "education", defaultEventType: "Institutions", allowNonAI4Math: true, sourceTier: "S1" },

  // Additional official AI research/news feeds.
  { id: "microsoft-research", label: "Microsoft Research", mode: "rss", url: "https://www.microsoft.com/en-us/research/feed/", sourceType: "news", defaultEventType: "Research", sourceTier: "S1" },
  { id: "nvidia-ai-blog", label: "NVIDIA AI Blog", mode: "rss", url: "https://blogs.nvidia.com/feed/", sourceType: "news", defaultEventType: "Research", sourceTier: "S1" },
  { id: "amazon-science", label: "Amazon Science", mode: "rss", url: "https://www.amazon.science/index.rss", sourceType: "news", defaultEventType: "Research", sourceTier: "S1" },

  // Research metadata and artifact discovery indexes.
  { id: "openalex", label: "OpenAlex", mode: "page", url: "https://openalex.org/", sourceType: "conference", defaultEventType: "Research", sourceTier: "S1" },
  { id: "crossref", label: "Crossref", mode: "page", url: "https://www.crossref.org/", sourceType: "conference", defaultEventType: "Research", sourceTier: "S1" },
  { id: "semantic-scholar", label: "Semantic Scholar", mode: "page", url: "https://www.semanticscholar.org/", sourceType: "conference", defaultEventType: "Research", sourceTier: "S1" },

  // Community discussion and proof-assistant ecosystems.
  { id: "lean-community", label: "Lean Community", mode: "page", url: "https://leanprover-community.github.io/", sourceType: "education", defaultEventType: "Institutions", sourceTier: "S1" },
  // Public researcher viewpoints, talks and personal research blogs.
  { id: "terence-tao-blog", label: "Terence Tao's blog", mode: "rss", url: "https://terrytao.wordpress.com/feed/", sourceType: "blog", defaultEventType: "People", allowNonAI4Math: true, includeKeywords: ["artificial intelligence", "AI", "machine learning", "LLM", "ChatGPT", "Lean", "proof assistant"], matchTitleOnly: true, sourceTier: "S2" },
  { id: "timothy-gowers-blog", label: "Timothy Gowers' blog", mode: "rss", url: "https://gowers.wordpress.com/feed/", sourceType: "blog", defaultEventType: "People", allowNonAI4Math: true, includeKeywords: ["artificial intelligence", "AI", "machine learning", "LLM", "ChatGPT", "Leiden Declaration"], matchTitleOnly: true, sourceTier: "S2" },
  { id: "scott-aaronson-blog", label: "Scott Aaronson's blog", mode: "rss", url: "https://scottaaronson.blog/?feed=rss2", sourceType: "blog", defaultEventType: "People", allowNonAI4Math: true, requireKeywords: ["AI", "math"], excludeKeywords: ["vote", "election"], sourceTier: "S2" },
  { id: "xena-project", label: "Xena Project — Kevin Buzzard", mode: "rss", url: "https://xenaproject.wordpress.com/feed/", sourceType: "blog", defaultEventType: "People", allowNonAI4Math: true, includeKeywords: ["AI", "artificial intelligence", "machine learning", "LLM", "ChatGPT", "Anthropic", "Copilot", "Lean", "formal", "automat", "proof assistant", "mathematician"], excludeKeywords: ["grieve", "obituary"], matchTitleOnly: true, eventTypeRules: [
    // Teaching posts announce courses and workshops; they belong to the
    // Institutions & Education class, not to the author's people thread.
    { keywords: ["workshop", "course", "summer school", "teaching", "students", "curriculum", "lecture series"], eventType: "Institutions" },
  ], sourceTier: "S2" },
  { id: "gil-kalai-blog", label: "Gil Kalai's blog", mode: "rss", url: "https://gilkalai.wordpress.com/feed/", sourceType: "blog", defaultEventType: "People", allowNonAI4Math: true, includeKeywords: ["artificial intelligence", "AI", "machine learning", "LLM", "ChatGPT", "AlphaProof", "formal proof", "Lean", "automat", "AGI"], matchTitleOnly: true, sourceTier: "S2" },
  { id: "quanta-mathematics", label: "Quanta Magazine — Mathematics", mode: "rss", url: "https://www.quantamagazine.org/mathematics/feed/", sourceType: "blog", defaultEventType: "People", allowNonAI4Math: true, includeKeywords: ["artificial intelligence", "AI", "machine learning", "LLM"], matchTitleOnly: true, sourceTier: "S3" },

  // Policy, declarations and community sources.
  { id: "math-and-ai", label: "Math & AI declarations", mode: "page", url: "https://mathandai.org/", sourceType: "policy", defaultEventType: "PolicyCommunity", allowNonAI4Math: true, sourceTier: "S4" },
  { id: "ahm-statements", label: "Association for Human Mathematics statements", mode: "page", url: "https://www.ahmath.org/statements", sourceType: "policy", defaultEventType: "PolicyCommunity", allowNonAI4Math: true, sourceTier: "S4" },
  { id: "imo-official", label: "International Mathematical Olympiad", mode: "page", url: "https://www.imo-official.org/", sourceType: "education", defaultEventType: "PolicyCommunity", allowNonAI4Math: true, sourceTier: "S1" },
];
/**
 * One source-of-truth tier table. Built-in sources and official catalog
 * sources share this lookup; manual event-level sourceTier always wins in
 * applyTrustModel before this table is consulted.
 */
export const SOURCE_TIER_TABLE: Record<string, SourceTier> = {
  arxiv: "S0",
  github: "S0",
  ...Object.fromEntries(
    OFFICIAL_SOURCE_DEFINITIONS.map((definition) => [definition.id, definition.sourceTier])
  ),
};

function hostFromUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

const SOURCE_HOST_TIER_TABLE: Record<string, SourceTier> = {
  "arxiv.org": "S0",
  "export.arxiv.org": "S0",
  "github.com": "S0",
  ...Object.fromEntries(
    OFFICIAL_SOURCE_DEFINITIONS.map((definition) => [
      hostFromUrl(definition.url) ?? definition.id,
      definition.sourceTier,
    ])
  ),
};

/**
 * Resolve a source tier from the catalog. This intentionally does not guess:
 * sourceType fallback lives in lib/verification.ts.
 */
export function resolveSourceTier(input: {
  sourceId?: string;
  sourceUrl?: string;
}): SourceTier | undefined {
  const customSources = readCustomSources();
  if (input.sourceId) {
    const custom = customSources.find((source) => source.id === input.sourceId);
    if (custom) return custom.sourceTier;
    if (SOURCE_TIER_TABLE[input.sourceId]) return SOURCE_TIER_TABLE[input.sourceId];
  }

  const host = hostFromUrl(input.sourceUrl);
  if (host) {
    const custom = customSources.find(
      (source) => hostFromUrl(source.url) === host
    );
    if (custom) return custom.sourceTier;
    if (SOURCE_HOST_TIER_TABLE[host]) return SOURCE_HOST_TIER_TABLE[host];
  }
  if (host?.endsWith(".github.com")) return "S0";
  return undefined;
}

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
      includeKeywords: definition.includeKeywords,
      requireKeywords: definition.requireKeywords,
      excludeKeywords: definition.excludeKeywords,
      matchTitleOnly: definition.matchTitleOnly,
      eventTypeRules: definition.eventTypeRules,
    });
  }
  if (definition.mode === "sitemap") {
    return createSitemapSource({
      id: definition.id,
      label: definition.label,
      sitemapUrl: definition.url,
      pathPattern: definition.pathPattern,
      sourceType: definition.sourceType,
      defaultEventType: definition.defaultEventType,
      defaultResearchArea: definition.defaultResearchArea,
      sourceTier: definition.sourceTier,
      allowNonAI4Math: definition.allowNonAI4Math,
      includeKeywords: definition.includeKeywords,
      excludeKeywords: definition.excludeKeywords,
      matchTitleOnly: definition.matchTitleOnly,
      eventTypeRules: definition.eventTypeRules,
      maxPages: definition.maxPages,
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


