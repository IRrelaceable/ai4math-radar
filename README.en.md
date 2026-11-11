<div align="center">

# ∑ AI4Math Ecosystem Radar

**An ecosystem intelligence platform for AI for Mathematics — tracking events, not just papers.**

Turning progress scattered across arXiv, conference proceedings, lab blogs, university news
and foundation announcements into one filterable, traceable, navigable timeline.

**English** · [中文](README.md) · [Weekly updates](project_management.md)

[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Static Export](https://img.shields.io/badge/deploy-static_export-2F855A)](#how-data-updates)
[![Tests](https://img.shields.io/badge/tests-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

<img src="docs/screenshots/home.png" alt="AI4Math Ecosystem Radar home page" width="880">

</div>

---

## What it is

AI4Math does not advance in papers alone. New methods appear, researchers move, institutions
open joint labs, foundations issue calls, communities publish policy statements — these
events shape a field, yet they are scattered across dozens of sources with different
formats and rhythms.

**AI4Math Ecosystem Radar** puts six research areas and five classes of ecosystem events
into a single dataset. Every event keeps its original source link, evidence level and
verification record. Filter by area, class, time or evidence level, or follow a field on
the timeline to see how it got here.

Current dataset: **685 events** (558 collected automatically by the ingest pipeline), dating back to **1956**, across **6 research areas**.

## Design principles

<table>
<tr><td width="33%" valign="top">

### Events, not papers

Papers, models, benchmarks and datasets are **properties of an event**, never a top-level
class. The five ecosystem classes sit side by side: Research, People, Institutions &
Education, Funding, Policy & Community.

</td><td width="33%" valign="top">

### Evidence apart from importance

`evidenceLevel` (E0–E4) says how mature the public evidence is; `sourceTier` (S0–S4) says
where it comes from. They are labelled independently and never merged into one score.

</td><td width="33%" valign="top">

### Automated and traceable

Ingested events go straight into the stream with no manual review queue. Unverifiable
fields stay empty; items without a confirmable source URL are dropped.

</td></tr>
</table>

## Features

| Module | Route | What it does |
| --- | --- | --- |
| Home | `/` | Event totals, area distribution, latest events and recent activity |
| Feed | `/latest` | Class / area / time / evidence / tier filters, search, card and compact views |
| Timeline | `/timeline` | Year-by-year density overview and class mix; the three newest months open by default, sparse years open fully, dense months group by day; search, deep links, class filter |
| Areas | `/topics` · `/topics/[topic]` | Direction-axis mix, 12-month trend, sub areas and latest records for six areas; detail pages add trends, papers, models, benchmarks and events |
| Event detail | `/research/[slug]` | What happened, key facts, evidence and status, related events, plus **citation links** and **related events** as separate sections |
| Search | `/search` | Results grouped by event, paper, area, model and benchmark |
| Lab track | `/labs` | 52 frontier-lab archive records (2020–2026, grouped by year, filterable by OpenAI / Anthropic / joint / independent attribution; four batch-sample entries are tagged and counted once; each shows its result and source links, and the Chinese site keeps the verbatim verification notes behind a disclosure), plus recent lab updates below |
| Math4AI entry | `/math4ai` | Direction-axis feed: events where mathematics is the method or theory and the object is the AI system (co-primary included) |
| About | `/about` | What the site tracks, the five event classes, how to read the E/S labels, and the public source registry (the old `/sources` route redirects here; `/research-map` redirects to `/topics`) |
| Glossary | `/methodology` | Definitions for all six label groups: evidence level, source tier, event class, verification state, AI involvement and direction axis |

**Citation links and related events**: the detail page keeps the two relations apart.
"Citation links" lists works in this event's reference list and later works citing it,
each with a link to the original paper; a citation is a documented link, not a claim that
conclusions carry over. "Related events" groups co-occurring people, institutions, projects
and models into timelines — co-occurrence signals association, not causation. Short chains
collapse to one line, remaining threads stay expandable and long chains mark the current
position.

**Frontier-lab research archive**: the main `/labs` archive comes from the
*Anthropic / OpenAI AI4Math progress timeline* (sources checked through 2026-10-16):
52 records spanning 2020–2026 with 116 original source links, stored in
`data/lab-archive/records.ts`. Each record keeps nine fields — attribution and nature,
problem and field, result, model, people, human/AI division, date and verification,
scope and follow-up, and original sources. Chinese wording is verbatim from the
archive; English provides translated headlines, result summaries, attribution and
date conventions. The verbatim verification record is Chinese-only, so the Chinese
site keeps it behind a per-entry disclosure and the English site does not show it.
This is curated separately and is **not merged into the event dataset**:
several records share one paper URL (entries 14–17 all come from `arXiv:2511.16072`,
and 45–48 are samples of the same 722-manuscript batch), so URL-based deduplication
would silently drop them. Archive records cross-link to site events citing the same
source; recent lab updates are listed separately below. **The public view shows date, attribution, result and source links**, with record counts, year grouping and an attribution filter; the editorial conventions and collection mechanism are not reader-facing. Every archive entry and every event page also carries a discussion slot that is not open yet.
The archive distinguishes in-house work, third-party use of a lab's models,
collaborations, independent evaluations and later independent follow-ups;
"manuscript claims", "candidate proof" and "under review" do not mean independent
verification. `records.test.ts` guards the dataset's integrity.

**Trust model**: evidence levels E0–E4 (independent replication / testable artifact /
research record / originator claim / no evidence) and source tiers S0–S4 are labelled
separately; verification history is append-only. Label definitions live at
[`/methodology`](app/methodology/page.tsx).

<table>
<tr>
<td width="50%"><img src="docs/screenshots/timeline.png" alt="Timeline page"><br><sub>Timeline: yearly density, three newest months open by default, month folding</sub></td>
<td width="50%"><img src="docs/screenshots/detail.png" alt="Event detail page"><br><sub>Event detail: facts, evidence and original source</sub></td>
</tr>
</table>

## Data and trust model

Each event's evidence level is derived from verifiable links, not a subjective score:

```text
E0 Independent replication  Multiple independent sources cross-check
E1 Testable artifact        Public code / data / formal proof
E2 Research record          Paper, proceedings or technical report
E3 Originator claim         Only the originating party's public statement
E4 No evidence              No public material yet
```

Source tier `S0`–`S4` is labelled separately and resolved in this order: explicit event
override → source catalog table → source-type fallback. arXiv and GitHub are both `S0`.

Data policy:

- Never invent results, arXiv IDs or URLs; leave unverifiable fields empty and drop items
  whose source URL cannot be confirmed.
- The direction axis (ai4math / math4ai / both) is assigned only to research events with a
  `researchArea`. Ecosystem classes — people, institutions, funding, policy — are grouped by
  event class and carry no direction. Research items whose model judgement fails also stay
  empty; `npm run backfill:direction` fills them once a live model is configured.
- Publisher-reported results are recorded as originator claims with denominators kept
  (e.g. counted by published statements, not by proven theorems).
- Ingested entries go straight into the stream; there is no manual review queue, and
  corrections are appended to verification history.
- Event titles keep the source's original wording and are never rewritten automatically.

## How data updates

The site is a fully static export: data is written to JSON at build time, pages are
exported as HTML, and there is no server process or database. Sources are registered in
`lib/sources/catalog.ts`; each sync appends new events to `data/ingested/`, which are
merged with the bundled events, deduplicated, and turned into the Chinese and English
datasets at build time. Citation links between events are backfilled from OpenAlex
reference lists via `npm run backfill:citations` (idempotent, safe to re-run).

`prisma/` and `DATABASE_URL` are kept for local experiments only: setting them
switches `getStore()` to PostgreSQL, while the published build always uses the
file-based dataset from `data/seed` + `data/ingested` and opens no connection.

Publishing is handled by [`.github/workflows/publish.yml`](.github/workflows/publish.yml):
on every push to `main`, every 6 hours, or on manual dispatch. Scheduled and manual runs
pull new events first, then rebuild and publish both language sites.

## Running locally

Requires Node.js 20+:

```bash
npm install
npm run dev
```

The Chinese site runs at <http://localhost:3000> and English at
<http://localhost:3001/en/>.

## Roadmap

- [x] Five-class ecosystem event model with trust labels
- [x] Static export with separate Chinese and English builds
- [x] Timeline (density overview, three newest months open by default, density-aware folding, deep links, keyword search)
- [x] Event threads across people, institutions, projects, models and benchmarks
- [x] Scheduled ingestion and automated publishing
- [x] Citation graph between events (previous / follow-up edges checked against OpenAlex references)
- [ ] Per-problem benchmark result tracking within areas
- [x] Math4AI as a first-class entry (direction axis ai4math / math4ai / both, judged by research object → core goal → actual contribution at ingest)

## Contributing

Found an error or want to suggest a source? Open an issue with a verifiable original link;
items without a confirmable source are not merged. Weekly feature updates live in
[project_management.md](project_management.md).

## License

No open-source license has been chosen yet. Until a `LICENSE` file is added, all rights are
reserved; please contact the author before reuse.
