import { searchBillPayments } from "../handlers/search-bill-payments.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "search_bill_payments";
const toolDescription = "Search bill payments in Bill.com.";

const filterOperatorEnum = z.enum([
  'eq', 'ne', 'lt', 'le', 'gt', 'ge', 'in', 'nin', 'sw', 'ew', 'ct'
]);

const filterSchema = z.object({
  field: z.string().describe("Field to filter on (e.g., 'vendorId', 'status', 'processDate')"),
  op: filterOperatorEnum,
  value: z.union([z.string(), z.array(z.string())]),
});

const sortSchema = z.object({
  field: z.string(),
  asc: z.boolean(),
});

const toolSchema = z.object({
  start: z.number().optional(),
  max: z.number().optional(),
  filters: z.array(filterSchema).optional(),
  sort: z.array(sortSchema).optional(),
  nested: z.boolean().optional(),
});

export const SearchBillPaymentsTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await searchBillPayments(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error searching bill payments: ${response.error}`,
        }],
      };
    }

    const payments = response.result ?? [];
    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${payments.length} bill payment(s):`,
        },
        ...payments.map((p) => ({
          type: "text" as const,
          text: JSON.stringify(p, null, 2),
        })),
      ],
    };
  },
};
