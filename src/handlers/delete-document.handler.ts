import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

interface DeleteDocumentResult {
  id: string;
}

/**
 * Delete a document in Bill.com.
 */
export async function deleteDocument(documentId: string): Promise<ToolResponse<DeleteDocumentResult>> {
  try {
    await billcomClient.request<unknown>("Crud/Delete/Document", { id: documentId });

    return {
      result: { id: documentId },
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
