# Brand token protocol

*How brand tokens are named, organized, and consumed.*

---

## Two CSS files, two responsibilities

```
workspace/tokens/
├── brand.css    — colors, fonts, spacing, typography scale, component styles
└── print.css    — @page rules, break-inside rules, print-only overrides
```

Every template in `workspace/templates/` links both files in its `<head>`.

## brand.css — custom properties + base styles

All brand-variable values are CSS custom properties declared on `:root`. Names follow a prefix convention:

### Colors

```css
--color-bg            /* page background */
--color-ink           /* body text */
--color-muted         /* secondary text, labels */
--color-rule          /* hairlines, borders */
--color-card-bg       /* card / block backgrounds */

--color-accent        /* primary brand accent */
--color-accent-fill   /* accent at reduced alpha for block backgrounds */

/* semantic signals — optional, used in signal-boxes + table cells */
--color-positive
--color-positive-fill
--color-negative
--color-negative-fill
--color-warn
--color-warn-fill
```

### Fonts

```css
--font-body           /* main reading text */
--font-display        /* headlines, hero numerals */
--font-mono           /* labels, eyebrows, section h2s */
```

Include fallback stacks. Example:

```css
--font-body: "Iowan Old Style", Georgia, serif;
--font-display: "Didot", "Bodoni 72", Georgia, serif;
--font-mono: "SF Mono", "IBM Plex Mono", ui-monospace, monospace;
```

### Spacing (optional)

```css
--space-xs, --space-sm, --space-md, --space-lg, --space-xl
```

Only define these if the user has an explicit spacing scale. Otherwise use literal values in component CSS.

### Typography scale

```css
--size-body           /* body copy, e.g. 13.5px */
--size-h1             /* hero title, e.g. 28px */
--size-h2             /* section label, e.g. 8.5px */
--size-stat-n         /* big stat numeral, e.g. 28px */
```

## print.css — page rules only

```css
@page {
  size: A4;            /* or "letter" */
  margin: 18mm;        /* or "0.75in" for US letter */
}

@media print {
  body { padding: 28px 36px; font-size: 12px; }
  h1 { font-size: 22px; }
  .stat .n { font-size: 22px; }
  .signal-box { break-inside: avoid; }
  blockquote { break-inside: avoid; }
  table { break-inside: avoid; }
  .caveats { break-inside: avoid; }
}
```

Keep `print.css` small and opinionated. A4 default (EU). Switch to Letter via the `@page size` keyword, no other changes.

## Naming rules

- **Prefix by domain:** `--color-*`, `--font-*`, `--space-*`, `--size-*`. Makes grep/replace obvious.
- **Semantic before literal:** `--color-positive` not `--color-green`. Green might change.
- **Fill vs stroke variants:** if you define `--color-accent`, optionally define `--color-accent-fill` as the same color at ~7% alpha for background fills. Saves repeated `color-mix()` calls.
- **No magic numbers in components.** If a component uses a color or font, that value must exist as a custom property. Helps when the user swaps brand.

## Two aesthetics in one workspace

If a user picks `aesthetic: both` at setup, create two token files:

```
workspace/tokens/
├── editorial.css   — light bg, serif body, distinctive display
├── product.css     — dark bg, sans-serif, terminal-ish
└── print.css       — shared
```

Each template links one of editorial / product, plus print. Document choice in the template's comment header.

## What `starter-templates/tokens/brand.css` ships

Placeholder-heavy. Agent resolves at setup:

```css
:root {
  --color-bg: {{COLOR_BG}};           /* e.g. #ffffff or #0B0F14 */
  --color-ink: {{COLOR_INK}};         /* e.g. #1a1815 or #E8EDF3 */
  --color-muted: {{COLOR_MUTED}};
  --color-accent: {{COLOR_ACCENT}};   /* e.g. #22C55E */
  --color-accent-fill: {{COLOR_ACCENT_FILL}};
  --font-body: {{FONT_BODY}};
  --font-display: {{FONT_DISPLAY}};
  --font-mono: {{FONT_MONO}};
  /* ...etc... */
}
```

Plus base element styles (body, h1, h2, ul, blockquote, table, .signal-box, .stat) that reference only the custom properties. If the user picks `editorial` aesthetic, agent resolves to an editorial palette. If `product`, to a product palette.

## Anti-patterns

- **Don't hardcode hex/oklch values in component HTML.** All color references go through `var(--color-*)` in CSS.
- **Don't split brand.css into 10 micro-files.** One file. Overhead of following `<link>` chains isn't worth the "modularity."
- **Don't declare fonts without fallbacks.** Every `--font-*` needs at least two fallbacks.
- **Don't put `@page` rules in brand.css.** They belong in print.css.
- **Don't define a token you don't use.** Token sprawl makes the file unreadable.
