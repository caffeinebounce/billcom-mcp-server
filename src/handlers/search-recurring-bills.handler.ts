import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { RecurringBill, SearchFilter, SortOption } from "../types/billcom-entities.js";

interface SearchRecurringBillsParams {
  start?: number;
  max?: number;
  filters?: SearchFilter[];
  sort?: SortOption[];
  nested?: boolean;
}

/**
 * Search recurring bills in Bill.com
 */
export async function searchRecurringBills(
  params: SearchRecurringBillsParams = {}
): Promise<ToolResponse<RecurringBill[]>> {
  try {
    const requestData: Record<string, unknown> = {
      // Bill.com requires start parameter explicitly
      start: params.start ?? 0,
      max: params.max ?? 999,
    };

    if (params.start !== undefined) requestData.start = params.start;
    if (params.max !== undefined) requestData.max = params.max;
    if (params.nested !== undefined) requestData.nested = params.nested;
    if (params.filters && params.filters.length > 0) {
      requestData.filters = params.filters;
    }
    if (params.sort && params.sort.length > 0) {
      requestData.sort = params.sort;
    }

    const response = await billcomClient.request<RecurringBill[]>(
      'List/RecurringBill',
      requestData
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
