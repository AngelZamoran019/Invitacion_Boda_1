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
      const bridge = `<script id="wedding-preview-bridge">(()=>{
  const phone=()=>document.querySelector('.phone')
  const capture=()=>{const el=phone();return {top:el?.scrollTop||0,left:el?.scrollLeft||0,open:el?.classList.contains('invite-open')||false}}
  const restore=(state)=>{
    const apply=()=>{const el=phone();if(!el)return;if(state.open)el.classList.add('invite-open');else el.classList.remove('invite-open');el.scrollTop=state.top||0;el.scrollLeft=state.left||0}
    apply();requestAnimationFrame(apply);requestAnimationFrame(()=>requestAnimationFrame(apply));setTimeout(apply,50);setTimeout(apply,150)
  }

  // El listener vive fuera de .phone para que nunca se pierda al actualizar la VP.
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

    // Actualizamos TODOS los estilos generados por la invitación, incluidos
    // los estilos sin id. Esto permite que color, degradado y textura cambien
    // en tiempo real sin reconstruir el iframe.
    const currentHead=document.head
    const nextHead=parsed.head
    const existingBridge=currentHead.querySelector('#wedding-preview-head-bridge')
    currentHead.replaceChildren(...Array.from(nextHead.childNodes).map(node=>node.cloneNode(true)))
    if(existingBridge)currentHead.appendChild(existingBridge)

    // Importante: NO reemplazar .phone. Si se reemplaza, el navegador pierde
    // su posición de scroll y vuelve al inicio. Solo sincronizamos sus hijos.
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

    // Mantener exactamente el estado de página y el scroll anterior.
    if(state.open)currentPhone.classList.add('invite-open')
    else currentPhone.classList.remove('invite-open')

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
