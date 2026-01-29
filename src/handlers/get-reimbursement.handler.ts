import { spendClient } from "../clients/spend-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Reimbursement } from "./search-reimbursements.handler.js";

/**
 * Get a single reimbursement by UUID from Bill.com Spend & Expense v3 API
 */
export async function getReimbursement(uuid: string): Promise<ToolResponse<Reimbursement>> {
  try {
    const response = await spendClient.get<Reimbursement>(`reimbursements/${uuid}`);

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
