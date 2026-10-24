'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { CompareCard } from '@/src/features/landing/sections'
import { Icon } from '@/src/components/ui/icons'
import { ACCEPTED_TYPES, MAX_FILE_BYTES, MAX_FILES } from '@/src/lib/constants'
import type { Route } from '@/src/lib/types'
import type { WorkspaceController } from './use-workspace-controller'

type Mode = 'standard' | 'detailed'

const samplePairs: Record<'home' | 'enhancer', Array<{ before: string; after: string }>> = {
  home: [
    { before: '/reference/anime-original.webp', after: '/reference/anime-upscaler.webp' },
    { before: '/reference/unnamed.jpg', after: '/reference/Upscal.jpeg' },
    { before: '/reference/upscale-image-online.jpeg', after: '/reference/enhance-subjects.webp' },
  ],
  enhancer: [
    { before: '/reference/enhancer/enhancer-sample-1-before.webp', after: '/reference/enhancer/enhancer-sample-1-after.webp' },
    { before: '/reference/enhancer/enhancer-sample-2-before.webp', after: '/reference/enhancer/enhancer-sample-2-after.webp' },
    { before: '/reference/enhancer/enhancer-sample-3-before.webp', after: '/reference/enhancer/enhancer-sample-3-after.webp' },
    { before: '/reference/enhancer/enhancer-sample-4-before.webp', after: '/reference/enhancer/enhancer-sample-4-after.webp' },
  ],
}

export function ReferenceWorkflow({ route, controller }: { route: 'home' | 'enhancer'; controller: WorkspaceController }) {
  const t = useTranslations('workspace')
  const router = useRouter()
  const pairs = samplePairs[route]
  const [selected, setSelected] = useState(0)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [preview, setPreview] = useState<string | null>(null)
  const [parameterOpen, setParameterOpen] = useState(false)
  const [batchOpen, setBatchOpen] = useState(false)
  const [processingOpen, setProcessingOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('standard')
  const [scale, setScale] = useState(controller.scale)

  const activeItem = controller.items[0]
  const resultItem = controller.items.find((item) => item.status === 'done' && item.resultUrl)
  const errorItem = controller.items.find((item) => item.status === 'error' && item.error)
  const status = controller.processing
    ? `${controller.progress.completed}/${controller.progress.total} ${t('processing')}`
    : errorItem?.error ?? (resultItem ? t('toast.complete') : '')

  // Store-backed files survive a route change. Rehydrate the reference shell
  // from the shared workspace instead of recreating a dead object URL.
  useEffect(() => {
    if (!pendingFiles.length && controller.items.length) {
      setPendingFiles(controller.items.map((item) => item.file))
      setPreview(controller.items[0]?.url ?? null)
    }
  }, [controller.items, pendingFiles.length])

  const acceptFiles = (incoming: FileList | File[]) => {
    if (controller.processing) return
    const acceptedTypes = new Set<string>(ACCEPTED_TYPES)
    const files = Array.from(incoming)
      .filter((file) => acceptedTypes.has(file.type) && file.size <= MAX_FILE_BYTES)
      .slice(0, MAX_FILES)
    if (!files.length) return
    controller.forceClearItems()
    controller.addFiles(files)
    setPendingFiles(files)
    setPreview(null)
    setParameterOpen(files.length === 1)
    setBatchOpen(files.length > 1)
    setProcessingOpen(false)
  }

  useEffect(() => {
    if (!preview && activeItem) setPreview(activeItem.url)
  }, [activeItem, preview])

  const inputId = `reference-upload-${route}`
  const activePair = pairs[selected]
  const startProcessing = (all: boolean) => {
    const ids = controller.items.slice(0, all ? undefined : 1).map((item) => item.id)
    if (!ids.length) return
    setParameterOpen(false)
    setBatchOpen(false)
    setProcessingOpen(true)
    controller.process(ids)
  }

  const clearSession = () => {
    if (controller.processing) controller.cancel()
    controller.forceClearItems()
    setPendingFiles([])
    setPreview(null)
    setParameterOpen(false)
    setBatchOpen(false)
    setProcessingOpen(false)
  }

  const chooseOneFromBatch = () => {
    setBatchOpen(false)
    setParameterOpen(true)
  }

  return (
    <section id="workspace" className={`reference-workspace reference-workspace-${route}`}>
      <input id={inputId} ref={controller.inputRef} type="file" hidden multiple accept={ACCEPTED_TYPES.join(',')} onChange={(event) => { if (event.target.files) acceptFiles(event.target.files); event.target.value = '' }} />
      <div className="reference-workspace-card">
        <div
          className="reference-upload-panel"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => { event.preventDefault(); acceptFiles(event.dataTransfer.files) }}
          onPaste={(event) => { const files = Array.from(event.clipboardData.files); if (files.length) acceptFiles(files) }}
        >
          <div className="reference-upload-content">
            <Icon name="upload" className="reference-upload-icon" />
            <p className="reference-upload-copy">{t('dragDrop')}</p>
            <p className="reference-upload-limit">{t('formats')}</p>
            {pendingFiles.length > 0 && <p className="reference-file-name">{pendingFiles.length > 1 ? `${pendingFiles.length} ${t('addMore').toLowerCase()}` : pendingFiles[0]?.name}</p>}
          </div>
          <button type="button" className="reference-upload-button" onClick={() => document.getElementById(inputId)?.click()}>
            <Icon name="upload" /> {t('chooseImage')}
          </button>
        </div>

        <div className="reference-sample-panel">
          <div className="reference-compare-wrap">
            <CompareCard before={activePair.before} after={activePair.after} eager={selected === 0} />
          </div>
          <div className="reference-samples" role="list" aria-label={t('output')}>
            {pairs.map((pair, index) => (
              <button key={pair.before} type="button" role="listitem" className={`reference-sample${selected === index ? ' selected' : ''}`} onClick={() => { clearSession(); setSelected(index) }}>
                <img src={pair.before} alt={`${t('status.ready')} ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {parameterOpen && (
        <ParameterScreen
          route={route}
          preview={preview}
          scale={scale}
          mode={mode}
          onScaleChange={(value) => { setScale(value); controller.setScale(value) }}
          onModeChange={setMode}
          onPremium={() => router.push('/pricing')}
          onStart={() => startProcessing(false)}
          onCancel={clearSession}
        />
      )}
      {batchOpen && (
        <BatchScreen
          count={pendingFiles.length}
          preview={preview}
          onOne={chooseOneFromBatch}
          onAll={() => router.push('/pricing')}
          onCancel={clearSession}
        />
      )}
      {processingOpen && (
        <ProcessingScreen
          preview={preview}
          result={resultItem?.resultUrl ?? null}
          status={status}
          processing={controller.processing}
          onCancel={clearSession}
          onDownload={() => resultItem && controller.downloadItem(resultItem.id)}
        />
      )}
    </section>
  )
}

function ParameterScreen({ route, preview, scale, mode, onScaleChange, onModeChange, onPremium, onStart, onCancel }: { route: Route; preview: string | null; scale: string; mode: Mode; onScaleChange: (value: string) => void; onModeChange: (value: Mode) => void; onPremium: () => void; onStart: () => void; onCancel: () => void }) {
  const t = useTranslations('workspace')
  const title = route === 'enhancer' ? t('label') : t('output')
  return <div className="reference-parameter-screen">
    <div className="reference-parameter-layout">
      <main className="reference-parameter-stage" aria-label={t('chooseImage')}><div className="reference-parameter-image-wrap">{preview && <img src={preview} alt={t('chooseImage')} />}</div></main>
      <aside className="reference-parameter-panel" role="dialog" aria-modal="true" aria-labelledby="reference-parameter-title">
        <button type="button" className="reference-parameter-close" aria-label={t('clear')} onClick={onCancel}>×</button>
        <div className="reference-parameter-panel-scroll">
          <h2 id="reference-parameter-title">{title}</h2>
          <fieldset className="reference-modal-group"><legend>{t('output')}</legend><div className="reference-resolution-switcher">
            {['2', '4'].map((value) => <button key={value} type="button" className={`reference-modal-option${scale === value ? ' selected' : ''}`} onClick={() => onScaleChange(value)}><span className="reference-modal-option-title">{value}K</span>{value === '4' && <span className="reference-modal-option-badge">PRO</span>}</button>)}
          </div></fieldset>
          <fieldset className="reference-modal-group"><legend>{t('model')}</legend><div className="reference-modal-options">
            <button type="button" className={`reference-modal-option${mode === 'standard' ? ' selected' : ''}`} onClick={() => onModeChange('standard')}><span className="reference-modal-option-title">{t('portrait')}</span><span className="reference-modal-option-description">{t('local')}</span></button>
            <button type="button" className="reference-modal-option" onClick={onPremium}><span className="reference-modal-option-title">{t('detail')}</span><span className="reference-modal-option-badge">PRO</span><span className="reference-modal-option-description">{t('limit')}</span></button>
          </div></fieldset>
        </div>
        <footer className="reference-parameter-footer"><button type="button" className="reference-modal-primary reference-parameter-start" onClick={onStart}>{t('start')}</button></footer>
      </aside>
    </div>
  </div>
}

function BatchScreen({ count, preview, onOne, onAll, onCancel }: { count: number; preview: string | null; onOne: () => void; onAll: () => void; onCancel: () => void }) {
  const t = useTranslations('workspace')
  return <div className="reference-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onCancel() }}>
    <section className="reference-modal reference-batch-modal" role="dialog" aria-modal="true" aria-labelledby="reference-batch-title">
      <button type="button" className="reference-modal-close reference-batch-close" aria-label={t('clear')} onClick={onCancel}>×</button>
      <h2 id="reference-batch-title">{t('readyCount', { count })}</h2><p className="reference-batch-subtitle">{t('formats')}</p>
      <div className="reference-batch-options">
        <button type="button" className="reference-batch-option" onClick={onOne}><span className="reference-batch-image">{preview && <img src={preview} alt="" />}</span><span className="reference-batch-option-copy"><span className="reference-batch-option-title">{t('start')}</span><small>{t('local')}<br />{t('limit')}</small></span><strong>{t('start')}</strong></button>
        <button type="button" className="reference-batch-option featured" onClick={onAll}><span className="reference-batch-image">{preview && <img src={preview} alt="" />}<b>× {count}</b></span><span className="reference-batch-option-copy"><span className="reference-batch-option-title">{t('downloadResults')} <em>PRO</em></span><small>{t('local')}<br />{t('limit')}</small></span><strong>{t('downloadResults')}</strong></button>
      </div>
    </section>
  </div>
}

function ProcessingScreen({ preview, result, status, processing, onCancel, onDownload }: { preview: string | null; result: string | null; status: string; processing: boolean; onCancel: () => void; onDownload: () => void }) {
  const t = useTranslations('workspace')
  const image = result ?? preview
  return <div className="reference-parameter-screen"><div className="reference-parameter-layout"><main className="reference-parameter-stage" aria-label={t('processing')}><div className="reference-parameter-image-wrap">{image && <img src={image} alt="" />}</div></main><aside className="reference-parameter-panel reference-processing-panel" role="dialog" aria-modal="true"><button type="button" className="reference-parameter-close" aria-label={t('clear')} onClick={onCancel}>×</button><div className="reference-parameter-panel-scroll"><h2>{result ? t('toast.complete') : t('processing')}</h2><p className="reference-processing-status" role="status">{status || t('processing')}</p></div><footer className="reference-parameter-footer">{result ? <button type="button" className="reference-modal-primary reference-processing-download" onClick={onDownload}>{t('download')}</button> : <button type="button" className="reference-modal-primary reference-parameter-start" disabled={processing}>{processing ? t('processing') : t('retry')}</button>}</footer></aside></div></div>
}
