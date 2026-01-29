import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Bill } from "../types/billcom-entities.js";
import { CreateBillLineItem } from "./create-bill.handler.js";

export interface UpdateBillParams {
  id: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  glPostingDate?: string;
  description?: string;
  poNumber?: string;
  billLineItems?: CreateBillLineItem[];
}

/**
 * Update an existing bill in Bill.com
 */
export async function updateBill(
  params: UpdateBillParams
): Promise<ToolResponse<Bill>> {
  try {
    const { id, ...updateFields } = params;
    const obj: Record<string, unknown> = {
      entity: 'Bill',
      id,
      ...updateFields,
    };

    const response = await billcomClient.request<Bill>(
      'Crud/Update/Bill',
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
