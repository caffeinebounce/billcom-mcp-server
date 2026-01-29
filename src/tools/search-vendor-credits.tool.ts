import { searchVendorCredits } from "../handlers/search-vendor-credits.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "search_vendor_credits";
const toolDescription = "Search vendor credits in Bill.com.";

const filterOperatorEnum = z.enum([
  'eq', 'ne', 'lt', 'le', 'gt', 'ge', 'in', 'nin', 'sw', 'ew', 'ct'
]);

const filterSchema = z.object({
  field: z.string(),
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

export const SearchVendorCreditsTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await searchVendorCredits(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error searching vendor credits: ${response.error}`,
        }],
      };
    }

    const credits = response.result ?? [];
    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${credits.length} vendor credit(s):`,
        },
        ...credits.map((c) => ({
          type: "text" as const,
          text: JSON.stringify(c, null, 2),
        })),
      ],
    };
  },
};
