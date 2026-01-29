import { spendClient } from "../clients/spend-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Transaction } from "./search-transactions.handler.js";

/**
 * Get a single transaction by UUID from Bill.com Spend & Expense v3 API
 */
export async function getTransaction(uuid: string): Promise<ToolResponse<Transaction>> {
  try {
    const response = await spendClient.get<Transaction>(`transactions/${uuid}`);

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
