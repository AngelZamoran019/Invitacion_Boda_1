import { buildWeddingHTML } from './exportWedding.js'

const escCssUrl = (value) => String(value || '')
  .replace(/\\/g, '\\\\')
  .replace(/"/g, '\\"')
  .replace(/</g, '%3C')
  .replace(/>/g, '%3E')

export function renderWeddingHTML(project) {
  const html = buildWeddingHTML(project)
  const appearance = project?.appearance || {}
  const texture = String(appearance.backgroundTextureImage || '').trim()
  const enabled = appearance.backgroundTextureType === 'image' && texture.length > 0

  if (!enabled) return html

  const opacity = Math.max(0, Math.min(1, Number(appearance.backgroundTextureOpacity ?? 0.28)))
  const blend = ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light'].includes(appearance.backgroundTextureBlend)
    ? appearance.backgroundTextureBlend
    : 'soft-light'
  const size = ['cover', 'contain', '100% 100%', 'auto'].includes(appearance.backgroundTextureSize)
    ? appearance.backgroundTextureSize
    : 'cover'
  const position = ['center', 'top', 'bottom', 'left', 'right'].includes(appearance.backgroundTexturePosition)
    ? appearance.backgroundTexturePosition
    : 'center'
  const url = escCssUrl(texture)

  // Capa visual únicamente. No modifica el flujo ni puede tapar el contenido.
  const textureCss = `<style id="wedding-global-texture">
    .phone{position:relative;isolation:isolate;}
    .phone::before{content:"";position:sticky;display:block;top:0;left:0;width:100%;height:100svh;margin-bottom:-100svh;z-index:0;pointer-events:none;background-image:url("${url}");background-size:${size};background-position:${position};background-repeat:no-repeat;background-attachment:scroll;opacity:${opacity};mix-blend-mode:${blend};}
    .phone > *{position:relative;z-index:1;}
  </style>`

  return html.replace('</head>', `${textureCss}</head>`)
}

export default renderWeddingHTML
