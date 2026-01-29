import { searchRecurringBills } from "../handlers/search-recurring-bills.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "search_recurring_bills";
const toolDescription = "Search recurring bills in Bill.com.";

const filterOperatorEnum = z.enum([
  'eq', 'ne', 'lt', 'le', 'gt', 'ge', 'in', 'nin', 'sw', 'ew', 'ct'
]);

const filterSchema = z.object({
  field: z.string().describe("Field to filter on (e.g., 'vendorId', 'isActive', 'nextDueDate')"),
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

export const SearchRecurringBillsTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await searchRecurringBills(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error searching recurring bills: ${response.error}`,
        }],
      };
    }

    const bills = response.result ?? [];
    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${bills.length} recurring bill(s):`,
        },
        ...bills.map((b) => ({
          type: "text" as const,
          text: JSON.stringify(b, null, 2),
        })),
      ],
    };
  },
};
