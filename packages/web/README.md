# @document-factory/web

Self-hosted web editor. Two-pane: **your terminal** (running `claude`, `codex`, `gemini`, or any terminal agent) + **live HTML preview** of whatever the agent writes. No chat UI — the agent's own terminal experience is preserved 1:1.

## Status

v0.2.0-dev — Phase 3. See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for design details and [`../../ROADMAP.md`](../../ROADMAP.md) for the phased plan.

## Run (Docker, recommended)

```bash
docker build -t document-factory/web -f packages/web/Dockerfile .
docker run --rm -it \
  -v "$PWD/workspace:/workspace" \
  -e DF_AGENT_CMD=claude \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  -p 3000:3000 \
  document-factory/web
```

Then open `http://localhost:3000`. You'll see your terminal on the left and the preview pane on the right. Your agent is already running in the container — start chatting with it.

## Run (local dev, without Docker)

```bash
pnpm install
DF_WORKSPACE_DIR=./workspace DF_AGENT_CMD=claude \
  pnpm -F @document-factory/web dev
```

Requires Node 20+, a working C++ toolchain (`node-pty` is a native module), and whatever agent you put in `DF_AGENT_CMD` on your `$PATH`.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `DF_WORKSPACE_DIR` | `$PWD/workspace` | Path to your document-factory workspace. Agent's CWD + file-watcher root. |
| `DF_AGENT_CMD` | `claude` | Shell command the PTY spawns. Can include args: `"aider --model sonnet"`. |
| `PORT` | `3000` | HTTP + WebSocket port. |

Verified agents: `claude`, `codex`, `gemini`, `openclaw tui`, `hermes chat`, `cursor-agent`, `aider`, `/bin/zsh` (plain shell).

## What's in it

- **`server.ts`** — Next.js custom server. Hosts the Next app + a WebSocket upgrade handler at `/terminal` + an SSE channel at `/api/sse/reload`.
- **`app/page.tsx`** — Renders the two-pane `EditorShell`. Server component lists existing docs once; client refreshes on SSE.
- **`app/preview/[slug]/route.ts`** — Reads `workspace/results/<slug>.mdx`, calls `@document-factory/core.build()`, injects the SSE reload script, returns HTML.
- **`components/Terminal.tsx`** — Mounts xterm.js, opens a WebSocket to `/terminal`, forwards keystrokes + resize events to the server-side PTY.
- **`components/Preview.tsx`** — Iframe pointing at `/preview/<slug>`, remounts on SSE reload events.
- **`lib/render-doc.ts`** — Loads brand + component registry from the workspace, renders via core.
- **Dockerfile** — multi-stage build, non-root runtime user, tini as init.

## Security

- **PTY scoped to container user.** Runs as `agent` (UID 1001), not root. Host shell is unreachable.
- **Path-traversal protection.** All workspace I/O goes through `lib/workspace.ts` which refuses paths escaping the workspace root.
- **Iframe sandboxing.** `sandbox="allow-scripts allow-same-origin allow-popups"` — docs can't access the app shell.
- **No auth in v0.2.** Designed for `localhost`-only deployment. Add a reverse proxy with auth (Tailscale Funnel, Caddy + basic-auth) if you expose it.
- **API keys via env.** Never written to workspace files. Map them in at `docker run` time.

## What isn't built yet

- Export PDF button: currently "Open · Print → PDF" opens the preview in a new tab; use Chrome's Cmd+P → Save as PDF. A proper server-side PDF export ships as `packages/pdf-service` (Phase 2).
- Multi-tab terminals (parallel agents). v0.2 = one.
- Auth + multi-user. v0.3+.
- `docker-compose.yml` bundling web + pdf-service. Ships when pdf-service ships.

## See also

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — detailed design
- [`../../ROADMAP.md`](../../ROADMAP.md) — phased plan
- [`../mcp-server/README.md`](../mcp-server/README.md) — how to wire the MCP server your agent uses while inside this editor
