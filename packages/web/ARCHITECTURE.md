# `@document-factory/web` — architecture

**There is no chat UI.** The web editor is a two-pane window: **your terminal** (running `claude` or whatever) on the left, **live preview** (iframe) on the right. The agent's existing UX is preserved 1:1. We don't build a chat interface on top of Claude Code — we embed Claude Code itself.

## Goals

- Zero learning curve for existing Claude Code / Cursor / Codex users. The terminal is the terminal.
- Live preview that updates as the agent saves files.
- Self-hostable: `docker run document-factory/web` and visit `localhost:3000`.
- Works with any agent that runs in a POSIX shell. Claude Code is the reference, but `codex`, `cursor-agent`, `aider`, even a plain `bash` session all work.

## Non-goals

- Chat bubbles. Markdown rendering of agent output. Slash commands. Avatars. None of it.
- A proprietary model gateway. Users bring their own agent + their own model subscription.
- Multi-user. v0.3+.
- Auth. v0.3+ (localhost-only in v0.2).

## Top-level layout

```
┌─────────────────────────────────┬──────────────────────────────┐
│                                 │                              │
│  xterm.js — live PTY            │  iframe — preview/<slug>     │
│  running user-configured agent  │  auto-reloads on change      │
│                                 │                              │
│  (the actual Claude Code UI,    │  (rendered HTML from core,   │
│   unmodified)                   │   styled with brand tokens)  │
│                                 │                              │
└─────────────────────────────────┴──────────────────────────────┘
    ^                                   ^
    └ WebSocket <─> node-pty            └ fetch /preview/<slug>
                                          reload triggered via SSE
```

## Stack

- **Frontend:** Next.js 15 (App Router). xterm.js for the terminal. Tailwind for app chrome only — doc preview is isolated in iframe, not styled by app CSS.
- **Backend:** Next.js API routes + a WebSocket route for the PTY.
- **PTY:** `node-pty` spawns a login shell at `DF_WORKSPACE_DIR`. Shell runs whatever user configures (`DF_AGENT_CMD`, defaults to `claude`).
- **File watcher:** `chokidar` on `DF_WORKSPACE_DIR/results/**/*.html` + `workspace/**/*.mdx`. On change → emit SSE event → iframe reloads.
- **Preview serving:** static route `/preview/[slug]` serves `workspace/results/<slug>.html` via Next's file-system handler. `<head>` gets an injected SSE listener that reloads on change.

## Process model

One `document-factory/web` container runs:

- Next.js server (port 3000)
- WebSocket for PTY (same port, upgrade path)
- Optional: `@document-factory/mcp-server` sibling process, so agents inside the PTY can call MCP tools against the *same* workspace. Wired via `.claude.json` mounted into the container.
- Optional: proxy to `@document-factory/pdf-service` running in sibling container (via `docker compose`).

## Terminal embedding — the hard parts

### Attach, don't wrap

The PTY runs the user's real `claude` binary. We don't parse its output, transform it, or inject commands. We pipe bytes in both directions. This keeps:

- Keybindings working (`claude`'s Tab-complete, Ctrl-C, up-arrow history)
- Colors and terminal control sequences (the spinner, the syntax highlighting, the tool-call UI)
- Future-proof: when Claude Code ships a new feature, it shows up in our terminal for free.

### PTY size sync

xterm.js fires a `resize` event when the user drags the pane divider. We forward `cols × rows` to node-pty via a control message. Without this, TUIs misalign.

### Reconnection

If the WebSocket drops (laptop sleep, network blip), the PTY keeps running server-side. Client reconnects and replays the last 10K bytes of output buffer so xterm re-renders the visible state. Agent's session continues uninterrupted.

### Agent-command configurability

`DF_AGENT_CMD` env var selects the shell command the PTY spawns. It's a full command string, not just a binary — args are fine. Verified working with:

- `claude` — Claude Code (default)
- `codex` — OpenAI Codex CLI
- `gemini` — Google Gemini CLI (has its own `gemini mcp` registry too)
- `openclaw tui` — OpenClaw's TUI client. Requires the Gateway already running (`openclaw gateway start`). Agent lives in the Gateway process; the PTY hosts only the client. Our chokidar watcher still fires correctly because it watches the workspace volume, not the PTY.
- `hermes chat` (interactive) or `hermes --tui` (Textual-style)
- `cursor-agent` — Cursor CLI (if/when headless mode ships)
- `aider --model sonnet` — Aider with a specific model
- `/bin/zsh` — just a shell, for power users who want full control

Users add their own `DF_AGENT_CMD` to `docker-compose.override.yml`.

### Agent-independence invariant

Our only assumption is: the agent (a) runs interactively in a PTY, (b) writes files into `DF_WORKSPACE_DIR`. We don't parse agent output, don't know which model is serving, don't know whether the agent is local or a Gateway client. Any terminal-native agent that satisfies (a) + (b) works. That's the whole compatibility story.

### Shell environment

PTY starts at `DF_WORKSPACE_DIR`. Inherits `PATH`, `HOME`, and any env explicitly passed by the container (so the agent sees the user's API keys). Inside the container, `claude` sees a workspace with:

- `workspace/` — user's content, mounted from host
- `.claude.json` — pre-wired with the MCP server pointing at this workspace
- `/usr/local/bin/claude` — installed via `npm i -g @anthropic-ai/claude-code` in the base image (optional; users can mount their own binary)

## Live preview — details

### Auto-reload mechanism

Server watches `workspace/results/**/*.html` with chokidar. On change:

1. Debounce 150ms (agents often write then immediately adjust).
2. Emit `{ type: 'reload', slug }` over an SSE channel keyed by slug.
3. The iframe's `<head>` includes a tiny inline script that listens to SSE, reloads the page on event.

### Preview URL shape

- `/preview/<slug>` — renders workspace/results/<slug>.html as-is.
- `/preview/<slug>/raw` — returns the unrendered MDX.
- `/preview/<slug>/pdf` — proxies to pdf-service.

### Iframe isolation

`sandbox="allow-scripts allow-same-origin"` — no network access to top frame, no form submission. Preview CSS cannot leak into app CSS.

### Brand-token resolution

Documents in `workspace/results/` are already rendered HTML (by the agent via MCP `render` tool, or by CLI). The web editor does not re-render on the fly — that would require running `core` in the browser, which is possible but unnecessary.

## Files served

```
/ (app root)
  index.html          — the two-pane layout
  /terminal           — WebSocket upgrade endpoint
  /preview/[slug]     — static + injected SSE listener
  /sse                — SSE channel for reload events
  /api/*              — not used in v0.2 beyond health check
```

## Docker deployment

```yaml
# docker-compose.yml
services:
  web:
    image: document-factory/web:0.2
    ports: ['3000:3000']
    volumes:
      - ./workspace:/workspace
      - ./.claude.json:/home/agent/.claude.json:ro
    environment:
      - DF_WORKSPACE_DIR=/workspace
      - DF_AGENT_CMD=claude
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
  pdf:
    image: document-factory/pdf-service:0.2
    ports: ['3001:3001']
```

User's PATH to first doc:

```
$ docker compose up
$ open http://localhost:3000
[terminal pane shows claude prompt]
> Draft a case study about X
[agent works in terminal; right pane updates as files are written]
> done — ready to export
[user clicks 'Export PDF' in app header]
```

## Security considerations

- **PTY runs in the container's user context.** The container runs as a non-root user (`agent`, UID 1001). Workspace volume owned by that user.
- **No host shell access.** The PTY is scoped to the container. Escaping requires container-breakout, not a doc-factory bug.
- **API keys injected via env.** Never written to workspace files. User's `.claude.json` may reference `${ANTHROPIC_API_KEY}` which Claude Code expands at runtime.
- **Preview iframe sandboxed.** No way for a doc's HTML to read or modify app state.
- **Resource limits.** `ulimit`/cgroup caps on PTY processes to prevent a runaway agent from DoSing the container.

## Open questions

- **OQ1** — Do we support multiple simultaneous terminals (tabs)? v0.2 = one; v0.3 = tabs for parallel agents. Leaning: one, ship faster.
- **OQ2** — Does the app need any persistent state (recent docs, last terminal session)? Leaning: localStorage only. No backend DB.
- **OQ3** — Do we provide a "split preview" for comparing two docs side-by-side? Nice-to-have, deferred.
- **OQ4** — How does the user install their agent? Ship Claude Code pre-installed in the image (fragile, binary version drift) or document `docker exec claude-code install`? Leaning: document; don't bundle.

## Tests

- Unit: xterm.js ↔ node-pty round-trip (echo server test).
- Integration: Playwright test that opens the app, types a command, asserts output.
- Chaos: kill the WebSocket mid-session, assert reconnection + buffer replay.
- Preview: modify workspace file, assert iframe reloaded within 300ms.
