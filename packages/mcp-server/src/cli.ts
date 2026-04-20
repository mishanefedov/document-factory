#!/usr/bin/env node
/**
 * cli.ts — stdio entry point. Run `npx @document-factory/mcp-server` or
 * wire into a `.claude.json` / `.cursor/mcp.json` config.
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createServer } from "./server.js";

async function main() {
  const workspaceRoot = process.env.DF_WORKSPACE_DIR;
  const server = createServer({ workspaceRoot });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Stay alive; SDK handles shutdown on EOF.
}

main().catch((err) => {
  // stderr is safe; stdout is reserved for MCP protocol traffic.
  process.stderr.write(`document-factory-mcp failed: ${err?.message ?? err}\n`);
  process.exit(1);
});
