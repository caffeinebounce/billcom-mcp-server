import { getBillPayment } from "../handlers/get-bill-payment.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get_bill_payment";
const toolDescription = "Get a bill payment by ID from Bill.com.";

const toolSchema = z.object({
  id: z.string().describe("The bill payment ID to retrieve"),
});

export const GetBillPaymentTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { id } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await getBillPayment(id);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting bill payment: ${response.error}`,
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
