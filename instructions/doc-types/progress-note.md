---
name: progress-note
version: 1
description: 1–2 page state-of-play update to a specific known reader.
triggers:
  - "progress note"
  - "progress-note"
  - "status update"
  - "state of play"
  - "interim update"
reads:
  - instructions/00-read-first.md
  - instructions/factory-rules.md
  - instructions/filename-convention.md
  - workspace/BRAND.md
  - workspace/conventions/writing-voice.md
  - workspace/conventions/data-disclosure.md
  - workspace/templates/progress-note.html
writes_to: workspace/results/
mutating: true
---

# Doc type — progress-note

*Spec for a 1–2 page structured progress update to a specific reader (advisor, investor, collaborator).*

---

## Purpose

A progress-note ships between formal deliverables to maintain a relationship, explain state-of-play honestly, and reset expectations. It's what you send when a full deck would be overclaiming and radio silence would be underclaiming.

## Audience

One person or one small group. Someone who has already received prior correspondence and tracks your work closely.

## Length

1–2 pages. If it's >2, you're writing a case study. If it's <1 page of prose, send an email.

## Required sections (in order)

1. **Header** — eyebrow (include "Progress Note" or equivalent) + title + dateline
2. **TL;DR** — 3–5 bullet-line executive summary, scannable in 20 seconds
3. **What you did since last correspondence** — specific actions, not aspirations
4. **What you learned** — findings that shaped subsequent decisions. Cite specifics.
5. **What changed (if anything)** — strategy, scope, timeline shifts. Honest.
6. **Next steps** — what's happening between now and next correspondence. Include specific dates where known.
7. **What we need from you (optional)** — explicit asks. Omit if none.
8. **Footer** — company + contact + date + confidentiality

## Optional sections

- Backward-looking reconciliation (if prior predictions can be checked)
- Appendix with supporting data (keep thin)

## Content constraints

- **Lead with the news.** If something changed, say so in the TL;DR.
- **Honest on bar-miss.** If a minimum-artifact bar wasn't met, the progress-note IS the reason you're sending a note instead of a deck. Say that plainly.
- **No marketing language.** The reader knows you — no pitch, no positioning. Just state of play.
- **No surprises buried in paragraph 6.** If there's a pivot, it's in the TL;DR and the subject line.
- **Respect `workspace/conventions/writing-voice.md` and `workspace/conventions/data-disclosure.md`.**
- **Forward-looking claims** follow the user's data-disclosure rules — usually softer threshold than a case study because the reader knows the context.

## Components used

- `workspace/components/headers/{brand}-header.html`
- `workspace/components/blocks/tl-dr-bullets.html` (if exists, otherwise use a styled `<ul>`)
- Plain prose sections with `h2` headings
- `workspace/components/blocks/data-table.html` for any supporting figures
- `workspace/components/footers/{brand}-footer.html`

## Starter template

`starter-templates/progress-note.html` (see that file for scaffold). Copy to `workspace/templates/progress-note.html` at setup.

## Build checklist

- [ ] TL;DR is scannable in 20 seconds
- [ ] Any pivot / change is flagged in TL;DR, not buried
- [ ] Next steps have specific dates where known
- [ ] Explicit asks, if any, are clearly separated
- [ ] Voice passes `workspace/conventions/writing-voice.md`
- [ ] Length is 1–2 pages
- [ ] Filename matches `filename-convention.md`

## Common failures

- **TL;DR that's a summary of achievements.** Fix: make it state-of-play, including what's at risk.
- **"Soon" language.** Fix: specific dates or honest "no ETA yet."
- **Sandbagged scope.** Fix: ship the ambitious plan, cut what doesn't happen. Don't pre-shrink.
- **Progress-note that's actually a deck.** Fix: if you have a deck-worth of news, send a deck.
- **Progress-note that's actually an email.** Fix: if you have 2 paragraphs, send an email with links.
