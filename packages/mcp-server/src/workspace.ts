/**
 * workspace.ts — safe filesystem access scoped to DF_WORKSPACE_DIR.
 *
 * All read/write operations go through helpers that refuse paths escaping
 * the workspace root. Prevents accidental exfiltration by a misbehaving agent.
 */

import { readFile, writeFile, readdir, mkdir, stat, unlink } from "node:fs/promises";
import { dirname, join, normalize, relative, resolve, sep } from "node:path";

export class WorkspaceError extends Error {
  constructor(
    public code: "E_WORKSPACE" | "E_PERMISSION" | "E_NOT_FOUND",
    message: string
  ) {
    super(message);
    this.name = "WorkspaceError";
  }
}

export class Workspace {
  readonly root: string;

  constructor(root?: string) {
    const envRoot = process.env.DF_WORKSPACE_DIR;
    const candidate = root ?? envRoot ?? join(process.cwd(), "workspace");
    this.root = resolve(candidate);
  }

  /** Resolve a workspace-relative path; throws if it escapes the root. */
  resolvePath(relPath: string): string {
    const abs = resolve(this.root, relPath);
    const rel = relative(this.root, abs);
    if (rel.startsWith("..") || rel.startsWith("/") || rel.includes(`..${sep}`)) {
      throw new WorkspaceError(
        "E_PERMISSION",
        `Path "${relPath}" escapes workspace root.`
      );
    }
    return abs;
  }

  async ensureInitialized(): Promise<void> {
    try {
      const s = await stat(this.root);
      if (!s.isDirectory()) {
        throw new WorkspaceError(
          "E_WORKSPACE",
          `Workspace root "${this.root}" is not a directory.`
        );
      }
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException)?.code === "ENOENT") {
        throw new WorkspaceError(
          "E_WORKSPACE",
          `Workspace directory "${this.root}" does not exist. Set DF_WORKSPACE_DIR or run setup.`
        );
      }
      throw err;
    }
  }

  async read(relPath: string): Promise<string> {
    const abs = this.resolvePath(relPath);
    try {
      return await readFile(abs, "utf-8");
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException)?.code === "ENOENT") {
        throw new WorkspaceError("E_NOT_FOUND", `File not found: ${relPath}`);
      }
      throw err;
    }
  }

  async readJson<T = unknown>(relPath: string): Promise<T> {
    const raw = await this.read(relPath);
    return JSON.parse(raw) as T;
  }

  async write(relPath: string, contents: string): Promise<void> {
    const abs = this.resolvePath(relPath);
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, contents, "utf-8");
  }

  async remove(relPath: string): Promise<void> {
    const abs = this.resolvePath(relPath);
    try {
      await unlink(abs);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException)?.code === "ENOENT") {
        throw new WorkspaceError("E_NOT_FOUND", `File not found: ${relPath}`);
      }
      throw err;
    }
  }

  async listFiles(relDir: string, extension?: string): Promise<string[]> {
    const abs = this.resolvePath(relDir);
    try {
      const entries = await readdir(abs, { withFileTypes: true });
      return entries
        .filter((e) => e.isFile())
        .filter((e) => !extension || e.name.endsWith(extension))
        .map((e) => normalize(join(relDir, e.name)));
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return [];
      throw err;
    }
  }

  async exists(relPath: string): Promise<boolean> {
    try {
      const abs = this.resolvePath(relPath);
      await stat(abs);
      return true;
    } catch {
      return false;
    }
  }
}
