import { spendClient } from "../clients/spend-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

export interface Reimbursement {
  uuid: string;
  id?: string;  // Legacy field mapping
  isActive: string;
  userId: string;
  amount: string;
  status: string;
  submittedDate: string;
  paidDate?: string;
  description?: string;
  chartOfAccountId?: string;
  departmentId?: string;
  locationId?: string;
  createdTime: string;
  updatedTime: string;
}

interface SearchReimbursementsParams {
  cursor?: string;
  limit?: number;
  // v3 API uses query params for filtering
  userId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Search reimbursement requests in Bill.com Spend & Expense using v3 API
 */
export async function searchReimbursements(
  params: SearchReimbursementsParams = {}
): Promise<ToolResponse<Reimbursement[]>> {
  try {
    // Build query params for v3 API
    const queryParams: Record<string, string | number | undefined> = {};
    
    if (params.cursor) queryParams.cursor = params.cursor;
    if (params.limit) queryParams.limit = params.limit;
    if (params.userId) queryParams.userId = params.userId;
    if (params.status) queryParams.status = params.status;
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;

    const response = await spendClient.get<Reimbursement[]>('reimbursements', queryParams);

    // Map uuid to id for backwards compatibility
    const reimbursements = (response || []).map(r => ({
      ...r,
      id: r.uuid || r.id,
    }));

    return {
      result: reimbursements,
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
