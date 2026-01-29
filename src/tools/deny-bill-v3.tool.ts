import { denyBillV3 } from "../handlers/deny-bill-v3.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "deny_bill_v3";
const toolDescription = `Deny a bill using Bill.com v3 API.

Uses the v3 approval workflow which:
- Handles denial in multi-step approval workflows
- Supports denial comments (recommended for audit trail)
- Returns detailed status about the denial action

Prefer this over reject_bill for better approval workflow support.`;

const toolSchema = z.object({
  billId: z.string().describe("The bill ID to deny"),
  comment: z.string().optional().describe("Optional denial reason/comment (recommended)"),
});

export const DenyBillV3Tool: ToolDefinition<typeof toolSchema> = {
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

    const response = await denyBillV3(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error denying bill: ${response.error}`,
        }],
      };
    }

    const result = response.result;
    const message = result?.message || `Successfully denied bill ${params.billId}`;
    
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
