import { voidBillPayment } from "../handlers/void-bill-payment.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "void_bill_payment";
const toolDescription = "Void a bill payment in Bill.com. Only unprocessed payments can be voided.";

const toolSchema = z.object({
  id: z.string().describe("The bill payment ID to void"),
});

export const VoidBillPaymentTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { id } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await voidBillPayment(id);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error voiding bill payment: ${response.error}`,
        }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: `Successfully voided bill payment ${id}`,
      }],
    };
  },
};
