import { approveBill } from "../handlers/approve-bill.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "approve_bill";
const toolDescription = "Approve a bill that is pending approval in Bill.com.";

const toolSchema = z.object({
  billId: z.string().describe("The bill ID to approve"),
});

export const ApproveBillTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { billId } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await approveBill(billId);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error approving bill: ${response.error}`,
        }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: `Successfully approved bill ${billId}`,
      }],
    };
  },
};
