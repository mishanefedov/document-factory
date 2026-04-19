# Changelog

All notable changes to `document-factory` are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/mishanefedov/document-factory/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/mishanefedov/document-factory/releases/tag/v0.1.0
