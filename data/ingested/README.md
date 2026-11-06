# Ingested events

These files are the pipeline's persisted state. They are committed on purpose:
the scheduled GitHub Actions job writes what it ingested and the next run has
to resume from it (the deploy reads the same files when it builds the site).

- `events.json` — accepted events, merged into the seed store by slug and shown
  in `/latest`, search and the timeline with `provenance: "automated"`. Each
  event may carry `entities` (people / institutions / projects / systems named
  by the source), which the detail page turns into its "Event thread".
- `fingerprints.json` — per-slug hash of the source text, so an unchanged item
  is not re-summarized on every run.
- `source-status.json` — per-source last attempt/success, cursor and counts,
  rendered by `/sources`.
- `custom-sources.json` — sources added by hand; `npm run sync` picks them up.

Regenerate the site's client dataset with `npm run data`. Deleting
`events.json` resets the pipeline cache (the next run re-fetches, but only what
the sources still expose).
