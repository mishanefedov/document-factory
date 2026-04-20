/**
 * resolve.ts — DocSpec + Brand + ComponentRegistry -> ResolvedDoc.
 *
 * Substitutes {{token}} references inside component HTML templates (not in
 * prose — prose uses components, see parse.ts). Renders each section body to
 * HTML. HTML nodes that look like PascalCase components get replaced with the
 * resolved component HTML in a second pass.
 */

import { fromMarkdown } from "mdast-util-from-markdown";
import type { Root, Nodes, Html } from "mdast";

import type {
  Brand,
  ComponentRegistry,
  ComponentUsage,
  DocSpec,
  ResolvedDoc,
  Section,
} from "./types.js";

import { parseComponentHtml } from "./parse.js";

export function resolve(
  spec: DocSpec,
  brand: Brand,
  components: ComponentRegistry
): ResolvedDoc {
  const resolvedComponents: ResolvedDoc["resolvedComponents"] = {};

  for (const section of spec.sections) {
    for (const usage of section.components) {
      resolvedComponents[usage.id] = renderComponent(usage, components, brand);
    }
  }

  const resolvedSections = spec.sections.map((s) => ({
    id: s.id,
    heading: s.heading,
    level: s.level,
    bodyHtml: sectionToHtml(s, resolvedComponents),
  }));

  return { spec, brand, resolvedComponents, resolvedSections };
}

function renderComponent(
  usage: ComponentUsage,
  registry: ComponentRegistry,
  brand: Brand
): { html: string; css?: string } {
  const def = registry[usage.name];
  if (!def) {
    return { html: `<!-- unknown component: ${usage.name} -->` };
  }
  const html = interpolate(def.html, {
    ...usage.props,
    ...flatBrand(brand),
  });
  return {
    html,
    css: def.css,
  };
}

function sectionToHtml(
  section: Section,
  resolvedComponents: ResolvedDoc["resolvedComponents"]
): string {
  if (!section.body) return "";
  const tree: Root = fromMarkdown(section.body);

  // Build component lookup keyed by (name, ordinal) matching the order in
  // which `extractComponents` produced usages for this section.
  const usagesByName = new Map<string, ComponentUsage[]>();
  for (const u of section.components) {
    const list = usagesByName.get(u.name) ?? [];
    list.push(u);
    usagesByName.set(u.name, list);
  }
  const cursors = new Map<string, number>();

  const out: string[] = [];
  for (const child of tree.children) out.push(nodeToHtml(child, resolvedComponents, usagesByName, cursors));
  return out.join("\n");
}

function nodeToHtml(
  node: Nodes,
  resolvedComponents: ResolvedDoc["resolvedComponents"],
  usagesByName: Map<string, ComponentUsage[]>,
  cursors: Map<string, number>
): string {
  switch (node.type) {
    case "paragraph": {
      const inner = node.children
        .map((c) => nodeToHtml(c as Nodes, resolvedComponents, usagesByName, cursors))
        .join("");
      return `<p>${inner}</p>`;
    }
    case "heading": {
      const depth = (node as { depth?: number }).depth ?? 1;
      const inner = node.children
        .map((c) => nodeToHtml(c as Nodes, resolvedComponents, usagesByName, cursors))
        .join("");
      return `<h${depth}>${inner}</h${depth}>`;
    }
    case "text":
      return escapeHtml((node as { value: string }).value);
    case "strong":
      return `<strong>${node.children
        .map((c) => nodeToHtml(c as Nodes, resolvedComponents, usagesByName, cursors))
        .join("")}</strong>`;
    case "emphasis":
      return `<em>${node.children
        .map((c) => nodeToHtml(c as Nodes, resolvedComponents, usagesByName, cursors))
        .join("")}</em>`;
    case "inlineCode":
      return `<code>${escapeHtml((node as { value: string }).value)}</code>`;
    case "code":
      return `<pre><code>${escapeHtml((node as { value: string }).value)}</code></pre>`;
    case "list": {
      const tag = (node as { ordered?: boolean }).ordered ? "ol" : "ul";
      const items = node.children
        .map((c) => nodeToHtml(c as Nodes, resolvedComponents, usagesByName, cursors))
        .join("");
      return `<${tag}>${items}</${tag}>`;
    }
    case "listItem": {
      const inner = node.children
        .map((c) => nodeToHtml(c as Nodes, resolvedComponents, usagesByName, cursors))
        .join("");
      return `<li>${inner}</li>`;
    }
    case "link": {
      const url = (node as { url: string }).url;
      const inner = node.children
        .map((c) => nodeToHtml(c as Nodes, resolvedComponents, usagesByName, cursors))
        .join("");
      return `<a href="${escapeAttr(url)}">${inner}</a>`;
    }
    case "image": {
      const n = node as { url: string; alt?: string | null };
      return `<img src="${escapeAttr(n.url)}" alt="${escapeAttr(n.alt ?? "")}" />`;
    }
    case "blockquote": {
      const inner = node.children
        .map((c) => nodeToHtml(c as Nodes, resolvedComponents, usagesByName, cursors))
        .join("");
      return `<blockquote>${inner}</blockquote>`;
    }
    case "thematicBreak":
      return "<hr />";
    case "break":
      return "<br />";
    case "html": {
      const h = node as Html;
      const maybeComponent = parseComponentHtml(h.value);
      if (!maybeComponent) return h.value;
      const usages = usagesByName.get(maybeComponent.name) ?? [];
      const idx = cursors.get(maybeComponent.name) ?? 0;
      const usage = usages[idx];
      cursors.set(maybeComponent.name, idx + 1);
      if (!usage) return `<!-- unresolved component: ${maybeComponent.name} -->`;
      return resolvedComponents[usage.id]?.html
        ?? `<!-- unresolved component: ${maybeComponent.name} -->`;
    }
    default:
      return "";
  }
}

function flatBrand(brand: Brand): Record<string, string | number> {
  const out: Record<string, string | number> = {
    "brand.name": brand.name,
    "brand.domain": brand.domain,
  };
  for (const [k, v] of Object.entries(brand.tokens.colors)) out[`color.${k}`] = v;
  if (brand.tokens.fonts.display) out["font.display"] = brand.tokens.fonts.display;
  if (brand.tokens.fonts.body) out["font.body"] = brand.tokens.fonts.body;
  if (brand.tokens.fonts.mono) out["font.mono"] = brand.tokens.fonts.mono;
  for (const [k, v] of Object.entries(brand.tokens.spacing ?? {})) out[`spacing.${k}`] = v;
  return out;
}

function interpolate(tpl: string, ctx: Record<string, unknown>): string {
  return tpl.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key: string) => {
    const val = ctx[key];
    if (val === undefined || val === null) return `{{${key}}}`;
    return String(val);
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;");
}
