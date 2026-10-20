export type ApiEnvelope<T> = { code?: number; message?: string; data?: T }

export type UploadTicket = { url: string; cdn_url: string; key?: string }

export type FileRecord = {
  id?: number
  file_name: string
  file_url: string
  file_size?: number
  mime_type?: string
  file_type?: string
  purpose?: string
}

export type RunItem = { type?: string; url?: string; file_name?: string; mime_type?: string }

export type AiRun = {
  run_id: string
  status: 'queued' | 'running' | 'waiting_external' | 'completed' | 'failed' | 'cancelled' | string
  result?: { items?: RunItem[]; meta?: Record<string, unknown> } | null
  error?: { message?: string; code?: string | number } | null
  [key: string]: unknown
}
