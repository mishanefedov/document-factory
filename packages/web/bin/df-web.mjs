#!/usr/bin/env node
/**
 * df-web — launcher for @document-factory/web.
 *
 * Registers tsx's ESM loader so server.ts runs without a precompile step,
 * then imports it. server.ts takes over (spawns Next + WebSocket + SSE).
 *
 * Usage:
 *   df-web                              # defaults
 *   DF_AGENT_CMD=gemini df-web
 *   DF_WORKSPACE_DIR=/abs/path df-web
 *   PORT=4000 df-web
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgRoot = resolve(__dirname, "..");

// Register tsx loader so server.ts (.ts) can be imported by Node.
const { register } = await import("tsx/esm/api");
register();

// Hand control over to server.ts.
const serverPath = resolve(pkgRoot, "server.ts");
await import(pathToFileURL(serverPath).href);
