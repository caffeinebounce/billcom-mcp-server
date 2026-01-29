import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Bill } from "../types/billcom-entities.js";

/**
 * Get a single bill by ID from Bill.com
 */
export async function getBill(id: string): Promise<ToolResponse<Bill>> {
  try {
    const response = await billcomClient.request<Bill>(
      'Crud/Read/Bill',
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
