# Factory rules — architecture overview

## The split — public vs private

```
document-factory/
│
├── instructions/           PUBLIC — generic prompts that teach agents
├── starter-templates/      PUBLIC — HTML with {{PLACEHOLDERS}} (brand-agnostic)
├── recipes/                PUBLIC — optional prompt shortcuts
├── examples/               PUBLIC — generic reference docs
│
└── workspace/              PRIVATE (gitignored) — user's actual data
    ├── BRAND.md
    ├── tokens/
    ├── components/
    ├── templates/
    ├── assets/
    ├── conventions/
    ├── examples/
    └── results/
```

**Rule:** the public half must be brand-agnostic. Starter templates use `{{PLACEHOLDERS}}`. No user-specific colors, fonts, copy, or references to named companies/clients/audiences. When in doubt, generalize.

## The three pillars

### 1. Components (`workspace/components/`)

Atomic HTML fragments. Single-purpose. Each file opens with a comment header that tells an agent: what it is, when to use it, what slots it has, what CSS it needs.

Example structure:

```
workspace/components/
├── headers/
├── footers/
└── blocks/              # stat-row, signal-box, blockquote, two-col-list, data-table, caveats
```

See `component-conventions.md` for authoring rules.

### 2. Templates (`workspace/templates/`)

Full-document assemblies. A template is an HTML file that imports `workspace/tokens/*.css`, opens with a header component, arranges blocks in a logical order, closes with a footer component. The user's `workspace/templates/` starts from `starter-templates/*.html` with placeholders resolved.

See `template-conventions.md` for authoring rules.

### 3. Tokens (`workspace/tokens/`)

CSS custom properties. `brand.css` holds colors, fonts, spacing. `print.css` holds `@page` rules and `break-inside` logic. Both are linked by every template.

See `brand-token-protocol.md` for naming rules.

## Build flow (agent perspective)

When the user asks for a document:

1. Load `00-read-first.md` checklist files
2. Identify doc type. Load `doc-types/{type}.md`
3. Check if a template exists in `workspace/templates/{type}.html`. If not, scaffold from `starter-templates/`.
4. Read the user's input — their ask, any attached KB files, prior docs in `workspace/examples/` for reference
5. Pick a filename using `filename-convention.md`
6. Copy the template to `workspace/results/{filename}.html`
7. Fill slots (content, data, quotes). Respect `workspace/conventions/*.md`.
8. If the doc needs a non-standard chart or block not in `workspace/components/`, build it inline in the doc first. If it looks reusable, offer to extract it to `workspace/components/` for next time.
9. Strip component comment headers from the output (they're for agents, not readers)
10. Confirm with the user. Iterate.
11. Tell the user: open in Chrome, Cmd+P, Save as PDF.

## What not to do

- **Don't invent a templating engine.** `{{PLACEHOLDER}}` markers are for the agent to find-and-replace. No server-side rendering, no build step, no `{% if %}` / `{% for %}` grammar.
- **Don't create files outside `workspace/` during a doc build.** If you think you need to edit `instructions/` or `starter-templates/`, stop and ask the user first — that's factory maintenance, not a doc build.
- **Don't assume the user wants the same thing as the last doc.** Read `workspace/conventions/` fresh. It evolves.
- **Don't skip the Caveats block on calibration-stage research docs** if the user's `data-disclosure.md` requires it.

## Versioning

- Instructions and starter templates are versioned by git commit in this repo.
- User's `workspace/` is versioned however they choose (another git repo, local backup, etc.)
- Templates inside `workspace/templates/` may evolve as the user refines. Old shipped docs don't regenerate; they're frozen in `workspace/examples/`.

## Growing the factory

When a user's `workspace/components/` grows a new widely-useful block, consider extracting a generalized version back into `starter-templates/components/blocks/` as a PR to this public repo. Keep it brand-agnostic. Users who pull updates benefit.
