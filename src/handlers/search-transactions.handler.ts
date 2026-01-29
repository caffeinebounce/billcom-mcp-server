import { spendClient } from "../clients/spend-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

export interface Transaction {
  uuid: string;
  id?: string;  // Legacy field mapping
  isActive: string;
  cardId: string;
  amount: string;
  merchantName?: string;
  merchantCategory?: string;
  transactionDate: string;
  status: string;
  receiptStatus?: string;
  description?: string;
  chartOfAccountId?: string;
  departmentId?: string;
  locationId?: string;
  createdTime: string;
  updatedTime: string;
}

interface SearchTransactionsParams {
  cursor?: string;
  limit?: number;
  // v3 API uses query params for filtering
  cardId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  merchantName?: string;
}

/**
 * Search card transactions in Bill.com Spend & Expense using v3 API
 */
export async function searchTransactions(
  params: SearchTransactionsParams = {}
): Promise<ToolResponse<Transaction[]>> {
  try {
    // Build query params for v3 API
    const queryParams: Record<string, string | number | undefined> = {};
    
    if (params.cursor) queryParams.cursor = params.cursor;
    if (params.limit) queryParams.limit = params.limit;
    if (params.cardId) queryParams.cardId = params.cardId;
    if (params.status) queryParams.status = params.status;
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;
    if (params.merchantName) queryParams.merchantName = params.merchantName;

    const response = await spendClient.get<Transaction[]>('transactions', queryParams);

    // Map uuid to id for backwards compatibility
    const transactions = (response || []).map(t => ({
      ...t,
      id: t.uuid || t.id,
    }));

    return {
      result: transactions,
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
