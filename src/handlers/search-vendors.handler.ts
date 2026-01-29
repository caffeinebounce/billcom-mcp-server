import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Vendor, SearchFilter, SortOption } from "../types/billcom-entities.js";

interface ListVendorsResponse {
  Vendor: Vendor[];
}

interface SearchVendorsParams {
  start?: number;
  max?: number;
  filters?: SearchFilter[];
  sort?: SortOption[];
  nested?: boolean;
}

/**
 * Search vendors in Bill.com
 *
 * Supports filtering, pagination, and sorting via the List/Vendor endpoint
 */
export async function searchVendors(
  params: SearchVendorsParams = {}
): Promise<ToolResponse<Vendor[]>> {
  try {
    const requestData: Record<string, unknown> = {
      // Bill.com requires start parameter explicitly
      start: params.start ?? 0,
      max: params.max ?? 999,
    };

    // Include nested data (line items, etc.)
    if (params.nested !== undefined) {
      requestData.nested = params.nested;
    }

    // Filters
    if (params.filters && params.filters.length > 0) {
      requestData.filters = params.filters;
    }

    // Sorting
    if (params.sort && params.sort.length > 0) {
      requestData.sort = params.sort;
    }

    const response = await billcomClient.request<Vendor[]>(
      'List/Vendor',
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
