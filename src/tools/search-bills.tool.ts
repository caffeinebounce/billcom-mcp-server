import { searchBills } from "../handlers/search-bills.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "search_bills";
const toolDescription = "Search bills in Bill.com. Supports filtering by vendor, status, date range, and more.";

const filterOperatorEnum = z.enum([
  'eq', 'ne', 'lt', 'le', 'gt', 'ge', 'in', 'nin', 'sw', 'ew', 'ct'
]);

const filterSchema = z.object({
  field: z.string().describe("Field name to filter on (e.g., 'vendorId', 'paymentStatus', 'dueDate')"),
  op: filterOperatorEnum,
  value: z.union([z.string(), z.array(z.string())]),
});

const sortSchema = z.object({
  field: z.string(),
  asc: z.boolean(),
});

const toolSchema = z.object({
  start: z.number().optional().describe("Starting index for pagination"),
  max: z.number().optional().describe("Maximum results to return"),
  filters: z.array(filterSchema).optional().describe("Filters to apply"),
  sort: z.array(sortSchema).optional().describe("Sort options"),
  nested: z.boolean().optional().describe("Include line items"),
});

export const SearchBillsTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await searchBills(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error searching bills: ${response.error}`,
        }],
      };
    }

    const bills = response.result ?? [];
    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${bills.length} bill(s):`,
        },
        ...bills.map((b) => ({
          type: "text" as const,
          text: JSON.stringify(b, null, 2),
        })),
      ],
    };
  },
};
