import { spendClient } from "../clients/spend-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Reimbursement } from "./search-reimbursements.handler.js";

export interface ReimbursementLineItem {
  amount: string;
  expenseDate: string;
  description?: string;
  chartOfAccountId?: string;
  departmentId?: string;
  locationId?: string;
}

export interface CreateReimbursementParams {
  userId: string;
  description?: string;
  reimbursementLineItems: ReimbursementLineItem[];
}

/**
 * Create a new reimbursement request in Bill.com Spend & Expense using v3 API
 */
export async function createReimbursement(
  params: CreateReimbursementParams
): Promise<ToolResponse<Reimbursement>> {
  try {
    const requestBody: Record<string, unknown> = {
      userId: params.userId,
      lineItems: params.reimbursementLineItems,  // v3 API may use 'lineItems' instead of 'reimbursementLineItems'
    };

    if (params.description) requestBody.description = params.description;

    const response = await spendClient.post<Reimbursement>('reimbursements', requestBody);

    // Map uuid to id for backwards compatibility
    const reimbursement = {
      ...response,
      id: response.uuid || response.id,
    };

    return {
      result: reimbursement,
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
