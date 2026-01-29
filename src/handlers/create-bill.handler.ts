import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Bill, BillLineItem } from "../types/billcom-entities.js";

export interface CreateBillLineItem {
  amount: string;
  chartOfAccountId?: string;
  departmentId?: string;
  locationId?: string;
  jobId?: string;
  customerId?: string;
  jobBillable?: string;
  description?: string;
  lineType?: string;
  itemId?: string;
  quantity?: string;
  unitPrice?: string;
  employeeId?: string;
}

export interface CreateBillParams {
  vendorId: string;
  invoiceNumber?: string;
  invoiceDate: string;
  dueDate: string;
  glPostingDate?: string;
  description?: string;
  poNumber?: string;
  billLineItems?: CreateBillLineItem[];
}

/**
 * Create a new bill in Bill.com
 */
export async function createBill(
  params: CreateBillParams
): Promise<ToolResponse<Bill>> {
  try {
    const obj: Record<string, unknown> = {
      entity: 'Bill',
      vendorId: params.vendorId,
      invoiceDate: params.invoiceDate,
      dueDate: params.dueDate,
    };

    if (params.invoiceNumber) obj.invoiceNumber = params.invoiceNumber;
    if (params.glPostingDate) obj.glPostingDate = params.glPostingDate;
    if (params.description) obj.description = params.description;
    if (params.poNumber) obj.poNumber = params.poNumber;
    if (params.billLineItems) obj.billLineItems = params.billLineItems;

    const response = await billcomClient.request<Bill>(
      'Crud/Create/Bill',
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
