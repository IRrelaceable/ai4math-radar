# AI4Math Ecosystem Radar · AI4Math 生态雷达

**English** · [中文](README.md)

An ecosystem intelligence platform for **AI for Mathematics (AI4Math)**. Instead of
just listing papers, it tracks five classes of ecosystem events — **Research · People ·
Institutions & Education · Funding · Policy & Community** — and answers what happened,
who is moving the field, why it matters, and how it connects to earlier work.

Built with **Next.js (App Router) + React + TypeScript + Tailwind CSS** and published as
a **fully static site**: data is written to JSON at build time, pages are exported as
HTML, and GitHub Actions pulls new events on a schedule and republishes. No server
process, no database required.

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. `predev` regenerates `public/data/{zh,en}.json` from
`data/seed` and `data/ingested` before the dev server starts.

The language is fixed at compile time, so one dev server serves one language. To see the
English build at the same time, start a second terminal:

```bash
npm run dev:en   # http://localhost:3001/en/
```

Each server keeps its own build directory (`.next`, `.next-en`); the header language
switch points at the matching port in development.

## Build and deploy

The site is exported twice — the language is fixed per build and distinguished by path:

| Language | Path | Build |
| --- | --- | --- |
| Chinese | `/` | `SITE_LANG=zh next build` |
| English | `/en/` | `SITE_LANG=en next build` |

One command runs both builds and merges them:

```bash
SITE_BASE=/ai4math-radar npm run build:site
```

Output lands in `dist/` (Chinese) and `dist/en/` (English). `SITE_BASE` is the sub-path
the site is served from: `/<repo>` for a GitHub project page, empty for a user page or a
custom domain.

Deployment is handled by [`.github/workflows/publish.yml`](.github/workflows/publish.yml):

1. runs on every push to `main`, every 6 hours, and on manual dispatch;
2. scheduled/manual runs first execute `npm run sync:all` and commit the refreshed
   `data/ingested/*.json` back to the repo — those files are the only state carried
   between runs;
3. then builds both languages and publishes through GitHub Pages.

To enable it:

- set **Settings → Pages → Source** to **GitHub Actions**;
- add `LLM_PROVIDER`, `LLM_API_URL`, `LLM_API_KEY`, `LLM_MODEL` under
  **Settings → Secrets and variables → Actions** (without them ingest still runs with a
  mock summarizer, which only exercises the pipeline);
- set a repository variable `SITE_BASE` if the sub-path is not the repository name.

## What's inside

- **Five-class event model** — Research is one class among five, not the whole schema.
  Papers, models, grants, courses and policy docs attach to events; they are never
  primary classes. Education lives under Institutions rather than as a separate class.
- **Trust model** — two separate labels on every event, never conflated:
  `evidenceLevel` (E0–E4) and `sourceTier` (S0–S4), plus an append-only
  `verificationHistory`. Glossary at `/methodology`.
- **Curated + automated** — bundled events plus live ingestion, deduplicated by slug and
  source URL. Automated entries are marked `automated`; curated prose wins.
- **Topics / timeline / trends** — topic pages carry lineage and per-topic statistics,
  plus an activity panel.
- **Math rendering** — inline LaTeX is rendered to Unicode at build time, so no math
  library ships to the client.
- **Bilingual** — Chinese at the root, English under `/en/`, sharing one dataset and one
  trust model.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Dashboard: five-class overview, latest events, activity |
| `/latest` | Event feed with class / area / evidence / tier / time filters and search |
| `/timeline` | Year-grouped timeline |
| `/topics` · `/topics/[topic]` | Topic list and detail (progress, trends, papers, lineage) |
| `/research/[slug]` | Event detail: what happened, why it matters, sources, verification history |
| `/sources` | Per-source status and cursor from the last sync (read-only; see below) |
| `/search` · `/methodology` · `/about` | Site search, trust-label glossary, data policy |

> `/research-map` is kept as a compatibility entry that redirects to `/topics`.

## Ingestion

Ingestion is a CLI script. The published site is a static export with no server, so
there is no always-on button in production:

```bash
npm run sync                 # incremental pull of all configured sources
npm run sync -- --source=arxiv
npm run sync -- --all --since=2026-01-01
```

`npm run dev` / `npm run dev:en` also start a loopback-only endpoint on
`127.0.0.1:3100`, so in local development the "Local sync" card on `/sources` shows a
"Sync now" button that runs the same pipeline (ingest + rebuild); refresh the page
afterwards. The button is not part of the published build.

It reads `LLM_PROVIDER` / `LLM_API_URL` / `LLM_API_KEY` / `LLM_MODEL` from `.env` (or
the environment) to produce structured summaries, then writes to `data/ingested/`:

| File | Contents |
| --- | --- |
| `events.json` | Accepted automatically ingested events |
| `fingerprints.json` | Processed-item fingerprints, to avoid re-summarizing |
| `source-status.json` | Last success / failure / cursor per source |
| `custom-sources.json` | Additional RSS / page sources |

These files must be committed so GitHub Actions can resume from the previous cursor. A
sync also refreshes `public/data/`, so a local page refresh shows new events.

The detail page's "Event thread" places an event on the timelines of the people,
institutions, projects and systems it names. New events extract these names during sync;
run `npm run backfill:entities` once for stored events (`--force` redoes all,
`--limit=N` samples a few). For the empty years before the live sources existed,
`npm run backfill:history` pulls arXiv papers year by year (2018-2025, 14 per year;
tune with `--from`, `--to`, `--per-year`, or preview with `--dry`). Conference
proceedings come from `npm run backfill:history:conf`, which imports NeurIPS, ICML
(via PMLR) and ACL/EMNLP/NAACL/COLING 2018-2022, so the early years do not rely on
arXiv alone.

## Project structure

```text
app/                  # routes (rendered at build time)
components/           # layout, research, topics, search, feed, UI
lib/
  db/                 # ResearchStore contract · SeedStore · ingestion merge
  i18n/               # dictionaries + localize()
  staticData.ts       # ListEvent projection and client-side search
  useDataset.ts       # loads public/data/<lang>.json
  math.ts             # LaTeX → Unicode
  verification.ts     # trust model (evidence level / source tier)
  sources/            # ResearchSource: arXiv · GitHub · RSS / page · custom
agents/researchTracker/   # tracker · classifier · summarizer
scripts/              # build-data · ingest · build-site
data/seed/            # bundled events
data/ingested/        # persistent ingestion state (commit these)
types/                # domain types
```

Data flows in two stages:

```text
build    data/seed + data/ingested → public/data/{zh,en}.json → static HTML
runtime  pages read the language's JSON → client-side filter / search / pagination
```

Detail pages, home, methodology and about are complete HTML at build time; the feed,
timeline, search and topic archives load the dataset and filter on the client, so no API
is needed.

## Registered official sources

The catalog lives in `lib/sources/catalog.ts`:

- Lab / company news RSS: OpenAI, Google DeepMind, Google AI, Microsoft Research, NVIDIA,
  Amazon Science
- University and institute news: MIT News (Mathematics), Isaac Newton Institute, IPAM,
  Simons Foundation News, Clay Mathematics Institute, MATRIX Institute
- Department news: Columbia, UCLA, University of Wisconsin, UBC
- Society news: Australian Mathematical Society
- Education and training: AIMO, Mathematics in Lean, Lean Community
- People and public commentary: Terence Tao's blog, Timothy Gowers' blog, Scott
  Aaronson's blog, Quanta Mathematics
- Policy and community: Math & AI declarations, Association for Human Mathematics
  statements, IMO

## Source tier rules

Tier is resolved in this order:

```text
1. explicit event sourceTier (manual override)
2. SOURCE_TIER_TABLE in catalog.ts
3. sourceType fallback
```

`arxiv` and `github` are both `S0`.

## Data policy

- Never invent results, arXiv IDs or URLs — leave unverifiable fields empty, and drop
  items whose source URL cannot be confirmed.
- Publisher-reported results are always labelled as claims with their denominators kept.
- Automated entries go straight into the event stream; there is no manual review queue,
  and corrections are appended to verification history.

## Extending

Implement one interface to add a live source:

```ts
export interface ResearchSource {
  id: string;
  label: string;
  fetchRecent(options?: { limit?: number; since?: string }): Promise<RawResearchItem[]>;
}
```

Register it in `getLiveResearchSources` (`lib/sources/index.ts`) and `npm run sync` will
run `Source → RawResearchItem → Normalizer → Classifier → ResearchEvent`.

Custom RSS / page sources can also be added to `data/ingested/custom-sources.json` and
take effect on the next sync. The classifier is keyword-based today; `getLLMProvider()`
lets you swap in an LLM behind the same contract.
