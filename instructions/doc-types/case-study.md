---
name: case-study
version: 1
description: 3–12 page formal research case study intended for multi-audience distribution.
triggers:
  - "case study"
  - "case-study"
  - "white paper"
  - "research publication"
  - "full report"
reads:
  - instructions/00-read-first.md
  - instructions/factory-rules.md
  - instructions/filename-convention.md
  - instructions/print-css-primer.md
  - workspace/BRAND.md
  - workspace/conventions/writing-voice.md
  - workspace/conventions/data-disclosure.md
  - workspace/templates/case-study.html
writes_to: workspace/results/
mutating: true
---

# Doc type — case-study

*Spec for a multi-page research case study. Formal published artifact intended for multi-audience distribution.*

---

## Purpose

A case study documents a complete piece of research or a completed client engagement — methodology, findings, back-test, implications — at a level of depth a reader can cite, share, or use to build a trade thesis.

## Audience

Multiple readers. Sell-side analysts, fund analysts, corporate strategy teams, research buyers, or a mix. Prepared for distribution, not sent to one person.

## Length

3–12 pages typical. Shorter than a white paper, longer than a progress-note. Body pages, not counting appendices.

## Required sections (in order)

1. **Cover page** (optional for short case studies) — title, subtitle, date, confidentiality, brand
2. **Executive summary** — 1 page, everything a reader needs if they stop here
3. **Introduction / context** — what the study is about, why it exists, what question it answers
4. **Methodology** — sample frame, instrument, cohort construction, response rate, transparency on manual-vs-automated components
5. **Findings** — the data, with charts / tables / signal matrices. Lead with strongest signal.
6. **Attributed voices** — 2–5 blockquotes from respondents, following consent rules
7. **Back-test** — pre-specified reconciliation framework. Include framework before running it.
8. **Implications** — what this means for each buyer segment (named by role, not by company)
9. **Caveats** — limitations, skew, single-respondent flags, what the study is NOT
10. **Appendix A: Full instrument**
11. **Appendix B: Cohort construction detail**
12. **Appendix C: Additional quote corpus** (optional)
13. **Footer** — brand + contact + confidentiality + pagination

## Content constraints

- **Executive summary must stand alone.** A reader who reads only the exec summary must understand the finding and the methodology.
- **Findings section leads with signal.** Weakest findings move to appendix or get cut.
- **No forward-looking claims** unless the case study is a formal publication with verifiable public-time-series reconciliation, and the user's `data-disclosure.md` permits.
- **Back-test framework shipped before back-test runs.** Pre-specified. Otherwise the back-test is reverse-engineering.
- **Consent-respected attribution.** Typically named attribution requires explicit consent; default to title + geography.
- **Caveats block that reflects this specific study's weaknesses.** Not boilerplate.
- **Pass `workspace/conventions/writing-voice.md` and `workspace/conventions/data-disclosure.md` at every section.**

## Components used

- `workspace/components/headers/{brand}-header.html` (repeated on each page via `@page` rule)
- `workspace/components/blocks/stat-row-4col.html` (exec-summary hero)
- `workspace/components/blocks/signal-box-conclusion.html`
- `workspace/components/blocks/signal-box-warn.html`
- `workspace/components/blocks/blockquote-attributed.html` (multiple)
- `workspace/components/blocks/data-table.html`
- `workspace/components/blocks/caveats-box.html`
- `workspace/components/footers/{brand}-footer.html` (repeated per page)
- Possibly bespoke chart components (`workspace/components/charts/*.html`)

## Starter template

`starter-templates/case-study.html` — a multi-page scaffold with `break-before: page` rules between major sections.

## Build checklist

- [ ] Cover page / or exec-summary renders on page 1 of PDF preview
- [ ] Section breaks land cleanly (no orphaned headings)
- [ ] Chart components render with backgrounds (check Chrome print settings)
- [ ] Every block that should not split across pages has `break-inside: avoid`
- [ ] Page numbers render if required (via `@page { @bottom-right { content: counter(page); }}`)
- [ ] Header + footer repeat on each page (named `@page` regions)
- [ ] All appendices cross-referenced from body
- [ ] Voice + disclosure conventions passed at every section
- [ ] Filename matches `filename-convention.md`

## Common failures

- **Executive summary is a table of contents.** Fix: rewrite as standalone summary.
- **Findings section buried halfway in.** Fix: move to page 2. Case study readers will skip around; respect their reading pattern.
- **Cited quotes are flattering.** Fix: include at least one objection, rejection, or contrarian voice for credibility.
- **Appendix overflows into body.** Fix: appendices get their own section with `break-before: page`.
- **Chart images don't render in PDF.** Fix: check that charts are SVG (or high-res PNG), backgrounds enabled in print dialog.
- **Back-test is reverse-engineered.** Fix: ship the framework before running. If already run, frame it as descriptive validation, not pre-registered.
