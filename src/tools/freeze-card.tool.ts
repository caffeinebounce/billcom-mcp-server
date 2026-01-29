import { freezeCard } from "../handlers/freeze-card.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "freeze_card";
const toolDescription = "Freeze a card in Bill.com Spend & Expense using v3 API.";

const toolSchema = z.object({
  uuid: z.string().describe("The card UUID to freeze"),
});

export const FreezeCardTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { uuid } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await freezeCard(uuid);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error freezing card: ${response.error}`,
        }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: `Card frozen successfully:\n${JSON.stringify(response.result, null, 2)}`,
      }],
    };
  },
};
