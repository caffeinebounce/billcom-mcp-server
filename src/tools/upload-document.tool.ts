import { uploadDocument } from "../handlers/upload-document.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "upload_document";
const toolDescription = "Upload a file to the Bill.com document library.";

const toolSchema = z.object({
  filePath: z.string().describe("Absolute or relative path to the file to upload"),
  fileName: z.string().optional().describe("Optional filename override for Bill.com"),
});

export const UploadDocumentTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await uploadDocument(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error uploading document: ${response.error}`,
        }],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: "Successfully uploaded document:",
        },
        {
          type: "text" as const,
          text: JSON.stringify(response.result, null, 2),
        },
      ],
    };
  },
};
