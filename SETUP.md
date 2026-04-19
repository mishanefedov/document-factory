# SETUP — point your coding agent here

*This file bootstraps a new user's workspace. Designed to be read by a coding agent (Claude Code, Cursor, Codex, Aider) pointed at this repo.*

---

## Paste-ready bootstrap (for any coding agent)

Give your agent this one-line prompt:

> Retrieve and follow the instructions at:
> `https://raw.githubusercontent.com/mishanefedov/document-factory/main/SETUP.md`

If your agent is already working inside a cloned copy of the repo, paste instead:

> Please read `SETUP.md` and follow its instructions to scaffold my `document-factory` workspace. Ask me the questions it specifies.

---

## For the user

In a coding-agent session opened in this repo's root, paste:

> Please read `SETUP.md` and follow its instructions to scaffold my document-factory workspace. Ask me the questions it specifies, then create the files.

Then answer the agent's questions.

---

## For the coding agent

If you are reading this file because a user asked you to set up their workspace, follow this protocol in order.

### Step 1 — Load the factory rules

Read these files to understand how the system works:

1. `instructions/00-read-first.md`
2. `instructions/factory-rules.md`
3. `instructions/component-conventions.md`
4. `instructions/template-conventions.md`
5. `instructions/brand-token-protocol.md`
6. `instructions/filename-convention.md`
7. `instructions/writing-voice-guide.md`
8. `instructions/data-disclosure-guide.md`

Skim, don't memorize. You'll re-read relevant pieces as you build.

### Step 2 — Ask the user these questions

Ask them in this order. Batch related questions. Wait for answers before continuing.

1. **Company or project name** — will appear in every doc header and footer.
2. **Primary domain** — e.g. `acme.com`. Used in contact footer.
3. **Contact email** — e.g. `hello@acme.com`. Used in footer.
4. **Aesthetic preference:**
   - `editorial` — light background, serif body, distinctive display font. Research-publication feel. Recommended for documents going to finance / academic / B2B sophisticated readers.
   - `product` — dark background, sans-serif, terminal-adjacent. Product marketing feel. Recommended for internal docs or tech-forward audiences.
   - `both` — scaffold two token sets and let the user pick per doc.
5. **Core 3 colors** (bg, ink/text, accent) — hex or OKLCH. Can be "use the defaults" if they're unsure.
6. **3 fonts** (body, display, mono):
   - Body: serif or sans?
   - Display / headline: distinctive display font or same as body?
   - Mono: for labels, code, eyebrows.
   - Suggest Google Fonts names. Can be "use the defaults" if unsure.
7. **Logo:**
   - SVG file path they can share, OR
   - Permission to generate a CSS-text wordmark (e.g. `"ACME"` in display-condensed bold, letter-spaced)
8. **Audience archetypes** — who do they write for? 1–3 lines each. Examples: "sell-side equity analyst, reads institutional research daily, 2-minute attention span" or "seed-stage VC partner, reads decks fast, wants traction + moat."
9. **Voice constraints** (optional) — any words / phrases to avoid, tone register, hedging rules. If they don't know, skip and ask again after first doc.
10. **Data disclosure constraints** (optional) — any rules about sample-size handling, forward-looking claims, quote consent? If N/A, skip.

### Step 3 — Scaffold the workspace

Create `workspace/` directory structure (already exists as empty dirs):

- `workspace/BRAND.md` — summary of the user's brand: name, domain, aesthetic choice, link back to conventions
- `workspace/tokens/brand.css` — resolve placeholders from `starter-templates/tokens/brand.css` using the user's color / font answers
- `workspace/tokens/print.css` — copy from `starter-templates/tokens/print.css` unchanged
- `workspace/components/headers/{slug}-header.html` — customize from `starter-templates/components/headers/company-header.html`. `{slug}` is kebab-case company or project name.
- `workspace/components/footers/{slug}-footer.html` — same pattern
- `workspace/components/blocks/*.html` — copy all blocks from `starter-templates/components/blocks/` as-is. These are brand-neutral; user can customize per-doc at build time.
- `workspace/templates/one-pager.html` — customize from `starter-templates/one-pager.html` with user's brand resolved
- `workspace/assets/` — copy user's logo SVG here if provided, or skip
- `workspace/conventions/writing-voice.md` — stub file. Seed with voice-guide template from `instructions/writing-voice-guide.md`, filled with user's answers to voice questions.
- `workspace/conventions/data-disclosure.md` — stub file, same pattern.
- `workspace/conventions/audience.md` — stub file, filled with user's audience answers.
- `workspace/examples/README.md` — one-liner explaining what goes here: canonical shipped docs with a short "what this doc teaches" note
- `workspace/results/.gitkeep` — so the directory exists even when empty

### Step 4 — Confirm with the user

Show a summary of what you created. Ask:

- Does the header preview look right? (Show HTML or describe it.)
- Are there any colors or fonts to adjust?
- Is the voice / audience summary accurate?

Iterate if they want changes.

### Step 5 — Done

Tell the user:

- Workspace is scaffolded in `workspace/`
- `workspace/` is gitignored — safe to add brand-specific content
- Next: chat with any coding agent about what document you want. The agent will read `instructions/00-read-first.md`, `workspace/BRAND.md`, `workspace/conventions/*`, and `workspace/templates/` to build your doc.
- Output lands in `workspace/results/` with an ISO-date filename.
- Open in Chrome, Cmd+P, Save as PDF.

If they want to add a new doc type later, point them at `recipes/add-new-template.md`.
