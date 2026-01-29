import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

/**
 * Void a bill payment in Bill.com
 * Only payments that have not been processed can be voided
 */
export async function voidBillPayment(id: string): Promise<ToolResponse<boolean>> {
  try {
    await billcomClient.request<unknown>(
      'Void/SentPay',
      { sentPayId: id }
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
