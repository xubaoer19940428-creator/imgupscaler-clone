'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ACCEPTED_TYPES, MAX_FILE_BYTES, MAX_FILES } from '@/src/lib/constants'
import { downloadUrl, downloadZip, itemName } from '@/src/lib/downloads'
import { applyEdit } from '@/src/lib/image-processing'
import { createImageResult } from '@/src/services/imgupscaler-api'
import type { EditState, FileItem, Route, ToastMessage } from '@/src/lib/types'
import { useWorkspaceStore } from '@/src/stores/workspace-store'
import { useAuthStore } from '@/src/stores/auth-store'

const defaultEditState: EditState = { rotation: 0, flipX: false, flipY: false, crop: 'original', format: 'jpeg', quality: 94 }

export function useWorkspaceController(route: Route, onRequireAuth?: () => void) {
  const t = useTranslations('workspace')
  const store = useWorkspaceStore()
  const authToken = useAuthStore((state) => state.token)
  const workspaceRoute = route === 'pricing' ? 'home' : route
  const workspace = store.workspaces[workspaceRoute]
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [dragging, setDragging] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editState, setEditState] = useState(defaultEditState)
  const inputRef = useRef<HTMLInputElement>(null)
  const itemsRef = useRef<FileItem[]>([])
  const runRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(true)

  // Keep the latest list outside async handlers so unmount cleanup can revoke every object URL.
  useEffect(() => { itemsRef.current = workspace.items }, [workspace.items])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3600)
    return () => window.clearTimeout(timer)
  }, [toast])
  useEffect(() => () => {
    mountedRef.current = false
    runRef.current += 1
    abortRef.current?.abort()
    Object.values(useWorkspaceStore.getState().workspaces).forEach((slice) => slice.items.forEach(revokeItem))
  }, [])

  const addFiles = (incoming: FileList | File[]) => {
    if (workspace.processing) return setToast({ title: t('toast.busy'), detail: t('toast.busyDetail') })
    const acceptedTypes = new Set<string>(ACCEPTED_TYPES)
    const accepted = Array.from(incoming).filter((file) => acceptedTypes.has(file.type) && file.size <= MAX_FILE_BYTES)
    if (!accepted.length) return setToast({ title: t('toast.noImages'), detail: t('toast.noImagesDetail') })
    if (workspace.items.length >= MAX_FILES) return setToast({ title: t('toast.batchLimit', { count: MAX_FILES }), detail: t('toast.addedDetail') })
    const selected = accepted.slice(0, Math.max(0, MAX_FILES - workspace.items.length))
    // Object URLs avoid copying image bytes into React state. They are revoked on remove,
    // replace, clear and unmount in order to prevent long-lived browser memory leaks.
    const next = selected.map<FileItem>((file) => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file), status: 'ready' }))
    store.setItems(workspaceRoute, (current) => [...current, ...next])
    setToast({ title: t('toast.added', { count: next.length }), detail: selected.length < accepted.length ? t('toast.batchLimit', { count: MAX_FILES }) : t('toast.addedDetail') })
  }

  const removeItem = (id: string) => {
    if (workspace.processing) return
    store.setItems(workspaceRoute, (current) => {
      const target = current.find((item) => item.id === id)
      if (target) revokeItem(target)
      return current.filter((item) => item.id !== id)
    })
  }

  const clearItems = () => {
    if (workspace.processing) return
    workspace.items.forEach(revokeItem)
    store.setItems(workspaceRoute, [])
  }

  const cancel = () => {
    runRef.current += 1
    abortRef.current?.abort()
    abortRef.current = null
    store.setProcessing(workspaceRoute, false)
    store.setProgress(workspaceRoute, { completed: 0, total: 0 })
    store.setItems(workspaceRoute, (current) => current.map((item) => item.status === 'processing' ? { ...item, status: 'ready' } : item))
    setToast({ title: t('toast.cancelled'), detail: t('toast.cancelledDetail') })
  }

  const process = async (targetIds?: string[]) => {
    if (route === 'pricing' || !workspace.items.length || workspace.processing) return
    if (!authToken) {
      setToast({ title: t('authRequired'), detail: t('authRequiredDetail') })
      onRequireAuth?.()
      return
    }
    const ids = new Set(targetIds?.length
      ? targetIds
      : workspace.items.filter((item) => item.status === 'ready' || item.status === 'error').map((item) => item.id))
    const targets = workspace.items.filter((item) => ids.has(item.id))
    if (!targets.length) return
    const runId = ++runRef.current
    abortRef.current?.abort()
    const abortController = new AbortController()
    abortRef.current = abortController
    store.setProcessing(workspaceRoute, true)
    store.setProgress(workspaceRoute, { completed: 0, total: targets.length })
    store.setItems(workspaceRoute, (current) => current.map((item) => ids.has(item.id) ? prepareItem(item) : item))

    // The run id is a tiny client-side state machine: cancellation or route changes
    // invalidate the current run without leaving stale async results in the workspace.
    const results: FileItem[] = []
    for (const item of targets) {
      if (!mountedRef.current || runRef.current !== runId) return
      let resultUrl: string | undefined
      try {
        resultUrl = await createImageResult({ file: item.file, route, scale: workspace.scale, creativity: workspace.creativity, similarity: workspace.similarity, prompt: workspace.prompt.trim() || t(`apiPrompt.${route}`), signal: abortController.signal })
        if (!mountedRef.current || runRef.current !== runId) {
          URL.revokeObjectURL(resultUrl)
          return
        }
        results.push({ ...item, resultUrl, resultFormat: 'jpeg', status: 'done' })
      } catch (error) {
        if (!mountedRef.current || runRef.current !== runId) return
        results.push({ ...item, status: 'error', error: workspaceErrorMessage(error, t) })
      }
      store.setProgress(workspaceRoute, { completed: results.length, total: targets.length })
    }
    if (!mountedRef.current || runRef.current !== runId) {
      results.forEach((result) => result.resultUrl && URL.revokeObjectURL(result.resultUrl))
      return
    }
    store.setItems(workspaceRoute, (current) => current.map((item) => results.find((result) => result.id === item.id) ?? item))
    store.setProcessing(workspaceRoute, false)
    abortRef.current = null
    setToast({ title: results.some((item) => item.status === 'error') ? t('toast.partialError') : t('toast.complete'), detail: t('toast.completeDetail') })
  }

  const downloadAll = async () => {
    const completed = workspace.items.filter((item) => item.status === 'done' && item.resultUrl)
    if (!completed.length) return
    try {
      if (completed.length === 1) downloadUrl(completed[0].resultUrl as string, itemName(completed[0]))
      else await downloadZip(completed)
      setToast({ title: completed.length === 1 ? t('toast.downloaded') : t('toast.zipStarted'), detail: t('toast.resultCount', { count: completed.length }) })
    } catch {
      setToast({ title: t('toast.downloadError'), detail: t('toast.downloadErrorDetail') })
    }
  }

  const downloadItem = (id: string) => {
    const item = workspace.items.find((candidate) => candidate.id === id)
    if (item?.resultUrl) downloadUrl(item.resultUrl, itemName(item))
  }

  const openEditor = (id: string) => {
    const item = workspace.items.find((candidate) => candidate.id === id)
    setEditState({ ...defaultEditState, format: item?.resultFormat ?? 'jpeg' })
    setEditingItemId(id)
  }

  const saveEdit = async () => {
    const item = workspace.items.find((candidate) => candidate.id === editingItemId)
    if (!item?.resultUrl) return
    try {
      const resultUrl = await applyEdit(item.resultUrl, editState)
      store.setItems(workspaceRoute, (current) => current.map((candidate) => candidate.id === item.id ? replaceResult(candidate, resultUrl, editState.format) : candidate))
      setEditingItemId(null)
      setToast({ title: t('toast.editSaved') })
    } catch {
      setToast({ title: t('toast.editError'), detail: t('toast.retry') })
    }
  }

  return { ...workspace, setItems: (items: FileItem[] | ((current: FileItem[]) => FileItem[])) => store.setItems(workspaceRoute, items), setScale: (scale: string) => store.setScale(workspaceRoute, scale), setProcessing: (processing: boolean) => store.setProcessing(workspaceRoute, processing), setProgress: (progress: { completed: number; total: number }) => store.setProgress(workspaceRoute, progress), setPrompt: (prompt: string) => store.setPrompt(workspaceRoute, prompt), setCreativity: (creativity: number) => store.setCreativity(workspaceRoute, creativity), setSimilarity: (similarity: number) => store.setSimilarity(workspaceRoute, similarity), toast, dragging, setDragging, inputRef, addFiles, removeItem, clearItems, cancel, process, downloadAll, downloadItem, editingItemId, setEditingItemId, editState, setEditState, openEditor, saveEdit }
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

function workspaceErrorMessage(error: unknown, t: ReturnType<typeof useTranslations>) {
  const code = error instanceof Error ? error.message : ''
  if (code === 'api_result_missing') return t('api.resultMissing')
  if (code === 'run_timeout_cancelled') return t('api.timeout')
  if (code === 'run_cancelled') return t('api.cancelled')
  if (code === 'editor_unsupported') return t('api.editorUnsupported')
  if (code === 'image_read_failed') return t('api.imageReadFailed')
  if (code === 'result_encode_failed') return t('api.encodeFailed')
  if (code.startsWith('run_')) return t('api.failed')
  return t('toast.resultError')
}
