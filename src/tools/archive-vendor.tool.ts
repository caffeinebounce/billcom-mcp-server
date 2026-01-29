import { archiveVendor } from "../handlers/archive-vendor.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "archive_vendor";
const toolDescription = "Archive (deactivate) a vendor in Bill.com. Archived vendors cannot be used for new bills but history is preserved.";

const toolSchema = z.object({
  id: z.string().describe("The vendor ID to archive"),
});

export const ArchiveVendorTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { id } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await archiveVendor(id);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error archiving vendor: ${response.error}`,
        }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: `Successfully archived vendor ${id}`,
      }],
    };
  },
};
