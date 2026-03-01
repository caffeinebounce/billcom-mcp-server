import { deleteDocument } from "../handlers/delete-document.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "delete_document";
const toolDescription = "Delete a document from Bill.com by ID.";

const toolSchema = z.object({
  id: z.string().describe("The document ID to delete"),
});

export const DeleteDocumentTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { id } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await deleteDocument(id);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error deleting document: ${response.error}`,
        }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: `Successfully deleted document ${id}`,
      }],
    };
  },
};
