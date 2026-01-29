import { getApprovalPolicies } from "../handlers/get-approval-policies.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get_approval_policies";
const toolDescription = "Get all approval policies configured in Bill.com.";

const toolSchema = z.object({});

export const GetApprovalPoliciesTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async () => {
    const response = await getApprovalPolicies();

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting approval policies: ${response.error}`,
        }],
      };
    }

    const policies = response.result ?? [];
    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${policies.length} approval policy(ies):`,
        },
        ...policies.map((p) => ({
          type: "text" as const,
          text: JSON.stringify(p, null, 2),
        })),
      ],
    };
  },
};
