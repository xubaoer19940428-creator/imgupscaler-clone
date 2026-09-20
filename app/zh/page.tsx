import type { Metadata } from 'next'
import App from '../../src/App'

export const metadata: Metadata = { title: 'AI 图片放大工具 — Img.Upscaler', description: '使用 AI 在线放大图片、增强细节并下载更清晰的高分辨率结果。' }

export default function ZhHomePage() {
  return <App />
}
