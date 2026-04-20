import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  readWorkspaceFile,
  safeJoin,
  workspaceExists,
  WorkspaceError,
} from "../lib/workspace";

describe("workspace helpers", () => {
  let root: string;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "df-web-"));
    process.env.DF_WORKSPACE_DIR = root;
  });

  afterEach(async () => {
    delete process.env.DF_WORKSPACE_DIR;
    await rm(root, { recursive: true, force: true });
  });

  it("safeJoin resolves within root", () => {
    const abs = safeJoin("results/foo.mdx");
    expect(abs.startsWith(root)).toBe(true);
  });

  it("safeJoin refuses path traversal", () => {
    expect(() => safeJoin("../../etc/passwd")).toThrowError(WorkspaceError);
  });

  it("readWorkspaceFile returns file contents", async () => {
    await mkdir(join(root, "results"), { recursive: true });
    await writeFile(join(root, "results", "test.mdx"), "hello", "utf-8");
    expect(await readWorkspaceFile("results/test.mdx")).toBe("hello");
  });

  it("readWorkspaceFile throws E_NOT_FOUND for missing files", async () => {
    await expect(readWorkspaceFile("nope.mdx")).rejects.toBeInstanceOf(WorkspaceError);
  });

  it("workspaceExists reports presence", async () => {
    expect(await workspaceExists("missing.txt")).toBe(false);
    await writeFile(join(root, "present.txt"), "", "utf-8");
    expect(await workspaceExists("present.txt")).toBe(true);
  });
});
