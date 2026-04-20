# @document-factory/mcp-server

MCP server. Exposes `@document-factory/core` operations as tools callable by any MCP-capable agent: Claude Code, Cursor, Continue, Codex, Hermes, Gemini CLI, OpenClaw TUI.

## Status

v0.2.0-dev — Phase 1. See [`SPEC.md`](./SPEC.md) for the full tool surface.

## Install (as a dependency of a coding agent)

### Claude Code

Add to your `~/.claude.json`:

```json
{
  "mcpServers": {
    "document-factory": {
      "command": "npx",
      "args": ["-y", "@document-factory/mcp-server"],
      "env": {
        "DF_WORKSPACE_DIR": "/absolute/path/to/your/workspace"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` at your workspace root:

```json
{
  "mcpServers": {
    "document-factory": {
      "command": "npx",
      "args": ["-y", "@document-factory/mcp-server"],
      "env": { "DF_WORKSPACE_DIR": "/absolute/path/to/workspace" }
    }
  }
}
```

### Gemini CLI

```
gemini mcp add document-factory \
  --command "npx" --args "-y,@document-factory/mcp-server" \
  --env "DF_WORKSPACE_DIR=/absolute/path/to/workspace"
```

### Any other MCP client

The server speaks MCP over stdio. Any compliant MCP client will work.

## Run standalone (debug)

```
DF_WORKSPACE_DIR=./workspace npx @document-factory/mcp-server
```

Then send JSON-RPC messages over stdio per the MCP protocol.

## Tools exposed in v0.2 Phase 1

- `list_doc_types` — available document schemas
- `list_components` — component registry
- `list_documents` — existing docs in `results/`
- `describe_brand` — brand tokens + voice
- `read_document` — raw MDX
- `create_document` — new doc
- `update_document` — replace MDX
- `delete_document` — remove file
- `render` — MDX → full HTML
- `validate` — schema check

Planned for Phase 2: `update_section`, `insert_section`, `insert_component`, `update_component`, `export_pdf`, `preview_url`. See [`SPEC.md`](./SPEC.md).

## Workspace layout

The server reads `DF_WORKSPACE_DIR` (defaults to `./workspace`) and expects:

```
workspace/
├── brand.json              # Brand definition (optional; a default is used if missing)
├── components/
│   └── registry.json       # ComponentRegistry (optional)
├── doc-types/
│   └── <type>.json         # DocTypeSchema per document type (optional)
└── results/
    └── <slug>.mdx          # Documents created by agents
```

All paths outside the workspace directory are refused. See `workspace.ts` for the safety mechanism.

## Tests

```
pnpm -F @document-factory/mcp-server test
```

## See also

- [`SPEC.md`](./SPEC.md) — full tool reference
- [`../../ROADMAP.md`](../../ROADMAP.md) — phased delivery plan
