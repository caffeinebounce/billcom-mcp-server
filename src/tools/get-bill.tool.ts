import { getBill } from "../handlers/get-bill.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get_bill";
const toolDescription = "Get a bill by ID from Bill.com.";

const toolSchema = z.object({
  id: z.string().describe("The bill ID to retrieve"),
});

export const GetBillTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { id } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await getBill(id);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting bill: ${response.error}`,
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
