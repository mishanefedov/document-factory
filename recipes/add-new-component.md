# Recipe — add a new component

*How to extract a new reusable block or chart component.*

---

## When to add a new component

If the same HTML pattern shows up in 2+ docs with only content variation, extract it. Before:

- Confirm single responsibility (one visual concept, one structural purpose)
- Identify the slot points (what varies between uses)
- Confirm it's brand-neutral (relies on `workspace/tokens/brand.css`, no hardcoded colors)

## Steps

### 1. Pick a name

Kebab-case. Descriptive. Matches the folder purpose:

- `blocks/` — content blocks (stat-row, signal-box, blockquote, two-col, table, caveats)
- `charts/` — diagrams, visualizations (venn, signal-matrix, geography-map)
- `headers/` — top-of-doc mastheads
- `footers/` — bottom-of-doc strips

### 2. Write the comment header first

If you can't describe `USE WHEN` and `AVOID WHEN` in one sentence each, the component isn't ready. Write:

```
COMPONENT: {name}
VERSION: 1
USE WHEN: ...
AVOID WHEN: ...
SLOTS: {{PLACEHOLDER}} — description
STYLES REQUIRED: ...
```

### 3. Write the HTML

Keep it under 40 lines of HTML. Larger blocks should be decomposed.

No `<style>` inside component files — styling comes from `workspace/tokens/brand.css`. If the component needs a new CSS class, add it to `brand.css` and document in `STYLES REQUIRED`.

No inline `<script>` unless unavoidable — document why in the header.

### 4. Test in a real doc

Before committing, use the component in an actual doc and verify it renders + prints correctly.

### 5. Save to `workspace/components/{category}/{name}.html`

If it's only useful for your own brand, stop here.

### 6. (Public-repo contribution) Generalize and PR

If the pattern is useful beyond your brand:

1. Copy to `starter-templates/components/{category}/{name}.html`
2. Ensure all brand values are tokenized (via `var(--color-*)` / `var(--font-*)`)
3. Submit a PR

## For charts specifically

Charts are often self-contained (inline SVG + inline minimal JS if needed). Special rules:

- **No external dependencies.** No `<script src="https://cdn.jsdelivr.net/...">`. Inline D3, Chart.js, etc. only if you've accepted the cost and documented in the comment header.
- **Data as slots.** `{{DATA_JSON}}` for data, `{{LABELS_JSON}}` for labels. Agent resolves with real data at build.
- **Size constraints.** Max width typically `max-width: 760px` to match `.wrap`. Test that the chart fits in print dialog at A4.
- **Print fidelity.** SVG prints cleanly; canvas/webgl often doesn't. Default to SVG.

## Anti-patterns

- **Don't extract a component from a single doc.** You need 2+ uses to know what varies.
- **Don't create components smaller than a visual block.** One `<p>` isn't a component. A single sentence pattern isn't either.
- **Don't create components larger than a template section.** An entire one-pager isn't a component — it's a template.
- **Don't hardcode anything brand-specific.** No colors, fonts, copy. Tokens or `{{PLACEHOLDERS}}` only.
