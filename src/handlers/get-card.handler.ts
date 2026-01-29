import { spendClient } from "../clients/spend-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Card } from "./search-cards.handler.js";

/**
 * Get a single card by UUID from Bill.com Spend & Expense v3 API
 */
export async function getCard(uuid: string): Promise<ToolResponse<Card>> {
  try {
    const response = await spendClient.get<Card>(`cards/${uuid}`);

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
