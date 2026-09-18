'use client'

import { useState } from 'react'
import { Icon } from '@/src/components/ui/icons'
import type { Route } from '@/src/lib/types'
import { faqs } from './data'

export function FaqSection({ route }: { route: Exclude<Route, 'pricing'> }) {
  const [openIndex, setOpenIndex] = useState(0)
  const title = route === 'enhancer' ? 'AI图像增强器常见问题解答' : route === 'reimagine' ? '重塑 AI 常见问题解答' : 'AI图像放大工具常见问题解答'
  const description = route === 'enhancer' ? '关于 AI 图像增强、提升图像质量、锐化模糊照片、增加图像细节、输出质量、隐私以及支持的使用场景等常见问题的解答。' : route === 'reimagine' ? '关于 Reimagine AI、创意放大、提示词引导的图像增强、创造力、相似度强度、隐私以及最佳使用场景的常见问题解答。' : '关于 ImgUpscaler、在线图像放大、图像增强、文件隐私、支持格式及最佳使用场景的常见问题解答。'
  return <section className="faq-section section-wrap" id="faq"><div className="section-heading compact"><SectionHeadingLike title={title} description={description} /></div><div className="faq-list">{faqs[route].map(([question, answer], index) => { const expanded = openIndex === index; return <article className={expanded ? 'faq-item expanded' : 'faq-item'} key={question}><button aria-expanded={expanded} aria-controls={`faq-answer-${index}`} onClick={() => setOpenIndex(expanded ? -1 : index)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{question}</strong><Icon name="chevron" /></button><p id={`faq-answer-${index}`} hidden={!expanded}>{answer}</p></article> })}</div></section>
}

function SectionHeadingLike({ title, description }: { title: string; description: string }) {
  return <><h2>{title}</h2><p>{description}</p></>
}
