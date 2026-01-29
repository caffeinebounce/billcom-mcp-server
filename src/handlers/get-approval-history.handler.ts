import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Approval, SearchFilter } from "../types/billcom-entities.js";

/**
 * Get approval history for a specific object (bill, vendor credit, etc.)
 */
export async function getApprovalHistory(
  objectId: string,
  objectType: string
): Promise<ToolResponse<Approval[]>> {
  try {
    const filters: SearchFilter[] = [
      { field: 'objectId', op: 'eq', value: objectId },
      { field: 'objectType', op: 'eq', value: objectType },
    ];

    const response = await billcomClient.request<Approval[]>(
      'List/Approval',
      {
        filters,
        sort: [{ field: 'createdTime', asc: false }],
      }
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
