/**
 * parse.ts — MDX source -> DocSpec.
 *
 * v0.2 Phase 1 uses a deliberately restricted MDX subset:
 * - Standard CommonMark for prose, lists, code, links, headings
 * - Components as self-closing HTML-attribute syntax only: <PascalCase attr="value" />
 *   (No JSX braces. No {expression}. No children-as-JSX. Full MDX comes later.)
 *
 * This avoids the JSX expression parser entirely and keeps v0.2 simple.
 */

import matter from "gray-matter";
import { fromMarkdown } from "mdast-util-from-markdown";
import { visit } from "unist-util-visit";
import type { Root, Heading, Nodes, Html } from "mdast";
import { createHash } from "node:crypto";

import type { DocSpec, Section, ComponentUsage } from "./types.js";

const COMPONENT_TAG_RE =
  /^<([A-Z][a-zA-Z0-9]*)((?:\s+[a-zA-Z_$][a-zA-Z0-9_$-]*(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)\s*(\/?)>\s*(?:<\/\1>)?\s*$/;
const ATTR_RE = /([a-zA-Z_$][a-zA-Z0-9_$-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g;

export function parse(source: string): DocSpec {
  const { data: frontmatter, content } = matter(source);

  if (typeof frontmatter.type !== "string" || frontmatter.type.length === 0) {
    throw new Error(
      "Document frontmatter must include a 'type' field (e.g. type: case-study)."
    );
  }

  const tree: Root = fromMarkdown(content);
  const sections = splitIntoSections(tree, content);

  return {
    type: frontmatter.type,
    frontmatter,
    sections,
    raw: source,
  };
}

function splitIntoSections(tree: Root, source: string): Section[] {
  const sections: Section[] = [];
  let current: { heading: string | null; level: number; nodes: Nodes[] } = {
    heading: null,
    level: 0,
    nodes: [],
  };
  let sectionIndex = 0;

  const flush = () => {
    if (current.nodes.length === 0 && current.heading === null) return;
    const body = sliceSource(source, current.nodes);
    const id = slug(current.heading, sectionIndex++);
    sections.push({
      id,
      heading: current.heading,
      level: current.level,
      body,
      components: extractComponents(current.nodes, id),
    });
  };

  for (const node of tree.children) {
    if (node.type === "heading") {
      flush();
      current = {
        heading: headingText(node),
        level: (node as Heading).depth,
        nodes: [],
      };
    } else {
      current.nodes.push(node);
    }
  }
  flush();

  return sections;
}

function headingText(h: Heading): string {
  let out = "";
  for (const child of h.children) {
    if ("value" in child && typeof child.value === "string") out += child.value;
  }
  return out.trim();
}

function slug(heading: string | null, index: number): string {
  if (!heading) return `section-${index}`;
  const base = heading
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base.length > 0 ? `${base}-${index}` : `section-${index}`;
}

function sliceSource(source: string, nodes: Nodes[]): string {
  if (nodes.length === 0) return "";
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  const start = first?.position?.start.offset;
  const end = last?.position?.end.offset;
  if (start === undefined || end === undefined) return "";
  return source.slice(start, end);
}

function extractComponents(nodes: Nodes[], sectionId: string): ComponentUsage[] {
  const out: ComponentUsage[] = [];
  let index = 0;
  for (const node of nodes) {
    visit(node as Root, "html", (n: Html) => {
      const usage = parseComponentHtml(n.value);
      if (!usage) return;
      const id = componentId(sectionId, index, usage.name, usage.props);
      out.push({ id, name: usage.name, props: usage.props, raw: n.value });
      index++;
    });
  }
  return out;
}

/**
 * Parse an HTML node's text as a component tag. Returns null if it's a
 * lowercase/regular HTML tag or unrecognized.
 */
export function parseComponentHtml(
  raw: string
): { name: string; props: Record<string, string | number | boolean> } | null {
  const trimmed = raw.trim();
  const m = trimmed.match(COMPONENT_TAG_RE);
  if (!m || !m[1]) return null;
  const name = m[1];
  const attrBlob = m[2] ?? "";
  const props: Record<string, string | number | boolean> = {};
  ATTR_RE.lastIndex = 0;
  let am: RegExpExecArray | null;
  while ((am = ATTR_RE.exec(attrBlob)) !== null) {
    const key = am[1]!;
    const raw = am[2] ?? am[3];
    if (raw === undefined) {
      props[key] = true;
      continue;
    }
    props[key] = coerce(raw);
  }
  return { name, props };
}

function coerce(raw: string): string | number | boolean {
  if (raw === "true") return true;
  if (raw === "false") return false;
  const n = Number(raw);
  if (raw.trim().length > 0 && !Number.isNaN(n) && Number.isFinite(n)) return n;
  return raw;
}

function componentId(
  sectionId: string,
  index: number,
  name: string,
  props: Record<string, unknown>
): string {
  const key = `${sectionId}|${index}|${name}|${JSON.stringify(props)}`;
  return createHash("sha1").update(key).digest("hex").slice(0, 10);
}
