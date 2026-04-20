import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { Workspace, WorkspaceError } from "../src/workspace.js";

describe("Workspace", () => {
  let root: string;
  let ws: Workspace;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "df-ws-"));
    ws = new Workspace(root);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("writes and reads files", async () => {
    await ws.write("hello.txt", "world");
    const read = await ws.read("hello.txt");
    expect(read).toBe("world");
  });

  it("creates directories on write", async () => {
    await ws.write("nested/deep/file.txt", "ok");
    const read = await ws.read("nested/deep/file.txt");
    expect(read).toBe("ok");
  });

  it("refuses paths escaping the workspace root", () => {
    expect(() => ws.resolvePath("../escape.txt")).toThrowError(WorkspaceError);
  });

  it("throws E_NOT_FOUND on missing files", async () => {
    await expect(ws.read("does-not-exist.txt")).rejects.toBeInstanceOf(WorkspaceError);
  });

  it("listFiles filters by extension", async () => {
    await ws.write("a.mdx", "");
    await ws.write("b.md", "");
    await ws.write("c.mdx", "");
    const mdx = await ws.listFiles(".", ".mdx");
    expect(mdx.sort()).toEqual(["a.mdx", "c.mdx"]);
  });

  it("exists returns true/false", async () => {
    expect(await ws.exists("nope.txt")).toBe(false);
    await ws.write("yes.txt", "");
    expect(await ws.exists("yes.txt")).toBe(true);
  });
});
