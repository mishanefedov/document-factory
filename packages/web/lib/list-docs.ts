/**
 * lib/list-docs.ts — enumerate documents under workspace/results/.
 */

import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { workspaceRoot } from "./workspace";

export interface DocEntry {
  slug: string;
  path: string;
}

export async function listDocs(): Promise<DocEntry[]> {
  const root = workspaceRoot();
  const resultsDir = join(root, "results");
  try {
    const entries = await readdir(resultsDir, { withFileTypes: true });
    // Prefer .mdx when both extensions exist for the same slug (mdx is source,
    // html is a pre-rendered output — source wins).
    const bySlug = new Map<string, DocEntry>();
    for (const e of entries) {
      if (!e.isFile()) continue;
      const m = e.name.match(/^(.+)\.(mdx|html)$/);
      if (!m) continue;
      const [, slug, ext] = m as [string, string, "mdx" | "html"];
      const existing = bySlug.get(slug);
      if (existing && existing.path.endsWith(".mdx")) continue;
      bySlug.set(slug, { slug, path: `results/${e.name}` });
    }
    return [...bySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  } catch {
    return [];
  }
}
