# Recipe — build a new doc

*How to prompt a coding agent to generate a new doc from the factory.*

---

## Recommended prompt structure

1. **What type of doc.** (`one-pager`, `progress-note`, `case-study`, `cover-letter`)
2. **Audience.** Who reads it. One sentence.
3. **Purpose.** What you want the reader to do / conclude.
4. **Source material.** Links to KB files, Notion pages, prior docs, data sheets — whatever the agent needs to draw content from.
5. **Any specific constraints.** Length, deadline, tone override, attribution rules that differ from default.

## Example prompt

> Build a one-pager from the research KB. Audience: sell-side equity analyst, reads sell-side alt-data daily. Purpose: share first calibration read + demonstrate the research has a testable back-test framework.
>
> Source: read `~/your-kb/project/interview-results.md`, `~/your-kb/people/advisor-profile.md`, and `~/your-kb/decisions/YYYY-MM-DD-framing-verdict.md`.
>
> Use `workspace/conventions/writing-voice.md` and `workspace/conventions/data-disclosure.md` rules. Ship date: YYYY-MM-DD.

## What the agent does

1. Loads `instructions/00-read-first.md`, `factory-rules.md`, relevant `doc-types/*.md`, `workspace/BRAND.md`, `workspace/conventions/*.md`
2. Copies `workspace/templates/{type}.html` → `workspace/results/YYYY-MM-DD-{type}-{subject}.html`
3. Fills slots from source material + conversation
4. Checks output against conventions (banned language, caveats block, filename)
5. Shows you a summary: what's in each section, what was cut, any open questions
6. You iterate; agent revises in place

## After the agent produces HTML

1. Open in Chrome: `open workspace/results/2026-04-20-onepager-subject.html`
2. Cmd+P → Save as PDF → check "Background graphics" → save alongside the HTML
3. Ship the PDF
4. If the doc is canonical, copy to `workspace/examples/` with a short "what this teaches" note

## Iterating on the doc

Ask the agent:

> Trim the Methodology section to 3 bullets max. Move the cohort size from hero to methodology.

Or:

> The Caveats don't reflect this specific doc's weaknesses. Rewrite based on the actual sample skew (e.g. region-dominant), missing attribution consent on named quotes, and any coverage gaps in the dataset.

Agents produce better output from sharp revisions than from initial drafts. Expect 2–3 iteration rounds.
