import { useEffect, useRef } from 'react'
import { getWeddingExportHTML } from '../export/getWeddingExportHTML.js'

const buildPreviewHTML = async (project) => getWeddingExportHTML(project)

const capturePreviewState = (iframe) => {
  try {
    const doc = iframe?.contentDocument || iframe?.contentWindow?.document
    const phone = doc?.querySelector('.phone')
    const cover = phone?.querySelector('.cover')
    const audio = doc?.querySelector('#wedding-music')
    return {
      top: phone?.scrollTop || 0,
      left: phone?.scrollLeft || 0,
      open: phone?.classList.contains('invite-open') || false,
      animationDone: cover?.classList.contains('cover-animation-finished') || false,
      musicPlaying: Boolean(audio && !audio.paused),
    }
  } catch {
    return { top: 0, left: 0, open: false, animationDone: false, musicPlaying: false }
  }
}

const buildBridgeHTML = (html, state) => {
  const safeState = JSON.stringify(state).replace(/</g, '\\u003c')
  const bridge = `<script id="wedding-preview-bridge">(()=>{
  const initialState=${safeState}
  const phone=()=>document.querySelector('.phone')
  const restoreState=()=>{
    const el=phone()
    if(!el)return
    if(initialState.open)el.classList.add('invite-open')
    else el.classList.remove('invite-open')
    const cover=el.querySelector('.cover')
    if(initialState.animationDone&&cover){
      cover.classList.add('cover-animation-finished')
      cover.setAttribute('data-animation-finished','true')
    }
    const restore=()=>{el.scrollTop=initialState.top||0;el.scrollLeft=initialState.left||0}
    restore()
    requestAnimationFrame(restore)
    requestAnimationFrame(()=>requestAnimationFrame(restore))
    setTimeout(restore,50)
    setTimeout(restore,150)
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
      style.textContent='.phone .wedding-scroll-reveal-item{opacity:0;transform:translate3d(0,18px,0);transition:opacity .5s cubic-bezier(.22,1,.36,1),transform .5s cubic-bezier(.22,1,.36,1);transition-delay:var(--wedding-reveal-delay,0ms);will-change:auto}.phone .wedding-scroll-reveal-item.wedding-scroll-visible{opacity:1;transform:none}.phone .wedding-reveal-word{display:inline-block;opacity:0;transform:translate3d(0,14px,0);transition:opacity .5s cubic-bezier(.22,1,.36,1),transform .5s cubic-bezier(.22,1,.36,1);transition-delay:var(--wedding-word-delay,0ms)}.phone .wedding-scroll-reveal-item.wedding-scroll-visible .wedding-reveal-word{opacity:1;transform:none}@media(prefers-reduced-motion:reduce){.phone .wedding-scroll-reveal-item,.phone .wedding-reveal-word{opacity:1!important;transform:none!important;transition:none!important}}'
      document.head.appendChild(style)
    }

    const sections=Array.from(el.querySelectorAll(':scope>.section,:scope>.closing'))
    const targets=[]
    sections.forEach(section=>{
      const elements=Array.from(section.querySelectorAll('*')).filter(node=>node.tagName!=='SCRIPT'&&node.tagName!=='STYLE')
      const unique=[]
      elements.forEach(node=>{
        if(!node||node===section||node.closest('script,style'))return
        if(!unique.includes(node))unique.push(node)
      })
      unique.forEach((node,index)=>{
        node.classList.add('wedding-scroll-reveal-item')
        node.style.setProperty('--wedding-reveal-delay',(Math.min(index,8)*90)+'ms')
        targets.push(node)
      })

      const headings=Array.from(section.querySelectorAll('h2'))
      headings.forEach(heading=>{
        if(heading.dataset.weddingWordsReady==='true')return
        const text=String(heading.textContent||'').trim()
        if(!text||text.length>48)return
        const words=text.split(/(\s+)/)
        heading.textContent=''
        words.forEach((word,index)=>{
          if(/^\s+$/.test(word)){heading.appendChild(document.createTextNode(word));return}
          const span=document.createElement('span')
          span.className='wedding-reveal-word'
          span.textContent=word
          span.style.setProperty('--wedding-word-delay',(index*55)+'ms')
          heading.appendChild(span)
        })
        heading.dataset.weddingWordsReady='true'
      })
    })

    scrollRevealObserver=new IntersectionObserver((entries)=>{
      entries.forEach(entry=>entry.target.classList.toggle('wedding-scroll-visible',entry.isIntersecting))
    },{root:el,threshold:.12,rootMargin:'-9% 0px -9% 0px'})
    targets.forEach(target=>scrollRevealObserver.observe(target))
  }

  const startWeddingMusic=()=>{
    const audio=document.querySelector('#wedding-music')
    if(!audio)return
    audio.loop=true
    const result=audio.play()
    if(result?.catch)result.catch(()=>{})
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest('.cover .button')
    if(!button)return
    event.preventDefault()
    const el=phone()
    if(!el)return
    startWeddingMusic()
    el.classList.add('invite-open')
    el.scrollTop=0
    requestAnimationFrame(installScrollReveal)
  })

  restoreState()
  requestAnimationFrame(installScrollReveal)
  if(initialState.open&&initialState.musicPlaying)requestAnimationFrame(startWeddingMusic)
})()</script>`
  return String(html || '').replace('</body>', `${bridge}</body>`)
}

function PreviewWedding({ project, refreshKey = 0 }) {
  const iframeRef = useRef(null)
  const renderIdRef = useRef(0)
  const previousRefreshKeyRef = useRef(refreshKey)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return undefined

    let cancelled = false
    const renderId = ++renderIdRef.current
    const state = capturePreviewState(iframe)
    previousRefreshKeyRef.current = refreshKey

    const render = async () => {
      try {
        const html = await buildPreviewHTML(project)
        if (cancelled || renderId !== renderIdRef.current) return
        const doc = iframe.contentDocument || iframe.contentWindow?.document
        if (!doc) return
        doc.open()
        doc.write(buildBridgeHTML(html, state))
        doc.close()
      } catch {
        // Evitar que un cambio de edición rompa el editor.
      }
    }

    void render()

    return () => {
      cancelled = true
    }
  }, [project, refreshKey])

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
