import { createBillPayment } from "../handlers/create-bill-payment.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "create_bill_payment";
const toolDescription = "Create a new bill payment in Bill.com to pay one or more bills.";

const billPaymentItemSchema = z.object({
  billId: z.string().describe("The bill ID to pay"),
  amount: z.string().describe("Amount to apply to this bill"),
});

const toolSchema = z.object({
  vendorId: z.string().describe("The vendor ID (required)"),
  processDate: z.string().describe("Payment process date (YYYY-MM-DD)"),
  chartOfAccountId: z.string().describe("Bank account ID to pay from"),
  billPayments: z.array(billPaymentItemSchema).describe("Bills to pay with amounts"),
  description: z.string().optional().describe("Payment description/memo"),
  toPrintCheck: z.enum(['0', '1']).optional().describe("'1' to print check"),
});

export const CreateBillPaymentTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await createBillPayment(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error creating bill payment: ${response.error}`,
        }],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully created bill payment:`,
        },
        {
          type: "text" as const,
          text: JSON.stringify(response.result, null, 2),
        },
      ],
    };
  },
};
