"use client";

import { useEffect, useRef, useState } from "react";

export default function Preview({ slug }: { slug: string }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [bust, setBust] = useState(0);

  useEffect(() => {
    // Top-level SSE listener (iframe also has its own injected one, but this
    // provides redundancy if the iframe document fails to load the script).
    const es = new EventSource("/api/sse/reload");
    const handler = (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data) as { slug: string };
        if (d.slug === slug || d.slug === "*") setBust((n) => n + 1);
      } catch {
        setBust((n) => n + 1);
      }
    };
    es.addEventListener("reload", handler as EventListener);
    return () => {
      es.removeEventListener("reload", handler as EventListener);
      es.close();
    };
  }, [slug]);

  return (
    <iframe
      ref={iframeRef}
      key={`${slug}-${bust}`}
      src={`/preview/${encodeURIComponent(slug)}`}
      className="preview-iframe"
      sandbox="allow-scripts allow-same-origin allow-popups"
      title={`preview: ${slug}`}
    />
  );
}
