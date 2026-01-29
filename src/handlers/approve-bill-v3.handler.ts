import { billcomV3Client } from "../clients/billcom-v3-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { V3ApprovalActionResult } from "../types/billcom-entities.js";

interface ApproveBillV3Params {
  billId: string;
  comment?: string;
}

/**
 * Approve a bill using v3 API
 * 
 * Uses the v3 bill-approvals/actions endpoint for approval workflow.
 */
export async function approveBillV3(
  params: ApproveBillV3Params
): Promise<ToolResponse<V3ApprovalActionResult>> {
  try {
    const requestBody: Record<string, unknown> = {
      billId: params.billId,
      action: 'approve',
    };

    if (params.comment) {
      requestBody.comment = params.comment;
    }

    const response = await billcomV3Client.post<V3ApprovalActionResult>(
      '/bill-approvals/actions',
      requestBody
    );

    return {
      result: response ?? { billId: params.billId, action: 'approve', success: true },
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
