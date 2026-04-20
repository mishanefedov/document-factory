/**
 * lib/workspace.ts — filesystem helpers scoped to DF_WORKSPACE_DIR.
 *
 * Mirrors the safety model of @document-factory/mcp-server's Workspace class
 * so web routes can resolve paths safely.
 */

import { readFile, stat } from "node:fs/promises";
import { resolve, relative, sep } from "node:path";

const DEFAULT_ROOT = resolve(process.cwd(), "workspace");

export function workspaceRoot(): string {
  return resolve(process.env.DF_WORKSPACE_DIR ?? DEFAULT_ROOT);
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
