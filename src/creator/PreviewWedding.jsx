import { useEffect, useRef } from 'react'
import { renderWeddingHTML } from '../export/renderWeddingHTML.js'

function PreviewWedding({ project }) {
  const iframeRef = useRef(null)
  const projectRef = useRef(project)
  const initializedRef = useRef(false)

  projectRef.current = project

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return undefined

    const buildBridgeHTML = (html) => {
      const bridge = `<script id="wedding-preview-bridge">(()=>{\n  const capture=()=>{\n    const phone=document.querySelector('.phone')\n    if(!phone)return {top:0,left:0,open:false}\n    return {top:phone.scrollTop||0,left:phone.scrollLeft||0,open:phone.classList.contains('invite-open')}\n  }\n  const runScripts=(root)=>{\n    root.querySelectorAll('script:not(#wedding-preview-bridge)').forEach(oldScript=>{\n      const script=document.createElement('script')\n      Array.from(oldScript.attributes).forEach(attr=>script.setAttribute(attr.name,attr.value))\n      script.textContent=oldScript.textContent\n      oldScript.replaceWith(script)\n    })\n  }\n  const restore=(state)=>{\n    const apply=()=>{\n      const phone=document.querySelector('.phone')\n      if(!phone)return\n      if(state.open)phone.classList.add('invite-open')\n      phone.scrollTop=state.top||0\n      phone.scrollLeft=state.left||0\n      window.scrollTo(state.left||0,state.top||0)\n    }\n    apply()\n    requestAnimationFrame(apply)\n    requestAnimationFrame(()=>requestAnimationFrame(apply))\n    setTimeout(apply,50)\n    setTimeout(apply,150)\n  }\n  window.addEventListener('message',event=>{\n    if(!event.data||event.data.type!=='WEDDING_PREVIEW_UPDATE')return\n    const state=capture()\n    const parser=new DOMParser()\n    const parsed=parser.parseFromString(event.data.html,'text/html')\n    const next=parsed.documentElement\n    const current=state.open\n    next.querySelector('.phone')?.classList.toggle('invite-open',current)\n    document.documentElement.replaceWith(next)\n    runScripts(document)\n    restore(state)\n  })\n  window.addEventListener('scroll',()=>{}, {passive:true})\n})()</script>`
      return html.replace('</body>', `${bridge}</body>`)
    }

    const renderInitial = () => {
      try {
        const html = buildBridgeHTML(renderWeddingHTML(projectRef.current))
        const doc = iframe.contentDocument || iframe.contentWindow?.document
        if (!doc) return
        doc.open()
        doc.write(html)
        doc.close()
        initializedRef.current = true
      } catch {
        // Mantener la VP viva aunque exista un cambio durante la carga.
      }
    }

    renderInitial()

    return () => {
      initializedRef.current = false
    }
  }, [])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !initializedRef.current) return

    try {
      const html = renderWeddingHTML(project)
      iframe.contentWindow?.postMessage({
        type: 'WEDDING_PREVIEW_UPDATE',
        html,
      }, '*')
    } catch {
      // Evitar que un cambio de edición rompa el editor.
    }
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
