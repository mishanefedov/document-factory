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
    return entries
      .filter((e) => e.isFile() && e.name.endsWith(".mdx"))
      .map((e) => ({ slug: e.name.replace(/\.mdx$/, ""), path: `results/${e.name}` }));
  } catch {
    return [];
  }
}
