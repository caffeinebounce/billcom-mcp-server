import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { VendorCredit } from "../types/billcom-entities.js";

/**
 * Archive a vendor credit in Bill.com
 */
export async function archiveVendorCredit(id: string): Promise<ToolResponse<VendorCredit>> {
  try {
    const obj = {
      entity: 'VendorCredit',
      id,
      isActive: '2',
    };

    const response = await billcomClient.request<VendorCredit>(
      'Crud/Update/VendorCredit',
      { obj }
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
