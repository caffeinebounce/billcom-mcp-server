import { createBill } from "../handlers/create-bill.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "create_bill";
const toolDescription = "Create a new bill in Bill.com.";

const lineItemSchema = z.object({
  amount: z.string().describe("Line item amount"),
  chartOfAccountId: z.string().optional().describe("Chart of account ID"),
  departmentId: z.string().optional().describe("Department ID"),
  locationId: z.string().optional().describe("Location ID"),
  jobId: z.string().optional().describe("Job/Project ID"),
  customerId: z.string().optional().describe("Customer ID for job billing"),
  jobBillable: z.enum(['0', '1']).optional().describe("'1' if billable to customer"),
  description: z.string().optional().describe("Line item description"),
  lineType: z.enum(['1', '2']).optional().describe("'1' = expense, '2' = item"),
  itemId: z.string().optional().describe("Item ID if lineType is '2'"),
  quantity: z.string().optional().describe("Quantity"),
  unitPrice: z.string().optional().describe("Unit price"),
  employeeId: z.string().optional().describe("Employee ID"),
});

const toolSchema = z.object({
  vendorId: z.string().describe("The vendor ID (required)"),
  invoiceNumber: z.string().optional().describe("Vendor's invoice number"),
  invoiceDate: z.string().describe("Invoice date (YYYY-MM-DD)"),
  dueDate: z.string().describe("Due date (YYYY-MM-DD)"),
  glPostingDate: z.string().optional().describe("GL posting date (YYYY-MM-DD)"),
  description: z.string().optional().describe("Bill description"),
  poNumber: z.string().optional().describe("Purchase order number"),
  billLineItems: z.array(lineItemSchema).optional().describe("Line items for the bill"),
});

export const CreateBillTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await createBill(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error creating bill: ${response.error}`,
        }],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully created bill:`,
        },
        {
          type: "text" as const,
          text: JSON.stringify(response.result, null, 2),
        },
      ],
    };
  },
};
