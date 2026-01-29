import { spendClient } from "../clients/spend-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Budget } from "./search-budgets.handler.js";

export interface UpdateBudgetParams {
  uuid: string;  // v3 API uses uuid
  id?: string;   // Legacy support
  name?: string;
  amount?: string;
  startDate?: string;
  endDate?: string;
  budgetType?: string;
  description?: string;
  isActive?: string;
}

/**
 * Update an existing budget in Bill.com Spend & Expense using v3 API
 */
export async function updateBudget(
  params: UpdateBudgetParams
): Promise<ToolResponse<Budget>> {
  try {
    // Support both uuid and id parameters
    const budgetUuid = params.uuid || params.id;
    if (!budgetUuid) {
      throw new Error("Budget uuid is required");
    }

    const { uuid, id, ...updateFields } = params;
    const requestBody: Record<string, unknown> = {};

    // Only include fields that are provided
    if (updateFields.name !== undefined) requestBody.name = updateFields.name;
    if (updateFields.amount !== undefined) requestBody.amount = updateFields.amount;
    if (updateFields.startDate !== undefined) requestBody.startDate = updateFields.startDate;
    if (updateFields.endDate !== undefined) requestBody.endDate = updateFields.endDate;
    if (updateFields.budgetType !== undefined) requestBody.budgetType = updateFields.budgetType;
    if (updateFields.description !== undefined) requestBody.description = updateFields.description;
    if (updateFields.isActive !== undefined) requestBody.isActive = updateFields.isActive;

    const response = await spendClient.patch<Budget>(`budgets/${budgetUuid}`, requestBody);

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
