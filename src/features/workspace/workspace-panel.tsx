'use client'

import type { ChangeEvent, DragEvent } from 'react'
import { useTranslations } from 'next-intl'
import { MAX_FILES } from '@/src/lib/constants'
import { FEATURE_FLAGS } from '@/src/lib/feature-flags'
import type { Route } from '@/src/lib/types'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Icon } from '@/src/components/ui/icons'
import { Textarea } from '@/src/components/ui/textarea'
import type { WorkspaceController } from './use-workspace-controller'


export function WorkspacePanel({ route, controller }: { route: Route; controller: WorkspaceController }) {
  const t = useTranslations('workspace')
  const hasDone = controller.items.some((item) => item.status === 'done')
  const options = route === 'reimagine' ? ['1', '2'] : route === 'enhancer' ? ['1', '2', '4'] : ['2', '4']
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

  return <Card id="workspace" className="workspace-card reveal delayed">
    {controller.items.length > 0 && <WorkspaceHeader controller={controller} />}
    <div className={`drop-zone${controller.items.length ? ' has-files' : ''}${controller.dragging ? ' is-dragging' : ''}`} onDrop={onDrop} onDragEnter={(event) => { event.preventDefault(); controller.setDragging(true) }} onDragOver={(event) => { event.preventDefault(); controller.setDragging(true) }} onDragLeave={(event) => { if (event.currentTarget === event.target) controller.setDragging(false) }} onClick={controller.items.length ? undefined : () => controller.inputRef.current?.click()} role={controller.items.length ? undefined : 'button'} tabIndex={controller.items.length ? undefined : 0} onKeyDown={controller.items.length ? undefined : (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); controller.inputRef.current?.click() } }} aria-label={controller.items.length ? undefined : t('selectAria')}>
      <input ref={controller.inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={onInput} hidden />
      {controller.items.length ? <FileGrid controller={controller} /> : <EmptyDropZone route={route} t={t} onPick={() => controller.inputRef.current?.click()} />}
    </div>
    {/* The reference keeps prompt/model controls hidden until an image exists. */}
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
  return <div className="drop-empty"><Button className="upload-cta" onClick={(event) => { event.stopPropagation(); onPick() }}><Icon name="upload" />{t('chooseImage')}</Button><strong>{t('dragDrop')}</strong><span>{t('formats')}</span></div>
}

function FileGrid({ controller }: { controller: WorkspaceController }) {
  const t = useTranslations('workspace')
  return <div className="file-grid">{controller.items.map((item) => <div className={`file-thumb${item.status === 'error' ? ' has-error' : ''}`} key={item.id}><img src={item.resultUrl ?? item.url} alt={item.file.name} /><span className={`thumb-status ${item.status}`}>{t(`status.${item.status}`)}</span>{item.error && <span className="thumb-error">{item.error}</span>}{!controller.processing && <button className="thumb-remove" onClick={() => controller.removeItem(item.id)} aria-label={t('remove')}>×</button>}{item.status === 'error' && <button className="thumb-retry" onClick={() => controller.process([item.id])}>{t('retry')}</button>}{item.status === 'done' && <div className="thumb-actions"><button onClick={() => controller.downloadItem(item.id)}>{t('download')}</button>{FEATURE_FLAGS.enableImageEditor && <button onClick={() => controller.openEditor(item.id)}>{t('edit')}</button>}<button onClick={() => controller.process([item.id])}>{t('redo')}</button></div>}</div>)}<button className="add-more" onClick={() => controller.inputRef.current?.click()} disabled={controller.processing}><Icon name="upload" />{t('addMore')}</button></div>

}

function ReimagineControls({ controller }: { controller: WorkspaceController }) {
  const t = useTranslations('workspace')
  return <div className="reimagine-controls"><label><span>{t('prompt')}</span><Textarea value={controller.prompt} onChange={(event) => controller.setPrompt(event.target.value)} rows={2} /></label><div className="slider-row"><Range label={t('creativity')} value={controller.creativity} onChange={controller.setCreativity} /><Range label={t('similarity')} value={controller.similarity} onChange={controller.setSimilarity} /></div></div>
}

function Range({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label><span>{label}<b>{value}%</b></span><input type="range" min="0" max="100" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>
}

function WorkspaceActions({ route, options, hasDone, controller }: { route: Route; options: string[]; hasDone: boolean; controller: WorkspaceController }) {
  const t = useTranslations('workspace')
  const heading = route === 'enhancer' ? t('output') : route === 'reimagine' ? t('model') : t('scale')
  return <><div className="workspace-controls"><div className="scale-picker"><span>{heading}</span>{options.map((value) => <button key={value} className={controller.scale === value ? 'selected' : ''} onClick={() => controller.setScale(value)}>{route === 'reimagine' ? value === '1' ? t('portrait') : t('detail') : `${value}K`}</button>)}</div><div className="workspace-actions"><button className="text-button" onClick={controller.clearItems} disabled={controller.processing}>{t('clear')}</button>{hasDone && <button className="outline-button" onClick={controller.downloadAll}><Icon name="download" />{t('downloadResults')}</button>}{controller.processing && <button className="outline-button" onClick={controller.cancel}>{t('cancel')}</button>}<button className="process-button" disabled={controller.processing} onClick={() => controller.process()}>{controller.processing ? `${controller.progress.completed}/${controller.progress.total} ${t('processing')}` : t('start')}</button></div></div><div className="workspace-foot"><span><Icon name="lock" />{t('local')}</span><span>{t('limit')}</span></div></>
}
