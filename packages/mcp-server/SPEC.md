# `@document-factory/mcp-server` — tool surface

MCP server. Exposes `@document-factory/core` operations as tools for any MCP-compatible agent (Claude Code, Cursor, Continue, OpenClaw, custom).

## Why MCP

Instead of agents reading 14 markdown files to figure out how to produce a document, they call one tool: `doc.create("case-study", { brief })`. The server does the structured work, returns a path. Agents then edit via `doc.update_section` or `doc.insert_component`, never by writing raw HTML.

This removes:
- Prompt drift ("I forgot to include the signal-boxes component")
- Formatting inconsistency (every agent produces same HTML structure)
- The "14 markdown files" cognitive load on every fresh session.

## Transport

- stdio (default, for local agents like Claude Code)
- HTTP (for web editor's backend and for remote self-hosted deployments)

## Configuration

The server reads a `workspace/` directory path (defaults to `$PWD/workspace`, overridable via `DF_WORKSPACE_DIR` env). All reads/writes scoped there. No access outside.

## Tool surface

### Discovery

```
list_doc_types() → [{ id, label, description, required_frontmatter, recommended_sections }]
list_components() → [{ name, description, prop_schema, example }]
list_documents() → [{ slug, type, title, updated_at }]
describe_brand() → Brand (the resolved brand token object)
```

Agents call these once at session start to ground themselves. Cheap, fast, no LLM round-trip for each.

### Document lifecycle

```
create_document({
  type: string,                     // e.g. 'case-study'
  slug?: string,                    // auto-generated from title if omitted
  frontmatter: Record<string, unknown>,
  initial_content?: string          // MDX body, optional
}) → { slug, path, validation: ValidationResult }
```

```
read_document(slug) → { mdx: string, meta }
```

```
update_document({
  slug: string,
  mdx: string                       // full replacement
}) → { validation, preview_url }
```

```
delete_document(slug) → { ok }
```

### Section-level editing (what agents should prefer over full-document overwrites)

```
update_section({
  slug: string,
  section_id: string,               // from DocSpec.sections[].id
  new_mdx: string
}) → { validation, preview_url }
```

```
insert_section({
  slug: string,
  after_section_id: string | null,  // null = at top
  heading: string,
  body_mdx: string
}) → { section_id, validation, preview_url }
```

```
delete_section({
  slug: string,
  section_id: string
}) → { ok, validation }
```

### Component insertion

```
insert_component({
  slug: string,
  section_id: string,
  component_name: string,           // e.g. 'StatRow'
  props: Record<string, unknown>,
  position?: 'start' | 'end'        // default 'end'
}) → { component_id, validation, preview_url }
```

```
update_component({
  slug: string,
  component_id: string,
  props: Record<string, unknown>
}) → { validation, preview_url }
```

### Rendering + export

```
render(slug) → { html: string, meta }
```

```
export_pdf({
  slug: string,
  options?: { format: 'A4'|'letter', margin: string, header?: string, footer?: string }
}) → { pdf_bytes_base64, size_kb }
```

### Validation + preview

```
validate(slug) → ValidationResult
```

```
preview_url(slug) → { url: string }     // returns the local preview URL the web editor serves
```

### Brand + workspace

```
resolve_brand() → Brand
update_brand(patch: DeepPartial<Brand>) → { brand, ok }
list_examples(type?: string) → [{ slug, type, path, updated_at }]     // from workspace/examples/
```

## Error model

Every tool returns either a success object or `{ error: { code, message, details? } }`. Codes:

- `E_NOT_FOUND` — document, component, or section not found
- `E_VALIDATION` — operation violates doc-type schema
- `E_CONFLICT` — race with concurrent edit (compare content hash)
- `E_WORKSPACE` — workspace directory not initialized
- `E_RENDER` — rendering failed (malformed MDX, missing component)
- `E_EXPORT` — PDF service unavailable or failed
- `E_PERMISSION` — path escapes workspace

## Authentication

v0.2: **none.** Server runs as the user's own process on localhost, scoped to their workspace. No multi-tenant concerns.

v0.3+ (SaaS): per-user auth token, workspace-id in header.

## Content hash / concurrency

Every `read_*` response includes `content_hash` (SHA-256 of the MDX). Every write tool accepts optional `expected_hash`. If provided and mismatched → `E_CONFLICT`. Prevents agent+agent or agent+user collisions.

## Example session (Claude Code via MCP)

```
User: "Draft a case study about the Acme engagement wins"

Claude (via MCP):
  → list_doc_types()            // discovers 'case-study'
  → describe_brand()            // gets brand name, colors, voice
  → list_examples('case-study') // reads 2 prior case-studies for tone match
  → create_document({
      type: 'case-study',
      frontmatter: { client: 'Acme', outcome: '4 completed engagements' },
      initial_content: '...'
    })
  → insert_component({ slug, section_id: 'metrics', component_name: 'StatRow', props: {...} })
  → validate(slug)
  → render(slug)
  → preview_url(slug)
```

The user sees the preview refresh in the iframe. Zero typing for the user; Claude Code did it in five tool calls.

## Installation (for Claude Code)

Add to user's `.claude.json`:

```json
{
  "mcpServers": {
    "document-factory": {
      "command": "npx",
      "args": ["-y", "@document-factory/mcp-server"],
      "env": {
        "DF_WORKSPACE_DIR": "/Users/you/docs/workspace"
      }
    }
  }
}
```

## Non-goals

- Agent orchestration (which agent? which model? how many passes?). That's the user's `claude`/`codex`/`cursor-agent` choice.
- Prompt templates. Prompts stay in `instructions/` — the server exposes data, not prose.
- Cross-workspace operations. One server instance = one workspace.
- Streaming render. Too much complexity for v0.2; agents can call `render` after each edit.

## Open questions

- **OQ1** — Should component insertion return a stable `component_id` that survives MDX reformat? Leaning yes; generate from a hash of (section_id + position + props) at insert time.
- **OQ2** — How do we expose workspace-specific custom components? Leaning: server reads `workspace/components/**/*.html` at startup, merges with built-ins.
- **OQ3** — Do we need a `batch_update` tool for agents that want to apply 5 edits atomically? Leaning: yes, v0.2.1.

## Tests

- Unit per tool: happy path, every error code.
- Integration: spawn server, connect as MCP client, run a 20-tool-call scripted session.
- Property: any sequence of `create + insert_component*` leaves the workspace valid.
