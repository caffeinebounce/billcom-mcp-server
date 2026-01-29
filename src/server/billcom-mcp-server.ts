import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export class BillcomMCPServer {
  private static instance: McpServer | null = null;

  private constructor() {}

  public static GetServer(): McpServer {
    if (BillcomMCPServer.instance === null) {
      BillcomMCPServer.instance = new McpServer({
        name: "Bill.com MCP Server",
        version: "1.0.0",
      });
    }
    return BillcomMCPServer.instance;
  }
}
