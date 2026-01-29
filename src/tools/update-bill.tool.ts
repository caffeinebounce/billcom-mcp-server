import { updateBill } from "../handlers/update-bill.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "update_bill";
const toolDescription = "Update an existing bill in Bill.com.";

const lineItemSchema = z.object({
  amount: z.string(),
  chartOfAccountId: z.string().optional(),
  departmentId: z.string().optional(),
  locationId: z.string().optional(),
  jobId: z.string().optional(),
  customerId: z.string().optional(),
  jobBillable: z.enum(['0', '1']).optional(),
  description: z.string().optional(),
  lineType: z.enum(['1', '2']).optional(),
  itemId: z.string().optional(),
  quantity: z.string().optional(),
  unitPrice: z.string().optional(),
  employeeId: z.string().optional(),
});

const toolSchema = z.object({
  id: z.string().describe("The bill ID to update (required)"),
  invoiceNumber: z.string().optional().describe("Vendor's invoice number"),
  invoiceDate: z.string().optional().describe("Invoice date (YYYY-MM-DD)"),
  dueDate: z.string().optional().describe("Due date (YYYY-MM-DD)"),
  glPostingDate: z.string().optional().describe("GL posting date"),
  description: z.string().optional().describe("Bill description"),
  poNumber: z.string().optional().describe("Purchase order number"),
  billLineItems: z.array(lineItemSchema).optional().describe("Updated line items"),
});

export const UpdateBillTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await updateBill(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error updating bill: ${response.error}`,
        }],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully updated bill:`,
        },
        {
          type: "text" as const,
          text: JSON.stringify(response.result, null, 2),
        },
      ],
    };
  },
};
