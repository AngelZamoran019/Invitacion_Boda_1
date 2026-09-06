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
  const target = sections.find(section => /<p\s+class=["']eyebrow["'][^>]*>\s*Un detalle especial\s*<\/p>/i.test(section) && /<h2\b/i.test(section)) || ''
  if (!target) return source
  const sectionTitle = escapeHtml(gifts.sectionTitle ?? 'Un detalle especial')
  const subtitle = escapeHtml(gifts.subtitle ?? 'subtitulo')
  const note = String(gifts.note ?? '')
  const buttonLabel = escapeHtml(gifts.buttonLabel ?? 'Ver mesa de regalos')
  let updated = target.replace(/^<section\s+class=["']section["']/, '<section class="section gifts-content-section"').replace(/(<p\s+class=["']eyebrow["'][^>]*>)[\s\S]*?(<\/p>)/i, `$1${sectionTitle}$2`).replace(/(<h2\b[^>]*>)[\s\S]*?(<\/h2>)/i, `$1${subtitle}$2`)
  const notePattern = /<p\s+class=["']text["'][^>]*>[\s\S]*?<\/p>/i
  if (note) updated = notePattern.test(updated) ? updated.replace(notePattern, `<p class="text">${escapeHtml(note)}</p>`) : updated.replace(/<\/section>\s*$/i, `<p class="text">${escapeHtml(note)}</p></section>`)
  else if (notePattern.test(updated)) updated = updated.replace(notePattern, '')
  updated = updated.replace(/(<a\s+[^>]*class=["'][^"']*\bbutton\b[^"']*["'][^>]*>)[\s\S]*?(<\/a>)/i, `$1${buttonLabel}$2`)
  const result = source.replace(target, updated)
  const css = `<style id="wedding-gifts-editor-parity">.phone>.section.gifts-content-section>.eyebrow{${paint(gifts, 'sectionTitle', 11)}}.phone>.section.gifts-content-section>h2{${paint(gifts, 'subtitle', 32)}}.phone>.section.gifts-content-section>.text{${paint(gifts, 'note', 16)}}.phone>.section.gifts-content-section>.button,.phone>.section.gifts-content-section>a.button{${paint(gifts, 'buttonLabel', 13)}}</style>`
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

const hexToRgba = (value, opacity) => {
  const color = safeColor(value, '#000000')
  const red = parseInt(color.slice(1, 3), 16)
  const green = parseInt(color.slice(3, 5), 16)
  const blue = parseInt(color.slice(5, 7), 16)
  const alpha = Math.max(0, Math.min(1, Number.isFinite(Number(opacity)) ? Number(opacity) : 0.45))
  return `rgba(${red},${green},${blue},${alpha})`
}

const effectRule = (item = {}, prefix) => {
  const shadowEnabled = item[prefix + 'ShadowEnabled'] === true
  const outlineEnabled = item[prefix + 'OutlineEnabled'] === true
  const letterSpacing = Number(item[prefix + 'LetterSpacing'])
  const lineHeight = Number(item[prefix + 'LineHeight'])
  const textOpacity = Number(item[prefix + 'TextOpacity'])
  const parts = []
  if (shadowEnabled) {
    const x = Number.isFinite(Number(item[prefix + 'ShadowX'])) ? Math.max(-30, Math.min(30, Number(item[prefix + 'ShadowX']))) : 2
    const y = Number.isFinite(Number(item[prefix + 'ShadowY'])) ? Math.max(-30, Math.min(30, Number(item[prefix + 'ShadowY']))) : 3
    const blur = Number.isFinite(Number(item[prefix + 'ShadowBlur'])) ? Math.max(0, Math.min(50, Number(item[prefix + 'ShadowBlur']))) : 8
    parts.push(`text-shadow:${x}px ${y}px ${blur}px ${hexToRgba(item[prefix + 'ShadowColor'], item[prefix + 'ShadowOpacity'])}!important;`)
  } else {
    parts.push('text-shadow:none!important;')
  }
  if (outlineEnabled) {
    const width = Number.isFinite(Number(item[prefix + 'OutlineWidth'])) ? Math.max(0, Math.min(10, Number(item[prefix + 'OutlineWidth']))) : 1
    parts.push(`-webkit-text-stroke:${width}px ${safeColor(item[prefix + 'OutlineColor'], '#000000')}!important;paint-order:stroke fill;`)
  } else {
    parts.push('-webkit-text-stroke:0 transparent!important;')
  }
  if (Number.isFinite(letterSpacing)) parts.push(`letter-spacing:${Math.max(-10, Math.min(30, letterSpacing))}px!important;`)
  if (Number.isFinite(lineHeight) && lineHeight > 0) parts.push(`line-height:${Math.max(0.8, Math.min(4, lineHeight))}!important;`)
  if (Number.isFinite(textOpacity)) parts.push(`--wedding-text-opacity:${Math.max(0, Math.min(1, textOpacity))};`)
  return parts.join('')
}

const applyTextEffects = (html, project) => {
  const p = project || {}
  const selectors = [
    [p.coverSection, 'eyebrow', '.phone>.cover>.eyebrow'], [p.coverSection, 'title', '.phone>.cover>h1'], [p.coverSection, 'date', '.phone>.cover>.date'], [p.coverSection, 'button', '.phone>.cover>.button'],
    [p.couple, 'displayNames', '.phone>#couple>h2'], [p.couple, 'quote', '.phone>#couple>.text'],
    [p.story, 'sectionTitle', '.phone>.section.story-content-section>.eyebrow'], [p.story, 'title', '.phone>.section.story-content-section>h2'], [p.story, 'text', '.phone>.section.story-content-section>.text'],
    [p.event, 'sectionTitle', '.phone>.section.event-content-section>.eyebrow'], [p.event, 'date', '.phone>.section.event-content-section>h2'], [p.event, 'time', '.phone>.section.event-content-section>h2+p'], [p.event, 'ceremonyTitle', '.phone>.section.event-content-section>.event-card:nth-of-type(1)>strong'], [p.event, 'ceremonyAddress', '.phone>.section.event-content-section>.event-card:nth-of-type(1)>small'], [p.event, 'receptionTitle', '.phone>.section.event-content-section>.event-card:nth-of-type(2)>strong'], [p.event, 'receptionAddress', '.phone>.section.event-content-section>.event-card:nth-of-type(2)>small'],
    [p.countdown, 'sectionTitle', '.phone>.section.countdown-content-section>.eyebrow'], [p.countdown, 'numbers', '.phone>.section.countdown-content-section .countdown strong'], [p.countdown, 'text', '.phone>.section.countdown-content-section .countdown span'],
    [p.dressCode, 'sectionTitle', '.phone>.section.dress-code-content-section>.eyebrow'], [p.dressCode, 'subtitle', '.phone>.section.dress-code-content-section>h2'], [p.dressCode, 'menLabel', '.phone>.section.dress-code-content-section .dress-card:nth-child(1)>span'], [p.dressCode, 'womenLabel', '.phone>.section.dress-code-content-section .dress-card:nth-child(2)>span'], [p.dressCode, 'menAttire', '.phone>.section.dress-code-content-section .dress-card:nth-child(1)>strong'], [p.dressCode, 'womenAttire', '.phone>.section.dress-code-content-section .dress-card:nth-child(2)>strong'], [p.dressCode, 'note', '.phone>.section.dress-code-content-section>.text'],
    [p.gifts, 'sectionTitle', '.phone>.section.gifts-content-section>.eyebrow'], [p.gifts, 'subtitle', '.phone>.section.gifts-content-section>h2'], [p.gifts, 'buttonLabel', '.phone>.section.gifts-content-section>.button,.phone>.section.gifts-content-section>a.button'], [p.gifts, 'note', '.phone>.section.gifts-content-section>.text'],
    [p.confirmation, 'sectionTitle', '.phone>.section.confirmation-content-section>.eyebrow'], [p.confirmation, 'subtitle', '.phone>.section.confirmation-content-section>h2'], [p.confirmation, 'message', '.phone>.section.confirmation-content-section>.text'], [p.confirmation, 'nameLabel', '.phone>.section.confirmation-content-section .rsvp-name-label'], [p.confirmation, 'attendanceLabel', '.phone>.section.confirmation-content-section .rsvp-attendance-label'], [p.confirmation, 'guestsLabel', '.phone>.section.confirmation-content-section .rsvp-guests-label'], [p.confirmation, 'messageFieldLabel', '.phone>.section.confirmation-content-section .rsvp-message-label'], [p.confirmation, 'buttonLabel', '.phone>.section.confirmation-content-section .rsvp-form .button,.phone>.section.confirmation-content-section>.button,.phone>.section.confirmation-content-section a.button'], [p.confirmation, 'successMessage', '.phone>.section.confirmation-content-section #rsvp-success,.phone>.section.confirmation-content-section #rsvp-success .success'],
    [p.closing, 'message', '.phone>.closing.closing-content-section>.text'],
  ]
  const rules = selectors.map(([item, prefix, selector]) => `${selector}{${effectRule(item, prefix)}}`).join('')
  const css = `<style id="wedding-text-effects">${rules}</style>`
  const source = String(html || '')
  if (source.includes('id="wedding-text-effects"')) return source.replace(/<style id="wedding-text-effects">[\s\S]*?<\/style>/i, css)
  return source.replace('</head>', `${css}</head>`)
}

export function applyWeddingEditorParity(html, project) {
  const withGifts = applyGiftsParity(html, project)
  const withConfirmation = applyConfirmationSuccessParity(withGifts, project)
  const withEventSpacing = applyEventTimeSpacingParity(withConfirmation)
  return applyTextEffects(withEventSpacing, project)
}

export default applyWeddingEditorParity
