import type { EditState, Route } from '@/src/lib/types'

export async function createDemoResult(file: File, scale: string, options: { tool: Route; creativity: number; similarity: number; prompt: string }) {
  // This Canvas path is deliberately a demo adapter. It validates the UI workflow only;
  // production inference should happen behind the server-side adapter in services/upscaler.ts.
  const sourceUrl = URL.createObjectURL(file)
  try {
    const image = await loadImage(sourceUrl)
    const requestedScale = Number(scale) || 2
    const longestSide = Math.max(image.naturalWidth, image.naturalHeight)
    const targetLongestSide = options.tool === 'enhancer' ? Math.min(requestedScale * 1024, 4096) : Math.min(longestSide * requestedScale, 4096)
    const factor = targetLongestSide / longestSide
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * factor))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * factor))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('当前浏览器不支持图像处理')
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    const creativityBoost = options.tool === 'reimagine' ? options.creativity / 100 : .04
    const similarityBoost = options.tool === 'reimagine' ? options.similarity / 100 : .06
    const promptBoost = options.prompt.trim() ? Math.min(options.prompt.trim().length / 100, 1) : 0
    context.filter = `contrast(${1 + creativityBoost * .12}) saturate(${1 + (similarityBoost + promptBoost * .2) * .14})`
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const blob = await canvasToBlob(canvas, 'image/webp', .94)
    return URL.createObjectURL(blob)
  } finally {
    URL.revokeObjectURL(sourceUrl)
  }
}

export async function applyEdit(sourceUrl: string, state: EditState) {
  // Editing stays local so format/crop controls remain usable before a real image service exists.
  const image = await loadImage(sourceUrl)
  const quarterTurn = ((state.rotation % 360) + 360) % 360
  const rotated = quarterTurn === 90 || quarterTurn === 270
  const naturalWidth = rotated ? image.naturalHeight : image.naturalWidth
  const naturalHeight = rotated ? image.naturalWidth : image.naturalHeight
  const cropRatio = state.crop === 'square' ? 1 : state.crop === '4:3' ? 4 / 3 : state.crop === '16:9' ? 16 / 9 : naturalWidth / naturalHeight
  const cropWidth = naturalWidth / naturalHeight > cropRatio ? Math.round(naturalHeight * cropRatio) : naturalWidth
  const cropHeight = naturalWidth / naturalHeight > cropRatio ? naturalHeight : Math.round(naturalWidth / cropRatio)
  const canvas = document.createElement('canvas')
  canvas.width = cropWidth
  canvas.height = cropHeight
  const context = canvas.getContext('2d')
  if (!context) throw new Error('当前浏览器不支持编辑')
  context.translate(canvas.width / 2, canvas.height / 2)
  context.rotate((quarterTurn * Math.PI) / 180)
  context.scale(state.flipX ? -1 : 1, state.flipY ? -1 : 1)
  context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2)
  const mime = state.format === 'png' ? 'image/png' : state.format === 'jpeg' ? 'image/jpeg' : 'image/webp'
  const blob = await canvasToBlob(canvas, mime, state.quality / 100)
  return URL.createObjectURL(blob)
}

function loadImage(sourceUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('无法读取这张图片'))
    image.src = sourceUrl
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('结果生成失败')), mime, quality))
}
