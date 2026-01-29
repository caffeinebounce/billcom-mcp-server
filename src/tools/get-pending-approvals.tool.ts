import { getPendingApprovals } from "../handlers/get-pending-approvals.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get_pending_approvals";
const toolDescription = "Get items pending approval in Bill.com.";

const toolSchema = z.object({
  objectType: z.enum(['Bill', 'VendorCredit', 'SentPay']).optional().describe(
    "Filter by object type: 'Bill', 'VendorCredit', or 'SentPay'"
  ),
  start: z.number().optional(),
  max: z.number().optional(),
});

export const GetPendingApprovalsTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await getPendingApprovals(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting pending approvals: ${response.error}`,
        }],
      };
    }

    const approvals = response.result ?? [];
    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${approvals.length} pending approval(s):`,
        },
        ...approvals.map((a) => ({
          type: "text" as const,
          text: JSON.stringify(a, null, 2),
        })),
      ],
    };
  },
};
