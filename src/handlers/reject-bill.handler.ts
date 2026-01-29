import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

/**
 * Reject a bill in Bill.com
 */
export async function rejectBill(
  billId: string,
  reason?: string
): Promise<ToolResponse<boolean>> {
  try {
    const data: Record<string, unknown> = { objectId: billId };
    if (reason) {
      data.reason = reason;
    }

    await billcomClient.request<unknown>(
      'Deny/Bill',
      data
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
