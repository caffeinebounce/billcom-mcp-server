import { searchBudgets } from "../handlers/search-budgets.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "search_budgets";
const toolDescription = "Search budgets in Bill.com Spend & Expense using v3 API.";

const toolSchema = z.object({
  cursor: z.string().optional().describe("Pagination cursor for next page"),
  limit: z.number().optional().describe("Maximum number of results to return"),
  name: z.string().optional().describe("Filter by budget name"),
  isActive: z.boolean().optional().describe("Filter by active status"),
  budgetType: z.string().optional().describe("Filter by budget type"),
});

export const SearchBudgetsTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await searchBudgets(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error searching budgets: ${response.error}`,
        }],
      };
    }

    const budgets = response.result ?? [];
    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${budgets.length} budget(s):`,
        },
        ...budgets.map((b) => ({
          type: "text" as const,
          text: JSON.stringify(b, null, 2),
        })),
      ],
    };
  },
};
