import { approveBillV3 } from "../handlers/approve-bill-v3.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "approve_bill_v3";
const toolDescription = `Approve a bill using Bill.com v3 API.

Uses the v3 approval workflow which:
- Handles multi-step approvals correctly
- Supports approval comments
- Returns detailed status about the approval action

Prefer this over approve_bill for better approval workflow support.`;

const toolSchema = z.object({
  billId: z.string().describe("The bill ID to approve"),
  comment: z.string().optional().describe("Optional approval comment"),
});

export const ApproveBillV3Tool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    
    if (!params.billId) {
      return {
        content: [{
          type: "text" as const,
          text: "Error: billId is required",
        }],
      };
    }

    const response = await approveBillV3(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error approving bill: ${response.error}`,
        }],
      };
    }

    const result = response.result;
    const message = result?.message || `Successfully approved bill ${params.billId}`;
    
    return {
      content: [{
        type: "text" as const,
        text: result?.newStatus 
          ? `${message} (new status: ${result.newStatus})`
          : message,
      }],
    };
  },
};
