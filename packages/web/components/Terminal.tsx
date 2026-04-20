"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type ForwardedRef,
} from "react";
import "@xterm/xterm/css/xterm.css";

interface PtyMessage {
  t: "data" | "exit" | "resize" | "restart";
  d?: string;
  code?: number;
  cols?: number;
  rows?: number;
}

export interface TerminalHandle {
  restart: () => void;
}

function TerminalInner(_props: Record<string, never>, ref: ForwardedRef<TerminalHandle>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bootedRef = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);

  useImperativeHandle(ref, () => ({
    restart: () => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ t: "restart" }));
      }
    },
  }));

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const [{ Terminal }, { FitAddon }] = await Promise.all([
        import("@xterm/xterm"),
        import("@xterm/addon-fit"),
      ]);

      if (disposed) return;
      const el = containerRef.current;
      if (!el) return;

      const term = new Terminal({
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, "Cascadia Mono", Consolas, monospace',
        fontSize: 13,
        theme: { background: "#0a0a0a", foreground: "#e5e5e5" },
        cursorBlink: true,
        scrollback: 5000,
      });
      const fit = new FitAddon();
      term.loadAddon(fit);
      term.open(el);
      fit.fit();

      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${proto}//${window.location.host}/terminal`);
      wsRef.current = ws;

      const sendResize = () => {
        try {
          fit.fit();
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({ t: "resize", cols: term.cols, rows: term.rows })
            );
          }
        } catch {
          // fit can throw if container is 0×0 during unmount
        }
      };

      ws.addEventListener("open", () => {
        sendResize();
      });
      ws.addEventListener("message", (ev) => {
        let msg: PtyMessage;
        try {
          msg = JSON.parse(String(ev.data));
        } catch {
          return;
        }
        if (msg.t === "data" && typeof msg.d === "string") term.write(msg.d);
        else if (msg.t === "restart") {
          term.reset();
          sendResize();
        } else if (msg.t === "exit") term.write(`\r\n[process exited ${msg.code ?? 0}]`);
      });
      ws.addEventListener("close", () => {
        term.write("\r\n[connection closed]\r\n");
      });

      term.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ t: "data", d: data }));
      });

      const ro = new ResizeObserver(() => sendResize());
      ro.observe(el);
      window.addEventListener("resize", sendResize);

      cleanup = () => {
        window.removeEventListener("resize", sendResize);
        ro.disconnect();
        try {
          ws.close();
        } catch {
          /* */
        }
        try {
          term.dispose();
        } catch {
          /* */
        }
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}

const Terminal = forwardRef<TerminalHandle>(TerminalInner);
export default Terminal;
