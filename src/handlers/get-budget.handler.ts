import { spendClient } from "../clients/spend-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Budget } from "./search-budgets.handler.js";

/**
 * Get a single budget by UUID from Bill.com Spend & Expense v3 API
 */
export async function getBudget(uuid: string): Promise<ToolResponse<Budget>> {
  try {
    const response = await spendClient.get<Budget>(`budgets/${uuid}`);

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
