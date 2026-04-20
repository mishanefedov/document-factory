/**
 * GET /workspace/<rel-path> — serve a file from the workspace root so docs
 * in results/ can reference siblings (../tokens/brand.css, ../assets/logo.svg)
 * via a <base> tag injected by render-doc.ts.
 *
 * Path-traversal is blocked via safeJoin().
 */

import { readFile, stat } from "node:fs/promises";
import { extname } from "node:path";

import { NextResponse, type NextRequest } from "next/server";

import { safeJoin, WorkspaceError } from "../../../lib/workspace";

export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".html": "text/html; charset=utf-8",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const rel = path.join("/");
  try {
    const abs = safeJoin(rel);
    const st = await stat(abs);
    if (!st.isFile()) {
      return new NextResponse("Not a file", { status: 404 });
    }
    const buf = await readFile(abs);
    const contentType = MIME[extname(abs).toLowerCase()] ?? "application/octet-stream";
    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof WorkspaceError && err.code === "E_PERMISSION") {
      return new NextResponse("Forbidden", { status: 403 });
    }
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || code === "ENOTDIR") {
      return new NextResponse("Not found", { status: 404 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
