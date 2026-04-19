# Template conventions

*How to write, use, and extend templates in the factory.*

---

## What a template is

A full, print-ready HTML document. Links to `workspace/tokens/*.css`. Composed by copy-pasting components in a logical order. Contains `{{PLACEHOLDER}}` slots for top-level content — title, date, subtitle — but not for nested component content (that's a component's job).

Examples:

- `workspace/templates/one-pager.html`
- `workspace/templates/progress-note.html`
- `workspace/templates/case-study.html`
- `workspace/templates/cover-letter.html`

## File structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{DOC_TITLE}} — {{COMPANY_NAME}}</title>
  <link rel="stylesheet" href="../tokens/brand.css">
  <link rel="stylesheet" href="../tokens/print.css">
</head>
<body>
<div class="wrap">

<!-- HEADER (copied from workspace/components/headers/{brand}-header.html, comment stripped) -->
<header>
  <div class="eyebrow">{{EYEBROW}}</div>
  <h1>{{DOC_TITLE}}</h1>
  <div class="subtitle">{{SUBTITLE}}</div>
</header>

<!-- STAT ROW (copied from workspace/components/blocks/stat-row-4col.html) -->
<div class="stats">
  <div class="stat"><div class="n">{{STAT_1_N}}</div><div class="lbl">{{STAT_1_LBL}}</div></div>
  <!-- ...etc... -->
</div>

<!-- CONCLUSION SIGNAL BOX -->
<div class="signal-box conclusion">
  <div class="box-lbl">Conclusion</div>
  <strong>{{CONCLUSION_LEAD}}</strong>
  {{CONCLUSION_BODY}}
</div>

<!-- ...more blocks... -->

<!-- FOOTER -->
<footer>
  <span>{{COMPANY_NAME}} · {{CONTACT_EMAIL}}</span>
  <span>Prepared {{DATE}} · Confidential</span>
</footer>

</div>
</body>
</html>
```

## Template vs component distinction

| Template | Component |
|---|---|
| Full doc, works on its own | Fragment, works only inside a template |
| Links CSS at the top | No CSS in the file |
| Top-level content slots only (`{{DOC_TITLE}}`) | Data slots (`{{STAT_1_N}}`) |
| User customizes at setup and per-doc | User customizes once |
| Lives in `workspace/templates/` | Lives in `workspace/components/` |

## Building from starter-templates

At user setup (see `SETUP.md`):

1. Copy `starter-templates/one-pager.html` to `workspace/templates/one-pager.html`
2. Resolve brand-level placeholders (`{{COMPANY_NAME}}`, `{{DOMAIN}}`, `{{EYEBROW_DEFAULT}}`) from user answers
3. Leave content-level placeholders (`{{DOC_TITLE}}`, `{{SUBTITLE}}`, `{{CONCLUSION_LEAD}}`, stat-row slots, etc.) untouched — those fill at doc build time

Each starter template's comment header lists which placeholders are brand-level (resolve at setup) vs. content-level (resolve at build).

## Composing a new doc from a template

Agent workflow:

1. Pick the right template from `workspace/templates/`
2. Copy it to `workspace/results/{YYYY-MM-DD}-{doc-type}-{subject}.html`
3. Resolve content-level slots from user input + KB
4. If a block in the template isn't needed, remove it entirely (don't leave empty)
5. If a new block is needed that isn't in the template, add it — either inline, or by copying a component from `workspace/components/`, or by building it fresh if it's a one-off
6. Strip any component comment headers that leaked through the copy
7. Confirm with user

## Adding a new template type

Follow `recipes/add-new-template.md`.

Short version:

1. Pick a name (`progress-note`, `case-study`, `cover-letter`, etc.)
2. Look at the closest existing template as a starting point
3. Write a new `instructions/doc-types/{name}.md` that documents: purpose, audience, typical length, required sections, optional sections, content constraints
4. Write the HTML template
5. Add one or two example resolutions to `workspace/examples/` once you've shipped real docs with it

## Anti-patterns

- **Don't inline CSS in a template.** Link to `workspace/tokens/*.css`. Exception: when the user needs a single-file self-contained HTML for sharing, the agent inlines at export time — not in source.
- **Don't duplicate layout logic across templates.** If one-pager and progress-note both need the same structure, extract the shared parts to a component.
- **Don't version templates inline.** Use git. If you need both `one-pager-v1.html` and `one-pager-v2.html` side-by-side, keep the old ones in `workspace/examples/` not `workspace/templates/`.
- **Don't leave `{{UNRESOLVED}}` slots in the output.** Before shipping, grep the output for `{{` — if any survive, either resolve them or remove the containing block.
