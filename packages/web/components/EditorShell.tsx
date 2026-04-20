"use client";

import { useEffect, useState } from "react";

import Terminal from "./Terminal";
import Preview from "./Preview";

export interface DocEntry {
  slug: string;
  path: string;
}

export default function EditorShell({ initialDocs }: { initialDocs: DocEntry[] }) {
  const [docs, setDocs] = useState<DocEntry[]>(initialDocs);
  const [activeSlug, setActiveSlug] = useState<string | null>(
    initialDocs[0]?.slug ?? null
  );

  // Refresh the document list when any reload event fires. Agents creating
  // new docs should show up automatically in the dropdown.
  useEffect(() => {
    const refresh = async () => {
      try {
        const r = await fetch("/api/docs");
        const { docs: next } = (await r.json()) as { docs: DocEntry[] };
        setDocs(next);
        if (!activeSlug && next[0]) setActiveSlug(next[0].slug);
      } catch {
        // silent — a failed refresh doesn't break the UI
      }
    };
    const es = new EventSource("/api/sse/reload");
    es.addEventListener("reload", () => void refresh());
    return () => es.close();
  }, [activeSlug]);

  return (
    <div id="app">
      <section className="pane">
        <header className="pane-header">
          <span>Terminal</span>
          <span style={{ color: "#444" }}>{getAgentLabel()}</span>
        </header>
        <div className="pane-body terminal-body">
          <Terminal />
        </div>
      </section>
      <section className="pane">
        <header className="pane-header">
          <span>Preview</span>
          <select
            value={activeSlug ?? ""}
            onChange={(e) => setActiveSlug(e.target.value || null)}
            disabled={docs.length === 0}
          >
            {docs.length === 0 ? (
              <option value="">(no documents yet)</option>
            ) : (
              docs.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.slug}
                </option>
              ))
            )}
          </select>
          <button
            type="button"
            onClick={() => {
              if (!activeSlug) return;
              window.open(`/preview/${activeSlug}`, "_blank", "noopener,noreferrer");
            }}
            disabled={!activeSlug}
          >
            Open · Print → PDF
          </button>
        </header>
        <div className="pane-body">
          {activeSlug ? (
            <Preview slug={activeSlug} />
          ) : (
            <div className="empty-state">
              No documents yet. Ask your agent in the terminal to create one.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function getAgentLabel(): string {
  // Best-effort read from a cookie/localStorage-free source. The server sets
  // DF_AGENT_CMD; surfacing it client-side would need an API call — skipped
  // for v0.2. This label is static until we add GET /api/info.
  return "DF_AGENT_CMD";
}
