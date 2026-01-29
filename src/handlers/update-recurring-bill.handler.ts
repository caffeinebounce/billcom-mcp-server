import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { RecurringBill } from "../types/billcom-entities.js";
import { RecurringBillLineItem } from "./create-recurring-bill.handler.js";

export interface UpdateRecurringBillParams {
  id: string;
  timePeriod?: string;
  frequencyPerTimePeriod?: string;
  nextDueDate?: string;
  endDate?: string;
  daysInAdvance?: string;
  description?: string;
  recurringBillLineItems?: RecurringBillLineItem[];
}

/**
 * Update an existing recurring bill in Bill.com
 */
export async function updateRecurringBill(
  params: UpdateRecurringBillParams
): Promise<ToolResponse<RecurringBill>> {
  try {
    const { id, ...updateFields } = params;
    const obj: Record<string, unknown> = {
      entity: 'RecurringBill',
      id,
      ...updateFields,
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
