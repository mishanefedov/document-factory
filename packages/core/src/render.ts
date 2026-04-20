/**
 * render.ts — ResolvedDoc -> HTML.
 *
 * Assembles sections into a wrapped HTML document (or fragment). Collects
 * component CSS, dedupes, inlines.
 */

import type { RenderOpts, RenderedDoc, ResolvedDoc } from "./types.js";

export function render(resolved: ResolvedDoc, opts: RenderOpts = {}): RenderedDoc {
  const t0 = Date.now();
  const inlineCSS = opts.inlineCSS ?? true;
  const fullDocument = opts.fullDocument ?? true;

  const bodyParts: string[] = [];
  const cssBlocks = new Set<string>();

  for (const section of resolved.resolvedSections) {
    if (section.heading !== null) {
      const level = Math.max(1, Math.min(6, section.level || 1));
      bodyParts.push(`<h${level}>${escape(section.heading)}</h${level}>`);
    }
    if (section.bodyHtml) bodyParts.push(section.bodyHtml);
  }

  for (const c of Object.values(resolved.resolvedComponents)) {
    if (c.css) cssBlocks.add(c.css);
  }

  const componentCount = tallyComponents(resolved);
  const wordCount = countWords(bodyParts.join(" "));
  const body = bodyParts.join("\n");

  let html: string;
  if (fullDocument) {
    html = buildFullDocument(resolved, body, cssBlocks, inlineCSS);
  } else {
    html = inlineCSS && cssBlocks.size > 0
      ? `<style>${[...cssBlocks].join("\n")}</style>\n${body}`
      : body;
  }

  if (opts.stripComments) html = html.replace(/<!--[\s\S]*?-->/g, "");
  if (opts.minify) html = html.replace(/\s+/g, " ").trim();

  return {
    html,
    meta: {
      wordCount,
      sectionCount: resolved.resolvedSections.length,
      components: componentCount,
      renderMs: Date.now() - t0,
    },
  };
}

function buildFullDocument(
  resolved: ResolvedDoc,
  body: string,
  cssBlocks: Set<string>,
  inlineCSS: boolean
): string {
  const title =
    (resolved.spec.frontmatter.title as string | undefined) ||
    resolved.spec.sections.find((s) => s.heading)?.heading ||
    "Document";

  const brandCSS = buildBrandCss(resolved);
  const style =
    inlineCSS && (cssBlocks.size > 0 || brandCSS.length > 0)
      ? `<style>\n${brandCSS}\n${[...cssBlocks].join("\n")}\n</style>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escape(title)}</title>
${style}
</head>
<body>
<article class="df-doc df-${escapeAttr(resolved.spec.type)}">
${body}
</article>
</body>
</html>`;
}

function buildBrandCss(resolved: ResolvedDoc): string {
  const colors = Object.entries(resolved.brand.tokens.colors)
    .map(([k, v]) => `  --color-${cssIdent(k)}: ${v};`)
    .join("\n");
  const fonts = [
    resolved.brand.tokens.fonts.display && `  --font-display: ${resolved.brand.tokens.fonts.display};`,
    resolved.brand.tokens.fonts.body && `  --font-body: ${resolved.brand.tokens.fonts.body};`,
    resolved.brand.tokens.fonts.mono && `  --font-mono: ${resolved.brand.tokens.fonts.mono};`,
  ]
    .filter(Boolean)
    .join("\n");
  return `:root {\n${colors}\n${fonts}\n}`;
}

function cssIdent(s: string): string {
  return s.replace(/[^a-zA-Z0-9-]/g, "-");
}

function tallyComponents(resolved: ResolvedDoc): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const s of resolved.spec.sections) {
    for (const u of s.components) counts.set(u.name, (counts.get(u.name) || 0) + 1);
  }
  return [...counts.entries()].map(([name, count]) => ({ name, count }));
}

function countWords(s: string): number {
  const text = s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return 0;
  return text.split(" ").length;
}

function escape(s: string): string {
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
