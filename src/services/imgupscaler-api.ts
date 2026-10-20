import type { Route } from '@/src/lib/types'

type ApiEnvelope<T> = { code?: number; message?: string; data?: T }
type Run = {
  run_id: string
  status: string
  result?: { items?: Array<{ url?: string; type?: string }> } | null
  error?: { message?: string; code?: string | number } | null
}

type UploadTicket = { url: string; cdn_url: string }

export type ImageApiRequest = {
  file: File
  route: Route
  scale: string
  prompt?: string
  creativity?: number
  similarity?: number
  signal?: AbortSignal
}

const terminalStatuses = new Set(['completed', 'failed', 'cancelled'])

function apiBaseUrl() {
  const raw = (process.env.NEXT_PUBLIC_ARTGURU_API_BASE_URL || process.env.NEXT_PUBLIC_IMGUPSCALER_API_BASE_URL || '').trim().replace(/\/+$/, '')
  if (!raw) return ''
  return /\/v1$/i.test(raw) ? raw : `${raw}/v1`
}

function authToken() {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_IMGUPSCALER_API_TOKEN || ''
  return window.localStorage.getItem('artguru-token') || window.localStorage.getItem('imgupscaler-token') || process.env.NEXT_PUBLIC_IMGUPSCALER_API_TOKEN || ''
}

export function isImgUpscalerApiEnabled() {
  const enabled = process.env.NEXT_PUBLIC_ARTGURU_API_ENABLED === 'true' || process.env.NEXT_PUBLIC_IMGUPSCALER_API_ENABLED === 'true'
  return enabled && Boolean(apiBaseUrl()) && Boolean(authToken())
}

async function request<T>(path: string, init: RequestInit = {}) {
  const token = authToken()
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  headers.set('Authorization', /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`)
  if (typeof window !== 'undefined') {
    headers.set('accept-domain', window.location.host)
    headers.set('lang', document.documentElement.lang || 'en')
    headers.set('accept-timezone', Intl.DateTimeFormat().resolvedOptions().timeZone)
  }
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  const response = await fetch(`${apiBaseUrl()}${path}`, { ...init, headers })
  const payload = await response.json().catch(() => ({})) as ApiEnvelope<T> | T
  if (!response.ok) {
    const envelope = payload as ApiEnvelope<T>
    throw new Error(envelope.message || `API request failed (${response.status})`)
  }
  if (payload && typeof payload === 'object' && 'code' in payload && typeof (payload as ApiEnvelope<T>).code === 'number' && (payload as ApiEnvelope<T>).code !== 0) {
    throw new Error((payload as ApiEnvelope<T>).message || 'API 请求失败')
  }
  if (payload && typeof payload === 'object' && 'data' in payload && (payload as ApiEnvelope<T>).data !== undefined) return (payload as ApiEnvelope<T>).data as T
  return payload as T
}

async function uploadFile(file: File, signal?: AbortSignal) {
  const ticket = await request<UploadTicket>('/get-upload-url', {
    method: 'POST',
    body: JSON.stringify({ file_name: file.name, content_type: file.type }),
    signal,
  })
  if (!ticket?.url || !ticket.cdn_url) throw new Error('上传凭证无效')
  const upload = await fetch(ticket.url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file, signal })
  if (!upload.ok) throw new Error(`图片上传失败 (${upload.status})`)
  await request('/files', {
    method: 'POST',
    body: JSON.stringify({ file_name: file.name, file_url: ticket.cdn_url, file_size: file.size, mime_type: file.type, file_type: 'image', purpose: 'ai_input' }),
    signal,
  })
  return ticket.cdn_url
}

function modelFor(route: Route) {
  if (route === 'enhancer') return process.env.NEXT_PUBLIC_IMGUPSCALER_ENHANCER_MODEL || 'openai/gpt-image-1'
  if (route === 'reimagine') return process.env.NEXT_PUBLIC_IMGUPSCALER_REIMAGINE_MODEL || 'openai/gpt-image-1'
  return process.env.NEXT_PUBLIC_IMGUPSCALER_UPSCALER_MODEL || 'openai/gpt-image-1'
}

function operationFor(route: Route) {
  if (route === 'reimagine') return process.env.NEXT_PUBLIC_IMGUPSCALER_REIMAGINE_OPERATION || 'transforms'
  if (route === 'enhancer') return process.env.NEXT_PUBLIC_IMGUPSCALER_ENHANCER_OPERATION || 'upscales'
  return process.env.NEXT_PUBLIC_IMGUPSCALER_UPSCALER_OPERATION || 'upscales'
}

function sizeFor(scale: string) {
  if (scale === '4') return '4096x4096'
  if (scale === '2') return '2048x2048'
  return '1024x1024'
}

export async function createImageResult(requestInput: ImageApiRequest) {
  const inputUrl = await uploadFile(requestInput.file, requestInput.signal)
  const body: Record<string, unknown> = {
    model: modelFor(requestInput.route),
    stream: false,
    input_references: [{ type: 'image_url', image_url: { url: inputUrl } }],
    size: sizeFor(requestInput.scale),
  }
  if (requestInput.prompt?.trim()) body.prompt = requestInput.prompt.trim()
  if (requestInput.route === 'reimagine') {
    body.creativity = requestInput.creativity
    body.similarity = requestInput.similarity
  }
  const run = await request<Run>(`/ai/images/${encodeURIComponent(operationFor(requestInput.route))}`, {
    method: 'POST',
    headers: { 'Idempotency-Key': `${requestInput.route}-${crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`}` },
    body: JSON.stringify(body),
    signal: requestInput.signal,
  })
  return pollImageRun(run.run_id, requestInput.signal)
}

export async function pollImageRun(runId: string, signal?: AbortSignal) {
  let run = await request<Run>(`/ai/runs/${encodeURIComponent(runId)}`, { signal })
  try {
    for (let attempt = 0; attempt < 120 && !terminalStatuses.has(run.status); attempt += 1) {
      await new Promise<void>((resolve, reject) => {
        const timer = window.setTimeout(resolve, 1000)
        signal?.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')) }, { once: true })
      })
      run = await request<Run>(`/ai/runs/${encodeURIComponent(runId)}`, { signal })
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      await request<Run>(`/ai/runs/${encodeURIComponent(runId)}/cancel`, { method: 'POST' }).catch(() => undefined)
    }
    throw error
  }
  if (run.status !== 'completed') throw new Error(run.error?.message || `任务${run.status}`)
  const resultUrl = run.result?.items?.find((item) => item.type === 'image' || item.url)?.url
  if (!resultUrl) throw new Error('API 未返回图片结果')
  return resultUrl
}

export async function cancelImageRun(runId: string) {
  return request<Run>(`/ai/runs/${encodeURIComponent(runId)}/cancel`, { method: 'POST' })
}
