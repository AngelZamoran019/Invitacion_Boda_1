import { useEffect, useRef } from 'react'
import { renderWeddingHTML } from '../export/weddingOutput.js'
import { getWeddingFontFamily } from '../fonts/weddingFonts.js'

const applyConfirmationTexts = (html, project) => {
  const confirmation = project?.confirmation || {}
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
  const sectionTitle = String(confirmation.sectionTitle ?? 'Por favor').trim() || 'Por favor'
  const subtitle = String(confirmation.subtitle ?? confirmation.title ?? 'Confirma tu asistencia').trim() || 'Confirma tu asistencia'
  const message = String(confirmation.message ?? 'Ayúdanos confirmando tu asistencia').trim() || 'Ayúdanos confirmando tu asistencia'
  const buttonLabel = String(confirmation.buttonLabel ?? 'Confirmar asistencia').trim() || 'Confirmar asistencia'
  const successMessage = String(confirmation.successMessage ?? '¡Gracias! Hemos recibido tu confirmación.').trim() || '¡Gracias! Hemos recibido tu confirmación.'
  const source = String(html || '')
  const sections = source.match(/<section\b[^>]*>[\s\S]*?<\/section>/gi) || []
  const target = sections.find(section =>
    /\bid=["']confirmacion["']/i.test(section) ||
    /<form\s+class=["'][^"']*\brsvp-form\b[^"']*["']/i.test(section) ||
    /<form\s+[^>]*\bid=["']rsvp["']/i.test(section)
  ) || ''
  if (!target) return source

  let updated = target
    .replace(/(<p\s+class=["']eyebrow["'][^>]*>)[\s\S]*?(<\/p>)/i, `$1${esc(sectionTitle)}$2`)
    .replace(/(<h2\b[^>]*>)[\s\S]*?(<\/h2>)/i, `$1${esc(subtitle)}$2`)
    .replace(/(<p\s+class=["']text["'][^>]*>)[\s\S]*?(<\/p>)/i, `$1${esc(message)}$2`)
    .replace(/(<button\b[^>]*class=["'][^"']*\bbutton\b[^"']*["'][^>]*>)[\s\S]*?(<\/button>)/i, `$1${esc(buttonLabel)}$2`)

  const successPattern = /(<div\s+id=["']rsvp-success["'][^>]*>)[\s\S]*?(<\/div>)/i
  if (successPattern.test(updated)) {
    updated = updated.replace(successPattern, `$1<div class="success">${esc(successMessage)}</div>$2`)
  }

  return source.replace(target, updated)
}

const applyConfirmationContentStyles = (html, project) => {
  const confirmation = project?.confirmation || {}
  const safeColor = value => /^#[0-9a-fA-F]{6}$/.test(String(value || '')) ? String(value) : '#ffffff'
  const safeGradient = value => typeof value === 'string' && value.includes('gradient(') && (value.match(/#[0-9a-fA-F]{6}/g) || []).length >= 2 ? value : ''
  const safeSize = (value, fallback) => { const number = Number(value); return Number.isFinite(number) && number > 0 ? number : fallback }
  const safePosition = value => { const number = Number(value); return Number.isFinite(number) ? Math.max(-300, Math.min(300, number)) : 0 }
  const fontFamily = value => getWeddingFontFamily(value || 'Arial')
  const paint = (prefix, fallbackSize) => {
    const gradient = safeGradient(confirmation[prefix + 'Gradient'])
    const color = safeColor(confirmation[prefix + 'Color'])
    const paintRule = confirmation[prefix + 'Mode'] === 'gradient' && gradient
      ? `background:${gradient}!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;-webkit-text-fill-color:transparent!important;`
      : `background:none!important;color:${color}!important;-webkit-text-fill-color:${color}!important;`
    return `${paintRule}font-family:${fontFamily(confirmation[prefix + 'Font'])}!important;font-size:${safeSize(confirmation[prefix + 'Size'], fallbackSize)}px!important;position:relative!important;top:${safePosition(confirmation[prefix + 'PositionY'])}px!important;`
  }

  const css = `<style id="wedding-confirmation-content-styles">
    .phone>.section#confirmacion>.eyebrow{${paint('sectionTitle',11)}}
    .phone>.section#confirmacion>h2{${paint('subtitle',32)}}
    .phone>.section#confirmacion>.text{${paint('message',16)}}
    .phone>.section#confirmacion .rsvp-form .button{${paint('buttonLabel',13)}}\n    .phone>.section#confirmacion .rsvp-form .rsvp-name-label{${paint('nameLabel',12)}}
    .phone>.section#confirmacion .rsvp-form .rsvp-attendance-label{${paint('attendanceLabel',12)}}
    .phone>.section#confirmacion .rsvp-form .rsvp-guests-label{${paint('guestsLabel',12)}}
    .phone>.section#confirmacion .rsvp-form .rsvp-message-label{${paint('messageFieldLabel',12)}}
    .phone>.section#confirmacion #rsvp-success,.phone>.section#confirmacion #rsvp-success .success{${paint('successMessage',16)}}
    .phone>.section:has(.rsvp-form)>.eyebrow{${paint('sectionTitle',11)}}
    .phone>.section:has(.rsvp-form)>h2{${paint('subtitle',32)}}
    .phone>.section:has(.rsvp-form)>.text{${paint('message',16)}}
    .phone>.section:has(.rsvp-form) .rsvp-form .button{${paint('buttonLabel',13)}}
    .phone>.section:has(.rsvp-form) #rsvp-success,.phone>.section:has(.rsvp-form) #rsvp-success .success{${paint('successMessage',16)}}
  </style>`
  const source = String(html || '')
  if (source.includes('id="wedding-confirmation-content-styles"')) return source.replace(/<style id="wedding-confirmation-content-styles">[\s\S]*?<\/style>/i, css)
  return source.replace('</head>', `${css}</head>`)
}

const findGiftsSection = (source) => {
  const sections = String(source || '').match(/<section\s+class=["']section["'][^>]*>[\s\S]*?<\/section>/gi) || []
  return sections.find(section =>
    /<p\s+class=["']eyebrow["'][^>]*>\s*Un detalle especial\s*<\/p>/i.test(section) ||
    /<h2\b[^>]*>\s*Mesa de regalos\s*<\/h2>/i.test(section) ||
    /Su presencia es nuestro mejor regalo\./i.test(section)
  ) || ''
}

const applyGiftsContent = (html, project) => {
  const gifts = project?.gifts || {}
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
  const source = String(html || '')
  const target = findGiftsSection(source)
  if (!target) return source

  const sectionTitle = esc(gifts.sectionTitle ?? 'Un detalle especial')
  const subtitle = esc(gifts.subtitle ?? 'subtitulo')
  const buttonLabel = esc(gifts.buttonLabel ?? 'Ver mesa de regalos')
  const note = String(gifts.note ?? '')

  let updated = target
    .replace(/^<section\s+class=["']section["']/, '<section class="section gifts-content-section"')
    .replace(/(<p\s+class=["']eyebrow["'][^>]*>)[\s\S]*?(<\/p>)/i, `$1${sectionTitle}$2`)
    .replace(/(<h2\b[^>]*>)[\s\S]*?(<\/h2>)/i, `$1${subtitle}$2`)

  const notePattern = /<p\s+class=["']text["'][^>]*>[\s\S]*?<\/p>/i
  if (note.trim()) {
    const noteHtml = `<p class="text">${esc(note)}</p>`
    updated = notePattern.test(updated)
      ? updated.replace(notePattern, noteHtml)
      : updated.replace(/<\/section>\s*$/i, `${noteHtml}</section>`)
  } else if (notePattern.test(updated)) {
    updated = updated.replace(notePattern, '')
  }

  updated = updated.replace(/(<a\s+[^>]*class=["'][^"']*\bbutton\b[^"']*["'][^>]*>)[\s\S]*?(<\/a>)/i, `$1${buttonLabel}$2`)
  return source.replace(target, updated)
}

const applyGiftsContentStyles = (html, project) => {
  const gifts = project?.gifts || {}
  const safeColor = value => /^#[0-9a-fA-F]{6}$/.test(String(value || '')) ? String(value) : '#ffffff'
  const safeGradient = value => typeof value === 'string' && value.includes('gradient(') && (value.match(/#[0-9a-fA-F]{6}/g) || []).length >= 2 ? value : ''
  const safeSize = (value, fallback) => { const number = Number(value); return Number.isFinite(number) && number > 0 ? number : fallback }
  const safePosition = value => { const number = Number(value); return Number.isFinite(number) ? Math.max(-300, Math.min(300, number)) : 0 }
  const fontFamily = value => getWeddingFontFamily(value || 'Arial')
  const paint = (prefix, fallbackSize) => {
    const gradient = safeGradient(gifts[prefix + 'Gradient'])
    const color = safeColor(gifts[prefix + 'Color'])
    const paintRule = gifts[prefix + 'Mode'] === 'gradient' && gradient
      ? `background:${gradient}!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;-webkit-text-fill-color:transparent!important;`
      : `background:none!important;color:${color}!important;-webkit-text-fill-color:${color}!important;`
    return `${paintRule}font-family:${fontFamily(gifts[prefix + 'Font'])}!important;font-size:${safeSize(gifts[prefix + 'Size'], fallbackSize)}px!important;position:relative!important;top:${safePosition(gifts[prefix + 'PositionY'])}px!important;`
  }

  const source = String(html || '')
  const target = /<section\s+class=["']section\s+gifts-content-section["'][^>]*>[\s\S]*?<\/section>/i.exec(source)?.[0]
  if (!target) return source

  const css = `<style id="wedding-gifts-content-styles">
    .phone>.section.gifts-content-section>.eyebrow{${paint('sectionTitle', 11)}}
    .phone>.section.gifts-content-section>h2{${paint('subtitle', 32)}}
    .phone>.section.gifts-content-section>.text{${paint('note', 16)}}
    .phone>.section.gifts-content-section>.button,.phone>.section.gifts-content-section>a.button{${paint('buttonLabel', 13)}}
  </style>`
  if (source.includes('id="wedding-gifts-content-styles"')) return source.replace(/<style id="wedding-gifts-content-styles">[\s\S]*?<\/style>/i, css)
  return source.replace('</head>', `${css}</head>`)
}

const applyCoverDecorationColors = (html, project) => {
  const cover = project?.coverSection || {}
  const validColor = (value, fallback) => /^#[0-9a-fA-F]{6}$/.test(String(value || '')) ? String(value) : fallback
  const validGradient = (value, fallback = '') => typeof value === 'string' && value.includes('gradient(') && (value.match(/#[0-9a-fA-F]{6}/g) || []).length >= 2 ? value : fallback
  const fontFamily = (value) => value === 'Amoresa' ? "'Amoresa', cursive" : 'Arial, Helvetica, sans-serif'
  const validSize = (value, fallback) => {
    const numeric = Number(value)
    return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback
  }
  const validPosition = (value) => {
    const numeric = Number(value)
    return Number.isFinite(numeric) ? Math.max(-300, Math.min(300, numeric)) : 0
  }
  const positionRule = (value) => `transform:translateY(${validPosition(value)}px)!important;`
  const paint = (mode, color, gradient, fallback, size, font) => {
    const safeColor = validColor(color, fallback)
    const safeGradient = validGradient(gradient)
    const sizeRule = `font-size:${validSize(size, 16)}px!important;`
    const fontRule = `font-family:${fontFamily(font)}!important;`
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

  const buttonLabel = String(cover.buttonLabel ?? 'Abrir invitación')
    .replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))

  const positionRules = `
    .phone>.cover>.ornament{${positionRule(cover.ornamentPositionY)}}
    .phone>.cover>.eyebrow{${positionRule(cover.eyebrowPositionY)}}
    .phone>.cover>h1{${positionRule(cover.titlePositionY)}}
    .phone>.cover>.date{${positionRule(cover.datePositionY)}}
    .phone>.cover>.button{${positionRule(cover.buttonPositionY)}}
    .phone>.cover>.line{${positionRule(cover.linePositionY)}}
    .phone>.cover.cover-animation-finished>.ornament{${positionRule(cover.ornamentPositionY)}}
    .phone>.cover.cover-animation-finished>.eyebrow{${positionRule(cover.eyebrowPositionY)}}
    .phone>.cover.cover-animation-finished>h1{${positionRule(cover.titlePositionY)}}
    .phone>.cover.cover-animation-finished>.date{${positionRule(cover.datePositionY)}}
    .phone>.cover.cover-animation-finished>.button{${positionRule(cover.buttonPositionY)}}
    .phone>.cover.cover-animation-finished>.line{${positionRule(cover.linePositionY)}}
  `

  const paintRules = `.phone>.cover>.ornament{${ornamentPaint}}.phone>.cover>.eyebrow{${eyebrowPaint}}.phone>.cover>h1{${titlePaint}}.phone>.cover>.date{${datePaint}}.phone>.cover>.button{${buttonPaint}}.phone>.cover>.line{${linePaint}}`
  const css = `<style id="wedding-cover-decoration-colors">${paintRules}${positionRules}</style>`
  const source = String(html || '')
  const withButtonText = source.replace(/(<button\s+class=["']button["'][^>]*>)[\s\S]*?(<\/button>)/i, `$1${buttonLabel}$2`)
  if (withButtonText.includes('id="wedding-cover-decoration-colors"')) return withButtonText.replace(/<style id="wedding-cover-decoration-colors">[\s\S]*?<\/style>/i, css)
  return withButtonText.replace('</head>', `${css}</head>`)
}

const applyPreviewTextDefaults = (html) => {
  const previewDefaults = `<style id="wedding-preview-text-defaults">
    .phone,
    .phone * {
      font-family: Arial, Helvetica, sans-serif !important;
      color: #fff !important;
    }
    .phone input,
    .phone textarea,
    .phone select,
    .phone button,
    .phone option {
      font-family: Arial, Helvetica, sans-serif !important;
      color: #fff !important;
    }
    .phone input::placeholder,
    .phone textarea::placeholder {
      color: #fff !important;
      opacity: 1 !important;
    }
  </style>`
  const source = String(html || '')
  if (source.includes('id="wedding-preview-text-defaults"')) return source
  return source.replace('</head>', `${previewDefaults}</head>`)
}

function PreviewWedding({ project, refreshKey = 0 }) {
  const iframeRef = useRef(null)
  const projectRef = useRef(project)
  const initializedRef = useRef(false)

  projectRef.current = project

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return undefined

    const syncProjectToIframe = (nextProject) => {
      if (!initializedRef.current || !iframe.contentWindow) return
      try {
        const baseHTML = applyPreviewTextDefaults(applyConfirmationTexts(applyGiftsContent(renderWeddingHTML(nextProject), nextProject), nextProject))
        const html = applyConfirmationContentStyles(applyGiftsContentStyles(applyCoverDecorationColors(baseHTML, nextProject), nextProject), nextProject)
        iframe.contentWindow.postMessage({ type: 'WEDDING_PREVIEW_UPDATE', html }, '*')
      } catch {
        // Evitar que un cambio de edición rompa el editor.
      }
    }

    const buildBridgeHTML = (html) => {
      const bridge = `<script id="wedding-preview-bridge">(()=>{
  const phone=()=>document.querySelector('.phone')
  const capture=()=>{const el=phone();const cover=el?.querySelector('.cover');return {top:el?.scrollTop||0,left:el?.scrollLeft||0,open:el?.classList.contains('invite-open')||false,animationDone:cover?.classList.contains('cover-animation-finished')||false}}

  const runDocumentScripts=(scripts)=>{
    scripts.forEach(source=>{
      if(!source||source.id==='wedding-preview-bridge')return
      const current=document.getElementById(source.id)
      if(current)current.remove()
      const script=document.createElement('script')
      Array.from(source.attributes||[]).forEach(attribute=>script.setAttribute(attribute.name,attribute.value))
      script.textContent=source.textContent||''
      document.body.appendChild(script)
    })
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest('.cover .button')
    if(!button)return
    event.preventDefault()
    const el=phone()
    if(!el)return
    el.classList.add('invite-open')
    el.scrollTop=0
  })

  window.addEventListener('message',event=>{
    if(!event.data||event.data.type!=='WEDDING_PREVIEW_UPDATE')return

    const state=capture()
    const parser=new DOMParser()
    const parsed=parser.parseFromString(event.data.html,'text/html')
    const currentPhone=phone()
    const nextPhone=parsed.querySelector('.phone')
    if(!currentPhone||!nextPhone)return

    const currentHead=document.head
    const nextHead=parsed.head
    const existingBridge=currentHead.querySelector('#wedding-preview-head-bridge')
    currentHead.replaceChildren(...Array.from(nextHead.childNodes).map(node=>node.cloneNode(true)))
    if(existingBridge)currentHead.appendChild(existingBridge)

    const nextChildren=Array.from(nextPhone.children)
    const currentChildren=Array.from(currentPhone.children)

    nextChildren.forEach((nextChild,index)=>{
      const currentChild=currentChildren[index]
      if(currentChild)currentChild.replaceWith(nextChild.cloneNode(true))
      else currentPhone.appendChild(nextChild.cloneNode(true))
    })

    while(currentPhone.children.length>nextChildren.length){
      currentPhone.lastElementChild?.remove()
    }

    if(state.open)currentPhone.classList.add('invite-open')
    else currentPhone.classList.remove('invite-open')

    const nextCover=currentPhone.querySelector('.cover')
    if(state.animationDone&&nextCover){
      nextCover.classList.add('cover-animation-finished')
      nextCover.setAttribute('data-animation-finished','true')
    }

    runDocumentScripts(Array.from(parsed.querySelectorAll('script')))

    const restore=()=>{
      currentPhone.scrollTop=state.top||0
      currentPhone.scrollLeft=state.left||0
    }
    restore()
    requestAnimationFrame(restore)
    requestAnimationFrame(()=>requestAnimationFrame(restore))
    setTimeout(restore,50)
    setTimeout(restore,150)
  })
})()</script>`
      return html.replace('</body>', `${bridge}</body>`)
    }

    const handleLoad = () => {
      initializedRef.current = true
      syncProjectToIframe(projectRef.current)
    }

    iframe.addEventListener('load', handleLoad)

    try {
      const baseHTML = applyPreviewTextDefaults(applyConfirmationTexts(applyGiftsContent(renderWeddingHTML(projectRef.current), projectRef.current), projectRef.current))
      const html = buildBridgeHTML(applyConfirmationContentStyles(applyGiftsContentStyles(applyCoverDecorationColors(baseHTML, projectRef.current), projectRef.current), projectRef.current))
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      if (!doc) return () => iframe.removeEventListener('load', handleLoad)
      initializedRef.current = false
      doc.open()
      doc.write(html)
      doc.close()
    } catch {
      // Mantener la VP viva aunque exista un cambio durante la carga.
    }

    return () => {
      iframe.removeEventListener('load', handleLoad)
      initializedRef.current = false
    }
  }, [refreshKey])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !initializedRef.current) return
    const baseHTML = applyPreviewTextDefaults(applyConfirmationTexts(applyGiftsContent(renderWeddingHTML(project), project), project))
    const html = applyConfirmationContentStyles(applyGiftsContentStyles(applyCoverDecorationColors(baseHTML, project), project), project)
    iframe.contentWindow?.postMessage({ type: 'WEDDING_PREVIEW_UPDATE', html }, '*')
  }, [project])

  return (
    <iframe
      ref={iframeRef}
      className="wedding-preview-frame"
      title="Vista previa de la invitación"
      scrolling="yes"
    />
  )
}

export default PreviewWedding
