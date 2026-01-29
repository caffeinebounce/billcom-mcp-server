import { getPendingApprovalsV3 } from "../handlers/get-pending-approvals-v3.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get_pending_approvals_v3";
const toolDescription = `Get bills pending the current user's approval using Bill.com v3 API.

This is the preferred method for getting pending approvals as it:
- Returns only bills awaiting YOUR approval action (not all pending bills)
- Includes full approval workflow context (current step, total steps, policy info)
- Provides vendor names and richer metadata

Use this instead of get_pending_approvals for accurate pending approval lists.`;

const toolSchema = z.object({
  page: z.number().optional().describe("Page number (0-indexed)"),
  pageSize: z.number().optional().describe("Number of results per page (default: 50)"),
});

export const GetPendingApprovalsV3Tool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await getPendingApprovalsV3(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting pending approvals: ${response.error}`,
        }],
      };
    }

    const approvals = response.result ?? [];
    
    if (approvals.length === 0) {
      return {
        content: [{
          type: "text" as const,
          text: "No bills pending your approval.",
        }],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${approvals.length} bill(s) pending your approval:`,
        },
        ...approvals.map((a) => ({
          type: "text" as const,
          text: JSON.stringify(a, null, 2),
        })),
      ],
    };
  },
};
