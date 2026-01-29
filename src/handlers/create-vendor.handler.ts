import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Vendor } from "../types/billcom-entities.js";

export interface CreateVendorParams {
  name: string;
  shortName?: string;
  nameOnCheck?: string;
  companyName?: string;
  accNumber?: string;
  taxId?: string;
  track1099?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  address4?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  addressCountry?: string;
  email?: string;
  phone?: string;
  fax?: string;
  payBy?: string;
  description?: string;
  contactFirstName?: string;
  contactLastName?: string;
}

/**
 * Create a new vendor in Bill.com
 */
export async function createVendor(
  params: CreateVendorParams
): Promise<ToolResponse<Vendor>> {
  try {
    const obj: Record<string, unknown> = {
      entity: 'Vendor',
      ...params,
    };

    const response = await billcomClient.request<Vendor>(
      'Crud/Create/Vendor',
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
