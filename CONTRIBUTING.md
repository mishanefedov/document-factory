# Contributing to document-factory

Thanks for the interest. This project is in early v0.x. Here's how contribution works right now.

---

## Current contribution stance

- **External PRs:** not accepted during v0.x. The API (prompts + starter templates + naming) is still shifting.
- **Issues:** very welcome. Bug reports, feature requests, architecture questions, "this broke for me" reports — all valuable.
- **Discussions:** enabled. Open a Discussion for anything open-ended (design questions, "what would it take to support X use case").

When v1.0 ships (prompts stabilized across 5+ real docs in the field), PRs will open.

---

## Repo structure

```
document-factory/
├── instructions/         — prompts for coding agents (the IP)
│   ├── doc-types/        — per-doc-type specs
│   └── RESOLVER.md       — intent → instruction-file routing table
├── starter-templates/    — brand-agnostic HTML with {{PLACEHOLDERS}}
│   ├── components/       — blocks, headers, footers
│   └── tokens/           — brand.css + print.css
├── recipes/              — prompt shortcuts (setup, build, add)
├── examples/             — public reference docs (generic / neutralized)
├── workspace/            — gitignored per-user layer (README stubs only)
├── SETUP.md              — bootstrap prompt for agents
├── README.md, LICENSE, CHANGELOG.md, VERSION
└── .github/              — issue templates + CI workflows
```

Read `instructions/factory-rules.md` and `instructions/RESOLVER.md` before proposing any change to the prompt system.

---

## Versioning

Semantic versioning. Single source of truth is `VERSION` at repo root.

- **Major (`1.0.0`):** breaking changes to prompt API, instruction file names, component schemas, starter-template placeholders
- **Minor (`0.x.0`):** new doc-types, new components, new recipes
- **Patch (`0.1.x`):** typo fixes, doc improvements, non-breaking clarifications

Release process (v1.0+):

1. Update `VERSION`
2. Update `CHANGELOG.md` — move items from `## [Unreleased]` into a new dated version block
3. Tag: `git tag v{version}` and push the tag
4. GitHub Actions cuts a release (when `release.yml` is added)

---

## Proposing a new doc-type

Follow `recipes/add-new-template.md`. At minimum, a new doc-type requires:

- `instructions/doc-types/{name}.md` with YAML frontmatter (`name`, `version`, `triggers`, `reads`) and the full doc-type spec
- `starter-templates/{name}.html` with brand-agnostic `{{PLACEHOLDERS}}`
- An entry in `instructions/RESOLVER.md` so agents can discover it

---

## Proposing a new component

Follow `recipes/add-new-component.md`. Components must:

- Open with a comment header (see `instructions/component-conventions.md`)
- Rely only on tokens defined in `starter-templates/tokens/brand.css`
- Ship in `starter-templates/components/{category}/{name}.html`

---

## Reporting a bug

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md). Required:

- Which doc-type you were building
- Which coding agent you used (Claude Code, Cursor, Codex, Aider)
- What the agent produced vs. what you expected
- Any relevant prompt or instruction files you consulted

---

## Code of conduct

Be direct, be honest, no bullshit. Don't dogpile. Don't hedge on technical feedback.
