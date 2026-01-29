import { getReimbursement } from "../handlers/get-reimbursement.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get_reimbursement";
const toolDescription = "Get a reimbursement by UUID from Bill.com Spend & Expense v3 API.";

const toolSchema = z.object({
  uuid: z.string().describe("The reimbursement UUID to retrieve"),
});

export const GetReimbursementTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const { uuid } = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await getReimbursement(uuid);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting reimbursement: ${response.error}`,
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
