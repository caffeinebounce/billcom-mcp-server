import { listDocuments } from "../handlers/list-documents.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "list_documents";
const toolDescription = "List documents in Bill.com with pagination, filters, and sorting.";

const filterOperatorEnum = z.enum([
  "eq", "ne", "lt", "le", "gt", "ge", "in", "nin", "sw", "ew", "ct",
]);

const filterSchema = z.object({
  field: z.string().describe("Field name to filter on (e.g., 'name', 'id', 'createdTime')"),
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
});

export const ListDocumentsTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await listDocuments(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error listing documents: ${response.error}`,
        }],
      };
    }

    const documents = response.result ?? [];
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify(documents, null, 2),
      }],
    };
  },
};
