import type { Metadata } from 'next'
import App from '../src/App'

export const metadata: Metadata = { title: 'AI Image Upscaler — Img.Upscaler', description: 'Upscale and enhance images with AI online.' }

export default function Page() {
  return <App />
}
