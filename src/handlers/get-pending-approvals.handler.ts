import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Bill, SearchFilter } from "../types/billcom-entities.js";

interface GetPendingApprovalsParams {
  start?: number;
  max?: number;
}

interface PendingApprovalItem {
  id: string;
  entity: string;
  vendorId: string;
  vendorName?: string;
  amount: number;
  dueDate: string;
  invoiceNumber?: string;
  approvalStatus: string;
  createdTime: string;
}

/**
 * Get bills pending approval from Bill.com
 * 
 * Note: The v2 API doesn't have a dedicated "List/Approval" endpoint.
 * This queries bills with approvalStatus = '1' (Pending) as a workaround.
 * For full approval workflow features, consider using the v3 API.
 */
export async function getPendingApprovals(
  params: GetPendingApprovalsParams = {}
): Promise<ToolResponse<PendingApprovalItem[]>> {
  try {
    const requestData: Record<string, unknown> = {
      start: params.start ?? 0,
      max: params.max ?? 999,
    };

    // Filter for bills with pending approval status
    // approvalStatus: 0 = Unassigned, 1 = Pending, 3 = Approved, 4 = Denied
    const filters: SearchFilter[] = [
      { field: 'approvalStatus', op: '=', value: '1' }  // Pending
    ];

    requestData.filters = filters;

    const response = await billcomClient.request<Bill[]>(
      'List/Bill',
      requestData
    );

    // Transform to simplified approval items
    const pendingItems: PendingApprovalItem[] = response.map(bill => ({
      id: bill.id,
      entity: 'Bill',
      vendorId: bill.vendorId,
      amount: parseFloat(bill.amount?.toString() || '0'),
      dueDate: bill.dueDate,
      invoiceNumber: bill.invoiceNumber,
      approvalStatus: 'Pending',
      createdTime: bill.createdTime,
    }));

    return {
      result: pendingItems,
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
