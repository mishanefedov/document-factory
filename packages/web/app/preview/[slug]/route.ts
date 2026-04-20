import { NextResponse, type NextRequest } from "next/server";

import { renderDocument } from "../../../lib/render-doc";
import { WorkspaceError } from "../../../lib/workspace";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const html = await renderDocument(slug);
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const code = err instanceof WorkspaceError ? err.code : "E_INTERNAL";
    const message = err instanceof Error ? err.message : String(err);
    const body = `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem;color:#666">
<h1>Preview error</h1>
<p><strong>${code}:</strong> ${escapeHtml(message)}</p>
<p>Agent likely hasn't written this doc yet. Ask it to create <code>results/${escapeHtml(
      slug
    )}.mdx</code>.</p>
</body></html>`;
    const status = code === "E_NOT_FOUND" ? 404 : 500;
    return new NextResponse(body, {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
