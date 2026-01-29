import { rejectBill } from "../handlers/reject-bill.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "reject_bill";
const toolDescription = "Reject a bill that is pending approval in Bill.com.";

const toolSchema = z.object({
  billId: z.string().describe("The bill ID to reject"),
  reason: z.string().optional().describe("Reason for rejection"),
});

export const RejectBillTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { billId, reason } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await rejectBill(billId, reason);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error rejecting bill: ${response.error}`,
        }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: `Successfully rejected bill ${billId}`,
      }],
    };
  },
};
