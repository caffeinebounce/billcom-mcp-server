import { spendClient } from "../clients/spend-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Budget } from "./search-budgets.handler.js";

export interface CreateBudgetParams {
  name: string;
  amount: string;
  startDate: string;
  endDate: string;
  budgetType?: string;
  description?: string;
  departmentId?: string;
  locationId?: string;
  chartOfAccountId?: string;
}

/**
 * Create a new budget in Bill.com Spend & Expense using v3 API
 */
export async function createBudget(
  params: CreateBudgetParams
): Promise<ToolResponse<Budget>> {
  try {
    const requestBody: Record<string, unknown> = {
      name: params.name,
      amount: params.amount,
      startDate: params.startDate,
      endDate: params.endDate,
    };

    if (params.budgetType) requestBody.budgetType = params.budgetType;
    if (params.description) requestBody.description = params.description;
    if (params.departmentId) requestBody.departmentId = params.departmentId;
    if (params.locationId) requestBody.locationId = params.locationId;
    if (params.chartOfAccountId) requestBody.chartOfAccountId = params.chartOfAccountId;

    const response = await spendClient.post<Budget>('budgets', requestBody);

    // Map uuid to id for backwards compatibility
    const budget = {
      ...response,
      id: response.uuid || response.id,
    };

    return {
      result: budget,
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
