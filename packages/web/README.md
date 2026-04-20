# @document-factory/web

Self-hosted web editor. Two-pane: **your terminal** (running `claude`, `codex`, `gemini`, or any terminal agent) + **live HTML preview** of whatever the agent writes. No chat UI — the agent's real terminal experience is preserved 1:1.

## Status

v0.2.0-dev — Phase 3. See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for design details.

---

## Run it

### npm / npx (default — recommended)

```bash
npx @document-factory/web
```

Or install globally:

```bash
npm install -g @document-factory/web
df-web
```

Then open `http://localhost:45367`.

**Why npm first:** your terminal agent (Claude Code, Gemini CLI, etc.) already lives on your `$PATH`. Running `df-web` natively means the embedded terminal can call that exact binary, with your exact shell environment, without any bind-mount gymnastics. `DF_AGENT_CMD=codex df-web` just works — no rebuild, no image swap.

### Configuration

| Variable | Default | Purpose |
|---|---|---|
| `DF_WORKSPACE_DIR` | `$PWD/workspace` | Path to your document-factory workspace. Agent's CWD + file-watcher root. |
| `DF_AGENT_CMD` | `claude` | Shell command the PTY spawns. Can include args: `"aider --model sonnet"`. |
| `PORT` | `45367` | HTTP + WebSocket port. Chosen high-range to dodge the usual 3000/3001/8080 crowd. |

Verified agents: `claude`, `codex`, `gemini`, `openclaw tui`, `hermes chat`, `cursor-agent`, `aider`, `/bin/zsh` (plain shell).

### Requirements

- Node 20+
- Your chosen agent on `$PATH` (or a full path in `DF_AGENT_CMD`)
- On bare systems without `node-pty` prebuilds: a C++ toolchain (`python3`, `make`, `g++`). macOS-arm64, macOS-x64, linux-arm64, linux-x64 have prebuilds and skip this.

---

## Run it (Docker — alternative)

For users who specifically want isolation, a reproducible build environment, or a production-style self-hosted deployment:

```bash
docker build -t document-factory/web -f packages/web/Dockerfile .
docker run --rm -it \
  -v "$PWD/workspace:/workspace" \
  -e DF_AGENT_CMD=claude \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  -p 45367:45367 \
  document-factory/web
```

**Docker tradeoffs (vs npm):**

- ✅ Sandboxed PTY — agent can't touch anything outside the mounted workspace.
- ✅ No host toolchain required — `node-pty` compiles inside the build stage.
- ✅ Production-style deployment (multi-user self-hosted, cloud VPS).
- ⚠️ Your agent binary has to be inside the image OR bind-mounted. Version drift between image and host Claude Code updates will bite you.
- ⚠️ macOS bind-mount performance is slower than native filesystem.
- ⚠️ Docker Desktop licensing on macOS for larger orgs.

**Rule of thumb:** start with npm. Switch to Docker if you specifically need the isolation.

---

## Run it (from a local clone — for contributors)

```bash
git clone https://github.com/mishanefedov/document-factory.git
cd document-factory
pnpm install
DF_WORKSPACE_DIR=./workspace pnpm -F @document-factory/web dev
```

---

## What's in it

- **`server.ts`** — Next.js custom server. Hosts the Next app + a WebSocket upgrade handler at `/terminal` + an SSE channel at `/api/sse/reload`.
- **`bin/df-web.mjs`** — npm binary entry. Registers the tsx ESM loader and hands off to `server.ts`.
- **`app/page.tsx`** — renders the two-pane `EditorShell`. Server component lists existing docs once; client refreshes on SSE.
- **`app/preview/[slug]/route.ts`** — reads `workspace/results/<slug>.mdx`, calls `@document-factory/core.build()`, injects the SSE reload script, returns HTML.
- **`components/Terminal.tsx`** — mounts xterm.js, opens a WebSocket to `/terminal`, forwards keystrokes + resize events to the server-side PTY.
- **`components/Preview.tsx`** — iframe pointing at `/preview/<slug>`, remounts on SSE reload events.
- **`lib/render-doc.ts`** — loads brand + component registry from the workspace, renders via core.
- **Dockerfile** — alternative deployment, multi-stage build, non-root runtime user, tini as init.

---

## Security

- **PTY inherits the calling user's context.** If you run `df-web` on your laptop, the agent runs as you — same permissions, same `$PATH`, same env. That's the point (it's how your agent would run in a regular terminal). If you want a sandbox, use the Docker image.
- **Path-traversal protection.** All workspace I/O goes through `lib/workspace.ts`, which refuses paths escaping the workspace root.
- **Iframe sandboxing.** `sandbox="allow-scripts allow-same-origin allow-popups"` — docs can't access the app shell.
- **No auth in v0.2.** Designed for `localhost`-only deployment. If you expose it beyond localhost, put a reverse proxy (Tailscale Funnel, Caddy + basic-auth) in front.
- **API keys via env.** Never written to workspace files. Export them before running.

---

## What isn't built yet

- **Export PDF button.** Currently "Open · Print → PDF" opens the preview in a new tab; use Chrome's Cmd+P → Save as PDF. A proper server-side export ships as `@document-factory/pdf-service` (Phase 2).
- **Multi-tab terminals** (parallel agents). v0.2 = one. v0.3+ = tabs.
- **Auth + multi-user.** v0.3+.
- **`docker-compose.yml`** bundling web + pdf-service. Ships when pdf-service ships.

---

## See also

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — detailed design
- [`../../ROADMAP.md`](../../ROADMAP.md) — phased plan
- [`../mcp-server/README.md`](../mcp-server/README.md) — how to wire the MCP server your agent uses while inside this editor
