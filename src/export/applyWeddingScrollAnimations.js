const animationCss = `<style id="wedding-scroll-animations">
  .phone > .section.wedding-scroll-reveal,
  .phone > .closing.wedding-scroll-reveal {
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .phone > .section.wedding-scroll-reveal.wedding-scroll-visible,
  .phone > .closing.wedding-scroll-reveal.wedding-scroll-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .phone > .section.wedding-scroll-reveal > .eyebrow,
  .phone > .closing.wedding-scroll-reveal > .eyebrow {
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: 80ms;
  }

  .phone > .section.wedding-scroll-reveal > h2,
  .phone > .closing.wedding-scroll-reveal > h2 {
    opacity: 0;
    transform: translateY(12px);
    clip-path: inset(0 0 100% 0);
    transition: opacity 0.6s ease, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), clip-path 0.7s cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: 140ms;
  }

  .phone > .section.wedding-scroll-reveal > .text,
  .phone > .section.wedding-scroll-reveal > p:not(.eyebrow),
  .phone > .closing.wedding-scroll-reveal > .text,
  .phone > .closing.wedding-scroll-reveal > p:not(.eyebrow) {
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.55s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: 230ms;
  }

  .phone > .section.wedding-scroll-reveal.wedding-scroll-visible > .eyebrow,
  .phone > .closing.wedding-scroll-reveal.wedding-scroll-visible > .eyebrow,
  .phone > .section.wedding-scroll-reveal.wedding-scroll-visible > h2,
  .phone > .closing.wedding-scroll-reveal.wedding-scroll-visible > h2,
  .phone > .section.wedding-scroll-reveal.wedding-scroll-visible > .text,
  .phone > .section.wedding-scroll-reveal.wedding-scroll-visible > p:not(.eyebrow),
  .phone > .closing.wedding-scroll-reveal.wedding-scroll-visible > .text,
  .phone > .closing.wedding-scroll-reveal.wedding-scroll-visible > p:not(.eyebrow) {
    opacity: 1;
    transform: translateY(0);
    clip-path: inset(0 0 0 0);
  }

  .phone > .section.wedding-scroll-reveal > img,
  .phone > .section.wedding-scroll-reveal > .event-card,
  .phone > .section.wedding-scroll-reveal > .dress-grid,
  .phone > .section.wedding-scroll-reveal > .countdown,
  .phone > .section.wedding-scroll-reveal > .rsvp-form,
  .phone > .section.wedding-scroll-reveal > .success,
  .phone > .section.wedding-scroll-reveal > audio,
  .phone > .section.wedding-scroll-reveal > .button,
  .phone > .closing.wedding-scroll-reveal > img,
  .phone > .closing.wedding-scroll-reveal > .button {
    opacity: 0;
    transform: translateY(10px) scale(0.99);
    transition: opacity 0.6s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: 300ms;
  }

  .phone > .section.wedding-scroll-reveal.wedding-scroll-visible > img,
  .phone > .section.wedding-scroll-reveal.wedding-scroll-visible > .event-card,
  .phone > .section.wedding-scroll-reveal.wedding-scroll-visible > .dress-grid,
  .phone > .section.wedding-scroll-reveal.wedding-scroll-visible > .countdown,
  .phone > .section.wedding-scroll-reveal.wedding-scroll-visible > .rsvp-form,
  .phone > .section.wedding-scroll-reveal.wedding-scroll-visible > .success,
  .phone > .section.wedding-scroll-reveal.wedding-scroll-visible > audio,
  .phone > .section.wedding-scroll-reveal.wedding-scroll-visible > .button,
  .phone > .closing.wedding-scroll-reveal.wedding-scroll-visible > img,
  .phone > .closing.wedding-scroll-reveal.wedding-scroll-visible > .button {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  @media (prefers-reduced-motion: reduce) {
    .phone > .section.wedding-scroll-reveal,
    .phone > .closing.wedding-scroll-reveal,
    .phone > .section.wedding-scroll-reveal > .eyebrow,
    .phone > .closing.wedding-scroll-reveal > .eyebrow,
    .phone > .section.wedding-scroll-reveal > h2,
    .phone > .closing.wedding-scroll-reveal > h2,
    .phone > .section.wedding-scroll-reveal > .text,
    .phone > .section.wedding-scroll-reveal > p:not(.eyebrow),
    .phone > .closing.wedding-scroll-reveal > .text,
    .phone > .closing.wedding-scroll-reveal > p:not(.eyebrow) {
      opacity: 1 !important;
      transform: none !important;
      clip-path: none !important;
      transition: none !important;
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
    const sections=Array.from(phone.children).filter(element=>element.classList.contains('section')||element.classList.contains('closing'))
    if(!sections.length)return

    sections.forEach(section=>section.classList.add('wedding-scroll-reveal'))

    if(reduced){
      sections.forEach(section=>section.classList.add('wedding-scroll-visible'))
      return
    }

    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        entry.target.classList.toggle('wedding-scroll-visible',entry.isIntersecting)
      })
    },{root:phone,threshold:0.12,rootMargin:'-6% 0px -6% 0px'})

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
    : source.replace('</head>',animationCss+'</head>')
  if(withCss.includes('id="wedding-scroll-animations-script"'))return withCss
  return withCss.replace('</body>',animationScript+'</body>')
}

export default applyWeddingScrollAnimations
