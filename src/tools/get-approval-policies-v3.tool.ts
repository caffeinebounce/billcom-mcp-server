import { getApprovalPoliciesV3 } from "../handlers/get-approval-policies-v3.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get_approval_policies_v3";
const toolDescription = `Get approval policies using Bill.com v3 API.

Returns full policy details including:
- Approval rules and conditions (e.g., amount thresholds)
- Approver assignments for each rule/step
- Multi-step approval workflow configuration

Use this for detailed approval policy information.`;

const toolSchema = z.object({
  page: z.number().optional().describe("Page number (0-indexed)"),
  pageSize: z.number().optional().describe("Number of results per page (default: 50)"),
  activeOnly: z.boolean().optional().describe("Filter to only active policies"),
});

export const GetApprovalPoliciesV3Tool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await getApprovalPoliciesV3(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting approval policies: ${response.error}`,
        }],
      };
    }

    const policies = response.result ?? [];
    
    if (policies.length === 0) {
      return {
        content: [{
          type: "text" as const,
          text: "No approval policies found.",
        }],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${policies.length} approval policy/policies:`,
        },
        ...policies.map((p) => ({
          type: "text" as const,
          text: JSON.stringify(p, null, 2),
        })),
      ],
    };
  },
};
