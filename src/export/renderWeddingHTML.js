import { buildWeddingHTML } from './exportWedding.js'

const escCssUrl = (value) => String(value || '')
  .replace(/\\/g, '\\\\')
  .replace(/"/g, '\\"')
  .replace(/</g, '%3C')
  .replace(/>/g, '%3E')

const escCssValue = (value) => String(value || '')
  .replace(/\\/g, '\\\\')
  .replace(/</g, '')
  .replace(/>/g, '')
  .replace(/"/g, '\\"')
  .replace(/;/g, '')

export function renderWeddingHTML(project) {
  let html = buildWeddingHTML(project)
  const appearance = project?.appearance || {}
  const typography = appearance.typography || {}
  const title = typography.title || {}

  // El elemento "Título" de Apariencia también controla el nombre
  // de los novios en la sección "Con amor".
  const titleFont = escCssValue(title.fontFamily || "'Playfair Display', serif")
  const titleSize = Number(title.fontSize) || 42
  const titleWeight = Number(title.fontWeight) || 500
  const titleLineHeight = Number(title.lineHeight) || 1.08
  const titleLetterSpacing = Number(title.letterSpacing) || 0
  const titleIsGradient = title.mode === 'gradient' && typeof title.gradient === 'string' && title.gradient.includes('gradient(')
  const titleColor = escCssValue(title.color || '#ffffff')
  const titleGradient = escCssValue(title.gradient || '')

  const titleTypographyCss = `<style id="wedding-title-typography">
    #couple h2{
      font-family:${titleFont} !important;
      font-size:${titleSize}px !important;
      font-weight:${titleWeight} !important;
      line-height:${titleLineHeight} !important;
      letter-spacing:${titleLetterSpacing}px !important;
      ${titleIsGradient
        ? `background:${titleGradient} !important;-webkit-background-clip:text !important;background-clip:text !important;color:transparent !important;`
        : `background:none !important;color:${titleColor} !important;`}
    }
    #couple h2 span{
      ${titleIsGradient
        ? `background:${titleGradient} !important;-webkit-background-clip:text !important;background-clip:text !important;color:transparent !important;`
        : `background:none !important;color:${titleColor} !important;`}
    }
  </style>`

  html = html.replace('</head>', `${titleTypographyCss}</head>`)

  const texture = String(appearance.backgroundTextureImage || '').trim()
  const enabled = appearance.backgroundTextureType === 'image' && texture.length > 0

  if (!enabled) return html

  const opacity = Math.max(0, Math.min(1, Number(appearance.backgroundTextureOpacity ?? 0.28)))
  const blend = ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light'].includes(appearance.backgroundTextureBlend)
    ? appearance.backgroundTextureBlend
    : 'soft-light'
  const url = escCssUrl(texture)

  // La textura funciona como una sola capa visual sobre toda la invitación.
  // En móviles se fija al viewport completo para que la niebla nunca deje
  // franjas laterales aunque exista scroll interno o una barra de desplazamiento.
  const textureCss = `<style id="wedding-global-texture">
    .phone{position:relative;isolation:isolate;overflow-y:auto;overflow-x:hidden;background:transparent;}
    .phone::before{content:"";position:sticky;display:block;top:0;left:0;width:100%;height:100svh;min-height:100svh;margin-bottom:-100svh;z-index:0;pointer-events:none;background-image:url("${url}");background-size:cover;background-position:center center;background-repeat:no-repeat;background-attachment:scroll;opacity:${opacity};mix-blend-mode:${blend};}
    .phone > *{position:relative;z-index:1;}
    @media(max-width:699px){
      html,body{width:100%;max-width:100%;overflow-x:hidden;}
      .phone{width:100%;max-width:none;min-height:100dvh;}
      .phone::before{position:fixed;inset:0;width:100vw;height:100dvh;min-height:100dvh;margin:0;background-size:cover;background-position:center center;background-repeat:no-repeat;}
    }
  </style>`

  return html.replace('</head>', `${textureCss}</head>`)
}

export default renderWeddingHTML
