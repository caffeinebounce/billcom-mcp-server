import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

export interface AttachDocumentToBillParams {
  billId: string;
  documentId: string;
}

interface Attachment {
  id: string;
  entity: "Attachment";
  objectId: string;
  documentId: string;
}

/**
 * Attach an existing Bill.com document to a bill.
 */
export async function attachDocumentToBill(
  params: AttachDocumentToBillParams
): Promise<ToolResponse<Attachment>> {
  try {
    const response = await billcomClient.request<Attachment>(
      "Crud/Create/Attachment",
      {
        obj: {
          entity: "Attachment",
          objectId: params.billId,
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
