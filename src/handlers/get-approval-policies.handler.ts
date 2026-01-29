import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

export interface ApprovalPolicy {
  id: string;
  isActive: string;
  name: string;
  description?: string;
  approvalType: string;
  createdTime: string;
  updatedTime: string;
}

/**
 * Get approval policies from Bill.com
 */
export async function getApprovalPolicies(): Promise<ToolResponse<ApprovalPolicy[]>> {
  try {
    const response = await billcomClient.request<ApprovalPolicy[]>(
      'List/ApprovalPolicy',
      {
        start: 0,
        max: 999
      }
    );

    return {
      result: response,
      isError: false,
      error: null,
    };
  } catch (error) {
    return {
      result: null,
      isError: true,
      error: formatError(error),
    };
  }
}
