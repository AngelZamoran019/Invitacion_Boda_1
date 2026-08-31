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

const validGradient = value => typeof value === 'string' && value.includes('gradient(') && (value.match(/#[0-9a-fA-F]{6}/g) || []).length >= 2 ? value : ''

export function renderWeddingHTML(project) {
  let html = buildWeddingHTML(project)
  const appearance = project?.appearance || {}
  const typography = appearance.typography || {}
  const title = typography.title || {}
  const specialSection = typography.sectionTitleSpecial || typography.sectionTitle || {}

  const titleFont = escCssValue(title.fontFamily || "'Playfair Display', serif")
  const titleSize = Number(title.fontSize) || 42
  const titleWeight = Number(title.fontWeight) || 500
  const titleLineHeight = Number(title.lineHeight) || 1.08
  const titleLetterSpacing = Number(title.letterSpacing) || 0
  const titleGradient = escCssValue(validGradient(title.gradient || ''))
  const titleIsGradient = title.mode === 'gradient' && Boolean(titleGradient)
  const titleColor = escCssValue(title.color || '#ffffff')

  const styleFor = (key, fallback) => {
    const value = typography[key] || {}
    const gradient = escCssValue(validGradient(value.gradient || ''))
    const isGradient = value.mode === 'gradient' && Boolean(gradient)
    const color = escCssValue(value.color || fallback)
    return {
      gradient,
      color,
      isGradient,
      paint: isGradient
        ? `background:${gradient} !important;-webkit-background-clip:text !important;background-clip:text !important;color:transparent !important;`
        : `background:none !important;color:${color} !important;`,
    }
  }

  const subtitleStyle = styleFor('subtitle', '#ffffff')
  const paragraphStyle = styleFor('paragraph', '#ffffff')
  const sectionStyle = styleFor('sectionTitle', '#ffffff')
  const labelStyle = styleFor('label', '#c9a86a')
  const smallStyle = styleFor('small', '#ffffff')
  const buttonStyle = styleFor('button', '#ffffff')

  const specialFont = escCssValue(specialSection.fontFamily || typography.sectionTitle?.fontFamily || "'Playfair Display', serif")
  const specialSize = Number(specialSection.fontSize) || Number(typography.sectionTitle?.fontSize) || 32
  const specialWeight = Number(specialSection.fontWeight) || Number(typography.sectionTitle?.fontWeight) || 500
  const specialLineHeight = Number(specialSection.lineHeight) || Number(typography.sectionTitle?.lineHeight) || 1.15
  const specialLetterSpacing = Number(specialSection.letterSpacing) || Number(typography.sectionTitle?.letterSpacing) || 0
  const specialGradient = escCssValue(validGradient(specialSection.gradient || ''))
  const specialIsGradient = specialSection.mode === 'gradient' && Boolean(specialGradient)
  const specialColor = escCssValue(specialSection.color || typography.sectionTitle?.color || '#ffffff')

  const titleTypographyCss = `<style id="wedding-typography">
    #couple h2{font-family:${titleFont} !important;font-size:${titleSize}px !important;font-weight:${titleWeight} !important;line-height:${titleLineHeight} !important;letter-spacing:${titleLetterSpacing}px !important;${titleIsGradient ? `background:${titleGradient} !important;-webkit-background-clip:text !important;background-clip:text !important;color:transparent !important;` : `background:none !important;color:${titleColor} !important;`}}
    #couple h2 span{${titleIsGradient ? `background:${titleGradient} !important;-webkit-background-clip:text !important;background-clip:text !important;color:transparent !important;` : `background:none !important;color:${titleColor} !important;`}}
    .cover h1{${titleIsGradient ? `background:${titleGradient} !important;-webkit-background-clip:text !important;background-clip:text !important;color:transparent !important;` : `color:${titleColor} !important;`}}
    .cover-subtitle{${subtitleStyle.paint}}
    .text{${paragraphStyle.paint}}
    .section h2{${sectionStyle.paint}}
    .eyebrow{${labelStyle.paint}}
    .date,.venue,.event-card strong,.event-card span,.event-card small,.countdown span,.dress-card span,.dress-card strong,.rsvp-form label{${smallStyle.paint}}
    .button{${buttonStyle.paint}}
    .section-title-special{font-family:${specialFont} !important;font-size:${specialSize}px !important;font-weight:${specialWeight} !important;line-height:${specialLineHeight} !important;letter-spacing:${specialLetterSpacing}px !important;${specialIsGradient ? `background:${specialGradient} !important;-webkit-background-clip:text !important;background-clip:text !important;color:transparent !important;` : `background:none !important;color:${specialColor} !important;`}}
  </style>`

  html = html.replace('</head>', `${titleTypographyCss}</head>`)

  const translucentCardsCss = `<style id="wedding-translucent-cards">
    .event-card,.countdown div,.dress-card,.rsvp-form input,.rsvp-form select,.rsvp-form textarea,.success,.button{background:rgb(255 255 255 / 9%) !important;border:1px solid rgb(255 255 255 / 22%) !important;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
    .event-card,.dress-card,.countdown div,.success,.button{box-shadow:inset 0 1px 0 rgb(255 255 255 / 7%)}
    #confirmacion .rsvp-form{background:transparent !important;border:0 !important;box-shadow:none !important;padding:0 !important}
    @media(max-width:699px){.event-card,.countdown div,.dress-card,.rsvp-form input,.rsvp-form select,.rsvp-form textarea,.success,.button{backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}}
  </style>`

  html = html.replace('</head>', `${translucentCardsCss}</head>`)

  const specialSectionTexts = [
    'estas cordialmente invitado a la boda de', 'nuestra cancion', 'nuestra canción', 'nuestra historia', 'el gran día', 'la cuenta regresiva comienza', 'codigo de vestimenta', 'código de vestimenta', 'un detalle especial', 'por favor',
  ]

  const specialSectionScript = `<script id="wedding-special-section-titles">(() => {
    const targets = new Set(${JSON.stringify(specialSectionTexts)});
    const normalize = value => String(value || '').trim().toLowerCase().replace(/[áàä]/g,'a').replace(/[éèë]/g,'e').replace(/[íìï]/g,'i').replace(/[óòö]/g,'o').replace(/[úùü]/g,'u');
    document.querySelectorAll('.eyebrow').forEach(el => { if (targets.has(normalize(el.textContent))) el.classList.add('section-title-special'); });
  })();</script>`

  html = html.replace('</body>', `${specialSectionScript}</body>`)

  const texture = String(appearance.backgroundTextureImage || '').trim()
  const enabled = appearance.backgroundTextureType === 'image' && texture.length > 0

  if (enabled) {
    const opacity = Math.max(0, Math.min(1, Number(appearance.backgroundTextureOpacity ?? 0.28)))
    const blend = ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light'].includes(appearance.backgroundTextureBlend)
      ? appearance.backgroundTextureBlend
      : 'soft-light'
    const url = escCssUrl(texture)

    const textureCss = `<style id="wedding-global-texture">
      .phone{position:relative;isolation:isolate;overflow-y:auto;overflow-x:hidden;background:transparent}
      .phone::before{content:"";position:fixed;inset:0;width:100%;height:100svh;min-height:100svh;z-index:0;pointer-events:none;background-image:url("${url}");background-size:cover;background-position:center center;background-repeat:no-repeat;opacity:${opacity};mix-blend-mode:${blend}}
      .phone > *{position:relative;z-index:2}
      @media(max-width:699px){html,body{width:100%;max-width:100%;overflow-x:hidden}.phone{width:100%;max-width:none;min-height:100dvh}.phone::before{width:100vw;height:100dvh;min-height:100dvh;background-size:cover;background-position:center center;background-repeat:no-repeat}}
    </style>`
    html = html.replace('</head>', `${textureCss}</head>`)
  }

  const couplePhoto = String(project?.couple?.photo || '').trim()
  if (couplePhoto) {
    const darkness = Math.max(0, Math.min(1, Number(project?.couple?.photoOverlayOpacity ?? 0.55)))
    const photoUrl = escCssUrl(couplePhoto)
    const coupleBackgroundCss = `<style id="wedding-couple-background">
      /* La fotografía pertenece exclusivamente a la pantalla inicial. */
      .phone{background:transparent !important}
      .phone > .cover{position:relative;isolation:isolate;overflow:hidden;background:transparent !important}
      .phone > .cover::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background-image:url("${photoUrl}");background-size:cover;background-position:center center;background-repeat:no-repeat}
      .phone > .cover::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:rgb(0 0 0 / ${darkness})}
      .phone > .cover > *{position:relative;z-index:2}
      /* Al terminar la portada, vuelve a verse únicamente el fondo configurado en Apariencia. */
      .phone > .section,.phone > .closing{background:var(--bg) !important}
      @media(max-width:699px){.phone > .cover{min-height:100dvh}.phone > .cover::before{inset:0;background-size:cover;background-position:center center}}
    </style>`
    html = html.replace('</head>', `${coupleBackgroundCss}</head>`)
  }

  return html
}

export default renderWeddingHTML
