import { createReimbursement } from "../handlers/create-reimbursement.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "create_reimbursement";
const toolDescription = "Create a new reimbursement request in Bill.com Spend & Expense using v3 API.";

const lineItemSchema = z.object({
  amount: z.string().describe("Expense amount"),
  expenseDate: z.string().describe("Date of expense (YYYY-MM-DD)"),
  description: z.string().optional().describe("Expense description"),
  chartOfAccountId: z.string().optional().describe("Chart of account ID"),
  departmentId: z.string().optional().describe("Department ID"),
  locationId: z.string().optional().describe("Location ID"),
});

const toolSchema = z.object({
  userId: z.string().describe("User ID requesting the reimbursement"),
  description: z.string().optional().describe("Overall reimbursement description"),
  reimbursementLineItems: z.array(lineItemSchema).describe("List of expense line items"),
});

export const CreateReimbursementTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await createReimbursement(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error creating reimbursement: ${response.error}`,
        }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: `Reimbursement created successfully:\n${JSON.stringify(response.result, null, 2)}`,
      }],
    };
  },
};
