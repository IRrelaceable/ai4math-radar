# Ingested events

These files are the pipeline's persisted state. The publish workflow commits
them when manually dispatched with sync enabled. Subsequent runs and site builds
read the same files.

- `events.json` — accepted events, merged into the seed store by slug and shown
  in `/latest`, search and the timeline. Automatically accepted records use
  `provenance: "automated"` and source-reviewed additions use `"curated"`. Each
  event may carry `entities` (people / institutions / projects / systems named
  by the source), which the detail page turns into its "Event thread".
- `fingerprints.json` — per-slug hash of the source text, so an unchanged item
  is not re-summarized on every run.
- `source-status.json` — per-source last attempt/success, cursor and counts;
  operator state used by the sync pipeline, not shown on the public site.
- `custom-sources.json` — sources added by hand; `npm run sync` picks them up.
- `watch-state.json` — dated Markdown snapshots and pending revisions.
  `npm run sync:watch` uses the targets in `data/watch/targets.json` and retries
  pending revisions when the model is unavailable. A target can use
  `backfillAfter` to process newer sections on its first run.

`npm run sync:shadow` runs the regular sync and writes a rule-only comparison
report under `.cache/relation-shadow/`. The report shows the candidates, proposed
relationship, evidence, and the regular ingest assignment for each record that
reaches matching. Add `--shadow --dry` to a source-specific sync to write only
the report. The observation does not supply links to the archive.
When the Pages workflow runs ingestion, it also saves the report as a
`relation-shadow` artifact for 30 days.

Regenerate the site's client dataset with `npm run data`. Deleting
`events.json` resets the pipeline cache (the next run re-fetches, but only what
the sources still expose).
