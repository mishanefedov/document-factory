# workspace/templates

Your resolved doc templates. One HTML file per doc type.

Typical files after setup:
- `one-pager.html`
- `progress-note.html`
- `case-study.html`
- `cover-letter.html`

Each template links `../tokens/brand.css` + `../tokens/print.css`, composes components from `../components/`, and has content-level `{{PLACEHOLDERS}}` the agent resolves per doc-build session.

See `instructions/template-conventions.md` for authoring rules. See `instructions/doc-types/*.md` for the spec of each type.
