# 00 — Read first

*Entry point for any coding agent helping a user build documents from this factory.*

---

## What this repo is

`document-factory` is an opinionated HTML document factory. Users own their brand and data (in `workspace/`, private). This repo ships generic instructions for coding agents (in `instructions/`, public) plus starter HTML with placeholders (`starter-templates/`).

Your job as a coding agent: help the user build a branded document by (a) composing HTML from components, (b) respecting their voice and data conventions, (c) writing output to `workspace/results/` with a correct filename.

## Before doing anything

Load these in order. Skim; don't memorize. Re-read relevant pieces while working.

1. **`instructions/factory-rules.md`** — architecture overview
2. **`instructions/component-conventions.md`** — how components are structured and used
3. **`instructions/template-conventions.md`** — how templates are structured and composed
4. **`instructions/filename-convention.md`** — how output files are named
5. **`workspace/BRAND.md`** — user's brand summary (if it exists; if not, run SETUP.md first)
6. **`workspace/conventions/writing-voice.md`** — user's voice rules
7. **`workspace/conventions/data-disclosure.md`** — user's data rules (N handling, forward-looking claims, consent)
8. **`workspace/conventions/audience.md`** — user's audience archetypes

If `workspace/` doesn't exist, stop and run `SETUP.md` first.

## When the user asks for a specific doc type

Also load:

- **`instructions/doc-types/{type}.md`** — e.g. `one-pager.md`, `progress-note.md`

## When you're unsure about page-break behavior or PDF-export

- **`instructions/print-css-primer.md`**
- **`instructions/pdf-export.md`**

## Core rules

1. **Never edit files in `instructions/`, `starter-templates/`, `recipes/`, or `examples/` during a doc-build session.** Those are the factory itself. Edit only `workspace/` contents and files you create in `workspace/results/`.
2. **Never commit `workspace/`.** It's gitignored. If the user asks you to commit something, confirm it's not inside `workspace/`.
3. **Every output file goes in `workspace/results/`** with the filename pattern from `instructions/filename-convention.md`: `YYYY-MM-DD-{doc-type}-{subject}.html`.
4. **Every component you copy into your output gets its comment header stripped** before the doc ships — comment headers teach the factory, not the reader.
5. **Default to linked CSS during authoring** (`<link rel="stylesheet" href="../tokens/brand.css">`). Inline before shipping if the user needs a self-contained file.
6. **Respect `workspace/conventions/*.md`.** They are user-specific rules that override generic patterns.
7. **If the user asks for a doc type that doesn't exist in `workspace/templates/`**, follow `recipes/add-new-template.md` to create it.

## Converged design conventions (post-2026-04-20)

High-leverage patterns from real sell-side / buyer-facing one-pager iteration. Cross-linked from detailed docs:

- **Structure:** Conclusion → Exhibit 1 Methodology → Exhibit 2 Select comments → Why they answer → Exhibit 3 Signal matrix → Campaign & scale. NO stat row, NO subtitle, NO back-test exhibit at small N, NO caveats box when limitations are already visible. See `instructions/doc-types/one-pager.md`.
- **Running header + footer on every page:** `@page` margin boxes (`@top-center` + `@bottom-center`), NOT body `<header>` / `<footer>`. Body `<footer>` hidden in print via `@media print`. See `instructions/print-css-primer.md`.
- **Body `<header>`:** h1 only. No inline masthead. Branding lives in @page running header.
- **Sentences ≤25 words. No em-dashes anywhere** (prose or verbatim quotes). Plain language over research-speak; keep native finance terms.
- **Verification discipline:** cross-check every claim against the KB before shipping. Ambiguous terminology from transcripts → generalize or drop, never invent interpretation.

## When in doubt

Show the user what you plan to do before doing it. This factory is new and evolving; don't assume conventions. Ask.
