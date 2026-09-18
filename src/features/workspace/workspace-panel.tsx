'use client'

import type { ChangeEvent, DragEvent } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { MAX_FILES } from '@/src/lib/constants'
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
    <div className={`drop-zone${controller.items.length ? ' has-files' : ''}${controller.dragging ? ' is-dragging' : ''}`} onDrop={onDrop} onDragEnter={(event) => { event.preventDefault(); controller.setDragging(true) }} onDragOver={(event) => { event.preventDefault(); controller.setDragging(true) }} onDragLeave={(event) => { if (event.currentTarget === event.target) controller.setDragging(false) }} onClick={controller.items.length ? undefined : () => controller.inputRef.current?.click()} role={controller.items.length ? undefined : 'button'} tabIndex={controller.items.length ? undefined : 0} onKeyDown={controller.items.length ? undefined : (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); controller.inputRef.current?.click() } }} aria-label={controller.items.length ? undefined : '选择要处理的图片'}>
      <input ref={controller.inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={onInput} hidden />
      {controller.items.length ? <FileGrid controller={controller} /> : <EmptyDropZone route={route} t={t} onPick={() => controller.inputRef.current?.click()} />}
    </div>
    {/* The reference keeps prompt/model controls hidden until an image exists. */}
    {route === 'reimagine' && controller.items.length > 0 && <ReimagineControls controller={controller} />}
    {controller.items.length > 0 && <WorkspaceActions route={route} options={options} hasDone={hasDone} controller={controller} />}
  </Card>
}

function WorkspaceHeader({ controller }: { controller: WorkspaceController }) {
  const locale = useLocale()
  const isChinese = locale === 'zh'
  const hasError = controller.items.some((item) => item.status === 'error')
  const allDone = controller.items.every((item) => item.status === 'done')
  const statusKey = controller.processing ? 'processing' : hasError ? 'error' : allDone ? 'done' : 'ready'
  const status = isChinese ? { ready: '待处理', processing: '处理中', done: '已完成', error: '处理失败' }[statusKey] : { ready: 'Ready', processing: 'Processing', done: 'Done', error: 'Error' }[statusKey]
  return <div className="workspace-top"><div><span className="workspace-label">{isChinese ? '工作区' : 'Workspace'}</span><h2>{isChinese ? `${controller.items.length} 张图片已准备` : `${controller.items.length} image${controller.items.length === 1 ? '' : 's'} ready`}</h2></div><span className={`live-status ${statusKey}`}><span />{status}</span></div>
}

function EmptyDropZone({ route, t, onPick }: { route: Route; t: ReturnType<typeof useTranslations>; onPick: () => void }) {
  const isChinese = useLocale() === 'zh'
  return <div className="drop-empty"><Button className="upload-cta" onClick={(event) => { event.stopPropagation(); onPick() }}><Icon name="upload" />{t('chooseImage')}</Button><strong>{route === 'home' || isChinese ? t('dragDrop') : 'Drop your image here'}</strong><span>{t('formats')}</span></div>
}

function FileGrid({ controller }: { controller: WorkspaceController }) {
  const locale = useLocale()
  const isChinese = locale === 'zh'
  const statusLabels = isChinese ? { ready: '待处理', processing: '处理中', done: '已完成', error: '失败' } : { ready: 'Ready', processing: 'Processing', done: 'Done', error: 'Error' }
  return <div className="file-grid">{controller.items.map((item) => <div className={`file-thumb${item.status === 'error' ? ' has-error' : ''}`} key={item.id}><img src={item.resultUrl ?? item.url} alt={item.file.name} /><span className={`thumb-status ${item.status}`}>{statusLabels[item.status]}</span>{item.error && <span className="thumb-error">{item.error}</span>}{!controller.processing && <button className="thumb-remove" onClick={() => controller.removeItem(item.id)}>×</button>}{item.status === 'error' && <button className="thumb-retry" onClick={() => controller.process([item.id])}>{isChinese ? '重试' : 'Retry'}</button>}{item.status === 'done' && <div className="thumb-actions"><button onClick={() => controller.downloadItem(item.id)}>{isChinese ? '下载' : 'Download'}</button><button onClick={() => controller.openEditor(item.id)}>{isChinese ? '编辑' : 'Edit'}</button><button onClick={() => controller.process([item.id])}>{isChinese ? '重做' : 'Redo'}</button></div>}</div>)}<button className="add-more" onClick={() => controller.inputRef.current?.click()} disabled={controller.processing}><Icon name="upload" />{isChinese ? '继续添加' : 'Add more'}</button></div>
}

function ReimagineControls({ controller }: { controller: WorkspaceController }) {
  const isChinese = useLocale() === 'zh'
  return <div className="reimagine-controls"><label><span>{isChinese ? '提示词' : 'Prompt'}</span><Textarea value={controller.prompt} onChange={(event) => controller.setPrompt(event.target.value)} rows={2} /></label><div className="slider-row"><Range label={isChinese ? '创造力' : 'Creativity'} value={controller.creativity} onChange={controller.setCreativity} /><Range label={isChinese ? '相似度' : 'Similarity'} value={controller.similarity} onChange={controller.setSimilarity} /></div></div>
}

function Range({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label><span>{label}<b>{value}%</b></span><input type="range" min="0" max="100" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>
}

function WorkspaceActions({ route, options, hasDone, controller }: { route: Route; options: string[]; hasDone: boolean; controller: WorkspaceController }) {
  const isChinese = useLocale() === 'zh'
  const copy = isChinese ? { output: '输出大小', model: '重新构想模型', scale: '放大倍率', clear: '清空', download: '下载结果', cancel: '取消处理', processing: '处理中…', start: '开始处理', local: '文件仅用于当前任务', limit: '长边上限 4096px' } : { output: 'Output size', model: 'Reimagine model', scale: 'Scale', clear: 'Clear', download: 'Download results', cancel: 'Cancel', processing: 'Processing…', start: 'Process image', local: 'Files stay in this task', limit: 'Long edge limit 4096px' }
  return <><div className="workspace-controls"><div className="scale-picker"><span>{route === 'enhancer' ? copy.output : route === 'reimagine' ? copy.model : copy.scale}</span>{options.map((value) => <button key={value} className={controller.scale === value ? 'selected' : ''} onClick={() => controller.setScale(value)}>{route === 'reimagine' ? value === '1' ? (isChinese ? '人像模型' : 'Portrait') : (isChinese ? '详细模型' : 'Detail') : `${value}${route === 'enhancer' ? 'K' : '×'}`}</button>)}</div><div className="workspace-actions"><button className="text-button" onClick={controller.clearItems} disabled={controller.processing}>{copy.clear}</button>{hasDone && <button className="outline-button" onClick={controller.downloadAll}><Icon name="download" />{copy.download}</button>}{controller.processing && <button className="outline-button" onClick={controller.cancel}>{copy.cancel}</button>}<button className="process-button" disabled={controller.processing} onClick={() => controller.process()}>{controller.processing ? `${controller.progress.completed}/${controller.progress.total} ${copy.processing}` : copy.start}</button></div></div><div className="workspace-foot"><span><Icon name="lock" />{copy.local}</span><span>{copy.limit}</span></div></>
}
