import JSZip from 'jszip'
import type { FileItem } from '@/src/lib/types'

export function itemName(item: FileItem) {
  const extension = item.resultFormat ?? 'webp'
  return `imgupscaler-${item.file.name.replace(/\.[^.]+$/, '')}.${extension}`
}

export function downloadUrl(url: string, name: string) {
  // A temporary anchor keeps downloads fully client-side and avoids a server upload.
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export async function downloadZip(items: FileItem[]) {
  // ZIP is used for multi-select so browsers do not block a burst of download clicks.
  const zip = new JSZip()
  await Promise.all(items.map(async (item) => zip.file(itemName(item), await (await fetch(item.resultUrl as string)).blob())))
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
  const url = URL.createObjectURL(blob)
  downloadUrl(url, 'imgupscaler-results.zip')
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
