# Recipe — add a new template type

*How to add a new doc-type to the factory.*

---

## When to add a new type

Every 3–5 docs you ship, review `workspace/results/`. If 2+ docs have substantially diverged from the existing templates and forced you to restructure from scratch each time, it's a new type worth extracting.

Don't add a new type for one-off needs. One-offs live in `workspace/results/` without a template.

## Steps

### 1. Write the spec in `instructions/doc-types/{new-type}.md`

Follow the pattern of existing doc-type spec files:

- Purpose
- Audience
- Length
- Required sections (in order)
- Optional sections
- Content constraints
- Components used
- Starter template reference
- Build checklist
- Common failures

Be concrete. Vague specs produce vague docs.

### 2. Build the starter template in `starter-templates/{new-type}.html`

Follow `instructions/template-conventions.md`. Keep it brand-agnostic — use `{{PLACEHOLDERS}}` for anything brand-specific. Link `../tokens/brand.css` + `../tokens/print.css`.

### 3. Copy into `workspace/templates/{new-type}.html`

Resolve brand-level placeholders from the user's `workspace/BRAND.md`. Leave content-level placeholders for the agent to fill per-doc.

### 4. Build the first doc using the new template

Treat this as a test. The first doc will expose what's missing from the spec.

### 5. Iterate the spec + starter template based on what broke

Update `instructions/doc-types/{new-type}.md` with what you learned.

Update `starter-templates/{new-type}.html` if the structure should change.

### 6. (Public-repo contribution) Generalize and PR

If the new type is useful beyond your own use case, submit a PR to this repo. Strip brand-specific residue, confirm `{{PLACEHOLDERS}}` are generic, add the doc-type spec to the public instructions.

## Anti-patterns

- **Don't add a template for a doc you write once a year.** Templates pay back only when reused.
- **Don't add a template that duplicates 90% of an existing one.** If it's the same structure with minor variation, extend the existing template with an optional section.
- **Don't forget to write the spec file.** The `.html` without a `.md` spec creates a template no agent can confidently fill.
