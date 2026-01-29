import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { BillPayment } from "../types/billcom-entities.js";

export interface BillPaymentItem {
  billId: string;
  amount: string;
}

export interface CreateBillPaymentParams {
  vendorId: string;
  processDate: string;
  chartOfAccountId: string;
  billPayments: BillPaymentItem[];
  description?: string;
  toPrintCheck?: string;
}

/**
 * Create a new bill payment in Bill.com
 * This creates a payment that applies to one or more bills
 */
export async function createBillPayment(
  params: CreateBillPaymentParams
): Promise<ToolResponse<BillPayment>> {
  try {
    const obj: Record<string, unknown> = {
      entity: 'SentPay',
      vendorId: params.vendorId,
      processDate: params.processDate,
      chartOfAccountId: params.chartOfAccountId,
      billPayments: params.billPayments,
    };

    if (params.description) obj.description = params.description;
    if (params.toPrintCheck) obj.toPrintCheck = params.toPrintCheck;

    const response = await billcomClient.request<BillPayment>(
      'Crud/Create/SentPay',
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
