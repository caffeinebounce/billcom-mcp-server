import { searchVendors } from "../handlers/search-vendors.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "search_vendors";
const toolDescription = "Search vendors in Bill.com. Supports filtering by field values, pagination, and sorting.";

const filterOperatorEnum = z.enum([
  'eq',   // equals
  'ne',   // not equals
  'lt',   // less than
  'le',   // less than or equal
  'gt',   // greater than
  'ge',   // greater than or equal
  'in',   // in list
  'nin',  // not in list
  'sw',   // starts with
  'ew',   // ends with
  'ct'    // contains
]).describe("Comparison operator for the filter");

const filterSchema = z.object({
  field: z.string().describe("Field name to filter on (e.g., 'name', 'isActive', 'email')"),
  op: filterOperatorEnum,
  value: z.union([z.string(), z.array(z.string())]).describe("Value(s) to filter by"),
});

const sortSchema = z.object({
  field: z.string().describe("Field name to sort by"),
  asc: z.boolean().describe("True for ascending, false for descending"),
});

const toolSchema = z.object({
  start: z.number().optional().describe("Starting index for pagination (0-based)"),
  max: z.number().optional().describe("Maximum number of results to return (default 999)"),
  filters: z.array(filterSchema).optional().describe("Array of filters to apply"),
  sort: z.array(sortSchema).optional().describe("Array of sort options"),
  nested: z.boolean().optional().describe("Include nested data in response"),
});

export const SearchVendorsTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await searchVendors(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error searching vendors: ${response.error}`,
        }],
      };
    }

    const vendors = response.result ?? [];
    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${vendors.length} vendor(s):`,
        },
        ...vendors.map((v) => ({
          type: "text" as const,
          text: JSON.stringify(v, null, 2),
        })),
      ],
    };
  },
};
