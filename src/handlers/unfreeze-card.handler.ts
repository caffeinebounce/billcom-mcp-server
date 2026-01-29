import { spendClient } from "../clients/spend-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Card } from "./search-cards.handler.js";

/**
 * Unfreeze a card in Bill.com Spend & Expense using v3 API
 */
export async function unfreezeCard(uuid: string): Promise<ToolResponse<Card>> {
  try {
    // v3 API uses POST /cards/{uuid}/unfreeze endpoint
    const response = await spendClient.post<Card>(`cards/${uuid}/unfreeze`);

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
