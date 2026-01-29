import { archiveBill } from "../handlers/archive-bill.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "archive_bill";
const toolDescription = "Archive (deactivate) a bill in Bill.com.";

const toolSchema = z.object({
  id: z.string().describe("The bill ID to archive"),
});

export const ArchiveBillTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { id } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await archiveBill(id);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error archiving bill: ${response.error}`,
        }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: `Successfully archived bill ${id}`,
      }],
    };
  },
};
