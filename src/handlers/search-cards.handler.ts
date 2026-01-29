import { spendClient } from "../clients/spend-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

export interface Card {
  uuid: string;
  id?: string;  // Legacy field mapping
  isActive: string;
  cardType: string;  // 'physical' or 'virtual'
  lastFour: string;
  status: string;
  cardholderName: string;
  userId?: string;
  spendLimit?: string;
  spendLimitPeriod?: string;
  budgetId?: string;
  expirationDate?: string;
  createdTime: string;
  updatedTime: string;
}

interface SearchCardsParams {
  cursor?: string;
  limit?: number;
  // v3 API uses query params for filtering
  cardType?: string;
  status?: string;
  userId?: string;
}

/**
 * Search cards in Bill.com Spend & Expense using v3 API
 */
export async function searchCards(
  params: SearchCardsParams = {}
): Promise<ToolResponse<Card[]>> {
  try {
    // Build query params for v3 API
    const queryParams: Record<string, string | number | undefined> = {};
    
    if (params.cursor) queryParams.cursor = params.cursor;
    if (params.limit) queryParams.limit = params.limit;
    if (params.cardType) queryParams.cardType = params.cardType;
    if (params.status) queryParams.status = params.status;
    if (params.userId) queryParams.userId = params.userId;

    const response = await spendClient.get<Card[]>('cards', queryParams);

    // Map uuid to id for backwards compatibility
    const cards = (response || []).map(c => ({
      ...c,
      id: c.uuid || c.id,
    }));

    return {
      result: cards,
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
