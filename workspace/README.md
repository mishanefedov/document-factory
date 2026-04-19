# workspace — your private layer

**Contents of this folder (except README.md files) are gitignored.** Your brand, content, and output live here. The public repo ships only the structure + these short explanations.

## Layout

- `BRAND.md` — summary of your brand rules. Filled at setup.
- `tokens/` — your resolved CSS tokens (`brand.css`, `print.css`).
- `components/` — your HTML components: headers, footers, blocks.
- `templates/` — your resolved templates (one-pager, progress-note, case-study, cover-letter).
- `assets/` — logos, fonts, other brand assets.
- `conventions/` — your voice / disclosure / audience rules.
- `examples/` — your canonical shipped docs; agent reads these for reference.
- `results/` — generated output from each doc-build session.

## How this gets populated

Run `SETUP.md` with a coding agent. The agent asks you brand questions, scaffolds this directory from `starter-templates/` and `instructions/*-guide.md`, and seeds your conventions.

## Do not commit anything in this folder except README.md

The `.gitignore` at repo root enforces this: all files inside `workspace/` are ignored except the directory-stub READMEs. If you want to version your workspace, use a separate git repo, a backup tool, or commit to a private branch you never push publicly.
