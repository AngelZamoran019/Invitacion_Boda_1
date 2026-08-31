import { renderWeddingHTML as renderBaseWeddingHTML } from './renderWeddingHTML.js'

const stripUnconfiguredCoupleEyebrow = (html) => String(html || '').replace(/<p\b[^>]*class=[\"']eyebrow[\"'][^>]*>\s*Con amor\s*<\/p>/i, '')
const escapeHtml = (value = '') => String(value).replace(/[&<>\"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' })[char])

const applyStorySectionTitle = (html, project) => {
  const title = escapeHtml(project?.story?.sectionTitle || 'Nuestra historia')
  const marker = '<p class="eyebrow" style='
  const source = String(html || '')
  const storyIndex = source.indexOf('<section class="section"><p class="eyebrow"')
  if (storyIndex < 0) return source
  const markerIndex = source.indexOf(marker, storyIndex)
  if (markerIndex < 0) return source
  const contentStart = source.indexOf('>', markerIndex) + 1
  const contentEnd = source.indexOf('</p>', contentStart)
  if (contentStart <= 0 || contentEnd < 0) return source
  return `${source.slice(0, contentStart)}${title}${source.slice(contentEnd)}`
}

export function renderWeddingHTML(project) {
  const html = renderBaseWeddingHTML(project)
  return applyStorySectionTitle(stripUnconfiguredCoupleEyebrow(html), project)
}

export default renderWeddingHTML
