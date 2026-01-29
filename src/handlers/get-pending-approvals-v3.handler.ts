import { billcomV3Client } from "../clients/billcom-v3-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { V3PendingUserApproval } from "../types/billcom-entities.js";

interface GetPendingApprovalsV3Params {
  page?: number;
  pageSize?: number;
}

/**
 * Get bills pending the current user's approval using v3 API
 * 
 * This is the preferred method as it uses the dedicated v3 endpoint
 * that returns only bills awaiting the authenticated user's approval.
 */
export async function getPendingApprovalsV3(
  params: GetPendingApprovalsV3Params = {}
): Promise<ToolResponse<V3PendingUserApproval[]>> {
  try {
    const queryParams: Record<string, string | number | undefined> = {};
    
    if (params.page !== undefined) {
      queryParams.page = params.page;
    }
    if (params.pageSize !== undefined) {
      queryParams.pageSize = params.pageSize;
    }

    const response = await billcomV3Client.get<V3PendingUserApproval[]>(
      '/bill-approvals/pending-user-approvals',
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
