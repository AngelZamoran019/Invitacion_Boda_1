const animationCss = `<style id="wedding-scroll-animations">
  .phone .wedding-scroll-reveal-item {
    opacity: 0;
    transform: translate3d(0,18px,0);
    transition: opacity .5s cubic-bezier(.22,1,.36,1), transform .5s cubic-bezier(.22,1,.36,1);
    transition-delay: var(--wedding-reveal-delay,0ms);
    will-change: auto;
  }

  .phone .wedding-scroll-reveal-item.wedding-scroll-visible {
    opacity: 1;
    transform: none;
  }

  .phone .wedding-reveal-word {
    display: inline-block;
    opacity: 0;
    transform: translate3d(0,14px,0);
    transition: opacity .5s cubic-bezier(.22,1,.36,1), transform .5s cubic-bezier(.22,1,.36,1);
    transition-delay: var(--wedding-word-delay,0ms);
  }

  .phone .wedding-scroll-reveal-item.wedding-scroll-visible .wedding-reveal-word {
    opacity: 1;
    transform: none;
  }

  @media(prefers-reduced-motion:reduce){
    .phone .wedding-scroll-reveal-item,
    .phone .wedding-reveal-word{
      opacity:1!important;
      transform:none!important;
      transition:none!important;
    }
  }
</style>`

const animationScript = `<script id="wedding-scroll-animations-script">(()=>{
  const install=()=>{
    const phone=document.querySelector('.phone')
    if(!phone||!window.IntersectionObserver)return

    let observer
    const sections=Array.from(phone.querySelectorAll(':scope>.section,:scope>.closing'))
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

    observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>entry.target.classList.toggle('wedding-scroll-visible',entry.isIntersecting))
    },{root:phone,threshold:.12,rootMargin:'-9% 0px -9% 0px'})

    targets.forEach(target=>observer.observe(target))
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true})
  else install()
})()</script>`

export function applyWeddingScrollAnimations(html) {
  const source=String(html||'')
  if(!source)return source
  const withCss=source.includes('id="wedding-scroll-animations"')
    ? source
    : source.replace('</head>',animationCss+'</head>')
  if(withCss.includes('id="wedding-scroll-animations-script"'))return withCss
  return withCss.replace('</body>',animationScript+'</body>')
}

export default applyWeddingScrollAnimations
