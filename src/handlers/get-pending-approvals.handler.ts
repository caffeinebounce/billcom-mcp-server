import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Approval, SearchFilter, SortOption } from "../types/billcom-entities.js";

interface GetPendingApprovalsParams {
  objectType?: string;  // 'Bill', 'VendorCredit', etc.
  start?: number;
  max?: number;
}

/**
 * Get pending approvals from Bill.com
 * Returns items that are waiting for the current user's approval
 */
export async function getPendingApprovals(
  params: GetPendingApprovalsParams = {}
): Promise<ToolResponse<Approval[]>> {
  try {
    const requestData: Record<string, unknown> = {
      // Bill.com requires start parameter explicitly
      start: params.start ?? 0,
      max: params.max ?? 999,
    };

    // Filter for pending status
    const filters: SearchFilter[] = [
      { field: 'status', op: 'eq', value: '1' }  // '1' = pending
    ];

    if (params.objectType) {
      filters.push({ field: 'objectType', op: 'eq', value: params.objectType });
    }

    requestData.filters = filters;

    if (params.start !== undefined) requestData.start = params.start;
    if (params.max !== undefined) requestData.max = params.max;

    const response = await billcomClient.request<Approval[]>(
      'List/Approval',
      requestData
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
