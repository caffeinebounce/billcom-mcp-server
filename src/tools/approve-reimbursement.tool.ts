import { approveReimbursement } from "../handlers/approve-reimbursement.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "approve_reimbursement";
const toolDescription = "Approve a reimbursement request in Bill.com Spend & Expense using v3 API.";

const toolSchema = z.object({
  uuid: z.string().describe("The reimbursement UUID to approve"),
});

export const ApproveReimbursementTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { uuid } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await approveReimbursement(uuid);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error approving reimbursement: ${response.error}`,
        }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: `Reimbursement approved successfully:\n${JSON.stringify(response.result, null, 2)}`,
      }],
    };
  },
};
