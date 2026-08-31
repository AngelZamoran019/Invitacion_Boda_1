import { renderWeddingHTML as renderBaseWeddingHTML } from './renderWeddingHTML.js'

const stripUnconfiguredCoupleEyebrow = (html) => String(html || '').replace(/<p\b[^>]*class=["']eyebrow["'][^>]*>\s*Con amor\s*<\/p>/i, '')
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

const applyStorySectionTitle = (html, project) => {
  const title = escapeHtml(project?.story?.sectionTitle || 'Nuestra historia')
  const source = String(html || '')
  const storyMarker = /(<section\s+class=["']section["'][^>]*>\s*<p\s+class=["']eyebrow["'][^>]*>)Nuestra historia(<\/p>)/i
  if (!storyMarker.test(source)) return source
  return source.replace(storyMarker, `$1${title}$2`)
}

const applyEventSectionTitle = (html, project) => {
  const title = escapeHtml(project?.event?.sectionTitle || 'El gran día')
  const source = String(html || '')
  const eventMarker = /(<section\s+class=["']section["'][^>]*>\s*<p\s+class=["']eyebrow["'][^>]*>)El gran día(<\/p>)/i
  if (!eventMarker.test(source)) return source
  return source.replace(eventMarker, `$1${title}$2`)
}

const applyCountdownSectionTitle = (html, project) => {
  const title = escapeHtml(project?.countdown?.sectionTitle || 'La cuenta regresiva comienza')
  const source = String(html || '')
  const marker = /(<section\s+class=["']section["'][^>]*>\s*<p\s+class=["']eyebrow["'][^>]*>)La cuenta regresiva comienza(<\/p>)/i
  if (!marker.test(source)) return source
  return source.replace(marker, `$1${title}$2`)
}

const removeEventVenues = (html) => {
  const source = String(html || '')
  return source.replace(/(<div\s+class=["']event-card["'][^>]*>[\s\S]*?)<span\b[^>]*>[\s\S]*?<\/span>/gi, '$1')
}

const cleanEventDateText = (value) => String(value ?? '').replace(/\s*<\/h2>\s*$/i, '').trim()

const applyEventDate = (html, project) => {
  const date = cleanEventDateText(project?.event?.date)
  if (!date) return String(html || '')
  const source = String(html || '')
  const escapedDate = escapeHtml(date)
  const eventSection = /(<section\s+class=["']section["'][^>]*>\s*<p\s+class=["']eyebrow["'][^>]*>\s*(?:El gran día|[^<]*)<\/p>[\s\S]*?)(<div\s+class=["']event-card["'])/i
  if (!eventSection.test(source)) return source
  return source.replace(eventSection, (fullMatch, beforeCards, firstCard) => beforeCards.replace(/(<h2\b[^>]*>)[\s\S]*?(<\/h2>)/i, `$1${escapedDate}$2`) + firstCard)
}

const normalizeDateText = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ')

const parseEventDate = (value) => {
  const raw = String(value || '').trim()
  if (!raw) return null

  let match = raw.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/)
  if (match) return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }

  match = raw.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})/)
  if (match) return { year: Number(match[3]), month: Number(match[2]), day: Number(match[1]) }

  const normalized = normalizeDateText(raw)
  const months = {
    enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
    julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10,
    noviembre: 11, diciembre: 12,
  }
  const monthPattern = Object.keys(months).join('|')
  match = normalized.match(new RegExp(`(?:^|\\s)(\\d{1,2})\\s+(?:de\\s+)?(${monthPattern})\\s+(?:de\\s+)?(\\d{4})(?:\\s|$)`, 'i'))
  if (!match) match = normalized.match(new RegExp(`(?:^|\\s)(${monthPattern})\\s+(\\d{1,2})\\s*,?\\s*(\\d{4})(?:\\s|$)`, 'i'))
  if (match) {
    const first = match[1]
    if (/^\d+$/.test(first)) return { year: Number(match[3]), month: months[match[2]], day: Number(first) }
    return { year: Number(match[3]), month: months[first], day: Number(match[2]) }
  }

  return null
}

const parseEventTime = (value) => {
  const raw = String(value || '').trim().toLowerCase()
  if (!raw) return { hours: 0, minutes: 0 }
  const match = raw.match(/(\d{1,2})(?::|\.)(\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?)?/i) || raw.match(/^(\d{1,2})\s*(a\.?\s*m\.?|p\.?\s*m\.?)$/i)
  if (!match) return { hours: 0, minutes: 0 }
  let hours = Number(match[1])
  const minutes = match[2] && /^\d+$/.test(match[2]) ? Number(match[2]) : 0
  const period = match[3] || match[2]
  if (period) {
    const normalizedPeriod = period.replace(/\s/g, '').replace(/\./g, '')
    if (normalizedPeriod === 'pm' && hours < 12) hours += 12
    if (normalizedPeriod === 'am' && hours === 12) hours = 0
  }
  if (hours > 23 || minutes > 59) return { hours: 0, minutes: 0 }
  return { hours, minutes }
}

const buildCountdownTarget = (project) => {
  const parsedDate = parseEventDate(project?.event?.date)
  if (!parsedDate) return ''
  const time = parseEventTime(project?.event?.time)
  const { year, month, day } = parsedDate
  const date = new Date(year, month - 1, day, time.hours, time.minutes, 0, 0)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return ''
  const pad = value => String(value).padStart(2, '0')
  return `${year}-${pad(month)}-${pad(day)}T${pad(time.hours)}:${pad(time.minutes)}`
}

const preserveEditableCase = (html) => `${String(html || '')}<style id="wedding-preserve-editable-case">.eyebrow,.section-title-special,.cover h1,.cover-subtitle,.date,.venue,.text,.section h2,.event-card strong,.event-card span,.event-card small,.countdown span,.dress-card span,.dress-card strong,.rsvp-form label,.success,.button{ text-transform:none !important; }</style>`

export function renderWeddingHTML(project) {
  const countdownTarget = buildCountdownTarget(project)
  const renderProject = {
    ...project,
    countdown: {
      ...(project?.countdown || {}),
      targetDate: countdownTarget,
    },
  }
  const html = renderBaseWeddingHTML(renderProject)
  const withEventDate = applyEventDate(removeEventVenues(applyCountdownSectionTitle(applyEventSectionTitle(applyStorySectionTitle(stripUnconfiguredCoupleEyebrow(html), project), project), project)), project)
  return preserveEditableCase(withEventDate.replace(/>Invalid Date/gi, `>${escapeHtml(cleanEventDateText(project?.event?.date || ''))}`))
}

export default renderWeddingHTML
