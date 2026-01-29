import { spendClient } from "../clients/spend-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Reimbursement } from "./search-reimbursements.handler.js";

/**
 * Approve a reimbursement request in Bill.com Spend & Expense using v3 API
 */
export async function approveReimbursement(uuid: string): Promise<ToolResponse<Reimbursement | boolean>> {
  try {
    // v3 API uses POST /reimbursements/{uuid}/approve endpoint
    const response = await spendClient.post<Reimbursement>(`reimbursements/${uuid}/approve`);

    // Map uuid to id for backwards compatibility if we get a reimbursement back
    if (response && typeof response === 'object' && 'uuid' in response) {
      const reimbursement = {
        ...response,
        id: response.uuid || response.id,
      };
      return {
        result: reimbursement,
        isError: false,
        error: null,
      };
    }

    // Some APIs just return success
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
