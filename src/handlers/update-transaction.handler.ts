import { spendClient } from "../clients/spend-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Transaction } from "./search-transactions.handler.js";

export interface UpdateTransactionParams {
  uuid: string;  // v3 API uses uuid
  id?: string;   // Legacy support
  description?: string;
  chartOfAccountId?: string;
  departmentId?: string;
  locationId?: string;
  memo?: string;
}

/**
 * Update a transaction in Bill.com Spend & Expense using v3 API (e.g., categorize, add memo)
 */
export async function updateTransaction(
  params: UpdateTransactionParams
): Promise<ToolResponse<Transaction>> {
  try {
    // Support both uuid and id parameters
    const transactionUuid = params.uuid || params.id;
    if (!transactionUuid) {
      throw new Error("Transaction uuid is required");
    }

    const { uuid, id, ...updateFields } = params;
    const requestBody: Record<string, unknown> = {};

    // Only include fields that are provided
    if (updateFields.description !== undefined) requestBody.description = updateFields.description;
    if (updateFields.chartOfAccountId !== undefined) requestBody.chartOfAccountId = updateFields.chartOfAccountId;
    if (updateFields.departmentId !== undefined) requestBody.departmentId = updateFields.departmentId;
    if (updateFields.locationId !== undefined) requestBody.locationId = updateFields.locationId;
    if (updateFields.memo !== undefined) requestBody.memo = updateFields.memo;

    const response = await spendClient.patch<Transaction>(`transactions/${transactionUuid}`, requestBody);

    // Map uuid to id for backwards compatibility
    const transaction = {
      ...response,
      id: response.uuid || response.id,
    };

    return {
      result: transaction,
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
