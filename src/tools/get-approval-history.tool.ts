import { getApprovalHistory } from "../handlers/get-approval-history.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get_approval_history";
const toolDescription = "Get the approval history for a specific bill or other object in Bill.com.";

const toolSchema = z.object({
  objectId: z.string().describe("The object ID (e.g., bill ID)"),
  objectType: z.enum(['Bill', 'VendorCredit', 'SentPay']).describe(
    "The object type: 'Bill', 'VendorCredit', or 'SentPay'"
  ),
});

export const GetApprovalHistoryTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { objectId, objectType } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await getApprovalHistory(objectId, objectType);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting approval history: ${response.error}`,
        }],
      };
    }

    const history = response.result ?? [];
    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${history.length} approval record(s):`,
        },
        ...history.map((h) => ({
          type: "text" as const,
          text: JSON.stringify(h, null, 2),
        })),
      ],
    };
  },
};
