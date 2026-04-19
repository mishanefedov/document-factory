# Filename convention

*How output files are named.*

---

## The format

```
YYYY-MM-DD-{doc-type}-{subject}[-{suffix}].html
```

Examples:

```
2026-04-20-onepager-acme-platform.html
2026-04-20-onepager-acme-supplier.html
2026-04-28-progress-note-advisor.html
2026-05-15-case-study-acme-corp-v2.html
2026-05-20-cover-letter-vc-outreach.html
```

## Rules

- **ISO date first.** Lexicographic sort = chronological sort. Critical for `workspace/results/` and `workspace/examples/` hygiene.
- **`doc-type`** is kebab-case from the registered doc types. See `instructions/doc-types/` for the catalog. Add a new type by following `recipes/add-new-template.md`.
- **`subject`** is kebab-case, short, grep-friendly. Use the recipient or topic — whatever identifies the doc in 6 months. "advisor-q2", "partner-followup", "acme-supplier-audit".
- **`suffix`** is optional — `v2`, `revised`, `final`. Avoid the word "final." Use revision numbers if iteration happens: `-v1`, `-v2`.
- **All lowercase.** No spaces, no uppercase, no underscores.
- **No `%20`, no emoji, no ampersand.** Subject names containing `&` (e.g. `Acme & Co`) should become `acme-and-co` in the filename.

## Why ISO-date-first

- Sorts correctly by default in every file browser and CLI
- Disambiguates docs with similar subjects (e.g. three progress notes to the same advisor, all different dates)
- Makes grep easy: "show me all docs from April 2026" = `ls 2026-04-*`
- Matches the pattern in `~/IdeaProjects/knowledge-base/` and most research publication conventions

## `workspace/results/` vs `workspace/examples/`

- **`workspace/results/`** — output of every doc-build session. Can accumulate. Agent writes here by default. User moves shipped/notable docs to `examples/`.
- **`workspace/examples/`** — curated. Canonical shipped docs the agent reads to learn "what good looks like" for this user's brand. Each file paired with a short README note: what this doc teaches.

Agent rule: **write new docs to `results/`, read prior docs from both `results/` and `examples/`.**

## Dating rule

- Use the ISO date of when the **doc is shipped** (or the date on the doc's footer), not the date the agent happened to generate the HTML. If the doc will ship tomorrow but is being drafted today, use tomorrow's date.
- If the user hasn't specified, ask. Don't guess.
