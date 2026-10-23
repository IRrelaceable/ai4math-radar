# AI4Math Ecosystem Radar

An ecosystem intelligence platform for **AI for Mathematics (AI4Math)**: instead of
listing papers, it tracks six primary **AI4Math Ecosystem Events** — Research,
People, Institutions, Funding, Education and Policy & Community — and answers what
happened, who is moving the field, why it matters, and how it connects to earlier work.

Built with **Next.js (App Router) + React + TypeScript + Tailwind CSS**, with
**Prisma + PostgreSQL** as the production data layer and a bundled demo store so the
site runs with zero configuration.

---

## 1. Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. That's it — without a database the app serves the
bundled demo dataset through the same store interface the API uses.

Optional, to run against PostgreSQL:

```bash
cp .env.example .env            # set DATABASE_URL
npx prisma db push              # create tables
npm run db:seed                 # load data/seed/events.ts
npm run dev
```

Other scripts:

| script | purpose |
| --- | --- |
| `npm run dev` | development server |
| `npm run build` / `npm start` | production build / serve |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run db:generate` | regenerate the Prisma client |
| `npm run db:push` | sync `prisma/schema.prisma` to the database |
| `npm run db:seed` | seed the database from `data/seed/events.ts` |

---

## 1.5 Language / 语言

界面默认**简体中文**，右上角有 `中文 / EN` 开关（写入 `lang` cookie，服务端渲染随请求切换）。
UI chrome —— 导航、栏目标题、按钮、标签词典、方法论与关于页 —— 均已双语；研究内容
（事件标题、摘要、论文名、作者、领域名）**保留英文原文**，这是研究记录的惯例，也避免
机器翻译改变技术断言的强度。词典在 `lib/i18n/`（`dict.ts` 核心键 + `dict.pages.ts` +
`dict.components.ts`），新增界面文案时在 zh/en 两侧同时补键。

The UI defaults to Simplified Chinese with a `中文 / EN` toggle in the header (a `lang`
cookie read on every server render). Research content — event titles, summaries, paper
names, authors, area names — stays in the original English on purpose.

---

## 2. Routes

| route | purpose |
| --- | --- |
| `/` | Ecosystem Radar: six-class overview, latest events, active areas, momentum and pipeline |
| `/latest` | Ecosystem feed: six primary class chips, secondary area filter, search, date/importance sort |
| `/timeline` | Chronological view grouped by year, with year jump links and event-type filter |
| `/topics` | Topic list with event counts computed from the store |
| `/topics/[topic]` | Topic detail: recent progress, quantity, time trend, papers, models, benchmarks |
| `/research/[slug]` | Ecosystem Event detail: type-specific metadata, What happened / Why it matters / source / related works / verification history |
| `/research-map` | Six ecosystem classes × research-area map with recorded lineage |
| `/sources` | Manual source status, incremental cursor, sync results and pending-review count |
| `/search` | Full-site search (events, papers, topics, models, benchmarks) |
| `/methodology` | How to read the trust labels (verification / evidence / source tier / event type) |
| `/about` | Data model, pipeline, data policy, roadmap |

The dashboard also carries a **Momentum** panel: recorded events in the last 90 days
per research area, compared with the previous window.

## 3. API routes

| endpoint | purpose |
| --- | --- |
| `GET /api/events?type=&area=&sort=&q=&limit=` | list ecosystem events (`sort=date|importance`) |
| `GET /api/sources` | source registry, last sync state and pending-review count |
| `GET /api/events/[slug]` | one ecosystem event |
| `GET /api/topics` | topic statistics |
| `GET /api/topics/[slug]` | topic statistics + its events |
| `GET /api/search?q=` | full-site search |
| `GET /api/research-map` | map nodes/edges |
| `GET /api/trends?windowDays=90` | recent-vs-previous activity per research area |
| `POST /api/agents/ingest` | agent pipeline: `Source → RawResearchItem → classifier → ResearchEvent` (mock offline by default; `source: "arxiv"` / `"github"` for live runs) |

Example:

```bash
curl "http://localhost:3000/api/events?area=Theorem%20Proving&limit=5"
curl "http://localhost:3000/api/trends?windowDays=90"

# offline demo pipeline
curl -X POST http://localhost:3000/api/agents/ingest \
     -H "content-type: application/json" \
     -d '{ "useMockSource": true }'

# live pipeline (hits the public arXiv API / GitHub API, persists accepted events)
curl -X POST http://localhost:3000/api/agents/ingest \
     -H "content-type: application/json" \
     -d '{ "source": "arxiv", "limit": 20 }'
```

---

## 4. Project structure

```text
ai4math-tracker/
├── app/
│   ├── page.tsx               # Dashboard (+ Momentum / trend panel)
│   ├── latest/                # Research feed
│   ├── timeline/              # Chronological view with year anchors
│   ├── topics/                # Topic list + [topic] detail
│   ├── research/[slug]        # Research Event detail (+ verification history)
│   ├── research-map/          # Visual research map
│   ├── search/
│   ├── methodology/           # Trust-label glossary and data policy
│   ├── about/
│   └── api/                   # Route handlers (events, topics, search, map, trends, agents)
├── components/
│   ├── layout/                # Header, Footer
│   ├── research/              # EventCard, EventGrid, FeedControls, TimelineControls, Pipeline
│   ├── topics/                # TopicBar, TrendChart, TrendPanel
│   ├── research-map/          # ResearchMapTree
│   ├── search/                # SearchBox, SearchResults
│   └── ui/                    # AreaBadge, TrustBadges
├── lib/
│   ├── db/                    # store contract, SeedStore, PrismaStore, ingested-file cache
│   ├── ecosystem.ts           # six-class normalization boundary
│   ├── llm/provider.ts        # LLM API interface (mock + openai-compatible)
│   ├── sources/               # ResearchSource + mock / arXiv / GitHub sources
│   ├── trends.ts              # windowed activity trends
│   ├── verification.ts        # trust model: status, evidence level, source tier, type
│   └── utils.ts
├── agents/researchTracker/    # tracker.ts · classifier.ts · summarizer.ts
├── data/seed/events.ts        # 87 sourced events + 11 labelled ecosystem demos (98 total)
├── data/seed/ecosystem.ts     # synthetic scenarios for People/Institutions/Funding/Education/Policy
├── data/ingested/             # pipeline cache + source-status.json (git-ignored)
├── prisma/schema.prisma       # PostgreSQL schema
├── prisma/seed.ts             # database seeder
├── types/                     # domain types
└── README.md
```

### Main line of the project

```text
front-end → API (route handlers) → data layer (ResearchStore) → ecosystem ResearchEvent
```

`lib/db/index.ts` picks the data source:

* `DATABASE_URL` set → `PrismaStore` (PostgreSQL via Prisma)
* `DATABASE_URL` unset → `SeedStore` (bundled demo data)

Both implement the same `ResearchStore` interface (`lib/db/store.ts`), so pages and
API routes never care which one is active.

---

## 5. Data model

The database entity remains `ResearchEvent` for compatibility, but its primary
`eventType` is now one of six ecosystem classes. Papers, models, grants, courses
and policy documents are attached content — never primary event classes.

```text
ResearchEvent
├── title · slug · summary · significance · date
├── eventType (six classes) → researchArea → subArea
├── researchEventType · metadata · importanceScore (subjective)
├── verificationStatus · evidenceLevel · sourceTier · reviewStatus
├── sourceType · sourceUrl · paperUrl · githubUrl
├── problem · keyContributions[]
├── authors[] · institution · models[] · benchmarks[] · datasets[]
├── papers[]        (ResearchEventPaper  join)
├── authors[]       (ResearchEventAuthor join)
└── relatedWorks[]  (ResearchEventRelatedWork: previous | followup | related)
```

Tables: `ResearchEvent`, `ResearchArea`, `Paper`, `Author`, `Institution`,
`Model`, `Benchmark`, `Dataset`, `ResearchEventPaper`, `ResearchEventAuthor`,
`ResearchEventRelatedWork`.

### Manual source synchronization

There is no scheduler. Open `/sources` (or `GET /api/sources`) to inspect each
source's last success, last error and incremental cursor, then trigger a manual
`POST /api/agents/ingest` with:

```json
{ "source": "arxiv", "since": "2026-10-01", "persist": true }
```

arXiv and GitHub filter fetched items by `since`; accepted events are merged by
slug, so overlapping dates are safe. Automated records start as
`reviewStatus: "pending"` and remain visibly marked until reviewed.
### Importance scores are explicitly subjective

`importanceScore` is optional. When present it is a 0–100 **AI-assisted
subjective assessment**, always displayed with an explanatory note and never
confused with verification/evidence/source-tier labels. Date is the default
sort; importance is only available as an explicit user choice. Events without
a score are never given an invented number.

### Trust model (three separate labels)

Every event carries three labels, kept deliberately separate (glossary in
`/methodology`, derivation in `lib/verification.ts`):

| field | meaning |
| --- | --- |
| `verificationStatus` | claimed · paper_released · under_verification · partially_verified · independently_verified · disputed · corrected · retracted |
| `evidenceLevel` | E0 none · E1 primary claim · E2 research record · E3 inspectable artifact · E4 independent check |
| `sourceTier` | S1 primary research · S2 official announcement · S3 independent · S4 media · S5 community |
| `eventType` | Research · People · Institutions · Funding · Education · Policy & Community |
| `researchEventType` | optional legacy Research subtype: Discovery · Proof · Formalization · Competition · System · Benchmark · Dataset · Infrastructure · Controversy |
| `verificationHistory[]` | append-only trail of how the corroboration state changed |

Curated events set these explicitly where the derived rule would mislead
(e.g. graded competition announcements stay `claimed`); automated pipeline
output derives them from the source type and is tagged `provenance: "automated"`.

### Data: curated events + automated ingest

`data/seed/events.ts` ships **98 bundled events**: **87 sourced entries** across
all 10 research areas plus **11 clearly-labelled demo scenarios** used to
exercise every ecosystem class. The sourced entries were compiled from primary sources that
was fetched and confirmed during curation (arXiv abs pages, the official
`nature.com` article, Anthropic research posts, or the `openai/math` repository's
own `history.md`). The 2026 wave — OpenAI's manuscript collection, Claude's FLT
formalization, the Riemann-zeta lower bound, the Navier–Stokes autoformalization
dispute, DeepMind's Aletheia and AI co-mathematician — is recorded with its
corrections and denominators (e.g. 722 manuscripts released → 3 withdrawn →
719 remaining), not as "722 proven theorems".

On top of that, `POST /api/agents/ingest {"source": "arxiv" | "github"}` runs the
live pipeline and writes accepted events to `data/ingested/events.json`. They are
merged into the store by slug, shown with an `automated` tag, and carry
`provenance: "automated"` until reviewed. Delete that file to reset.

Rules applied while building the curated dataset:

* no invented results, arXiv IDs or URLs — a field that could not be verified is
  left empty, and an item whose **source URL could not be confirmed was dropped
  entirely** rather than shipped with a broken link;
* publisher-reported results stay labelled as claims, with denominators preserved;
* synthetic examples used by the mock agent pipeline are flagged
  `isDemo: true` and rendered with a `demo` tag on the page.

> Operational note: `next dev` and `next build` share the `.next` directory —
> don't run them at the same time (stop one first, or delete `.next`).

---

## 6. Configuring the LLM API

`lib/llm/provider.ts` defines the interface; the default provider is offline.

```bash
LLM_PROVIDER=openai-compatible
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4o-mini
```

Any OpenAI-compatible chat-completions endpoint works. The summarizer falls back to
deterministic text if the call fails, so the site never depends on the API.

---

## 7. Adding a real Research Source (V2)

Implement one interface and register it:

```ts
// lib/sources/index.ts
export interface ResearchSource {
  id: string;
  label: string;
  fetchRecent(options?: { limit?: number }): Promise<RawResearchItem[]>;
}
```

1. Add `conferenceSource`, `openreviewSource`, … implementing it.
2. Register it in `liveResearchSources` (`lib/sources/index.ts`).
3. `POST /api/agents/ingest {"source": "..."}` already runs the pipeline
   `Source → RawResearchItem → Normalizer → Classifier → ResearchEvent`
   and persists accepted events to `data/ingested/events.json`
   (or to PostgreSQL when you wire the Prisma store in).

The bundled live sources:

| source | what it does |
| --- | --- |
| `arxiv` | public arXiv API, default scope `cat:cs.LO OR cat:math.LO OR ti:math* OR ti:proof* OR ti:lean* OR ti:conjecture*` (override with `"query"`) |
| `github` | a short curated repository watch-list via the public GitHub API |
| `mock` | offline synthetic items, the default — keeps `npm run dev` network-free |

### Extending the agent

| file | responsibility |
| --- | --- |
| `agents/researchTracker/tracker.ts` | pipeline orchestration + trace |
| `agents/researchTracker/classifier.ts` | “is it AI4Math?”, research area |
| `agents/researchTracker/summarizer.ts` | summary / significance text |

Replace the rule-based classifier with an LLM call by using the same
input/output contract and `getLLMProvider()`.

---

## 8. Current limitations

* The classifier is keyword-based: live arXiv items are screened by strong
  math + AI signals and most noise is rejected, but some papers are still
  misfiled — which is why pipeline output is labelled `automated` and shown
  separately from curated entries.
* Ingested events live in a JSON file cache (`data/ingested/`); move them to
  PostgreSQL (or dedupe against the store) when a database is configured.
* Search is plain text matching — no vector database, no RAG (by design).
* Research Map is a tree with lineage entries, not a graph layout (V6).
* Trend detection counts events; it says nothing about correctness — read it
  together with the verification labels.
* No accounts, comments, recommendations, permissions or mobile app (V1 scope).

## 9. Suggested next step

**Research Lineage / Research Graph (V6)** and an **LLM-backed classifier**
(`getLLMProvider()` behind the same contract) are the two highest-value
follow-ups: the `relatedWorks(relation: previous | followup | related)` field
already records the edges a graph view needs, and a model-backed classifier
would replace the keyword rules for live sources. An `en/zh` locale switch and
a corrections workflow (GitHub-issue based) come next.



