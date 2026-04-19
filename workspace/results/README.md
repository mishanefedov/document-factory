# workspace/results

Output of every doc-build session. Agent writes here by default.

## Filename pattern

`YYYY-MM-DD-{doc-type}-{subject}.html`

See `instructions/filename-convention.md` for rules.

## Workflow

1. Agent writes HTML here
2. You open in Chrome, Cmd+P, Save as PDF (into the same folder, matching filename with `.pdf`)
3. Ship the PDF
4. If the doc is canonical-worth, move (or copy) the HTML into `workspace/examples/` with a short "what this teaches" note

## Cleanup

Periodically archive or delete old results you don't need. The folder is private and can grow freely — but agents scanning for prior work benefit from a curated set.
