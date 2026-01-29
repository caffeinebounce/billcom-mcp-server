import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Vendor } from "../types/billcom-entities.js";

/**
 * Get a single vendor by ID from Bill.com
 */
export async function getVendor(id: string): Promise<ToolResponse<Vendor>> {
  try {
    const response = await billcomClient.request<Vendor>(
      'Crud/Read/Vendor',
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
