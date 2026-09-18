export type UpscaleTool = 'upscaler' | 'enhancer' | 'reimagine'

export type UpscaleRequest = {
  file: File
  tool: UpscaleTool
  scale: string
  prompt?: string
  creativity?: number
  similarity?: number
}

export type UpscaleResult = {
  taskId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  resultUrl?: string
}

/**
 * Frontend-only adapter contract.
 * Replace this function with a fetch('/api/upscale', { method: 'POST', body: formData })
 * call when your own inference service is ready. Keep model credentials server-side.
 */
export async function submitUpscaleTask(_request: UpscaleRequest): Promise<UpscaleResult> {
  await new Promise((resolve) => window.setTimeout(resolve, 450))
  return { taskId: `demo-${Date.now()}`, status: 'queued' }
}

export async function pollUpscaleTask(taskId: string): Promise<UpscaleResult> {
  await new Promise((resolve) => window.setTimeout(resolve, 900))
  return { taskId, status: 'completed' }
}
