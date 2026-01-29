import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { RecurringBill } from "../types/billcom-entities.js";

export interface RecurringBillLineItem {
  amount: string;
  chartOfAccountId?: string;
  departmentId?: string;
  locationId?: string;
  description?: string;
}

export interface CreateRecurringBillParams {
  vendorId: string;
  timePeriod: string;  // '0' = None, '1' = Day, '2' = Week, '3' = Month, '4' = Year
  frequencyPerTimePeriod: string;
  nextDueDate: string;
  endDate?: string;
  daysInAdvance?: string;
  description?: string;
  recurringBillLineItems?: RecurringBillLineItem[];
}

/**
 * Create a new recurring bill in Bill.com
 */
export async function createRecurringBill(
  params: CreateRecurringBillParams
): Promise<ToolResponse<RecurringBill>> {
  try {
    const obj: Record<string, unknown> = {
      entity: 'RecurringBill',
      vendorId: params.vendorId,
      timePeriod: params.timePeriod,
      frequencyPerTimePeriod: params.frequencyPerTimePeriod,
      nextDueDate: params.nextDueDate,
    };

    if (params.endDate) obj.endDate = params.endDate;
    if (params.daysInAdvance) obj.daysInAdvance = params.daysInAdvance;
    if (params.description) obj.description = params.description;
    if (params.recurringBillLineItems) {
      obj.recurringBillLineItems = params.recurringBillLineItems;
    }

    const response = await billcomClient.request<RecurringBill>(
      'Crud/Create/RecurringBill',
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
