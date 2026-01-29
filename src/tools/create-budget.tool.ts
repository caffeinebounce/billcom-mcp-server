import { createBudget } from "../handlers/create-budget.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "create_budget";
const toolDescription = "Create a new budget in Bill.com Spend & Expense using v3 API.";

const toolSchema = z.object({
  name: z.string().describe("Budget name"),
  amount: z.string().describe("Budget amount"),
  startDate: z.string().describe("Start date (YYYY-MM-DD)"),
  endDate: z.string().describe("End date (YYYY-MM-DD)"),
  budgetType: z.string().optional().describe("Budget type"),
  description: z.string().optional().describe("Budget description"),
  departmentId: z.string().optional().describe("Department ID to assign"),
  locationId: z.string().optional().describe("Location ID to assign"),
  chartOfAccountId: z.string().optional().describe("Chart of account ID"),
});

export const CreateBudgetTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await createBudget(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error creating budget: ${response.error}`,
        }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: `Budget created successfully:\n${JSON.stringify(response.result, null, 2)}`,
      }],
    };
  },
};
