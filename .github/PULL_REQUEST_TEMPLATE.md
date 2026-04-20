<!--
Heads up: external PRs are not accepted during v0.x (see CONTRIBUTING.md).
This template exists for maintainers and for when v1.0 opens PRs publicly.
-->

## What changed

<!-- One or two sentences. What does this PR actually do? -->

## Why

<!-- The problem this solves, or the behavior it enables. Link issues/discussions. -->

## How to verify

- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes (if applicable)
- [ ] Manually loaded `http://localhost:45367` and confirmed the change end-to-end (if UI)
- [ ] `instructions/` / `recipes/` changes exercised with at least one agent

## Touches

- [ ] Prompt library (`instructions/`, `recipes/`) — bumps minor version if adding; major if renaming
- [ ] Starter templates / components
- [ ] `@document-factory/core`
- [ ] `@document-factory/web`
- [ ] `@document-factory/mcp-server`
- [ ] Docs / README / CHANGELOG only

## Breaking change

<!-- If yes, describe the migration path. If no, delete this section. -->
