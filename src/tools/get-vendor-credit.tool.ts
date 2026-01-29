import { getVendorCredit } from "../handlers/get-vendor-credit.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get_vendor_credit";
const toolDescription = "Get a vendor credit by ID from Bill.com.";

const toolSchema = z.object({
  id: z.string().describe("The vendor credit ID to retrieve"),
});

export const GetVendorCreditTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { id } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await getVendorCredit(id);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting vendor credit: ${response.error}`,
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
