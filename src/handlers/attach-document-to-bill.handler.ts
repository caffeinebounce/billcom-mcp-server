import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Bill } from "../types/billcom-entities.js";

export interface AttachDocumentToBillParams {
  billId: string;
  documentId: string;
}

/**
 * Attach an existing Bill.com document to a bill.
 *
 * Assumption: Bill update accepts a `document` object and/or `documentId` field.
 */
export async function attachDocumentToBill(
  params: AttachDocumentToBillParams
): Promise<ToolResponse<Bill>> {
  try {
    const response = await billcomClient.request<Bill>(
      "Crud/Update/Bill",
      {
        obj: {
          entity: "Bill",
          id: params.billId,
          document: {
            entity: "Document",
            id: params.documentId,
          },
          documentId: params.documentId,
        },
      }
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
