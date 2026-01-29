import { updateBudget } from "../handlers/update-budget.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "update_budget";
const toolDescription = "Update an existing budget in Bill.com Spend & Expense using v3 API.";

const toolSchema = z.object({
  uuid: z.string().describe("The budget UUID to update"),
  name: z.string().optional().describe("Updated budget name"),
  amount: z.string().optional().describe("Updated budget amount"),
  startDate: z.string().optional().describe("Updated start date (YYYY-MM-DD)"),
  endDate: z.string().optional().describe("Updated end date (YYYY-MM-DD)"),
  budgetType: z.string().optional().describe("Updated budget type"),
  description: z.string().optional().describe("Updated description"),
  isActive: z.string().optional().describe("Set active status ('1' or '0')"),
});

export const UpdateBudgetTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await updateBudget(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error updating budget: ${response.error}`,
        }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: `Budget updated successfully:\n${JSON.stringify(response.result, null, 2)}`,
      }],
    };
  },
};
