# @document-factory/core

Stateless library. Parse MDX → resolve brand tokens → render HTML. Zero I/O. Pure functions on strings and objects.

Used by `@document-factory/mcp-server`, the CLI, and the web editor. All three rely on identical render behaviour because they all call the same `build()`.

## Status

v0.2.0-dev — Phase 1. API surface stable for the happy path. See [`API.md`](./API.md) for the full spec.

## Install

```
pnpm add @document-factory/core
```

## Quick example

```ts
import { build } from "@document-factory/core";

const brand = {
  name: "Acme",
  domain: "acme.example",
  tokens: {
    colors: { primary: "#111" },
    fonts: { display: "Inter", body: "Source Sans 3" },
  },
};

const components = {
  StatRow: {
    html: `<div class="stat-row"><strong>{{value}}</strong> {{label}}</div>`,
    propSchema: {
      type: "object",
      required: ["value", "label"],
      properties: {
        value: { type: "string" },
        label: { type: "string" },
      },
    },
  },
};

const mdx = `---
type: case-study
title: Example
client: Acme
outcome: "+32% lift"
---

# Example

<StatRow value="32%" label="lift in qualified leads" />
`;

const { html, meta } = build(mdx, brand, components);
```

## What this package is not

- A React/Vue runtime. Output is HTML. Bring your own framework if you want to embed the render.
- An MDX evaluator. We parse MDX JSX for component extraction; we do not execute JSX.
- A filesystem library. Callers handle all I/O.

## Tests

```
pnpm -F @document-factory/core test
```

## See also

- [`API.md`](./API.md) — full type + function reference
- [`../../ROADMAP.md`](../../ROADMAP.md) — phased delivery plan
