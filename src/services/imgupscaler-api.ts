import type { Route } from '@/src/lib/types'
import {
  ApiError,
  cancelRun,
  createFile,
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

type ImageRouteConfig = {
  operation: AiMediaOperation
  model: string
}

const terminalStatuses = new Set(['completed', 'failed', 'cancelled'])

const ROUTE_CONFIG: Record<Exclude<Route, 'pricing'>, ImageRouteConfig> = {
  home: {
    operation: (process.env.NEXT_PUBLIC_IMGUPSCALER_UPSCALE_OPERATION as AiMediaOperation) || 'upscales',
    model: process.env.NEXT_PUBLIC_IMGUPSCALER_UPSCALE_MODEL || 'topazlabs/image-upscale',
  },
  enhancer: {
    operation: (process.env.NEXT_PUBLIC_IMGUPSCALER_ENHANCER_OPERATION as AiMediaOperation) || 'upscales',
    model: process.env.NEXT_PUBLIC_IMGUPSCALER_ENHANCER_MODEL || 'topazlabs/image-upscale',
  },
  reimagine: {
    operation: (process.env.NEXT_PUBLIC_IMGUPSCALER_REIMAGINE_OPERATION as AiMediaOperation) || 'generations',
    model: process.env.NEXT_PUBLIC_IMGUPSCALER_REIMAGINE_MODEL || 'google/nano-banana-2',
  },
}

/** 统一的图片处理编排：上传、登记、创建 Run、轮询和取消。根据功能路由调用对应的 upscales 或 generations 接口。 */
export async function createImageResult(input: ImageApiRequest) {
  const config = ROUTE_CONFIG[input.route]
  const inputUrl = await uploadInputFile(input.file, input.signal)
  const scaleNum = Number(input.scale) || 2
  const defaultPrompt = input.route === 'reimagine'
    ? 'Creative reimagine image'
    : input.route === 'enhancer'
      ? 'Enhance image quality, clarity and details'
      : 'Upscale image to high resolution'
  const prompt = input.prompt?.trim() || defaultPrompt

  const isUpscale = config.operation === 'upscales'

  const body: AiMediaRequest = isUpscale
    ? {
        model: config.model,
        prompt,
        scale: scaleNum,
        image_url: inputUrl,
        input_references: [{ type: 'image_url', image_url: { url: inputUrl } }],
      }
    : {
        model: config.model,
        prompt,
        resolution: resolutionFor(input.scale),
        aspect_ratio: 'match_input',
        output_format: 'jpeg',
        input_references: [{ type: 'image_url', image_url: { url: inputUrl } }],
        ...(input.route === 'reimagine' ? { creativity: input.creativity, similarity: input.similarity } : {}),
      }

  const run = await createImageRun(config.operation, body, idempotencyKey(input.route), input.signal)
  const resultUrl = await pollImageRun(run.run_id, input.signal)

  // Ensure generated result is recorded in the user's files
  createFile({
    file_name: `upscaled-${input.scale || '2'}x-${Date.now().toString().slice(-6)}.jpg`,
    file_url: resultUrl,
    file_type: 'image',
    purpose: 'ai_output',
    source_type: 'ai_run',
  }).catch(() => undefined)

  return resultUrl
}

export async function pollImageRun(runId: string, signal?: AbortSignal) {
  let run = await getRun(runId, signal)
  const deadline = Date.now() + 120_000
  let consecutiveErrors = 0
  while (Date.now() < deadline && !terminalStatuses.has(run.status)) {
    await delay(2_000, signal)
    try {
      run = await getRun(runId, signal)
      consecutiveErrors = 0
    } catch (error) {
      if (isAbortError(error)) {
        await cancelRun(runId).catch(() => undefined)
        throw new ApiError('run_cancelled', 499)
      }
      consecutiveErrors += 1
      if (consecutiveErrors >= 3) {
        throw error
      }
    }
  }
  if (!terminalStatuses.has(run.status)) {
    await cancelRun(runId).catch(() => undefined)
    throw new ApiError('run_timeout_cancelled', 408)
  }
  if (run.status !== 'completed') {
    const errorMsg = run.error?.message || `run_${run.status}`
    throw new ApiError(errorMsg, 500)
  }
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
