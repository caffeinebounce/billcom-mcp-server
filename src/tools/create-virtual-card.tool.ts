import { createVirtualCard } from "../handlers/create-virtual-card.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "create_virtual_card";
const toolDescription = "Create a new virtual card in Bill.com Spend & Expense using v3 API.";

const toolSchema = z.object({
  cardholderName: z.string().describe("Name of the cardholder"),
  userId: z.string().optional().describe("User ID to assign the card to"),
  spendLimit: z.string().optional().describe("Spending limit amount"),
  spendLimitPeriod: z.string().optional().describe("Spend limit period: 'transaction', 'daily', 'weekly', 'monthly', 'yearly', 'total'"),
  budgetId: z.string().optional().describe("Budget UUID to link the card to"),
  vendorId: z.string().optional().describe("Vendor ID to restrict card usage"),
  description: z.string().optional().describe("Card description"),
});

export const CreateVirtualCardTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await createVirtualCard(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error creating virtual card: ${response.error}`,
        }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: `Virtual card created successfully:\n${JSON.stringify(response.result, null, 2)}`,
      }],
    };
  },
};
