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
      const bridge = `<script id="wedding-preview-bridge">(()=>{\n  const phone=()=>document.querySelector('.phone')\n  const capture=()=>{const el=phone();return {top:el?.scrollTop||0,left:el?.scrollLeft||0,open:el?.classList.contains('invite-open')||false}}\n  const restore=(state)=>{\n    const apply=()=>{const el=phone();if(!el)return;if(state.open)el.classList.add('invite-open');else el.classList.remove('invite-open');el.scrollTop=state.top||0;el.scrollLeft=state.left||0}\n    apply();requestAnimationFrame(apply);requestAnimationFrame(()=>requestAnimationFrame(apply));setTimeout(apply,50);setTimeout(apply,150)\n  }\n  // Delegación: el botón sigue funcionando aunque el contenido de .phone sea reemplazado.\n  document.addEventListener('click',event=>{\n    const button=event.target.closest('.cover .button')\n    if(!button)return\n    event.preventDefault()\n    const el=phone()\n    if(!el)return\n    el.classList.add('invite-open')\n    el.scrollTop=0\n  })\n  window.addEventListener('message',event=>{\n    if(!event.data||event.data.type!=='WEDDING_PREVIEW_UPDATE')return\n    const state=capture()\n    const parser=new DOMParser()\n    const parsed=parser.parseFromString(event.data.html,'text/html')\n    const currentPhone=phone()\n    const nextPhone=parsed.querySelector('.phone')\n    if(!currentPhone||!nextPhone)return\n    // Actualizar únicamente los estilos del head; no se toca el documento ni el bridge.\n    const nextStyles=[...parsed.head.querySelectorAll('style,link')].filter(el=>el.id)\n    nextStyles.forEach(next=>{\n      const old=document.head.querySelector('#'+CSS.escape(next.id))\n      if(old)old.replaceWith(next.cloneNode(true))\n      else document.head.appendChild(next.cloneNode(true))\n    })\n    const nextClone=nextPhone.cloneNode(true)\n    if(state.open)nextClone.classList.add('invite-open')\n    else nextClone.classList.remove('invite-open')\n    currentPhone.replaceWith(nextClone)\n    // Reactualizar scripts de la invitación sin tocar el script puente.\n    nextClone.querySelectorAll('script').forEach(oldScript=>{\n      const script=document.createElement('script')\n      Array.from(oldScript.attributes).forEach(attr=>script.setAttribute(attr.name,attr.value))\n      script.textContent=oldScript.textContent\n      oldScript.replaceWith(script)\n    })\n    restore(state)\n  })\n})()</script>`
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
