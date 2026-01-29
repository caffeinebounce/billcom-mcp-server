import { getBudget } from "../handlers/get-budget.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get_budget";
const toolDescription = "Get a budget by UUID from Bill.com Spend & Expense v3 API.";

const toolSchema = z.object({
  uuid: z.string().describe("The budget UUID to retrieve"),
});

export const GetBudgetTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { uuid } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await getBudget(uuid);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting budget: ${response.error}`,
        }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify(response.result, null, 2),
      }],
    };
  },
};
