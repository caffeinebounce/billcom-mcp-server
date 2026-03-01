import { getDocument } from "../handlers/get-document.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get_document";
const toolDescription = "Get a document by ID from Bill.com.";

const toolSchema = z.object({
  id: z.string().describe("The document ID to retrieve"),
});

export const GetDocumentTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { id } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await getDocument(id);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting document: ${response.error}`,
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
