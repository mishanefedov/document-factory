# RESOLVER — agent routing table

*First file any coding agent consults after `00-read-first.md`. Maps user intents to the instruction + starter-template + recipe files the agent should load next.*

---

## How to use this file

1. Identify the user's intent from their prompt.
2. Find the matching row below.
3. Load every file listed in the "Load" column before proceeding.
4. Follow the rule in the "Then" column.

## Intent routing

| User intent | Load | Then |
|---|---|---|
| Set up workspace for a new user | `SETUP.md`, `instructions/00-read-first.md`, `instructions/factory-rules.md`, `instructions/brand-token-protocol.md`, `instructions/writing-voice-guide.md`, `instructions/data-disclosure-guide.md` | Follow SETUP.md protocol step-by-step |
| Build a one-pager | `instructions/00-read-first.md`, `instructions/factory-rules.md`, `instructions/doc-types/one-pager.md`, `instructions/filename-convention.md`, `workspace/BRAND.md`, `workspace/conventions/*.md`, `workspace/templates/one-pager.html` | Follow `recipes/build-new-doc.md` |
| Build a progress-note | `instructions/doc-types/progress-note.md`, plus the standard set above | Follow `recipes/build-new-doc.md` |
| Build a case-study | `instructions/doc-types/case-study.md`, `instructions/print-css-primer.md` (for multi-page break behavior), plus standard set | Follow `recipes/build-new-doc.md` |
| Build a cover-letter | `instructions/doc-types/cover-letter.md`, plus standard set | Follow `recipes/build-new-doc.md` |
| Add a new doc-type to the factory | `instructions/template-conventions.md`, `instructions/doc-types/*.md` (for reference), `recipes/add-new-template.md` | Follow `recipes/add-new-template.md` |
| Add a new component (block, chart, header, footer) | `instructions/component-conventions.md`, `instructions/brand-token-protocol.md`, `recipes/add-new-component.md` | Follow `recipes/add-new-component.md` |
| Export a finished doc to PDF | `instructions/pdf-export.md` | Follow the workflow described there |
| Debug a print-layout problem | `instructions/print-css-primer.md`, `instructions/pdf-export.md` | Apply `break-inside: avoid` + test in Chrome print preview |
| Adjust brand tokens | `instructions/brand-token-protocol.md`, `workspace/tokens/brand.css`, `workspace/BRAND.md` | Edit `workspace/tokens/brand.css`, keep `workspace/BRAND.md` in sync |
| Adjust writing-voice rules | `instructions/writing-voice-guide.md`, `workspace/conventions/writing-voice.md` | Edit the `workspace/` file; the `instructions/` file is the meta-pattern |
| Adjust data-disclosure rules | `instructions/data-disclosure-guide.md`, `workspace/conventions/data-disclosure.md` | Same pattern as voice rules |

## Standard set (load for almost any doc-build)

- `instructions/00-read-first.md`
- `instructions/factory-rules.md`
- `workspace/BRAND.md`
- `workspace/conventions/writing-voice.md`
- `workspace/conventions/data-disclosure.md`
- `workspace/conventions/audience.md`

## Tie-breaker rules

- **If the user's request doesn't match any row above:** stop and ask them what doc-type they want. Don't guess.
- **If a required file in the "Load" column doesn't exist:** run SETUP.md first. Workspace probably isn't scaffolded.
- **If the user is refining a doc that already exists:** load the same files as the original build + read the existing doc in `workspace/results/`.

## Meta

This resolver is the entry-point map. Keep it under one page. If a new doc-type or recipe is added, add one row here. If a row grows beyond two sentences, the workflow probably needs a recipe file of its own.
