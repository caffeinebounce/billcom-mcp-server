import { archiveVendorCredit } from "../handlers/archive-vendor-credit.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "archive_vendor_credit";
const toolDescription = "Archive a vendor credit in Bill.com.";

const toolSchema = z.object({
  id: z.string().describe("The vendor credit ID to archive"),
});

export const ArchiveVendorCreditTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { id } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await archiveVendorCredit(id);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error archiving vendor credit: ${response.error}`,
        }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: `Successfully archived vendor credit ${id}`,
      }],
    };
  },
};
