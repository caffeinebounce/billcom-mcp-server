import { getTransaction } from "../handlers/get-transaction.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get_transaction";
const toolDescription = "Get a transaction by UUID from Bill.com Spend & Expense v3 API.";

const toolSchema = z.object({
  uuid: z.string().describe("The transaction UUID to retrieve"),
});

export const GetTransactionTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { uuid } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await getTransaction(uuid);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting transaction: ${response.error}`,
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
