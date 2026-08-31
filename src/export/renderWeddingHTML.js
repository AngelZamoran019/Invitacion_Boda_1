import { buildWeddingHTML } from './exportWedding.js'

const escCssUrl = value => String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/</g, '%3C').replace(/>/g, '%3E')
const escCssValue = value => String(value || '').replace(/\\/g, '\\\\').replace(/</g, '').replace(/>/g, '').replace(/"/g, '\\"').replace(/;/g, '')
const validGradient = value => typeof value === 'string' && value.includes('gradient(') && (value.match(/#[0-9a-fA-F]{6}/g) || []).length >= 2 ? value : ''

export function renderWeddingHTML(project) {
  let html = buildWeddingHTML(project)
  const appearance = project?.appearance || {}
  const typography = appearance.typography || {}
  const title = typography.title || {}
  const specialSection = typography.sectionTitleSpecial || typography.sectionTitle || {}
  const titleFont = escCssValue(title.fontFamily || "'Playfair Display', serif")
  const titleSize = Number(title.fontSize) || 42
  const titleWeight = Number(title.fontWeight) || 500
  const titleLineHeight = Number(title.lineHeight) || 1.08
  const titleLetterSpacing = Number(title.letterSpacing) || 0
  const titleGradient = escCssValue(validGradient(title.gradient || ''))
  const titleIsGradient = title.mode === 'gradient' && Boolean(titleGradient)
  const titleColor = escCssValue(title.color || '#ffffff')
  const styleFor = (key, fallback) => {
    const value = typography[key] || {}
    const gradient = escCssValue(validGradient(value.gradient || ''))
    const isGradient = value.mode === 'gradient' && Boolean(gradient)
    const color = escCssValue(value.color || fallback)
    return { paint: isGradient ? `background:${gradient} !important;-webkit-background-clip:text !important;background-clip:text !important;color:transparent !important;` : `background:none !important;color:${color} !important;` }
  }
  const subtitleStyle = styleFor('subtitle', '#ffffff')
  const paragraphStyle = styleFor('paragraph', '#ffffff')
  const sectionStyle = styleFor('sectionTitle', '#ffffff')
  const labelStyle = styleFor('label', '#c9a86a')
  const smallStyle = styleFor('small', '#ffffff')
  const buttonStyle = styleFor('button', '#ffffff')
  const specialFont = escCssValue(specialSection.fontFamily || typography.sectionTitle?.fontFamily || "'Playfair Display', serif")
  const specialSize = Number(specialSection.fontSize) || Number(typography.sectionTitle?.fontSize) || 32
  const specialWeight = Number(specialSection.fontWeight) || Number(typography.sectionTitle?.fontWeight) || 500
  const specialLineHeight = Number(specialSection.lineHeight) || Number(typography.sectionTitle?.lineHeight) || 1.15
  const specialLetterSpacing = Number(specialSection.letterSpacing) || Number(typography.sectionTitle?.letterSpacing) || 0
  const specialGradient = escCssValue(validGradient(specialSection.gradient || ''))
  const specialIsGradient = specialSection.mode === 'gradient' && Boolean(specialGradient)
  const specialColor = escCssValue(specialSection.color || typography.sectionTitle?.color || '#ffffff')
  const typographyCss = `<style id="wedding-typography">#couple h2{font-family:${titleFont}!important;font-size:${titleSize}px!important;font-weight:${titleWeight}!important;line-height:${titleLineHeight}!important;letter-spacing:${titleLetterSpacing}px!important;${titleIsGradient ? `background:${titleGradient}!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;` : `background:none!important;color:${titleColor}!important;`}}#couple h2 span{${titleIsGradient ? `background:${titleGradient}!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;` : `background:none!important;color:${titleColor}!important;`}}.cover h1{${titleIsGradient ? `background:${titleGradient}!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;` : `color:${titleColor}!important;`}}.cover-subtitle{${subtitleStyle.paint}}.text{${paragraphStyle.paint}}.section h2{${sectionStyle.paint}}.eyebrow{${labelStyle.paint}}.date,.venue,.event-card strong,.event-card span,.event-card small,.countdown span,.dress-card span,.dress-card strong,.rsvp-form label{${smallStyle.paint}}.button{${buttonStyle.paint}}.section-title-special{font-family:${specialFont}!important;font-size:${specialSize}px!important;font-weight:${specialWeight}!important;line-height:${specialLineHeight}!important;letter-spacing:${specialLetterSpacing}px!important;${specialIsGradient ? `background:${specialGradient}!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;` : `background:none!important;color:${specialColor}!important;`}}</style>`
  html = html.replace('</head>', `${typographyCss}</head>`)

  const translucentCardsCss = `<style id="wedding-translucent-cards">.event-card,.countdown div,.dress-card,.rsvp-form input,.rsvp-form select,.rsvp-form textarea,.success,.button{background:rgb(255 255 255 / 9%)!important;border:1px solid rgb(255 255 255 / 22%)!important;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}.event-card,.dress-card,.countdown div,.success,.button{box-shadow:inset 0 1px 0 rgb(255 255 255 / 7%)}#confirmacion .rsvp-form{background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important}@media(max-width:699px){.event-card,.countdown div,.dress-card,.rsvp-form input,.rsvp-form select,.rsvp-form textarea,.success,.button{backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}}</style>`
  html = html.replace('</head>', `${translucentCardsCss}</head>`)

  const specialSectionTexts = ['estas cordialmente invitado a la boda de','nuestra cancion','nuestra canción','nuestra historia','el gran día','la cuenta regresiva comienza','codigo de vestimenta','código de vestimenta','un detalle especial','por favor']
  const specialSectionScript = `<script id="wedding-special-section-titles">(()=>{const targets=new Set(${JSON.stringify(specialSectionTexts)});const normalize=value=>String(value||'').trim().toLowerCase().replace(/[áàä]/g,'a').replace(/[éèë]/g,'e').replace(/[íìï]/g,'i').replace(/[óòö]/g,'o').replace(/[úùü]/g,'u');document.querySelectorAll('.eyebrow').forEach(el=>{if(targets.has(normalize(el.textContent)))el.classList.add('section-title-special')})})()</script>`
  html = html.replace('</body>', `${specialSectionScript}</body>`)

  const texture = String(appearance.backgroundTextureImage || '').trim()
  const enabled = appearance.backgroundTextureType === 'image' && texture.length > 0
  const colorOverlayEnabled = appearance.backgroundTextureColorOverlay !== false

  if (enabled) {
    const opacity = Math.max(0, Math.min(1, Number(appearance.backgroundTextureOpacity ?? 0.28)))
    const blend = ['normal','multiply','screen','overlay','soft-light','hard-light'].includes(appearance.backgroundTextureBlend) ? appearance.backgroundTextureBlend : 'soft-light'
    const url = escCssUrl(texture)
    const overlayRule = colorOverlayEnabled
      ? '.phone::after{content:"";position:fixed;inset:0;width:100vw;height:100dvh;z-index:1;pointer-events:none;background:var(--bg);opacity:.72;will-change:auto}'
      : '.phone::after{display:none!important}'
    const textureCss = `<style id="wedding-global-texture">
      /* Fondo fijo: la textura no pertenece al contenido que hace scroll. */
      .phone{position:relative;isolation:isolate;overflow-x:hidden;background:transparent!important}
      .phone::before{content:"";position:fixed;inset:0;width:100vw;height:100dvh;z-index:0;pointer-events:none;background-image:url("${url}");background-size:cover;background-position:center center;background-repeat:no-repeat;opacity:${opacity};mix-blend-mode:${blend};will-change:auto}
      /* La capa de color/degradado puede activarse o desactivarse desde Apariencia > Fondo. */
      ${overlayRule}
      .phone>.cover{position:relative;z-index:3}
      .phone>.section,.phone>.closing{position:relative;z-index:2;background:transparent!important}
      .phone.invite-open{background:transparent!important}
      .phone.invite-open::before{display:block}
      .phone.invite-open::after{${colorOverlayEnabled ? 'display:block' : 'display:none!important'}}
      .phone:not(.invite-open)::before,.phone:not(.invite-open)::after{display:none}
      @media(max-width:699px){html,body{width:100%;max-width:100%;overflow-x:hidden}.phone{width:100vw;max-width:none;min-height:100dvh}.phone::before,.phone::after{width:100vw;height:100dvh;background-position:center center}}
    </style>`
    html = html.replace('</head>', `${textureCss}</head>`)
  }

  const coverBackgroundImage = String(project?.coverSection?.backgroundImage || '').trim()
  if (coverBackgroundImage) {
    const darkness = Math.max(0, Math.min(1, Number(project?.coverSection?.photoOverlayOpacity ?? project?.couple?.photoOverlayOpacity ?? 0.55)))
    const photoUrl = escCssUrl(coverBackgroundImage)
    const coverBackgroundCss = `<style id="wedding-cover-background">.phone{position:relative;isolation:isolate;background:var(--bg)!important}.phone>.cover{position:relative;isolation:isolate;overflow:hidden;background:transparent!important;z-index:3}.phone>.cover::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background-image:url("${photoUrl}");background-size:cover;background-position:center;background-repeat:no-repeat}.phone>.cover::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:rgb(0 0 0 / ${darkness})}.phone>.cover>*{position:relative;z-index:2}.phone>.section,.phone>.closing{position:relative;z-index:4;background:transparent!important}@media(max-width:699px){.phone>.cover{min-height:100dvh}.phone>.cover::before{background-size:cover;background-position:center}}</style>`
    html = html.replace('</head>', `${coverBackgroundCss}</head>`)
  }

  const coverAnimationCss = `<style id="wedding-cover-animations">
    @keyframes wedding-photo-reveal{0%{opacity:0;transform:scale(1.08);filter:blur(14px)}45%{opacity:.65;transform:scale(1.035);filter:blur(5px)}100%{opacity:1;transform:scale(1);filter:blur(0)}}
    @keyframes wedding-overlay-darken{0%{opacity:0}100%{opacity:1}}
    @keyframes wedding-diamond-reveal{0%{opacity:0;transform:scale(.35) rotate(-20deg);filter:blur(12px)}55%{opacity:1;transform:scale(1.12) rotate(4deg);filter:blur(0)}100%{opacity:1;transform:scale(1) rotate(0)}}
    @keyframes wedding-focus-in{0%{opacity:0;transform:scale(.96);filter:blur(14px)}65%{opacity:1;transform:scale(1.01);filter:blur(0)}100%{opacity:1;transform:scale(1);filter:blur(0)}}
    @keyframes wedding-explosion-in{0%{opacity:0;transform:scale(.58);filter:blur(12px)}55%{opacity:1;transform:scale(1.08);filter:blur(0)}78%{transform:scale(.97)}100%{opacity:1;transform:scale(1)}}
    @keyframes wedding-line-reveal{0%{opacity:0;transform:scaleX(0)}55%{opacity:1;transform:scaleX(1.12)}100%{opacity:1;transform:scaleX(1)}}
    @keyframes wedding-date-reveal{0%{opacity:0;transform:translateY(12px) scale(.97);filter:blur(8px)}65%{opacity:1;transform:translateY(-2px) scale(1.01);filter:blur(0)}100%{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes wedding-rise-in{0%{opacity:0;transform:translateY(42px) scale(.96);filter:blur(5px)}65%{opacity:1;transform:translateY(-5px) scale(1.01);filter:blur(0)}100%{opacity:1;transform:translateY(0) scale(1)}}

    .phone>.cover::before{animation:wedding-photo-reveal 1.45s cubic-bezier(.22,1,.36,1) both}
    .phone>.cover::after{animation:wedding-overlay-darken .85s cubic-bezier(.22,1,.36,1) 1.45s both}
    .phone>.cover>.ornament{opacity:0;animation:wedding-diamond-reveal .72s cubic-bezier(.22,1,.36,1) 2.38s both}
    .phone>.cover>.eyebrow{opacity:0;animation:wedding-focus-in .72s cubic-bezier(.22,1,.36,1) 3.12s both}
    .phone>.cover>h1{opacity:0;animation:wedding-explosion-in .82s cubic-bezier(.16,1,.3,1) 3.84s both}
    .phone>.cover>.line{opacity:0;transform-origin:center;animation:wedding-line-reveal .62s cubic-bezier(.22,1,.36,1) 4.68s both;background:linear-gradient(90deg,transparent,var(--accent),transparent)!important}
    .phone>.cover>.cover-subtitle,.phone>.cover>.date,.phone>.cover>.venue{opacity:0;animation:wedding-date-reveal .68s cubic-bezier(.22,1,.36,1) 5.32s both}
    .phone>.cover>.button{opacity:0;animation:wedding-rise-in .76s cubic-bezier(.22,1,.36,1) 6.04s both}

    .phone>.cover.cover-animation-finished::before,.phone>.cover.cover-animation-finished::after{animation:none!important;opacity:1!important;transform:none!important;filter:none!important}
    .phone>.cover.cover-animation-finished>.ornament,.phone>.cover.cover-animation-finished>.eyebrow,.phone>.cover.cover-animation-finished>h1,.phone>.cover.cover-animation-finished>.line,.phone>.cover.cover-animation-finished>.cover-subtitle,.phone>.cover.cover-animation-finished>.date,.phone>.cover.cover-animation-finished>.venue,.phone>.cover.cover-animation-finished>.button{animation:none!important;opacity:1!important;transform:none!important;filter:none!important}

    @media(prefers-reduced-motion:reduce){
      .phone>.cover::before,.phone>.cover::after,.phone>.cover>*{animation:none!important;opacity:1!important;transform:none!important;filter:none!important}
    }
  </style>`
  html = html.replace('</head>', `${coverAnimationCss}</head>`)

  const coverAnimationScript = `<script id="wedding-cover-animation-script">(()=>{const finish=()=>{const cover=document.querySelector('.phone>.cover');if(!cover)return;cover.classList.add('cover-animation-finished');cover.setAttribute('data-animation-finished','true')};document.addEventListener('DOMContentLoaded',()=>{const button=document.querySelector('.phone>.cover>.button');if(!button){finish();return}if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return}button.addEventListener('animationend',event=>{if(event.animationName==='wedding-rise-in')finish()},{once:true});setTimeout(finish,7100)})})()</script>`
  html = html.replace('</body>', `${coverAnimationScript}</body>`)

  const pageNavigationCss = `<style id="wedding-page-navigation">html,body{width:100%;min-height:100%;margin:0;overflow:hidden;background:var(--bg)}body{display:block}.phone{width:100vw;max-width:none;height:100dvh;min-height:100dvh;max-height:100dvh;margin:0;overflow:hidden;overscroll-behavior:none;scrollbar-width:none;background:var(--bg)!important;border-radius:0;box-shadow:none}.phone::-webkit-scrollbar{display:none}.phone>.section,.phone>.closing{display:none!important}.phone.invite-open{width:100vw;height:100dvh;min-height:100dvh;max-height:100dvh;overflow-y:auto;overflow-x:hidden;overscroll-behavior-y:auto}.phone.invite-open>.cover{display:none!important}.phone.invite-open>.section,.phone.invite-open>.closing{display:flex!important}.phone.invite-open>.section:first-of-type{padding-top:48px}@media(max-width:699px){html,body{width:100%;height:100%;overflow:hidden}.phone{width:100vw;height:100dvh;min-height:100dvh;max-height:100dvh;border-radius:0;box-shadow:none}.phone.invite-open{width:100vw;height:100dvh;min-height:100dvh;max-height:100dvh}}</style>`
  html = html.replace('</head>', `${pageNavigationCss}</head>`)

  const pageNavigationScript = `<script id="wedding-page-navigation-script">(()=>{const open=()=>{const phone=document.querySelector('.phone');if(!phone)return;phone.classList.add('invite-open');phone.scrollTop=0;};document.addEventListener('DOMContentLoaded',()=>{const button=document.querySelector('.cover .button');if(!button)return;button.onclick=(event)=>{event.preventDefault();open();};});})();</script>`
  html = html.replace('</body>', `${pageNavigationScript}</body>`)

  return html
}

export default renderWeddingHTML
