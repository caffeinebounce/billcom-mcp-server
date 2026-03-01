import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

export interface UploadAndAttachDocumentParams {
  filePath: string;
  billId: string;
  fileName?: string;
}

export interface UploadDocumentResult {
  documentUploadedId: string;
}

/**
 * Upload a file and attach it directly to a Bill.com bill.
 */
export async function uploadAndAttachDocument(
  params: UploadAndAttachDocumentParams
): Promise<ToolResponse<UploadDocumentResult>> {
  try {
    const fileBuffer = await readFile(params.filePath);
    const resolvedFileName = params.fileName ?? basename(params.filePath);
    const { baseUrl, devKey, sessionId } = await billcomClient.getAuthContext();

    const formData = new FormData();
    formData.append("devKey", devKey);
    formData.append("sessionId", sessionId);
    formData.append(
      "data",
      JSON.stringify({
        fileName: resolvedFileName,
        isPublic: true,
        objectId: params.billId,
      })
    );
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
      (await response.json()) as {
        response_status: number;
        response_message: string;
        response_data:
          | { documentUploadedId: string }
          | { error_message?: string; error_code?: string };
      };

    if (result.response_status !== 0) {
      let errorDetail = result.response_message;
      if (result.response_data && typeof result.response_data === "object") {
        const data = result.response_data as Record<string, unknown>;
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
      result: result.response_data as UploadDocumentResult,
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
