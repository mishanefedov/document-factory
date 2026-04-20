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
import { chmodSync, existsSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import next from "next";
import { WebSocketServer, type WebSocket } from "ws";
import { spawn, type IPty } from "node-pty";
import chokidar, { type FSWatcher } from "chokidar";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { workspaceRoot } from "./lib/workspace";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = Number(process.env.PORT ?? 45367);
const WORKSPACE_DIR = workspaceRoot();
// Propagate the resolved workspace so tooling or child processes that read
// the env (docs link routes, CLI invocations from the agent's shell) see the
// same value the server resolved, not the raw user-provided one.
process.env.DF_WORKSPACE_DIR = WORKSPACE_DIR;
const AGENT_CMD = process.env.DF_AGENT_CMD ?? "claude";

// node-pty ships a `spawn-helper` binary in prebuilds/<platform>-<arch>/.
// On Unix, posix_spawnp execs that helper, which then execs the real agent.
// Some install paths (notably pnpm) drop the +x bit when extracting the
// tarball; posix_spawnp then fails with the unhelpful "posix_spawnp failed".
// Fix it proactively at startup so a single bad install doesn't silently
// brick the embedded terminal.
function ensureSpawnHelperExecutable(): void {
  try {
    const require = createRequire(import.meta.url);
    const ptyPkgJson = require.resolve("node-pty/package.json");
    const ptyRoot = dirname(ptyPkgJson);
    const helper = join(
      ptyRoot,
      "prebuilds",
      `${process.platform}-${process.arch}`,
      "spawn-helper"
    );
    if (!existsSync(helper)) return;
    const mode = statSync(helper).mode;
    if ((mode & 0o111) === 0) chmodSync(helper, mode | 0o755);
  } catch {
    // best-effort; spawn will surface a clearer error below if this fails
  }
}

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
  if (!existsSync(WORKSPACE_DIR)) {
    throw new Error(
      `workspace directory does not exist: ${WORKSPACE_DIR} (set DF_WORKSPACE_DIR or create it)`
    );
  }
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
  let session: TerminalSession;
  try {
    session = spawnAgent();
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    const banner =
      `\x1b[31mdocument-factory: failed to start agent "${AGENT_CMD}"\x1b[0m\r\n` +
      `\x1b[90m${reason}\r\n` +
      `Check that the binary is on $PATH, or override DF_AGENT_CMD.\x1b[0m\r\n`;
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ t: "data", d: banner }));
      ws.send(JSON.stringify({ t: "exit", code: 1 }));
      ws.close();
    }
    console.error("[df-web] spawn failed:", reason);
    return;
  }
  // Replay buffer for reconnects / fresh connections.
  for (const chunk of session.buffer) ws.send(JSON.stringify({ t: "data", d: chunk }));

  let dataSub = session.pty.onData((d) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify({ t: "data", d }));
  });
  let exitSub = session.pty.onExit(({ exitCode }) => {
    if (ws.readyState === ws.OPEN)
      ws.send(JSON.stringify({ t: "exit", code: exitCode }));
    ws.close();
  });

  const restart = () => {
    // Tear down the old pty without closing the socket.
    dataSub.dispose();
    exitSub.dispose();
    try {
      session.pty.kill();
    } catch {
      // already dead
    }
    try {
      session = spawnAgent();
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      if (ws.readyState === ws.OPEN) {
        ws.send(
          JSON.stringify({
            t: "data",
            d: `\x1b[31mrestart failed: ${reason}\x1b[0m\r\n`,
          })
        );
      }
      return;
    }
    dataSub = session.pty.onData((d) => {
      if (ws.readyState === ws.OPEN) ws.send(JSON.stringify({ t: "data", d }));
    });
    exitSub = session.pty.onExit(({ exitCode }) => {
      if (ws.readyState === ws.OPEN)
        ws.send(JSON.stringify({ t: "exit", code: exitCode }));
      ws.close();
    });
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify({ t: "restart" }));
  };

  ws.on("message", (raw) => {
    let msg: { t: string; d?: string; cols?: number; rows?: number };
    try {
      msg = JSON.parse(String(raw));
    } catch {
      return;
    }
    if (msg.t === "data" && typeof msg.d === "string") session.pty.write(msg.d);
    else if (msg.t === "resize" && msg.cols && msg.rows)
      session.pty.resize(msg.cols, msg.rows);
    else if (msg.t === "restart") restart();
  });

  ws.on("close", () => {
    dataSub.dispose();
    exitSub.dispose();
    try {
      session.pty.kill();
    } catch {
      // already dead
    }
  });
}

// ── Bootstrap ──────────────────────────────────────────────────────────────

async function main() {
  ensureSpawnHelperExecutable();
  if (!existsSync(WORKSPACE_DIR)) {
    console.warn(
      `[df-web] WARNING: workspace does not exist: ${WORKSPACE_DIR}\n` +
        `  Set DF_WORKSPACE_DIR to an existing workspace root, or create that directory.\n` +
        `  The terminal will fail to spawn until this is fixed.`
    );
  }
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
