import { useEffect, useRef } from 'react'
import { getWeddingExportHTML } from '../export/getWeddingExportHTML.js'

const buildPreviewHTML = async (project) => getWeddingExportHTML(project)

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

  let scrollRevealObserver=null

  const installScrollReveal=()=>{
    const el=phone()
    if(!el||!window.IntersectionObserver)return

    if(scrollRevealObserver)scrollRevealObserver.disconnect()

    let style=document.getElementById('wedding-preview-scroll-reveal-styles')
    if(!style){
      style=document.createElement('style')
      style.id='wedding-preview-scroll-reveal-styles'
      style.textContent='.phone>.wedding-scroll-reveal-target{opacity:0;transform:translate3d(0,16px,0);transition:opacity .62s cubic-bezier(.22,1,.36,1),transform .72s cubic-bezier(.22,1,.36,1);will-change:auto}.phone>.wedding-scroll-reveal-target.wedding-scroll-visible{opacity:1;transform:none}.phone>.wedding-scroll-reveal-target .wedding-scroll-reveal-item{opacity:0;transform:translate3d(0,9px,0);transition:opacity .48s cubic-bezier(.22,1,.36,1),transform .56s cubic-bezier(.22,1,.36,1);transition-delay:var(--wedding-reveal-delay,0ms)}.phone>.wedding-scroll-reveal-target.wedding-scroll-visible .wedding-scroll-reveal-item{opacity:1;transform:none}.phone>.wedding-scroll-reveal-target .wedding-reveal-word{display:inline-block;opacity:0;transform:translate3d(0,12px,0);transition:opacity .42s cubic-bezier(.22,1,.36,1),transform .5s cubic-bezier(.22,1,.36,1);transition-delay:var(--wedding-word-delay,0ms)}.phone>.wedding-scroll-reveal-target.wedding-scroll-visible .wedding-reveal-word{opacity:1;transform:none}@media(prefers-reduced-motion:reduce){.phone>.wedding-scroll-reveal-target,.phone>.wedding-scroll-reveal-target .wedding-scroll-reveal-item,.phone>.wedding-scroll-reveal-target .wedding-reveal-word{opacity:1!important;transform:none!important;transition:none!important}}'
      document.head.appendChild(style)
    }

    const targets=Array.from(el.querySelectorAll(':scope>.section,:scope>.closing'))
    targets.forEach((section)=>{
      section.classList.add('wedding-scroll-reveal-target')

      const children=Array.from(section.children).filter(child=>child.tagName!=='SCRIPT'&&child.tagName!=='STYLE')
      children.forEach((child,index)=>{
        child.classList.add('wedding-scroll-reveal-item')
        child.style.setProperty('--wedding-reveal-delay',(index*70)+'ms')
      })

      const headings=Array.from(section.querySelectorAll(':scope>.eyebrow,:scope>h2'))
      headings.forEach((heading)=>{
        if(heading.dataset.weddingWordsReady==='true')return
        const text=String(heading.textContent||'').trim()
        if(!text||text.length>48)return
        const words=text.split(/(\\s+)/)
        heading.textContent=''
        words.forEach((word,index)=>{
          if(/^\\s+$/.test(word)){heading.appendChild(document.createTextNode(word));return}
          const span=document.createElement('span')
          span.className='wedding-reveal-word'
          span.textContent=word
          span.style.setProperty('--wedding-word-delay',(index*42)+'ms')
          heading.appendChild(span)
        })
        heading.dataset.weddingWordsReady='true'
      })
    })

    scrollRevealObserver=new IntersectionObserver((entries)=>{
      entries.forEach((entry)=>entry.target.classList.toggle('wedding-scroll-visible',entry.isIntersecting))
    },{root:el,threshold:.08,rootMargin:'-7% 0px -7% 0px'})

    targets.forEach((target)=>scrollRevealObserver.observe(target))
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest('.cover .button')
    if(!button)return
    event.preventDefault()
    const el=phone()
    if(!el)return
    el.classList.add('invite-open')
    el.scrollTop=0
    requestAnimationFrame(installScrollReveal)
  })

  window.addEventListener('message',event=>{
    if(!event.data||event.data.type!=='WEDDING_PREVIEW_UPDATE')return

    const state=capture()
    const parser=new DOMParser()
    const parsed=parser.parseFromString(event.data.html,'text/html')
    const currentPhone=phone()
    const nextPhone=parsed.querySelector('.phone')
    if(!currentPhone||!nextPhone)return

    const nextHead=parsed.head
    document.head.replaceChildren(...Array.from(nextHead.childNodes).map(node=>node.cloneNode(true)))

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
    requestAnimationFrame(installScrollReveal)
  })
})()</script>`
  return String(html || '').replace('</body>', `${bridge}</body>`)
}

function PreviewWedding({ project, refreshKey = 0 }) {
  const iframeRef = useRef(null)
  const projectRef = useRef(project)
  const initializedRef = useRef(false)

  projectRef.current = project

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return undefined

    let cancelled = false

    const syncProjectToIframe = async (nextProject) => {
      if (!initializedRef.current || !iframe.contentWindow) return
      try {
        const html = await buildPreviewHTML(nextProject)
        if (cancelled) return
        iframe.contentWindow.postMessage({ type: 'WEDDING_PREVIEW_UPDATE', html }, '*')
      } catch {
        // Evitar que un cambio de edición rompa el editor.
      }
    }

    const handleLoad = async () => {
      initializedRef.current = true
      try {
        const html = await buildPreviewHTML(projectRef.current)
        if (cancelled) return
        const bridged = buildBridgeHTML(html)
        const doc = iframe.contentDocument || iframe.contentWindow?.document
        if (!doc) return
        doc.open()
        doc.write(bridged)
        doc.close()
      } catch {
        // Mantener la VP viva aunque exista un cambio durante la carga.
      }
    }

    iframe.addEventListener('load', handleLoad)

    try {
      initializedRef.current = false
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      if (!doc) return () => iframe.removeEventListener('load', handleLoad)
      doc.open()
      doc.write('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>')
      doc.close()
    } catch {
      // Mantener la VP viva aunque exista un cambio durante la carga.
    }

    return () => {
      cancelled = true
      iframe.removeEventListener('load', handleLoad)
      initializedRef.current = false
    }
  }, [refreshKey])

  useEffect(() => {
    let cancelled = false
    const iframe = iframeRef.current
    if (!iframe || !initializedRef.current) return undefined

    const sync = async () => {
      try {
        const html = await buildPreviewHTML(project)
        if (cancelled || !initializedRef.current) return
        iframe.contentWindow?.postMessage({ type: 'WEDDING_PREVIEW_UPDATE', html }, '*')
      } catch {
        // Evitar que un cambio de edición rompa el editor.
      }
    }

    void sync()
    return () => {
      cancelled = true
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
