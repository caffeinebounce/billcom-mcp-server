import { spendClient } from "../clients/spend-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Card } from "./search-cards.handler.js";

export interface CreateVirtualCardParams {
  cardholderName: string;
  userId?: string;
  spendLimit?: string;
  spendLimitPeriod?: string;  // 'transaction', 'daily', 'weekly', 'monthly', 'yearly', 'total'
  budgetId?: string;
  vendorId?: string;
  description?: string;
}

/**
 * Create a new virtual card in Bill.com Spend & Expense using v3 API
 */
export async function createVirtualCard(
  params: CreateVirtualCardParams
): Promise<ToolResponse<Card>> {
  try {
    const requestBody: Record<string, unknown> = {
      cardType: 'virtual',
      cardholderName: params.cardholderName,
    };

    if (params.userId) requestBody.userId = params.userId;
    if (params.spendLimit) requestBody.spendLimit = params.spendLimit;
    if (params.spendLimitPeriod) requestBody.spendLimitPeriod = params.spendLimitPeriod;
    if (params.budgetId) requestBody.budgetId = params.budgetId;
    if (params.vendorId) requestBody.vendorId = params.vendorId;
    if (params.description) requestBody.description = params.description;

    const response = await spendClient.post<Card>('cards', requestBody);

    // Map uuid to id for backwards compatibility
    const card = {
      ...response,
      id: response.uuid || response.id,
    };

    return {
      result: card,
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
