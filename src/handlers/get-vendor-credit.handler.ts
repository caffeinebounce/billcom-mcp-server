import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { VendorCredit } from "../types/billcom-entities.js";

/**
 * Get a single vendor credit by ID from Bill.com
 */
export async function getVendorCredit(id: string): Promise<ToolResponse<VendorCredit>> {
  try {
    const response = await billcomClient.request<VendorCredit>(
      'Crud/Read/VendorCredit',
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
