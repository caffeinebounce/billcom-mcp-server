import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Document, SearchFilter, SortOption } from "../types/billcom-entities.js";

interface ListDocumentsParams {
  start?: number;
  max?: number;
  filters?: SearchFilter[];
  sort?: SortOption[];
}

/**
 * List documents in Bill.com
 */
export async function listDocuments(
  params: ListDocumentsParams = {}
): Promise<ToolResponse<Document[]>> {
  try {
    const requestData: Record<string, unknown> = {
      start: params.start ?? 0,
      max: params.max ?? 999,
    };

    if (params.start !== undefined) requestData.start = params.start;
    if (params.max !== undefined) requestData.max = params.max;
    if (params.filters && params.filters.length > 0) {
      requestData.filters = params.filters;
    }
    if (params.sort && params.sort.length > 0) {
      requestData.sort = params.sort;
    }

    const response = await billcomClient.request<Document[]>(
      "List/Document",
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
