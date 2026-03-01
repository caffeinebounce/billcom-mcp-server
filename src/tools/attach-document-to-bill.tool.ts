import { attachDocumentToBill } from "../handlers/attach-document-to-bill.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "attach_document_to_bill";
const toolDescription = "Attach an existing document to a Bill.com bill.";

const toolSchema = z.object({
  billId: z.string().describe("The bill ID to update"),
  documentId: z.string().describe("The document ID to attach"),
});

export const AttachDocumentToBillTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await attachDocumentToBill(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error attaching document to bill: ${response.error}`,
        }],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: "Successfully attached document to bill:",
        },
        {
          type: "text" as const,
          text: JSON.stringify(response.result, null, 2),
        },
      ],
    };
  },
};
