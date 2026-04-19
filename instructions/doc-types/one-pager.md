---
name: one-pager
version: 1
description: Single-page research summary. Print-ready HTML → PDF for one sophisticated reader.
triggers:
  - "build a one-pager"
  - "one pager"
  - "onepager"
  - "research one-pager"
  - "calibration read"
reads:
  - instructions/00-read-first.md
  - instructions/factory-rules.md
  - instructions/filename-convention.md
  - workspace/BRAND.md
  - workspace/conventions/writing-voice.md
  - workspace/conventions/data-disclosure.md
  - workspace/templates/one-pager.html
writes_to: workspace/results/
mutating: true
---

# Doc type — one-pager

*Spec for a single-page research one-pager. Print-ready HTML → PDF for individual readers (advisors, buyers, specific decision-makers).*

---

## Purpose

A one-pager gets a single reader — usually sophisticated, time-constrained, pattern-matching to other research publications they read all day — to a clear finding in 2 minutes.

## Audience

Typically one person or one desk. Advisor, fund analyst, corporate strategy lead, specific prospect. Not a mass-publication format.

## Length

One page when exported at A4 or Letter with 18mm / 0.75in margins. Two pages absolute maximum — if you're at 2+, consider a `progress-note` or `case-study` instead.

## Converged structure (post-2026-04-20 Monday deliverable)

Only these sections. In this order. Nothing else.

1. **Header** — h1 only. Centered. No eyebrow / subtitle / stat-row inline. Branding lives in @page running header.
2. **Conclusion signal-box** — bold filings-vs-us thesis, variance body with parenthetical reasons + frictions, lead-lag punchline, review-panel positioning + three-buyer list. One continuous block, no paragraph breaks.
3. **Exhibit 1 · Methodology** — 5 short bullets: Frame / Week N / Framing / Questions / Cadence. Each bullet has a bolded one-word key and plain-language value.
4. **Exhibit 2 · Select {operator|supplier} comments · Week N cohort** — 3–8 verbatim blockquotes. Attribution = anonymised descriptor + signal-type tag. Embedded quote with tagged attribution (e.g. `"quote text" — DACH operator · margin-mix signal`).
5. **Why they answer** signal-box (warn) — explains the conversion mechanic. For calibration panels: anchor on a rejection or conversion learning from the cohort. Optional embedded quote.
6. **Exhibit 3 · Semantic signal matrix · Week N** — heatmap table. Rows = sentiment dimensions (5–6). Columns = respondents (anonymised as R1 / R2 / ... · short descriptor). Cell classes: `g` (green/positive), `r` (red/negative), `m` (muted/neutral).
7. **Campaign & scale** signal-box (positive) — universe-first framing. Total addressable count + platform/retailer splits. Alpha-differentiation sentence. Pilot-readiness signal ("Pilot-ready Q2-Q3 YYYY").
8. **Body `<footer>`** — hidden in print via `@media print { footer { display: none } }`. Visible on-screen only. @page `@bottom-center` carries the printed footer.

## What NOT to include (learned the hard way)

- **No hero stat row.** Insider-shorthand risk; many institutional alt-data reports skip it. If stats don't serve a cold reader scanning for 2 seconds, drop the row.
- **No subtitle.** Redundant with title + methodology + eyebrow.
- **No response-mapping exhibit.** Publishing the qualitative-to-structured coding rules in-body creates the "magician's trap door" that undercuts the unmeasurable framing. Keep coding scheme in an annex / available on request, never in the main flow.
- **No back-test framework as standalone exhibit at calibration N (≤10).** Spearman / lead-lag / weighting technical detail at small N reads as methodological theater. Fold the reconciliation commitment into the Campaign & scale box ("First reconciliation Aug YYYY, pre-specified").
- **No caveats signal-box when limitations are visible elsewhere.** Matrix column count, methodology N, and "calibration read" framing in the eyebrow already disclose smallness. A dedicated Caveats box repeats what the reader can see.
- **No em-dashes (` — `) anywhere.** Use periods, commas, or colons. Applies to prose AND verbatim quotes (em-dashes in quotes were transcription choices for speech pauses, not semantic markers — safe to normalize).
- **No confidential label** for person-to-person delivery (WhatsApp, personal email). Implicit by channel.
- **No subtitle, no "Vol. I, No. 1"-style edition tags** before actual publication exists. Forward-looking claims to a publication that doesn't exist yet are soft-lies.

## Running headers and footers

Every one-pager that may span to page 2 needs `@page` margin boxes. See `instructions/print-css-primer.md` for the pattern. Short version:

- `@top-center`: icon (data-URL SVG, 11px) + `"{{PANEL_EYEBROW}}"` in mono uppercase
- `@bottom-center`: `"{{PANEL_FOOTER}} · company@example.com · Page N of M · Prepared YYYY-MM-DD"`
- Body `<footer>`: `display: none` in print
- Body `<header>`: h1 only (no duplicate masthead)

## Optional sections (omit if not needed)

- Companion file reference (if a universe chart / PDF ships alongside)
- Appendix (move to separate doc if substantial)

## Content constraints

- **Every paragraph passes `workspace/conventions/writing-voice.md` banned-language filter.**
- **Sentences ≤25 words.** If you can't read without taking a breath, too long.
- **Plain language over jargon.** Replace abstract noun-stacks with concrete verbs. Keep native finance terms (GMV, margin, sentiment, cohort, Spearman where load-bearing). Strip research-speak ("instrument", "calibration", "distributional agreement at calibration N", etc.) if it's substituting for a verb.
- **No forward-looking point estimates** if N below threshold per `workspace/conventions/data-disclosure.md`.
- **Quote attribution respects consent rules.** Default: anonymised role + geography descriptor + signal-type tag. No named attribution without logged consent.
- **No internal-convention noise** (v1/v2 history, sprint ramps, tech stack, manual-calling-as-centerpiece).
- **No "vs [competitor]" framing** even without naming. Describe the method as self-contained properties.
- **Active voice.** "We reconcile against X" not "will be reconciled against X".
- **Em-dashes banned** (` — `). Use periods, commas, or colons. See main structure notes.

## Verification discipline (learned 2026-04-20)

- **Cross-check every claim against the KB before shipping.** Dial counts, respondent counts, specific quotes, tenures, named companies — if the KB doesn't support it, don't assert it.
- **Anonymise when attribution consent is unresolved.** Use R1/R2/... + descriptor (e.g. "R1 · region / tier"). Don't commit named attribution without explicit logged consent per `workspace/conventions/data-disclosure.md`.
- **Ambiguous terminology from transcripts: flag and resolve.** Terms like "Z-Rank", "S2/S3/S4", "Tier-1" that a finance reader won't decode — either verify the meaning against the source audio / KB, generalize the language, or drop the phrase entirely. Never invent an interpretation you can't defend.
- **Ship consistency, not false precision.** If you mark "5/5" in the stat bar, the matrix must match (no (partial completion) tags on row labels). If you commit to `company@example.com always` in one footer, update every other doc + component file.

## Components used

- `workspace/components/headers/{brand}-header.html`
- `workspace/components/blocks/stat-row-4col.html`
- `workspace/components/blocks/signal-box-conclusion.html`
- `workspace/components/blocks/signal-box-warn.html` (for Why-they-answer)
- `workspace/components/blocks/signal-box-positive.html` (for Universe & scale)
- `workspace/components/blocks/two-col-list.html` (methodology + structural)
- `workspace/components/blocks/blockquote-attributed.html`
- `workspace/components/blocks/data-table.html` OR a bespoke matrix
- `workspace/components/blocks/caveats-box.html`
- `workspace/components/footers/{brand}-footer.html`

## Starter template

`starter-templates/one-pager.html` — copy to `workspace/templates/one-pager.html` at setup, resolve brand-level placeholders.

## Build checklist

- [ ] Header has correct brand variant (primary company / panel brand / etc. per context)
- [ ] Stats are signal-first (no N, no dials funnel in hero)
- [ ] Conclusion's first sentence is a standalone summary
- [ ] Blockquote has correct anonymization / attribution
- [ ] Methodology section is factual, not dev-journal
- [ ] Back-test framework is pre-specified (not reverse-engineered)
- [ ] Caveats present if required
- [ ] No `{{UNRESOLVED}}` placeholders
- [ ] Fits on one page in Chrome print preview
- [ ] Filename matches `filename-convention.md`

## Common failures

- **Hero stat row front-loads N.** Fix: replace with signal numbers.
- **Conclusion buries the finding after setup.** Fix: rewrite first sentence as the bottom-line finding.
- **Blockquote is flattering, not revealing.** Fix: pick a quote that shows what the methodology surfaced, even if it's a rejection.
- **Structural section names competitors.** Fix: describe your method as self-contained properties.
- **Caveats block is boilerplate.** Fix: write caveats that reflect this specific doc's weaknesses, not a template.
- **Methodology section lists script versions and sprint ramps.** Fix: cut dev journal; keep sample frame + instrument + response rate.

## Example reference

Once shipped: `workspace/examples/YYYY-MM-DD-onepager-{subject}.html`. Seed with 1–2 references that represent your best execution.
