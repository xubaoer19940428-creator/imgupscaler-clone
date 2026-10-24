'use client'

import type { ChangeEvent, DragEvent } from 'react'
import { useTranslations } from 'next-intl'
import { MAX_FILES } from '@/src/lib/constants'
import { FEATURE_FLAGS } from '@/src/lib/feature-flags'
import type { FileItem, Route } from '@/src/lib/types'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Icon } from '@/src/components/ui/icons'
import { Textarea } from '@/src/components/ui/textarea'
import { formatBytes } from '@/src/lib/utils'
import type { WorkspaceController } from './use-workspace-controller'
import { ReferenceWorkflow } from './reference-workflow'


export function WorkspacePanel({ route, controller }: { route: Route; controller: WorkspaceController }) {
  if (route === 'home' || route === 'enhancer') return <ReferenceWorkflow route={route} controller={controller} />
  const t = useTranslations('workspace')
  const hasDone = controller.items.some((item) => item.status === 'done')
  // The active upscaler deployments accept 2x and 4x. Exposing 1K here sent
  // an invalid `scale: 1` to Topaz, whose schema only allows 2/4/6.
  const options = route === 'reimagine' ? ['1', '2'] : ['2', '4']
  // The input is intentionally hidden: both click and drag/drop use the same
  // controller path, so validation and object-URL cleanup cannot diverge.
  const onInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) controller.addFiles(event.target.files)
    event.target.value = ''
  }
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    controller.setDragging(false)
    controller.addFiles(event.dataTransfer.files)
  }

  const referenceState = route === 'reimagine' && controller.items.length === 1
  return <Card id="workspace" data-workspace-route={route} className={`workspace-card workspace-card-${route}${referenceState ? ' workspace-card-reimagine-uploaded' : ''} reveal delayed`}>
    {!controller.items.length && <div className="studio-upload-heading"><Icon name="upload" /><span>{t('label')}</span><span className="studio-file-types" aria-hidden="true">JPG / PNG / WebP / AVIF</span></div>}
    {controller.items.length > 0 && !referenceState && <WorkspaceHeader controller={controller} />}
    <div className={`drop-zone${controller.items.length ? ' has-files' : ''}${referenceState ? ' reimagine-uploaded-surface' : ''}${controller.dragging ? ' is-dragging' : ''}`} onDrop={onDrop} onDragEnter={(event) => { event.preventDefault(); controller.setDragging(true) }} onDragOver={(event) => { event.preventDefault(); controller.setDragging(true) }} onDragLeave={(event) => { if (event.currentTarget === event.target) controller.setDragging(false) }} onClick={controller.items.length ? undefined : () => controller.inputRef.current?.click()} role={controller.items.length ? undefined : 'button'} tabIndex={controller.items.length ? undefined : 0} onKeyDown={controller.items.length ? undefined : (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); controller.inputRef.current?.click() } }} aria-label={controller.items.length ? undefined : t('selectAria')}>
      <input ref={controller.inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={onInput} hidden />
      {controller.items.length ? referenceState ? <ReimaginePreview item={controller.items[0]} /> : <FileGrid controller={controller} /> : <EmptyDropZone route={route} t={t} onPick={() => controller.inputRef.current?.click()} />}
    </div>
    {!controller.items.length && <div className="studio-upload-note"><Icon name="lock" /><span>{t('limit')}</span></div>}
    {route === 'reimagine' && controller.items.length > 0 && <ReimagineControls controller={controller} />}
    {controller.items.length > 0 && <WorkspaceActions route={route} options={options} hasDone={hasDone} controller={controller} />}
  </Card>
}

function WorkspaceHeader({ controller }: { controller: WorkspaceController }) {
  const t = useTranslations('workspace')
  const hasError = controller.items.some((item) => item.status === 'error')
  const allDone = controller.items.every((item) => item.status === 'done')
  const statusKey = controller.processing ? 'processing' : hasError ? 'error' : allDone ? 'done' : 'ready'
  const status = t(`status.${statusKey}`)
  return <div className="workspace-top"><div><span className="workspace-label">{t('label')}</span><h2>{t('readyCount', { count: controller.items.length })}</h2></div><span className={`live-status ${statusKey}`}><span />{status}</span></div>
}

function EmptyDropZone({ t, onPick }: { route?: Route; t: ReturnType<typeof useTranslations>; onPick: () => void }) {
  return <div className="drop-empty"><div className="studio-upload-glyph" aria-hidden="true"><Icon name="crop" /></div><Button className="upload-cta" onClick={(event) => { event.stopPropagation(); onPick() }}><Icon name="upload" />{t('chooseImage')}</Button><strong>{t('dragDrop')}</strong><span>{t('formats')}</span></div>
}

function FileGrid({ controller }: { controller: WorkspaceController }) {
  const t = useTranslations('workspace')
  return (
    <div className="file-grid">
      {controller.items.map((item) => {
        const src = item.resultUrl ?? item.url
        return (
          <div
            className={`file-thumb${item.status === 'error' ? ' has-error' : ''}${item.status === 'done' ? ' is-done' : ''}${item.status === 'processing' ? ' is-processing' : ''}`}
            key={item.id}
          >
            <div className="file-thumb-media">
              <img src={src} alt="" aria-hidden="true" className="file-thumb-bg" />
              <div className="file-thumb-backdrop-mask" />
              <img src={src} alt={item.file.name} className="file-thumb-fg" />
            </div>

            <div className="thumb-top-bar">
              <span className={`thumb-status-badge ${item.status}`}>
                {item.status === 'processing' && <span className="thumb-pulse-dot" />}
                {item.status === 'done' && <Icon name="check" className="thumb-check-icon" />}
                {t(`status.${item.status}`)}
              </span>
              {!controller.processing && (
                <button
                  type="button"
                  className="thumb-remove-btn"
                  onClick={(e) => { e.stopPropagation(); controller.removeItem(item.id) }}
                  aria-label={t('remove')}
                  title={t('remove')}
                >
                  <Icon name="close" />
                </button>
              )}
            </div>

            <div className="thumb-meta-bar">
              <div className="thumb-file-info">
                <span className="thumb-file-name" title={item.file.name}>{item.file.name}</span>
                <span className="thumb-file-size">{formatBytes(item.file.size)}</span>
              </div>
            </div>

            {item.error && <span className="thumb-error-banner">{item.error}</span>}

            {item.status === 'done' && (
              <div className="thumb-action-overlay">
                <button
                  type="button"
                  className="thumb-action-btn primary"
                  onClick={(e) => { e.stopPropagation(); controller.downloadItem(item.id) }}
                >
                  <Icon name="download" />
                  <span>{t('download')}</span>
                </button>
                {FEATURE_FLAGS.enableImageEditor && (
                  <button
                    type="button"
                    className="thumb-action-btn"
                    onClick={(e) => { e.stopPropagation(); controller.openEditor(item.id) }}
                    title={t('edit')}
                  >
                    <Icon name="crop" />
                  </button>
                )}
                <button
                  type="button"
                  className="thumb-action-btn"
                  onClick={(e) => { e.stopPropagation(); controller.process([item.id]) }}
                  title={t('redo')}
                >
                  <Icon name="rotate" />
                </button>
              </div>
            )}

            {item.status === 'error' && (
              <div className="thumb-action-overlay error">
                <button
                  type="button"
                  className="thumb-action-btn retry"
                  onClick={(e) => { e.stopPropagation(); controller.process([item.id]) }}
                >
                  <Icon name="rotate" />
                  <span>{t('retry')}</span>
                </button>
              </div>
            )}
          </div>
        )
      })}

      <button
        type="button"
        className="add-more-card"
        onClick={() => controller.inputRef.current?.click()}
        disabled={controller.processing}
      >
        <div className="add-more-icon">
          <Icon name="upload" />
        </div>
        <span className="add-more-title">{t('addMore')}</span>
        <span className="add-more-hint">JPG / PNG / WebP / AVIF</span>
      </button>
    </div>
  )
}

function ReimaginePreview({ item }: { item: FileItem }) {
  const t = useTranslations('workspace')
  const src = item.resultUrl ?? item.url
  return (
    <div className="reimagine-preview">
      <div className="reimagine-preview-inner">
        <img src={src} alt="" aria-hidden="true" className="reimagine-preview-bg" />
        <div className="reimagine-preview-mask" />
        <img src={src} alt={item.file.name} className="reimagine-preview-fg" />
      </div>
      {item.status === 'processing' && (
        <span className="reimagine-preview-status">
          <span className="thumb-pulse-dot" />
          {t('processing')}
        </span>
      )}
      {item.status === 'error' && item.error && (
        <span className="reimagine-preview-error">{item.error}</span>
      )}
    </div>
  )
}

function ReimagineControls({ controller }: { controller: WorkspaceController }) {
  const t = useTranslations('workspace')
  return <div className="reimagine-controls"><div className="reimagine-model-picker" aria-label={t('model')}><button type="button" className={controller.scale === '1' ? 'selected' : ''} onClick={() => controller.setScale('1')}>{t('portraitModel')}</button><button type="button" className={controller.scale === '2' ? 'selected' : ''} onClick={() => controller.setScale('2')}>{t('detailModel')}</button></div><div className="reimagine-settings"><label><span>{t('prompt')}</span><Textarea placeholder={t('promptPlaceholder')} value={controller.prompt} onChange={(event) => controller.setPrompt(event.target.value)} rows={3} /></label><div className="slider-row"><Range label={t('creativity')} value={controller.creativity} min={0.05} max={0.5} step={0.01} valueLabel={controller.creativity.toFixed(2)} onChange={controller.setCreativity} /><Range label={t('similarity')} value={controller.similarity} min={0} max={30} step={1} valueLabel={String(controller.similarity)} onChange={controller.setSimilarity} /></div></div></div>
}

function Range({ label, value, min, max, step, valueLabel, onChange }: { label: string; value: number; min: number; max: number; step: number; valueLabel: string; onChange: (value: number) => void }) {
  return <label><span>{label}<b>{valueLabel}</b></span><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>
}

function WorkspaceActions({ route, options, hasDone, controller }: { route: Route; options: string[]; hasDone: boolean; controller: WorkspaceController }) {
  const t = useTranslations('workspace')
  if (route === 'reimagine') return <div className="reimagine-actions"><button type="button" className="outline-button" onClick={controller.clearItems} disabled={controller.processing}><Icon name="close" />{t('removeUploaded')}</button>{hasDone && <button type="button" className="outline-button" onClick={controller.downloadAll}><Icon name="download" />{t('downloadResults')}</button>}<button type="button" className="process-button" disabled={controller.processing} onClick={() => controller.process()}><Icon name="upload" />{controller.processing ? `${controller.progress.completed}/${controller.progress.total} ${t('processing')}` : t('startProcessing')}</button></div>
  const heading = t('output')
  return <><div className="workspace-controls"><div className="scale-picker"><span>{heading}</span>{options.map((value) => <button key={value} className={controller.scale === value ? 'selected' : ''} onClick={() => controller.setScale(value)}>{`${value}K`}</button>)}</div><div className="workspace-actions"><button className="text-button" onClick={controller.clearItems} disabled={controller.processing}>{t('clear')}</button>{hasDone && <button className="outline-button" onClick={controller.downloadAll}><Icon name="download" />{t('downloadResults')}</button>}{controller.processing && <button className="outline-button" onClick={controller.cancel}>{t('cancel')}</button>}<button className="process-button" disabled={controller.processing} onClick={() => controller.process()}>{controller.processing ? `${controller.progress.completed}/${controller.progress.total} ${t('processing')}` : t('start')}</button></div></div><div className="workspace-foot"><span><Icon name="lock" />{t('local')}</span><span>{t('limit')}</span></div></>
}
