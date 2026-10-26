# AI4Math Ecosystem Radar · AI4Math 生态雷达

**English** · [中文](README.md)

An ecosystem intelligence platform for **AI for Mathematics (AI4Math)**. Instead of
just listing papers, it tracks six classes of ecosystem events — **Research · People ·
Institutions · Funding · Education · Policy & Community** — and answers what happened,
who is moving the field, why it matters, and how it connects to earlier work.

Built with **Next.js (App Router) + React + TypeScript + Tailwind CSS**. Ships with a
bundled dataset so it runs with zero configuration; Prisma + PostgreSQL is the optional
production data layer.

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Without a database it serves the bundled demo dataset
through the same store interface the API uses.

To run against PostgreSQL:

```bash
cp .env.example .env     # set DATABASE_URL
npm run db:push          # create tables
npm run db:seed          # load data/seed/events.ts
npm run dev
```

> The UI defaults to Simplified Chinese with a `中文 / EN` toggle in the header.

## What's inside

- **Six-class event model** — Research is one class among six, not the whole schema.
  Papers, models, grants, courses and policy docs attach to events; they are never
  primary classes.
- **Trust model** — three separate labels on every event, never conflated:
  `verificationStatus` (claimed → independently verified / disputed / retracted),
  `evidenceLevel` (E0–E4), and `sourceTier` (S1–S5), plus an append-only
  `verificationHistory` trail. Glossary on `/methodology`.
- **Curated + automated data** — 98 bundled events (87 sourced + 11 labelled demos),
  plus a live ingest pipeline (`arXiv` / `GitHub`) whose output is tagged `automated`
  and merged by slug.
- **Research map, topics, timeline, trends** — lineage between events, per-topic
  stats, and a 90-day momentum panel.
- **Math-aware rendering** — inline LaTeX in prose is rendered to Unicode on the
  server, so no client-side math bundle is shipped.

## Routes

| route | purpose |
| --- | --- |
| `/` | Dashboard: six-class overview, latest events, momentum, pipeline |
| `/latest` | Event feed with class/area/status filters and search |
| `/timeline` | Chronological view grouped by year |
| `/topics` · `/topics/[topic]` | Topic list and detail (progress, trends, papers) |
| `/research/[slug]` | Event detail: what happened, why it matters, sources, verification history |
| `/research-map` | Six classes × research areas with recorded lineage |
| `/sources` | Manual source sync status, cursors, pending-review count |
| `/search` · `/methodology` · `/about` | Full-site search, trust-label glossary, data policy |

## API

| endpoint | purpose |
| --- | --- |
| `GET /api/events?type=&area=&q=&limit=` | list events |
| `GET /api/events/[slug]` | one event |
| `GET /api/topics` · `GET /api/topics/[slug]` | topic statistics |
| `GET /api/search?q=` | full-site search |
| `GET /api/research-map` | map nodes/edges |
| `GET /api/trends?windowDays=90` | recent vs. previous activity per area |
| `GET /api/sources` | source registry + last sync + pending count |
| `POST /api/agents/ingest` | run the ingest pipeline (`source: "arxiv" \| "github" \| mock`) |

```bash
curl "http://localhost:3000/api/events?area=Theorem%20Proving&limit=5"
curl -X POST http://localhost:3000/api/agents/ingest \
     -H "content-type: application/json" -d '{ "source": "arxiv", "limit": 20 }'
```

## Project structure

```text
app/                  # routes + API route handlers
components/           # layout, research, topics, search, ui
lib/
  db/                 # ResearchStore contract · SeedStore · PrismaStore
  i18n/               # zh/en dictionaries + localize()
  math.ts             # server-side LaTeX → Unicode
  verification.ts     # trust model (status / evidence / tier)
  sources/            # ResearchSource: mock · arXiv · GitHub
agents/researchTracker/   # tracker · classifier · summarizer
data/seed/            # bundled events + ecosystem scenarios
prisma/               # schema + seeder
types/                # domain types
```

The data line is:

```text
front-end → API (route handlers) → ResearchStore → ecosystem ResearchEvent
```

`lib/db/index.ts` picks the store: `DATABASE_URL` set → `PrismaStore`, unset →
`SeedStore`. Both implement the same `ResearchStore` interface, so pages and routes
never care which is active.

## Data policy

- No invented results, arXiv IDs or URLs — an unverifiable field is left empty, and an
  item whose source URL could not be confirmed is dropped rather than shipped with a
  broken link.
- Publisher-reported results stay labelled as claims, with denominators preserved.

- Synthetic demo scenarios are flagged `isDemo` and rendered with a `demo` tag.

## Extending

Implement one interface to add a live source:

```ts
export interface ResearchSource {
  id: string;
  label: string;
  fetchRecent(options?: { limit?: number }): Promise<RawResearchItem[]>;
}
```

Register it in `liveResearchSources` (`lib/sources/index.ts`) and
`POST /api/agents/ingest` will run the pipeline
`Source → RawResearchItem → Normalizer → Classifier → ResearchEvent`.

The classifier is keyword-based today; swap in an LLM call behind the same contract via
`getLLMProvider()`.



