'use client'

import { useEffect, useRef, useState } from 'react'
import { ACCEPTED_TYPES, MAX_FILE_BYTES, MAX_FILES } from '@/src/lib/constants'
import { downloadUrl, downloadZip, itemName } from '@/src/lib/downloads'
import { applyEdit, createDemoResult } from '@/src/lib/image-processing'
import type { EditState, FileItem, Route, ToastMessage } from '@/src/lib/types'
import { useWorkspaceStore } from '@/src/stores/workspace-store'

const defaultEditState: EditState = { rotation: 0, flipX: false, flipY: false, crop: 'original', format: 'webp', quality: 94 }

export function useWorkspaceController(route: Route) {
  const store = useWorkspaceStore()
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [dragging, setDragging] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editState, setEditState] = useState(defaultEditState)
  const inputRef = useRef<HTMLInputElement>(null)
  const itemsRef = useRef<FileItem[]>([])
  const runRef = useRef(0)
  const mountedRef = useRef(true)

  // Keep the latest list outside async handlers so unmount cleanup can revoke every object URL.
  useEffect(() => { itemsRef.current = store.items }, [store.items])
  useEffect(() => { store.resetForRoute(route) }, [route, store.resetForRoute])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3600)
    return () => window.clearTimeout(timer)
  }, [toast])
  useEffect(() => () => {
    mountedRef.current = false
    runRef.current += 1
    itemsRef.current.forEach(revokeItem)
  }, [])

  const addFiles = (incoming: FileList | File[]) => {
    if (store.processing) return setToast({ title: '当前任务仍在处理', detail: '请等待完成或先取消任务' })
    const acceptedTypes = new Set<string>(ACCEPTED_TYPES)
    const accepted = Array.from(incoming).filter((file) => acceptedTypes.has(file.type) && file.size <= MAX_FILE_BYTES)
    if (!accepted.length) return setToast({ title: '没有可加入的图片', detail: '支持 JPG、PNG、WebP、AVIF，且单张不超过 20 MB' })
    const selected = accepted.slice(0, Math.max(0, MAX_FILES - store.items.length))
    // Object URLs avoid copying image bytes into React state. They are revoked on remove,
    // replace, clear and unmount in order to prevent long-lived browser memory leaks.
    const next = selected.map<FileItem>((file) => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file), status: 'ready' }))
    store.setItems((current) => [...current, ...next])
    setToast({ title: `${next.length} 张图片已加入`, detail: selected.length < accepted.length ? `每批最多 ${MAX_FILES} 张` : '可以继续添加或开始处理' })
  }

  const removeItem = (id: string) => {
    if (store.processing) return
    store.setItems((current) => {
      const target = current.find((item) => item.id === id)
      if (target) revokeItem(target)
      return current.filter((item) => item.id !== id)
    })
  }

  const clearItems = () => {
    if (store.processing) return
    store.items.forEach(revokeItem)
    store.setItems([])
  }

  const cancel = () => {
    runRef.current += 1
    store.setProcessing(false)
    store.setProgress({ completed: 0, total: 0 })
    store.setItems((current) => current.map((item) => item.status === 'processing' ? { ...item, status: 'ready' } : item))
    setToast({ title: '已取消处理', detail: '原图仍保留在当前工作区' })
  }

  const process = async (targetIds?: string[]) => {
    if (!store.items.length || store.processing) return
    const ids = new Set(targetIds?.length ? targetIds : store.items.map((item) => item.id))
    const targets = store.items.filter((item) => ids.has(item.id))
    const runId = ++runRef.current
    store.setProcessing(true)
    store.setProgress({ completed: 0, total: targets.length })
    store.setItems((current) => current.map((item) => ids.has(item.id) ? prepareItem(item) : item))

    // The run id is a tiny client-side state machine: cancellation or route changes
    // invalidate the current run without leaving stale async results in the workspace.
    const results: FileItem[] = []
    for (const item of targets) {
      if (!mountedRef.current || runRef.current !== runId) return
      let resultUrl: string | undefined
      try {
        resultUrl = await createDemoResult(item.file, store.scale, { tool: route, creativity: store.creativity, similarity: store.similarity, prompt: store.prompt })
        if (!mountedRef.current || runRef.current !== runId) {
          URL.revokeObjectURL(resultUrl)
          return
        }
        results.push({ ...item, resultUrl, resultFormat: 'webp', status: 'done' })
      } catch (error) {
        if (!mountedRef.current || runRef.current !== runId) return
        results.push({ ...item, status: 'error', error: error instanceof Error ? error.message : '结果生成失败' })
      }
      store.setProgress({ completed: results.length, total: targets.length })
    }
    if (!mountedRef.current || runRef.current !== runId) {
      results.forEach((result) => result.resultUrl && URL.revokeObjectURL(result.resultUrl))
      return
    }
    store.setItems((current) => current.map((item) => results.find((result) => result.id === item.id) ?? item))
    store.setProcessing(false)
    setToast({ title: results.some((item) => item.status === 'error') ? '部分图片处理失败' : '处理完成', detail: '结果已准备好，可以编辑或下载' })
  }

  const downloadAll = async () => {
    const completed = store.items.filter((item) => item.status === 'done' && item.resultUrl)
    if (!completed.length) return
    try {
      if (completed.length === 1) downloadUrl(completed[0].resultUrl as string, itemName(completed[0]))
      else await downloadZip(completed)
      setToast({ title: completed.length === 1 ? '结果已下载' : 'ZIP 下载已开始', detail: `${completed.length} 个结果` })
    } catch (error) {
      setToast({ title: '下载失败', detail: error instanceof Error ? error.message : '请改为逐张下载' })
    }
  }

  const downloadItem = (id: string) => {
    const item = store.items.find((candidate) => candidate.id === id)
    if (item?.resultUrl) downloadUrl(item.resultUrl, itemName(item))
  }

  const openEditor = (id: string) => {
    const item = store.items.find((candidate) => candidate.id === id)
    setEditState({ ...defaultEditState, format: item?.resultFormat ?? 'webp' })
    setEditingItemId(id)
  }

  const saveEdit = async () => {
    const item = store.items.find((candidate) => candidate.id === editingItemId)
    if (!item?.resultUrl) return
    try {
      const resultUrl = await applyEdit(item.resultUrl, editState)
      store.setItems((current) => current.map((candidate) => candidate.id === item.id ? replaceResult(candidate, resultUrl, editState.format) : candidate))
      setEditingItemId(null)
      setToast({ title: '编辑结果已保存' })
    } catch (error) {
      setToast({ title: '编辑失败', detail: error instanceof Error ? error.message : '请重试' })
    }
  }

  return { ...store, toast, dragging, setDragging, inputRef, addFiles, removeItem, clearItems, cancel, process, downloadAll, downloadItem, editingItemId, setEditingItemId, editState, setEditState, openEditor, saveEdit }
}

export type WorkspaceController = ReturnType<typeof useWorkspaceController>

function prepareItem(item: FileItem): FileItem {
  if (item.resultUrl) URL.revokeObjectURL(item.resultUrl)
  return { ...item, resultUrl: undefined, status: 'processing', error: undefined }
}

function replaceResult(item: FileItem, resultUrl: string, format: EditState['format']): FileItem {
  if (item.resultUrl) URL.revokeObjectURL(item.resultUrl)
  return { ...item, resultUrl, resultFormat: format }
}

function revokeItem(item: FileItem) {
  URL.revokeObjectURL(item.url)
  if (item.resultUrl) URL.revokeObjectURL(item.resultUrl)
}
