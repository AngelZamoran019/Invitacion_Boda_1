import { useEffect, useRef } from 'react'
import { renderWeddingHTML } from '../export/weddingOutput.js'

function PreviewWedding({ project, refreshKey = 0 }) {
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

    try {
      const html = buildBridgeHTML(renderWeddingHTML(projectRef.current))
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      if (!doc) return undefined
      doc.open()
      doc.write(html)
      doc.close()
      initializedRef.current = true
    } catch {
      // Mantener la VP viva aunque exista un cambio durante la carga.
    }

    return () => {
      initializedRef.current = false
    }
  }, [refreshKey])

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
      // Evitar que un cambio de edicion rompa el editor.
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
