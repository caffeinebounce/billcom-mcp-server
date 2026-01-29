import { billcomV3Client } from "../clients/billcom-v3-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { V3ApprovalPolicy } from "../types/billcom-entities.js";

interface GetApprovalPoliciesV3Params {
  page?: number;
  pageSize?: number;
  activeOnly?: boolean;
}

/**
 * Get approval policies using v3 API
 * 
 * Returns full policy details including rules and approvers.
 */
export async function getApprovalPoliciesV3(
  params: GetApprovalPoliciesV3Params = {}
): Promise<ToolResponse<V3ApprovalPolicy[]>> {
  try {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    
    if (params.page !== undefined) {
      queryParams.page = params.page;
    }
    if (params.pageSize !== undefined) {
      queryParams.pageSize = params.pageSize;
    }
    if (params.activeOnly !== undefined) {
      queryParams.isActive = params.activeOnly;
    }

    const response = await billcomV3Client.get<V3ApprovalPolicy[]>(
      '/bill-approvals',
      queryParams
    );

    return {
      result: response ?? [],
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
