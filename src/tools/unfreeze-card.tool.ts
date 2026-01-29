import { unfreezeCard } from "../handlers/unfreeze-card.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "unfreeze_card";
const toolDescription = "Unfreeze a card in Bill.com Spend & Expense using v3 API.";

const toolSchema = z.object({
  uuid: z.string().describe("The card UUID to unfreeze"),
});

export const UnfreezeCardTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { uuid } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await unfreezeCard(uuid);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error unfreezing card: ${response.error}`,
        }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: `Card unfrozen successfully:\n${JSON.stringify(response.result, null, 2)}`,
      }],
    };
  },
};
