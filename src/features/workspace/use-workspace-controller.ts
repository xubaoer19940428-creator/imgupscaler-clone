'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ACCEPTED_TYPES, MAX_FILE_BYTES, MAX_FILES } from '@/src/lib/constants'
import { downloadUrl, downloadZip, itemName } from '@/src/lib/downloads'
import { applyEdit, createDemoResult } from '@/src/lib/image-processing'
import type { EditState, FileItem, Route, ToastMessage } from '@/src/lib/types'
import { useWorkspaceStore } from '@/src/stores/workspace-store'

const defaultEditState: EditState = { rotation: 0, flipX: false, flipY: false, crop: 'original', format: 'webp', quality: 94 }

export function useWorkspaceController(route: Route) {
  const t = useTranslations('workspace')
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
    if (store.processing) return setToast({ title: t('toast.busy'), detail: t('toast.busyDetail') })
    const acceptedTypes = new Set<string>(ACCEPTED_TYPES)
    const accepted = Array.from(incoming).filter((file) => acceptedTypes.has(file.type) && file.size <= MAX_FILE_BYTES)
    if (!accepted.length) return setToast({ title: t('toast.noImages'), detail: t('toast.noImagesDetail') })
    const selected = accepted.slice(0, Math.max(0, MAX_FILES - store.items.length))
    // Object URLs avoid copying image bytes into React state. They are revoked on remove,
    // replace, clear and unmount in order to prevent long-lived browser memory leaks.
    const next = selected.map<FileItem>((file) => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file), status: 'ready' }))
    store.setItems((current) => [...current, ...next])
    setToast({ title: t('toast.added', { count: next.length }), detail: selected.length < accepted.length ? t('toast.batchLimit', { count: MAX_FILES }) : t('toast.addedDetail') })
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
    setToast({ title: t('toast.cancelled'), detail: t('toast.cancelledDetail') })
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
        results.push({ ...item, status: 'error', error: error instanceof Error ? error.message : t('toast.resultError') })
      }
      store.setProgress({ completed: results.length, total: targets.length })
    }
    if (!mountedRef.current || runRef.current !== runId) {
      results.forEach((result) => result.resultUrl && URL.revokeObjectURL(result.resultUrl))
      return
    }
    store.setItems((current) => current.map((item) => results.find((result) => result.id === item.id) ?? item))
    store.setProcessing(false)
    setToast({ title: results.some((item) => item.status === 'error') ? t('toast.partialError') : t('toast.complete'), detail: t('toast.completeDetail') })
  }

  const downloadAll = async () => {
    const completed = store.items.filter((item) => item.status === 'done' && item.resultUrl)
    if (!completed.length) return
    try {
      if (completed.length === 1) downloadUrl(completed[0].resultUrl as string, itemName(completed[0]))
      else await downloadZip(completed)
      setToast({ title: completed.length === 1 ? t('toast.downloaded') : t('toast.zipStarted'), detail: t('toast.resultCount', { count: completed.length }) })
    } catch (error) {
      setToast({ title: t('toast.downloadError'), detail: error instanceof Error ? error.message : t('toast.downloadErrorDetail') })
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
      setToast({ title: t('toast.editSaved') })
    } catch (error) {
      setToast({ title: t('toast.editError'), detail: error instanceof Error ? error.message : t('toast.retry') })
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
