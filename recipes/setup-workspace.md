# Recipe — set up your workspace

*Prompt shortcuts for first-time workspace setup.*

---

## Recommended prompt

In a coding-agent session opened in the repo root:

> Please read `SETUP.md` and follow its instructions to scaffold my document-factory workspace. Ask me the questions it specifies.

## Alternative: use an existing brand source

If your brand is already defined in a sibling repo (e.g., a Next.js landing page with `globals.css` + favicon), skip some questions:

> Please read `SETUP.md`. For brand colors and fonts, read `/path/to/my/landing/src/app/globals.css` and extract tokens. For the logo, copy from `/path/to/my/landing/public/favicon.svg`. Otherwise proceed as normal.

## If you don't know what aesthetic you want

Ask the agent:

> I'm not sure whether my audience wants editorial (light, serif, research-publication) or product (dark, sans-serif, terminal-ish). Based on the audience I describe, recommend one.

Then describe your audience. The agent picks + justifies.

## After setup

1. Open `workspace/BRAND.md` in an editor. Confirm it matches your brand.
2. Open one of `workspace/templates/*.html` in Chrome. Cmd+P → check the print preview looks right (fonts load, colors render, margins are sensible).
3. Iterate on `workspace/conventions/writing-voice.md` and `workspace/conventions/data-disclosure.md` — these evolve with feedback from real docs.
4. Build your first doc (see `recipes/build-new-doc.md`).
