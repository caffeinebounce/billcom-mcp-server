import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

/**
 * Approve a bill in Bill.com
 */
export async function approveBill(billId: string): Promise<ToolResponse<boolean>> {
  try {
    await billcomClient.request<unknown>(
      'Approve/Bill',
      { objectId: billId }
    );

    return {
      result: true,
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
