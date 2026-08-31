import { renderWeddingHTML as renderBaseWeddingHTML } from './renderWeddingHTML.js'

const stripUnconfiguredCoupleEyebrow = (html) => String(html || '').replace(/<p\b[^>]*class=[\"']eyebrow[\"'][^>]*>\s*Con amor\s*<\/p>/i, '')
const escapeHtml = (value = '') => String(value).replace(/[&<>\"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' })[char])

const applyStorySectionTitle = (html, project) => {
  const title = escapeHtml(project?.story?.sectionTitle || 'Nuestra historia')
  const source = String(html || '')
  const storyMarker = /(<section\s+class=[\"']section[\"'][^>]*>\s*<p\s+class=[\"']eyebrow[\"'][^>]*>)Nuestra historia(<\/p>)/i
  if (!storyMarker.test(source)) return source
  return source.replace(storyMarker, `$1${title}$2`)
}

export function renderWeddingHTML(project) {
  const html = renderBaseWeddingHTML(project)
  return applyStorySectionTitle(stripUnconfiguredCoupleEyebrow(html), project)
}

export default renderWeddingHTML
