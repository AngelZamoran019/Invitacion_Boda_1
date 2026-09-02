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

const applyDressCodeFields = (html, project) => {
  const dress = project?.dressCode || {}
  const sectionTitle = escapeHtml(dress.sectionTitle || 'Código de vestimenta')
  const subtitle = escapeHtml(dress.subtitle || 'Elegancia para celebrar')
  const menLabel = escapeHtml(dress.menLabel ?? 'Ellas')
  const womenLabel = escapeHtml(dress.womenLabel ?? 'Ellos')
  const menAttire = escapeHtml(dress.menAttire ?? dress.men ?? 'Formal')
  const womenAttire = escapeHtml(dress.womenAttire ?? dress.women ?? 'Formal')
  const source = String(html || '')
  const sectionMarker = /<section\s+class=["']section["'][^>]*>\s*<p\s+class=["']eyebrow["'][^>]*>\s*Código de vestimenta\s*<\/p>[\s\S]*?<\/section>/i
  if (!sectionMarker.test(source)) return source

  return source.replace(sectionMarker, (section) => {
    let result = section.replace(/(<p\s+class=["']eyebrow["'][^>]*>)[\s\S]*?(<\/p>)/i, `$1${sectionTitle}$2`)
    result = result.replace(/(<h2\b[^>]*>)[\s\S]*?(<\/h2>)/i, `$1${subtitle}$2`)
    let cardIndex = 0
    result = result.replace(/(<div\s+class=["']dress-card["'][^>]*>[\s\S]*?<span\b[^>]*>)[\s\S]*?(<\/span>)([\s\S]*?<strong\b[^>]*>)[\s\S]*?(<\/strong>)/gi, (match, spanOpen, spanClose, strongOpen, strongClose) => {
      const replacement = cardIndex === 0
        ? `${spanOpen}${menLabel}${spanClose}${strongOpen}${menAttire}${strongClose}`
        : `${spanOpen}${womenLabel}${spanClose}${strongOpen}${womenAttire}${strongClose}`
      cardIndex += 1
      return replacement
    })
    return result
  })
}

const applyGiftsFields = (html, project) => {
  const gifts = project?.gifts || {}
  const sectionTitle = escapeHtml(gifts.sectionTitle ?? 'Un detalle especial')
  const subtitle = escapeHtml(gifts.subtitle ?? 'subtitulo')
  const source = String(html || '')
  const sectionMarker = /<section\s+class=["']section["'][^>]*>\s*<p\s+class=["']eyebrow["'][^>]*>\s*Un detalle especial\s*<\/p>[\s\S]*?<\/section>/i
  if (!sectionMarker.test(source)) return source

  return source.replace(sectionMarker, (section) => {
    let result = section.replace(/(<p\s+class=["']eyebrow["'][^>]*>)[\s\S]*?(<\/p>)/i, `$1${sectionTitle}$2`)
    result = result.replace(/(<h2\b[^>]*>)[\s\S]*?(<\/h2>)/i, `$1${subtitle}$2`)
    return result
  })
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
  const raw = String(project?.countdown?.targetDate ?? '').trim()
  if (!raw) return ''

  let match = raw.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})\s*[Tt]\s*(\d{1,2})(?::?(\d{2}))?$/)
  if (match) {
    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])
    const hours = Number(match[4])
    const minutes = Number(match[5] || 0)
    if (hours <= 23 && minutes <= 59) {
      const date = new Date(year, month - 1, day, hours, minutes, 0, 0)
      if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
        const pad = value => String(value).padStart(2, '0')
        return `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}`
      }
    }
  }

  const normalized = raw.replace(/\s+/g, ' ')
  const parsedDate = parseEventDate(normalized)
  if (!parsedDate) return raw
  const timeMatch = normalized.match(/(?:T|\s)(\d{1,2})(?::?(\d{2}))?\s*(a\.?\s*m\.?|p\.?\s*m\.?)?$/i)
  if (!timeMatch) return raw
  const time = parseEventTime(`${timeMatch[1]}:${timeMatch[2] || '00'}${timeMatch[3] || ''}`)
  const { year, month, day } = parsedDate
  const date = new Date(year, month - 1, day, time.hours, time.minutes, 0, 0)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return raw
  const pad = value => String(value).padStart(2, '0')
  return `${year}-${pad(month)}-${pad(day)}T${pad(time.hours)}:${pad(time.minutes)}`
}

const normalizeCountdownTimer = (html) => {
  const source = String(html || '')
  const removeCountdownScripts = source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (script) => {
    const body = script.replace(/^<script\b[^>]*>|<\/script>$/gi, '')
    const isCountdownScript = /(?:getElementById\s*\(\s*["'](?:days|hours|minutes|seconds)["']\s*\)|\.countdown\b)/i.test(body) && /setInterval|Date\s*\(/.test(body)
    return isCountdownScript ? '' : script
  })
  const targetMatch = source.match(/data-countdown-target=["']([^"']*)["']/i)
  const target = targetMatch ? targetMatch[1] : ''
  if (!target) return removeCountdownScripts
  const countdownScript = `<script id="wedding-countdown-timer">(()=>{const raw=${JSON.stringify(target)};const match=String(raw).match(/^(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2})$/);if(!match)return;const target=new Date(Number(match[1]),Number(match[2])-1,Number(match[3]),Number(match[4]),Number(match[5]),0,0).getTime();const tick=()=>{const diff=Math.max(0,target-Date.now());const total=Math.floor(diff/1000);const days=Math.floor(total/86400);const hours=Math.floor(total%86400/3600);const minutes=Math.floor(total%3600/60);const seconds=total%60;const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=String(value).padStart(2,'0')};set('days',days);set('hours',hours);set('minutes',minutes);set('seconds',seconds)};tick();setInterval(tick,1000)})()</script>`
  return removeCountdownScripts.replace('</body>', `${countdownScript}</body>`)
}

const applyCoverPositionStyles = (html, project) => {
  const cover = project?.coverSection || {}
  const safe = (value) => {
    const number = Number(value)
    if (!Number.isFinite(number)) return 0
    return Math.max(-300, Math.min(300, number))
  }

  const eyebrowY = safe(cover.eyebrowPositionY)
  const titleY = safe(cover.titlePositionY)
  const dateY = safe(cover.datePositionY)
  const buttonY = safe(cover.buttonPositionY)
  const ornamentY = safe(cover.ornamentPositionY)
  const lineY = safe(cover.linePositionY)

  const positionCss = `<style id="wedding-cover-position-export">
    .phone>.cover>.ornament{position:relative!important;top:${ornamentY}px!important}
    .phone>.cover>.eyebrow{position:relative!important;top:${eyebrowY}px!important}
    .phone>.cover>h1{position:relative!important;top:${titleY}px!important}
    .phone>.cover>.date{position:relative!important;top:${dateY}px!important}
    .phone>.cover>.button{position:relative!important;top:${buttonY}px!important}
    .phone>.cover>.line{position:relative!important;top:${lineY}px!important}
  </style>`

  return String(html || '').replace('</head>', `${positionCss}</head>`)
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
    gifts: {
      ...(project?.gifts || {}),
      title: project?.gifts?.subtitle ?? 'subtitulo',
      message: '',
    },
  }
  let html = renderBaseWeddingHTML(renderProject)
  if (countdownTarget) html = html.replace(/<section\s+class=["']section["'][^>]*>(?=\s*<p\s+class=["']eyebrow["'][^>]*>La cuenta regresiva comienza)/i, match => match.replace('>', ` data-countdown-target="${escapeHtml(countdownTarget)}">`))
  html = normalizeCountdownTimer(html)
  const withDressCode = applyDressCodeFields(html, project)
  const withGifts = applyGiftsFields(withDressCode, project)
  const withEventDate = applyEventDate(removeEventVenues(applyCountdownSectionTitle(applyEventSectionTitle(applyStorySectionTitle(stripUnconfiguredCoupleEyebrow(withGifts), project), project), project), project), project)
  const withCoverPositions = applyCoverPositionStyles(withEventDate, project)
  return preserveEditableCase(withCoverPositions.replace(/>Invalid Date/gi, `>${escapeHtml(cleanEventDateText(project?.event?.date || ''))}`))
}

export default renderWeddingHTML
