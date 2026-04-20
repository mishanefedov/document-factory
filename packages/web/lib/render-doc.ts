/**
 * lib/render-doc.ts — read MDX + brand + components from the workspace and
 * render to HTML via @document-factory/core.
 */

import { build } from "@document-factory/core";
import type { Brand, ComponentRegistry } from "@document-factory/core";

import { readWorkspaceFile, workspaceExists, WorkspaceError } from "./workspace";

const DEFAULT_BRAND: Brand = {
  name: "Untitled",
  domain: "example.com",
  tokens: {
    colors: { primary: "#111111", secondary: "#666666" },
    fonts: { display: "system-ui", body: "system-ui" },
  },
};

export async function renderDocument(slug: string): Promise<string> {
  // Prefer MDX (source → rendered via core). Fall back to pre-rendered HTML
  // if the agent wrote a finished document directly.
  if (await workspaceExists(`results/${slug}.mdx`)) {
    const mdx = await readWorkspaceFile(`results/${slug}.mdx`);
    const brand = (await workspaceExists("brand.json"))
      ? (JSON.parse(await readWorkspaceFile("brand.json")) as Brand)
      : DEFAULT_BRAND;
    const components = (await workspaceExists("components/registry.json"))
      ? (JSON.parse(await readWorkspaceFile("components/registry.json")) as ComponentRegistry)
      : {};
    const { html } = build(mdx, brand, components);
    return injectReloadScript(injectBaseHref(html), slug);
  }
  if (await workspaceExists(`results/${slug}.html`)) {
    const html = await readWorkspaceFile(`results/${slug}.html`);
    return injectReloadScript(injectBaseHref(html), slug);
  }
  throw new WorkspaceError(
    "E_NOT_FOUND",
    `No document at results/${slug}.mdx or results/${slug}.html`
  );
}

// Inject <base href="/workspace/results/"> so documents in results/ can
// reference siblings (../tokens/brand.css, ../assets/logo.svg) the same way
// they do when opened directly from the filesystem. Goes as early in <head>
// as possible so subsequent <link>/<img>/<script> resolve against it.
function injectBaseHref(html: string): string {
  if (/<base\s/i.test(html)) return html; // doc already has a base tag
  const tag = `<base href="/workspace/results/">`;
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, (_m, attrs) => `<head${attrs}>\n${tag}`);
  }
  return tag + html;
}

function injectReloadScript(html: string, slug: string): string {
  const script = `<script>
(function() {
  try {
    var es = new EventSource('/api/sse/reload');
    es.addEventListener('reload', function(e) {
      try {
        var d = JSON.parse(e.data);
        if (d.slug === '${slug}' || d.slug === '*') location.reload();
      } catch (_) { location.reload(); }
    });
  } catch (_) { /* no SSE support */ }
})();
</script>`;
  if (html.includes("</head>")) return html.replace("</head>", `${script}\n</head>`);
  if (html.includes("</body>")) return html.replace("</body>", `${script}\n</body>`);
  return html + script;
}
