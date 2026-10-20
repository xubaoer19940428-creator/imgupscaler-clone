import type { Route } from '@/src/lib/types'
import { createImageRun, getRun, isApiEnabled, cancelRun, uploadInputFile } from '@/src/lib/api/client'

export type ImageApiRequest = { file: File; route: Route; scale: string; prompt?: string; creativity?: number; similarity?: number; signal?: AbortSignal }
const terminalStatuses = new Set(['completed', 'failed', 'cancelled'])

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
function sizeFor(scale: string) { return scale === '4' ? '4096x4096' : scale === '2' ? '2048x2048' : '1024x1024' }
function idempotencyKey(route: Route) { return `${route}-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`}` }

export function isImgUpscalerApiEnabled() { return isApiEnabled() }

export async function createImageResult(input: ImageApiRequest) {
  const inputUrl = await uploadInputFile(input.file, input.signal)
  const body: Record<string, unknown> = { model: modelFor(input.route), stream: false, input_references: [{ type: 'image_url', image_url: { url: inputUrl } }], size: sizeFor(input.scale) }
  if (input.prompt?.trim()) body.prompt = input.prompt.trim()
  if (input.route === 'reimagine') { body.creativity = input.creativity; body.similarity = input.similarity }
  const run = await createImageRun(operationFor(input.route), body, idempotencyKey(input.route), input.signal)
  return pollImageRun(run.run_id, input.signal)
}

export async function pollImageRun(runId: string, signal?: AbortSignal) {
  let run = await getRun(runId, signal)
  try {
    for (let attempt = 0; attempt < 60 && !terminalStatuses.has(run.status); attempt += 1) { await delay(2_000, signal); run = await getRun(runId, signal) }
  } catch (error) {
    if (isAbortError(error)) await cancelRun(runId).catch(() => undefined)
    throw error
  }
  if (run.status !== 'completed') throw new Error(run.error?.message || `任务${run.status}`)
  const resultUrl = run.result?.items?.find((item) => item.type === 'image' || item.url)?.url
  if (!resultUrl) throw new Error('API 未返回图片结果')
  return resultUrl
}

function delay(milliseconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'))
    const timer = window.setTimeout(resolve, milliseconds)
    signal?.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')) }, { once: true })
  })
}
function isAbortError(error: unknown) { return error instanceof DOMException && error.name === 'AbortError' }
