# `@document-factory/core` — API sketch

Stateless TypeScript library. Parses a document spec, resolves brand tokens, renders to HTML, validates against a doc-type schema. No filesystem access — pure functions on strings and objects. The caller (CLI, MCP server, web editor) handles I/O.

## Why stateless

- Easy to test (no fixtures, no mocks).
- Trivial to run in any environment (browser, Node, edge function, worker).
- The MCP server and web editor and CLI all share exactly the same render path. No drift.

## Document schema

Source format: **MDX** (Markdown + JSX components). Rendered target: HTML string.

Example source:

```mdx
---
type: case-study
client: Acme Industries
outcome: "+32% conversion"
date: 2026-04-20
authors: [you@example.com]
---

# How Acme doubled pipeline quality

<StatRow>
  <Stat value="32%" label="lift in qualified leads" />
  <Stat value="4 wk" label="time to first signal" />
  <Stat value="3×" label="sales-cycle compression" />
</StatRow>

## Context

Acme was flying blind on supplier sentiment...
```

Frontmatter constraints are per-doc-type (a `case-study` requires `client` + `outcome`, a `one-pager` requires a `headline`, etc.). Constraints live in `doc-types/<type>.schema.json`.

## Public API

```ts
import type { Brand, DocSpec, RenderedDoc, ValidationResult } from '@document-factory/core'

// 1. Parse MDX source into a structured DocSpec.
export function parse(mdxSource: string): DocSpec

// 2. Validate a DocSpec against its doc-type schema.
export function validate(spec: DocSpec, schemaPath?: string): ValidationResult

// 3. Resolve {{tokens}} and <Component> references against a brand + component registry.
export function resolve(spec: DocSpec, brand: Brand, components: ComponentRegistry): ResolvedDoc

// 4. Render a ResolvedDoc to an HTML string.
export function render(resolved: ResolvedDoc, opts?: RenderOpts): RenderedDoc

// 5. Convenience: end-to-end.
export function build(mdxSource: string, brand: Brand, components: ComponentRegistry): RenderedDoc
```

### Types

```ts
export interface DocSpec {
  type: string                      // e.g. 'case-study'
  frontmatter: Record<string, unknown>
  sections: Section[]               // parsed MDX AST, section-granular
  raw: string                       // original MDX for round-tripping
}

export interface Section {
  id: string                        // stable, slug-based
  heading: string | null
  level: number                     // h1..h6
  children: (Node | ComponentNode)[]
}

export interface ComponentNode {
  kind: 'component'
  name: string                      // e.g. 'StatRow'
  props: Record<string, unknown>
  children: ComponentNode[] | null
}

export interface Brand {
  name: string
  domain: string
  tokens: {
    colors: Record<string, string>
    fonts: { display: string; body: string; mono?: string }
    logo: { svg?: string; png?: string }
    spacing?: Record<string, string>
  }
  voice?: { tone: string; avoid: string[]; prefer: string[] }
}

export interface ComponentRegistry {
  [name: string]: ComponentDefinition
}

export interface ComponentDefinition {
  html: string                      // template with {{props.X}} slots
  css?: string                      // scoped CSS
  propSchema: JSONSchema
}

export interface ValidationResult {
  ok: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface RenderOpts {
  inlineCSS?: boolean               // default true for print fidelity
  stripComments?: boolean
  minify?: boolean
  embedFonts?: boolean              // base64-inline font files
}

export interface RenderedDoc {
  html: string
  meta: {
    wordCount: number
    sections: number
    components: { name: string; count: number }[]
    renderMs: number
  }
}
```

## Key design decisions

### D1 — AST, not strings

`parse` returns a structured `DocSpec` with section and component nodes. Agents operate on nodes (insert a `<StatRow>` at section X). Never string-manipulate the MDX directly — that's fragile and loses the ability to validate.

### D2 — Components are HTML + CSS + JSON schema

No React, no JSX runtime, no Vue. Components are declarative `{ html, css, propSchema }`. The render step substitutes `{{props.X}}` in the HTML string. This keeps rendering fast (no compile), portable (works in edge functions), and teachable (a contributor with basic HTML can write a new component).

### D3 — Token resolution is a separate step from rendering

`resolve(spec, brand, components)` produces a `ResolvedDoc` where every `{{color.primary}}` and `<BrandLogo />` has been expanded. `render` then only does MDX→HTML. Split because: (a) token resolution is the part users customize per brand, (b) render output is cacheable by hash of resolved input.

### D4 — Validation is optional but standard

`validate` is strictly a dev-time / agent-time check. The render path doesn't enforce it, because partially-valid docs are useful for preview ("agent is mid-edit"). Agents call `validate` before `render` at finalize-time.

### D5 — No filesystem, no network, no OS calls

Everything is pure: `string → string`. Caller loads the MDX file, the brand JSON, the component registry from wherever (filesystem, S3, memory, URL), passes them in. Makes the library trivial to run in a worker, an edge function, a browser, or a unit test.

## Plugin points

- **Custom components**: pass them in via `ComponentRegistry`. No need to fork the lib.
- **Custom doc types**: add a `doc-types/<name>.schema.json` in the workspace; `validate` picks it up automatically.
- **Custom MDX extensions**: advanced users can inject a remark plugin via `parse(source, { remarkPlugins: [...] })`.

## Non-goals

- React/Vue/Svelte runtime. The output is HTML; bring your own framework if you want to embed the render.
- A live editor API. Use the web editor for that.
- Scheduling / background jobs. Caller's problem.
- Multi-document linking. Documents are self-contained; cross-doc references resolve at the workspace layer (via filesystem).

## Open questions

- **OQ1** — Should `parse` preserve MDX comments / HTML comments? Leaning yes (useful for inline notes).
- **OQ2** — How do we version component schemas across workspaces? Leaning: every component has a `version` in its definition; `resolve` warns on major-version mismatch.
- **OQ3** — Where does brand-token inheritance live? If a team wants a "parent brand + personal overrides" model, does that happen in core or a higher layer? Leaning: higher layer; core takes one flat `Brand` object.

## Tests

- Unit: every public function.
- Property-based: `render(parse(x)) ≡ render(parse(render(parse(x))))` — idempotence.
- Snapshot: starter-templates render to stable HTML across versions.
- Benchmark: `build` of a 20-page case-study should complete in < 100ms on an M-series laptop.
