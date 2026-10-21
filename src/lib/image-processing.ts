import type { EditState } from '@/src/lib/types'

export async function applyEdit(sourceUrl: string, state: EditState) {
  // Result editing stays local; the original AI processing already completed through the API.
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
  if (!context) throw new Error('editor_unsupported')
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
    image.onerror = () => reject(new Error('image_read_failed'))
    image.src = sourceUrl
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('result_encode_failed')), mime, quality))
}
