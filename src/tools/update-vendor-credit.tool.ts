import { updateVendorCredit } from "../handlers/update-vendor-credit.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "update_vendor_credit";
const toolDescription = "Update an existing vendor credit in Bill.com.";

const lineItemSchema = z.object({
  amount: z.string(),
  chartOfAccountId: z.string().optional(),
  departmentId: z.string().optional(),
  locationId: z.string().optional(),
  description: z.string().optional(),
});

const toolSchema = z.object({
  id: z.string().describe("The vendor credit ID to update (required)"),
  creditDate: z.string().optional().describe("Credit date (YYYY-MM-DD)"),
  creditNumber: z.string().optional().describe("Credit memo number"),
  description: z.string().optional().describe("Description"),
  vendorCreditLineItems: z.array(lineItemSchema).optional().describe("Updated line items"),
});

export const UpdateVendorCreditTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await updateVendorCredit(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error updating vendor credit: ${response.error}`,
        }],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully updated vendor credit:`,
        },
        {
          type: "text" as const,
          text: JSON.stringify(response.result, null, 2),
        },
      ],
    };
  },
};
