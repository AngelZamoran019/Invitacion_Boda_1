import { getWeddingFontFamily } from '../fonts/weddingFonts.js'

const clampPosition = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.max(-300, Math.min(300, number))
}

const validColor = (value, fallback) => /^#[0-9a-fA-F]{6}$/.test(String(value || '')) ? String(value) : fallback
const validGradient = (value) => typeof value === 'string' && value.includes('gradient(') && (value.match(/#[0-9a-fA-F]{6}/g) || []).length >= 2 ? value : ''
const validSize = (value, fallback) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback
}
const escapeHtml = (value = '') => String(value).replace(/[&<>\"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[char]))

export function applyCoverPositionsToExport(html, project) {
  const cover = project?.coverSection || {}
  const position = (value) => `transform:translateY(${clampPosition(value)}px)!important;`
  const paint = (mode, color, gradient, fallback, size, font) => {
    const safeColor = validColor(color, fallback)
    const safeGradient = validGradient(gradient)
    const sizeRule = `font-size:${validSize(size, 16)}px!important;`
    const fontRule = `font-family:${getWeddingFontFamily(font || 'Arial')}!important;`
    if (mode === 'gradient' && safeGradient) return `background:${safeGradient}!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;-webkit-text-fill-color:transparent!important;${sizeRule}${fontRule}`
    return `background:none!important;color:${safeColor}!important;-webkit-text-fill-color:${safeColor}!important;${sizeRule}${fontRule}`
  }

  const ornamentPaint = paint(cover.ornamentMode, cover.ornamentColor, cover.ornamentGradient, '#ffffff', cover.ornamentSize, 'Arial')
  const eyebrowPaint = paint(cover.eyebrowMode, cover.eyebrowColor, cover.eyebrowGradient, '#ffffff', cover.eyebrowSize, cover.eyebrowFont)
  const titlePaint = paint(cover.titleMode, cover.titleColor, cover.titleGradient, '#ffffff', cover.titleSize, cover.titleFont)
  const datePaint = paint(cover.dateMode, cover.dateColor, cover.dateGradient, '#ffffff', cover.dateSize, cover.dateFont)
  const buttonPaint = paint(cover.buttonMode, cover.buttonColor, cover.buttonGradient, '#ffffff', cover.buttonSize, cover.buttonFont)
  const lineColor = validColor(cover.lineColor, validColor(project?.appearance?.accentColor, '#c9a86a'))
  const lineGradient = validGradient(cover.lineGradient)
  const lineSize = validSize(cover.lineSize, 70)
  const linePaint = cover.lineMode === 'gradient' && lineGradient
    ? `background:${lineGradient}!important;width:${lineSize}px!important;height:1px!important;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 20%,#000 80%,transparent 100%)!important;mask-image:linear-gradient(90deg,transparent 0%,#000 20%,#000 80%,transparent 100%)!important;`
    : `background:linear-gradient(90deg,transparent 0%,${lineColor} 20%,${lineColor} 80%,transparent 100%)!important;width:${lineSize}px!important;height:1px!important;-webkit-mask-image:none!important;mask-image:none!important;`

  const rules = `
    .phone>.cover>.ornament{${ornamentPaint}${position(cover.ornamentPositionY)}}
    .phone>.cover>.eyebrow{${eyebrowPaint}${position(cover.eyebrowPositionY)}}
    .phone>.cover>h1{${titlePaint}${position(cover.titlePositionY)}}
    .phone>.cover>.date{${datePaint}${position(cover.datePositionY)}}
    .phone>.cover>.button{${buttonPaint}${position(cover.buttonPositionY)}}
    .phone>.cover>.line{${linePaint}${position(cover.linePositionY)}}
    .phone>.cover.cover-animation-finished>.ornament{${position(cover.ornamentPositionY)}}
    .phone>.cover.cover-animation-finished>.eyebrow{${position(cover.eyebrowPositionY)}}
    .phone>.cover.cover-animation-finished>h1{${position(cover.titlePositionY)}}
    .phone>.cover.cover-animation-finished>.date{${position(cover.datePositionY)}}
    .phone>.cover.cover-animation-finished>.button{${position(cover.buttonPositionY)}}
    .phone>.cover.cover-animation-finished>.line{${position(cover.linePositionY)}}
  `
  const buttonLabel = escapeHtml(String(cover.buttonLabel ?? 'Abrir invitación'))
  const style = `<style id="wedding-vp-cover-sync">${rules}</style>`
  const source = String(html || '')
  const withButtonText = source.replace(/(<button\s+class=["']button["'][^>]*>)[\s\S]*?(<\/button>)/i, `$1${buttonLabel}$2`)
  return withButtonText.includes('id="wedding-vp-cover-sync"')
    ? withButtonText.replace(/<style id="wedding-vp-cover-sync">[\s\S]*?<\/style>/i, style)
    : withButtonText.replace('</head>', `${style}</head>`)
}

export default applyCoverPositionsToExport
