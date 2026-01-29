import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Bill } from "../types/billcom-entities.js";

/**
 * Archive (deactivate) a bill in Bill.com
 */
export async function archiveBill(id: string): Promise<ToolResponse<Bill>> {
  try {
    const obj = {
      entity: 'Bill',
      id,
      isActive: '2',
    };

    const response = await billcomClient.request<Bill>(
      'Crud/Update/Bill',
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
