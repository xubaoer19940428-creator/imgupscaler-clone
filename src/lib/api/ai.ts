import { get, post, type ApiError } from './request'
import type { AiRun } from './types'

export function createImageRun(operation: string, body: Record<string, unknown>, idempotencyKey: string, signal?: AbortSignal) {
  return post<AiRun>(`/ai/images/${encodeURIComponent(operation)}`, body, { signal, headers: { 'Idempotency-Key': idempotencyKey } })
}

export function getRun(runId: string, signal?: AbortSignal) {
  return get<AiRun>(`/ai/runs/${encodeURIComponent(runId)}`, { signal })
}

export function cancelRun(runId: string) {
  return post<AiRun>(`/ai/runs/${encodeURIComponent(runId)}/cancel`)
}
