import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { createTranslator } from 'next-intl'
import { parse, TYPE } from '@formatjs/icu-messageformat-parser'

const directory = new URL('../messages/', import.meta.url)
const files = (await readdir(directory)).filter((file) => file.endsWith('.json'))
const readMessages = async (file) => JSON.parse(await readFile(new URL(file, directory), 'utf8'))
const english = await readMessages('en.json')
const flatten = (value, path = '') => {
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).flatMap(([key, child]) =>
      Object.entries(flatten(child, path ? `${path}.${key}` : key))))
  }
  return { [path]: value }
}
const source = flatten(english)
const words = (value) => value.toLowerCase().match(/[a-z]+/g) ?? []
const placeholders = (value) => {
  const names = new Set()
  const visit = (nodes) => {
    for (const node of nodes) {
      if (node.type >= TYPE.argument && node.type <= TYPE.plural) names.add(node.value)
      if (node.options) for (const option of Object.values(node.options)) visit(option.value)
      if (node.children) visit(node.children)
    }
  }
  visit(parse(value))
  return [...names].sort()
}
const technicalKey = /^(footer\.languageNames\.|auth\.emailPlaceholder$|account\.placeholderAvatar$|metadata\.root\.title$)|\.(id|image|beforeImage|afterImage)$|^landing\.testimonials\.\d\.0$/
// These words are also natural words in their target languages.
const sharedWords = {
  de: new Set(['Original', 'Premium', 'Blog']),
  es: new Set(['Blog']),
  fr: new Set(['Portrait']),
  it: new Set(['Blog', 'Email', 'Password']),
  'pt-BR': new Set(['Editor', 'Blog']),
}

for (const file of files) {
  const locale = file.replace('.json', '')
  const messages = flatten(await readMessages(file))
  assert.deepEqual(Object.keys(messages).sort(), Object.keys(source).sort(), `${locale}: message keys differ`)
  for (const [key, value] of Object.entries(messages)) {
    assert.equal(typeof value, typeof source[key], `${locale}:${key}: value type differs`)
    if (typeof value !== 'string') continue
    assert.deepEqual(placeholders(value), placeholders(source[key]), `${locale}:${key}: placeholders differ`)
    assert(!/XZSEPZX|ZXSEP|ZXVAR|990099/.test(value), `${locale}:${key}: translation marker remains`)
    if (locale !== 'en' && value.trim().toLowerCase() === source[key].trim().toLowerCase() && (/[a-z]{3}/i.test(value) || key === 'pricing.monthlyPrice') && !technicalKey.test(key)) {
      assert(sharedWords[locale]?.has(value), `${locale}:${key}: untranslated English: ${value}`)
    }
    if (locale !== 'en' && !technicalKey.test(key)) {
      assert(!/\bAI image (?:upscaler|enhancer)\b|\b(?:Portrait|Detailed) Model\b|Reimagine AI Access|\bStep [123]\b/i.test(value), `${locale}:${key}: English interface text remains`)
      const englishWords = words(source[key])
      const translatedWords = words(value).join(' ')
      for (let i = 0; i + 5 <= englishWords.length; i++) {
        const phrase = englishWords.slice(i, i + 5)
        if (!phrase.some((word) => ['the', 'with', 'your', 'and', 'from', 'before', 'without', 'that'].includes(word))) continue
        assert(!translatedWords.includes(phrase.join(' ')), `${locale}:${key}: English sentence fragment remains`)
      }
    }
    const errors = []
    const translate = createTranslator({ locale, messages: { value }, onError: (error) => errors.push(error.message) })
    for (const count of [0, 1, 2, 3, 11, 20, 21]) translate('value', { count })
    assert.equal(errors.length, 0, `${locale}:${key}: invalid message: ${errors[0]}`)
  }
  console.log(`${locale}: ${Object.keys(messages).length} keys, placeholders and message formatting valid`)
}
console.log(`Verified ${files.length} languages with no unapproved English fallback text.`)
