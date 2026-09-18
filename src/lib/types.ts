export type Route = 'home' | 'enhancer' | 'reimagine' | 'pricing'
export type ResultFormat = 'webp' | 'png' | 'jpeg'
export type CropPreset = 'original' | 'square' | '4:3' | '16:9'

export type FileItem = {
  id: string
  file: File
  url: string
  resultUrl?: string
  resultFormat?: ResultFormat
  status: 'ready' | 'processing' | 'done' | 'error'
  error?: string
}

export type EditState = {
  rotation: number
  flipX: boolean
  flipY: boolean
  crop: CropPreset
  format: ResultFormat
  quality: number
}

export type ToastMessage = { title: string; detail?: string }
