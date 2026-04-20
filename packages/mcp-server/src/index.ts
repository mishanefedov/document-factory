/**
 * @document-factory/mcp-server — public API.
 *
 * Consumers normally run this via the `document-factory-mcp` CLI. The
 * programmatic exports exist for tests and for hosts that want to embed
 * the server in-process.
 */

export { createServer } from "./server.js";
export { tools, findTool } from "./tools.js";
export type { ToolContext, ToolDefinition } from "./tools.js";
export { Workspace, WorkspaceError } from "./workspace.js";
export type { ServerOpts } from "./server.js";
