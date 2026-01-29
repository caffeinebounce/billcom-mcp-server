import { searchReimbursements } from "../handlers/search-reimbursements.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "search_reimbursements";
const toolDescription = "Search reimbursement requests in Bill.com Spend & Expense using v3 API.";

const toolSchema = z.object({
  cursor: z.string().optional().describe("Pagination cursor for next page"),
  limit: z.number().optional().describe("Maximum number of results to return"),
  userId: z.string().optional().describe("Filter by user ID"),
  status: z.string().optional().describe("Filter by reimbursement status"),
  startDate: z.string().optional().describe("Filter by start date (YYYY-MM-DD)"),
  endDate: z.string().optional().describe("Filter by end date (YYYY-MM-DD)"),
});

export const SearchReimbursementsTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await searchReimbursements(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error searching reimbursements: ${response.error}`,
        }],
      };
    }

    const reimbursements = response.result ?? [];
    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${reimbursements.length} reimbursement(s):`,
        },
        ...reimbursements.map((r) => ({
          type: "text" as const,
          text: JSON.stringify(r, null, 2),
        })),
      ],
    };
  },
};
