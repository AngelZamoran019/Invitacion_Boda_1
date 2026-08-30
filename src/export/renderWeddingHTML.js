import { buildWeddingHTML } from './exportWedding.js'

const escCssUrl = value => String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/</g, '%3C').replace(/>/g, '%3E')

export function renderWeddingHTML(project) {
  let html = buildWeddingHTML(project)
  const appearance = project?.appearance || {}
  const texture = appearance.backgroundTextureImage || ''
  const enabled = appearance.backgroundTextureType === 'image' && texture

  if (!enabled) return html

  const opacity = Math.max(0, Math.min(1, Number(appearance.backgroundTextureOpacity ?? 0.28)))
  const blend = ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light'].includes(appearance.backgroundTextureBlend)
    ? appearance.backgroundTextureBlend
    : 'soft-light'
  const size = appearance.backgroundTextureSize || 'cover'
  const position = appearance.backgroundTexturePosition || 'center'
  const url = escCssUrl(texture)

  const textureCss = `<style id="wedding-global-texture">
    .phone{position:relative;isolation:isolate;}
    .phone::before{content:"";display:block;position:sticky;top:0;width:100%;height:100svh;margin-bottom:-100svh;z-index:0;pointer-events:none;background-image:url("${url}");background-size:${size};background-position:${position};background-repeat:no-repeat;opacity:${opacity};mix-blend-mode:${blend};}
    .phone > *{position:relative;z-index:1;}
  </style>`

  return html.replace('</head>', `${textureCss}</head>`)
}

export default renderWeddingHTML
