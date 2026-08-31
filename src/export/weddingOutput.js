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

const applyEventSectionTitle = (html, project) => {
  const title = escapeHtml(project?.event?.sectionTitle || 'El gran día')
  const source = String(html || '')
  const eventMarker = /(<section\s+class=[\"']section[\"'][^>]*>\s*<p\s+class=[\"']eyebrow[\"'][^>]*>)El gran día(<\/p>)/i
  if (!eventMarker.test(source)) return source
  return source.replace(eventMarker, `$1${title}$2`)
}

const removeEventVenues = (html) => {
  const source = String(html || '')
  return source.replace(/(<div\s+class=[\"']event-card[\"'][^>]*>[\s\S]*?)<span\b[^>]*>[\s\S]*?<\/span>/gi, '$1')
}

const applyEventDate = (html, project) => {
  const date = String(project?.event?.date ?? '')
  if (!date.trim()) return String(html || '')
  const source = String(html || '')
  const escapedDate = escapeHtml(date)
  return source.replace(/(<section\s+class=[\"']section[\"'][^>]*>[\s\S]*?<div\s+class=[\"']event-card[\"'][^>]*>)/i, (sectionStart) => sectionStart.replace(/(<h2\b[^>]*>)[\s\S]*?(<\/h2>)/i, `$1${escapedDate}$2`))
}

const preserveEditableCase = (html) => `${String(html || '')}<style id="wedding-preserve-editable-case">.eyebrow,.section-title-special,.cover h1,.cover-subtitle,.date,.venue,.text,.section h2,.event-card strong,.event-card span,.event-card small,.countdown span,.dress-card span,.dress-card strong,.rsvp-form label,.success,.button{ text-transform:none !important; }</style>`

export function renderWeddingHTML(project) {
  const html = renderBaseWeddingHTML(project)
  return preserveEditableCase(applyEventDate(removeEventVenues(applyEventSectionTitle(applyStorySectionTitle(stripUnconfiguredCoupleEyebrow(html), project), project)), project))
}

export default renderWeddingHTML
