import { updateTransaction } from "../handlers/update-transaction.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "update_transaction";
const toolDescription = "Update a transaction in Bill.com Spend & Expense using v3 API (e.g., categorize, add memo).";

const toolSchema = z.object({
  uuid: z.string().describe("The transaction UUID to update"),
  description: z.string().optional().describe("Updated description"),
  chartOfAccountId: z.string().optional().describe("Chart of account ID for categorization"),
  departmentId: z.string().optional().describe("Department ID"),
  locationId: z.string().optional().describe("Location ID"),
  memo: z.string().optional().describe("Memo/notes for the transaction"),
});

export const UpdateTransactionTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await updateTransaction(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error updating transaction: ${response.error}`,
        }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: `Transaction updated successfully:\n${JSON.stringify(response.result, null, 2)}`,
      }],
    };
  },
};
