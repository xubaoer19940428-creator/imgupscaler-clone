import axios from 'axios'
import { post } from './request'
import type { FileRecord, UploadTicket } from './types'

export function uploadTicket(fileName: string, contentType: string, signal?: AbortSignal) {
  return post<UploadTicket>('/get-upload-url', { file_name: fileName, content_type: contentType }, { signal })
}

export async function uploadToTicket(ticket: UploadTicket, file: File, signal?: AbortSignal) {
  try {
    await axios.put(ticket.url, file, { headers: { 'Content-Type': file.type }, signal })
    return ticket.cdn_url
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined
    throw new Error(`图片上传失败${status ? ` (${status})` : ''}`)
  }
}

export function createFile(record: Omit<FileRecord, 'id'>, signal?: AbortSignal) {
  return post<FileRecord>('/files', record, { signal })
}

export async function uploadInputFile(file: File, signal?: AbortSignal) {
  const ticket = await uploadTicket(file.name, file.type, signal)
  const fileUrl = await uploadToTicket(ticket, file, signal)
  await createFile({ file_name: file.name, file_url: fileUrl, file_size: file.size, mime_type: file.type, file_type: 'image', purpose: 'ai_input' }, signal)
  return fileUrl
}
