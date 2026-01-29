import { spendClient } from "../clients/spend-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

export interface Budget {
  uuid: string;
  id?: string;  // Legacy field mapping
  isActive: string;
  name: string;
  description?: string;
  amount: string;
  spent: string;
  remaining: string;
  startDate: string;
  endDate: string;
  budgetType: string;
  createdTime: string;
  updatedTime: string;
}

interface SearchBudgetsParams {
  cursor?: string;
  limit?: number;
  // v3 API uses query params for filtering instead of nested filter objects
  name?: string;
  isActive?: boolean;
  budgetType?: string;
}

/**
 * Search budgets in Bill.com Spend & Expense using v3 API
 */
export async function searchBudgets(
  params: SearchBudgetsParams = {}
): Promise<ToolResponse<Budget[]>> {
  try {
    // Build query params for v3 API
    const queryParams: Record<string, string | number | undefined> = {};
    
    if (params.cursor) queryParams.cursor = params.cursor;
    if (params.limit) queryParams.limit = params.limit;
    if (params.name) queryParams.name = params.name;
    if (params.isActive !== undefined) queryParams.isActive = params.isActive ? 'true' : 'false';
    if (params.budgetType) queryParams.budgetType = params.budgetType;

    const response = await spendClient.get<Budget[]>('budgets', queryParams);

    // Map uuid to id for backwards compatibility
    const budgets = (response || []).map(b => ({
      ...b,
      id: b.uuid || b.id,
    }));

    return {
      result: budgets,
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
