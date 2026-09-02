import { useEffect, useRef } from 'react'
import { renderWeddingHTML } from '../export/weddingOutput.js'

const applyConfirmationTexts = (html, project) => {
  const confirmation = project?.confirmation || {}
  const sectionTitle = String(confirmation.sectionTitle ?? 'Por favor').trim() || 'Por favor'
  const subtitle = String(confirmation.subtitle ?? 'Confirma tu asistencia').trim() || 'Confirma tu asistencia'
  const source = String(html || '')
  const confirmationSection = /(<section\s+class=["']section["'][^>]*id=["']confirmacion["'][^>]*>[\s\S]*?<\/section>)/i
  if (!confirmationSection.test(source)) return source

  return source.replace(confirmationSection, (section) => {
    let result = section.replace(/(<p\s+class=["']eyebrow["'][^>]*>)[\s\S]*?(<\/p>)/i, `$1${sectionTitle.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))}$2`)
    result = result.replace(/(<h2\b[^>]*>)[\s\S]*?(<\/h2>)/i, `$1${subtitle.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))}$2`)
    return result
  })
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
  const css = `<style id="wedding-cover-decoration-colors">.phone>.cover>.ornament{${ornamentPaint}${positionRule(cover.ornamentPositionY)}}.phone>.cover>.eyebrow{${eyebrowPaint}${positionRule(cover.eyebrowPositionY)}}.phone>.cover>h1{${titlePaint}${positionRule(cover.titlePositionY)}}.phone>.cover>.date{${datePaint}${positionRule(cover.datePositionY)}}.phone>.cover>.button{${buttonPaint}${positionRule(cover.buttonPositionY)}}.phone>.cover>.line{${linePaint}${positionRule(cover.linePositionY)}}</style>`
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
        const baseHTML = applyPreviewTextDefaults(applyConfirmationTexts(renderWeddingHTML(nextProject), nextProject))
        const html = applyCoverDecorationColors(baseHTML, nextProject)
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
      const baseHTML = applyPreviewTextDefaults(applyConfirmationTexts(renderWeddingHTML(projectRef.current), projectRef.current))
      const html = buildBridgeHTML(applyCoverDecorationColors(baseHTML, projectRef.current))
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
    const baseHTML = applyPreviewTextDefaults(applyConfirmationTexts(renderWeddingHTML(project), project))
    const html = applyCoverDecorationColors(baseHTML, project)
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
