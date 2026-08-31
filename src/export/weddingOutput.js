import { renderWeddingHTML as renderBaseWeddingHTML } from './renderWeddingHTML.js'

const stripUnconfiguredCoupleEyebrow = (html) => String(html || '').replace(/<p\b[^>]*class=["']eyebrow["'][^>]*>\s*Con amor\s*<\/p>/i, '')

export function renderWeddingHTML(project) {
  return stripUnconfiguredCoupleEyebrow(renderBaseWeddingHTML(project))
}

export default renderWeddingHTML
