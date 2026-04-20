/**
 * lib/render-doc.ts — read MDX + brand + components from the workspace and
 * render to HTML via @document-factory/core.
 */

import { build } from "@document-factory/core";
import type { Brand, ComponentRegistry } from "@document-factory/core";

import { readWorkspaceFile, workspaceExists } from "./workspace";

const DEFAULT_BRAND: Brand = {
  name: "Untitled",
  domain: "example.com",
  tokens: {
    colors: { primary: "#111111", secondary: "#666666" },
    fonts: { display: "system-ui", body: "system-ui" },
  },
};

export async function renderDocument(slug: string): Promise<string> {
  const mdx = await readWorkspaceFile(`results/${slug}.mdx`);
  const brand = (await workspaceExists("brand.json"))
    ? (JSON.parse(await readWorkspaceFile("brand.json")) as Brand)
    : DEFAULT_BRAND;
  const components = (await workspaceExists("components/registry.json"))
    ? (JSON.parse(await readWorkspaceFile("components/registry.json")) as ComponentRegistry)
    : {};
  const { html } = build(mdx, brand, components);
  // Inject the SSE listener so the iframe reloads on file change.
  return injectReloadScript(html, slug);
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
