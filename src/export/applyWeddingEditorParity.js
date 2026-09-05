import { getWeddingFontFamily } from '../fonts/weddingFonts.js'

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

const safeColor = (value, fallback = '#ffffff') => /^#[0-9a-fA-F]{6}$/.test(String(value || '')) ? String(value) : fallback
const safeGradient = value => typeof value === 'string' && value.includes('gradient(') && (value.match(/#[0-9a-fA-F]{6}/g) || []).length >= 2 ? value : ''
const safeSize = (value, fallback) => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : fallback
}
const safePosition = value => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(-300, Math.min(300, number)) : 0
}

const paint = (item, prefix, fallbackSize) => {
  const gradient = safeGradient(item?.[prefix + 'Gradient'])
  const color = safeColor(item?.[prefix + 'Color'])
  const paintRule = item?.[prefix + 'Mode'] === 'gradient' && gradient
    ? `background:${gradient}!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;-webkit-text-fill-color:transparent!important;`
    : `background:none!important;color:${color}!important;-webkit-text-fill-color:${color}!important;`
  return `${paintRule}font-family:${getWeddingFontFamily(item?.[prefix + 'Font'] || 'Arial')}!important;font-size:${safeSize(item?.[prefix + 'Size'], fallbackSize)}px!important;position:relative!important;top:${safePosition(item?.[prefix + 'PositionY'])}px!important;`
}

const applyGiftsParity = (html, project) => {
  const gifts = project?.gifts || {}
  const source = String(html || '')
  const sections = source.match(/<section\s+class=["']section["'][^>]*>[\s\S]*?<\/section>/gi) || []
  const target = sections.find(section =>
    /<p\s+class=["']eyebrow["'][^>]*>\s*Un detalle especial\s*<\/p>/i.test(section) &&
    /<h2\b/i.test(section)
  ) || ''
  if (!target) return source

  const sectionTitle = escapeHtml(gifts.sectionTitle ?? 'Un detalle especial')
  const subtitle = escapeHtml(gifts.subtitle ?? 'subtitulo')
  const note = String(gifts.note ?? '')
  const buttonLabel = escapeHtml(gifts.buttonLabel ?? 'Ver mesa de regalos')

  let updated = target.replace(/^<section\s+class=["']section["']/, '<section class="section gifts-content-section"')
    .replace(/(<p\s+class=["']eyebrow["'][^>]*>)[\s\S]*?(<\/p>)/i, `$1${sectionTitle}$2`)
    .replace(/(<h2\b[^>]*>)[\s\S]*?(<\/h2>)/i, `$1${subtitle}$2`)

  const notePattern = /<p\s+class=["']text["'][^>]*>[\s\S]*?<\/p>/i
  if (note) {
    const noteHtml = `<p class="text">${escapeHtml(note)}</p>`
    updated = notePattern.test(updated)
      ? updated.replace(notePattern, noteHtml)
      : updated.replace(/<\/section>\s*$/i, `${noteHtml}</section>`)
  } else if (notePattern.test(updated)) {
    updated = updated.replace(notePattern, '')
  }

  updated = updated.replace(/(<a\s+[^>]*class=["'][^"']*\bbutton\b[^"']*["'][^>]*>)[\s\S]*?(<\/a>)/i, `$1${buttonLabel}$2`)
  const result = source.replace(target, updated)

  const css = `<style id="wedding-gifts-editor-parity">
    .phone>.section.gifts-content-section>.eyebrow{${paint(gifts, 'sectionTitle', 11)}}
    .phone>.section.gifts-content-section>h2{${paint(gifts, 'subtitle', 32)}}
    .phone>.section.gifts-content-section>.text{${paint(gifts, 'note', 16)}}
    .phone>.section.gifts-content-section>.button,.phone>.section.gifts-content-section>a.button{${paint(gifts, 'buttonLabel', 13)}}
  </style>`

  if (result.includes('id="wedding-gifts-editor-parity"')) return result.replace(/<style id="wedding-gifts-editor-parity">[\s\S]*?<\/style>/i, css)
  return result.replace('</head>', `${css}</head>`)
}

const applyConfirmationSuccessParity = (html, project) => {
  const confirmation = project?.confirmation || {}
  const successMessage = escapeHtml(confirmation.successMessage ?? '¡Gracias! Hemos recibido tu confirmación.')
  const source = String(html || '')
  const pattern = /(document\.getElementById\(['"]rsvp-success['"]\)\.innerHTML\s*=\s*['"])<div class=["']success["']>[\s\S]*?<\/div>(['"])/i
  if (!pattern.test(source)) return source
  return source.replace(pattern, `$1<div class="success">${successMessage}</div>$2`)
}

const applyEventTimeSpacingParity = (html) => {
  const source = String(html || '')
  const eventSection = /<section\s+class=["']section["'][^>]*>[\s\S]*?<div\s+class=["']event-card["'][\s\S]*?<\/section>/i
  if (!eventSection.test(source)) return source
  const css = `<style id="wedding-event-time-spacing-parity">.phone>.section:has(.event-card)>h2+p{margin:0!important;}</style>`
  if (source.includes('id="wedding-event-time-spacing-parity"')) return source.replace(/<style id="wedding-event-time-spacing-parity">[\s\S]*?<\/style>/i, css)
  return source.replace('</head>', `${css}</head>`)
}

export function applyWeddingEditorParity(html, project) {
  const withGifts = applyGiftsParity(html, project)
  const withConfirmation = applyConfirmationSuccessParity(withGifts, project)
  return applyEventTimeSpacingParity(withConfirmation)
}

export default applyWeddingEditorParity
