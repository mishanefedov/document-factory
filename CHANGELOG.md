# Changelog

All notable changes to `document-factory` are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] — 2026-04-20

The infrastructure milestone. Turns document-factory from a prompt library into a two-pane editor: your agent's real terminal on one side, live HTML preview on the other. Still agent-agnostic, still MIT, still gitignored-workspace.

### Added

- **`@document-factory/web`** — Next.js custom server with an embedded xterm.js terminal over `node-pty`, plus an SSE-driven live preview. Default port `45367`. Agent is swappable via `DF_AGENT_CMD` (verified: `claude`, `openclaw tui`, `gemini`, `codex`, `cursor-agent`, `aider`, `/bin/zsh`).
- **`@document-factory/core`** — pure renderer taking MDX + brand tokens + component registry → HTML. No IO, no Next dependency; safe to consume standalone.
- **`@document-factory/mcp-server`** — MCP server exposing core operations as typed tools. Works with any MCP-capable agent (Claude Code, Cursor, Continue, OpenClaw, …).
- **Preview dual-mode** — picker lists both `workspace/results/*.mdx` and `workspace/results/*.html`; MDX goes through core, HTML is served as-is with `<base href="/workspace/results/">` injected so relative assets resolve.
- **Workspace static route** — `/workspace/<rel-path>` serves any file under `workspace/` with path-traversal protection, so documents can reference `../tokens/brand.css`, `../assets/*`, etc., identically to opening them from the filesystem.
- **Restart button** — kill the current agent process and spawn a fresh one without reconnecting the WebSocket or reloading the page. One click = new session.
- **Auto-resolving workspace path** — walks upward from cwd to find an existing `workspace/`, so `pnpm -F @document-factory/web dev` works regardless of which directory you launch from.
- **`df-web` bin** — `npx @document-factory/web` / `npm i -g @document-factory/web` launcher that registers the tsx loader and hands off to the custom server. (Not published to npm in 0.2.0 — clone-and-run only.)
- **Docker alternative** — `packages/web/Dockerfile` for users who want a sandboxed PTY instead of inheriting the host user's full capabilities.
- **monorepo scaffold** — pnpm workspaces + shared TypeScript config across the three packages.
- **screenshot** at `docs/screenshot.jpeg` referenced from the root README.

### Fixed

- **`posix_spawnp failed` on terminal connect.** `node-pty`'s prebuilt `spawn-helper` loses the execute bit under some install paths (notably pnpm). The server now chmods it at boot as a safety net.
- **Preview rendered unstyled HTML.** Relative `<link href="../tokens/*.css">` paths now resolve thanks to the injected `<base>` tag + `/workspace/*` static route.
- **Selector appeared unresponsive.** `listDocs()` now picks up both `.mdx` and `.html` outputs (previously MDX-only).
- **Terminal spawn errors crashed the process.** `onTerminalConnection` now surfaces errors to the client as a red banner and closes the socket cleanly instead of throwing `uncaughtException`.
- **Wrong workspace on pnpm launch.** Workspace resolution unified in `lib/workspace.ts` and propagated via env so Next routes + server share one path.

### Changed

- Root `README.md` rewritten to front the editor and document the methodology explicitly; existing screenshot added.
- Default port `3000` → `45367` to dodge the common dev-server crowd.
- `CONTRIBUTING.md` updated with the monorepo layout and expanded agent examples.
- Issue + PR templates refreshed.

## [0.1.0] — 2026-04-19

First private-preview scaffold.

### Added

- `instructions/` — 14 prompt files covering `00-read-first`, `factory-rules`, `component-conventions`, `template-conventions`, `brand-token-protocol`, `filename-convention`, `print-css-primer`, `pdf-export`, `writing-voice-guide`, `data-disclosure-guide`, plus doc-type specs for `one-pager`, `progress-note`, `case-study`, `cover-letter`
- `instructions/RESOLVER.md` — routing table agents read first to discover which instruction file applies to which user intent
- `starter-templates/` — 4 brand-agnostic HTML templates with `{{PLACEHOLDERS}}`; 8 block components (stat-row, signal-boxes, blockquote, two-col-list, data-table, caveats); generic header / footer; brand + print CSS tokens
- `recipes/` — prompt shortcuts for `setup-workspace`, `build-new-doc`, `add-new-template`, `add-new-component`
- `SETUP.md` — bootstrap prompt for coding agents, paste-URL-ready
- `workspace/` — gitignored except README stubs so directory structure ships self-documenting
- `.github/ISSUE_TEMPLATE/` — bug-report and feature-request forms
- `.github/workflows/validate.yml` — CI markdown linting + internal link validation
- `LICENSE` — MIT
- `CONTRIBUTING.md` — contribution stance, structure map, versioning convention
- `VERSION` — single-source-of-truth version file

[Unreleased]: https://github.com/mishanefedov/document-factory/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/mishanefedov/document-factory/releases/tag/v0.2.0
[0.1.0]: https://github.com/mishanefedov/document-factory/releases/tag/v0.1.0
