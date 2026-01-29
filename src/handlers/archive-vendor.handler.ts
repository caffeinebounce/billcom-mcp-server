import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Vendor } from "../types/billcom-entities.js";

/**
 * Archive (deactivate) a vendor in Bill.com
 * Bill.com doesn't delete vendors, it archives them by setting isActive to '2'
 */
export async function archiveVendor(id: string): Promise<ToolResponse<Vendor>> {
  try {
    const obj = {
      entity: 'Vendor',
      id,
      isActive: '2', // '1' = active, '2' = inactive/archived
    };

    const response = await billcomClient.request<Vendor>(
      'Crud/Update/Vendor',
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
