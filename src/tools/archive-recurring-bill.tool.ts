import { archiveRecurringBill } from "../handlers/archive-recurring-bill.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "archive_recurring_bill";
const toolDescription = "Archive a recurring bill in Bill.com. This stops future bill generation.";

const toolSchema = z.object({
  id: z.string().describe("The recurring bill ID to archive"),
});

export const ArchiveRecurringBillTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { id } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await archiveRecurringBill(id);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error archiving recurring bill: ${response.error}`,
        }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: `Successfully archived recurring bill ${id}`,
      }],
    };
  },
};
