import { searchCards } from "../handlers/search-cards.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "search_cards";
const toolDescription = "Search cards in Bill.com Spend & Expense using v3 API.";

const toolSchema = z.object({
  cursor: z.string().optional().describe("Pagination cursor for next page"),
  limit: z.number().optional().describe("Maximum number of results to return"),
  cardType: z.string().optional().describe("Filter by card type ('physical' or 'virtual')"),
  status: z.string().optional().describe("Filter by card status"),
  userId: z.string().optional().describe("Filter by user ID"),
  name: z.string().optional().describe("Filter by card name (case-insensitive partial match)"),
});

export const SearchCardsTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await searchCards(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error searching cards: ${response.error}`,
        }],
      };
    }

    const cards = response.result ?? [];
    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${cards.length} card(s):`,
        },
        ...cards.map((c) => ({
          type: "text" as const,
          text: JSON.stringify(c, null, 2),
        })),
      ],
    };
  },
};
