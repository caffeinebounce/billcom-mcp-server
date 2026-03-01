import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Document, BillcomResponse } from "../types/billcom-entities.js";

export interface UploadDocumentParams {
  filePath: string;
  fileName?: string;
}

/**
 * Upload a file as a Bill.com document.
 */
export async function uploadDocument(
  params: UploadDocumentParams
): Promise<ToolResponse<Document>> {
  try {
    const fileBuffer = await readFile(params.filePath);
    const resolvedFileName = params.fileName ?? basename(params.filePath);
    const { baseUrl, devKey, sessionId } = await billcomClient.getAuthContext();

    const formData = new FormData();
    formData.append("devKey", devKey);
    formData.append("sessionId", sessionId);
    formData.append("data", JSON.stringify({ fileName: resolvedFileName, isPublic: true }));
    formData.append("file", new Blob([fileBuffer]), resolvedFileName);

    const response = await fetch(`${baseUrl}/UploadAttachment.json`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bill.com API error: ${response.status} ${errorText}`);
    }

    const result =
      (await response.json()) as BillcomResponse<Document> & {
        response_data?: { error_message?: string; error_code?: string } | Document;
      };

    if (result.response_status !== 0) {
      let errorDetail = result.response_message;
      if (result.response_data && typeof result.response_data === "object") {
        const data = result.response_data as unknown as Record<string, unknown>;
        if (data.error_message) {
          errorDetail = `${errorDetail}: ${data.error_message}`;
        }
        if (data.error_code) {
          errorDetail = `[${data.error_code}] ${errorDetail}`;
        }
      }
      throw new Error(`Bill.com API error: ${errorDetail}`);
    }

    return {
      result: result.response_data as Document,
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
