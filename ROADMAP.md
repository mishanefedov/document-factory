# Roadmap

Living document. Updated as decisions land.

## Where we are

**v0.1.0 (2026-04-19)** — private-preview reference kit. Zero code. Prompts + HTML templates + recipes. Users clone, paste SETUP.md into their coding agent, scaffold a `workspace/`, produce HTML, print-to-PDF via Chrome.

This works and ships value. It stays usable standalone forever. v0.2 does not deprecate or absorb it.

## Where we're going

**v0.2** — agent-infrastructure layer *alongside* the kit. Users with a coding-agent CLI (Claude Code, OpenClaw, Codex, Cursor CLI) get a web editor that embeds their terminal next to a live document preview. Users who want the pure kit still get it.

### Goals (v0.2)

- Keep the v0.1 kit fully operational and zero-code.
- Add a core library, MCP server, PDF microservice, web editor, and CLI.
- Self-hostable via `docker compose up` — your data stays on your machine.
- First-class support for *any* terminal-native agent, not just Claude Code.
- No proprietary chat UI. The terminal is the interface.

### Non-goals (v0.2)

- Hosted SaaS (v0.3+ if there's demand).
- Multi-user collaboration (v0.3+).
- Rebuilding Claude Code / Cursor / Codex UX. Users bring their own agent CLI.
- Lock-in to a single document format — the core renders whatever the agent writes.
- Mandatory install-time dependencies for the kit side. If you only want prompts, `git clone` still gets you there.

## Architecture (v0.2)

```
document-factory/
├── instructions/         # UNCHANGED — the IP, still public, still markdown
├── starter-templates/    # UNCHANGED — reference HTML
├── recipes/              # UNCHANGED
├── workspace/            # UNCHANGED — private, local, gitignored
└── packages/             # NEW in v0.2
    ├── core/             # TS lib: parse/resolve/render/validate (stateless)
    ├── mcp-server/       # MCP tools for any MCP-capable agent
    ├── pdf-service/      # Puppeteer microservice: POST /pdf → binary
    ├── web/              # Next.js editor: embedded-terminal + live preview
    └── cli/              # thin wrapper: `df build`, `df preview`, `df export`
```

**The web editor does not have a chat UI.** It has two panes:

1. **Terminal pane** — xterm.js rendering a PTY. The PTY spawns whatever the user configured (`claude`, `codex`, `cursor-agent`, etc.). The terminal is the real thing, not a wrapper.
2. **Preview pane** — iframe serving the current HTML from the user's `workspace/results/`. A filesystem watcher (chokidar) triggers iframe reload on change.

That's the entire editor. The agent's existing terminal UX is preserved 1:1.

See [`packages/web/ARCHITECTURE.md`](packages/web/ARCHITECTURE.md) for the embed mechanics.

## Phased delivery

### Phase 1 — `core` + `mcp-server` (week 1)

- `packages/core`: stateless lib. Parse a doc spec → resolve brand tokens → render HTML → validate against doc-type schema. ~1,500 LOC.
- `packages/mcp-server`: exposes core as MCP tools. Agents call `doc.create`, `doc.update_section`, etc. instead of reading instruction markdown. ~500 LOC.
- Ship both to npm under `@document-factory/*`.
- Demo target: Claude Code with MCP server generates a case-study in 3 chat turns.
- See [`packages/core/API.md`](packages/core/API.md) and [`packages/mcp-server/SPEC.md`](packages/mcp-server/SPEC.md).

### Phase 2 — `pdf-service` (week 2)

- Dockerized headless Chrome via Puppeteer.
- Single endpoint `POST /pdf` → returns PDF binary. `GET /health`.
- No auth in v0.2 (localhost-only). Auth in SaaS variant later.
- ~300 LOC + Dockerfile.

### Phase 3 — `web` (week 3–4)

- Next.js 15 app. Two-pane layout. No SPA framework beyond Next's defaults.
- Left pane: xterm.js mounted on a WebSocket bridged to a server-side node-pty.
- Right pane: iframe `src="/preview/<doc-slug>"`, auto-reloaded via Server-Sent Events when the doc file changes.
- Terminal command configurable via env var `DF_AGENT_CMD` (default `claude`).
- One-line deploy: `docker run -v ./workspace:/workspace -p 3000:3000 document-factory/web`.
- ~2,500 LOC.

### Phase 4 — `cli` (week 5)

- `df build <doc-type> --brief input.md [--brand workspace/BRAND.md]`
- `df preview <doc-slug>` → opens the web editor for an existing doc.
- `df export <doc-slug> --format pdf` → wraps PDF service.
- Power-users who prefer CLI over the web app get full parity.
- ~400 LOC.

### Phase 5 — public launch

- `document-factory.dev` gallery site (static, GitHub Pages).
- Writeup: "why the terminal is the interface."
- Show HN / Product Hunt / Twitter.
- Issue tracker open. PRs for new doc-types and components accepted.

### Phase 6+ — optional SaaS

Only if demand is real. Hosted PDF service + shared brand inheritance for teams + auth. Self-hosted always remains the reference deployment.

## Key architectural decisions (load-bearing; decide before Phase 1)

### D1 — Document schema: MDX, not raw HTML

v0.1 uses raw HTML with `{{PLACEHOLDERS}}`. For agent-driven editing at component granularity, MDX is better: agents reason about "insert a `<StatRow>` component," not "write HTML." Humans still read MDX easily. Render target remains HTML.

**Decision:** MDX. Breaking change from v0.1, mitigated by a one-time migration recipe.

### D2 — Rendering: iframe for preview, server for export

- **Preview:** iframe, sandboxed. Fast, safe, cheap.
- **Export:** server-side Puppeteer. Needed for print CSS fidelity, page-break handling, headers/footers.

### D3 — Persistence: filesystem, no database (v0.2)

- Workspace is a folder on the user's machine (via Docker volume mount).
- No database, no auth, no cloud. Same ethos as v0.1.
- v0.3+ SaaS deployment adds Postgres if needed.

### D4 — Agent contract: MCP, not a custom API

- MCP is the emerging standard for agent tool protocols. Claude Code, Cursor, Continue, OpenClaw all support it.
- Lock-in risk is low: MCP is open-spec.

### D5 — Terminal transport: WebSocket + node-pty

- xterm.js frontend, node-pty backend, WebSocket in between.
- Proven combo (code-server, cloud-shell, ttyd all use it).
- No custom terminal emulator. No Electron.

### D6 — Distribution: npm packages + Docker image

- Each `packages/*` publishes to npm.
- One Docker image bundles web + pdf-service + mcp-server for turnkey self-host.
- CLI is `npx @document-factory/cli` for no-install users.

## Compatibility contract

- v0.1 kit stays usable with zero code and no install. Forever.
- v0.2 adds packages. Installing them is opt-in.
- Breaking changes to the kit (MDX migration) are versioned. v0.1-kit users don't migrate unless they want v0.2 features.

## Open questions (need decisions before shipping)

- **OQ1** — Does the MCP server run inside the web container, as a sibling, or as a separate process the user adds to their `.claude.json`? Current leaning: separate process (cleaner boundary, easier to version independently).
- **OQ2** — Does the web editor ship its own MCP server config, or does it assume the user wired one up? Leaning: ships a sample `.claude.json` snippet, user pastes into their config.
- **OQ3** — How does the terminal pane know which workspace to operate on? Leaning: PTY spawns in the user's workspace directory (env `DF_WORKSPACE_DIR`), agents `pwd` into it naturally.
- **OQ4** — Should the filesystem watcher be directory-wide or per-document? Leaning: directory-wide, cheap with chokidar, handles cross-file imports.

## Risks

- **Puppeteer upkeep** — Chrome changes break PDF output regularly. Commit to maintaining this or pick a managed alternative.
- **MDX migration cost** — users on v0.1 will need a recipe to migrate templates. One-time, well-documented.
- **Agent fragmentation** — if MCP adoption stalls, the server becomes less useful. Mitigation: CLI works fine without MCP for any scriptable agent.
- **Scope creep toward SaaS** — easy to drift from "self-hosted editor" to "hosted editor with accounts." Phase 6 exists to gate that deliberately.

---

*Last updated: 2026-04-20.*
