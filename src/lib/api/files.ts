import { ApiError, get, post } from "@/src/lib/api/request";
import type { FileRecord, Paged, UploadTicket } from "@/src/lib/api/types";
import {
  page as normalizePage,
  pageSize as normalizePageSize,
} from "@/src/lib/api/pagination";

export type FileListParams = {
  page?: number;
  pageSize?: number;
  fileType?: string;
  purpose?: string;
  sourceType?: string;
  sourceId?: number;
};

/** 按条件分页获取当前用户的文件。 */
export const listFiles = (params: FileListParams = {}) =>
  get<Paged<FileRecord>>("/files", {
    page: normalizePage(params.page),
    page_size: normalizePageSize(params.pageSize, 50),
    ...(params.fileType ? { file_type: params.fileType } : {}),
    ...(params.purpose ? { purpose: params.purpose } : {}),
    ...(params.sourceType ? { source_type: params.sourceType } : {}),
    ...(params.sourceId !== undefined ? { source_id: params.sourceId } : {}),
  });

/** 根据文件 ID 获取文件详情。 */
export const fileDetail = (id: number) =>
  get<FileRecord>(
    "/files/detail",
    { id },
  );

/** 创建文件记录，通常在上传到对象存储后调用。 */
export const createFile = (record: {
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  file_type?: string;
  purpose?: string;
  source_type?: string;
  source_id?: number;
}) =>
  post<FileRecord>(
    "/files",
    record,
  );

/** 更新已有文件记录。 */
export const updateFile = (body: Record<string, unknown>) =>
  post<FileRecord>(
    "/files/update",
    body,
  );

/** 删除单个文件记录。 */
export const deleteFile = (id: number) =>
  post<Record<string, never>>(
    "/files/delete",
    { id },
  );

/** 批量删除文件记录。 */
export const batchDeleteFiles = (ids: number[]) =>
  post<{ deleted_count?: number }>(
    "/files/batch-delete",
    { ids },
  );

/** 删除某个来源下的全部文件记录。 */
export const deleteFilesBySource = (
  sourceType: string,
  sourceId: number,
) =>
  post<{ deleted_count?: number }>("/files/delete-by-source", {
    source_type: sourceType,
    source_id: sourceId,
  });

/** 获取指定来源的文件列表，接口返回对象中的 list 字段。 */
export const filesBySource = (
  sourceType: string,
  sourceId: number,
) =>
  get<{ list: FileRecord[] }>("/files/by-source", {
    source_type: sourceType,
    source_id: sourceId,
  });

/** 获取当前用户文件统计信息。 */
export const fileStats = () =>
  get<Record<string, unknown>>(
    "/files/stats",
  );

/** 获取对象存储上传凭证。 */
export const uploadTicket = (
  fileName: string,
  contentType: string,
  signal?: AbortSignal,
) =>
  post<UploadTicket>("/get-upload-url", {
    file_name: fileName,
    content_type: contentType,
  }, { signal });

/** 使用上传凭证将浏览器中的文件上传到对象存储。 */
export async function uploadToTicket(
  ticket: UploadTicket,
  file: File,
  signal?: AbortSignal,
) {
  await putUpload(ticket.url, file, signal);
  return ticket.cdn_url;
}

/** 执行上传凭证对应的 PUT 请求，不经过 API 签名层。 */
async function putUpload(url: string, file: File, signal?: AbortSignal) {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
    signal,
  });

  if (!response.ok) {
    throw new ApiError(`upload_failed_${response.status}`, response.status, response.status);
  }
}

/** 预签名上传、文件登记和 URL 返回的统一流程。 */
export async function uploadInputFile(file: File, signal?: AbortSignal) {
  const ticket = await uploadTicket(file.name, file.type, signal);
  const fileUrl = await uploadToTicket(ticket, file, signal);

  await createFile({
    file_name: file.name,
    file_url: fileUrl,
    file_size: file.size,
    mime_type: file.type,
    file_type: "image",
    purpose: "ai_input",
  });

  return fileUrl;
}
