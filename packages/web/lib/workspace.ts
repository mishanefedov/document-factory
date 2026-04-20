/**
 * lib/workspace.ts — filesystem helpers scoped to DF_WORKSPACE_DIR.
 *
 * Mirrors the safety model of @document-factory/mcp-server's Workspace class
 * so web routes can resolve paths safely.
 */

import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { dirname, join, resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

// Resolve once, cache. Explicit env wins; otherwise walk upward from both
// the caller's cwd and this file's location looking for an existing
// `workspace/` — so `pnpm -F @document-factory/web dev` (cwd=packages/web)
// still finds the repo-root workspace. Falls back to `$PWD/workspace`.
let cachedRoot: string | null = null;

export function workspaceRoot(): string {
  if (cachedRoot) return cachedRoot;
  cachedRoot = resolveWorkspaceRoot();
  return cachedRoot;
}

function resolveWorkspaceRoot(): string {
  if (process.env.DF_WORKSPACE_DIR) {
    return resolve(process.env.DF_WORKSPACE_DIR);
  }
  const here = dirname(fileURLToPath(import.meta.url));
  const seen = new Set<string>();
  for (const start of [process.cwd(), here]) {
    let dir = start;
    while (!seen.has(dir)) {
      seen.add(dir);
      const candidate = join(dir, "workspace");
      if (existsSync(candidate)) return candidate;
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  return resolve(process.cwd(), "workspace");
}

export class WorkspaceError extends Error {
  constructor(
    public code: "E_PERMISSION" | "E_NOT_FOUND",
    message: string
  ) {
    super(message);
    this.name = "WorkspaceError";
  }
}

export function safeJoin(relPath: string): string {
  const root = workspaceRoot();
  const abs = resolve(root, relPath);
  const rel = relative(root, abs);
  if (rel.startsWith("..") || rel.startsWith(sep) || rel.includes(`..${sep}`)) {
    throw new WorkspaceError("E_PERMISSION", `Path "${relPath}" escapes workspace root.`);
  }
  return abs;
}

export async function readWorkspaceFile(relPath: string): Promise<string> {
  const abs = safeJoin(relPath);
  try {
    return await readFile(abs, "utf-8");
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") {
      throw new WorkspaceError("E_NOT_FOUND", `File not found: ${relPath}`);
    }
    throw err;
  }
}

export async function workspaceExists(relPath: string): Promise<boolean> {
  try {
    const abs = safeJoin(relPath);
    await stat(abs);
    return true;
  } catch {
    return false;
  }
}
