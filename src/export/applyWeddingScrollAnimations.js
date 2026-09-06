const animationCss = `<style id="wedding-scroll-animations">
  .phone>.section.wedding-scroll-reveal,
  .phone>.closing.wedding-scroll-reveal{
    opacity:0;
    transform:translate3d(0,18px,0);
    transition:opacity .68s cubic-bezier(.22,1,.36,1),transform .68s cubic-bezier(.22,1,.36,1);
    will-change:opacity,transform;
  }

  .phone>.section.wedding-scroll-reveal.wedding-scroll-visible,
  .phone>.closing.wedding-scroll-reveal.wedding-scroll-visible{
    opacity:1;
    transform:translate3d(0,0,0);
  }

  .phone>.section.wedding-scroll-reveal .wedding-reveal-letter,
  .phone>.section.wedding-scroll-reveal .wedding-reveal-word,
  .phone>.closing.wedding-scroll-reveal .wedding-reveal-letter,
  .phone>.closing.wedding-scroll-reveal .wedding-reveal-word{
    display:inline-block;
    opacity:0;
    transform:translate3d(0,12px,0);
    transition:opacity .48s cubic-bezier(.22,1,.36,1),transform .58s cubic-bezier(.22,1,.36,1);
    transition-delay:var(--wedding-reveal-delay,0ms);
    will-change:opacity,transform;
  }

  .phone>.section.wedding-scroll-reveal.wedding-scroll-visible .wedding-reveal-letter,
  .phone>.section.wedding-scroll-reveal.wedding-scroll-visible .wedding-reveal-word,
  .phone>.closing.wedding-scroll-reveal.wedding-scroll-visible .wedding-reveal-letter,
  .phone>.closing.wedding-scroll-reveal.wedding-scroll-visible .wedding-reveal-word{
    opacity:1;
    transform:translate3d(0,0,0);
  }

  .phone>.section.wedding-scroll-reveal .wedding-reveal-visual,
  .phone>.closing.wedding-scroll-reveal .wedding-reveal-visual{
    opacity:0;
    transform:translate3d(0,10px,0) scale(.985);
    transition:opacity .62s cubic-bezier(.22,1,.36,1),transform .72s cubic-bezier(.22,1,.36,1);
    transition-delay:80ms;
    will-change:opacity,transform;
  }

  .phone>.section.wedding-scroll-reveal.wedding-scroll-visible .wedding-reveal-visual,
  .phone>.closing.wedding-scroll-reveal.wedding-scroll-visible .wedding-reveal-visual{
    opacity:1;
    transform:translate3d(0,0,0) scale(1);
  }

  @media(prefers-reduced-motion:reduce){
    .phone>.section.wedding-scroll-reveal,
    .phone>.closing.wedding-scroll-reveal,
    .phone>.section.wedding-scroll-reveal .wedding-reveal-letter,
    .phone>.section.wedding-scroll-reveal .wedding-reveal-word,
    .phone>.closing.wedding-scroll-reveal .wedding-reveal-letter,
    .phone>.closing.wedding-scroll-reveal .wedding-reveal-word,
    .phone>.section.wedding-scroll-reveal .wedding-reveal-visual,
    .phone>.closing.wedding-scroll-reveal .wedding-reveal-visual{
      opacity:1!important;
      transform:none!important;
      transition:none!important;
    }
  }
</style>`

const animationScript = `<script id="wedding-scroll-animations-script">(()=>{
  const start=()=>{
    const phone=document.querySelector('.phone')
    if(!phone)return
    if(phone.dataset.weddingScrollAnimationsReady==='true')return
    phone.dataset.weddingScrollAnimationsReady='true'

    const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const sections=Array.from(phone.querySelectorAll(':scope>.section, :scope>.closing'))
    if(!sections.length)return

    const splitText=(element,mode)=>{
      if(!element||element.dataset.weddingRevealSplit==='true')return
      const text=element.textContent||''
      if(!text.trim())return
      const fragment=document.createDocumentFragment()
      const tokens=mode==='letters'&&text.trim().length<=42
        ? Array.from(text)
        : text.split(/(\\s+)/)
      let index=0
      tokens.forEach(token=>{
        if(/^\\s+$/.test(token)){
          fragment.appendChild(document.createTextNode(token))
          return
        }
        const span=document.createElement('span')
        span.className=mode==='letters'?'wedding-reveal-letter':'wedding-reveal-word'
        span.textContent=token
        const delay=Math.min(index,24)*28
        span.style.setProperty('--wedding-reveal-delay',delay+'ms')
        fragment.appendChild(span)
        index+=1
      })
      element.textContent=''
      element.appendChild(fragment)
      element.dataset.weddingRevealSplit='true'
    }

    sections.forEach(section=>{
      section.classList.add('wedding-scroll-reveal')
      const eyebrow=section.querySelector(':scope>.eyebrow')
      const heading=section.querySelector(':scope>h2')
      if(eyebrow)splitText(eyebrow,'words')
      if(heading)splitText(heading,'letters')
      section.querySelectorAll(':scope>img, :scope>.event-card, :scope>.dress-grid, :scope>.countdown, :scope>.rsvp-form, :scope>.success, :scope>audio, :scope>.button').forEach(element=>element.classList.add('wedding-reveal-visual'))
    })

    if(reduced){
      sections.forEach(section=>section.classList.add('wedding-scroll-visible'))
      return
    }

    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('wedding-scroll-visible')
        }else{
          entry.target.classList.remove('wedding-scroll-visible')
        }
      })
    },{root:phone,threshold:.16,rootMargin:'-7% 0px -7% 0px'})

    sections.forEach(section=>observer.observe(section))
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true})
  else start()
})()</script>`

export function applyWeddingScrollAnimations(html) {
  const source=String(html||'')
  if(!source)return source
  const withCss=source.includes('id="wedding-scroll-animations"')
    ? source
    : source.replace('</head>',`${animationCss}</head>`)
  if(withCss.includes('id="wedding-scroll-animations-script"'))return withCss
  return withCss.replace('</body>',`${animationScript}</body>`)
}

export default applyWeddingScrollAnimations
