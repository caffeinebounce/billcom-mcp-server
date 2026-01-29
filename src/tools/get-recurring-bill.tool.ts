import { getRecurringBill } from "../handlers/get-recurring-bill.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get_recurring_bill";
const toolDescription = "Get a recurring bill by ID from Bill.com.";

const toolSchema = z.object({
  id: z.string().describe("The recurring bill ID to retrieve"),
});

export const GetRecurringBillTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { id } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await getRecurringBill(id);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting recurring bill: ${response.error}`,
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
