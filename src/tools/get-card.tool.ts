import { getCard } from "../handlers/get-card.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get_card";
const toolDescription = "Get a card by UUID from Bill.com Spend & Expense v3 API.";

const toolSchema = z.object({
  uuid: z.string().describe("The card UUID to retrieve"),
});

export const GetCardTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { uuid } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await getCard(uuid);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting card: ${response.error}`,
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
