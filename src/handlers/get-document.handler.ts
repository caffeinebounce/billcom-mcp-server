import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Document } from "../types/billcom-entities.js";

/**
 * Get a single document by ID from Bill.com
 */
export async function getDocument(id: string): Promise<ToolResponse<Document>> {
  try {
    const response = await billcomClient.request<Document>(
      "Crud/Read/Document",
      { id }
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
