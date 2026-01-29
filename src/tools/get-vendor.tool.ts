import { getVendor } from "../handlers/get-vendor.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get_vendor";
const toolDescription = "Get a vendor by ID from Bill.com.";

const toolSchema = z.object({
  id: z.string().describe("The vendor ID to retrieve"),
});

export const GetVendorTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { id } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await getVendor(id);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting vendor: ${response.error}`,
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
