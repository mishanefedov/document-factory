import { describe, expect, it } from "vitest";
import { build, parse, resolve, render, validate } from "../src/index.js";
import type { Brand, ComponentRegistry, DocTypeSchema } from "../src/index.js";

const brand: Brand = {
  name: "Acme, Inc.",
  domain: "acme.example",
  tokens: {
    colors: { primary: "#123456", secondary: "#abcdef" },
    fonts: { display: "Inter", body: "Source Sans 3" },
  },
};

const components: ComponentRegistry = {
  StatRow: {
    html: `<div class="stat-row" data-value="{{value}}"><strong>{{value}}</strong> <span>{{label}}</span></div>`,
    css: `.stat-row{display:flex;gap:.5rem;}`,
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

const caseStudySchema: DocTypeSchema = {
  id: "case-study",
  label: "Case study",
  requiredFrontmatter: ["client", "outcome"],
  recommendedSections: ["Context", "Outcome"],
};

const mdxSource = `---
type: case-study
client: Acme
outcome: "+32% lift"
title: How Acme doubled pipeline quality
---

# Headline

The engagement delivered strong results.

## Metrics

<StatRow value="32%" label="lift in qualified leads" />

## Context

Acme was flying blind on supplier sentiment.

## Outcome

Net-new pipeline up 32%.
`;

describe("parse", () => {
  it("extracts frontmatter type", () => {
    const spec = parse(mdxSource);
    expect(spec.type).toBe("case-study");
    expect(spec.frontmatter.client).toBe("Acme");
  });

  it("splits sections by heading", () => {
    const spec = parse(mdxSource);
    const headings = spec.sections.map((s) => s.heading);
    expect(headings).toContain("Headline");
    expect(headings).toContain("Metrics");
    expect(headings).toContain("Context");
    expect(headings).toContain("Outcome");
  });

  it("extracts component usages", () => {
    const spec = parse(mdxSource);
    const all = spec.sections.flatMap((s) => s.components);
    const stat = all.find((c) => c.name === "StatRow");
    expect(stat).toBeDefined();
    expect(stat?.props.value).toBe("32%");
    expect(stat?.props.label).toBe("lift in qualified leads");
  });

  it("throws on missing type", () => {
    expect(() => parse(`# no frontmatter\n`)).toThrow(/type/);
  });
});

describe("validate", () => {
  it("passes for a valid doc", () => {
    const spec = parse(mdxSource);
    const r = validate(spec, { docTypeSchema: caseStudySchema, components });
    expect(r.ok).toBe(true);
    expect(r.errors).toEqual([]);
  });

  it("errors on missing required frontmatter", () => {
    const bad = mdxSource.replace("client: Acme\n", "");
    const spec = parse(bad);
    const r = validate(spec, { docTypeSchema: caseStudySchema });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.code === "MISSING_FRONTMATTER")).toBe(true);
  });

  it("errors on unknown component", () => {
    const bad = mdxSource.replace(
      "<StatRow value=\"32%\" label=\"lift in qualified leads\" />",
      '<Mystery foo="bar" />'
    );
    const spec = parse(bad);
    const r = validate(spec, { components });
    expect(r.errors.some((e) => e.code === "UNKNOWN_COMPONENT")).toBe(true);
  });

  it("warns on missing recommended section", () => {
    const minimal = `---
type: case-study
client: Acme
outcome: yes
---
# just a heading
body.
`;
    const spec = parse(minimal);
    const r = validate(spec, { docTypeSchema: caseStudySchema });
    expect(r.warnings.some((w) => w.code === "MISSING_RECOMMENDED_SECTION")).toBe(true);
  });
});

describe("resolve", () => {
  it("resolves component html with props + brand", () => {
    const spec = parse(mdxSource);
    const r = resolve(spec, brand, components);
    const resolvedHtml = Object.values(r.resolvedComponents)
      .map((c) => c.html)
      .join("");
    expect(resolvedHtml).toContain("32%");
    expect(resolvedHtml).toContain("lift in qualified leads");
  });
});

describe("render", () => {
  it("produces a full HTML document", () => {
    const rendered = build(mdxSource, brand, components);
    expect(rendered.html).toContain("<!DOCTYPE html>");
    expect(rendered.html).toContain("<title>How Acme doubled pipeline quality</title>");
    expect(rendered.html).toContain("<article");
  });

  it("includes CSS variables from brand tokens", () => {
    const rendered = build(mdxSource, brand, components);
    expect(rendered.html).toContain("--color-primary: #123456");
    expect(rendered.html).toContain("--font-display: Inter");
  });

  it("returns metadata", () => {
    const rendered = build(mdxSource, brand, components);
    expect(rendered.meta.wordCount).toBeGreaterThan(0);
    expect(rendered.meta.sectionCount).toBeGreaterThan(0);
    expect(rendered.meta.renderMs).toBeGreaterThanOrEqual(0);
  });
});
