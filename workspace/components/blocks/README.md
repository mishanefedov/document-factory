# workspace/components/blocks

Reusable content blocks. Brand-neutral (rely on `workspace/tokens/brand.css` for styling). Composed by the agent into full documents.

Expected blocks after setup:
- `stat-row-4col.html` — hero 4-column stat grid
- `signal-box-conclusion.html` — accent-bordered callout (conclusion variant)
- `signal-box-warn.html` — warn/red-bordered callout
- `signal-box-positive.html` — positive/green-bordered callout
- `blockquote-attributed.html` — pull-quote with attribution
- `two-col-list.html` — paired bullet lists
- `data-table.html` — styled data table
- `caveats-box.html` — honest-disclosure block

Add new blocks as needed following `instructions/component-conventions.md`. Consider extracting generally-useful new blocks back to the public `starter-templates/components/blocks/` via PR.
