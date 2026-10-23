import type { Route } from '@/src/lib/types'
import {
  ApiError,
  cancelRun,
  createImageRun,
  getRun,
  uploadInputFile,
} from '@/src/lib/api/client'
import type { AiMediaOperation, AiMediaRequest } from '@/src/lib/api/types'

export type ImageApiRequest = {
  file: File
  route: Exclude<Route, 'pricing'>
  scale: string
  prompt?: string
  creativity?: number
  similarity?: number
  signal?: AbortSignal
}

type ImageRouteConfig = { operation: AiMediaOperation; model: string | undefined }
const terminalStatuses = new Set(['completed', 'failed', 'cancelled'])
const routeConfig: Record<Exclude<Route, 'pricing'>, ImageRouteConfig> = {
  home: {
    operation: operationFromEnv(process.env.NEXT_PUBLIC_IMGUPSCALER_UPSCALE_OPERATION, 'upscales'),
    model: process.env.NEXT_PUBLIC_IMGUPSCALER_UPSCALE_MODEL || 'google/upscaler',
  },
  enhancer: {
    operation: operationFromEnv(process.env.NEXT_PUBLIC_IMGUPSCALER_ENHANCER_OPERATION, 'upscales'),
    model: process.env.NEXT_PUBLIC_IMGUPSCALER_ENHANCER_MODEL || 'topazlabs/image-upscale',
  },
  reimagine: {
    operation: operationFromEnv(process.env.NEXT_PUBLIC_IMGUPSCALER_REIMAGINE_OPERATION, 'generations'),
    model: process.env.NEXT_PUBLIC_IMGUPSCALER_REIMAGINE_MODEL || 'google/nano-banana-pro',
  },
}

const MEDIA_OPERATIONS: ReadonlySet<string> = new Set(['generations', 'variations', 'edits', 'upscales', 'transforms'])

function operationFromEnv(value: string | undefined, fallback: AiMediaOperation): AiMediaOperation {
  return value && MEDIA_OPERATIONS.has(value) ? value as AiMediaOperation : fallback
}

/** 统一的图片处理编排：上传、登记、创建 Run、轮询和取消。 */
export async function createImageResult(input: ImageApiRequest) {
  const config = routeConfig[input.route]
  const inputUrl = await uploadInputFile(input.file, input.signal)
  const scaleNum = Number(input.scale) || 2
  const body: AiMediaRequest = {
    model: config.model || 'google/upscaler',
    stream: false,
    n: 1,
    response_format: 'url',
    output_format: 'jpeg',
    input_references: [{ type: 'image_url', image_url: { url: inputUrl } }],
    image_url: inputUrl,
    scale: scaleNum,
    resolution: resolutionFor(input.scale),
  }
  if (input.prompt?.trim()) body.prompt = input.prompt.trim()
  if (input.route === 'reimagine') {
    body.creativity = input.creativity
    body.similarity = input.similarity
  }
  const run = await createImageRun(config.operation, body, idempotencyKey(input.route), input.signal)
  return pollImageRun(run.run_id, input.signal)
}

export async function pollImageRun(runId: string, signal?: AbortSignal) {
  let run = await getRun(runId, signal)
  const deadline = Date.now() + 120_000
  try {
    while (Date.now() < deadline && !terminalStatuses.has(run.status)) {
      await delay(2_000, signal)
      run = await getRun(runId, signal)
    }
  } catch (error) {
    if (isAbortError(error)) {
      await cancelRun(runId).catch(() => undefined)
      throw new ApiError('run_cancelled', 499)
    }
    throw error
  }
  if (!terminalStatuses.has(run.status)) {
    await cancelRun(runId).catch(() => undefined)
    throw new ApiError('run_timeout_cancelled', 408)
  }
  if (run.status !== 'completed') throw new ApiError(`run_${run.status}`, 500)
  const resultUrl = run.result?.items?.find((item) => item.type === 'image' || item.url)?.url
  if (!resultUrl) throw new ApiError('api_result_missing', 502)
  return resultUrl
}

function resolutionFor(scale: string): AiMediaRequest['resolution'] {
  return scale === '4' ? '4K' : scale === '2' ? '2K' : '1K'
}

function idempotencyKey(route: string) {
  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
  return `${route}-${uuid}`
}

function delay(milliseconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'))
    const timer = globalThis.setTimeout(resolve, milliseconds)
    signal?.addEventListener('abort', () => {
      globalThis.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }, { once: true })
  })
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}
