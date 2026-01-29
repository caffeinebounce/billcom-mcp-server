import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { VendorCredit } from "../types/billcom-entities.js";
import { VendorCreditLineItem } from "./create-vendor-credit.handler.js";

export interface UpdateVendorCreditParams {
  id: string;
  creditDate?: string;
  creditNumber?: string;
  description?: string;
  vendorCreditLineItems?: VendorCreditLineItem[];
}

/**
 * Update an existing vendor credit in Bill.com
 */
export async function updateVendorCredit(
  params: UpdateVendorCreditParams
): Promise<ToolResponse<VendorCredit>> {
  try {
    const { id, ...updateFields } = params;
    const obj: Record<string, unknown> = {
      entity: 'VendorCredit',
      id,
      ...updateFields,
    };

    const response = await billcomClient.request<VendorCredit>(
      'Crud/Update/VendorCredit',
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
