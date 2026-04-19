# document-factory

![version](https://img.shields.io/badge/version-0.1.0-informational)
![license](https://img.shields.io/badge/license-MIT-blue)

Vibecode branded documents with an LLM agent. HTML in, PDF out (via Chrome's native print). The repo teaches the agent how to structure, style, and ship research publications, case studies, one-pagers, progress notes, and cover letters — while your brand, data, and content stay private in your own local `workspace/` folder.

## Who this is for

- You generate branded documents regularly (research reports, progress notes, case studies, one-pagers)
- You work with LLM coding agents (Claude Code, OpenClaw, Cursor, Codex, Aider, or similar) to draft them
- You want a reusable system where the framework is public but your brand + data stay private

## How it works

```
document-factory/
├── instructions/         — generic prompts that teach a coding agent how the system works (public)
├── starter-templates/    — HTML with {{PLACEHOLDERS}} the agent resolves at setup (public)
├── recipes/              — optional prompt shortcuts for common operations (public)
├── examples/             — public reference docs showing what good looks like (public)
└── workspace/            — your brand, components, templates, examples, output (private, gitignored)
```

The public part is the IP: the prompts. Your brand and data live in `workspace/`, which never leaves your machine unless you commit it elsewhere.

## Quickstart

1. Clone this repo somewhere local (`~/IdeaProjects/document-factory` works).
2. Read `SETUP.md`.
3. Open any LLM coding agent session in the repo root (Claude Code, OpenClaw, Cursor, Codex, etc.). Paste: *"Please read SETUP.md and scaffold my workspace."*
4. Answer the agent's questions about your brand (name, domain, colors, fonts, logo, audiences).
5. The agent scaffolds `workspace/` for you.
6. For each new doc: chat with the agent about what you need. The agent writes HTML to `workspace/results/` with an ISO-date filename.
7. Open the HTML in Chrome → Cmd+P → Save as PDF → ship.

## Philosophy

- **Coding agents compose HTML better than they template it.** Plain HTML + `{{slot markers}}` is easier for an agent than learning a templating engine.
- **No build step.** No bundler, no transpile, no React. Just files.
- **The IP is the prompts, not the templates.** Starter templates are generic HTML any company could use. The value is in `instructions/` and your own `workspace/conventions/`.
- **Your examples become the learning corpus.** Every shipped doc that goes into `workspace/examples/` teaches the agent what good looks like for your brand.

## Philosophy on tooling

Zero dependencies at install time. When you need a dependency (headless PDF automation, pagination preview, build pipeline), add it to your `workspace/` — don't pollute the public repo. Every user can choose their own tooling.

## License

MIT — see [LICENSE](LICENSE).

## Contributing

Not accepting PRs during v0.x. See [CONTRIBUTING.md](CONTRIBUTING.md) for the current stance. Issues and GitHub Discussions are open — questions, feature proposals, bug reports all welcome.

## Further reading

- [SETUP.md](SETUP.md) — bootstrap your workspace (paste-ready agent prompt at top)
- [instructions/RESOLVER.md](instructions/RESOLVER.md) — intent → instruction-file routing for agents
- [instructions/factory-rules.md](instructions/factory-rules.md) — full architecture overview
- [CHANGELOG.md](CHANGELOG.md) — release notes
