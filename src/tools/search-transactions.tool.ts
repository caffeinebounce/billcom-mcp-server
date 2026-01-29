import { searchTransactions } from "../handlers/search-transactions.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "search_transactions";
const toolDescription = "Search card transactions in Bill.com Spend & Expense using v3 API.";

const toolSchema = z.object({
  cursor: z.string().optional().describe("Pagination cursor for next page"),
  limit: z.number().optional().describe("Maximum number of results to return"),
  cardId: z.string().optional().describe("Filter by card UUID"),
  status: z.string().optional().describe("Filter by transaction status"),
  startDate: z.string().optional().describe("Filter by start date (YYYY-MM-DD)"),
  endDate: z.string().optional().describe("Filter by end date (YYYY-MM-DD)"),
  merchantName: z.string().optional().describe("Filter by merchant name"),
});

export const SearchTransactionsTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await searchTransactions(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error searching transactions: ${response.error}`,
        }],
      };
    }

    const transactions = response.result ?? [];
    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${transactions.length} transaction(s):`,
        },
        ...transactions.map((t) => ({
          type: "text" as const,
          text: JSON.stringify(t, null, 2),
        })),
      ],
    };
  },
};
