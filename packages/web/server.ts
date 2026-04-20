/**
 * server.ts — Next.js custom server with WebSocket + SSE integration.
 *
 * Runs the Next app AND hosts two realtime services on the same port:
 *   - WebSocket at /terminal  -> node-pty bridge (xterm.js <-> shell)
 *   - Server-Sent Events at /api/sse/reload -> preview iframe reloads
 *
 * Listens on PORT (default 45367). Workspace resolved from DF_WORKSPACE_DIR.
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { parse } from "node:url";
import next from "next";
import { WebSocketServer, type WebSocket } from "ws";
import { spawn, type IPty } from "node-pty";
import chokidar, { type FSWatcher } from "chokidar";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = Number(process.env.PORT ?? 45367);
const WORKSPACE_DIR = resolve(process.env.DF_WORKSPACE_DIR ?? "./workspace");
const AGENT_CMD = process.env.DF_AGENT_CMD ?? "claude";

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev, dir: __dirname });
const nextHandler = nextApp.getRequestHandler();

// ── SSE channel for preview reload ──────────────────────────────────────────

const sseClients = new Set<ServerResponse>();

function broadcastReload(slug: string) {
  const payload = `event: reload\ndata: ${JSON.stringify({ slug })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      // client will be removed on 'close'
    }
  }
}

// ── Filesystem watcher ─────────────────────────────────────────────────────

let watcher: FSWatcher | null = null;

function startWatcher() {
  if (watcher) return;
  watcher = chokidar.watch(WORKSPACE_DIR, {
    ignored: /(^|[\\/])\..|node_modules|dist/,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 150, pollInterval: 50 },
  });
  watcher.on("change", (path: string) => emitReloadFromPath(path));
  watcher.on("add", (path: string) => emitReloadFromPath(path));
  watcher.on("unlink", (path: string) => emitReloadFromPath(path));
}

function emitReloadFromPath(path: string) {
  const match = path.match(/results\/([^/]+)\.(mdx|html)$/);
  const slug = match ? match[1]! : "*";
  broadcastReload(slug);
}

// ── PTY bridge ─────────────────────────────────────────────────────────────

interface TerminalSession {
  pty: IPty;
  buffer: string[]; // rolling ring of recent output for reconnect replay
}

const MAX_BUFFER_BYTES = 10_000;

function spawnAgent(): TerminalSession {
  const cmd = AGENT_CMD.split(/\s+/);
  const [argv0, ...args] = cmd as [string, ...string[]];
  const pty = spawn(argv0, args, {
    name: "xterm-256color",
    cols: 120,
    rows: 40,
    cwd: WORKSPACE_DIR,
    env: process.env as Record<string, string>,
  });

  const session: TerminalSession = { pty, buffer: [] };
  let total = 0;
  pty.onData((data) => {
    session.buffer.push(data);
    total += data.length;
    while (total > MAX_BUFFER_BYTES && session.buffer.length > 0) {
      const dropped = session.buffer.shift();
      total -= dropped?.length ?? 0;
    }
  });

  return session;
}

function onTerminalConnection(ws: WebSocket) {
  const session = spawnAgent();
  const { pty, buffer } = session;

  // Replay buffer for reconnects / fresh connections.
  for (const chunk of buffer) ws.send(JSON.stringify({ t: "data", d: chunk }));

  const dataSub = pty.onData((d) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify({ t: "data", d }));
  });
  const exitSub = pty.onExit(({ exitCode }) => {
    if (ws.readyState === ws.OPEN)
      ws.send(JSON.stringify({ t: "exit", code: exitCode }));
    ws.close();
  });

  ws.on("message", (raw) => {
    let msg: { t: string; d?: string; cols?: number; rows?: number };
    try {
      msg = JSON.parse(String(raw));
    } catch {
      return;
    }
    if (msg.t === "data" && typeof msg.d === "string") pty.write(msg.d);
    else if (msg.t === "resize" && msg.cols && msg.rows) pty.resize(msg.cols, msg.rows);
  });

  ws.on("close", () => {
    dataSub.dispose();
    exitSub.dispose();
    try {
      pty.kill();
    } catch {
      // already dead
    }
  });
}

// ── Bootstrap ──────────────────────────────────────────────────────────────

async function main() {
  await nextApp.prepare();
  startWatcher();

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const url = req.url ?? "/";
    const parsed = parse(url, true);

    // SSE reload channel.
    if (parsed.pathname === "/api/sse/reload") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });
      res.write(": connected\n\n");
      sseClients.add(res);
      const keepAlive = setInterval(() => {
        try {
          res.write(": ping\n\n");
        } catch {
          /* closed */
        }
      }, 30_000);
      req.on("close", () => {
        clearInterval(keepAlive);
        sseClients.delete(res);
      });
      return;
    }

    return nextHandler(req, res, parsed);
  });

  const wss = new WebSocketServer({ noServer: true });
  server.on("upgrade", (req, socket, head) => {
    if (req.url === "/terminal") {
      wss.handleUpgrade(req, socket, head, (ws) => onTerminalConnection(ws));
    } else {
      socket.destroy();
    }
  });

  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(
      `document-factory web ready on http://localhost:${PORT}  ` +
        `(workspace: ${WORKSPACE_DIR}, agent: "${AGENT_CMD}")`
    );
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("document-factory web failed to start:", err);
  process.exit(1);
});
