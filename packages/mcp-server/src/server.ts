/**
 * server.ts — MCP server factory. Wires tool definitions to MCP request handlers.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { findTool, tools } from "./tools.js";
import { Workspace, WorkspaceError } from "./workspace.js";

export interface ServerOpts {
  workspaceRoot?: string;
}

export function createServer(opts: ServerOpts = {}): Server {
  const workspace = new Workspace(opts.workspaceRoot);

  const server = new Server(
    {
      name: "document-factory",
      version: "0.2.0-dev",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const name = req.params.name;
    const args = (req.params.arguments ?? {}) as Record<string, unknown>;
    const tool = findTool(name);
    if (!tool) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: { code: "E_UNKNOWN_TOOL", message: `Unknown tool: ${name}` },
            }),
          },
        ],
      };
    }
    try {
      await workspace.ensureInitialized();
      const result = await tool.handler(args, { workspace });
      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
      };
    } catch (err: unknown) {
      const code = err instanceof WorkspaceError ? err.code : "E_INTERNAL";
      const message = err instanceof Error ? err.message : String(err);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: { code, message } }),
          },
        ],
      };
    }
  });

  return server;
}
