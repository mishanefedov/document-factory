# Component conventions

*How to write, use, and extend components in the factory.*

---

## What a component is

An atomic HTML fragment. Single structural purpose. Lives in `workspace/components/` (or `starter-templates/components/` for the generic starter versions).

Examples:

- `headers/{brand}-header.html` — top-of-doc masthead
- `footers/{brand}-footer.html` — bottom-of-doc contact strip
- `blocks/stat-row-4col.html` — hero row of 4 stat cards
- `blocks/signal-box-conclusion.html` — bordered callout box, conclusion variant
- `blocks/blockquote-attributed.html` — pull quote with attribution
- `blocks/data-table.html` — styled table for tabular findings
- `blocks/caveats-box.html` — disclosure block for limitations

## Component file format

Every component file opens with a comment header. The comment is for the agent reading the file — it is stripped from the final output.

```html
<!--
COMPONENT: stat-row-4col
VERSION: 1
USE WHEN: opening a research doc with 4 signal numbers (dispersion, anchors, universe size, key finding)
AVOID WHEN: sample size is small and front-loading N as a hero stat hurts credibility (see workspace/conventions/data-disclosure.md)
SLOTS:
  {{STAT_1_N}} — the number (e.g. "≥90d", "2,615", "~2yr", "4/4")
  {{STAT_1_LBL}} — the label under it (e.g. "Payment terms cited")
  {{STAT_2_N}}, {{STAT_2_LBL}} — same
  {{STAT_3_N}}, {{STAT_3_LBL}} — same
  {{STAT_4_N}}, {{STAT_4_LBL}} — same
STYLES REQUIRED:
  .stats, .stat, .stat .n, .stat .lbl (defined in tokens/brand.css)
-->
<div class="stats">
  <div class="stat"><div class="n">{{STAT_1_N}}</div><div class="lbl">{{STAT_1_LBL}}</div></div>
  <div class="stat"><div class="n">{{STAT_2_N}}</div><div class="lbl">{{STAT_2_LBL}}</div></div>
  <div class="stat"><div class="n">{{STAT_3_N}}</div><div class="lbl">{{STAT_3_LBL}}</div></div>
  <div class="stat"><div class="n">{{STAT_4_N}}</div><div class="lbl">{{STAT_4_LBL}}</div></div>
</div>
```

## Comment header schema

All keys are required. If a key doesn't apply, write `N/A`.

- `COMPONENT:` — kebab-case slug, matches filename
- `VERSION:` — integer. Bump when you make a breaking change.
- `USE WHEN:` — one sentence describing the use case
- `AVOID WHEN:` — one sentence describing failure modes (can reference `workspace/conventions/`)
- `SLOTS:` — list every `{{PLACEHOLDER}}` with a description + example values
- `STYLES REQUIRED:` — CSS classes the component depends on, + which token file defines them

## Slot syntax

- `{{UPPER_SNAKE_CASE}}` for all slots
- Agent performs find-and-replace. No templating engine. No conditionals.
- If a slot is optional, document it in the comment header: `{{SUBTITLE}} — optional, omit the <div.subtitle> tag entirely if not used`
- Never nest `{{slots}}` inside each other

## How agents use components

When building a doc:

1. Agent reads the component's comment header
2. Decides if `USE WHEN` matches the current doc's needs
3. Checks `AVOID WHEN` and `workspace/conventions/` for conflicts
4. Copies the HTML (without the comment header) into the doc
5. Finds-and-replaces each `{{SLOT}}` with the resolved value
6. If a slot is empty / omitted, cleans up empty elements (no stray `<div></div>`)

## Authoring new components

If you find yourself repeating the same HTML pattern across 2+ docs, extract it as a component. Before extracting:

1. Confirm the pattern has a single responsibility (one section, one visual concept)
2. Identify the slot points — what varies between uses?
3. Pick a name: kebab-case, descriptive, matches folder purpose (`headers/`, `footers/`, `blocks/`)
4. Write the comment header FIRST. If you can't describe `USE WHEN` / `AVOID WHEN` clearly, the component isn't ready.
5. Keep CSS dependencies documented — don't introduce new classes without adding them to `workspace/tokens/brand.css`

## Anti-patterns

- **Don't make components too small.** One `<p>` tag isn't a component. A complete sentence pattern isn't either. Start at the level of "a visually distinct block of a document."
- **Don't make components too big.** An entire one-pager isn't a component — it's a template.
- **Don't hardcode brand values in components.** Colors, fonts, spacing come from `workspace/tokens/`. If a component references `#0B0F14` directly, fix it.
- **Don't include external dependencies in components** (no `<script src="https://...">`). If a component needs JS, inline it and document in `STYLES REQUIRED:` why.
