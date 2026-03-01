import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { billcomClient } from "../clients/billcom-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Document } from "../types/billcom-entities.js";

export interface UploadDocumentParams {
  filePath: string;
  fileName?: string;
  folderId?: string;
  description?: string;
  mimeType?: string;
}

/**
 * Upload a file as a Bill.com document.
 *
 * Assumption: Bill.com accepts UploadAttachment with base64 file content in data payload.
 */
export async function uploadDocument(
  params: UploadDocumentParams
): Promise<ToolResponse<Document>> {
  try {
    const fileBuffer = await readFile(params.filePath);
    const inferredFileName = params.fileName ?? basename(params.filePath);

    const response = await billcomClient.request<Document>(
      "UploadAttachment",
      {
        obj: {
          entity: "Document",
          fileName: inferredFileName,
          folderId: params.folderId,
          description: params.description,
          contentType: params.mimeType,
          fileData: fileBuffer.toString("base64"),
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
