import { createVendorCredit } from "../handlers/create-vendor-credit.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "create_vendor_credit";
const toolDescription = "Create a new vendor credit in Bill.com.";

const lineItemSchema = z.object({
  amount: z.string().describe("Line item amount"),
  chartOfAccountId: z.string().optional().describe("Chart of account ID"),
  departmentId: z.string().optional().describe("Department ID"),
  locationId: z.string().optional().describe("Location ID"),
  description: z.string().optional().describe("Line item description"),
});

const toolSchema = z.object({
  vendorId: z.string().describe("The vendor ID (required)"),
  creditDate: z.string().describe("Credit date (YYYY-MM-DD)"),
  creditNumber: z.string().optional().describe("Credit memo number"),
  description: z.string().optional().describe("Description"),
  vendorCreditLineItems: z.array(lineItemSchema).optional().describe("Line items"),
});

export const CreateVendorCreditTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await createVendorCredit(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error creating vendor credit: ${response.error}`,
        }],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully created vendor credit:`,
        },
        {
          type: "text" as const,
          text: JSON.stringify(response.result, null, 2),
        },
      ],
    };
  },
};
