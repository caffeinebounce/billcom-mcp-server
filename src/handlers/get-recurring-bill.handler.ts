import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { RecurringBill } from "../types/billcom-entities.js";

/**
 * Get a single recurring bill by ID from Bill.com
 */
export async function getRecurringBill(id: string): Promise<ToolResponse<RecurringBill>> {
  try {
    const response = await billcomClient.request<RecurringBill>(
      'Crud/Read/RecurringBill',
      { id }
    );

    return {
      result: response,
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
