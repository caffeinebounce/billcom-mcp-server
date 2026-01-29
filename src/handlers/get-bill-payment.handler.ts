import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { BillPayment } from "../types/billcom-entities.js";

/**
 * Get a single bill payment by ID from Bill.com
 */
export async function getBillPayment(id: string): Promise<ToolResponse<BillPayment>> {
  try {
    const response = await billcomClient.request<BillPayment>(
      'Crud/Read/SentPay',
      { id }
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
