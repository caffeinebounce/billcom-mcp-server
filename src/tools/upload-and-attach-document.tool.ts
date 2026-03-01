import { uploadAndAttachDocument } from "../handlers/upload-and-attach-document.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "upload_and_attach_document";
const toolDescription = "Upload a file and attach it to a specific bill in Bill.com";

const toolSchema = z.object({
  filePath: z.string().describe("Absolute or relative path to the file to upload"),
  billId: z.string().describe("The bill ID to attach the uploaded document to"),
  fileName: z.string().optional().describe("Optional filename override for Bill.com"),
});

export const UploadAndAttachDocumentTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await uploadAndAttachDocument(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error uploading and attaching document: ${response.error}`,
        }],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: "Successfully uploaded and attached document:",
        },
        {
          type: "text" as const,
          text: JSON.stringify(response.result, null, 2),
        },
      ],
    };
  },
};
