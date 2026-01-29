import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { VendorCredit } from "../types/billcom-entities.js";

export interface VendorCreditLineItem {
  amount: string;
  chartOfAccountId?: string;
  departmentId?: string;
  locationId?: string;
  description?: string;
}

export interface CreateVendorCreditParams {
  vendorId: string;
  creditDate: string;
  creditNumber?: string;
  description?: string;
  vendorCreditLineItems?: VendorCreditLineItem[];
}

/**
 * Create a new vendor credit in Bill.com
 */
export async function createVendorCredit(
  params: CreateVendorCreditParams
): Promise<ToolResponse<VendorCredit>> {
  try {
    const obj: Record<string, unknown> = {
      entity: 'VendorCredit',
      vendorId: params.vendorId,
      creditDate: params.creditDate,
    };

    if (params.creditNumber) obj.creditNumber = params.creditNumber;
    if (params.description) obj.description = params.description;
    if (params.vendorCreditLineItems) {
      obj.vendorCreditLineItems = params.vendorCreditLineItems;
    }

    const response = await billcomClient.request<VendorCredit>(
      'Crud/Create/VendorCredit',
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
