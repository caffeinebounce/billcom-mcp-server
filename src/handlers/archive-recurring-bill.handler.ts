import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { RecurringBill } from "../types/billcom-entities.js";

/**
 * Archive a recurring bill in Bill.com
 */
export async function archiveRecurringBill(id: string): Promise<ToolResponse<RecurringBill>> {
  try {
    const obj = {
      entity: 'RecurringBill',
      id,
      isActive: '2',
    };

    const response = await billcomClient.request<RecurringBill>(
      'Crud/Update/RecurringBill',
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
