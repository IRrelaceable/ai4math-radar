# Ingested events

`events.json` here is written by `POST /api/agents/ingest` when a live source
(arXiv, GitHub) is used. Entries are merged into the seed store by slug, so they
appear in `/latest`, search and the API like any other event, tagged
`provenance: "automated"` until reviewed.

Delete this file to reset the pipeline cache. The file itself is git-ignored.
