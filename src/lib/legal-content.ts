import type { AbstractIntlMessages } from 'next-intl'

export type LegalPageId = 'privacy-policy' | 'terms' | 'cookies'
export type LegalContent = { title: string; intro: string; sections: readonly [string, string][] }

type MessagesWithLegal = AbstractIntlMessages & { legal: { pages: Record<LegalPageId, LegalContent> } }

export function getLegalContent(messages: AbstractIntlMessages, page: LegalPageId): LegalContent {
  return (messages as MessagesWithLegal).legal.pages[page]
}
